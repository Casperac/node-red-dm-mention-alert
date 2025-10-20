module.exports = function(RED) {
    function DmMentionAlertNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        // Get config values
        node.triggerType = config.triggerType || "user";
        node.triggerValue = config.triggerValue;
        node.recipientType = config.recipientType || "user";
        node.recipientValue = config.recipientValue;
        node.adminUserId = config.adminUserId || "";
        
        // Initialize global context for role user lists if it doesn't exist
        const roleUsers = node.context().global.get('roleUserLists') || {};
        node.context().global.set('roleUserLists', roleUsers);
        
        node.on('input', function(msg) {
            // Only process if payload is a string (actual message)
            if (typeof msg.payload !== 'string') {
                return;
            }
            
            // Check for role management commands (if user is admin)
            const authorId = msg.author?.id || msg.data?.authorId;
            if (node.adminUserId && authorId === node.adminUserId && node.triggerType === "role") {
                // Check for !add-user command
                const addMatch = msg.payload.match(/^!add-user\s+(\d+)/);
                if (addMatch) {
                    const userId = addMatch[1];
                    const roleId = node.triggerValue;
                    
                    const roleUsers = node.context().global.get('roleUserLists') || {};
                    if (!roleUsers[roleId]) {
                        roleUsers[roleId] = [];
                    }
                    if (!roleUsers[roleId].includes(userId)) {
                        roleUsers[roleId].push(userId);
                        node.context().global.set('roleUserLists', roleUsers);
                        
                        const response = {
                            payload: `✅ Added <@${userId}> to the notification list. Total users: ${roleUsers[roleId].length}`,
                            channel: msg.channel?.id,
                            _session: msg._session
                        };
                        node.send(response);
                    } else {
                        const response = {
                            payload: `ℹ️ <@${userId}> is already in the notification list`,
                            channel: msg.channel?.id,
                            _session: msg._session
                        };
                        node.send(response);
                    }
                    return;
                }
                
                // Check for !remove-user command
                const removeMatch = msg.payload.match(/^!remove-user\s+(\d+)/);
                if (removeMatch) {
                    const userId = removeMatch[1];
                    const roleId = node.triggerValue;
                    
                    const roleUsers = node.context().global.get('roleUserLists') || {};
                    if (roleUsers[roleId]) {
                        const index = roleUsers[roleId].indexOf(userId);
                        if (index > -1) {
                            roleUsers[roleId].splice(index, 1);
                            node.context().global.set('roleUserLists', roleUsers);
                            
                            const response = {
                                payload: `✅ Removed <@${userId}> from the notification list. Remaining users: ${roleUsers[roleId].length}`,
                                channel: msg.channel?.id,
                                _session: msg._session
                            };
                            node.send(response);
                        } else {
                            const response = {
                                payload: `ℹ️ <@${userId}> was not in the notification list`,
                                channel: msg.channel?.id,
                                _session: msg._session
                            };
                            node.send(response);
                        }
                    }
                    return;
                }
                
                // Check for !userid-list command
                if (msg.payload.trim() === "!userid-list") {
                    const roleId = node.triggerValue;
                    const roleUsers = node.context().global.get('roleUserLists') || {};
                    const users = roleUsers[roleId] || [];
                    
                    let responseText = `📋 **Notification List:**\n`;
                    if (users.length === 0) {
                        responseText += "No users added yet.";
                    } else {
                        users.forEach((userId, index) => {
                            responseText += `${index + 1}. <@${userId}> (${userId})\n`;
                        });
                        responseText += `\n**Total: ${users.length} user(s)**`;
                    }
                    
                    const response = {
                        payload: responseText,
                        channel: msg.channel?.id,
                        _session: msg._session
                    };
                    node.send(response);
                    return;
                }
                
                // Check for !clear-user command (clears ALL users)
                if (msg.payload.trim() === "!clear-user") {
                    const roleId = node.triggerValue;
                    const roleUsers = node.context().global.get('roleUserLists') || {};
                    const count = (roleUsers[roleId] || []).length;
                    roleUsers[roleId] = [];
                    node.context().global.set('roleUserLists', roleUsers);
                    
                    const response = {
                        payload: `✅ Cleared all users from the notification list. Removed ${count} user(s).`,
                        channel: msg.channel?.id,
                        _session: msg._session
                    };
                    node.send(response);
                    return;
                }
            }
            
            let isTriggered = false;
            
            // Check based on trigger type
            if (node.triggerType === "user") {
                isTriggered = msg.payload && msg.payload.includes(`<@${node.triggerValue}>`);
            } else if (node.triggerType === "role") {
                isTriggered = msg.payload && msg.payload.includes(`<@&${node.triggerValue}>`);
            } else if (node.triggerType === "word") {
                isTriggered = msg.payload && msg.payload.toLowerCase().includes(node.triggerValue.toLowerCase());
            }
            
            if (isTriggered) {
                const authorName = msg.author?.username || msg.author?.globalName || "Unknown user";
                const channelName = msg.channel?.name || "unknown channel";
                const channelId = msg.channel?.id || msg.data?.channelId || "";
                const messageId = msg.data?.id || "";
                const guildId = msg.channel?.guildId || msg.data?.guildId || "";
                
                const messageLink = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
                
                let triggerMsg = "";
                if (node.triggerType === "user") {
                    triggerMsg = "You were mentioned!";
                } else if (node.triggerType === "role") {
                    triggerMsg = "Your role was mentioned!";
                } else if (node.triggerType === "word") {
                    triggerMsg = `Keyword detected: "${node.triggerValue}"`;
                }
                
                let recipients = [];
                
                if (node.triggerType === "user") {
                    recipients.push(node.triggerValue);
                } else if (node.triggerType === "role") {
                    const roleUsers = node.context().global.get('roleUserLists') || {};
                    const users = roleUsers[node.triggerValue] || [];
                    recipients = users;
                    
                    if (recipients.length === 0) {
                        node.status({fill:"yellow", shape:"ring", text:"no users in role list"});
                        setTimeout(function() { node.status({}); }, 3000);
                        return;
                    }
                } else if (node.triggerType === "word") {
                    if (node.recipientType === "user") {
                        recipients.push(node.recipientValue);
                    } else if (node.recipientType === "role") {
                        const roleUsers = node.context().global.get('roleUserLists') || {};
                        const users = roleUsers[node.recipientValue] || [];
                        recipients = users;
                    }
                }
                
                recipients.forEach(recipientId => {
                    const newMsg = {
                        payload: `<@${recipientId}>\n\n🔔 **${triggerMsg}**\n👤 **From:** ${authorName}\n📍 **Channel:** #${channelName}\n🔗 **Link:** ${messageLink}`,
                        user: recipientId,
                        _session: msg._session
                    };
                    
                    node.send(newMsg);
                });
                
                node.status({fill:"green", shape:"dot", text:`sent to ${recipients.length} user(s)`});
                
                setTimeout(function() {
                    node.status({});
                }, 3000);
            }
        });
    }
    
    RED.nodes.registerType("dm-mention-alert", DmMentionAlertNode);
}

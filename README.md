node-red-contrib-dm-mention-alert
A Node-RED node that detects Discord mentions, role tags, or keywords and sends DM alerts.

npm install node-red-contrib-dm-mention-alert



How It Works

Set a Trigger - Choose what to watch for:

User mention (@user)
Role mention (@role)
Keyword/phrase


Message is Sent - Someone sends a message in Discord
Alert is Sent - If the trigger matches, a DM is sent to the configured user(s) with:

Who triggered it
What channel it was in
A link to the message



Quick Setup

Connect discord-message → dm-mention-alert → discord-message-manager
Configure your trigger type and values
Done!

Admin Commands (Role Mention only)

!add-user <userID> - Add user to alerts
!remove-user <userID> - Remove user
!userid-list - Show users
!clear-user - Clear all users

License
MIT
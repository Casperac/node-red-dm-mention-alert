# node-red-contrib-dm-mention-alert

A Node-RED node that detects Discord mentions, role tags, or keywords and sends DM alerts.

**Note:** This is a community-created node and is not officially made by the Discord node developers. It works alongside Discord integration nodes to provide mention alert functionality.

## Installation

npm install node-red-contrib-dm-mention-alert

## How It Works

1. **Set a Trigger** - Choose what to watch for:
   - User mention (@user)
   - Role mention (@role)
   - Keyword/phrase

2. **Message is Sent** - Someone sends a message in Discord

3. **Alert is Sent** - If the trigger matches, a DM is sent to the configured user(s) with:
   - Who triggered it
   - What channel it was in
   - A link to the message

## Quick Setup

1. Connect `discord-message` → `dm-mention-alert` → `discord-message-manager`
2. Configure your trigger type and values
3. Done!

## Admin Commands (Role Mention only)

- `!add-user <userID>` - Add user to alerts
- `!remove-user <userID>` - Remove user
- `!userid-list` - Show users
- `!clear-user` - Clear all users

## License

MIT
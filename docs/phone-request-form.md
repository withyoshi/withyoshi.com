# Phone Request Form

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Telegram Bot Configuration for Contact Form
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_TOPIC_ID=your_topic_id_here  # Optional: for forum groups
```

## Telegram Bot Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat with BotFather and send `/newbot`
3. Follow the instructions to create your bot
4. Copy the bot token provided by BotFather
5. Add the token to your `.env.local` file as `TELEGRAM_BOT_TOKEN`

### 2. Get Your Chat ID and Topic ID

#### Method 1: Copy Message Link (Recommended)

**For Regular Groups:**

1. Add your bot to the group
2. Send a test message in the group
3. Right-click on the message and select "Copy Message Link"
4. The link will look like: `https://t.me/c/1234567890/123`
   - The number after `/c/` is your `TELEGRAM_CHAT_ID` (add `-100` prefix for the API)
   - The number at the end is the message ID (not needed for basic setup)

**For Groups (with Topics):**

1. Add your bot to the group
2. Create or navigate to the specific topic where you want messages
3. Send a test message in that topic
4. Right-click on the message and select "Copy Message Link"
5. The link will look like: `https://t.me/c/1234567890/456/123`
   - The number after `/c/` is your `TELEGRAM_CHAT_ID` (add `-100` prefix for the API)
   - The second number (456) is your `TELEGRAM_TOPIC_ID`
   - The third number (123) is the message ID (not needed for setup)

#### Method 2: API getUpdates (Alternative)

1. Start a chat with your newly created bot
2. Send any message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for the `chat.id` in the response
5. Add this ID to your `.env.local` file as `TELEGRAM_CHAT_ID`

#### Method 3: Use @userinfobot (For Personal Chats)

1. Search for `@userinfobot` on Telegram
2. Start a chat and send `/start`
3. The bot will reply with your user ID
4. Use this as your `TELEGRAM_CHAT_ID`

## Group Setup (Optional)

If you want to use a group with specific topics:

1. **Create a Group**: In Telegram, create a new group and enable "Topics" in group settings
2. **Add Your Bot**: Add your bot to the group
3. **Create a Topic**: Create a topic for contact form messages (e.g., "Contact Requests")
4. **Get Topic ID**: Use the Copy Message Link method above to get both the chat ID and topic ID
5. **Configure Environment**: Add both `TELEGRAM_CHAT_ID` and `TELEGRAM_TOPIC_ID` to your `.env.local`

**Benefits of Using Topics:**

- Organizes contact form messages in a dedicated topic
- Keeps your main group chat clean
- Easy to manage and respond to contact requests
- Better for team collaboration

## Features

✅ **Form Validation**: Client-side validation using Zod schema
✅ **Server-side Processing**: API route handles form submission
✅ **Telegram Integration**: Sends notifications via Telegram Bot API
✅ **Group Support**: Optional topic ID for groups
✅ **Success/Error States**: User feedback for form submission
✅ **Responsive Design**: Works on mobile and desktop
✅ **Accessibility**: Proper form labels and ARIA attributes

## 🛡️ **Security Features**

✅ **Rate Limiting**: Max 5 submissions per 15 minutes per IP
✅ **Honeypot Protection**: Hidden field to catch bots
✅ **Spam Detection**: Filters out common spam keywords
✅ **XSS Prevention**: Input sanitization with DOMPurify
✅ **Input Validation**: Server-side validation with length limits

## 📱 **Telegram Message Format**

When someone submits the form, you'll receive a formatted message like:

```
📞 New Call Request

👤 Name: John Doe
📱 Phone: +1 (555) 123-4567
🌐 IP: 192.168.1.1

💬 Message:
Hi, I'd like to discuss a potential opportunity...

⏰ Time: 12/25/2024, 2:30:45 PM
```

## Form Fields

- **Name**: Required, minimum 2 characters
- **Phone**: Required, minimum 10 characters
- **Message**: Required, minimum 10 characters

## Testing

1. Start your development server: `pnpm dev`
2. Navigate to your contact form
3. Fill out and submit the contact form
4. Check your Telegram for the message

## Troubleshooting

- **Bot Token Error**: Verify your `TELEGRAM_BOT_TOKEN` is correct
- **Chat ID Error**: Verify your `TELEGRAM_CHAT_ID` is correct
- **Topic ID Error**: If using groups with topics, verify your `TELEGRAM_TOPIC_ID` is correct
- **Form Not Submitting**: Check browser console for errors
- **Telegram Not Received**: Check bot permissions and chat ID
- **Messages Not in Topic**: Ensure the topic ID is correct and the bot has permission to post in that topic
- **Group vs Forum**: Regular groups don't need topic ID, only groups with topics do

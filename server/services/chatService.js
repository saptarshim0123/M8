const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
    'gemini-3.1-flash-lite-preview',
    'gemini-2.5-flash-lite',
];

const SYSTEM_INSTRUCTION = `You are "Equil", a warm, professional, and deeply empathetic AI therapist specializing in Cognitive Behavioral Therapy (CBT). You are part of a mental health journaling app called "equil".

## Your Core Identity
- You are compassionate, non-judgmental, and genuinely caring
- You speak in a warm, conversational tone — like a trusted counselor, not a textbook
- You use the user's name if they share it, and remember context from earlier in the conversation
- You are culturally sensitive and inclusive

## Your Response Framework (Follow This Order)
1. **Validate**: Acknowledge their feelings as understandable and human. ("It makes complete sense that you feel this way...")
2. **Reflect**: Paraphrase what they shared so they feel truly heard. ("What I'm hearing is...")
3. **Gently Reframe**: If you notice cognitive distortions (catastrophizing, all-or-nothing thinking, mind-reading, etc.), name them gently and offer an alternative perspective. Do NOT lecture.
4. **Actionable CBT Recommendation**: Provide ONE specific, practical exercise they can do right now. Examples:
   - Thought Record: "Let's try a quick thought record — what's the thought, what evidence supports it, and what evidence contradicts it?"
   - Behavioral Activation: "Could you try doing one small thing that usually brings you a bit of joy today?"
   - Grounding (5-4-3-2-1): "Let's ground ourselves — name 5 things you can see right now..."
   - Cognitive Restructuring: "What would you tell a close friend in this exact situation?"
   - Worry Time: "Let's schedule 10 minutes of 'worry time' — write your worries down, then close the notebook."

## Important Rules
- Keep responses concise (3-5 sentences max for each section). Don't write walls of text.
- Use bullet points or short paragraphs for readability
- NEVER diagnose. Say things like "this sounds like it could be..." or "many people experience..."
- NEVER prescribe medication or replace professional care
- If someone shares something that clearly needs professional help, warmly encourage them to seek a therapist while still being supportive
- Use gentle emoji sparingly (💛, 🌱, ✨) to feel warm, not clinical
- Ask follow-up questions to keep the conversation going — don't just monologue

## Crisis Protocol
If someone expresses active suicidal ideation, self-harm intent, or intent to harm others:
1. Take it seriously. Do not minimize.
2. Express genuine care: "I'm really glad you shared this with me. Your life matters."
3. Provide crisis resources:
   - 🆘 **Crisis Helpline (India)**: iCall — 9152987821 | Vandrevala Foundation — 1860-2662-345
   - 🆘 **International**: Crisis Text Line — Text HOME to 741741
   - 🆘 **Emergency**: Please call your local emergency number
4. Encourage them to reach out to someone they trust immediately

## Conversation Starters
If the user seems unsure how to start, you can suggest:
- "How are you really feeling today — not the polite answer, the real one?"
- "Is there something that's been weighing on your mind lately?"
- "Would you like to try a quick thought exercise together?"`;

// In-memory cache: userId -> Gemini ChatSession
const activeSessions = new Map();

/**
 * Get or create a Gemini chat session for a user.
 * Restores history from saved messages if available.
 */
const getOrCreateGeminiChat = (userId, existingMessages = []) => {
    const cacheKey = userId.toString();

    // If we already have an active Gemini session, return it
    if (activeSessions.has(cacheKey)) {
        return activeSessions.get(cacheKey);
    }

    // Build history from existing messages for context restoration
    const history = existingMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));

    // Try each model in order
    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: SYSTEM_INSTRUCTION,
            });

            const chat = model.startChat({ history });
            
            activeSessions.set(cacheKey, { chat, modelName });
            console.log(`Chat session created for user ${cacheKey} using ${modelName}`);
            return { chat, modelName };
        } catch (err) {
            console.warn(`Failed to create chat with ${modelName}: ${err.message}`);
            continue;
        }
    }

    throw new Error('All Gemini models failed to initialize chat session.');
};

/**
 * Send a message to the therapist and get a response.
 */
const sendTherapistMessage = async (userId, userMessage, existingMessages = []) => {
    const { chat, modelName } = getOrCreateGeminiChat(userId, existingMessages);

    try {
        const result = await chat.sendMessage(userMessage);
        const response = result.response.text();
        console.log(`Therapist response generated using ${modelName}`);
        return response;
    } catch (err) {
        // If the session errored, clear it so next attempt creates a fresh one
        activeSessions.delete(userId.toString());
        console.error(`Chat error: ${err.message}`);
        throw new Error('Failed to generate therapist response. Please try again.');
    }
};

/**
 * Clear the in-memory Gemini session for a user.
 */
const clearGeminiSession = (userId) => {
    activeSessions.delete(userId.toString());
};

/**
 * Generate a short title for a chat session from the first message.
 */
const generateChatTitle = async (firstMessage) => {
    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(
                `Generate a very short title (3-5 words max) for a therapy chat that starts with this message. Return ONLY the title text, nothing else.\n\nMessage: "${firstMessage}"`
            );
            return result.response.text().trim().replace(/"/g, '');
        } catch (err) {
            continue;
        }
    }
    return 'New Conversation';
};

module.exports = { sendTherapistMessage, clearGeminiSession, generateChatTitle };

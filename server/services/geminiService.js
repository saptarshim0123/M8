const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    generationConfig: {
        responseMimeType: "application/json",
    },
});

const analyzeEntry = async (entry) => {
    const prompt = `
        Role: You are a professional, empathetic mental health counselor specializing in Cognitive Behavioral Therapy (CBT).
    Task: Analyze the user's journal entry for emotional sentiment, cognitive patterns, and safety.
    
    Journal Entry: "${entry}"

    Instructions:
    1. Identify the primary mood and rate its intensity (1-10).
    2. Scan for Cognitive Distortions (e.g., Catastrophizing, All-or-Nothing thinking, Emotional Reasoning).
    3. Generate a response that follows the "Validation-Reflection-Support" model:
       - Validate: Acknowledge that their feeling is understandable.
       - Reflect: Paraphrase what they are going through so they feel heard.
       - Support: Offer a gentle, low-pressure encouraging thought.
    4. Provide one actionable coping tip tailored to the specific mood and context.
    5. SAFETY CHECK: Set crisisDetected to true ONLY if there is an explicit or highly implied intent of self-harm, harm to others, or severe loss of reality.

    Return ONLY a JSON object following this exact schema:
    {
      "mood": "one of: Happy, Sad, Anxious, Angry, Neutral, Mixed",
      "intensityScore": number,
      "aiResponse": "string (2-3 sentences)",
      "copingSuggestion": "string (actionable and specific)",
      "distortions": ["string array"],
      "keywords": ["string array"],
      "tags": ["string array"],
      "crisisDetected": boolean
    }
`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(text);
    } catch (err) {
        console.error("Gemini Error:", err);
        throw new Error("Gemini analysis failed: " + err.message);
    }
};

module.exports = { analyzeEntry };
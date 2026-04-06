const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
    'gemini-3.1-flash-lite-preview',
    'gemini-2.5-flash-lite',
]

const analyzeEntry = async (entry) => {
    const prompt = `
    Role: You are a professional, empathetic mental health counselor specializing in Cognitive Behavioral Therapy (CBT).
    Task: Analyze the user's journal entry for emotional sentiment, cognitive patterns, and safety.
    
    Journal Entry: "${entry}"

    Instructions:
    1. Identify the primary mood and rate its intensity (1-10).
    2. Scan for Cognitive Distortions.
       - STRICT RULE: Do not flag normal venting, annoyance, or realistic complaints (e.g., complaining about heavy traffic, being tired) as cognitive distortions.
       - Only flag recognized distortions (e.g., Catastrophizing, All-or-Nothing thinking, Emotional Reasoning) if there is undeniable clinical evidence in the text.
       - If no distinct cognitive distortions are present, you MUST return an empty array [].
    3. Generate a response that follows the "Validation-Reflection-Support" model:
       - Validate: Acknowledge that their feeling is understandable.
       - Reflect: Paraphrase what they are going through so they feel heard.
       - Support: Offer a gentle, low-pressure encouraging thought.
    4. Provide one actionable coping tip tailored to the specific mood and context.
    5. SAFETY CHECK (CRITICAL OVERRIDE): Set "crisisDetected" to true ONLY if there is an actionable, immediate threat of suicide, self-harm, or violence to others. 
       - STRICT RULE: Phrases expressing a desire to "disappear," "hide forever," "sleep forever," feeling "empty," or extreme exhaustion are common expressions of severe burnout and depression. They are NOT an immediate crisis. 
       - You MUST output "crisisDetected": false for burnout, overwhelming stress, isolation, or passive desires to escape responsibilities.
    6. SENTIMENT SCORE: Provide a value between -1.0 (extremely negative) and 1.0 (extremely positive). 
   - 0.0 is perfectly neutral.
   - Example: "I'm so stressed and I hate this" -> -0.8
   - Example: "Today was okay, nothing special" -> 0.1
   - Example: "I'm so proud of my progress!" -> 0.9
    Return ONLY a JSON object following this exact schema:
    {
      "mood": "one of: Happy, Sad, Anxious, Angry, Neutral, Mixed",
      "intensityScore": number,
      "sentimentScore": number,
      "aiResponse": "string (2-3 sentences)",
      "copingSuggestion": "string (actionable and specific)",
      "distortions": ["string array"],
      "keywords": ["string array"],
      "tags": ["string array"],
      "crisisDetected": boolean
    }
`;
    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                }
            })
            const result = await model.generateContent(prompt)
            const text = result.response.text()
            console.log(`Analysis done using ${modelName}`)
            return JSON.parse(text)
        } catch (err) {
            console.warn(`Model ${modelName} failed: ${err.message}`)
            continue
        }
    }

    throw new Error('All Gemini models failed. Please try again later.')
};

const generatePatientSummary = async (analyses) => {
    const moodSummary = analyses.map(a => `${a.mood} (intensity: ${a.intensityScore}, sentiment: ${a.sentimentScore})`).join(', ');
    const keywords = [...new Set(analyses.flatMap(a => a.keywords || []))].join(', ');
    const distortions = [...new Set(analyses.flatMap(a => a.distortions || []))].join(', ');

    const prompt = `
    Role: You are a clinical AI assistant helping a therapist understand their patient's mental health trends.
    Task: Based on the following aggregated data from the patient's journal analyses over the last 30 days, generate a concise 3-sentence clinical summary.
    
    Data:
    - Mood readings: ${moodSummary}
    - Common keywords/themes: ${keywords || 'None'}
    - Cognitive distortions detected: ${distortions || 'None'}
    - Total entries analyzed: ${analyses.length}
    
    Instructions:
    1. Sentence 1: Summarize the dominant emotional patterns.
    2. Sentence 2: Note any concerning trends or improvements.
    3. Sentence 3: Suggest a focus area for the next session.
    
    Return ONLY a JSON object: { "summary": "your 3 sentences here" }
    `;

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const parsed = JSON.parse(text);
            return parsed.summary;
        } catch (err) {
            console.warn(`Model ${modelName} failed for summary: ${err.message}`);
            continue;
        }
    }

    throw new Error('All Gemini models failed for patient summary.');
};

module.exports = { analyzeEntry, generatePatientSummary };
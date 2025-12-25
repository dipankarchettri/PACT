const axios = require('axios');

const OPENROUTER_API_KEY = process.env.open_router_api || process.env.OPENROUTER_API_KEY;

async function generateSkillAnalysis(studentName, topicBreakdown) {
    if (!OPENROUTER_API_KEY) {
        console.warn('OpenRouter API key missing');
        return "AI analysis unavailable: API key missing.";
    }

    try {
        const topWeaknesses = topicBreakdown
            .filter(t => t.proficiency < 60)
            .sort((a, b) => a.proficiency - b.proficiency)
            .slice(0, 3)
            .map(t => `${t.topic} (${t.proficiency}%)`)
            .join(', ');

        const topStrengths = topicBreakdown
            .filter(t => t.proficiency >= 70)
            .slice(0, 3)
            .map(t => t.topic)
            .join(', ');

        const prompt = `
            Analyze the coding skills of student ${studentName}.
            Weaknesses: ${topWeaknesses || 'None identified yet'}.
            Strengths: ${topStrengths || 'None identified yet'}.
            
            Provide a 2-3 sentence personalized summary for this student. 
            Be encouraging but direct about what to focus on. 
            Do not use markdown or bullet points, just a paragraph.
        `;

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            "model": "mistralai/devstral-2512:free",
            "messages": [
                { "role": "system", "content": "You are a helpful coding mentor." },
                { "role": "user", "content": prompt }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return response.data.choices[0].message.content;

    } catch (error) {
        console.error('Error generating AI analysis:', error.message);
        return "AI analysis currently unavailable.";
    }
}

async function generateAIRecommendations(weakTopics) {
    if (!OPENROUTER_API_KEY) return null;

    try {
        const topicsList = weakTopics.map(t => `${t.topic} (Proficiency: ${t.proficiency}%)`).join(', ');

        const prompt = `
            The student is weak in the following LeetCode topics: ${topicsList}.
            Provide 3 specific problem recommendations for EACH of these topics to help them improve.
            
            Return data STRICTLY as a JSON array with this structure:
            [
              {
                "topic": "Topic Name",
                "reason": "Specific reason based on their low proficiency",
                "suggestedProblems": [
                  { "name": "Problem Name", "difficulty": "Easy/Medium", "url": "https://leetcode.com/problems/..." }
                ]
              }
            ]
            
            Do not include any markdown formatting or text outside the JSON.
            Prioritize high-quality, famous problems (e.g. Blind 75).
        `;

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            "model": "mistralai/devstral-2512:free",
            "messages": [
                { "role": "system", "content": "You are a coding mentor. Output only valid JSON." },
                { "role": "user", "content": prompt }
            ],
            "response_format": { "type": "json_object" }
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const content = response.data.choices[0].message.content;
        // Clean up markdown if present (e.g. ```json ... ```)
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error('Error generating AI recommendations:', error.message);
        return null; // Return null to trigger fallback
    }
}

module.exports = { generateSkillAnalysis, generateAIRecommendations };

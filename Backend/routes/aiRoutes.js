const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/chat', async (req, res) => {
    try {
        const { message, code, context, language } = req.body;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: "OpenRouter API Key is missing on the server." });
        }

        console.log("Using API Key:", apiKey.substring(0, 10) + "...");
        console.log("Model:", "google/gemini-pro:free");

        const systemPrompt = `You are an expert AI coding assistant. You are helping a user solve a programming problem.
    
    Current Language: ${language || 'Not specified'}
    
    Problem Context:
    ${context ? JSON.stringify(context) : 'No specific problem context provided.'}
    
    Current Code:
    \`\`\`${language}
    ${code || '// No code written yet'}
    \`\`\`
    
    Your goal is to be helpful, concise, and educational.
    - If the user asks for hints, provide them without giving away the full solution immediately.
    - If the user asks for a code review, analyze their code for correctness, time complexity, and space complexity. Suggest improvements.
    - If the user asks for test cases, provide edge cases they might have missed.
    - If the user is stuck, guide them towards the solution.
    
    Do not just give the answer unless explicitly asked or if the user is completely stuck after trying hints.
    Format your response in Markdown.`;

        const modelsToTry = [
            "google/gemini-1.5-flash",
            "meta-llama/llama-3-8b-instruct",
            "mistralai/mistral-7b-instruct",
            "google/gemini-2.0-pro-exp-02-05"
        ];

        let aiMessage = null;
        let lastError = null;

        for (const model of modelsToTry) {
            try {
                console.log(`Trying model: ${model}`);
                const response = await axios.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        model: model,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: message }
                        ],
                        temperature: 0.3,
                        max_tokens: 1000,
                    },
                    {
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                            "HTTP-Referer": "http://localhost:3000",
                            "X-Title": "CodeMaster AI",
                        },
                    }
                );
                aiMessage = response.data.choices[0].message.content;
                break; // Success
            } catch (error) {
                console.error(`Failed with model ${model}:`, error.response?.status, error.response?.data || error.message);
                lastError = error;
                // Continue to next model
            }
        }

        if (aiMessage) {
            res.json({ message: aiMessage });
        } else {
            throw lastError || new Error("All models failed.");
        }

    } catch (error) {
        console.error("AI Chat Error Details:");
        console.error("Status:", error.response?.status);
        if (error.response?.data) {
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("No response data");
        }
        console.error("Message:", error.message);

        res.status(500).json({
            message: "Failed to communicate with AI service.",
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;

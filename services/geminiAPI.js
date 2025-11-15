import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



async function callGemini(prompt){
    try{
        const response = await ai.models.generateContent(
            {
                model: process.env.GEMINI_MODEL,
                contents: prompt
            }
        )
    
        let jsonText = response.text.trim();
        
        // Remove markdown code blocks se existirem
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Remove qualquer texto antes do primeiro { e depois do último }
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonText = jsonText.substring(firstBrace, lastBrace + 1);
        }
        
        return JSON.parse(jsonText);
    }catch(error){
        console.error('Erro no callGemini:', error);
        console.error('Texto recebido:', error.message);
        throw error;
    }
}




export default callGemini;
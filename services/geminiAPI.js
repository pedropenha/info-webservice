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
    
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
        // return jsonText;
    }catch(error){
        console.error(error);
    }
}




export default callGemini;
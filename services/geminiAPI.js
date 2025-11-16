import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



async function callGemini(prompt){
    
    // Verificação de segurança
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.error("ERRO: O prompt enviado ao Gemini está vazio, nulo ou inválido.");
        throw new Error("Prompt inválido: Conteúdo para a IA não pode ser vazio.");
    }
    
    try{
        const response = await ai.models.generateContent(
            {
                model: process.env.GEMINI_MODEL,
                contents: [
                    { parts: [{ text: prompt }] }
                ]
            }
        )
    
        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } 
        else if (jsonText.startsWith("```")) {
             jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
        
        try {
            return JSON.parse(jsonText);
        } catch (parseError) {
            console.error("ERRO DE PARSEAMENTO JSON da IA:");
            console.error("Texto Bruto (Após Limpeza):", jsonText);
            throw new Error(`Resposta da IA não é JSON válido: ${parseError.message}`);
        }
        
    }catch(error){
        console.error("Erro interno ao chamar o SDK do Google GenAI:", error);
        throw error; 
    }
}




export default callGemini;
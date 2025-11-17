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
        console.error(error);
    }
}




async function gerarResumoAvaliacoes(avaliacoes) {
    if (!avaliacoes || avaliacoes.length === 0) {
        return "Nenhuma avaliação disponível para este curso.";
    }

    try {
        // Preparar texto com todas as avaliações
        const textoAvaliacoes = avaliacoes.map((av, index) => {
            return `Avaliação ${index + 1}:\n- Nota: ${av.nota}/5\n- Comentário: ${av.mensagem || 'Sem comentário'}\n`;
        }).join('\n');

        const prompt = `Você é um assistente que analisa avaliações de cursos. 
Analise as seguintes avaliações e gere um resumo objetivo e profissional em português do Brasil.
O resumo deve destacar os pontos positivos, negativos e a percepção geral dos alunos.
Seja conciso e direto, usando no máximo 3-4 parágrafos.

${textoAvaliacoes}

Gere APENAS o texto do resumo, sem formatação JSON, sem aspas, sem código.`;

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL,
            contents: [
                { parts: [{ text: prompt }] }
            ]
        });

        let resumo = response.text.trim();
        
        // Remover marcadores de código se existirem
        if (resumo.startsWith("```")) {
            resumo = resumo.replace(/```[a-z]*\n?/g, '').trim();
        }

        return resumo;

    } catch (error) {
        console.error("Erro ao gerar resumo com Gemini:", error);
        throw new Error(`Erro ao gerar resumo de avaliações: ${error.message}`);
    }
}

export default callGemini;
export { gerarResumoAvaliacoes };
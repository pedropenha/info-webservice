// controllers/RecomendacaoController.js
import CursoModel from "../Schemas/CursoSchema.js";
import UserModel from "../Schemas/UserSchema.js";
import GeminiController from "./GeminiController.js";
import mongoose from 'mongoose';
import InscricaoModel from "../Schemas/InscricaoSchema.js";

class RecomendacaoController {
    
    static async getCursosRecomendados(req, res) {
        try {
            const { userId } = req.body; 

            if (!userId) {
                return res.status(401).json({ 
                    message: "Logue para ter uma recomendação personalizada." 
                });
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ message: "ID de usuário inválido." });
            }

            // 2. Buscar dados do Usuário (proficiências)
            const userDoc = await UserModel.findById(userId).select('proficiencias');
            if (!userDoc) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }
            const proficiencias = userDoc.proficiencias || [];
            if (proficiencias.length === 0) {
                return res.status(200).json({ 
                    message: "Não foi possível gerar recomendações. Por favor, atualize seu perfil com suas proficiências.", 
                    recomendacoes: [] 
                });
            }

            const inscricoes = await InscricaoModel.find({ usuarioId: userId }).select('cursoId').lean();
            const cursosInscritosIds = inscricoes.map(insc => insc.cursoId.toString());

            // 3. Buscar cursos disponíveis
            const cursosDisponiveis = await CursoModel.find({})
                .select('_id nome proficiencias descricao publico preRequisitos') 
                .limit(50)
                .lean(); 
            if (cursosDisponiveis.length === 0) {
                return res.status(200).json({ message: "Nenhum curso disponível para recomendação.", recomendacoes: [] });
            }

            // 4. Montar o payload para a IA (AGORA INCLUINDO A LISTA DE INSCRITOS)
            const bodyParaIA = {
                proficiencias,
                nivel: "Não especificado, focar nas proficiências", 
                cursosDisponiveis,
                cursosInscritosIds 
            };
            
            // 5. Chamar a IA
            const iaResponse = await GeminiController.gerarRecomendacoesCursoAux(bodyParaIA);

            if (!iaResponse || iaResponse.length === 0) {
                return res.status(200).json({ recomendacoes: [], message: 'A inteligência artificial não gerou sugestões com base no seu perfil.' });
            }
            
            // 6. Extrair IDs e buscar detalhes completos no MongoDB
            const idsRecomendados = iaResponse.map(r => r.id).filter(id => mongoose.Types.ObjectId.isValid(id));
            
            if (idsRecomendados.length === 0) {
                return res.status(200).json({ recomendacoes: [] });
            }

            const cursos = await CursoModel.find({ _id: { $in: idsRecomendados } }).lean();

            // 7. Combinar detalhes do curso com a explicação da IA
            const resultadoFinal = cursos.map(curso => {
                const explicacaoIA = iaResponse.find(r => r.id === curso._id.toString());
                return {
                    ...curso,
                    explicacao: explicacaoIA ? explicacaoIA.explicacao : "Recomendação baseada em suas habilidades."
                };
            });

            // 8. Garantir a ordem
            resultadoFinal.sort((a, b) => {
                const indexA = idsRecomendados.indexOf(a._id.toString());
                const indexB = idsRecomendados.indexOf(b._id.toString());
                return indexA - indexB;
            });

            res.status(200).json({ recomendacoes: resultadoFinal });

        } catch (error) {
            console.error('Erro ao buscar cursos recomendados:', error);
            res.status(500).json({ message: 'Erro interno ao processar recomendações.' });
        }
    }
}

export default RecomendacaoController;
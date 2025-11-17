import { callGemini } from "../services/geminiAPI.js"


class GeminiController{
    static async callGemini(req, res){
        try{
            const response = await callGemini("Olá Gemini");

            res.json(response);

        }catch(error){
            console.log("Erro ao chamar o gemini")
            res.status(500).json({ message: "Erro interno", stacktrace: error });
        }
    }

    static async gerarDescricaoCurso(req, res){
        try{
            const { titulo } = req.body ?? {};
            const contexto = (req.body?.contexto ?? "").trim();

            if(!titulo){
                res.status(422).json({ message: "Envie o titulo do curso" });
                return;
            }

            const contextoNormalizado = contexto === "" ? "Não enviado" : contexto;

            const prompt = `Gere uma descrição para o curso com titulo ${titulo},
            a descrição deve ter até 255 caracteres e deve ser retornada em um objeto JSON, em texto normal, SEM MARKDOWN,
            NÃO USE NUNCA emojis, devolva o texto padrão sem emojis e com o portugues de forma formal,
            o objeto de retorno deve ter sempre a chave: descricao e o valor é a descrição gerada por você.
            Também posso enviar o contexto, mas caso ele seja 'Não enviado' você deve apenas ignora-lo.
            -----
            contexto: ${contextoNormalizado}
            -----`

            const response = await callGemini(prompt);
            res.json(response);
        }catch(error){
            console.log("Erro ao chamar o gemini");
            res.status(500).json({ message: "Erro interno", stacktrace: error });
        }
    }

    static async gerarProficiencias(req, res){
        try{
            const contexto = (req.body?.contexto ?? "").trim();

            if(!contexto){
                res.status(422).send({ message: "Contexto inválido" });
                return;
            }

            const prompt = `Você deverá gerar proficiencias a partir de um contexto,
            as proficiencias são linguagens de programação, como Javascript, Html, Css, Flutter e etc,
            isso tudo de acordo com o contexto enviado, o retorno deve ser retornada em um objeto JSON, em texto normal, SEM MARKDOWN,
            NÃO USE NUNCA emojis, devolva o texto padrão sem emojis o retorno também para mais de uma proficiencias deve ser separado
            por vírgulas.
            -----
            contexto: ${contexto}
            -----`;

            const response = await callGemini(prompt);
            res.json(response);
        }catch(error){
            console.log("Erro ao chamar o gemini");
            res.status(500).json({ message: "Erro interno", stacktrace: error });
        }
    }

    static async gerarConteudoProgramatico(req, res){
        try{
            const { titulo } = req.body ?? {};
            const contexto = (req.body?.contexto ?? "").trim();

            if(!contexto){
                res.status(422).send({ message: "Contexto é obrigatório" });
                return;
            }

            if(!titulo){
                res.status(422).send({ message: "Titulo é obrigatório" });
                return;
            }

            const prompt = `Você deve criar o conteúdo programático do curso "${titulo}".
O conteúdo programático deve condizer com o tipo do curso.
Considere o contexto: ${contexto}
Retorne APENAS um objeto JSON com a chave "conteudo" contendo uma string de texto corrido descrevendo os módulos e tópicos do curso.
SEM MARKDOWN, SEM emojis, texto formal em português.
Exemplo: {"conteudo": "Módulo 1: Introdução... Módulo 2: Fundamentos..."}`;

            const response = await callGemini(prompt);
            res.json(response);
        }catch(error){
            console.log("Erro ao chamar o gemini");
            res.status(500).json({ message: "Erro interno", stacktrace: error });
        }
    }

    static async gerarPublicoAlvo(req, res){
        try{
            const contexto = (req.body?.contexto ?? "").trim();

            if(!contexto){
                res.status(422).send({ message: "Contexto inválido" });
                return;
            }

            const prompt = `Com base no contexto do curso, defina o público-alvo ideal.
Retorne APENAS um objeto JSON com a chave "publico" contendo o texto.
SEM MARKDOWN, SEM emojis, texto formal em português.
Exemplo: {"publico": "Estudantes de ciência da computação, desenvolvedores iniciantes"}
            -----
            contexto: ${contexto}
            -----`;

            const response = await callGemini(prompt);
            res.json(response);
        }catch(error){
            console.log("Erro ao chamar o gemini");
            res.status(500).json({ message: "Erro interno", stacktrace: error });
        }
    }

    static async gerarPreRequisitos(req, res){
        try{
            const contexto = (req.body?.contexto ?? "").trim();

            if(!contexto){
                res.status(422).send({ message: "Contexto inválido" });
                return;
            }

            const prompt = `Com base no contexto do curso, liste os pré-requisitos necessários.
Retorne APENAS um objeto JSON com a chave "preRequisitos" contendo o texto.
SEM MARKDOWN, SEM emojis, texto formal em português.
Se não houver pré-requisitos, retorne "Nenhum".
            -----
            contexto: ${contexto}
            -----`;

            const response = await callGemini(prompt);
            res.json(response);
        }catch(error){
            console.log("Erro ao chamar o gemini");
            res.status(500).json({ message: "Erro interno", stacktrace: error });
        }
    }

    static async gerarResumoAvaliacoes(req, res){
        try{
            const { avaliacoes } = req.body;

            if(!avaliacoes || avaliacoes.length === 0){
                res.status(422).send({ message: "Envie as avaliações para gerar o resumo" });
                return;
            }

            const textoAvaliacoes = avaliacoes
                .filter(av => !av.oculta)
                .map((av, index) => `Avaliação ${index + 1} (${av.nota} estrelas): ${av.mensagem}`)
                .join('\n\n');

            const prompt = `Analise as seguintes avaliações de um curso e gere um resumo objetivo e conciso em até 200 palavras.
            O resumo deve destacar os principais pontos positivos, negativos e o sentimento geral dos alunos.
            Retorne APENAS um objeto JSON com a chave "resumo" contendo o texto do resumo.
            SEM MARKDOWN, SEM emojis, apenas texto formal em português.
            
            Avaliações:
            ${textoAvaliacoes}`;

            const response = await callGemini(prompt);
            res.json(response);
        }catch(error){
            console.log("Erro ao chamar o gemini");
            res.status(500).json({ message: "Erro interno", stacktrace: error });
        }
    }
    
    static async gerarRecomendacoesCursoAux({ proficiencias, nivel, cursosDisponiveis, cursosInscritosIds }){
            try {
              
                if (!proficiencias || !cursosDisponiveis || !cursosInscritosIds) {
                    throw new Error("Dados de entrada para a IA incompletos.");
                }

                const prompt = `
                    Você é um Conselheiro de Carreira Sênior de um T.I. Sua tarefa é criar uma lista classificada (ranking) de recomendações de cursos.

                    **LISTA A (Proficiências que o Usuário POSSUI):**
                    [${proficiencias.map(p => `"${p}"`).join(', ')}]

                    **LISTA B (Cursos Disponíveis e seus Pré-Requisitos BRUTOS):**
                    ${cursosDisponiveis.map(c => 
                        `ID: ${c._id} | Nome: ${c.nome} | Pré-Requisitos: "${c.preRequisitos || 'Nenhum'}" | Proficiências Ensinadas: "${c.proficiencias.join(', ')}"`
                    ).join('\n')}

                    **LISTA C (IDs de Cursos que o Usuário JÁ ESTÁ INSCRITO):**
                    [${cursosInscritosIds.map(id => `"${id}"`).join(', ')}]

                    **Instruções de Saída (REGRA OBRIGATÓRIA E ESTRITA):**

                    1.  **FILTRO INICIAL:** Exclua IMEDIATAMENTE qualquer curso da LISTA B cujo "ID" esteja na LISTA C.

                    2.  **NORMALIZAÇÃO:**
                        a.  Converta a LISTA A (Proficiências) para minúsculas (lowercase).
                        b.  Para CADA curso restante na LISTA B, normalize a string "Pré-Requisitos": converta para minúsculas, substitua " e " por ",", remova pontuação (como ".").
                        c.  Divida a string normalizada por vírgula (",") para obter uma lista de tags de pré-requisito (Ex: "HTML, CSS e JavaScript." se torna ["html", "css", "javascript"]).
                        d.  Se o pré-requisito for "Nenhum" ou "", a lista de tags é ["nenhum"].

                    3.  **VALIDAÇÃO (Pós-Normalização):**
                        a.  Verifique quais cursos o usuário cumpre os pré-requisitos exatos (tags da LISTA A devem conter TODAS as tags de pré-requisito do curso).
                        b.  Cursos onde o usuário NÃO cumpre os pré-requisitos são **INVÁLIDOS**. Não os recomende.

                    4.  **CRITÉRIOS DE RANKING (Obrigatório):**
                        Você deve classificar os cursos VÁLIDOS em dois níveis:
                        * **Rank 1 (Prioridade Alta):** Cursos que *tinham* pré-requisitos (ex: ["javascript"]) e o usuário cumpriu todos.
                        * **Rank 2 (Prioridade Baixa):** Cursos que *não tinham* pré-requisitos (["nenhum"]) mas que são relevantes para as proficiências do usuário.

                    **Tarefa:**
                    1.  Selecione as 3 melhores recomendações, **dando preferência total aos cursos de Rank 1**.
                    2.  **EXPLICAÇÃO PERSONALIZADA (MAIS IMPORTANTE):** Para cada curso recomendado, gere uma explicação única e personalizada. A explicação NÃO PODE ser "Recomendado pois você cumpre os pré-requisitos".
                        * **Exemplo (Rank 1):** Se o usuário tem "JavaScript" e o curso é "React" (Pré-req: "JavaScript"), a explicação deve ser: "Como você já domina JavaScript, este curso de React é o próximo passo lógico para aprofundar suas habilidades de front-end."
                        * **Exemplo (Rank 2):** Se o usuário tem "Python" e o curso é "Git" (Pré-req: "Nenhum"), a explicação deve ser: "Para complementar suas habilidades em Python, este curso de Git é essencial para o controle de versão dos seus projetos."
                    3.  Retorne OBRIGATORIAMENTE um objeto JSON em texto normal, SEM MARKDOWN, SEM EMOJIS, no formato de array de objetos com chaves "id" e "explicacao".
                `;
                
                return await callGemini(prompt); 

            } catch(error) {
                console.error("Falha ao gerar recomendações pela IA:", error.message);
                return []; 
            }
        }


    static async gerarRecomendacoesCurso(req, res){
        
        const body = req.body;
        const response = await this.gerarRecomendacoesCursoAux(body);
        
        if (response.length === 0) {
            return res.status(200).json([]);
        }

        res.json(response);
    }
}

export default GeminiController;
import callGemini from "../services/geminiAPI.js"


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
            const { titulo, contexto } = req.body;

            if(titulo === undefined){
                res.status(422).json({ message: "Envie o titulo do curso" });
                return;
            }

            if(contexto === ""){
                contexto = "Não enviado";
            }

            const prompt = `Gere uma descrição para o curso com titulo ${titulo},
            a descrição deve ter até 255 caracteres e deve ser retornada em um objeto JSON, em texto normal, SEM MARKDOWN,
            NÃO USE NUNCA emojis, devolva o texto padrão sem emojis e com o portugues de forma formal,
            o objeto de retorno deve ter sempre a chave: descricao e o valor é a descrição gerada por você.
            Também posso enviar o contexto, mas caso ele seja 'Não enviado' você deve apenas ignora-lo.
            -----
            contexto: ${contexto}
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
            const { contexto } = req.body;

            if(contexto === undefined){
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
            const { titulo, contexto } = req.body;

            if(contexto === undefined || contexto === "" ){
                res.status(422).send({ message: "Contexto é obrigatório" });
                return;
            }

            const prompt = `
                Você deve criar o conteúdo programático do curso ${titulo} o conteúdo programático
                deve condizer com o tipo do curso e ele deve ter a duração aproximada de cada módulo,
                considere também o contexto: ${contexto}.
                O contexto fornecido detalha o que o curso possuirá.
                O retorno deve ser em um objeto JSON, em texto normal, SEM MARKDOWN,
                NÃO USE NUNCA emojis, devolva o texto padrão sem emojis.
                O retorno é neste estilo:
                "titulo": "Modulo 3: Introdução e Fundamentos de IA para Desenvolvedores Flutter",
                "duracao_aproximada": "8 horas",
                "conteudo": [
                    "Visão geral da Inteligência Artificial e Aprendizado de Máquina: Conceitos, tipos e aplicações em mobile.",
                    "Tipos de IA aplicáveis a aplicativos móveis: Visão Computacional, Processamento de Linguagem Natural (PLN), Sistemas de Recomendação.",
                    "Ferramentas e bibliotecas comuns no ecossistema de IA (TensorFlow, ML Kit, APIs de nuvem).",
                    "Discussão sobre ética, viés e privacidade em sistemas de IA móveis.",
                    "Introdução à preparação e pré-processamento de dados para modelos de IA.",
                    "Noções básicas de treinamento de modelos e inferência."
                ]
            `;

            const response = await callGemini(prompt);
            res.json(response);
        }catch(error){
            console.log("Erro ao chamar o gemini");
            res.status(500).json({ message: "Erro interno", stacktrace: error });
        }
    }
    
    static async gerarRecomendacoesCursoAux({ proficiencias, nivel, cursosDisponiveis, cursosInscritosIds }){
            try {
                // Validação
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
        // Chama a função auxiliar
        const body = req.body;
        const response = await this.gerarRecomendacoesCursoAux(body);
        
        if (response.length === 0) {
            return res.status(200).json([]);
        }

        res.json(response);
    }
}

export default GeminiController;
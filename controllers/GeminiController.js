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

            // Montar texto com as avaliações
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
}

export default GeminiController;
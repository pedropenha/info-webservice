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
}

export default GeminiController;
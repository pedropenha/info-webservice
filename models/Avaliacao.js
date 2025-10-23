class Avaliacao{
    #usuario;
    #curso;
    #nota;
    #mensagem;

    constructor(usuario, curso, nota, mensagem) {
        this.#curso = curso;
        this.#usuario = usuario;
        this.#nota = nota;
        this.#mensagem = mensagem;
    }
}
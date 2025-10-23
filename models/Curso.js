

class Curso{
    #nome;
    #descricao;
    #conteudo;
    #instrutores;
    #preRequisitos;
    #local;
    #publico;
    #minimoVagas;
    #maximoVagas;
    #horario;
    #faixaEtaria;
    #proeficiencias;

    constructor(nome, descricao, conteudo, instrutores, preRequisitos, local, publico, minimoVagas, maximoVagas, horario, faixaEtaria, proeficiencias) {
        this.#nome = nome;
        this.#descricao = descricao;
        this.#conteudo = conteudo;
        this.#instrutores = instrutores;
        this.#preRequisitos = preRequisitos;
        this.#local = local;
        this.#publico = publico;
        this.#minimoVagas = minimoVagas;
        this.#maximoVagas = maximoVagas;
        this.#horario = horario;
        this.#faixaEtaria = faixaEtaria;
        this.#proeficiencias = proeficiencias;
    }
}
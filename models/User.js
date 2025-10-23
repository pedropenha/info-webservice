class User{
    #nome;
    #senha;
    #email;
    #cpf;
    #nivel;

    constructor(nome, senha, email, cpf, nivel) {
        this.#cpf = cpf;
        this.#email = email;
        this.#nome = nome;
        this.#senha = senha;
        this.#nivel = nivel;
    }
}
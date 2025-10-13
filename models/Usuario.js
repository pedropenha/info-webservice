

class Usuario{
    #nome;
    #email;
    #senha;
    #nivel;
    #cpf;

    constructor(nome, email, senha, nivel, cpf){
        this.#nome = nome;
        this.#email = email;
        this.#senha = senha;
        this.#nivel = nivel;
        this.#cpf = cpf;
    }

    get nome() {
        return this.#nome;
    }

    set nome(nome){
        this.nome = nome;
    }

    get email(){
        return this.#email;
    }

    set email(email){
        this.#email = email;
    }

    get senha(){
        return this.#senha;
    }

    set senha(senha){
        this.#senha = senha;
    }

    get nivel(){
        return this.#nivel;
    }

    set nivel(nivel){
        this.#nivel = nivel;
    }

    get cpf(){
        return this.#cpf;
    }

    set cpf(cpf){
        this.#cpf = cpf;
    }
}
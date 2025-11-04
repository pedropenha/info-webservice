import UserModel from "../Schemas/UserSchema.js";

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

    get cpf(){
        return this.#cpf;
    }

    set cpf(cpf){
        this.#cpf = cpf;
    }

    get email(){
        return this.#email;
    }

    set email(email){
        this.#email = email;
    }

    get nome(){
        return this.#nome;
    }

    set nome(nome){
        this.#nome = nome;
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

    async save(){
        const novoUser = new UserModel({
            cpf: this.cpf,
            senha: this.senha,
            email: this.email,
            nome: this.nome,
            nivel: this.nivel
        })

        return await novoUser.save();
    }

    static async findAll(){
        return await UserModel.find();
    }

    static async findById(id){
        return await UserModel.findById(id);
    }

    static async findByCpf(cpf){
        return await UserModel.findOne({cpf: cpf});
    }

    static async delete(id){
        return await UserModel.findByIdAndDelete(id);
    }

    static async update(id, updateData){
        return await UserModel.findOneAndUpdate(
            { _id: id }, 
            { $set: updateData }, 
            { new: true }
        );
    }
}

export default User;
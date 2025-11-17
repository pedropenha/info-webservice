import ResumoAvaliacaoModel from "../Schemas/ResumoAvaliacaoSchema.js";

class ResumoAvaliacao {
    #cursoId;
    #resumoIA;
    #totalAvaliacoes;
    #mediaNotas;
    #distribuicaoNotas;

    constructor(cursoId, resumoIA, totalAvaliacoes, mediaNotas, distribuicaoNotas) {
        this.#cursoId = cursoId;
        this.#resumoIA = resumoIA;
        this.#totalAvaliacoes = totalAvaliacoes;
        this.#mediaNotas = mediaNotas;
        this.#distribuicaoNotas = distribuicaoNotas;
    }

    get cursoId() {
        return this.#cursoId;
    }

    get resumoIA() {
        return this.#resumoIA;
    }

    get totalAvaliacoes() {
        return this.#totalAvaliacoes;
    }

    get mediaNotas() {
        return this.#mediaNotas;
    }

    get distribuicaoNotas() {
        return this.#distribuicaoNotas;
    }

    async save() {
        const resumoData = {
            cursoId: this.#cursoId,
            resumoIA: this.#resumoIA,
            totalAvaliacoes: this.#totalAvaliacoes,
            mediaNotas: this.#mediaNotas,
            distribuicaoNotas: this.#distribuicaoNotas,
            ultimaAtualizacao: new Date()
        };

        // Usa upsert para criar ou atualizar
        const resumo = await ResumoAvaliacaoModel.findOneAndUpdate(
            { cursoId: this.#cursoId },
            resumoData,
            { upsert: true, new: true }
        );

        return resumo;
    }

    static async findByCurso(cursoId) {
        return await ResumoAvaliacaoModel.findOne({ cursoId });
    }

    static async delete(cursoId) {
        return await ResumoAvaliacaoModel.findOneAndDelete({ cursoId });
    }
}

export default ResumoAvaliacao;

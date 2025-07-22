"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLike = exports.addLike = exports.addComentario = exports.remove = exports.update = exports.findById = exports.findAll = exports.create = void 0;
const Postagem_1 = require("../models/Postagem");
const mongoose_1 = require("mongoose");
const create = async (postData) => {
    const novaPostagem = new Postagem_1.Postagem(postData);
    return await novaPostagem.save();
};
exports.create = create;
const findAll = async () => {
    return await Postagem_1.Postagem.find()
        .populate('autor', 'nome email')
        .populate({
        path: 'compartilhadaDe',
        populate: {
            path: 'autor',
            select: 'nome email'
        }
    })
        .select('-__v')
        .sort({ createdAt: -1 }); // Usar createdAt do timestamps: true
};
exports.findAll = findAll;
const findById = async (id) => {
    console.log(`[findById] Tentando buscar postagem com ID: ${id}`);
    try {
        const postagem = await Postagem_1.Postagem.findById(id)
            .populate('autor', 'nome email') // Popula o autor da postagem
            .populate({
            path: 'compartilhadaDe',
            select: 'titulo conteudo createdAt data', // Seleciona campos da postagem original
            populate: {
                path: 'autor', // Popula o autor da postagem original
                select: 'nome email'
            }
        })
            // .lean() // Opcional: Se você não precisa de métodos Mongoose no resultado, pode adicionar .lean() para objetos JS puros
            .exec(); // Explicitamente executa a query
        if (postagem) {
            console.log(`[findById] Postagem encontrada. ID: ${id}`);
            // console.log(`[findById] Postagem populada: ${JSON.stringify(postagem, null, 2)}`); // Descomente para ver o objeto completo populado
        }
        else {
            console.log(`[findById] Postagem não encontrada para o ID: ${id}`);
        }
        return postagem;
    }
    catch (error) {
        console.error(`[findById] ERRO ao buscar/popular postagem com ID ${id}:`, error.message);
        // console.error(`[findById] Stack Trace:`, error.stack); // Para mais detalhes do erro
        return null; // Retorna null em caso de erro
    }
};
exports.findById = findById;
const update = async (id, updateData) => {
    return await Postagem_1.Postagem.findByIdAndUpdate(id, updateData, { new: true });
};
exports.update = update;
const remove = async (id) => {
    return await Postagem_1.Postagem.findByIdAndDelete(id);
};
exports.remove = remove;
const addComentario = async (postId, comentario) => {
    return await Postagem_1.Postagem.findByIdAndUpdate(postId, { $push: { comentarios: comentario } }, { new: true });
};
exports.addComentario = addComentario;
// --- NOVOS MÉTODOS PARA CURTIDAS ---
const addLike = async (postId, userId) => {
    // Adiciona o userId ao array de curtidas se ele ainda não estiver lá
    return await Postagem_1.Postagem.findByIdAndUpdate(postId, { $addToSet: { curtidas: new mongoose_1.Types.ObjectId(userId) } }, // $addToSet adiciona um elemento apenas se ele não existe
    { new: true });
};
exports.addLike = addLike;
const removeLike = async (postId, userId) => {
    // Remove o userId do array de curtidas
    return await Postagem_1.Postagem.findByIdAndUpdate(postId, { $pull: { curtidas: new mongoose_1.Types.ObjectId(userId) } }, // $pull remove um elemento do array
    { new: true });
};
exports.removeLike = removeLike;
//# sourceMappingURL=postagemRepository.js.map
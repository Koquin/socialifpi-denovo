"use strict";
// socialifpi-denovo/back-end/controllers/postagemController.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommentToPost = exports.compartilharPostagem = exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.getAllPosts = void 0;
const postagemRepository = __importStar(require("../repositories/postagemRepository"));
const mongoose_1 = require("mongoose");
const Postagem_1 = require("../models/Postagem");
// GET /postagens
const getAllPosts = async (req, res) => {
    try {
        const postagens = await Postagem_1.Postagem.find()
            .populate('autor', 'nome _id') // Incluindo '_id' do autor
            .populate({
            path: 'compartilhadaDe',
            populate: {
                path: 'autor',
                select: 'nome _id' // Incluindo '_id' do autor da postagem compartilhada
            }
        })
            .sort({ data: -1 }); // opcional: mais recentes primeiro
        res.status(200).json(postagens);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar postagens', error });
    }
};
exports.getAllPosts = getAllPosts;
// GET /postagens/:id
const getPostById = async (req, res) => {
    try {
        const postagem = await postagemRepository.findById(req.params.id);
        if (!postagem) {
            return res.status(404).json({ message: 'Postagem não encontrada' });
        }
        res.status(200).json(postagem);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao buscar postagem', error });
    }
};
exports.getPostById = getPostById;
// POST /postagens
const createPost = async (req, res) => {
    try {
        if (!req.usuarioId) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }
        if (!mongoose_1.Types.ObjectId.isValid(req.usuarioId)) {
            return res.status(400).json({ message: 'ID de usuário inválido' });
        }
        const postData = {
            titulo: req.body.titulo,
            conteudo: req.body.conteudo,
            autor: new mongoose_1.Types.ObjectId(req.usuarioId)
        };
        const novaPostagem = await postagemRepository.create(postData);
        res.status(201).json(novaPostagem);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao criar postagem', error });
    }
};
exports.createPost = createPost;
// PUT /postagens/:id
const updatePost = async (req, res) => {
    try {
        const postData = req.body;
        const postagemAtualizada = await postagemRepository.update(req.params.id, postData);
        if (!postagemAtualizada) {
            return res.status(404).json({ message: 'Postagem não encontrada' });
        }
        res.status(200).json(postagemAtualizada);
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar postagem', error });
    }
};
exports.updatePost = updatePost;
// DELETE /postagens/:id
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.usuarioId;
        console.log('--- Debug Exclusão de Postagem ---');
        console.log('ID da Postagem (params.id):', postId);
        console.log('ID do Usuário Autenticado (req.usuarioId):', userId);
        if (!userId) {
            console.log('Erro: Usuário não autenticado no controller.');
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }
        const postagem = await postagemRepository.findById(postId);
        if (!postagem) {
            console.log('Erro: Postagem não encontrada no banco de dados.');
            return res.status(404).json({ message: 'Postagem não encontrada para exclusão.' });
        }
        // <--- ALTERADO AQUI: Comparando postagem.autor._id com userId ---
        console.log('ID do Autor da Postagem (postagem.autor._id):', postagem.autor._id.toString());
        console.log('Comparando:', postagem.autor._id.toString(), 'com', userId.toString());
        if (postagem.autor._id.toString() !== userId.toString()) { // <--- CORREÇÃO AQUI
            console.log('Erro: Usuário não autorizado para excluir esta postagem.');
            return res.status(403).json({ message: 'Você não tem permissão para excluir esta postagem.' });
        }
        // -----------------------------------------------------------------
        const postagemRemovida = await postagemRepository.remove(postId);
        if (!postagemRemovida) {
            console.log('Erro: Postagem não removida apesar de encontrada. Pode ser erro no repository.');
            return res.status(404).json({ message: 'Postagem não encontrada para exclusão.' });
        }
        console.log('Sucesso: Postagem excluída.');
        res.status(200).json({ message: 'Postagem excluída com sucesso.', postagem: postagemRemovida });
    }
    catch (error) {
        console.error('Erro ao excluir postagem (catch block):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir postagem.' });
    }
};
exports.deletePost = deletePost;
// POST /compartilhar/:id
const compartilharPostagem = async (req, res) => {
    try {
        const idPostagem = req.params.id;
        const { id: idUsuario, resposta } = req.body;
        if (!idUsuario) {
            return res.status(400).json({ mensagem: 'ID do usuário é obrigatório.' });
        }
        const original = await Postagem_1.Postagem.findById(idPostagem);
        if (!original) {
            return res.status(404).json({ mensagem: 'Postagem original não encontrada.' });
        }
        const origem = original.compartilhadaDe || original._id;
        const novaPostagem = new Postagem_1.Postagem({
            titulo: original.titulo,
            conteudo: original.conteudo,
            autor: idUsuario,
            compartilhadaDe: origem,
            resposta: resposta,
        });
        await novaPostagem.save();
        res.status(201).json({ mensagem: 'Postagem compartilhada com sucesso!', novaPostagem });
    }
    catch (erro) {
        res.status(500).json({ erro: 'Erro ao compartilhar postagem.' });
    }
};
exports.compartilharPostagem = compartilharPostagem;
//função pra adicionar comentario
const addCommentToPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { body, autor } = req.body;
        if (!body) {
            return res.status(400).json({ message: 'O conteúdo do comentário é obrigatório.' });
        }
        const novoComentario = {
            body: body,
            date: new Date(), // A data do comentário será a data atual
            autor: autor, // Usa o nome do autor fornecido ou 'Anônimo' se não for fornecido
        };
        // Chama o método do repositório para adicionar o comentário
        const postagemAtualizada = await postagemRepository.addComentario(postId, novoComentario);
        if (!postagemAtualizada) {
            return res.status(404).json({ message: 'Postagem não encontrada para adicionar comentário.' });
        }
        // Retorna a postagem atualizada com o novo comentário
        res.status(201).json(postagemAtualizada);
    }
    catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao adicionar comentário.' });
    }
};
exports.addCommentToPost = addCommentToPost;
//# sourceMappingURL=postagemController.js.map
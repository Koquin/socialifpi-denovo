"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compartilharPostagem = exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.getAllPosts = void 0;
const postagemRepository = __importStar(require("../repositories/postagemRepository"));
const mongoose_1 = require("mongoose");
const Postagem_1 = require("../models/Postagem");
// GET /postagens
const getAllPosts = async (req, res) => {
    try {
        const postagens = await Postagem_1.Postagem.find()
            .populate('autor', 'nome')
            .populate({
            path: 'compartilhadaDe',
            populate: {
                path: 'autor',
                select: 'nome'
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
        const postagemRemovida = await postagemRepository.remove(req.params.id);
        if (!postagemRemovida) {
            return res.status(404).json({ message: 'Postagem não encontrada' });
        }
        res.status(200).json({ message: 'Postagem removida com sucesso' });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao remover postagem', error });
    }
};
exports.deletePost = deletePost;
// POST /compartilhar/:id
const compartilharPostagem = async (req, res) => {
    try {
        const idPostagem = req.params.id;
        const idUsuario = req.body.id;
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
        });
        await novaPostagem.save();
        res.status(201).json({ mensagem: 'Postagem compartilhada com sucesso!', novaPostagem });
    }
    catch (erro) {
        res.status(500).json({ erro: 'Erro ao compartilhar postagem.' });
    }
};
exports.compartilharPostagem = compartilharPostagem;
//# sourceMappingURL=postagemController.js.map
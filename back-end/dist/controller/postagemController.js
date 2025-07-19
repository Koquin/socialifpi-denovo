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
exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.getAllPosts = void 0;
const postagemRepository = __importStar(require("../repositories/postagemRepository"));
// GET /postagens
const getAllPosts = async (req, res) => {
    try {
        const postagens = await postagemRepository.findAll();
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
        const postData = req.body;
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
//# sourceMappingURL=postagemController.js.map
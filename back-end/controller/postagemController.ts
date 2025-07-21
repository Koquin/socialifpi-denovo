import { Request, Response } from 'express';
import { ICreatePostagemDto, IUpdatePostagemDto } from '../repositories/postagemRepository';
import * as postagemRepository from '../repositories/postagemRepository';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Types } from 'mongoose'; 
import { Postagem } from '../models/Postagem';

// GET /postagens
export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const postagens = await Postagem.find()
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
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar postagens', error });
    }
};


// GET /postagens/:id
export const getPostById = async (req: Request, res: Response) => {
    try {
        const postagem = await postagemRepository.findById(req.params.id as string);
        if (!postagem) {
            return res.status(404).json({ message: 'Postagem não encontrada' });
        }
        res.status(200).json(postagem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar postagem', error });
    }
};

// POST /postagens
export const createPost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.usuarioId) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        if (!Types.ObjectId.isValid(req.usuarioId)) {
            return res.status(400).json({ message: 'ID de usuário inválido' });
        }

        const postData: ICreatePostagemDto = {
            titulo: req.body.titulo,
            conteudo: req.body.conteudo,
            autor: new Types.ObjectId(req.usuarioId) 
        };

        const novaPostagem = await postagemRepository.create(postData);
        res.status(201).json(novaPostagem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar postagem', error });
    }
};

// PUT /postagens/:id
export const updatePost = async (req: Request, res: Response) => {
    try {
        const postData: IUpdatePostagemDto = req.body;
        const postagemAtualizada = await postagemRepository.update(req.params.id as string, postData);
        if (!postagemAtualizada) {
            return res.status(404).json({ message: 'Postagem não encontrada' });
        }
        res.status(200).json(postagemAtualizada);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar postagem', error });
    }
};

// DELETE /postagens/:id
export const deletePost = async (req: Request, res: Response) => {
    try {
        const postagemRemovida = await postagemRepository.remove(req.params.id as string);
        if (!postagemRemovida) {
            return res.status(404).json({ message: 'Postagem não encontrada' });
        }
        res.status(200).json({ message: 'Postagem removida com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover postagem', error });
    }
};

// POST /compartilhar/:id
// POST /compartilhar/:id
export const compartilharPostagem = async (req: Request, res: Response) => {
    try {
        const idPostagem = req.params.id;
        const { id: idUsuario, resposta } = req.body;

        if (!idUsuario) {
            return res.status(400).json({ mensagem: 'ID do usuário é obrigatório.' });
        }

        const original = await Postagem.findById(idPostagem);
        if (!original) {
            return res.status(404).json({ mensagem: 'Postagem original não encontrada.' });
        }

        const origem = original.compartilhadaDe || original._id;

        const novaPostagem = new Postagem({
            titulo: original.titulo,
            conteudo: original.conteudo,
            autor: idUsuario,
            compartilhadaDe: origem,
            resposta: resposta,
        });

        await novaPostagem.save();

        res.status(201).json({ mensagem: 'Postagem compartilhada com sucesso!', novaPostagem });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao compartilhar postagem.' });
    }
};

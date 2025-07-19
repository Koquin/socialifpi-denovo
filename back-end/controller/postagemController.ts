import { Request, Response } from 'express';
import { ICreatePostagemDto, IUpdatePostagemDto } from '../repositories/postagemRepository';
import * as postagemRepository from '../repositories/postagemRepository';

// GET /postagens
export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const postagens = await postagemRepository.findAll();
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
export const createPost = async (req: Request, res: Response) => {
    try {
        const postData: ICreatePostagemDto = req.body;
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
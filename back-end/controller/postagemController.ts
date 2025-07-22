import { Request, Response } from 'express';
import { ICreatePostagemDto, IUpdatePostagemDto } from '../repositories/postagemRepository';
import * as postagemRepository from '../repositories/postagemRepository';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Types } from 'mongoose';
import { Postagem } from '../models/Postagem';
import { IComentario, IPostagem } from '../models/Postagem';

// GET /postagens
export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const postagens = await Postagem.find()
            .populate('autor', 'nome _id')
            .populate({
                path: 'compartilhadaDe',
                populate: {
                    path: 'autor',
                    select: 'nome _id'
                }
            })
            .sort({ createdAt: -1 }); // Usar createdAt

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

// PUT /postagens/:id (Ainda sem autenticação, mas manteremos por enquanto)
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
        const postId = req.params.id as string;
        const userId = (req as AuthenticatedRequest).usuarioId;

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
        console.log('ID do Autor da Postagem (postagem.autor._id):', postagem.autor._id.toString());
        console.log('Comparando:', postagem.autor._id.toString(), 'com', userId.toString());

        if (postagem.autor._id.toString() !== userId.toString()) {
            console.log('Erro: Usuário não autorizado para excluir esta postagem.');
            return res.status(403).json({ message: 'Você não tem permissão para excluir esta postagem.' });
        }

        const postagemRemovida = await postagemRepository.remove(postId);

        if (!postagemRemovida) {
            console.log('Erro: Postagem não removida apesar de encontrada. Pode ser erro no repository.');
            return res.status(404).json({ message: 'Postagem não encontrada para exclusão.' });
        }

        console.log('Sucesso: Postagem excluída.');
        res.status(200).json({ message: 'Postagem excluída com sucesso.', postagem: postagemRemovida });
    } catch (error) {
        console.error('Erro ao excluir postagem (catch block):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir postagem.' });
    }
};

// POST /compartilhar/:id (Ainda sem autenticação, mas manteremos por enquanto)
export const compartilharPostagem = async (req: Request, res: Response) => {
    try {
        const idPostagem = req.params.id;
        const { id: idUsuario, resposta } = req.body; // id: idUsuario significa renomear 'id' do body para 'idUsuario'

        if (!idUsuario) {
            return res.status(400).json({ mensagem: 'ID do usuário é obrigatório.' });
        }

        const original = await Postagem.findById(idPostagem);
        if (!original) {
            return res.status(404).json({ mensagem: 'Postagem original não encontrada.' });
        }

        const origem = original.compartilhadaDe || original._id; // Se já for compartilhada, mantém a origem original

        const novaPostagem = new Postagem({
            titulo: original.titulo,
            conteudo: original.conteudo,
            autor: new Types.ObjectId(idUsuario), // Converter para ObjectId
            compartilhadaDe: origem,
            resposta: resposta,
        });

        await novaPostagem.save();

        res.status(201).json({ mensagem: 'Postagem compartilhada com sucesso!', novaPostagem });
    } catch (erro) {
        console.error('Erro ao compartilhar postagem:', erro);
        res.status(500).json({ erro: 'Erro ao compartilhar postagem.' });
    }
};

// POST /postagens/:id/comentarios
export const addCommentToPost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const postId = req.params.id as string;
        const { body, autor } = req.body; // 'autor' é o nome do autor do comentário, não o ID

        if (!body) {
            return res.status(400).json({ message: 'O conteúdo do comentário é obrigatório.' });
        }
        if (!autor) { // O autor deve ser enviado do frontend
            return res.status(400).json({ message: 'O nome do autor do comentário é obrigatório.' });
        }

        const novoComentario: IComentario = {
            body: body,
            date: new Date(),
            autor: autor,
        };

        const postagemAtualizada = await postagemRepository.addComentario(postId, novoComentario);

        if (!postagemAtualizada) {
            return res.status(404).json({ message: 'Postagem não encontrada para adicionar comentário.' });
        }

        res.status(201).json(postagemAtualizada);
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao adicionar comentário.' });
    }
};

// --- CONTROLLERS PARA CURTIDAS ---
export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
    console.log('--- Início da requisição toggleLike ---');
    try {
        const postId = req.params.id as string;
        const userId = req.usuarioId; // Obtido do token autenticado

        console.log(`Recebida requisição para curtir/descurtir. Post ID: ${postId}, User ID do Token: ${userId}`);

        if (!userId) {
            console.log('Erro: Usuário não autenticado (userId ausente do req.usuarioId).');
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        // Validação básica do postId
        if (!Types.ObjectId.isValid(postId)) {
            console.log(`Erro: ID de postagem inválido fornecido: ${postId}`);
            return res.status(400).json({ message: 'ID da postagem inválido.' });
        }

        console.log(`Buscando postagem com ID: ${postId}`);
        const postagem = await postagemRepository.findById(postId);

        if (!postagem) {
            console.log(`Erro: Postagem não encontrada para o ID: ${postId}`);
            return res.status(404).json({ message: 'Postagem não encontrada.' });
        }

        const userObjectId = new Types.ObjectId(userId);
        // Verifica se o ID do usuário já existe no array de curtidas
        const hasLiked = postagem.curtidas.some(likeId => {
            console.log(`Comparando curtida ${likeId.toString()} com User ID ${userObjectId.toString()}`);
            return likeId.equals(userObjectId);
        });

        let updatedPost: IPostagem | null;
        let action: 'liked' | 'unliked';

        if (hasLiked) {
            console.log(`Usuário ${userId} JÁ curtiu a postagem ${postId}. Removendo curtida.`);
            updatedPost = await postagemRepository.removeLike(postId, userId);
            action = 'unliked';
        } else {
            console.log(`Usuário ${userId} NÃO curtiu a postagem ${postId}. Adicionando curtida.`);
            updatedPost = await postagemRepository.addLike(postId, userId);
            action = 'liked';
        }

        console.log(`Resultado da operação no repositório. Postagem atualizada: ${updatedPost ? 'Sim' : 'Não'}`);
        // console.log(`Dados da postagem atualizada: ${JSON.stringify(updatedPost, null, 2)}`); // Descomente para ver o objeto completo

        if (!updatedPost) {
            console.error('Erro ao atualizar curtida: Repositório não retornou a postagem atualizada.');
            return res.status(500).json({ message: 'Erro ao atualizar curtida.' });
        }

        console.log(`Sucesso: Postagem ${action} com sucesso. ID: ${postId}, Usuário: ${userId}. Novas curtidas: ${updatedPost.curtidas.length}`);

        res.status(200).json({
            message: `Postagem ${action}.`,
            postagem: updatedPost, // Retorna o objeto da postagem atualizada
            action: action, // Retorna a ação realizada
            likesCount: updatedPost.curtidas.length // Retorna a contagem atualizada de curtidas
        });

    } catch (error) {
        console.error('--- Erro capturado no controller toggleLike ---');
        console.error('Detalhes do erro:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao alternar curtida.' });
    } finally {
        console.log('--- Fim da requisição toggleLike ---');
    }
};
import { Postagem, IPostagem, IComentario } from '../models/Postagem';
import { Types } from 'mongoose';

export interface ICreatePostagemDto {
    titulo: string;
    conteudo: string;
    autor: Types.ObjectId;
}

export interface IUpdatePostagemDto extends Partial<ICreatePostagemDto> {
    $push?: { comentarios: IComentario };
    $set?: any;
    curtidas?: number;
}

export const create = async (postData: ICreatePostagemDto): Promise<IPostagem> => {
    const novaPostagem = new Postagem(postData);
    return await novaPostagem.save();
};

export const findAll = async (): Promise<IPostagem[]> => {
    return await Postagem.find()
        .populate('autor', 'nome email')
        .populate({
            path: 'compartilhadaDe',
            populate: {
                path: 'autor',
                select: 'nome email'
            }
        })
        .select('-__v')
        .sort({ createdAt: -1 });
};

export const findById = async (id: string): Promise<IPostagem | null> => {
    console.log(`[findById] Tentando buscar postagem com ID: ${id}`);
    try {
        const postagem = await Postagem.findById(id)
            .populate('autor', 'nome email')
            .populate({
                path: 'compartilhadaDe',
                select: 'titulo conteudo createdAt data',
                populate: {
                    path: 'autor',
                    select: 'nome email'
                }
            })
            .exec();

        if (postagem) {
            console.log(`[findById] Postagem encontrada. ID: ${id}`);
        } else {
            console.log(`[findById] Postagem não encontrada para o ID: ${id}`);
        }
        return postagem;

    } catch (error: any) {
        console.error(`[findById] ERRO ao buscar/popular postagem com ID ${id}:`, error.message);
        return null;
    }
};

export const update = async (id: string, updateData: IUpdatePostagemDto): Promise<IPostagem | null> => {
    return await Postagem.findByIdAndUpdate(id, updateData, { new: true });
};

export const remove = async (id: string): Promise<IPostagem | null> => {
    return await Postagem.findByIdAndDelete(id);
};

export const addComentario = async (postId: string, comentario: IComentario): Promise<IPostagem | null> => {
    return await Postagem.findByIdAndUpdate(
        postId,
        { $push: { comentarios: comentario } },
        { new: true }
    );
};

export const addLike = async (postId: string, userId: string): Promise<IPostagem | null> => {
    return await Postagem.findByIdAndUpdate(
        postId,
        { $addToSet: { curtidas: new Types.ObjectId(userId) } },
        { new: true }
    );
};

export const removeLike = async (postId: string, userId: string): Promise<IPostagem | null> => {
    return await Postagem.findByIdAndUpdate(
        postId,
        { $pull: { curtidas: new Types.ObjectId(userId) } },
        { new: true }
    );
};
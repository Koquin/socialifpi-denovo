import { Postagem, IPostagem, IComentario } from '../models/Postagem';
import { Types } from 'mongoose';

export interface ICreatePostagemDto {
    titulo: string;
    conteudo: string;
    autor: Types.ObjectId;
}

export interface IUpdatePostagemDto extends Partial<ICreatePostagemDto> { 
    $push?: { comentarios: IComentario }; //adicionei 
    $set?: any; //opcional
    curtidas?: number; // opcional
}

export const create = async (postData: ICreatePostagemDto): Promise<IPostagem> => {
    const novaPostagem = new Postagem(postData);
    return await novaPostagem.save();
};

export const findAll = async (): Promise<IPostagem[]> => {
    return await Postagem.find()
        .populate('autor', 'nome email')
        .select('-__v')
        .sort({ data: -1 });
};

export const findById = async (id: string): Promise<IPostagem | null> => {
    return await Postagem.findById(id).populate('autor', 'nome email');
};

export const update = async (id: string, updateData: IUpdatePostagemDto): Promise<IPostagem | null> => {
    return await Postagem.findByIdAndUpdate(id, updateData, { new: true });
};

export const remove = async (id: string): Promise<IPostagem | null> => {
    return await Postagem.findByIdAndDelete(id);


};
///metodo pra adicionar comentario
export const addComentario = async (postId: string, comentario: IComentario): Promise<IPostagem | null> => {
    return await Postagem.findByIdAndUpdate(
        postId,
        { $push: { comentarios: comentario } }, // Usa $push para adicionar o novo comentário ao array 'comentarios'
        { new: true } // Retorna o documento da postagem atualizado após a adição
    );
};
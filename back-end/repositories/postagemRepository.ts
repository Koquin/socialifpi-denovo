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
    curtidas?: number; // Este 'curtidas' como number pode ser confuso, já que agora é um array
    // O $push e $pull serão usados para as curtidas, então este campo pode ser removido se não for usado para contagem direta
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
        .sort({ createdAt: -1 }); // Usar createdAt do timestamps: true
};

export const findById = async (id: string): Promise<IPostagem | null> => {
    console.log(`[findById] Tentando buscar postagem com ID: ${id}`);
    try {
        const postagem = await Postagem.findById(id)
            .populate('autor', 'nome email') // Popula o autor da postagem
            .populate({ // Popula a postagem original em caso de compartilhamento
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
        } else {
            console.log(`[findById] Postagem não encontrada para o ID: ${id}`);
        }
        return postagem;

    } catch (error: any) {
        console.error(`[findById] ERRO ao buscar/popular postagem com ID ${id}:`, error.message);
        // console.error(`[findById] Stack Trace:`, error.stack); // Para mais detalhes do erro
        return null; // Retorna null em caso de erro
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

// --- NOVOS MÉTODOS PARA CURTIDAS ---

export const addLike = async (postId: string, userId: string): Promise<IPostagem | null> => {
    // Adiciona o userId ao array de curtidas se ele ainda não estiver lá
    return await Postagem.findByIdAndUpdate(
        postId,
        { $addToSet: { curtidas: new Types.ObjectId(userId) } }, // $addToSet adiciona um elemento apenas se ele não existe
        { new: true }
    );
};

export const removeLike = async (postId: string, userId: string): Promise<IPostagem | null> => {
    // Remove o userId do array de curtidas
    return await Postagem.findByIdAndUpdate(
        postId,
        { $pull: { curtidas: new Types.ObjectId(userId) } }, // $pull remove um elemento do array
        { new: true }
    );
};
import { Usuario, IUsuario } from '../models/Usuario';

export interface ICreateUsuarioDto {
    nome: string;
    email: string;
    senha: string;
}

export interface IUpdateUsuarioDto extends Partial<ICreateUsuarioDto> { }

export const create = async (userData: ICreateUsuarioDto): Promise<IUsuario> => {
    const novoUsuario = new Usuario(userData);
    return await novoUsuario.save();
};

export const findAll = async (): Promise<IUsuario[]> => {
    return await Usuario.find().select('-senha');
};

export const findById = async (id: string): Promise<IUsuario | null> => {
    return await Usuario.findById(id).select('-senha');
};

// FUNÇÃO NOVA para login pelo email
export const findByEmail = async (email: string): Promise<IUsuario | null> => {
    return await Usuario.findOne({ email });
};

export const update = async (id: string, updateData: IUpdateUsuarioDto): Promise<IUsuario | null> => {
    return await Usuario.findByIdAndUpdate(id, updateData, { new: true }).select('-senha');
};

export const remove = async (id: string): Promise<IUsuario | null> => {
    return await Usuario.findByIdAndDelete(id).select('-senha');
};

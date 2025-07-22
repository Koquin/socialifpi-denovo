import mongoose, { Document, Schema } from 'mongoose';

export interface IUsuario extends Document {
    nome: string;
    email: string;
    senha: string;
    data_criacao: Date;
}

const UsuarioSchema = new Schema<IUsuario>({
    nome: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    senha: {
        type: String,
        required: true,
    },
    data_criacao: {
        type: Date,
        default: Date.now,
    },
});

export const Usuario = mongoose.model<IUsuario>('Usuario', UsuarioSchema);
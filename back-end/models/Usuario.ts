import mongoose, { Document, Schema } from 'mongoose';

// 1. Defina a interface para o seu documento de usuário
// Ela deve estender 'Document' para incluir propriedades como '_id'
export interface IUsuario extends Document {
    nome: string;
    email: string;
    senha: string; // Lembre-se do aviso de segurança sobre senhas não criptografadas
    data_criacao: Date;
}

const UsuarioSchema = new Schema<IUsuario>({ // 2. Tipagem do Schema com <IUser>
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

// 3. Exporte o modelo usando 'export const' e tipagem com <IUser>
export const Usuario = mongoose.model<IUsuario>('Usuario', UsuarioSchema);
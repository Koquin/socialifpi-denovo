import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPostagem extends Document {
  _id: Types.ObjectId;
  titulo: string;
  conteudo: string;
  autor: Types.ObjectId;
  data: Date; // A data original de criação (pode ser redundante com createdAt)
  comentarios: IComentario[];
  curtidas: Types.ObjectId[]; // <-- AGORA É UM ARRAY DE IDS DE USUÁRIOS
  compartilhadaDe?: mongoose.Types.ObjectId | null;
  resposta?: string;
  createdAt: Date; // Adicionado automaticamente por timestamps
  updatedAt: Date; // Adicionado automaticamente por timestamps
}

export interface IComentario {
  body: string;
  date: Date;
  autor?: string; // Nome do autor do comentário (string)
}

const PostagemSchema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
  },
  conteudo: {
    type: String,
    required: true,
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Referencia o modelo de Usuário
    required: true,
  },
  data: { // Campo 'data' original, mantido por compatibilidade
    type: Date,
    required: true,
    default: Date.now,
  },
  curtidas: [ // <-- DEFINIÇÃO DO CAMPO 'CURTIDAS' COMO ARRAY DE REFERÊNCIAS
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario' // Cada elemento no array é o ObjectId de um usuário
    }
  ],
  comentarios: [
    {
      body: { type: String, required: true },
      date: {
        type: Date,
        default: Date.now,
      },
      autor: {
        type: String,
        required: false,
      },
    },
  ],
  compartilhadaDe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Postagem', // Referencia outra Postagem
    default: null,
  },
  resposta: {
    type: String,
    default: ""
  }
}, {
  timestamps: true // Habilita createdAt e updatedAt
});

export const Postagem = mongoose.model<IPostagem>('Postagem', PostagemSchema);
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPostagem extends Document {
  _id: Types.ObjectId;
  titulo: string;
  conteudo: string;
  autor: Types.ObjectId;
  data: Date;
  comentarios: IComentario[];
  curtidas: Types.ObjectId[];
  compartilhadaDe?: mongoose.Types.ObjectId | null;
  resposta?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComentario {
  body: string;
  date: Date;
  autor?: string;
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
    ref: 'Usuario',
    required: true,
  },
  data: {
    type: Date,
    required: true,
    default: Date.now,
  },
  curtidas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
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
    ref: 'Postagem',
    default: null,
  },
  resposta: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

export const Postagem = mongoose.model<IPostagem>('Postagem', PostagemSchema);
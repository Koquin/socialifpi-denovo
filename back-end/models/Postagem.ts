import mongoose, { Document, Schema } from 'mongoose';
//models/Post.js

export interface IPostagem extends Document {
  titulo: string;
  conteudo: string;
  autor: string;
  data: Date;
  comentarios: IComentario[];
  curtidas: number;
  compartilhadaDe?: mongoose.Types.ObjectId | null;
  resposta?: string; 
}



export interface IComentario {
  body: string;
  date: Date;
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
  curtidas: {
    type: Number,
    default: 0,
    required: true,
  },
  comentarios: [
    {
      body: String,
      date: {
        type: Date,
        default: Date.now,
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
});

export const Postagem = mongoose.model<IPostagem>('Postagem', PostagemSchema);
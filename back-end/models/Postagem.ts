import mongoose, { Document, Schema } from 'mongoose';
//models/Post.js

export interface IPostagem extends Document {
  titulo: string;
  conteudo: string;
  autor: string;
  data: Date;
  comentarios: IComentario[];
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
});

export const Postagem = mongoose.model<IPostagem>('Postagem', PostagemSchema);
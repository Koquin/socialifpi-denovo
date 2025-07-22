import mongoose, { Document, Schema, Types} from 'mongoose';
//models/Post.js

export interface IPostagem extends Document {
  _id: Types.ObjectId;
  titulo: string;
  conteudo: string;
  autor: Types.ObjectId;
  data: Date;
  comentarios: IComentario[];
  curtidas: number;
  compartilhadaDe?: mongoose.Types.ObjectId | null;
  resposta?: string; 
  createdAt: Date; // Adicionado para compatibilidade com timestamps
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
  curtidas: {
    type: Number,
    default: 0,
    required: true,
  },
  comentarios: [
   {
      body: { type: String, required: true }, // Garante que o body é obrigatório
      date: {
        type: Date,
        default: Date.now,
      },
      autor: { 
        type: String, // O autor do comentário será uma string (nome do usuário)
        required: false, // Opcional, caso o usuário não preencha o campo
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
},{
  timestamps: true
});

export const Postagem = mongoose.model<IPostagem>('Postagem', PostagemSchema);
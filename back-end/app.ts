// app.ts

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // <-- Importe o pacote cors

import postagemRoutes from './routes/postagemRoutes';
import usuarioRoutes from './routes/usuarioRoutes';

const app = express();

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://iagojrdc:nLsp6dWJesfO62QD@socialifpi.ywrquky.mongodb.net/?retryWrites=true&w=majority&appName=socialifpi");
        console.log('MongoDB conectado com sucesso!');
    } catch (err) {
        console.error('Falha na conexão com o MongoDB:', err);
        process.exit(1);
    }
};

// Adicione o middleware cors aqui
app.use(cors());

// Middleware: Permite que o Express leia o corpo das requisições JSON
app.use(express.json());

// Defina as rotas base
app.use('/postagem', postagemRoutes);
app.use('/usuario', usuarioRoutes);

const port = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
});
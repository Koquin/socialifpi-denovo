import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import postagemRoutes from './routes/postagemRoutes';
import usuarioRoutes from './routes/usuarioRoutes';

const app = express();

app.use(cors());

app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://iagojrdc:nLsp6dWJesfO62QD@socialifpi.ywrquky.mongodb.net/?retryWrites=true&w=majority&appName=socialifpi");
        console.log('MongoDB conectado com sucesso!');
    } catch (err) {
        console.error('Falha na conexão com o MongoDB:', err);
        process.exit(1);
    }
};

// ✅ Mapeamento das rotas base
app.use('/postagem', postagemRoutes);
app.use('/usuarios', usuarioRoutes);

const port = process.env.PORT || 8080;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
});



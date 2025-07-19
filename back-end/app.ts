import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
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

app.use(express.json());

// Mapeamento das rotas base para os seus roteadores
app.use('/postagem', postagemRoutes);
app.use('/usuario', usuarioRoutes);

const port = process.env.PORT || 8080;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
});
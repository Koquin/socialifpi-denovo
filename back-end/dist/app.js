"use strict";
// app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors")); // <-- Importe o pacote cors
const postagemRoutes_1 = __importDefault(require("./routes/postagemRoutes"));
const usuarioRoutes_1 = __importDefault(require("./routes/usuarioRoutes"));
const app = (0, express_1.default)();
const connectDB = async () => {
    try {
        await mongoose_1.default.connect("mongodb+srv://iagojrdc:nLsp6dWJesfO62QD@socialifpi.ywrquky.mongodb.net/?retryWrites=true&w=majority&appName=socialifpi");
        console.log('MongoDB conectado com sucesso!');
    }
    catch (err) {
        console.error('Falha na conexão com o MongoDB:', err);
        process.exit(1);
    }
};
// Adicione o middleware cors aqui
app.use((0, cors_1.default)());
// Middleware: Permite que o Express leia o corpo das requisições JSON
app.use(express_1.default.json());
// Defina as rotas base
app.use('/postagem', postagemRoutes_1.default);
app.use('/usuario', usuarioRoutes_1.default);
const port = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
});
//# sourceMappingURL=app.js.map
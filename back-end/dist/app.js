"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const postagemRoutes_1 = __importDefault(require("./routes/postagemRoutes"));
const usuarioRoutes_1 = __importDefault(require("./routes/usuarioRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
// ✅ Mapeamento das rotas base
app.use('/postagem', postagemRoutes_1.default);
app.use('/usuarios', usuarioRoutes_1.default);
const port = process.env.PORT || 8080;
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
});
//# sourceMappingURL=app.js.map
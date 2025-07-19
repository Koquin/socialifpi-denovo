"use strict";
/**import 'dotenv/config';
import mongoose from 'mongoose';
import { create, findAll, findById, update, remove } from '../repositories/postagemRepository';
import { IPostagem } from '../models/Postagem';
import { Usuario, IUsuario } from '../models/Usuario';

async function runTests() {
    // 1. Conecte-se ao banco de dados (reutilizando a lógica do seu app.ts)
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Banco de dados conectado para testes.');
    } catch (err) {
        console.error('Falha na conexão:', err);
        process.exit(1);
    }

    // Crie um usuário para ser o autor da postagem de teste
    // O tipo de 'usuario' agora será inferido corretamente como 'IUser'
    const usuario: IUsuario = await Usuario.create({ nome: 'iago', email: 'iago@example.com', senha: '123', data_criacao: new Date() });

    let newPost: IPostagem | null = null;
    const testPostData = {
        titulo: 'Postagem de Teste',
        conteudo: 'Este é o conteúdo do teste CRUD.',
        autor: usuario._id,
    } as IPostagem;

    console.log('--- Executando Testes de Repositório ---');

    // TESTE 1: CREATE (C)
    try {
        newPost = await create(testPostData);
        console.log('\n✅ CREATE: Postagem criada com sucesso! ID:', newPost._id);
    } catch (error) {
        console.error('\n❌ CREATE: Erro ao criar postagem:', error);
    }

    // TESTE 2: READ (R)
    try {
        const allPosts = await findAll();
        console.log('\n✅ READ ALL: Postagens encontradas:', allPosts.length);
        if (allPosts.length > 0) {
            console.log('   - A primeira postagem é:', allPosts[0].titulo);
            if (typeof allPosts[0].autor === 'object' && allPosts[0].autor !== null && 'nome' in allPosts[0].autor) {
                console.log('   - Autor populado:', (allPosts[0].autor as IUsuario).nome);
            } else {
                console.log('   - Autor não populado, valor:', allPosts[0].autor);
            }
        }
    } catch (error) {
        console.error('\n❌ READ ALL: Erro ao buscar postagens:', error);
    }

    // TESTE 3: READ ONE (R)
    try {
        // A Promise de 'create' retorna o objeto Postagem salvo
        newPost = await create(testPostData);

        // O TypeScript agora sabe que, neste ponto, 'newPost' não é nulo.
        if (newPost) {
            console.log('\n✅ CREATE: Postagem criada com sucesso! ID:', newPost._id);
        }

    } catch (error) {
        console.error('\n❌ CREATE: Erro ao criar postagem:', error);
    }

    // TESTE 4: UPDATE (U)
    // test.ts

    if (newPost) {
        try {
            // Usamos 'as string' para dizer ao TypeScript que o '_id'
            // pode ser tratado como uma string.
            const postId = (newPost._id as mongoose.Types.ObjectId).toString();

            // O método 'update' agora recebe um ID de tipo string.
            const updatedPost = await update(postId, { titulo: 'Título Atualizado' });

            // Usamos '?' para o caso de o resultado ser nulo (not found)
            console.log('\n✅ UPDATE: Postagem atualizada! Novo título:', updatedPost?.titulo);

        } catch (error) {
            console.error('\n❌ UPDATE: Erro ao atualizar postagem:', error);
        }
    }


    console.log("USUARIO NAO FOI DELETADO");
    // Desconecte-se do banco de dados
    await mongoose.disconnect();
    console.log('\n--- Testes Concluídos e Banco de Dados Desconectado ---');
}

runTests();
**/ 
//# sourceMappingURL=app-teste.js.map
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:8080";

    const endpointCadastro = apiUrl + "/usuarios/";
    const endpointLogin = apiUrl + "/usuarios/login";
    const endpointPostagens = apiUrl + "/postagem";

    const loginForm = document.getElementById("loginForm");
    const cadastroForm = document.getElementById("cadastroForm");
    const areaPrincipal = document.getElementById("areaPrincipal");
    const autenticacao = document.getElementById("autenticacao");
    const usuarioLogado = document.getElementById("usuarioLogado");
    const menuNavegacao = document.getElementById("menuNavegacao");

    const botaoLogin = document.getElementById("botaoLogin");
    const botaoCadastro = document.getElementById("botaoCadastro");
    const botaoNovaPostagem = document.getElementById("botaoNovaPostagem");
    const botaoLogout = document.getElementById("botaoLogout");

    // Inicialmente esconder botão logout
    botaoLogout.style.display = "none";

    // Alternar entre login e cadastro
    document.getElementById("mostrarCadastro").addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        cadastroForm.style.display = "block";
    });

    document.getElementById("mostrarLogin").addEventListener("click", (e) => {
        e.preventDefault();
        cadastroForm.style.display = "none";
        loginForm.style.display = "block";
    });

    // Verifica token ao carregar a página
    const token = localStorage.getItem("token");
    if (token) {
        mostrarAreaPrincipal(token);
    }

    // CADASTRO
    botaoCadastro.addEventListener("click", async () => {
        const nome = document.getElementById("novoUsuario").value;
        const email = document.getElementById("novoEmail").value;
        const senha = document.getElementById("novaSenha").value;

        try {
            const resposta = await fetch(endpointCadastro, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha }),
            });

            if (!resposta.ok) {
                throw new Error("Erro ao cadastrar usuário.");
            }

            alert("Cadastro realizado com sucesso! Faça login.");
            cadastroForm.style.display = "none";
            loginForm.style.display = "block";
        } catch (erro) {
            console.error(erro);
            alert("Erro ao cadastrar usuário.");
        }
    });

    // LOGIN
    botaoLogin.addEventListener("click", async () => {
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        try {
            const resposta = await fetch(endpointLogin, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha }),
            });
            const dados = await resposta.json();
            console.log("Dados de login:", dados);
            if (dados.token) {
                localStorage.setItem("id", dados.id);
                localStorage.setItem("token", dados.token);
                mostrarAreaPrincipal(dados.token);
            } else {
                alert("Credenciais inválidas.");
            }
        } catch (erro) {
            console.error(erro);
            alert("Erro ao realizar login.");
        }
    });

    // NOVA POSTAGEM
    botaoNovaPostagem.addEventListener("click", async () => {
        const titulo = document.getElementById("titulo").value;
        const conteudo = document.getElementById("conteudo").value;

        try {
            const resposta = await fetch(endpointPostagens, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ titulo, conteudo }),
            });
            console.log("Resposta da criação de postagem:", resposta);
            if (!resposta.ok) {
                throw new Error("Erro ao criar postagem.");
            }

            document.getElementById("titulo").value = "";
            document.getElementById("conteudo").value = "";
            listarPostagens();
        } catch (erro) {
            console.error(erro);
            alert("Erro ao criar postagem.");
        }
    });

 async function listarPostagens() {
    console.log(localStorage);
    try {
        console.log("Iniciando listagem de postagens...");
        console.log(localStorage.getItem('token'));
        console.log(endpointPostagens);

        const resposta = await fetch(endpointPostagens, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        console.log(resposta);
        if (!resposta.ok) {
            throw new Error(`HTTP error! status: ${resposta.status}`);
        }

        const postagens = await resposta.json();
        console.log("Postagens recebidas:", postagens);

        const container = document.getElementById("postagens");
        container.innerHTML = "";

        postagens.forEach((postagem, index) => {
            console.log(`Processando postagem #${index + 1}:`, postagem);

            const article = document.createElement("article");

            const titulo = document.createElement("h3");
            const conteudo = document.createElement("p");
            const data = document.createElement("small");
            const infoAutor = document.createElement("p");
            const botaoCompartilhar = document.createElement("button");

            const compartilhada = postagem.compartilhadaDe != null;

            const nomeAutor = postagem.autor?.nome || "Desconhecido";
            const nomeOriginal = postagem.compartilhadaDe?.autor?.nome || "Desconhecido";
            const tituloOriginal = postagem.compartilhadaDe?.titulo || postagem.titulo;
            const conteudoOriginal = postagem.compartilhadaDe?.conteudo || postagem.conteudo;

            // Título
            titulo.textContent = compartilhada
                ? `[Compartilhado] ${tituloOriginal}`
                : postagem.titulo;

            // Conteúdo
            conteudo.textContent = compartilhada ? conteudoOriginal : postagem.conteudo;

            // Data
            data.textContent = new Date(postagem.createdAt || postagem.data).toLocaleString();

            // Autor ou Compartilhamento
            if (compartilhada) {
                infoAutor.textContent = `Compartilhado por: ${nomeAutor} (original de ${nomeOriginal})`;
            } else {
                infoAutor.textContent = `Autor: ${nomeAutor}`;
            }

            // Botão de compartilhar
            botaoCompartilhar.textContent = "Compartilhar";
            botaoCompartilhar.addEventListener("click", () => compartilharPostagem(postagem._id));

            article.append(titulo, conteudo, data, infoAutor, botaoCompartilhar);
            container.appendChild(article);
        });

        console.log("Listagem de postagens finalizada.");
    } catch (erro) {
        console.error("Erro ao listar postagens:", erro);
    }
}


    // LOGOUT
    botaoLogout.addEventListener("click", () => {
        localStorage.removeItem("token");
        location.reload();
    });

    // Mostrar área principal após login
    function mostrarAreaPrincipal(token) {
        autenticacao.style.display = "none";
        areaPrincipal.style.display = "block";
        menuNavegacao.style.display = "block";

        // Mostrar botão logout
        botaoLogout.style.display = "inline-block";

        // Exibe o e-mail do usuário logado, decodificando token JWT
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            usuarioLogado.textContent = `Olá, ${payload.email}!`;
        } catch {
            usuarioLogado.textContent = "Olá, usuário!";
        }

        listarPostagens();
    }

async function compartilharPostagem(idPostagem) {
    const idUsuario = localStorage.getItem("id");

    if (!idUsuario) {
        alert("Usuário não autenticado.");
        return;
    }

    try {
        const resposta = await fetch(`${endpointPostagens}/compartilhar/${idPostagem}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ id: idUsuario }) // <-- Aqui o campo é 'id'
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.mensagem || "Erro ao compartilhar.");
        }

        alert("Postagem compartilhada com sucesso!");
        listarPostagens(); // Atualiza a lista
    } catch (erro) {
        console.error("Erro ao compartilhar postagem:", erro);
        alert("Erro ao compartilhar. Tente novamente.");
    }
}


});

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
    let idPostagemParaCompartilhar = null;

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

    document.getElementById("botaoFiltrar").addEventListener("click", () => {
        const nome = document.getElementById("filtroUsuario").value.trim();
        listarPostagens(nome);
    });

    document.getElementById("botaoLimparFiltro").addEventListener("click", () => {
        document.getElementById("filtroUsuario").value = "";
        listarPostagens();
    });


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

async function listarPostagens(nomeFiltro = "") {
    try {
        const resposta = await fetch(endpointPostagens, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!resposta.ok) {
            throw new Error(`HTTP error! status: ${resposta.status}`);
        }

        const postagens = await resposta.json();

        const container = document.getElementById("postagens");
        container.innerHTML = "";

        const nomeFiltroLower = nomeFiltro.toLowerCase();

        postagens
            .filter(postagem => {
                const nomeAutorCompartilhador = postagem.autor?.nome?.toLowerCase() || "";
                return nomeAutorCompartilhador.includes(nomeFiltroLower);
            })
            .forEach((postagem) => {
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

                titulo.textContent = compartilhada
                    ? `[Compartilhado] ${tituloOriginal}`
                    : postagem.titulo;

                conteudo.textContent = compartilhada ? conteudoOriginal : postagem.conteudo;

                data.textContent = new Date(postagem.createdAt || postagem.data).toLocaleString();

                if (compartilhada) {
                    infoAutor.textContent = `Compartilhado por: ${nomeAutor} (original de ${nomeOriginal})`;

                    // Resposta do compartilhamento
                    if (postagem.resposta) {
                        const resposta = document.createElement("blockquote");
                        resposta.textContent = postagem.resposta;
                        article.appendChild(resposta);
                    }
                } else {
                    infoAutor.textContent = `Autor: ${nomeAutor}`;
                }

                botaoCompartilhar.textContent = "Compartilhar";
                botaoCompartilhar.addEventListener("click", () => abrirModalCompartilhar(postagem._id));

                article.append(titulo, conteudo, data, infoAutor, botaoCompartilhar);
                container.appendChild(article);
            });

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

async function compartilharPostagem(idPostagem, resposta) {
    const idUsuario = localStorage.getItem("id");

    if (!idUsuario) {
        alert("Usuário não autenticado.");
        return;
    }

    try {
        const respostaServidor = await fetch(`${endpointPostagens}/compartilhar/${idPostagem}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({ id: idUsuario, resposta })
        });

        if (!respostaServidor.ok) {
            const erro = await respostaServidor.json();
            throw new Error(erro.mensagem || "Erro ao compartilhar.");
        }

        alert("Postagem compartilhada com sucesso!");
        listarPostagens();
    } catch (erro) {
        console.error("Erro ao compartilhar postagem:", erro);
        alert("Erro ao compartilhar. Tente novamente.");
    }
}


function abrirModalCompartilhar(idPostagem) {
    idPostagemParaCompartilhar = idPostagem;
    document.getElementById("inputRespostaCompartilhamento").value = "";
    document.getElementById("modalCompartilhar").style.display = "flex";
}

document.getElementById("cancelarCompartilhamento").addEventListener("click", () => {
    document.getElementById("modalCompartilhar").style.display = "none";
    idPostagemParaCompartilhar = null;
});

document.getElementById("confirmarCompartilhamento").addEventListener("click", () => {
    const resposta = document.getElementById("inputRespostaCompartilhamento").value.trim();
    if (!idPostagemParaCompartilhar) return;

    compartilharPostagem(idPostagemParaCompartilhar, resposta);
    document.getElementById("modalCompartilhar").style.display = "none";
    idPostagemParaCompartilhar = null;
});

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const emoji = e.target.textContent;
        const textarea = document.getElementById('inputRespostaCompartilhamento');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const texto = textarea.value;

        textarea.value = texto.substring(0, start) + emoji + texto.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    });
});

});

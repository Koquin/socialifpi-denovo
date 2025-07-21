"use strict";

function getById(id) {
    return document.getElementById(id);
}

document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:8080';

    const endpointCadastro = apiUrl + '/usuarios/';
    const endpointLogin = apiUrl + '/usuarios/login';

    // LISTAR POSTAGENS
    async function listarPostagens() {
        try {
            const response = await fetch(apiUrl + '/postagens'); // ajustado para endpoint correto
            console.log (response);
            if (!response.ok) throw new Error('Erro na resposta da API');
            const postagens = await response.json();
            const postagensElement = getById('postagens');

            if (postagensElement) {
                postagensElement.innerHTML = '';
                postagens.forEach(postagem => {
                    const article = document.createElement('article');

                    const titulo = document.createElement('h2');
                    titulo.textContent = postagem.titulo;

                    const conteudo = document.createElement('p');
                    conteudo.textContent = postagem.conteudo;

                    const data = document.createElement('p');
                    data.className = 'data';
                    data.textContent = new Date(postagem.data).toLocaleDateString();

                    const autor = document.createElement('p');
                    autor.textContent = `Autor: ${postagem.autor?.nome || 'Desconhecido'}`;

                    const curtidas = document.createElement('p');
                    curtidas.textContent = `Curtidas: ${postagem.curtidas}`;
                    curtidas.style.fontWeight = 'bold';

                    const botaoCurtir = document.createElement('button');
                    botaoCurtir.textContent = 'Curtir';
                    botaoCurtir.addEventListener('click', () => curtirPostagem(postagem.id, curtidas));

                    article.append(titulo, conteudo, data, autor, curtidas, botaoCurtir);
                    postagensElement.appendChild(article);
                });
            }
        } catch (error) {
            console.error('Erro ao listar postagens:', error);
            alert('Erro ao carregar as postagens. Tente novamente mais tarde.');
        }
    }

    // CURTIR POSTAGEM
    async function curtirPostagem(id, curtidasElement) {
        try {
            const response = await fetch(`${apiUrl}/postagens/${id}/curtir`, { method: 'POST' }); // endpoint ajustado
            if (!response.ok) throw new Error('Erro ao curtir postagem');
            const result = await response.json();
            curtidasElement.textContent = `Curtidas: ${result.curtidas}`;
        } catch (error) {
            console.error('Erro ao curtir postagem:', error);
            alert('Erro ao curtir a postagem. Tente novamente mais tarde.');
        }
    }

    // INCLUIR POSTAGEM
    async function incluirPostagem() {
        const tituloInput = getById('titulo');
        const conteudoInput = getById('conteudo');

        if (tituloInput && conteudoInput) {
            const novaPostagem = {
                titulo: tituloInput.value.trim(),
                conteudo: conteudoInput.value.trim(),
            };

            if (!novaPostagem.titulo || !novaPostagem.conteudo) {
                alert('Preencha todos os campos da postagem.');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Você precisa estar logado para postar.');
                return;
            }

            try {
                const response = await fetch(apiUrl + '/postagens', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(novaPostagem)
                });

                if (!response.ok) {
                    const erroJson = await response.json().catch(() => ({}));
                    throw new Error(erroJson.mensagem || 'Erro ao adicionar postagem');
                }

                await listarPostagens();
                tituloInput.value = '';
                conteudoInput.value = '';

            } catch (error) {
                console.error(error);
                alert('Erro ao adicionar postagem.');
            }
        }
    }

    // CADASTRAR USUÁRIO NA API
    async function salvarConta(nome, email, senha) {
        try {
            const resposta = await fetch(endpointCadastro, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });

            if (!resposta.ok) {
                const erro = await resposta.json().catch(() => ({}));
                alert(erro.mensagem || 'Erro ao criar conta!');
                return false;
            }

            alert('Conta criada com sucesso!');
            return true;

        } catch (erro) {
            console.error('Erro ao cadastrar usuário:', erro);
            alert('Erro ao cadastrar conta. Tente novamente mais tarde.');
            return false;
        }
    }

    // VERIFICAR LOGIN COM A API
    async function verificarLogin(email, senha) {
        try {
            const resposta = await fetch(endpointLogin, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            if (!resposta.ok) {
                alert('Usuário ou senha inválidos!');
                return false;
            }

            const dados = await resposta.json();
            if (dados.token) {
                localStorage.setItem('token', dados.token);
                localStorage.setItem('nome', dados.nome);
                localStorage.setItem('email', dados.email);
            }

            return dados.autenticado === true;

        } catch (erro) {
            console.error('Erro ao fazer login:', erro);
            alert('Erro ao realizar login. Tente novamente mais tarde.');
            return false;
        }
    }

    // MOSTRAR DADOS DO USUÁRIO LOGADO
    function mostrarUsuarioLogado() {
        const nome = localStorage.getItem('nome');
        const email = localStorage.getItem('email');
        const usuarioLogadoEl = getById('usuarioLogado');

        if (usuarioLogadoEl && nome && email) {
            usuarioLogadoEl.textContent = `Usuário logado: ${nome} (${email})`;
        }
    }

    // AUTENTICAÇÃO: Mostrar/Esconder Formulários
    const loginForm = getById('loginForm');
    const cadastroForm = getById('cadastroForm');

    getById('mostrarCadastro').addEventListener('click', e => {
        e.preventDefault();
        loginForm.style.display = 'none';
        cadastroForm.style.display = 'block';
    });

    getById('mostrarLogin').addEventListener('click', e => {
        e.preventDefault();
        cadastroForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Evento botão de cadastro
    getById('botaoCadastro').addEventListener('click', async () => {
        const nome = getById('novoUsuario').value.trim();
        const email = getById('novoEmail').value.trim();
        const senha = getById('novaSenha').value.trim();

        if (!nome || !email || !senha) {
            alert('Preencha todos os campos!');
            return;
        }

        const sucesso = await salvarConta(nome, email, senha);
        if (sucesso) {
            getById('novoUsuario').value = '';
            getById('novoEmail').value = '';
            getById('novaSenha').value = '';
            cadastroForm.style.display = 'none';
            loginForm.style.display = 'block';
        }
    });

    // Evento botão de login
    getById('botaoLogin').addEventListener('click', async () => {
        const email = getById('email').value.trim();
        const senha = getById('senha').value.trim();

        if (!email || !senha) {
            alert('Preencha todos os campos!');
            return;
        }

        if (await verificarLogin(email, senha)) {
            getById('autenticacao').style.display = 'none';
            getById('menuNavegacao').style.display = 'block';
            getById('areaPrincipal').style.display = 'block';
            listarPostagens();
            mostrarUsuarioLogado();
        }
    });

    // Evento botão nova postagem
    const botaoNovaPostagem = getById('botaoNovaPostagem');
    if (botaoNovaPostagem) {
        botaoNovaPostagem.addEventListener('click', incluirPostagem);
    }

  
    if (localStorage.getItem('token')) {
        getById('autenticacao').style.display = 'none';
        getById('menuNavegacao').style.display = 'block';
        getById('areaPrincipal').style.display = 'block';
        listarPostagens();
        mostrarUsuarioLogado();
    }
});

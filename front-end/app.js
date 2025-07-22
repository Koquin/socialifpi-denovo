// socialifpi/front-end/app.js

"use strict";

// acessível globalmente
function performLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("username");
    alert("Você foi desconectado.");
    location.reload();
}

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
    let idPostagemParaExcluir = null;

    // Elementos do Modal de Compartilhamento
    const modalCompartilhar = document.getElementById('modalCompartilhar');
    const inputRespostaCompartilhamento = document.getElementById('inputRespostaCompartilhamento');
    const confirmarCompartilhamentoBtn = document.getElementById('confirmarCompartilhamento');
    const cancelarCompartilhamentoBtn = document.getElementById('cancelarCompartilhamento');

    // Elementos do Modal de Confirmação de Exclusão
    const modalConfirmacaoExclusao = document.getElementById('modalConfirmacaoExclusao');
    const confirmarExclusaoBtn = document.getElementById('confirmarExclusao');
    const cancelarExclusaoBtn = document.getElementById('cancelarExclusao');


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
                const erroData = await resposta.json(); // Tenta ler mensagem de erro do servidor
                throw new Error(erroData.mensagem || "Erro ao cadastrar usuário.");
            }

            alert("Cadastro realizado com sucesso! Faça login.");
            cadastroForm.style.display = "none";
            loginForm.style.display = "block";
        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            alert(`Erro ao cadastrar usuário: ${erro.message}`);
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
                localStorage.setItem("username", dados.nome || dados.email); // Armazena o nome/email para exibir

                mostrarAreaPrincipal(dados.token);
            } else {
                alert(dados.mensagem || "Credenciais inválidas."); // Usa mensagem do backend
            }
        } catch (erro) {
            console.error("Erro ao realizar login:", erro);
            alert(`Erro ao realizar login: ${erro.message}`);
        }
    });

    // NOVA POSTAGEM
    botaoNovaPostagem.addEventListener("click", async () => {
        const titulo = document.getElementById("titulo").value;
        const conteudo = document.getElementById("conteudo").value;

        const autorId = localStorage.getItem("id");
        if (!autorId) {
            alert("Erro: ID do autor não encontrado. Por favor, faça login novamente.");
            return;
        }

        try {
            const resposta = await fetch(endpointPostagens, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    titulo,
                    conteudo,
                    autor: autorId
                }),
            });
            console.log("Resposta da criação de postagem:", resposta);
            if (!resposta.ok) {
                const erroData = await resposta.json();
                throw new Error(erroData.mensagem || "Erro ao criar postagem.");
            }

            alert("Postagem criada com sucesso!");

            document.getElementById("titulo").value = "";
            document.getElementById("conteudo").value = "";
            listarPostagens();
        } catch (erro) {
            console.error(erro);
            alert("Erro ao criar postagem.");
        }
    });

    // LISTAR POSTAGENS
    async function listarPostagens(nomeFiltro = "") {
        try {
            const resposta = await fetch(endpointPostagens, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!resposta.ok) {
                if (resposta.status === 401 || resposta.status === 403) {
                    alert("Sessão expirada ou inválida. Por favor, faça login novamente.");
                    performLogout();
                    return;
                }
                throw new Error(`HTTP error! status: ${resposta.status}`);
            }

            const postagens = await resposta.json();

            const container = document.getElementById("postagens");
            container.innerHTML = ""; // Limpa todo o conteúdo, incluindo o h2 (se presente, mas o HTML já tem o h2)

            const nomeFiltroLower = nomeFiltro.toLowerCase();
            const usuarioLogadoId = localStorage.getItem('id');

            postagens
                .filter(postagem => {
                    // Ajustado para filtrar por autor da postagem OU autor da postagem compartilhada
                    const nomeAutor = postagem.autor?.nome?.toLowerCase() || "";
                    const nomeOriginalCompartilhada = postagem.compartilhadaDe?.autor?.nome?.toLowerCase() || "";
                    return nomeAutor.includes(nomeFiltroLower) || nomeOriginalCompartilhada.includes(nomeFiltroLower);
                })
                .forEach((postagem) => {
                    const article = document.createElement("article");
                    article.className = 'post-item';
                    article.dataset.postId = postagem._id;
                    // Mantendo estilos inline para não mudar o CSS existente
                    article.style.cssText = `
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        padding: 15px;
                        margin-bottom: 15px;
                    `;

                    const titulo = document.createElement("h3");
                    const conteudo = document.createElement("p");
                    const data = document.createElement("small");
                    const infoAutor = document.createElement("p");
                    const originalPostDiv = document.createElement("div"); // Para a citação do post original

                    const compartilhada = postagem.compartilhadaDe != null;

                    const nomeAutor = postagem.autor?.nome || "Desconhecido";
                    const nomeOriginal = postagem.compartilhadaDe?.autor?.nome || "Desconhecido"; // Autor da postagem original
                    const tituloOriginal = postagem.compartilhadaDe?.titulo || "";
                    const conteudoOriginal = postagem.compartilhadaDe?.conteudo || "";

                    // Lógica para o título e conteúdo da postagem (compartilhada ou original)
                    titulo.textContent = compartilhada
                        ? `[Compartilhado] ${tituloOriginal}`
                        : postagem.titulo;
                    conteudo.textContent = compartilhada ? postagem.resposta || '' : postagem.conteudo;


                    data.textContent = new Date(postagem.createdAt || postagem.data).toLocaleString();
                    infoAutor.textContent = `Autor: ${nomeAutor}`;

                    // Adiciona a citação da postagem original se for compartilhada
                    if (compartilhada && postagem.compartilhadaDe) {
                        originalPostDiv.className = 'original-post-quote';
                        originalPostDiv.style.cssText = `
                            border-left: 3px solid #ddd;
                            padding-left: 10px;
                            margin-top: 10px;
                            font-style: italic;
                            color: #666;
                        `;
                        originalPostDiv.innerHTML = `
                            <p><strong>Original de ${nomeOriginal}:</strong></p>
                            <p>${tituloOriginal}</p>
                            <p>${conteudoOriginal}</p>
                        `;
                        article.appendChild(originalPostDiv);
                    }

                    article.append(titulo, conteudo, data, infoAutor);

                    // --- SEÇÃO DE BOTÕES (CURTIR, COMENTÁRIOS, COMPARTILHAR, EXCLUIR) ---
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.cssText = `
                        display: flex;
                        gap: 10px; /* Espaçamento entre os botões */
                        margin-top: 15px;
                        flex-wrap: wrap; /* Para garantir que os botões quebrem linha se não houver espaço */
                        justify-content: flex-start; /* Alinhar à esquerda por padrão */
                    `;

                    // Botão Curtir
                    const botaoCurtir = document.createElement("button");
                    // Verifica se o ID do usuário logado está no array de curtidas da postagem
                    const hasLiked = postagem.curtidas && postagem.curtidas.includes(usuarioLogadoId);
                    botaoCurtir.textContent = `Curtir (${postagem.curtidas ? postagem.curtidas.length : 0})`;
                    botaoCurtir.dataset.postId = postagem._id;
                    botaoCurtir.addEventListener("click", toggleLike);
                    botaoCurtir.style.cssText = `
                        background-color: ${hasLiked ? '#6f42c1' : '#fd7e14'}; /* Roxo se curtiu, Laranja se não */
                        color: white;
                        padding: 8px 12px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    `;
                    botaoCurtir.onmouseover = function () { this.style.backgroundColor = hasLiked ? '#5b37a3' : '#e66400'; };
                    botaoCurtir.onmouseout = function () { this.style.backgroundColor = hasLiked ? '#6f42c1' : '#fd7e14'; };
                    buttonContainer.appendChild(botaoCurtir);


                    const botaoComentarios = document.createElement('button');
                    botaoComentarios.textContent = 'Comentários';
                    botaoComentarios.dataset.postId = postagem._id;
                    botaoComentarios.addEventListener('click', toggleCommentsSection);
                    botaoComentarios.style.cssText = `
                        background-color: #007bff; /* Cor azul */
                        color: white;
                        padding: 8px 12px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    `;
                    botaoComentarios.onmouseover = function () { this.style.backgroundColor = '#0056b3'; };
                    botaoComentarios.onmouseout = function () { this.style.backgroundColor = '#007bff'; };
                    buttonContainer.appendChild(botaoComentarios);


                    const botaoCompartilhar = document.createElement("button");
                    botaoCompartilhar.textContent = "Compartilhar";
                    botaoCompartilhar.addEventListener("click", () => abrirModalCompartilhar(postagem._id));
                    botaoCompartilhar.style.cssText = `
                        background-color: #28a745; /* Cor verde */
                        color: white;
                        padding: 8px 12px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    `;
                    botaoCompartilhar.onmouseover = function () { this.style.backgroundColor = '#218838'; };
                    botaoCompartilhar.onmouseout = function () { this.style.backgroundColor = '#28a745'; };
                    buttonContainer.appendChild(botaoCompartilhar);


                    // Botão de Excluir (visível apenas para o autor)
                    if (postagem.autor && postagem.autor._id === usuarioLogadoId) {
                        const botaoExcluir = document.createElement("button");
                        botaoExcluir.textContent = "Excluir";
                        botaoExcluir.dataset.postId = postagem._id;
                        botaoExcluir.addEventListener("click", (e) => {
                            abrirModalConfirmacaoExclusao(e.target.dataset.postId);
                        });
                        botaoExcluir.style.cssText = `
                            background-color: #dc3545; /* Cor vermelha */
                            color: white;
                            padding: 8px 12px;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            transition: background-color 0.2s;
                        `;
                        botaoExcluir.onmouseover = function () { this.style.backgroundColor = '#c82333'; };
                        botaoExcluir.onmouseout = function () { this.style.backgroundColor = '#dc3545'; };
                        buttonContainer.appendChild(botaoExcluir);
                    }

                    article.appendChild(buttonContainer);


                    const commentsSection = document.createElement('div');
                    commentsSection.className = 'comments-section';
                    commentsSection.id = `comments-for-${postagem._id}`;
                    commentsSection.style.display = 'none';
                    commentsSection.style.cssText = `
                        margin-top: 15px;
                        padding-top: 10px;
                        border-top: 1px solid #eee;
                    `;

                    commentsSection.innerHTML = `
                        <h4 style="margin-bottom: 10px; color: #333;">Comentários</h4>
                        <div class="add-comment-form" style="margin-bottom: 15px;">
                            <textarea id="commentContent-${postagem._id}" placeholder="Escreva seu comentário aqui..." rows="2" style="
                                width: calc(100% - 20px);
                                padding: 8px;
                                border: 1px solid #ccc;
                                border-radius: 4px;
                                margin-bottom: 8px;
                                resize: vertical;
                            "></textarea>
                            <button class="submit-comment-btn" data-post-id="${postagem._id}" style="
                                background-color: #6c757d; /* Cor cinza */
                                color: white;
                                padding: 8px 12px;
                                border: none;
                                border-radius: 5px;
                                cursor: pointer;
                                transition: background-color 0.2s;
                            ">Comentar</button>
                        </div>
                        <div class="comments-list" id="commentsList-${postagem._id}"></div>
                    `;

                    article.appendChild(commentsSection);
                    container.appendChild(article);
                });

            document.querySelectorAll('.submit-comment-btn').forEach(button => {
                button.addEventListener('click', addComment);
            });

        } catch (erro) {
            console.error("Erro ao listar postagens:", erro);
        }
    }

    // LOGOUT
    botaoLogout.addEventListener("click", () => {
        performLogout();
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
            // Use o nome do usuário armazenado no localStorage, se não tiver, use o email
            usuarioLogado.textContent = `Olá, ${localStorage.getItem('username') || payload.email}!`;
        } catch {
            usuarioLogado.textContent = "Olá, usuário!";
        }

        listarPostagens();
    }

    // --- FUNÇÕES DE COMPARTILHAMENTO ---
    async function compartilharPostagem(idPostagem, respostaTexto) {
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
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    id: idUsuario,
                    resposta: respostaTexto
                })
            });

            if (!respostaServidor.ok) {
                const erro = await respostaServidor.json();
                if (respostaServidor.status === 401 || respostaServidor.status === 403) {
                    alert('Sessão expirada ou inválida. Por favor, faça login novamente.');
                    performLogout();
                    return;
                }
                throw new Error(erro.mensagem || "Erro ao compartilhar.");
            }

            alert("Postagem compartilhada com sucesso!");
            listarPostagens();
            document.getElementById("modalCompartilhar").style.display = "none";
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

    function fecharModalCompartilhar() {
        document.getElementById("modalCompartilhar").style.display = "none";
        idPostagemParaCompartilhar = null;
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

    // Função para mostrar/esconder a seção de comentários e carregar os comentários
    async function toggleCommentsSection(event) {
        const postId = event.target.dataset.postId;
        const commentsSection = document.getElementById(`comments-for-${postId}`);

        if (commentsSection && commentsSection.style.display === 'none') {
            commentsSection.style.display = 'block';
            await loadCommentsForPost(postId);
        } else if (commentsSection) {
            commentsSection.style.display = 'none';
        }
    }

    // Função para carregar comentários de uma postagem específica
    async function loadCommentsForPost(postId) {
        const commentsListDiv = document.getElementById(`commentsList-${postId}`);
        if (!commentsListDiv) return;

        commentsListDiv.innerHTML = '<p style="color: #666;">Carregando comentários...</p>';
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${endpointPostagens}/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou inválida. Por favor, faça login novamente.');
                    performLogout();
                    return;
                }
                throw new Error(`Erro ao carregar comentários: ${response.statusText}`);
            }
            const postData = await response.json();
            let comments = postData.comentarios || postData.comments || []; // Ajuste para `comentarios`

            // Ordenar comentários por data decrescente
            comments.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime();
            });

            commentsListDiv.innerHTML = '';
            if (comments.length === 0) {
                commentsListDiv.innerHTML = '<p style="color: #888; font-style: italic;">Nenhum comentário ainda.</p>';
                return;
            }

            comments.forEach(comment => {
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment-item';
                commentDiv.style.cssText = `
                    background-color: #f8f9fa; /* Um cinza bem claro */
                    border-radius: 6px;
                    padding: 10px;
                    margin-bottom: 8px;
                    border: 1px solid #e9ecef; /* Borda sutil */
                `;
                commentDiv.innerHTML = `
                    <p style="font-weight: bold; color: #343a40; margin-bottom: 3px;">${comment.autor || 'Anônimo'}</p>
                    <p style="color: #6c757d; font-size: 0.85em; margin-bottom: 5px;">${new Date(comment.date).toLocaleString()}</p>
                    <p style="color: #495057;">${comment.body}</p>
                `;
                commentsListDiv.appendChild(commentDiv);
            });

        } catch (error) {
            console.error('Erro ao carregar comentários para postagem', postId, ':', error);
            commentsListDiv.innerHTML = '<p style="color: #dc3545;">Erro ao carregar comentários.</p>';
        }
    }

    // Função para adicionar um novo comentário
    async function addComment(event) {
        const postId = event.target.dataset.postId;
        const commentContentInput = document.getElementById(`commentContent-${postId}`);

        const content = commentContentInput ? commentContentInput.value.trim() : '';
        const author = localStorage.getItem('username'); // Pega o nome de usuário do localStorage

        if (!content) {
            alert('O comentário não pode estar vazio.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para comentar.');
            performLogout();
            return;
        }
        if (!author) {
            alert('Seu nome de usuário não foi encontrado. Por favor, faça login novamente.');
            performLogout();
            return;
        }


        try {
            const response = await fetch(`${endpointPostagens}/${postId}/comentarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    body: content,
                    autor: author, // Envia o nome do autor do comentário
                    date: new Date().toISOString()
                }),
            });

            if (response.ok) {
                alert('Comentário adicionado com sucesso!');
                if (commentContentInput) commentContentInput.value = '';
                await loadCommentsForPost(postId); // Recarrega os comentários
            } else {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou inválida. Por favor, faça login novamente.');
                    performLogout();
                    return;
                }
                alert(`Erro ao adicionar comentário: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro na requisição para adicionar comentário:', error);
            alert('Ocorreu um erro ao tentar adicionar o comentário.');
        }
    }

    // --- FUNÇÕES PARA O MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ---
    function abrirModalConfirmacaoExclusao(postId) {
        idPostagemParaExcluir = postId;
        modalConfirmacaoExclusao.style.display = 'flex';
    }

    function fecharModalConfirmacaoExclusao() {
        modalConfirmacaoExclusao.style.display = 'none';
        idPostagemParaExcluir = null;
    }

    confirmarExclusaoBtn.addEventListener('click', async () => {
        if (idPostagemParaExcluir) {
            await excluirPostagem(idPostagemParaExcluir);
            fecharModalConfirmacaoExclusao();
        }
    });

    cancelarExclusaoBtn.addEventListener('click', fecharModalConfirmacaoExclusao);

    async function excluirPostagem(postId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para excluir postagens.');
            performLogout();
            return;
        }

        try {
            const response = await fetch(`${endpointPostagens}/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Postagem excluída com sucesso!');
                listarPostagens(); // Recarrega a lista de postagens
            } else {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou inválida. Você não tem permissão para excluir esta postagem ou sua sessão expirou. Por favor, faça login novamente.');
                    performLogout();
                } else {
                    alert(`Erro ao excluir postagem: ${errorData.message || response.statusText}`);
                }
            }
        } catch (error) {
            console.error('Erro na requisição de exclusão:', error);
            alert('Ocorreu um erro ao tentar excluir a postagem.');
        }
    }

    // --- NOVA FUNÇÃO: TOGGLE DE CURTIDA ---
    async function toggleLike(event) {
        const button = event.target;
        const postId = button.dataset.postId;
        const userId = localStorage.getItem('id'); // ID do usuário logado
        console.log(`ID do usuário logado: ${userId}, Post ID: ${postId}`);
        if (!userId) {
            alert("Você precisa estar logado para curtir postagens.");
            performLogout();
            return;
        }

        const token = localStorage.getItem('token');
        console.log(`Token do usuário: ${token}`);
        if (!token) {
            alert('Sessão inválida. Faça login novamente.');
            performLogout();
            return;
        }

        try {
            console.log(`Tentando curtir/descurtir a postagem com ID: ${postId} pelo usuário: ${userId}`);
            const response = await fetch(`${endpointPostagens}/${postId}/curtir`, {
                method: 'POST', // Usamos POST para alternar (toggle) no backend
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: userId }) // O backend espera o userId no body
            });
            console.log(`Resposta do servidor: ${JSON.stringify(response)}`);
            if (response.ok) {
                const data = await response.json();
                // Atualiza o texto do botão para refletir o novo estado e contagem
                button.textContent = `Curtir (${data.likesCount})`; // Apenas "Curtir" e a contagem
                // Atualiza a cor de fundo do botão baseada no estado 'liked'
                if (data.action === 'liked') {
                    button.style.backgroundColor = '#6f42c1'; // Roxo
                    button.onmouseover = function () { this.style.backgroundColor = '#5b37a3'; };
                    button.onmouseout = function () { this.style.backgroundColor = '#6f42c1'; };
                } else {
                    button.style.backgroundColor = '#fd7e14'; // Laranja
                    button.onmouseover = function () { this.style.backgroundColor = '#e66400'; };
                    button.onmouseout = function () { this.style.backgroundColor = '#fd7e14'; };
                }
            } else {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou inválida. Por favor, faça login novamente.');
                    performLogout();
                } else {
                    alert(`Erro ao curtir/descurtir: ${errorData.message || response.statusText}`);
                }
            }
        } catch (error) {
            console.error('Erro na requisição de curtir:', error);
            alert('Ocorreu um erro ao tentar curtir/descurtir a postagem.');
        }
    }
});
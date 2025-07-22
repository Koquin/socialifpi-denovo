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

    // --- Elementos HTML ---
    const loginForm = document.getElementById("loginForm");
    const cadastroForm = document.getElementById("cadastroForm");
    const areaPrincipal = document.getElementById("areaPrincipal");
    const autenticacao = document.getElementById("autenticacao");
    const usuarioLogado = document.getElementById("usuarioLogado");
    const menuNavegacao = document.getElementById("menuNavegacao"); // Menu lateral
    const btnMenu = document.getElementById('btnMenu'); // Botão hambúrguer

    // --- Seções de conteúdo ---
    const sobreNosSection = document.getElementById("sobreNos");
    const contatoSection = document.getElementById("contato");

    // --- Botões Principais ---
    const botaoLogin = document.getElementById("botaoLogin");
    const botaoCadastro = document.getElementById("botaoCadastro");
    const botaoNovaPostagem = document.getElementById("botaoNovaPostagem");
    const botaoLogout = document.getElementById("botaoLogout"); // Botão Sair dentro do menu lateral

    // --- Links de Navegação (dentro do menu lateral) ---
    const linkHome = document.getElementById("linkHome");
    const linkSobre = document.getElementById("linkSobre");
    const linkContato = document.getElementById("linkContato");

    // --- Variáveis de Estado para Modais e Ações ---
    let idPostagemParaCompartilhar = null;
    let idPostagemParaExcluir = null;

    // --- Elementos do Modal de Compartilhamento ---
    const modalCompartilhar = document.getElementById('modalCompartilhar');
    const inputRespostaCompartilhamento = document.getElementById('inputRespostaCompartilhamento');
    const confirmarCompartilhamentoBtn = document.getElementById('confirmarCompartilhamento');
    const cancelarCompartilhamentoBtn = document.getElementById('cancelarCompartilhamento');

    // --- Elementos do Modal de Confirmação de Exclusão ---
    const modalConfirmacaoExclusao = document.getElementById('modalConfirmacaoExclusao');
    const confirmarExclusaoBtn = document.getElementById('confirmarExclusao');
    const cancelarExclusaoBtn = document.getElementById('cancelarExclusao');


    // --- Configuração Inicial ---
    // O menu lateral e o botão de logout são controlados via classes e eventos agora
    // menuNavegacao.style.display = "none"; // Removido, controlado por .menu-lateral.aberto
    // botaoLogout.style.display = "none"; // Removido, controlado pelo menu lateral

    // Esconder todas as seções de conteúdo inicialmente
    function esconderTodasAsSecoesDeConteudo() {
        areaPrincipal.style.display = 'none';
        sobreNosSection.style.display = 'none';
        contatoSection.style.display = 'none';
        autenticacao.style.display = 'none'; // A autenticação pode ser mostrada separadamente
    }
    esconderTodasAsSecoesDeConteudo(); // Garante que tudo esteja oculto ao carregar


    // --- Lógica do Menu Lateral ---
    btnMenu.addEventListener('click', (event) => {
        event.stopPropagation(); // Evita que o clique se propague e feche o menu
        menuNavegacao.classList.toggle('aberto');
    });

    // Fechar o menu lateral ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (!menuNavegacao.contains(event.target) && !btnMenu.contains(event.target)) {
            menuNavegacao.classList.remove('aberto');
        }
    });

    // Evitar que o clique dentro do menu o feche
    menuNavegacao.addEventListener('click', (event) => {
        event.stopPropagation();
    });


    // --- Lógica de Navegação para as Seções (Home, Sobre, Contato) ---
    linkHome.addEventListener("click", function (e) {
        e.preventDefault();
        esconderTodasAsSecoesDeConteudo();
        menuNavegacao.classList.remove('aberto'); // Fecha o menu
        mostrarAreaPrincipal(localStorage.getItem("token")); // Reexibe a área principal
    });

    linkSobre.addEventListener("click", function (event) {
        event.preventDefault();
        esconderTodasAsSecoesDeConteudo();
        sobreNosSection.style.display = "flex"; // Usar flex para sobreNos para centralização e gap
        menuNavegacao.classList.remove('aberto'); // Fecha o menu
    });

    // Botão Fechar da seção Sobre Nós
    const fecharSobreBtn = document.getElementById("fecharSobre");
    fecharSobreBtn.addEventListener("click", function () {
        esconderTodasAsSecoesDeConteudo();
        mostrarAreaPrincipal(localStorage.getItem("token")); // Volta para a área principal
    });

    linkContato.addEventListener('click', e => {
        e.preventDefault();
        esconderTodasAsSecoesDeConteudo();
        contatoSection.style.display = 'flex'; // Usar flex para contato
        menuNavegacao.classList.remove('aberto'); // Fecha o menu
    });

    // Botão Fechar da seção Contato
    const fecharContatoBtn = document.getElementById('fecharContato');
    fecharContatoBtn.addEventListener('click', () => {
        esconderTodasAsSecoesDeConteudo();
        mostrarAreaPrincipal(localStorage.getItem("token")); // Volta para a área principal
    });


    // --- Alternar entre Login e Cadastro ---
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

    // --- Verificação de Token ao Carregar a Página ---
    const token = localStorage.getItem("token");
    if (token) {
        mostrarAreaPrincipal(token);
    } else {
        autenticacao.style.display = 'flex'; // Mostra a seção de autenticação se não houver token
    }

    // --- Event Listeners do Filtro ---
    document.getElementById("botaoFiltrar").addEventListener("click", () => {
        const nome = document.getElementById("filtroUsuario").value.trim();
        listarPostagens(nome);
    });

    document.getElementById("botaoLimparFiltro").addEventListener("click", () => {
        document.getElementById("filtroUsuario").value = "";
        listarPostagens();
    });


    // --- CADASTRO de Usuário ---
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
                const erroData = await resposta.json();
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

    // --- LOGIN de Usuário ---
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
                localStorage.setItem("username", dados.nome || dados.email);

                mostrarAreaPrincipal(dados.token);
            } else {
                alert(dados.mensagem || "Credenciais inválidas.");
            }
        } catch (erro) {
            console.error("Erro ao realizar login:", erro);
            alert(`Erro ao realizar login: ${erro.message}`);
        }
    });

    // --- CRIAR NOVA POSTAGEM ---
    botaoNovaPostagem.addEventListener("click", async () => {
        const titulo = document.getElementById("titulo").value;
        const conteudo = document.getElementById("conteudo").value;

        if (!titulo || !conteudo) {
            alert("Título e conteúdo são obrigatórios!");
            return;
        }

        const autorId = localStorage.getItem("id");
        if (!autorId) {
            alert("Erro: ID do autor não encontrado. Por favor, faça login novamente.");
            performLogout();
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
            console.error("Erro ao criar postagem:", erro);
            alert(`Erro ao criar postagem: ${erro.message}`);
        }
    });
    // LISTAR POSTAGENS
    async function listarPostagens(nomeFiltro = "") {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                performLogout();
                return;
            }

            const resposta = await fetch(endpointPostagens, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
            container.querySelectorAll('.author-stories-container').forEach(el => el.remove());


            const nomeFiltroLower = nomeFiltro.toLowerCase();
            const usuarioLogadoId = localStorage.getItem('id');

            // Agrupar postagens por autor antes de renderizar
            const postsAgrupadosPorAutor = postagens.reduce((acc, postagem) => {
                const autorId = postagem.autor?._id;
                const autorNome = postagem.autor?.nome || "Desconhecido";

                const autorOriginalNome = postagem.compartilhadaDe?.autor?.nome || "";

                if (nomeFiltroLower && !(autorNome.toLowerCase().includes(nomeFiltroLower) || autorOriginalNome.toLowerCase().includes(nomeFiltroLower))) {
                    return acc;
                }

                if (autorId) {
                    if (!acc[autorId]) {
                        acc[autorId] = { name: autorNome, posts: [] };
                    }
                    acc[autorId].posts.push(postagem);
                }
                return acc;
            }, {});

            // Renderizar cada grupo de posts como um carrossel de stories
            Object.values(postsAgrupadosPorAutor).forEach(grupoAutor => {
                const authorStoriesContainer = document.createElement('div');
                authorStoriesContainer.classList.add('author-stories-container');

                const authorTitle = document.createElement('h3');
                authorTitle.textContent = `Posts de ${grupoAutor.name}`;
                authorStoriesContainer.appendChild(authorTitle);

                const storiesWrapper = document.createElement('div');
                storiesWrapper.classList.add('stories-wrapper');

                const carousel = document.createElement('div');
                carousel.classList.add('posts-carousel');
                carousel.id = `carousel-${grupoAutor.posts[0].autor._id}`;

                grupoAutor.posts.forEach((postagem) => {
                    const article = document.createElement("article");
                    article.className = 'post-item';
                    article.dataset.postId = postagem._id;

                    const tituloElement = document.createElement("h3");
                    const conteudoElement = document.createElement("p");
                    const metaInfoDiv = document.createElement("div");
                    const dataElement = document.createElement("small");
                    const autorElement = document.createElement("span");
                    const botoesDiv = document.createElement("div");

                    metaInfoDiv.classList.add('meta-info');
                    autorElement.classList.add('autor');
                    dataElement.classList.add('data');
                    botoesDiv.classList.add('botoes-postagem'); // Classe para o container dos botões


                    const compartilhada = postagem.compartilhadaDe != null;
                    const nomeAutor = postagem.autor?.nome || "Desconhecido"; // Quem criou/compartilhou esta entrada
                    const nomeOriginal = postagem.compartilhadaDe?.autor?.nome || "Desconhecido"; // Autor do post original se for compartilhado
                    const tituloOriginal = postagem.compartilhadaDe?.titulo || "";
                    const conteudoOriginal = postagem.compartilhadaDe?.conteudo || "";

                    tituloElement.textContent = compartilhada
                        ? `[Compartilhado] ${tituloOriginal}`
                        : postagem.titulo;

                    conteudoElement.textContent = compartilhada ? postagem.resposta || '' : postagem.conteudo;


                    dataElement.textContent = new Date(postagem.createdAt || postagem.data).toLocaleString();
                    autorElement.textContent = compartilhada
                        ? `Compartilhado de: ${nomeOriginal}`
                        : `Autor: ${nomeAutor}`;
                    metaInfoDiv.appendChild(autorElement);
                    metaInfoDiv.appendChild(dataElement);


                    if (compartilhada && postagem.compartilhadaDe) {
                        const originalPostQuote = document.createElement("blockquote");
                        originalPostQuote.innerHTML = `
                        <p style="font-size: 0.95em; margin-bottom: 5px; color: #444;"><strong>Conteúdo Original:</strong></p>
                        <p style="margin-bottom: 8px; font-size: 0.9em; color: var(--cor-texto-secundario);">${postagem.compartilhadaDe.conteudo}</p>
                        <small style="display: block; text-align: right; font-size: 0.8em; color: #777;">De: ${nomeOriginal} em ${new Date(postagem.compartilhadaDe.createdAt || postagem.compartilhadaDe.data).toLocaleString()}</small>
                        `;
                        article.appendChild(originalPostQuote);
                    }

                    article.append(tituloElement, conteudoElement, metaInfoDiv);


                    // --- Botões de Ação (ESTILOS INLINE APLICADOS AQUI) ---
                    // Base para estilos de botão (sem transição de background-color aqui, será no hover)
                    const buttonBaseStyle = `
                    padding: 10px 18px;
                    border: none;
                    border-radius: 0.75rem;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: transform 0.2s ease, box-shadow 0.3s ease, background-color 0.3s ease; /* Transição para background-color tb */
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    color: white;
                    flex-shrink: 0;
                    `;
                    const buttonHoverStyleProps = `transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);`;
                    const buttonOutStyleProps = `transform: translateY(0); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);`;

                    // Botão Curtir
                    const botaoCurtir = document.createElement("button");
                    const hasLiked = postagem.curtidas && postagem.curtidas.includes(usuarioLogadoId);
                    botaoCurtir.textContent = `Curtir (${postagem.curtidas ? postagem.curtidas.length : 0})`;
                    botaoCurtir.dataset.postId = postagem._id;
                    botaoCurtir.addEventListener("click", toggleLike);
                    if (hasLiked) {
                        botaoCurtir.style.cssText = `${buttonBaseStyle} background-color: #6f42c1;`; // Roxo
                        botaoCurtir.onmouseover = function () { this.style.backgroundColor = '#5b37a3'; this.style.cssText += buttonHoverStyleProps; };
                        botaoCurtir.onmouseout = function () { this.style.backgroundColor = '#6f42c1'; this.style.cssText += buttonOutStyleProps; };
                    } else {
                        botaoCurtir.style.cssText = `${buttonBaseStyle} background-color: #fd7e14;`; // Laranja
                        botaoCurtir.onmouseover = function () { this.style.backgroundColor = '#e66400'; this.style.cssText += buttonHoverStyleProps; };
                        botaoCurtir.onmouseout = function () { this.style.backgroundColor = '#fd7e14'; this.style.cssText += buttonOutStyleProps; };
                    }
                    botoesDiv.appendChild(botaoCurtir);


                    const botaoComentarios = document.createElement('button');
                    botaoComentarios.textContent = 'Comentários';
                    botaoComentarios.dataset.postId = postagem._id;
                    botaoComentarios.addEventListener('click', toggleCommentsSection);
                    botaoComentarios.style.cssText = `${buttonBaseStyle} background-color: #007bff;`; // Azul
                    botaoComentarios.onmouseover = function () { this.style.backgroundColor = '#0056b3'; this.style.cssText += buttonHoverStyleProps; };
                    botaoComentarios.onmouseout = function () { this.style.backgroundColor = '#007bff'; this.style.cssText += buttonOutStyleProps; };
                    botoesDiv.appendChild(botaoComentarios);


                    const botaoCompartilhar = document.createElement("button");
                    botaoCompartilhar.textContent = "Compartilhar";
                    botaoCompartilhar.addEventListener("click", () => abrirModalCompartilhar(postagem._id));
                    botaoCompartilhar.style.cssText = `${buttonBaseStyle} background-color: #28a745;`; // Verde
                    botaoCompartilhar.onmouseover = function () { this.style.backgroundColor = '#218838'; this.style.cssText += buttonHoverStyleProps; };
                    botaoCompartilhar.onmouseout = function () { this.style.backgroundColor = '#28a745'; this.style.cssText += buttonOutStyleProps; };
                    botoesDiv.appendChild(botaoCompartilhar);


                    // Botões de Editar e Excluir (apenas para o autor da postagem)
                    if (postagem.autor && postagem.autor._id === usuarioLogadoId) {
                        const botaoEditar = document.createElement("button");
                        botaoEditar.textContent = "Editar";
                        botaoEditar.style.cssText = `${buttonBaseStyle} background-color: #ffc107; color: #0D1B2A;`; // Amarelo, texto escuro
                        botaoEditar.addEventListener('click', () => {
                            alert('Funcionalidade de edição em desenvolvimento!');
                        });
                        botaoEditar.onmouseover = function () { this.style.backgroundColor = '#e0a800'; this.style.cssText += buttonHoverStyleProps; };
                        botaoEditar.onmouseout = function () { this.style.backgroundColor = '#ffc107'; this.style.cssText += buttonOutStyleProps; };
                        botoesDiv.appendChild(botaoEditar);

                        const botaoExcluir = document.createElement("button");
                        botaoExcluir.textContent = "Excluir";
                        botaoExcluir.dataset.postId = postagem._id;
                        botaoExcluir.addEventListener("click", (e) => {
                            abrirModalConfirmacaoExclusao(e.target.dataset.postId);
                        });
                        botaoExcluir.style.cssText = `${buttonBaseStyle} background-color: #dc3545;`; // Vermelho
                        botaoExcluir.onmouseover = function () { this.style.backgroundColor = '#c82333'; this.style.cssText += buttonHoverStyleProps; };
                        botaoExcluir.onmouseout = function () { this.style.backgroundColor = '#dc3545'; this.style.cssText += buttonOutStyleProps; };
                        botoesDiv.appendChild(botaoExcluir);
                    }

                    article.appendChild(botoesDiv);

                    const commentsSection = document.createElement('div');
                    commentsSection.classList.add('comments-section');
                    commentsSection.id = `comments-for-${postagem._id}`;
                    commentsSection.style.display = 'none';

                    // Estilos inline para os elementos internos da seção de comentários
                    // Botão de comentar no formulário interno
                    const submitCommentButtonStyle = `
                    background-color: #6c757d; /* Cor cinza */
                    color: white;
                    padding: 8px 12px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                `;
                    const submitCommentButtonHoverStyle = `background-color: #5a6268;`;

                    commentsSection.innerHTML = `
                    <h4 style="margin-bottom: 10px; color: #333;">Comentários</h4>
                    <div class="add-comment-form" style="margin-bottom: 15px;">
                        <textarea id="commentContent-${postagem._id}" placeholder="Escreva seu comentário aqui..." rows="2" style="
                            width: calc(100% - 20px); /* Ajustado para deixar espaço para o padding */
                            padding: 8px;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            margin-bottom: 8px;
                            resize: vertical;
                        "></textarea>
                        <button class="submit-comment-btn" data-post-id="${postagem._id}" style="${submitCommentButtonStyle}">Comentar</button>
                    </div>
                    <div class="comments-list" id="commentsList-${postagem._id}"></div>
                `;
                    // Anexa evento hover/out ao botão de comentar interno
                    const submitBtn = commentsSection.querySelector('.submit-comment-btn');
                    if (submitBtn) {
                        submitBtn.onmouseover = function () { this.style.backgroundColor = submitCommentButtonHoverStyle; };
                        submitBtn.onmouseout = function () { this.style.backgroundColor = '#6c757d'; };
                    }

                    article.appendChild(commentsSection);

                    carousel.appendChild(article);
                });

                // Botões de Navegação do Carrossel (esses já eram estilizados com classes)
                const prevButton = document.createElement('button');
                prevButton.textContent = '←';
                prevButton.classList.add('nav-button', 'prev');
                prevButton.dataset.carouselId = carousel.id;
                prevButton.addEventListener('click', navigateCarousel);

                const nextButton = document.createElement('button');
                nextButton.textContent = '→';
                nextButton.classList.add('nav-button', 'next');
                nextButton.dataset.carouselId = carousel.id;
                nextButton.addEventListener('click', navigateCarousel);

                storiesWrapper.append(prevButton, carousel, nextButton);
                authorStoriesContainer.appendChild(storiesWrapper);
                container.appendChild(authorStoriesContainer);
            });

            document.querySelectorAll('.submit-comment-btn').forEach(button => {
                button.addEventListener('click', addComment);
            });

        } catch (erro) {
            console.error("Erro ao listar postagens:", erro);
            alert(`Erro ao listar postagens: ${erro.message}`);
        }
    }

    // --- Funções de Navegação do Carrossel ---
    function navigateCarousel(event) {
        const button = event.target;
        const carouselId = button.dataset.carouselId;
        const carousel = document.getElementById(carouselId);

        if (carousel) {
            const scrollAmount = carousel.clientWidth;
            if (button.classList.contains('prev')) {
                carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else if (button.classList.contains('next')) {
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    }


    // LOGOUT
    botaoLogout.addEventListener("click", () => {
        performLogout();
    });

    // Mostrar área principal após login
    function mostrarAreaPrincipal(token) {
        esconderTodasAsSecoesDeConteudo(); // Esconde tudo antes de mostrar a área principal
        autenticacao.style.display = "none"; // Garante que a autenticação esteja oculta
        areaPrincipal.style.display = "flex"; // Usar flex para #areaPrincipal para o gap funcionar
        // menuNavegacao.style.display = "flex"; // Removido, controlado por classes css do menu lateral

        // botaoLogout.style.display = "inline-block"; // Removido, o botão está sempre no menu lateral agora

        const username = localStorage.getItem("username");
        if (username) {
            usuarioLogado.textContent = `Olá, ${username}!`;
        } else {
            usuarioLogado.textContent = "Olá, usuário!";
        }

        listarPostagens();
    }

    // --- FUNÇÕES DE COMPARTILHAMENTO ---
    async function compartilharPostagem(idPostagem, respostaTexto) {
        const idUsuario = localStorage.getItem("id");

        if (!idUsuario) {
            alert("Usuário não autenticado. Por favor, faça login.");
            performLogout();
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
            fecharModalCompartilhar();
        } catch (erro) {
            console.error("Erro ao compartilhar postagem:", erro);
            alert(`Erro ao compartilhar. Tente novamente: ${erro.message}`);
        }
    }

    // --- Funções do Modal de Compartilhamento ---
    function abrirModalCompartilhar(idPostagem) {
        idPostagemParaCompartilhar = idPostagem;
        inputRespostaCompartilhamento.value = "";
        modalCompartilhar.style.display = "flex";
    }

    function fecharModalCompartilhar() {
        modalCompartilhar.style.display = "none";
        idPostagemParaCompartilhar = null;
    }

    cancelarCompartilhamentoBtn.addEventListener("click", fecharModalCompartilhar);

    confirmarCompartilhamentoBtn.addEventListener("click", () => {
        const resposta = inputRespostaCompartilhamento.value.trim();
        if (!idPostagemParaCompartilhar) return;
        compartilharPostagem(idPostagemParaCompartilhar, resposta);
    });

    // --- EMOJIS no Modal de Compartilhamento ---
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const emoji = e.target.textContent;
            const textarea = inputRespostaCompartilhamento;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const texto = textarea.value;

            textarea.value = texto.substring(0, start) + emoji + texto.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        });
    });

    // --- FUNÇÕES DE COMENTÁRIOS ---
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
            let comments = postData.comentarios || [];

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
                commentDiv.innerHTML = `
                <p><strong>${comment.autor || 'Anônimo'}</strong></p>
                <small>${new Date(comment.date).toLocaleString()}</small>
                <p>${comment.body}</p>
            `;
                // Aplicar estilos inline aqui (se desejar manter os estilos específicos de comentários no JS)
                commentDiv.style.cssText = `
                background-color: #f8f9fa;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
                border: 1px solid #e9ecef;
            `;
                commentDiv.querySelector('p strong').style.cssText = `font-weight: bold; color: #343a40; margin-bottom: 3px;`;
                commentDiv.querySelector('p:last-of-type').style.cssText = `color: #495057;`; // Conteúdo do comentário
                commentDiv.querySelector('small').style.cssText = `color: #6c757d; font-size: 0.85em; margin-bottom: 5px; display: block;`; // Data


                commentsListDiv.appendChild(commentDiv);
            });

        } catch (error) {
            console.error('Erro ao carregar comentários para postagem', postId, ':', error);
            commentsListDiv.innerHTML = '<p style="color: #dc3545;">Erro ao carregar comentários.</p>';
        }
    }

    async function addComment(event) {
        const postId = event.target.dataset.postId;
        const commentContentInput = document.getElementById(`commentContent-${postId}`);

        const content = commentContentInput ? commentContentInput.value.trim() : '';
        const author = localStorage.getItem('username');

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
                    autor: author,
                    date: new Date().toISOString()
                }),
            });

            if (response.ok) {
                alert('Comentário adicionado com sucesso!');
                if (commentContentInput) commentContentInput.value = '';
                await loadCommentsForPost(postId);
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
                listarPostagens();
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
        const userId = localStorage.getItem('id');
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

        // Base para estilos de botão (repetido aqui para consistência)
        const buttonBaseStyle = `
        padding: 10px 18px;
        border: none;
        border-radius: 0.75rem;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.95rem;
        transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        color: white;
    `;
        const buttonHoverStyleProps = `transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);`;
        const buttonOutStyleProps = `transform: translateY(0); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);`;


        try {
            console.log(`Tentando curtir/descurtir a postagem com ID: ${postId} pelo usuário: ${userId}`);
            const response = await fetch(`${endpointPostagens}/${postId}/curtir`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: userId })
            });
            console.log(`Resposta do servidor: ${JSON.stringify(response)}`);
            if (response.ok) {
                const data = await response.json();
                // Atualiza o texto do botão para refletir o novo estado e contagem
                button.textContent = `Curtir (${data.likesCount})`;

                // Reaplicar estilos inline com base na ação para manter o hover
                if (data.action === 'liked') {
                    button.style.cssText = `${buttonBaseStyle} background-color: #6f42c1;`; // Roxo (curtido)
                    button.onmouseover = function () { this.style.backgroundColor = '#5b37a3'; this.style.cssText += buttonHoverStyleProps; };
                    button.onmouseout = function () { this.style.backgroundColor = '#6f42c1'; this.style.cssText += buttonOutStyleProps; };
                } else {
                    button.style.cssText = `${buttonBaseStyle} background-color: #fd7e14;`; // Laranja (não curtido)
                    button.onmouseover = function () { this.style.backgroundColor = '#e66400'; this.style.cssText += buttonHoverStyleProps; };
                    button.onmouseout = function () { this.style.backgroundColor = '#fd7e14'; this.style.cssText += buttonOutStyleProps; };
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
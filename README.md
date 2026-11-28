# Erick Matias, Portfólio (estudo)

Site estático (HTML + CSS + JS puro), pronto para o **GitHub Pages**. Sem build, sem Node.
Animações com GSAP + ScrollTrigger + Lenis (já incluídos em `js/vendor/`, não depende de CDN).
Recursos externos: fonte (Google Fonts) e os tiles do mapa (OpenStreetMap).

## Como publicar no GitHub Pages
1. Crie um repositório e envie **o conteúdo desta pasta** (o `index.html` precisa ficar na raiz).
2. No repositório: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
3. Em alguns minutos o site abre em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.
   - Todos os caminhos são relativos, então funciona em subpasta e em domínio próprio.
   - Para domínio próprio, crie um arquivo `CNAME` com o domínio.

Testar localmente: `python3 -m http.server 8000` dentro da pasta e abrir `http://localhost:8000`.

## Estrutura
```
index.html          página única (todas as seções)
404.html            página de erro
css/style.css       estilos (cores e fontes no :root, no topo do arquivo)
js/main.js          todas as animações
js/vendor/          gsap, ScrollTrigger, lenis
assets/             logo, vídeo do hero (leve, já escurecido), poster, foto
assets/img/projects capas dos projetos: 01, 08, 09, 10 e 11 são mockups reais; 02-07 ainda são PLACEHOLDERS
assets/img/services capas das 4 áreas de atuação (PLACEHOLDERS)
```

## O que trocar depois
**Imagens dos projetos**, as capas em `assets/img/projects/` são artes abstratas geradas só para preencher
(sem direitos autorais). Quando tiver as fotos/prints, substitua os arquivos mantendo o nome
(ou mude o `src` no `index.html`). Proporção ideal 16:10, `.webp` ou `.jpg`.

**Textos gerados (revisar)**, vêm do portfólio atual, exceto:
- Título do hero ("Engenharia e direção de arte para produtos digitais.")
- Seção **O que eu faço** (4 cards: descrições aproximadas da stack atual)
- Seção **Perguntas rápidas** (FAQ inteira)
- Textos de apoio das seções (chamadas como "Das duas pontas de um produto…")
- Faixa grande de texto ("PROJETAR + CONSTRUIR + ESCALAR + REPETIR")
Procure por comentários `<!-- ... revisar -->` no `index.html`.

**Conteúdo copiado do portfólio atual sem alteração**, os 8 projetos (tag, título, texto, chips),
sobre, linha do tempo, manifesto (6 princípios), stack, gráficos (mesmos valores), clientes,
localização, contato e contadores (2 sistemas, 7 anos, 100% stack próprio; "8 projetos" = quantidade de cards).

**Compartilhamento (WhatsApp/LinkedIn)**, depois de publicar, troque o `og:image` no `<head>` por uma URL absoluta
(ex.: `https://seu-dominio/assets/logo.png`) e adicione `og:url`/`canonical`.

## Animações
- Preloader com moldura desenhando + decodificação de texto (clique em "pular")
- Entrada do hero (máscara, palavras subindo), vídeo com parallax (só no desktop)
- Menu em tela cheia com links em "roll"; botões com troca de texto/ícone
- Títulos por palavra, texto grande que acende conforme rola, contadores, linha do tempo que desenha
- Projetos em cards empilhados (sticky) com parallax nas imagens
- Serviços deslizando dos lados, bento com brilho que segue o mouse, FAQ acordeão
- Marquees infinitos, mapa de Fortaleza (OpenStreetMap escuro), cursor customizado
- Respeita `prefers-reduced-motion`


## Atualização: referências, botões e fotos
- **Referências** (seção nova): Lakma, Divina Picanha, GR6 Explode, J&T Express, Diamond Digital, Grand Divina + 2 espaços livres.
  Fotos em `assets/img/references/` (Lakma palco e flores já estão). Para as vazias, troque o bloco `.ref-empty`
  por `<img src="assets/img/references/NOME.webp" alt="..."/>` dentro de `.ref-media` no `index.html`.
- **Projetos 02-07** não têm mais capa abstrata: mostram um painel "Imagem em breve". Para colocar a foto, troque o
  `<div class="project-card-image is-empty">…</div>` por `<div class="project-card-image"><img src="assets/img/projects/ARQUIVO.webp" alt="" width="1800" height="1005" loading="lazy"/></div>`.
- **GitHub e Instagram** estão sem link (atributo `data-soon`). Para ativar: troque `role="button" tabindex="0" data-soon`
  por `href="https://..." target="_blank" rel="noopener"`.
- **Copiar link** (rodapé) copia o endereço da página e mostra o aviso "Link copiado!".


## Atualização v5

- Sem o sistema de bar e sem a Aurora (card, cliente e textos removidos). Projetos agora são 10.
- Capas dos projetos 02 a 06 são **mockups gerados** (`assets/img/projects/02-...06-...webp`). Os números e textos dentro deles são fictícios; troque por prints reais quando tiver.
- Logos de clientes reais (do site antigo) em `assets/img/logos/`.
- Botões de GitHub, Instagram, e-mail e copiar link agora são ícones. GitHub e Instagram continuam sem link (atributo `data-soon`); para ativar, troque por `href="..."` e remova `data-soon`.
- Tela de entrada com spinner branco (~1 s). Logo 3D no hero (`js/vendor/model-viewer.min.js`), com versão leve (PNG girando) em aparelhos fracos.
- Fontes hospedadas em `assets/fonts/` (não dependem mais do Google Fonts).
- Prompts do Gemini para as imagens de serviços: `prompts-gemini-servicos.md`.

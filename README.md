# 📚 BookSync

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)

Plataforma fullstack de gestão de utilizadores e biblioteca pessoal. Desenvolvido como atividade prática para a disciplina **Desenvolvimento de Software para Web** (ULBRA Palmas), ministrada pela Profª Marianne Lacerda Dutra Theodoro.

## 📋 Sumário
- [Recursos e Funcionalidades](#-recursos-e-funcionalidades)
- [Conceitos Aplicados](#-conceitos-aplicados)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Deploy](#-deploy)
- [Rotas da API](#-rotas-da-api)
- [Como rodar localmente](#-como-rodar-localmente)
- [Licença](#-licença)

---

## ✨ Recursos e Funcionalidades

### 🔐 Autenticação e Segurança
- Cadastro com validação dupla (Zod no frontend, Express no backend).
- Senhas protegidas com hash criptografado via **bcryptjs**.
- Controle de sessão utilizando Context API e `localStorage`.
- Rotas front-end protegidas (apenas acessíveis após login).

### 👥 Gestão de Usuários
- Tabela paginada (limite de 5 itens por página).
- Edição *inline* fluida e exclusão de cadastros.
- Sistema para favoritar outros usuários (Lista de Amigos) utilizando UI otimista.

### 📚 Minha Estante (Gestão de Livros)
- CRUD completo de livros através de modal.
- Controle de status de leitura ("quero ler", "lendo", "lido") e avaliação (1 a 5 estrelas).
- Busca em tempo real com **debounce** (400ms) para otimizar requisições.
- Filtro avançado por gênero.
- Favoritar livros (tabela relacional separada).

### 💅 UI / UX
- Estilização robusta e totalmente responsiva com **Tailwind CSS v4**.
- **Dark Mode** persistente baseado no ThemeContext.
- Feedbacks instantâneos com toasts animados (`react-hot-toast`).
- *Empty states* amigáveis em telas sem conteúdo.

---

## 🧠 Conceitos Aplicados

Durante o desenvolvimento deste projeto, aplicamos uma série de conceitos fundamentais para a criação de aplicações modernas:

- **Context API:** Gestão de estados globais essenciais (autenticação do usuário logado e persistência do tema Claro/Escuro).
- **React Router v7 & Rotas Protegidas:** Sistema de navegação SPA (*Single Page Application*). Utilização de *Higher-Order Components* (HOC) para bloquear rotas internas de usuários não logados.
- **Hook Form + Zod:** Gestão de formulários controlados de alta performance aliada a *schemas* de validação estritos.
- **Axios & Interceptação:** Cliente HTTP promissificado para lidar perfeitamente com todas as requisições assíncronas do backend.
- **Paginação (LIMIT/OFFSET):** Estratégia de backend que melhora o tempo de carregamento no envio segmentado dos dados.
- **Relacionamentos (JOINs e Foreign Keys):** Banco de dados relacional (SQLite). Uso profundo de `INNER JOIN` para cruzar tabelas de favoritos, e `ON DELETE CASCADE` para limpar dependências caso um registro pai seja removido.
- **Bcryptjs:** Implementação de segurança *salt and hash* para inviabilizar a exposição de senhas cruas no banco de dados.
- **Debounce:** Técnica inserida na barra de buscas do frontend para atrasar a requisição (400ms) até o usuário parar de digitar.
- **UI Otimista:** Atualização dos cards na tela *antes* da resposta do servidor chegar (ex: no toggle de favorito), melhorando drasticamente a percepção de performance.
- **HTTP Status Codes:** Retornos semânticos da REST API (201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error).

---

## 📂 Estrutura do Projeto

A arquitetura do projeto separa claramente os conceitos entre cliente (React) e servidor (Node).

```plaintext
/
├── backend/
│   ├── src/
│   │   ├── config/db.js               → Instância e tabelas do SQLite
│   │   └── routes/
│   │       ├── usuarioRoutes.js       → Rotas de autenticação e usuários
│   │       ├── favoritoRoutes.js      → Rotas de amigos favoritos
│   │       └── livroRoutes.js         → Rotas da estante
│   ├── server.js                      → Ponto de entrada do Express
│   ├── database.sqlite                → Arquivo físico do banco de dados
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/                → UI, Modais e Formulários
    │   ├── contexts/                  → AuthContext e ThemeContext
    │   ├── schemas/                   → Validações com Zod
    │   ├── App.jsx & main.jsx         → Arquivos raiz e Rotas
    │   └── index.css                  → Configuração global e Tailwind classes
    └── package.json
```

---

## 🚀 Deploy

A aplicação está hospedada e pode ser acessada em tempo real:

* **Frontend (Vercel):** [https://desenvolvimento-de-formularios-de-c.vercel.app](https://desenvolvimento-de-formularios-de-c.vercel.app)
* **Backend & API (Render):** [https://booksync-api.onrender.com](https://booksync-api.onrender.com)

> **⚠️ AVISO IMPORTANTE:** O serviço gratuito do Render utiliza Discos Efêmeros. Isto significa que a qualquer momento que a máquina for reiniciada (por inatividade ou atualização no provedor), o ficheiro `database.sqlite` será apagado e regressará ao seu estado inicial. Contas e livros adicionados na nuvem podem sumir periodicamente.

---

## 🔗 Rotas da API

### Usuários
- `POST /api/cadastro` - Registra um novo usuário.
- `POST /api/login` - Valida senha gerando sessão.
- `GET /api/usuarios` - Lista de usuários paginada.
- `PUT /api/usuarios/:id` - Atualiza o nome/e-mail de um usuário.
- `DELETE /api/usuarios/:id` - Remove uma conta permanentemente.

### Favoritos (Amigos)
- `POST /api/favoritos` - Vincula um usuário a outro.
- `DELETE /api/favoritos` - Desfaz o vínculo.
- `GET /api/favoritos/:usuarioId` - Retorna a rede de amigos.

### Minha Estante (Livros)
- `GET /api/livros/:usuarioId` - Lista todos os livros (suporta query filters).
- `POST /api/livros` - Adiciona novo livro.
- `PUT /api/livros/:id` - Atualiza livro existente.
- `DELETE /api/livros/:id` - Remove o livro da estante.

### Favoritos de Livros
- `POST /api/livros-favoritos` - Marca um livro com a estrela.
- `DELETE /api/livros-favoritos` - Remove a marcação.
- `GET /api/livros-favoritos/:usuarioId` - Traz a lista filtrada por INNER JOIN.

---

## 💻 Como rodar localmente

Clone este repositório e certifique-se de ter o **Node.js** instalado na sua máquina.

### 1. Backend
Abra um terminal e acesse a pasta do backend:
```bash
cd backend
npm install
npm run dev
```
O servidor vai criar automaticamente o `database.sqlite` rodando em `http://localhost:3000`.

### 2. Frontend
Crie o arquivo de configuração de ambiente baseando-se no exemplo. Entre na pasta:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
A sua aplicação React iniciará em `http://localhost:5173`. 
> *Nota: certifique-se que dentro do ficheiro `.env` está definido `VITE_API_URL=http://localhost:3000`.*

---

## 📜 Licença e Créditos

Este projeto é desenvolvido para fins educacionais. Distribuído sob a licença **MIT**. 

Projeto avaliativo da disciplina **Desenvolvimento de Software para Web**, ULBRA Palmas, ministrada pela **Profª Marianne Lacerda Dutra Theodoro**.

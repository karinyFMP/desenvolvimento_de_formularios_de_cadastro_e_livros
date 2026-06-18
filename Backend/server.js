// Arquivo: /backend/server.js

const express = require('express');
const cors = require('cors');

// Importa a conexão com o banco (já executa a criação das tabelas ao ser carregado)
require('./src/config/db');

// Importa os módulos de rotas
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const favoritoRoutes = require('./src/routes/favoritoRoutes');
const livroRoutes = require('./src/routes/livroRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globais ──────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Vinculação das rotas ─────────────────────────────────────
app.use('/api', usuarioRoutes);
app.use('/api', favoritoRoutes);
app.use('/api', livroRoutes);

// ── Inicia o servidor ────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

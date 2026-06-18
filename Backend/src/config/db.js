// Arquivo: /backend/src/config/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Aponta para o arquivo na raiz do /backend (um nível acima de /src)
const DB_PATH = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');

        // Habilitar suporte a chaves estrangeiras (desabilitado por padrão no SQLite)
        db.run('PRAGMA foreign_keys = ON');

        // Criação da tabela de usuários principal
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela de usuários:', err.message);
                return;
            }

            // Criação da nova tabela de Favoritos (depende da tabela de usuários)
            db.run(`CREATE TABLE IF NOT EXISTS favoritos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                favorito_id INTEGER NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (favorito_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                UNIQUE(usuario_id, favorito_id)
            )`, () => {
                // Criação da tabela de Livros
                db.run(`CREATE TABLE IF NOT EXISTS livros (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    titulo TEXT NOT NULL,
                    autor TEXT NOT NULL,
                    genero TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'quero ler',
                    avaliacao INTEGER DEFAULT NULL,
                    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
                )`, () => {
                    // Criação da tabela de Favoritos de Livros
                    db.run(`CREATE TABLE IF NOT EXISTS livros_favoritos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        usuario_id INTEGER NOT NULL,
                        livro_id INTEGER NOT NULL,
                        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                        FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
                        UNIQUE(usuario_id, livro_id)
                    )`);
                });
            });
        });
    }
});

module.exports = db;

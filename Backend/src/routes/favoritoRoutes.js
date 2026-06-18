// Arquivo: /backend/src/routes/favoritoRoutes.js

const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Rota POST para adicionar um usuário aos favoritos
router.post('/favoritos', (req, res) => {
    try {
        const { usuario_id, favorito_id } = req.body;

        if (!usuario_id || !favorito_id) {
            return res.status(400).json({ erro: 'O ID do usuário e o ID do favorito são obrigatórios.' });
        }

        const query = 'INSERT INTO favoritos (usuario_id, favorito_id) VALUES (?, ?)';
        db.run(query, [usuario_id, favorito_id], function(err) {
            if (err) {
                console.error('Erro ao adicionar favorito:', err);
                // Trata especificamente o erro de tentar favoritar a mesma pessoa (devido à UNIQUE key criada)
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ erro: 'Este utilizador já está nos seus favoritos.' });
                }
                return res.status(500).json({ erro: 'Erro interno ao adicionar aos favoritos.' });
            }
            return res.status(201).json({ mensagem: 'Utilizador adicionado aos favoritos!' });
        });
    } catch (error) {
        console.error('Erro inesperado:', error);
        return res.status(500).json({ erro: 'Ocorreu um erro inesperado no servidor.' });
    }
});

// Rota DELETE para remover um favorito
router.delete('/favoritos', (req, res) => {
    try {
        // Embora seja menos comum DELETE com body, a instrução e clientes HTTP modernos como Axios suportam.
        const { usuario_id, favorito_id } = req.body;

        if (!usuario_id || !favorito_id) {
            return res.status(400).json({ erro: 'O ID do usuário e o ID do favorito são obrigatórios.' });
        }

        const query = 'DELETE FROM favoritos WHERE usuario_id = ? AND favorito_id = ?';
        db.run(query, [usuario_id, favorito_id], function(err) {
            if (err) {
                console.error('Erro ao remover favorito:', err);
                return res.status(500).json({ erro: 'Erro interno ao remover dos favoritos.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ erro: 'Favorito não encontrado no banco de dados.' });
            }
            return res.status(200).json({ mensagem: 'Utilizador removido dos favoritos!' });
        });
    } catch (error) {
        console.error('Erro inesperado:', error);
        return res.status(500).json({ erro: 'Ocorreu um erro inesperado no servidor.' });
    }
});

// Rota GET para listar os favoritos usando INNER JOIN
router.get('/favoritos/:usuarioId', (req, res) => {
    try {
        const { usuarioId } = req.params;

        // INNER JOIN cruza os IDs de favoritos da tabela favoritos com os detalhes na tabela de usuarios
        const query = `
            SELECT u.id, u.nome, u.email 
            FROM usuarios u
            INNER JOIN favoritos f ON u.id = f.favorito_id
            WHERE f.usuario_id = ?
        `;

        db.all(query, [usuarioId], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar favoritos:', err);
                return res.status(500).json({ erro: 'Erro interno ao buscar a lista de favoritos.' });
            }
            return res.status(200).json({ data: rows });
        });
    } catch (error) {
        console.error('Erro inesperado:', error);
        return res.status(500).json({ erro: 'Ocorreu um erro inesperado no servidor.' });
    }
});

module.exports = router;

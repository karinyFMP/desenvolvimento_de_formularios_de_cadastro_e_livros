// Arquivo: /backend/src/routes/livroRoutes.js

const express = require('express');
const db = require('../config/db');

const router = express.Router();

// ==========================================
// ROTAS DE LIVROS
// ==========================================

// GET /api/livros/:usuarioId — lista livros do usuário com filtros e campo favorito
router.get('/livros/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    const { busca, genero } = req.query;

    let conditions = ['livros.usuario_id = ?'];
    let params = [usuarioId, usuarioId]; // primeiro para LEFT JOIN, segundo para WHERE

    if (busca) {
        conditions.push('(livros.titulo LIKE ? OR livros.autor LIKE ?)');
        params.push(`%${busca}%`, `%${busca}%`);
    }
    if (genero) {
        conditions.push('livros.genero = ?');
        params.push(genero);
    }

    const query = `
        SELECT livros.*, CASE WHEN lf.id IS NOT NULL THEN 1 ELSE 0 END AS favorito
        FROM livros
        LEFT JOIN livros_favoritos lf ON livros.id = lf.livro_id AND lf.usuario_id = ?
        WHERE ${conditions.join(' AND ')}
        ORDER BY livros.criado_em DESC
    `;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Erro ao buscar livros:', err);
            return res.status(500).json({ erro: 'Erro interno ao buscar livros.' });
        }
        return res.json({ data: rows });
    });
});

// POST /api/livros — adiciona livro à estante
router.post('/livros', (req, res) => {
    let { usuario_id, titulo, autor, genero, status, avaliacao } = req.body;

    if (!usuario_id || !titulo || !autor || !genero) {
        return res.status(400).json({ erro: 'usuario_id, título, autor e gênero são obrigatórios.' });
    }

    status = status || 'quero ler';
    const statusValidos = ['quero ler', 'lendo', 'lido'];
    if (!statusValidos.includes(status)) {
        return res.status(400).json({ erro: "Status inválido. Use 'quero ler', 'lendo' ou 'lido'." });
    }

    if (avaliacao !== undefined && avaliacao !== null && avaliacao !== '') {
        const av = parseInt(avaliacao);
        if (isNaN(av) || av < 1 || av > 5) {
            return res.status(400).json({ erro: 'Avaliação deve ser um número inteiro entre 1 e 5.' });
        }
        avaliacao = av;
    } else {
        avaliacao = null;
    }

    const query = 'INSERT INTO livros (usuario_id, titulo, autor, genero, status, avaliacao) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(query, [usuario_id, titulo.trim(), autor.trim(), genero, status, avaliacao], function(err) {
        if (err) {
            console.error('Erro ao inserir livro:', err);
            return res.status(500).json({ erro: 'Erro ao salvar o livro.' });
        }
        return res.status(201).json({
            mensagem: 'Livro adicionado com sucesso!',
            livro: { id: this.lastID, usuario_id, titulo, autor, genero, status, avaliacao: avaliacao || null }
        });
    });
});

// PUT /api/livros/:id — edita livro (verificando propriedade)
router.put('/livros/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, autor, genero, status, avaliacao, usuario_id } = req.body;

    db.get('SELECT * FROM livros WHERE id = ?', [id], (err, livro) => {
        if (err) return res.status(500).json({ erro: 'Erro interno.' });
        if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
        if (livro.usuario_id !== usuario_id) {
            return res.status(403).json({ erro: 'Acesso negado. Este livro não pertence à sua estante.' });
        }

        const statusValidos = ['quero ler', 'lendo', 'lido'];
        const novoStatus = status || livro.status;
        if (!statusValidos.includes(novoStatus)) {
            return res.status(400).json({ erro: "Status inválido. Use 'quero ler', 'lendo' ou 'lido'." });
        }

        let novaAvaliacao = avaliacao !== undefined && avaliacao !== '' ? parseInt(avaliacao) : null;

        const query = 'UPDATE livros SET titulo = ?, autor = ?, genero = ?, status = ?, avaliacao = ? WHERE id = ?';
        db.run(query, [titulo || livro.titulo, autor || livro.autor, genero || livro.genero, novoStatus, novaAvaliacao, id], function(err) {
            if (err) return res.status(500).json({ erro: 'Erro ao atualizar o livro.' });
            return res.json({ mensagem: 'Livro atualizado com sucesso!' });
        });
    });
});

// DELETE /api/livros/:id — remove livro (verificando propriedade)
router.delete('/livros/:id', (req, res) => {
    const { id } = req.params;
    const usuario_id = parseInt(req.query.usuario_id);

    db.get('SELECT * FROM livros WHERE id = ?', [id], (err, livro) => {
        if (err) return res.status(500).json({ erro: 'Erro interno.' });
        if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
        if (livro.usuario_id !== usuario_id) {
            return res.status(403).json({ erro: 'Acesso negado. Este livro não pertence à sua estante.' });
        }

        db.run('DELETE FROM livros WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ erro: 'Erro ao remover o livro.' });
            return res.json({ mensagem: 'Livro removido da estante!' });
        });
    });
});

// ==========================================
// ROTAS DE FAVORITOS DE LIVROS
// ==========================================

// POST /api/livros-favoritos — adiciona livro aos favoritos
router.post('/livros-favoritos', (req, res) => {
    const { usuario_id, livro_id } = req.body;

    if (!usuario_id || !livro_id) {
        return res.status(400).json({ erro: 'usuario_id e livro_id são obrigatórios.' });
    }

    db.run('INSERT INTO livros_favoritos (usuario_id, livro_id) VALUES (?, ?)', [usuario_id, livro_id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ erro: 'Livro já está nos favoritos.' });
            }
            return res.status(500).json({ erro: 'Erro ao adicionar aos favoritos.' });
        }
        return res.status(201).json({ mensagem: 'Livro adicionado aos favoritos! ⭐' });
    });
});

// DELETE /api/livros-favoritos — remove livro dos favoritos
router.delete('/livros-favoritos', (req, res) => {
    const { usuario_id, livro_id } = req.body;

    if (!usuario_id || !livro_id) {
        return res.status(400).json({ erro: 'usuario_id e livro_id são obrigatórios.' });
    }

    db.run('DELETE FROM livros_favoritos WHERE usuario_id = ? AND livro_id = ?', [usuario_id, livro_id], function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao remover dos favoritos.' });
        if (this.changes === 0) return res.status(404).json({ erro: 'Favorito não encontrado.' });
        return res.json({ mensagem: 'Livro removido dos favoritos.' });
    });
});

// GET /api/livros-favoritos/:usuarioId — lista livros favoritos com dados completos
router.get('/livros-favoritos/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;

    const query = `
        SELECT livros.*, 1 AS favorito
        FROM livros
        INNER JOIN livros_favoritos lf ON livros.id = lf.livro_id
        WHERE lf.usuario_id = ?
        ORDER BY livros.criado_em DESC
    `;

    db.all(query, [usuarioId], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar favoritos de livros:', err);
            return res.status(500).json({ erro: 'Erro interno ao buscar favoritos.' });
        }
        return res.json({ data: rows });
    });
});

module.exports = router;

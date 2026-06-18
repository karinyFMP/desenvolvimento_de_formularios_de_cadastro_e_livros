// Arquivo: /backend/src/routes/usuarioRoutes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();

// Função auxiliar para validar o formato do e-mail
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

// Rota de Cadastro
router.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;

    // 1. Validação rigorosa dos dados de entrada
    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
        return res.status(400).json({ 
            erro: 'O nome é obrigatório e deve conter pelo menos 3 caracteres.' 
        });
    }

    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ 
            erro: 'Um e-mail válido é obrigatório.' 
        });
    }

    if (!senha || typeof senha !== 'string' || senha.length < 6) {
        return res.status(400).json({ 
            erro: 'A senha é obrigatória e deve conter pelo menos 6 caracteres.' 
        });
    }

    const cleanNome = nome.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 2. Verificação se o e-mail já existe no banco
    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
    db.get(checkEmailQuery, [cleanEmail], async (err, row) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ erro: 'Erro interno do servidor.' });
        }

        if (row) {
            // E-mail já cadastrado
            return res.status(409).json({ 
                erro: 'Este e-mail já está em uso. Por favor, utilize outro.' 
            });
        }

        // 3. Inserção do novo usuário
        const insertQuery = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        const senhaHash = await bcrypt.hash(senha, 10);
        db.run(insertQuery, [cleanNome, cleanEmail, senhaHash], function(err) {
            if (err) {
                console.error('Erro ao inserir usuário:', err);
                return res.status(500).json({ erro: 'Erro ao salvar o usuário no banco de dados.' });
            }

            return res.status(201).json({
                mensagem: 'Usuário cadastrado com sucesso!',
                usuario: {
                    id: this.lastID,
                    nome: cleanNome,
                    email: cleanEmail
                }
            });
        });
    });
});

// Rota de Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  db.get('SELECT * FROM usuarios WHERE email = ?', [cleanEmail], async (err, usuario) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
    if (!usuario) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    return res.json({
      mensagem: 'Login realizado com sucesso!',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  });
});

// Rota GET para listar usuários com Paginação
router.get('/usuarios', (req, res) => {
    // 1. Recebe page e limit dos Query Params (com valores padrão)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    // 2. Calcula o deslocamento (offset) baseado na página atual
    const offset = (page - 1) * limit;

    // Conta o total de registros para calcular o total de páginas
    db.get('SELECT COUNT(*) as total FROM usuarios', [], (err, row) => {
        if (err) {
            console.error('Erro ao contar usuários:', err);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }

        const totalItems = row.total;
        const totalPages = Math.ceil(totalItems / limit);

        // 3. Consulta usando LIMIT e OFFSET com placeholders (?) para segurança
        const query = 'SELECT id, nome, email FROM usuarios LIMIT ? OFFSET ?';
        db.all(query, [limit, offset], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar usuários:', err);
                return res.status(500).json({ erro: 'Erro ao buscar os usuários.' });
            }

            // Retorna os dados e as informações da paginação
            return res.json({
                data: rows,
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages
                }
            });
        });
    });
});

// Rota PUT para atualizar os dados de um usuário
router.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;
    
    if (!nome || !email) {
        return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios para a atualização.' });
    }

    // Usando placeholders (?) para prevenir SQL Injection
    const query = 'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?';
    db.run(query, [nome, email, id], function(err) {
        if (err) {
            console.error('Erro ao atualizar usuário:', err);
            return res.status(500).json({ erro: 'Erro interno ao atualizar os dados no servidor.' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado no banco de dados.' });
        }
        
        return res.json({ mensagem: 'Usuário atualizado com sucesso!' });
    });
});

// Rota DELETE para excluir um usuário
router.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    
    // Usando placeholders (?) para prevenir SQL Injection
    const query = 'DELETE FROM usuarios WHERE id = ?';
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Erro ao excluir usuário:', err);
            return res.status(500).json({ erro: 'Erro interno ao excluir o registro no servidor.' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado no banco de dados.' });
        }
        
        return res.json({ mensagem: 'Usuário excluído com sucesso!' });
    });
});

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [usuarios] = await connection.execute(
      'SELECT * FROM Usuarios WHERE Email = ?',
      [email]
    );
    connection.release();

    if (usuarios.length === 0) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
    }

    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, usuario.Senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.Email, nome: usuario.Nome },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );

    res.json({
      sucesso: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.Nome,
        email: usuario.Email,
        tipo: usuario.Tipo
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ sucesso: true, mensagem: 'Logout realizado' });
});

module.exports = router;

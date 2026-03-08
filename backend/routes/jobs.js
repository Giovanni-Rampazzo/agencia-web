const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Listar jobs do usuário
router.get('/', auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const connection = await pool.getConnection();
    const [jobs] = await connection.execute(
      'SELECT * FROM Jobs WHERE FK_Usuario = ? ORDER BY ID DESC',
      [usuarioId]
    );
    connection.release();

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar jobs' });
  }
});

// Obter job por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();
    const [jobs] = await connection.execute(
      'SELECT * FROM Jobs WHERE ID = ? AND FK_Usuario = ?',
      [id, usuarioId]
    );
    connection.release();

    if (jobs.length === 0) {
      return res.status(404).json({ erro: 'Job não encontrado' });
    }

    res.json(jobs[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar job' });
  }
});

// Criar job
router.post('/', auth, async (req, res) => {
  try {
    const { Descricao, Status, FK_Cliente } = req.body;
    const usuarioId = req.usuario.id;

    if (!Descricao) {
      return res.status(400).json({ erro: 'Descrição é obrigatória' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Jobs (Descricao, Status, FK_Cliente, FK_Usuario) VALUES (?, ?, ?, ?)',
      [Descricao, Status || 'Pendente', FK_Cliente || null, usuarioId]
    );
    connection.release();

    res.status(201).json({
      sucesso: true,
      id: result.insertId,
      mensagem: 'Job criado com sucesso'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar job' });
  }
});

// Atualizar job
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { Descricao, Status, FK_Cliente } = req.body;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE Jobs SET Descricao = ?, Status = ?, FK_Cliente = ? WHERE ID = ? AND FK_Usuario = ?',
      [Descricao, Status, FK_Cliente, id, usuarioId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Job não encontrado' });
    }

    res.json({ sucesso: true, mensagem: 'Job atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar job' });
  }
});

// Deletar job
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM Jobs WHERE ID = ? AND FK_Usuario = ?',
      [id, usuarioId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Job não encontrado' });
    }

    res.json({ sucesso: true, mensagem: 'Job deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar job' });
  }
});

module.exports = router;

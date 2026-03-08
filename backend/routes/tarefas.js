const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Listar tarefas do usuário
router.get('/', auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const connection = await pool.getConnection();
    const [tarefas] = await connection.execute(
      'SELECT * FROM Tarefas WHERE FK_Usuario = ? ORDER BY Prazo ASC',
      [usuarioId]
    );
    connection.release();

    res.json(tarefas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar tarefas' });
  }
});

// Obter tarefa por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();
    const [tarefas] = await connection.execute(
      'SELECT * FROM Tarefas WHERE ID = ? AND FK_Usuario = ?',
      [id, usuarioId]
    );
    connection.release();

    if (tarefas.length === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    res.json(tarefas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar tarefa' });
  }
});

// Criar tarefa
router.post('/', auth, async (req, res) => {
  try {
    const { Tarefa, Prioridade, Prazo, Status } = req.body;
    const usuarioId = req.usuario.id;

    if (!Tarefa) {
      return res.status(400).json({ erro: 'Tarefa é obrigatória' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Tarefas (Tarefa, Prioridade, Prazo, Status, FK_Usuario) VALUES (?, ?, ?, ?, ?)',
      [Tarefa, Prioridade || 'Média', Prazo || null, Status || 'Pendente', usuarioId]
    );
    connection.release();

    res.status(201).json({
      sucesso: true,
      id: result.insertId,
      mensagem: 'Tarefa criada com sucesso'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar tarefa' });
  }
});

// Atualizar tarefa
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { Tarefa, Prioridade, Prazo, Status } = req.body;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE Tarefas SET Tarefa = ?, Prioridade = ?, Prazo = ?, Status = ? WHERE ID = ? AND FK_Usuario = ?',
      [Tarefa, Prioridade, Prazo, Status, id, usuarioId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    res.json({ sucesso: true, mensagem: 'Tarefa atualizada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar tarefa' });
  }
});

// Deletar tarefa
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM Tarefas WHERE ID = ? AND FK_Usuario = ?',
      [id, usuarioId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }

    res.json({ sucesso: true, mensagem: 'Tarefa deletada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar tarefa' });
  }
});

module.exports = router;

const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Listar clientes do usuário logado
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const usuarioId = req.usuario.id;

    let sql = 'SELECT * FROM Clientes WHERE FK_Usuario = ?';
    let params = [usuarioId];

    if (status && status !== 'todos') {
      sql += ' AND Status = ?';
      params.push(status);
    }

    sql += ' ORDER BY ID DESC';

    const connection = await pool.getConnection();
    const [clientes] = await connection.execute(sql, params);
    connection.release();

    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar clientes' });
  }
});

// Buscar status únicos
router.get('/status/lista', auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const connection = await pool.getConnection();
    const [statuses] = await connection.execute(
      'SELECT DISTINCT Status FROM Clientes WHERE FK_Usuario = ? ORDER BY Status',
      [usuarioId]
    );
    connection.release();

    res.json(statuses.map(s => s.Status));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar status' });
  }
});

// Obter cliente por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();
    const [clientes] = await connection.execute(
      'SELECT * FROM Clientes WHERE ID = ? AND FK_Usuario = ?',
      [id, usuarioId]
    );
    connection.release();

    if (clientes.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(clientes[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar cliente' });
  }
});

// Criar novo cliente
router.post('/', auth, async (req, res) => {
  try {
    const { Empresa, Email, Telefone, Status, Endereco } = req.body;
    const usuarioId = req.usuario.id;

    if (!Empresa) {
      return res.status(400).json({ erro: 'Empresa é obrigatória' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Clientes (Empresa, Email, Telefone, Status, Endereco, FK_Usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [Empresa, Email || null, Telefone || null, Status || 'Ativo', Endereco || null, usuarioId]
    );
    connection.release();

    res.status(201).json({
      sucesso: true,
      id: result.insertId,
      mensagem: 'Cliente criado com sucesso'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { Empresa, Email, Telefone, Status, Endereco } = req.body;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE Clientes SET Empresa = ?, Email = ?, Telefone = ?, Status = ?, Endereco = ? WHERE ID = ? AND FK_Usuario = ?',
      [Empresa, Email, Telefone, Status, Endereco, id, usuarioId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json({ sucesso: true, mensagem: 'Cliente atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar cliente' });
  }
});

// Deletar cliente
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM Clientes WHERE ID = ? AND FK_Usuario = ?',
      [id, usuarioId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json({ sucesso: true, mensagem: 'Cliente deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar cliente' });
  }
});

module.exports = router;

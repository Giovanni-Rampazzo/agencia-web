require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');

const app    = express();
const SECRET = process.env.JWT_SECRET || 'zzo_segredo_2024';
const PORT   = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// =============================================================
//  POOL DE CONEXÃO
// =============================================================
const db = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME     || 'ZZO',
  port:     parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// =============================================================
//  MIDDLEWARE DE AUTENTICAÇÃO
// =============================================================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ erro: 'Token não fornecido' });

  const token = header.split(' ')[1];
  try {
    req.admin = jwt.verify(token, SECRET);   // { id, nome, email }
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

// =============================================================
//  AUTH — LOGIN
// =============================================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });

    const [[admin]] = await db.query(
      'SELECT * FROM Administradores WHERE Email = ?', [email]
    );
    if (!admin)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(senha, admin.Senha);
    if (!ok)
      return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: admin.ID, nome: admin.Nome, email: admin.Email },
      SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: admin.ID, nome: admin.Nome, email: admin.Email } });
  } catch (err) {
    console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) });
  }
});

// =============================================================
//  CLIENTES  (vinculados ao admin logado)
// =============================================================

// GET /api/clientes
app.get('/api/clientes', auth, async (req, res) => {
  try {
    const { status } = req.query;
    let sql    = 'SELECT * FROM Clientes WHERE FK_Admin = ?';
    const params = [req.admin.id];

    if (status && status !== 'todos') {
      sql += ' AND Status = ?';
      params.push(status);
    }
    sql += ' ORDER BY Empresa ASC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// GET /api/clientes/status/lista
app.get('/api/clientes/status/lista', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DISTINCT Status FROM Clientes WHERE FK_Admin = ? ORDER BY Status',
      [req.admin.id]
    );
    res.json(rows.map(r => r.Status));
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// GET /api/clientes/stats/resumo
app.get('/api/clientes/stats/resumo', auth, async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN Status='Ativo'    THEN 1 ELSE 0 END) AS ativos,
        SUM(CASE WHEN Status='Inativo'  THEN 1 ELSE 0 END) AS inativos,
        SUM(CASE WHEN Status='Pendente' THEN 1 ELSE 0 END) AS pendentes
      FROM Clientes WHERE FK_Admin = ?`,
      [req.admin.id]
    );
    res.json(stats);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// GET /api/clientes/:id
app.get('/api/clientes/:id', auth, async (req, res) => {
  try {
    const [[row]] = await db.query(
      'SELECT * FROM Clientes WHERE ID = ? AND FK_Admin = ?',
      [req.params.id, req.admin.id]
    );
    if (!row) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json(row);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// POST /api/clientes
app.post('/api/clientes', auth, async (req, res) => {
  try {
    const { Empresa, Email, Telefone, Status, Endereco } = req.body;
    if (!Empresa) return res.status(400).json({ erro: 'Empresa é obrigatória' });

    const [r] = await db.query(
      'INSERT INTO Clientes (Empresa, Email, Telefone, Status, Endereco, FK_Admin) VALUES (?,?,?,?,?,?)',
      [Empresa, Email || null, Telefone || null, Status || 'Ativo', Endereco || null, req.admin.id]
    );
    res.status(201).json({ sucesso: true, id: r.insertId });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// PUT /api/clientes/:id
app.put('/api/clientes/:id', auth, async (req, res) => {
  try {
    const { Empresa, Email, Telefone, Status, Endereco } = req.body;
    const [r] = await db.query(
      'UPDATE Clientes SET Empresa=?, Email=?, Telefone=?, Status=?, Endereco=? WHERE ID=? AND FK_Admin=?',
      [Empresa, Email || null, Telefone || null, Status, Endereco || null, req.params.id, req.admin.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json({ sucesso: true });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// DELETE /api/clientes/:id
app.delete('/api/clientes/:id', auth, async (req, res) => {
  try {
    const [r] = await db.query(
      'DELETE FROM Clientes WHERE ID=? AND FK_Admin=?',
      [req.params.id, req.admin.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });
    res.json({ sucesso: true });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// =============================================================
//  CAMPANHAS  (vinculadas a um Cliente do admin logado)
// =============================================================

// GET /api/campanhas?cliente_id=X
app.get('/api/campanhas', auth, async (req, res) => {
  try {
    const { cliente_id } = req.query;
    let sql = `
      SELECT c.*, cl.Empresa AS NomeCliente
      FROM Campanhas c
      JOIN Clientes cl ON c.FK_Cliente = cl.ID
      WHERE cl.FK_Admin = ?`;
    const params = [req.admin.id];

    if (cliente_id) { sql += ' AND c.FK_Cliente = ?'; params.push(cliente_id); }
    sql += ' ORDER BY c.Nome ASC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// GET /api/campanhas/:id
app.get('/api/campanhas/:id', auth, async (req, res) => {
  try {
    const [[row]] = await db.query(`
      SELECT c.*, cl.Empresa AS NomeCliente
      FROM Campanhas c
      JOIN Clientes cl ON c.FK_Cliente = cl.ID
      WHERE c.ID = ? AND cl.FK_Admin = ?`,
      [req.params.id, req.admin.id]
    );
    if (!row) return res.status(404).json({ erro: 'Campanha não encontrada' });
    res.json(row);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// POST /api/campanhas
app.post('/api/campanhas', auth, async (req, res) => {
  try {
    const { Nome, Descricao, Status, DataInicio, DataFim, FK_Cliente } = req.body;
    if (!Nome)       return res.status(400).json({ erro: 'Nome é obrigatório' });
    if (!FK_Cliente) return res.status(400).json({ erro: 'Cliente é obrigatório' });

    // Garante que o cliente pertence ao admin
    const [[cli]] = await db.query(
      'SELECT ID FROM Clientes WHERE ID=? AND FK_Admin=?', [FK_Cliente, req.admin.id]
    );
    if (!cli) return res.status(403).json({ erro: 'Cliente não autorizado' });

    const [r] = await db.query(
      'INSERT INTO Campanhas (Nome, Descricao, Status, DataInicio, DataFim, FK_Cliente) VALUES (?,?,?,?,?,?)',
      [Nome, Descricao || null, Status || 'Ativa', DataInicio || null, DataFim || null, FK_Cliente]
    );
    res.status(201).json({ sucesso: true, id: r.insertId });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// PUT /api/campanhas/:id
app.put('/api/campanhas/:id', auth, async (req, res) => {
  try {
    const { Nome, Descricao, Status, DataInicio, DataFim, FK_Cliente } = req.body;

    const [[cli]] = await db.query(
      'SELECT ID FROM Clientes WHERE ID=? AND FK_Admin=?', [FK_Cliente, req.admin.id]
    );
    if (!cli) return res.status(403).json({ erro: 'Cliente não autorizado' });

    const [r] = await db.query(
      'UPDATE Campanhas SET Nome=?, Descricao=?, Status=?, DataInicio=?, DataFim=?, FK_Cliente=? WHERE ID=?',
      [Nome, Descricao || null, Status, DataInicio || null, DataFim || null, FK_Cliente, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Campanha não encontrada' });
    res.json({ sucesso: true });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// DELETE /api/campanhas/:id
app.delete('/api/campanhas/:id', auth, async (req, res) => {
  try {
    const [r] = await db.query(`
      DELETE c FROM Campanhas c
      JOIN Clientes cl ON c.FK_Cliente = cl.ID
      WHERE c.ID=? AND cl.FK_Admin=?`,
      [req.params.id, req.admin.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Campanha não encontrada' });
    res.json({ sucesso: true });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// =============================================================
//  JOBS  (vinculados a uma Campanha)
// =============================================================

// GET /api/jobs?campanha_id=X
app.get('/api/jobs', auth, async (req, res) => {
  try {
    const { campanha_id } = req.query;
    let sql = `
      SELECT j.*, ca.Nome AS NomeCampanha, cl.Empresa AS NomeCliente
      FROM Jobs j
      JOIN Campanhas ca ON j.FK_Campanha = ca.ID
      JOIN Clientes  cl ON ca.FK_Cliente = cl.ID
      WHERE cl.FK_Admin = ?`;
    const params = [req.admin.id];

    if (campanha_id) { sql += ' AND j.FK_Campanha = ?'; params.push(campanha_id); }
    sql += ' ORDER BY j.ID DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// GET /api/jobs/:id
app.get('/api/jobs/:id', auth, async (req, res) => {
  try {
    const [[row]] = await db.query(`
      SELECT j.*, ca.Nome AS NomeCampanha, cl.Empresa AS NomeCliente
      FROM Jobs j
      JOIN Campanhas ca ON j.FK_Campanha = ca.ID
      JOIN Clientes  cl ON ca.FK_Cliente = cl.ID
      WHERE j.ID = ? AND cl.FK_Admin = ?`,
      [req.params.id, req.admin.id]
    );
    if (!row) return res.status(404).json({ erro: 'Job não encontrado' });
    res.json(row);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// POST /api/jobs
app.post('/api/jobs', auth, async (req, res) => {
  try {
    const { Descricao, Status, FK_Campanha } = req.body;
    if (!Descricao)   return res.status(400).json({ erro: 'Descrição é obrigatória' });
    if (!FK_Campanha) return res.status(400).json({ erro: 'Campanha é obrigatória' });

    // Verifica que a campanha pertence ao admin
    const [[cam]] = await db.query(`
      SELECT ca.ID FROM Campanhas ca
      JOIN Clientes cl ON ca.FK_Cliente = cl.ID
      WHERE ca.ID=? AND cl.FK_Admin=?`, [FK_Campanha, req.admin.id]
    );
    if (!cam) return res.status(403).json({ erro: 'Campanha não autorizada' });

    const [r] = await db.query(
      'INSERT INTO Jobs (Descricao, Status, FK_Campanha) VALUES (?,?,?)',
      [Descricao, Status || 'Pendente', FK_Campanha]
    );
    res.status(201).json({ sucesso: true, id: r.insertId });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// PUT /api/jobs/:id
app.put('/api/jobs/:id', auth, async (req, res) => {
  try {
    const { Descricao, Status, FK_Campanha } = req.body;

    const [[cam]] = await db.query(`
      SELECT ca.ID FROM Campanhas ca
      JOIN Clientes cl ON ca.FK_Cliente = cl.ID
      WHERE ca.ID=? AND cl.FK_Admin=?`, [FK_Campanha, req.admin.id]
    );
    if (!cam) return res.status(403).json({ erro: 'Campanha não autorizada' });

    const [r] = await db.query(
      'UPDATE Jobs SET Descricao=?, Status=?, FK_Campanha=? WHERE ID=?',
      [Descricao, Status, FK_Campanha, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Job não encontrado' });
    res.json({ sucesso: true });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// DELETE /api/jobs/:id
app.delete('/api/jobs/:id', auth, async (req, res) => {
  try {
    const [r] = await db.query(`
      DELETE j FROM Jobs j
      JOIN Campanhas ca ON j.FK_Campanha = ca.ID
      JOIN Clientes  cl ON ca.FK_Cliente = cl.ID
      WHERE j.ID=? AND cl.FK_Admin=?`,
      [req.params.id, req.admin.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Job não encontrado' });
    res.json({ sucesso: true });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// =============================================================
//  PAGAMENTOS  (vinculados a um Job)
// =============================================================

// GET /api/pagamentos?job_id=X
app.get('/api/pagamentos', auth, async (req, res) => {
  try {
    const { job_id } = req.query;
    let sql = `
      SELECT p.*,
             j.Descricao  AS NomeJob,
             ca.Nome      AS NomeCampanha,
             cl.Empresa   AS NomeCliente
      FROM Pagamentos p
      JOIN Jobs       j  ON p.FK_Job      = j.ID
      JOIN Campanhas  ca ON j.FK_Campanha = ca.ID
      JOIN Clientes   cl ON ca.FK_Cliente = cl.ID
      WHERE cl.FK_Admin = ?`;
    const params = [req.admin.id];

    if (job_id) { sql += ' AND p.FK_Job = ?'; params.push(job_id); }
    sql += ' ORDER BY p.Data DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// GET /api/pagamentos/stats/resumo
app.get('/api/pagamentos/stats/resumo', auth, async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*)                                    AS total,
        COALESCE(SUM(p.Valor), 0)                   AS total_valor,
        COALESCE(SUM(CASE WHEN p.Status='Pago'      THEN p.Valor ELSE 0 END), 0) AS total_pago,
        COALESCE(SUM(CASE WHEN p.Status='Pendente'  THEN p.Valor ELSE 0 END), 0) AS total_pendente
      FROM Pagamentos p
      JOIN Jobs j ON p.FK_Job = j.ID
      JOIN Campanhas ca ON j.FK_Campanha = ca.ID
      JOIN Clientes cl ON ca.FK_Cliente = cl.ID
      WHERE cl.FK_Admin = ?`,
      [req.admin.id]
    );
    res.json(stats);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// GET /api/pagamentos/:id
app.get('/api/pagamentos/:id', auth, async (req, res) => {
  try {
    const [[row]] = await db.query(`
      SELECT p.*, j.Descricao AS NomeJob, ca.Nome AS NomeCampanha, cl.Empresa AS NomeCliente
      FROM Pagamentos p
      JOIN Jobs j ON p.FK_Job = j.ID
      JOIN Campanhas ca ON j.FK_Campanha = ca.ID
      JOIN Clientes cl ON ca.FK_Cliente = cl.ID
      WHERE p.ID=? AND cl.FK_Admin=?`,
      [req.params.id, req.admin.id]
    );
    if (!row) return res.status(404).json({ erro: 'Pagamento não encontrado' });
    res.json(row);
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// POST /api/pagamentos
app.post('/api/pagamentos', auth, async (req, res) => {
  try {
    const { Descricao, Valor, Data, Status, FK_Job } = req.body;
    if (!Descricao) return res.status(400).json({ erro: 'Descrição é obrigatória' });
    if (!Valor)     return res.status(400).json({ erro: 'Valor é obrigatório' });
    if (!Data)      return res.status(400).json({ erro: 'Data é obrigatória' });
    if (!FK_Job)    return res.status(400).json({ erro: 'Job é obrigatório' });

    // Verifica que o Job pertence ao admin
    const [[job]] = await db.query(`
      SELECT j.ID FROM Jobs j
      JOIN Campanhas ca ON j.FK_Campanha = ca.ID
      JOIN Clientes cl ON ca.FK_Cliente = cl.ID
      WHERE j.ID=? AND cl.FK_Admin=?`, [FK_Job, req.admin.id]
    );
    if (!job) return res.status(403).json({ erro: 'Job não autorizado' });

    const [r] = await db.query(
      'INSERT INTO Pagamentos (Descricao, Valor, Data, Status, FK_Job) VALUES (?,?,?,?,?)',
      [Descricao, Valor, Data, Status || 'Pendente', FK_Job]
    );
    res.status(201).json({ sucesso: true, id: r.insertId });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// PUT /api/pagamentos/:id
app.put('/api/pagamentos/:id', auth, async (req, res) => {
  try {
    const { Descricao, Valor, Data, Status, FK_Job } = req.body;

    const [[job]] = await db.query(`
      SELECT j.ID FROM Jobs j
      JOIN Campanhas ca ON j.FK_Campanha = ca.ID
      JOIN Clientes cl ON ca.FK_Cliente = cl.ID
      WHERE j.ID=? AND cl.FK_Admin=?`, [FK_Job, req.admin.id]
    );
    if (!job) return res.status(403).json({ erro: 'Job não autorizado' });

    const [r] = await db.query(
      'UPDATE Pagamentos SET Descricao=?, Valor=?, Data=?, Status=?, FK_Job=? WHERE ID=?',
      [Descricao, Valor, Data, Status, FK_Job, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Pagamento não encontrado' });
    res.json({ sucesso: true });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// DELETE /api/pagamentos/:id
app.delete('/api/pagamentos/:id', auth, async (req, res) => {
  try {
    const [r] = await db.query(`
      DELETE p FROM Pagamentos p
      JOIN Jobs j ON p.FK_Job = j.ID
      JOIN Campanhas ca ON j.FK_Campanha = ca.ID
      JOIN Clientes cl ON ca.FK_Cliente = cl.ID
      WHERE p.ID=? AND cl.FK_Admin=?`,
      [req.params.id, req.admin.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Pagamento não encontrado' });
    res.json({ sucesso: true });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});

// =============================================================
//  TAREFAS  (agenda pessoal do admin logado)
// =============================================================

app.get('/api/tarefas', auth, async (req, res) => {
  try {
    const { job_id } = req.query;
    let sql = `SELECT t.*, cl.Empresa AS ClienteNome, j.Descricao AS JobDesc
               FROM Tarefas t
               LEFT JOIN Clientes cl ON t.FK_Cliente = cl.ID
               LEFT JOIN Jobs j ON t.FK_Job = j.ID
               WHERE t.FK_Admin=?`;
    const params = [req.admin.id];
    if (job_id) { sql += ' AND t.FK_Job = ?'; params.push(job_id); }
    sql += ' ORDER BY t.ID DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message || String(err) }); }
});

app.post('/api/tarefas', auth, async (req, res) => {
  try {
    const { Tarefa, Prioridade, Prazo, Status, FK_Job, FK_Cliente } = req.body;
    if (!Tarefa) return res.status(400).json({ erro: 'Tarefa é obrigatória' });

    const [r] = await db.query(
      'INSERT INTO Tarefas (Tarefa, Prioridade, Prazo, Status, FK_Admin, FK_Job, FK_Cliente) VALUES (?,?,?,?,?,?,?)',
      [Tarefa, Prioridade || 'Média', Prazo || null, Status || 'Pendente', req.admin.id, FK_Job || null, FK_Cliente || null]
    );
    res.status(201).json({ sucesso: true, id: r.insertId });
  } catch (err) { res.status(500).json({ erro: err.message || String(err) }); }
});

app.put('/api/tarefas/:id', auth, async (req, res) => {
  try {
    const { Tarefa, Prioridade, Prazo, Status, FK_Job, FK_Cliente } = req.body;
    const [r] = await db.query(
      'UPDATE Tarefas SET Tarefa=?, Prioridade=?, Prazo=?, Status=?, FK_Job=?, FK_Cliente=? WHERE ID=? AND FK_Admin=?',
      [Tarefa, Prioridade, Prazo || null, Status, FK_Job || null, FK_Cliente || null, req.params.id, req.admin.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    res.json({ sucesso: true });
  } catch (err) { res.status(500).json({ erro: err.message || String(err) }); }
});

app.delete('/api/tarefas/:id', auth, async (req, res) => {
  try {
    const [r] = await db.query(
      'DELETE FROM Tarefas WHERE ID=? AND FK_Admin=?',
      [req.params.id, req.admin.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Tarefa não encontrada' });
    res.json({ sucesso: true });
  } catch (err) { console.error('ERRO LOGIN:', err); res.status(500).json({ erro: err.message || String(err) }); }
});


// =============================================================
//  SETUP — Cria tabela Jobs se não existir
// =============================================================
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Jobs (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        Descricao VARCHAR(255) NOT NULL,
        Status VARCHAR(50) DEFAULT 'Pendente',
        FK_Campanha INT NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (FK_Campanha) REFERENCES Campanhas(ID) ON DELETE CASCADE
      )
    `);
    console.log('Tabela Jobs OK');
  } catch (err) {
    console.error('Erro ao criar tabela Jobs:', err.message);
  }
})();

// =============================================================
//  ADMINISTRADORES
// =============================================================

// GET /api/administradores
app.get('/api/administradores', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT ID, Nome, Email, CreatedAt FROM Administradores ORDER BY ID ASC'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message || String(err) }); }
});

// POST /api/administradores
app.post('/api/administradores', auth, async (req, res) => {
  try {
    const { Nome, Email, Senha } = req.body;
    if (!Nome || !Email || !Senha)
      return res.status(400).json({ erro: 'Nome, Email e Senha são obrigatórios' });

    const [[existe]] = await db.query('SELECT ID FROM Administradores WHERE Email = ?', [Email]);
    if (existe) return res.status(409).json({ erro: 'Email já cadastrado' });

    const hash = await require('bcryptjs').hash(Senha, 10);
    const [r] = await db.query(
      'INSERT INTO Administradores (Nome, Email, Senha) VALUES (?, ?, ?)',
      [Nome, Email, hash]
    );
    res.status(201).json({ sucesso: true, id: r.insertId });
  } catch (err) { res.status(500).json({ erro: err.message || String(err) }); }
});

// DELETE /api/administradores/:id
app.delete('/api/administradores/:id', auth, async (req, res) => {
  try {
    if (String(req.params.id) === String(req.admin.id))
      return res.status(400).json({ erro: 'Você não pode excluir sua própria conta' });
    const [r] = await db.query('DELETE FROM Administradores WHERE ID = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Admin não encontrado' });
    res.json({ sucesso: true });
  } catch (err) { res.status(500).json({ erro: err.message || String(err) }); }
});

// =============================================================
//  START
// =============================================================
app.listen(PORT, () => console.log(`Servidor ZZO rodando na porta ${PORT}`));

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./src/db');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/alunos', require('./src/routes/alunos'));
app.use('/api/docentes', require('./src/routes/docentes'));
app.use('/api/fornecedores', require('./src/routes/fornecedores'));
app.use('/api/notas', require('./src/routes/notas'));
app.use('/api/cursos', require('./src/routes/cursos'));
app.use('/api/boletos', require('./src/routes/boletos'));

// Rota de saúde da API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Sistema Universitário funcionando!' });
});

// Rota de dashboard stats
app.get('/api/dashboard', (req, res) => {
    const { queryOne } = require('./src/db');

    const stats = {
        totalAlunos: queryOne('SELECT COUNT(*) as total FROM aluno')?.total || 0,
        totalDocentes: queryOne('SELECT COUNT(*) as total FROM docente')?.total || 0,
        totalFornecedores: queryOne('SELECT COUNT(*) as total FROM fornecedor')?.total || 0,
        totalCursos: queryOne('SELECT COUNT(*) as total FROM curso WHERE ativo = 1')?.total || 0,
        matriculasAtivas: queryOne("SELECT COUNT(*) as total FROM matricula WHERE status = 'ATIVA'")?.total || 0,
        boletosPendentes: queryOne("SELECT COUNT(*) as total FROM boleto WHERE status = 'PENDENTE'")?.total || 0,
    };

    res.json(stats);
});

// Fallback — serve o index.html para rotas não encontradas (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicializa o banco de dados e inicia o servidor
async function start() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`\n🎓 Sistema Universitário rodando em http://localhost:${PORT}`);
            console.log(`📡 API disponível em http://localhost:${PORT}/api\n`);
        });
    } catch (err) {
        console.error('❌ Erro ao iniciar o servidor:', err);
        process.exit(1);
    }
}

start();

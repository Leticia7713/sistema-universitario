const express = require('express');
const router = express.Router();
const { queryAll, queryOne, execute } = require('../db');

// GET /api/docentes — Listar todos os docentes
router.get('/', (req, res) => {
    const { busca } = req.query;
    let query = `
        SELECT p.id, p.nome, p.email, p.endereco, p.telefone, p.ativo,
               d.tipo_contrato, d.data_admissao
        FROM pessoa p
        JOIN docente d ON p.id = d.id
    `;
    const params = [];

    if (busca) {
        query += ` WHERE p.nome LIKE ?1 OR p.email LIKE ?2`;
        const term = `%${busca}%`;
        params.push(term, term);
    }

    query += ` ORDER BY p.nome ASC`;

    const docentes = queryAll(query, params);
    res.json(docentes);
});

// GET /api/docentes/:id — Detalhe do docente com disciplinas
router.get('/:id', (req, res) => {
    const docente = queryOne(`
        SELECT p.id, p.nome, p.email, p.endereco, p.telefone, p.ativo,
               d.tipo_contrato, d.data_admissao
        FROM pessoa p
        JOIN docente d ON p.id = d.id
        WHERE p.id = ?1
    `, [parseInt(req.params.id)]);

    if (!docente) {
        return res.status(404).json({ error: 'Docente não encontrado' });
    }

    // Buscar disciplinas ministradas
    const disciplinas = queryAll(`
        SELECT di.id, di.nome, di.semestre, di.carga_hor,
               c.nome AS curso_nome
        FROM disciplina di
        JOIN curso c ON di.id_curso = c.id
        WHERE di.id_docente = ?1 AND di.ativo = 1
    `, [parseInt(req.params.id)]);

    res.json({ ...docente, disciplinas });
});

// PUT /api/docentes/:id — Editar docente
router.put('/:id', (req, res) => {
    const { nome, email, endereco, telefone, tipo_contrato } = req.body;
    const id = parseInt(req.params.id);

    execute(
        `UPDATE pessoa SET nome = ?1, email = ?2, endereco = ?3, telefone = ?4
         WHERE id = ?5`,
        [nome, email, endereco, telefone, id]
    );

    if (tipo_contrato) {
        execute(
            `UPDATE docente SET tipo_contrato = ?1 WHERE id = ?2`,
            [tipo_contrato, id]
        );
    }

    res.json({ message: 'Docente atualizado com sucesso!' });
});

// PATCH /api/docentes/:id/status — Ativar/Inativar docente
router.patch('/:id/status', (req, res) => {
    const id = parseInt(req.params.id);

    const docente = queryOne(
        `SELECT p.ativo FROM pessoa p WHERE p.id = ?1`,
        [id]
    );

    if (!docente) {
        return res.status(404).json({ error: 'Docente não encontrado' });
    }

    const novoStatus = docente.ativo ? 0 : 1;
    execute('UPDATE pessoa SET ativo = ?1 WHERE id = ?2', [novoStatus, id]);

    res.json({
        message: novoStatus ? 'Docente ativado com sucesso!' : 'Docente inativado com sucesso!',
        ativo: novoStatus
    });
});

module.exports = router;

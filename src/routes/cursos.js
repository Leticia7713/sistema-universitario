const express = require('express');
const router = express.Router();
const { queryAll, queryOne } = require('../db');

// GET /api/cursos — Listar todos os cursos
router.get('/', (req, res) => {
    const cursos = queryAll(`
        SELECT c.id, c.nome, c.descricao, c.duracao_sem, c.ativo,
               (SELECT COUNT(*) FROM matricula m WHERE m.id_curso = c.id AND m.status = 'ATIVA') AS total_alunos
        FROM curso c
        ORDER BY c.nome ASC
    `);
    res.json(cursos);
});

// GET /api/cursos/:id/disciplinas — Listar disciplinas de um curso
router.get('/:id/disciplinas', (req, res) => {
    const disciplinas = queryAll(`
        SELECT d.id, d.nome, d.semestre, d.carga_hor, d.ativo,
               p.nome AS docente_nome
        FROM disciplina d
        LEFT JOIN pessoa p ON d.id_docente = p.id
        WHERE d.id_curso = ?1
        ORDER BY d.semestre, d.nome
    `, [parseInt(req.params.id)]);

    res.json(disciplinas);
});

module.exports = router;

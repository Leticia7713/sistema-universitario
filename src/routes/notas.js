const express = require('express');
const router = express.Router();
const { queryAll, queryOne, execute } = require('../db');

// GET /api/notas/disciplina/:id — Listar alunos e notas de uma disciplina
router.get('/disciplina/:id', (req, res) => {
    const idDisciplina = parseInt(req.params.id);

    // Verificar se a disciplina existe
    const disciplina = queryOne(`
        SELECT d.id, d.nome, d.semestre, d.carga_hor,
               c.nome AS curso_nome,
               p.nome AS docente_nome
        FROM disciplina d
        JOIN curso c ON d.id_curso = c.id
        LEFT JOIN pessoa p ON d.id_docente = p.id
        WHERE d.id = ?1
    `, [idDisciplina]);

    if (!disciplina) {
        return res.status(404).json({ error: 'Disciplina não encontrada' });
    }

    // Buscar alunos matriculados com suas notas
    const alunosNotas = queryAll(`
        SELECT p.id AS id_aluno, p.nome,
               n.id AS nota_id, n.nota_1, n.nota_2,
               CASE
                   WHEN n.nota_1 IS NOT NULL AND n.nota_2 IS NOT NULL
                   THEN ROUND((n.nota_1 + n.nota_2) / 2.0, 2)
                   ELSE NULL
               END AS media,
               COALESCE(n.consolidada, 0) AS consolidada,
               m.status AS matricula_status
        FROM aluno a
        JOIN pessoa p ON a.id = p.id
        JOIN matricula m ON a.id = m.id_aluno
        JOIN disciplina d ON d.id_curso = m.id_curso
        LEFT JOIN nota n ON a.id = n.id_aluno AND n.id_disciplina = ?1
        WHERE d.id = ?1
        ORDER BY p.nome ASC
    `, [idDisciplina]);

    res.json({ disciplina, alunos: alunosNotas });
});

// PUT /api/notas — Lançar/editar notas
router.put('/', (req, res) => {
    const { id_aluno, id_disciplina, nota_1, nota_2 } = req.body;

    if (!id_aluno || !id_disciplina) {
        return res.status(400).json({
            error: 'Campos obrigatórios: id_aluno, id_disciplina'
        });
    }

    const idAluno = parseInt(id_aluno);
    const idDisciplina = parseInt(id_disciplina);

    // Verificar se a matrícula está ativa
    const disciplina = queryOne(
        'SELECT id_curso FROM disciplina WHERE id = ?1',
        [idDisciplina]
    );

    if (!disciplina) {
        return res.status(404).json({ error: 'Disciplina não encontrada.' });
    }

    const matricula = queryOne(
        `SELECT status FROM matricula WHERE id_aluno = ?1 AND id_curso = ?2`,
        [idAluno, disciplina.id_curso]
    );

    if (!matricula) {
        return res.status(404).json({ error: 'Aluno não matriculado neste curso.' });
    }

    if (matricula.status === 'TRANCADA') {
        return res.status(400).json({
            error: 'Não é possível lançar notas: o aluno possui matrícula trancada nesta disciplina.'
        });
    }

    // Verificar se a nota já está consolidada
    const notaExistente = queryOne(
        `SELECT id, consolidada FROM nota WHERE id_aluno = ?1 AND id_disciplina = ?2`,
        [idAluno, idDisciplina]
    );

    if (notaExistente && notaExistente.consolidada) {
        return res.status(400).json({
            error: 'Esta nota já foi consolidada e não pode ser alterada.'
        });
    }

    if (notaExistente) {
        // Atualizar nota existente
        execute(
            `UPDATE nota SET nota_1 = ?1, nota_2 = ?2 WHERE id_aluno = ?3 AND id_disciplina = ?4`,
            [nota_1 !== undefined ? nota_1 : null, nota_2 !== undefined ? nota_2 : null, idAluno, idDisciplina]
        );
    } else {
        // Inserir nova nota
        execute(
            `INSERT INTO nota (id_aluno, id_disciplina, nota_1, nota_2, consolidada)
             VALUES (?1, ?2, ?3, ?4, 0)`,
            [idAluno, idDisciplina, nota_1 !== undefined ? nota_1 : null, nota_2 !== undefined ? nota_2 : null]
        );
    }

    res.json({ message: 'Notas atualizadas com sucesso!' });
});

// PATCH /api/notas/consolidar — Consolidar nota
router.patch('/consolidar', (req, res) => {
    const { id_aluno, id_disciplina } = req.body;

    const nota = queryOne(
        `SELECT id, nota_1, nota_2, consolidada FROM nota
         WHERE id_aluno = ?1 AND id_disciplina = ?2`,
        [parseInt(id_aluno), parseInt(id_disciplina)]
    );

    if (!nota) {
        return res.status(404).json({ error: 'Nota não encontrada.' });
    }

    if (nota.consolidada) {
        return res.status(400).json({ error: 'Nota já está consolidada.' });
    }

    if (nota.nota_1 === null || nota.nota_2 === null) {
        return res.status(400).json({ error: 'Ambas as notas devem ser preenchidas para consolidar.' });
    }

    execute(
        `UPDATE nota SET consolidada = 1 WHERE id_aluno = ?1 AND id_disciplina = ?2`,
        [parseInt(id_aluno), parseInt(id_disciplina)]
    );

    res.json({ message: 'Nota consolidada com sucesso!' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { queryAll, queryOne, execute, transaction } = require('../db');

// GET /api/alunos — Listar todos os alunos
router.get('/', (req, res) => {
    const { busca } = req.query;
    let query = `
        SELECT p.id, p.nome, p.email, p.endereco, p.telefone, p.ativo,
               a.cpf, a.data_nasc
        FROM pessoa p
        JOIN aluno a ON p.id = a.id
    `;
    const params = [];

    if (busca) {
        query += ` WHERE p.nome LIKE ?1 OR a.cpf LIKE ?2 OR p.email LIKE ?3`;
        const term = `%${busca}%`;
        params.push(term, term, term);
    }

    query += ` ORDER BY p.nome ASC`;

    const alunos = queryAll(query, params);
    res.json(alunos);
});

// GET /api/alunos/:id — Buscar aluno por ID
router.get('/:id', (req, res) => {
    const aluno = queryOne(`
        SELECT p.id, p.nome, p.email, p.endereco, p.telefone, p.ativo,
               a.cpf, a.data_nasc
        FROM pessoa p
        JOIN aluno a ON p.id = a.id
        WHERE p.id = ?1
    `, [parseInt(req.params.id)]);

    if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const matriculas = queryAll(`
        SELECT m.id, m.data_inicio, m.status, c.nome AS curso_nome
        FROM matricula m
        JOIN curso c ON m.id_curso = c.id
        WHERE m.id_aluno = ?1
    `, [parseInt(req.params.id)]);

    res.json({ ...aluno, matriculas });
});

// POST /api/alunos — Cadastrar novo aluno
router.post('/', (req, res) => {
    const { nome, email, endereco, telefone, cpf, data_nasc } = req.body;

    if (!nome || !email || !cpf || !data_nasc) {
        return res.status(400).json({
            error: 'Campos obrigatórios: nome, email, cpf, data_nasc'
        });
    }

    const nascimento = new Date(data_nasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth() - nascimento.getMonth();
    if (mesAtual < 0 || (mesAtual === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    if (idade < 18) {
        return res.status(400).json({
            error: 'O aluno deve ter pelo menos 18 anos para se matricular.'
        });
    }

    try {
        const result = transaction(() => {
            const pessoaResult = execute(
                `INSERT INTO pessoa (nome, email, endereco, telefone, tipo, ativo)
                 VALUES (?1, ?2, ?3, ?4, 'PESSOA_FISICA', 1)`,
                [nome, email, endereco || null, telefone || null]
            );
            const pessoaId = pessoaResult.lastInsertRowid;

            execute(
                `INSERT INTO aluno (id, cpf, data_nasc) VALUES (?1, ?2, ?3)`,
                [pessoaId, cpf, data_nasc]
            );

            return pessoaId;
        });

        res.status(201).json({ id: result, message: 'Aluno cadastrado com sucesso!' });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'CPF ou email já cadastrado.' });
        }
        throw err;
    }
});

// PUT /api/alunos/:id — Editar aluno
router.put('/:id', (req, res) => {
    const { nome, email, endereco, telefone, cpf, data_nasc } = req.body;
    const id = parseInt(req.params.id);

    try {
        transaction(() => {
            execute(
                `UPDATE pessoa SET nome = ?1, email = ?2, endereco = ?3, telefone = ?4
                 WHERE id = ?5`,
                [nome, email, endereco, telefone, id]
            );
            execute(
                `UPDATE aluno SET cpf = ?1, data_nasc = ?2 WHERE id = ?3`,
                [cpf, data_nasc, id]
            );
        });

        res.json({ message: 'Aluno atualizado com sucesso!' });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'CPF já cadastrado para outro aluno.' });
        }
        throw err;
    }
});

// POST /api/alunos/matricula — Realizar matrícula
router.post('/matricula', (req, res) => {
    const { id_aluno, id_curso } = req.body;

    if (!id_aluno || !id_curso) {
        return res.status(400).json({ error: 'Campos obrigatórios: id_aluno, id_curso' });
    }

    const aluno = queryOne('SELECT id FROM aluno WHERE id = ?1', [parseInt(id_aluno)]);
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });

    const curso = queryOne('SELECT id FROM curso WHERE id = ?1 AND ativo = 1', [parseInt(id_curso)]);
    if (!curso) return res.status(404).json({ error: 'Curso não encontrado ou inativo.' });

    const matriculaExistente = queryOne(
        `SELECT id FROM matricula WHERE id_aluno = ?1 AND id_curso = ?2 AND status = 'ATIVA'`,
        [parseInt(id_aluno), parseInt(id_curso)]
    );
    if (matriculaExistente) {
        return res.status(409).json({ error: 'Aluno já possui matrícula ativa neste curso.' });
    }

    try {
        const matriculaId = transaction(() => {
            const dataInicio = new Date().toISOString().split('T')[0];
            const result = execute(
                `INSERT INTO matricula (id_aluno, id_curso, data_inicio, status)
                 VALUES (?1, ?2, ?3, 'ATIVA')`,
                [parseInt(id_aluno), parseInt(id_curso), dataInicio]
            );
            const mId = result.lastInsertRowid;

            const vencimento = new Date();
            vencimento.setDate(vencimento.getDate() + 1);
            const linhaDigitavel = `00019.${Math.random().toString().slice(2, 7)} ${Math.random().toString().slice(2, 7)}.${Math.random().toString().slice(2, 7)}`;

            execute(
                `INSERT INTO boleto (id_matricula, valor, vencimento, status, linha_digitavel)
                 VALUES (?1, 1850.00, ?2, 'PENDENTE', ?3)`,
                [mId, vencimento.toISOString().split('T')[0], linhaDigitavel]
            );

            return mId;
        });

        res.status(201).json({ id: matriculaId, message: 'Matrícula realizada com sucesso! Boleto gerado.' });
    } catch (err) {
        throw err;
    }
});

module.exports = router;

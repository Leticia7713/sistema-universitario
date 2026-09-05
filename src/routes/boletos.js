const express = require('express');
const router = express.Router();
const { queryAll, queryOne, execute } = require('../db');

// GET /api/boletos — Listar todos os boletos
router.get('/', (req, res) => {
    const boletos = queryAll(`
        SELECT b.id, b.valor, b.vencimento, b.status, b.data_pagamento,
               b.linha_digitavel, b.id_matricula,
               p.nome AS aluno_nome, c.nome AS curso_nome
        FROM boleto b
        JOIN matricula m ON b.id_matricula = m.id
        JOIN aluno a ON m.id_aluno = a.id
        JOIN pessoa p ON a.id = p.id
        JOIN curso c ON m.id_curso = c.id
        ORDER BY b.vencimento DESC
    `);
    res.json(boletos);
});

// PATCH /api/boletos/:id/pagar — Registrar pagamento de boleto
router.patch('/:id/pagar', (req, res) => {
    const id = parseInt(req.params.id);

    const boleto = queryOne('SELECT id, status FROM boleto WHERE id = ?1', [id]);
    if (!boleto) {
        return res.status(404).json({ error: 'Boleto não encontrado.' });
    }

    if (boleto.status === 'PAGO') {
        return res.status(400).json({ error: 'Este boleto já foi pago.' });
    }

    if (boleto.status === 'CANCELADO') {
        return res.status(400).json({ error: 'Este boleto foi cancelado.' });
    }

    const dataPagamento = new Date().toISOString().split('T')[0];
    execute(
        `UPDATE boleto SET status = 'PAGO', data_pagamento = ?1 WHERE id = ?2`,
        [dataPagamento, id]
    );

    res.json({ message: 'Pagamento registrado com sucesso!' });
});

module.exports = router;

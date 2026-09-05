const express = require('express');
const router = express.Router();
const { queryAll, queryOne, execute } = require('../db');

// GET /api/fornecedores — Listar todos os fornecedores
router.get('/', (req, res) => {
    const { busca } = req.query;
    let query = `
        SELECT p.id, p.nome, p.email, p.endereco, p.telefone, p.ativo,
               f.cnpj, f.categoria
        FROM pessoa p
        JOIN fornecedor f ON p.id = f.id
    `;
    const params = [];

    if (busca) {
        query += ` WHERE p.nome LIKE ?1 OR f.cnpj LIKE ?2`;
        const term = `%${busca}%`;
        params.push(term, term);
    }

    query += ` ORDER BY p.nome ASC`;

    const fornecedores = queryAll(query, params);
    res.json(fornecedores);
});

// GET /api/fornecedores/:id — Detalhe do fornecedor
router.get('/:id', (req, res) => {
    const fornecedor = queryOne(`
        SELECT p.id, p.nome, p.email, p.endereco, p.telefone, p.ativo,
               f.cnpj, f.categoria
        FROM pessoa p
        JOIN fornecedor f ON p.id = f.id
        WHERE p.id = ?1
    `, [parseInt(req.params.id)]);

    if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Buscar pedidos de compra associados
    const pedidos = queryAll(`
        SELECT pc.id, pc.descricao, pc.valor, pc.status, pc.data_pedido
        FROM pedido_compra pc
        WHERE pc.id_fornecedor = ?1
        ORDER BY pc.data_pedido DESC
    `, [parseInt(req.params.id)]);

    res.json({ ...fornecedor, pedidos });
});

// PATCH /api/fornecedores/:id/inativar — Inativar fornecedor
router.patch('/:id/inativar', (req, res) => {
    const id = parseInt(req.params.id);

    // Verificar se o fornecedor existe
    const fornecedor = queryOne(
        `SELECT p.ativo FROM pessoa p JOIN fornecedor f ON p.id = f.id WHERE p.id = ?1`,
        [id]
    );

    if (!fornecedor) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    if (!fornecedor.ativo) {
        return res.status(400).json({ error: 'Fornecedor já está inativo.' });
    }

    // Verificar pendências (pedidos pendentes/aprovados)
    const pendencias = queryOne(
        `SELECT COUNT(*) as total FROM pedido_compra
         WHERE id_fornecedor = ?1 AND status IN ('PENDENTE', 'APROVADO')`,
        [id]
    );

    if (pendencias && pendencias.total > 0) {
        return res.status(409).json({
            error: 'Não é possível inativar: Existem pendências vinculadas.',
            pendencias: pendencias.total
        });
    }

    // Inativar fornecedor
    execute('UPDATE pessoa SET ativo = 0 WHERE id = ?1', [id]);

    res.json({ message: 'Fornecedor inativado com sucesso!' });
});

// PATCH /api/fornecedores/:id/ativar — Reativar fornecedor
router.patch('/:id/ativar', (req, res) => {
    const id = parseInt(req.params.id);

    execute('UPDATE pessoa SET ativo = 1 WHERE id = ?1', [id]);
    res.json({ message: 'Fornecedor ativado com sucesso!' });
});

module.exports = router;

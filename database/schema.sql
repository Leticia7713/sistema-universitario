-- ============================================================
--  SCHEMA DO SISTEMA DE GESTÃO UNIVERSITÁRIA
--  Adaptado para SQLite
-- ============================================================

-- Tabela de Usuários Administradores
CREATE TABLE IF NOT EXISTS usuario_adm (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL
);

-- Tabela base: Pessoa (generalização)
CREATE TABLE IF NOT EXISTS pessoa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    endereco TEXT,
    telefone TEXT,
    tipo TEXT NOT NULL CHECK(tipo IN ('PESSOA_FISICA', 'PESSOA_JURIDICA')),
    ativo INTEGER NOT NULL DEFAULT 1
);

-- Tabela Aluno (especialização de Pessoa)
CREATE TABLE IF NOT EXISTS aluno (
    id INTEGER PRIMARY KEY,
    cpf TEXT NOT NULL UNIQUE,
    data_nasc TEXT NOT NULL,
    FOREIGN KEY (id) REFERENCES pessoa(id) ON DELETE CASCADE
);

-- Tabela Docente (especialização de Pessoa)
CREATE TABLE IF NOT EXISTS docente (
    id INTEGER PRIMARY KEY,
    tipo_contrato TEXT NOT NULL CHECK(tipo_contrato IN ('CLT', 'PJ')),
    data_admissao TEXT NOT NULL,
    FOREIGN KEY (id) REFERENCES pessoa(id) ON DELETE CASCADE
);

-- Tabela Fornecedor (especialização de Pessoa)
CREATE TABLE IF NOT EXISTS fornecedor (
    id INTEGER PRIMARY KEY,
    cnpj TEXT NOT NULL UNIQUE,
    categoria TEXT NOT NULL,
    FOREIGN KEY (id) REFERENCES pessoa(id) ON DELETE CASCADE
);

-- Tabela Curso
CREATE TABLE IF NOT EXISTS curso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    duracao_sem INTEGER NOT NULL,
    ativo INTEGER NOT NULL DEFAULT 1
);

-- Tabela Disciplina
CREATE TABLE IF NOT EXISTS disciplina (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    semestre INTEGER NOT NULL,
    carga_hor INTEGER NOT NULL,
    id_curso INTEGER NOT NULL,
    id_docente INTEGER,
    ativo INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (id_curso) REFERENCES curso(id),
    FOREIGN KEY (id_docente) REFERENCES docente(id)
);

-- Tabela Matrícula
CREATE TABLE IF NOT EXISTS matricula (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_aluno INTEGER NOT NULL,
    id_curso INTEGER NOT NULL,
    data_inicio TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ATIVA' CHECK(status IN ('ATIVA', 'TRANCADA', 'CONCLUIDA', 'CANCELADA')),
    FOREIGN KEY (id_aluno) REFERENCES aluno(id),
    FOREIGN KEY (id_curso) REFERENCES curso(id)
);

-- Tabela Nota
CREATE TABLE IF NOT EXISTS nota (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_aluno INTEGER NOT NULL,
    id_disciplina INTEGER NOT NULL,
    nota_1 REAL,
    nota_2 REAL,
    media REAL GENERATED ALWAYS AS (
        CASE 
            WHEN nota_1 IS NOT NULL AND nota_2 IS NOT NULL 
            THEN ROUND((nota_1 + nota_2) / 2.0, 2)
            ELSE NULL 
        END
    ) STORED,
    consolidada INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (id_aluno) REFERENCES aluno(id),
    FOREIGN KEY (id_disciplina) REFERENCES disciplina(id),
    UNIQUE(id_aluno, id_disciplina)
);

-- Tabela Pedido de Compra
CREATE TABLE IF NOT EXISTS pedido_compra (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_fornecedor INTEGER NOT NULL,
    id_adm INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK(status IN ('PENDENTE', 'APROVADO', 'CONCLUIDO', 'CANCELADO')),
    data_pedido TEXT NOT NULL DEFAULT (DATE('now')),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id),
    FOREIGN KEY (id_adm) REFERENCES usuario_adm(id)
);

-- Tabela Boleto
CREATE TABLE IF NOT EXISTS boleto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_matricula INTEGER NOT NULL,
    valor REAL NOT NULL,
    vencimento TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK(status IN ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO')),
    data_pagamento TEXT,
    linha_digitavel TEXT,
    FOREIGN KEY (id_matricula) REFERENCES matricula(id)
);

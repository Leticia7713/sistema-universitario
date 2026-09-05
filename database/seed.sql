-- ============================================================
--  DADOS DE EXEMPLO (SEED)
--  Baseado nos INSERTs da 1ª entrega
-- ============================================================

-- Usuários Administradores
INSERT OR IGNORE INTO usuario_adm (nome, email, senha) VALUES
('Administrador Geral', 'admin@universidade.edu.br', 'hash_senha_admin'),
('Coordenador Acadêmico', 'coord@universidade.edu.br', 'hash_senha_coord');

-- Pessoas (base)
INSERT OR IGNORE INTO pessoa (nome, email, endereco, telefone, tipo, ativo) VALUES
-- Alunos (PF) - IDs 1 a 4
('Ana Paula Ferreira',    'ana@email.com',    'Rua das Flores, 10 – São Paulo',    '(11) 91111-0001', 'PESSOA_FISICA',   1),
('Bruno Carvalho',        'bruno@email.com',  'Av. Central, 200 – São Paulo',       '(11) 91111-0002', 'PESSOA_FISICA',   1),
('Carla Mendes',          'carla@email.com',  'Rua Augusta, 50 – São Paulo',        '(11) 91111-0003', 'PESSOA_FISICA',   1),
('Diego Santos',          'diego@email.com',  'Rua XV de Novembro, 99 – Campinas',  '(19) 91111-0004', 'PESSOA_FISICA',   1),
-- Docentes (PF) - IDs 5 a 8
('Dr. Alexandre Costa',   'alexandre@univ.edu', 'Rua do Saber, 1 – São Paulo',     '(11) 92222-0001', 'PESSOA_FISICA',   1),
('Profa. Beatriz Lima',   'beatriz@univ.edu',   'Av. Universitária, 5 – São Paulo', '(11) 92222-0002', 'PESSOA_FISICA',   1),
('Prof. Carlos Ribeiro',  'carlos@univ.edu',    'Rua da Ciência, 3 – São Paulo',    '(11) 92222-0003', 'PESSOA_FISICA',   1),
('Dra. Diana Ferreira',   'diana@univ.edu',     'Rua da Pesquisa, 7 – São Paulo',   '(11) 92222-0004', 'PESSOA_FISICA',   0),
-- Fornecedores (PJ) - IDs 9 a 12
('TechSupply Ltda.',       'contato@techsupply.com.br',  'Av. Industrial, 100 – SP', '(11) 93333-0001', 'PESSOA_JURIDICA', 1),
('Papelaria Central S.A.', 'contato@papelaria.com.br',   'Rua do Comércio, 50 – SP', '(11) 93333-0002', 'PESSOA_JURIDICA', 1),
('Limpeza Total ME',       'contato@limpezatotal.com.br','Rua da Manutenção, 5 – SP','(11) 93333-0003', 'PESSOA_JURIDICA', 0),
('InfoSoft Sistemas',      'contato@infosoft.com.br',    'Rua da TI, 200 – SP',      '(11) 93333-0004', 'PESSOA_JURIDICA', 1);

-- Alunos (referenciando os ids de pessoa 1–4)
INSERT OR IGNORE INTO aluno (id, cpf, data_nasc) VALUES
(1, '123.456.789-01', '2003-05-15'),
(2, '234.567.890-12', '2005-03-22'),
(3, '345.678.901-23', '2000-08-10'),
(4, '456.789.012-34', '2006-01-30');

-- Docentes (referenciando os ids de pessoa 5–8)
INSERT OR IGNORE INTO docente (id, tipo_contrato, data_admissao) VALUES
(5, 'CLT', '2020-02-01'),
(6, 'PJ',  '2021-08-15'),
(7, 'CLT', '2019-03-01'),
(8, 'CLT', '2018-06-01');

-- Fornecedores (referenciando os ids de pessoa 9–12)
INSERT OR IGNORE INTO fornecedor (id, cnpj, categoria) VALUES
(9,  '12.345.678/0001-90', 'Tecnologia'),
(10, '23.456.789/0001-01', 'Material Escritório'),
(11, '34.567.890/0001-12', 'Serviços de Limpeza'),
(12, '45.678.901/0001-23', 'Software e Licenças');

-- Cursos
INSERT OR IGNORE INTO curso (nome, descricao, duracao_sem, ativo) VALUES
('Análise e Desenvolvimento de Sistemas', 'Formação tecnológica em ADS', 5, 1),
('Ciência da Computação',                 'Bacharelado em CC',           8, 1),
('Engenharia de Software',                'Bacharelado em ES',           8, 1),
('Sistemas de Informação',               'Bacharelado em SI',           8, 1);

-- Disciplinas (3º semestre de ADS – id_curso=1)
INSERT OR IGNORE INTO disciplina (nome, semestre, carga_hor, id_curso, id_docente, ativo) VALUES
('Banco de Dados I',                       3, 80, 1, 5, 1),
('Programação Orientada a Objetos',        3, 80, 1, 6, 1),
('Análise de Sistemas',                    3, 60, 1, 7, 1),
('Engenharia de Software',                 4, 60, 1, 7, 1),
('Estrutura de Dados',                     2, 80, 1, 6, 1);

-- Matrículas
INSERT OR IGNORE INTO matricula (id_aluno, id_curso, data_inicio, status) VALUES
(1, 1, '2025-02-01', 'ATIVA'),
(2, 2, '2025-02-01', 'ATIVA'),
(3, 3, '2024-08-01', 'TRANCADA'),
(4, 1, '2025-02-01', 'ATIVA');

-- Notas
INSERT OR IGNORE INTO nota (id_aluno, id_disciplina, nota_1, nota_2, consolidada) VALUES
(1, 1, 8.5, NULL,  0),
(1, 2, 9.0, 8.0,   1),
(1, 3, 7.5, NULL,  0),
(2, 1, 7.0, 8.5,   0),
(2, 2, 6.5, 7.0,   0),
(2, 3, 8.0, NULL,  0),
(4, 1, 9.5, 9.0,   0),
(4, 2, 8.0, 8.5,   0),
(4, 3, 7.0, 7.5,   0);

-- Pedidos de Compra
INSERT OR IGNORE INTO pedido_compra (id_fornecedor, id_adm, descricao, valor, status, data_pedido) VALUES
(9,  1, 'Compra de 20 notebooks para laboratório', 60000.00, 'CONCLUIDO', '2025-01-10'),
(10, 1, 'Resmas de papel A4 e material de escritório', 850.00, 'PENDENTE', '2025-02-15'),
(12, 1, 'Renovação de licenças de software',         12000.00, 'PENDENTE', '2025-02-20');

-- Boletos
INSERT OR IGNORE INTO boleto (id_matricula, valor, vencimento, status, data_pagamento, linha_digitavel) VALUES
(1, 1850.00, '2025-02-03', 'PAGO',        '2025-02-02', '00019.23456 78901.234567 89012.345678 9 00100185000'),
(2, 1950.00, '2025-02-03', 'PAGO',        '2025-02-02', '00019.34567 89012.345678 90123.456789 0 00100195000'),
(3, 1750.00, '2024-08-03', 'CANCELADO',   NULL,         '00019.45678 90123.456789 01234.567890 1 00100175000'),
(4, 1850.00, '2025-02-03', 'PAGO',        '2025-02-02', '00019.56789 01234.567890 12345.678901 2 00100185000');

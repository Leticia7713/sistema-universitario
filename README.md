# 🎓 UniGestão — Sistema de Gestão Universitária

**Projeto Integrador — 4º Semestre TADS/TSI**  
**SENAC — Serviço Nacional de Aprendizagem Comercial**  
**EAD — Ensino a Distância — 2026**

---

## 👥 Integrantes do Grupo

| Nome |
|------|
| Ariane Cursino da Silva |
| Fabian Rossetti |
| Leticia Soares da Silva |
| Marina Muttoni Roncatto |
| Rodrigo de Luca |

**Professor orientador:** Adriano Milanez

---

## 🔄 Revisita do Projeto (1ª Entrega → 2ª Entrega)

> **⚠️ Nota sobre a Alteração do Escopo:**  
> Inicialmente, o projeto visava desenvolver uma plataforma digital de operações bancárias integradas ao WhatsApp para o público idoso, com autenticação facial e chatbot guiado por áudio. Devido à acentuada complexidade técnica e à necessidade de integração com grandes plataformas proprietárias (Meta/WhatsApp Business API e ferramentas externas de biometria) para viabilizar uma Prova de Conceito funcional no prazo da 2ª entrega, o grupo optou por redefinir o tema para o **Sistema de Gestão Universitária (UniGestão)**. O documento referente à Etapa I do Sistema de Gestão Universitária está disponível no arquivo PROJETO-INTEGRADOR-GRUPO-9-ETAPA-1.pdf neste repositório e no link ao final deste README.

Na primeira etapa, desenvolvemos a especificação, ideação e fundamentação do sistema de gestão universitária conforme as normas ABNT, incluindo:

- **1. Visão Geral do Produto (Contextualização):** Mapeamento do problema identificado, público-alvo, contexto de uso, justificativa da solução, definição da solução como aplicação Web responsiva e descrição das principais funcionalidades previstas.
- **2. Definição das Partes Interessadas (Stakeholders):** Mapeamento do papel e das necessidades de Administradores, Docentes, Discentes, Gestores Financeiros/Compras e Equipe de TI.
- **3. Personas:** Criação detalhada das personas *Carlos Andrade* (Administrador Acadêmico) e *Profa. Beatriz Lima* (Docente), abordando perfis, objetivos, necessidades, dores e nível de familiaridade tecnológica.
- **4. Jornada do Usuário:** Mapeamento em etapas das jornadas operacionais das personas, desde a matrícula e emissão de boletos até a consulta de turmas e lançamento de notas.


### Prova de Conceito Escolhida

Para a 2ª entrega, optamos por implementar **todos os 4 cenários** da 1ª etapa como prova de conceito funcional, transformando os artefatos de modelagem em um sistema web completo:

| Cenário da 1ª Entrega | Implementação na 2ª Entrega |
|------------------------|----------------------------|
| Matricular Alunos | Formulário de cadastro com validação + geração automática de matrícula e boleto |
| Consultar Docentes | Listagem com busca, detalhe com disciplinas, ativar/inativar |
| Inativar Fornecedores | Verificação de pendências antes de inativar, com confirmação |
| Gerenciar Notas | Seleção por curso/disciplina, edição inline, consolidação |

**Justificativa:** Implementar os 4 cenários permite demonstrar que a modelagem da 1ª entrega é consistente e viável como sistema real. O banco de dados (schema e dados de exemplo) foi adaptado diretamente do DDL e INSERTs entregues na 1ª etapa, comprovando que a modelagem conceitual se traduz fielmente em código funcional.

---

## 📋 Sobre o Projeto

Sistema web de gestão universitária desenvolvido como prova de conceito do Projeto Integrador. A aplicação permite:

- **Matricular Alunos** — Cadastro de novos alunos com validação de idade (≥ 18 anos) e geração automática de boleto
- **Consultar Alunos** — Busca por nome, CPF ou email, com visualização de matrículas
- **Consultar Docentes** — Listagem alfabética, busca por nome, visualização de disciplinas e ativação/inativação
- **Gestão de Fornecedores** — Inativação com verificação de pendências (pedidos em aberto)
- **Gerenciar Notas** — Lançamento de notas por disciplina, com bloqueio para matrículas trancadas e notas consolidadas

### Regras de Negócio Implementadas

- ✅ Aluno deve ter **≥ 18 anos** para se matricular
- ✅ Boleto é **gerado automaticamente** ao realizar matrícula
- ✅ Não é possível **inativar fornecedor** com pedidos pendentes
- ✅ Nota **consolidada** não pode ser alterada
- ✅ Não é possível **lançar notas** para aluno com matrícula trancada
- ✅ Docentes podem ser **ativados/inativados** com confirmação

---

## 📋 Sobre o Projeto

Sistema web de gestão universitária desenvolvido como prova de conceito do Projeto Integrador. A aplicação permite:

- **Matricular Alunos** — Cadastro de novos alunos com validação de idade (≥ 18 anos) e geração automática de boleto
- **Consultar Alunos** — Busca por nome, CPF ou email, com visualização de matrículas
- **Consultar Docentes** — Listagem alfabética, busca por nome, visualização de disciplinas e ativação/inativação
- **Gestão de Fornecedores** — Inativação com verificação de pendências (pedidos em aberto)
- **Gerenciar Notas** — Lançamento de notas por disciplina, com bloqueio para matrículas trancadas e notas consolidadas

### Regras de Negócio Implementadas

- ✅ Aluno deve ter **≥ 18 anos** para se matricular
- ✅ Boleto é **gerado automaticamente** ao realizar matrícula
- ✅ Não é possível **inativar fornecedor** com pedidos pendentes
- ✅ Nota **consolidada** não pode ser alterada
- ✅ Não é possível **lançar notas** para aluno com matrícula trancada
- ✅ Docentes podem ser **ativados/inativados** com confirmação


## Status do Projeto & Avaliação da POC

A presente implementação consiste na **Proof of Concept (POC)** do Sistema de Gestão Universitária (SGU). O objetivo principal desta versão foi validar a arquitetura técnica adotada e demonstrar a viabilidade dos fluxos operacionais centrais.

### Backlog de Evoluções Futuras

Para a evolução do sistema rumo a uma versão de produção (*Production-Ready*), os seguintes pontos ficam mapeados para desenvolvimento futuro:

1. **Autenticação e Controle de Acesso (RBAC):**
   - Implantação de autenticação via JWT/Session com diferentes níveis de acesso (ex: *Administrador/Secretário* vs. *Docente*) para atender às diretrizes da LGPD e restrição de pautas acadêmicas.
2. **Infraestrutura e Persistência:**
   - Migração completa do banco de dados em memória/desenvolvimento para ambiente gerenciado (PostgreSQL) com migrações automatizadas.

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js + Express |
| **Banco de Dados** | SQLite (via sql.js) |
| **Design** | Dark Theme, Glassmorphism, Responsivo |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior instalado

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone <URL_DO_REPOSITORIO>
cd sistema-universitario
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Inicie o servidor:**
```bash
npm start
```

4. **Acesse no navegador:**
```
http://localhost:3000
```

O banco de dados é criado automaticamente na primeira execução, incluindo dados de exemplo.

### Para desenvolvimento (hot reload):
```bash
npm run dev
```

---

## 📁 Estrutura do Projeto

```
sistema-universitario/
├── server.js                    # Servidor Express principal
├── package.json                 # Dependências do projeto
├── .env                         # Variáveis de ambiente
├── database/
│   ├── schema.sql               # Estrutura do banco de dados
│   └── seed.sql                 # Dados de exemplo
├── src/
│   ├── db.js                    # Conexão e helpers do banco
│   ├── middleware/
│   │   └── errorHandler.js      # Tratamento de erros
│   └── routes/
│       ├── alunos.js            # API de alunos e matrículas
│       ├── docentes.js          # API de docentes
│       ├── fornecedores.js      # API de fornecedores
│       ├── notas.js             # API de notas
│       ├── cursos.js            # API de cursos e disciplinas
│       └── boletos.js           # API de boletos
└── public/
    ├── index.html               # Página principal (SPA)
    ├── css/
    │   └── style.css            # Estilos do sistema
    └── js/
        ├── app.js               # Core, navegação e utilitários
        ├── alunos.js            # Módulo de alunos
        ├── docentes.js          # Módulo de docentes
        ├── fornecedores.js      # Módulo de fornecedores
        └── notas.js             # Módulo de notas
```

---

## 📊 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard` | Estatísticas gerais |
| GET | `/api/alunos` | Listar alunos |
| POST | `/api/alunos` | Cadastrar aluno |
| POST | `/api/alunos/matricula` | Realizar matrícula |
| GET | `/api/docentes` | Listar docentes |
| PATCH | `/api/docentes/:id/status` | Ativar/Inativar docente |
| GET | `/api/fornecedores` | Listar fornecedores |
| PATCH | `/api/fornecedores/:id/inativar` | Inativar fornecedor |
| GET | `/api/notas/disciplina/:id` | Notas da disciplina |
| PUT | `/api/notas` | Lançar/editar notas |
| GET | `/api/cursos` | Listar cursos |
| GET | `/api/boletos` | Listar boletos |

---

## Vídeo da aplicação



https://github.com/user-attachments/assets/5cfeab58-7031-4146-af48-db8fda0a403e



---

## PDF do projeto (Etapa I)

[Clique aqui para baixar o PDF](https://github.com/Leticia7713/sistema-universitario/blob/b3134fcfe805642b63bfd5498d70cd581e32c0a8/PROJETO-INTEGRADOR-GRUPO-9-ATUALIZADO.pdf)

---

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte do Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas do SENAC.

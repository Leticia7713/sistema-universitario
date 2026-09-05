const { execute, transaction, initializeDatabase } = require('./src/db');

initializeDatabase().then(() => {
    try {
        const result = transaction(() => {
            const pessoaResult = execute(`INSERT INTO pessoa (nome, email, endereco, telefone, tipo, ativo) VALUES (?1, ?2, ?3, ?4, 'PESSOA_FISICA', 1)`, ['Teste', 'teste@teste.com', null, null]);
            const pessoaId = pessoaResult.lastInsertRowid;
            execute(`INSERT INTO aluno (id, cpf, data_nasc) VALUES (?1, ?2, ?3)`, [pessoaId, '12345678901', '2000-01-01']);
            return pessoaId;
        });
        console.log("Success:", result);
    } catch(err) {
        console.error("Error:", err);
    }
});

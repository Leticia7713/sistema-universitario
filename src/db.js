const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.resolve(process.env.DB_PATH || './database/universidade.db');
const dbDir = path.dirname(DB_PATH);

let db = null;

/**
 * Inicializa o banco de dados SQLite usando sql.js
 * Cria as tabelas e popula com dados de exemplo se necessário
 */
async function initializeDatabase() {
    const SQL = await initSqlJs();

    // Garante que o diretório do banco existe
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Carrega o banco existente ou cria um novo
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log('✅ Banco de dados carregado.');
    } else {
        db = new SQL.Database();
        console.log('📦 Criando novo banco de dados...');

        // Habilita foreign keys
        db.run('PRAGMA foreign_keys = ON;');

        // Executa o schema
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        db.run(schema);
        console.log('✅ Schema criado com sucesso!');

        // Executa o seed
        const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
        const seed = fs.readFileSync(seedPath, 'utf-8');
        db.run(seed);
        console.log('✅ Dados de exemplo inseridos com sucesso!');

        // Salva o banco no disco
        saveDatabase();
    }

    return db;
}

/**
 * Salva o banco de dados no disco
 */
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

/**
 * Retorna a instância do banco de dados
 */
function getDb() {
    if (!db) {
        throw new Error('Banco de dados não inicializado. Chame initializeDatabase() primeiro.');
    }
    return db;
}

/**
 * Executa uma query SELECT e retorna todos os resultados como array de objetos
 */
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);

    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

/**
 * Executa uma query SELECT e retorna o primeiro resultado como objeto
 */
function queryOne(sql, params = []) {
    const results = queryAll(sql, params);
    return results.length > 0 ? results[0] : null;
}

let inTransaction = false;

/**
 * Executa uma query INSERT/UPDATE/DELETE e retorna info sobre a execução
 */
function execute(sql, params = []) {
    db.run(sql, params);
    const changes = db.getRowsModified();
    const lastId = queryOne('SELECT last_insert_rowid() as id');
    if (!inTransaction) {
        saveDatabase(); // Salva após cada modificação
    }
    return { changes, lastInsertRowid: lastId ? lastId.id : 0 };
}

/**
 * Executa múltiplas operações como transação
 */
function transaction(callback) {
    db.run('BEGIN TRANSACTION');
    inTransaction = true;
    try {
        const result = callback();
        db.run('COMMIT');
        inTransaction = false;
        saveDatabase();
        return result;
    } catch (err) {
        db.run('ROLLBACK');
        inTransaction = false;
        throw err;
    }
}

module.exports = {
    initializeDatabase,
    getDb,
    queryAll,
    queryOne,
    execute,
    transaction,
    saveDatabase
};

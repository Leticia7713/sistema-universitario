/**
 * Middleware de tratamento de erros
 */
function errorHandler(err, req, res, next) {
    console.error('❌ Erro:', err.message);
    console.error(err.stack);

    // Erros de validação do SQLite
    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({
            error: 'Conflito de dados',
            message: 'O registro já existe ou viola uma restrição do banco de dados.'
        });
    }

    res.status(err.status || 500).json({
        error: err.message || 'Erro interno do servidor',
        message: 'Ocorreu um erro inesperado. Tente novamente.'
    });
}

module.exports = errorHandler;

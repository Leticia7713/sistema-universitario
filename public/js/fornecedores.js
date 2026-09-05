/* ============================================================
   FORNECEDORES.JS — Módulo de Fornecedores (Gestão e Inativação)
   ============================================================ */

// ---- Carregar lista de fornecedores ---- //
async function loadFornecedoresLista() {
    const tbody = document.getElementById('tbodyFornecedores');
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><span class="loading-spinner"></span> Carregando...</td></tr>';

    try {
        const fornecedores = await apiGet('/fornecedores');

        if (fornecedores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum fornecedor cadastrado</td></tr>';
            return;
        }

        renderFornecedores(fornecedores);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Erro: ${err.message}</td></tr>`;
        showToast(err.message, 'error');
    }
}

function renderFornecedores(fornecedores) {
    const tbody = document.getElementById('tbodyFornecedores');
    tbody.innerHTML = fornecedores.map(f => `
        <tr>
            <td><strong>${f.nome}</strong></td>
            <td>${f.cnpj}</td>
            <td>
                <span class="badge badge-info">${f.categoria}</span>
            </td>
            <td>${f.email}</td>
            <td>
                <span class="badge ${f.ativo ? 'badge-success' : 'badge-danger'}">
                    ${f.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-icon" onclick="verDetalheFornecedor(${f.id})" title="Ver detalhes">
                    👁️
                </button>
                ${f.ativo ? `
                    <button class="btn btn-sm btn-danger btn-icon" onclick="inativarFornecedor(${f.id})" title="Inativar">
                        🚫
                    </button>
                ` : `
                    <button class="btn btn-sm btn-success btn-icon" onclick="ativarFornecedor(${f.id})" title="Ativar">
                        ✅
                    </button>
                `}
            </td>
        </tr>
    `).join('');
}

// ---- Busca de fornecedores ---- //
document.getElementById('buscaFornecedor').addEventListener('input', async (e) => {
    const busca = e.target.value.trim();
    try {
        const fornecedores = await apiGet(`/fornecedores?busca=${encodeURIComponent(busca)}`);
        if (fornecedores.length === 0) {
            document.getElementById('tbodyFornecedores').innerHTML = 
                '<tr><td colspan="6" class="empty-state">Nenhum fornecedor encontrado</td></tr>';
            return;
        }
        renderFornecedores(fornecedores);
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// ---- Ver detalhe do fornecedor (Modal) ---- //
async function verDetalheFornecedor(id) {
    try {
        const forn = await apiGet(`/fornecedores/${id}`);

        const body = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Razão Social</span>
                    <span class="detail-value">${forn.nome}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">CNPJ</span>
                    <span class="detail-value">${forn.cnpj}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Categoria</span>
                    <span class="badge badge-info">${forn.categoria}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${forn.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Telefone</span>
                    <span class="detail-value">${forn.telefone || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="badge ${forn.ativo ? 'badge-success' : 'badge-danger'}">
                        ${forn.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                <div class="detail-item detail-full">
                    <span class="detail-label">Endereço</span>
                    <span class="detail-value">${forn.endereco || '—'}</span>
                </div>
            </div>
            ${forn.pedidos && forn.pedidos.length > 0 ? `
                <h4 style="margin-top: 20px; margin-bottom: 10px; color: var(--text-secondary);">📦 Pedidos de Compra</h4>
                ${forn.pedidos.map(p => `
                    <div class="list-item">
                        <div class="list-item-info">
                            <span class="list-item-primary">${p.descricao}</span>
                            <span class="list-item-secondary">R$ ${parseFloat(p.valor).toFixed(2)} • ${formatDate(p.data_pedido)}</span>
                        </div>
                        <span class="badge ${p.status === 'CONCLUIDO' ? 'badge-success' : p.status === 'PENDENTE' ? 'badge-warning' : 'badge-neutral'}">
                            ${p.status}
                        </span>
                    </div>
                `).join('')}
            ` : '<p style="margin-top: 16px; color: var(--text-muted);">Sem pedidos de compra</p>'}
        `;

        const footer = forn.ativo ? `
            <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
            <button class="btn btn-danger" onclick="inativarFornecedor(${forn.id}); closeModal();">🚫 Inativar</button>
        ` : `
            <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
            <button class="btn btn-success" onclick="ativarFornecedor(${forn.id}); closeModal();">✅ Ativar</button>
        `;

        openModal(`🏢 ${forn.nome}`, body, footer);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---- Inativar fornecedor ---- //
async function inativarFornecedor(id) {
    showConfirm(
        'Tem certeza que deseja <strong class="confirm-warning">inativar</strong> este fornecedor?<br><small>O sistema verificará se existem pendências antes de prosseguir.</small>',
        async () => {
            try {
                const result = await apiPatch(`/fornecedores/${id}/inativar`);
                showToast(result.message, 'success');
                loadFornecedoresLista();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    );
}

// ---- Ativar fornecedor ---- //
async function ativarFornecedor(id) {
    try {
        const result = await apiPatch(`/fornecedores/${id}/ativar`);
        showToast(result.message, 'success');
        loadFornecedoresLista();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

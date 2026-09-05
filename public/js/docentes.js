/* ============================================================
   DOCENTES.JS — Módulo de Docentes (Consulta, Detalhe, Status)
   ============================================================ */

// ---- Carregar lista de docentes ---- //
async function loadDocentesLista() {
    const tbody = document.getElementById('tbodyDocentes');
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><span class="loading-spinner"></span> Carregando...</td></tr>';

    try {
        const docentes = await apiGet('/docentes');

        if (docentes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum docente cadastrado</td></tr>';
            return;
        }

        renderDocentes(docentes);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Erro: ${err.message}</td></tr>`;
        showToast(err.message, 'error');
    }
}

function renderDocentes(docentes) {
    const tbody = document.getElementById('tbodyDocentes');
    tbody.innerHTML = docentes.map(d => `
        <tr>
            <td><strong>${d.nome}</strong></td>
            <td>${d.email}</td>
            <td>
                <span class="badge ${d.tipo_contrato === 'CLT' ? 'badge-info' : 'badge-warning'}">
                    ${d.tipo_contrato}
                </span>
            </td>
            <td>${formatDate(d.data_admissao)}</td>
            <td>
                <span class="badge ${d.ativo ? 'badge-success' : 'badge-danger'}">
                    ${d.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-icon" onclick="verDetalheDocente(${d.id})" title="Ver detalhes">
                    👁️
                </button>
                <button class="btn btn-sm ${d.ativo ? 'btn-danger' : 'btn-success'} btn-icon" 
                        onclick="toggleStatusDocente(${d.id}, ${d.ativo})" 
                        title="${d.ativo ? 'Inativar' : 'Ativar'}">
                    ${d.ativo ? '🚫' : '✅'}
                </button>
            </td>
        </tr>
    `).join('');
}

// ---- Busca de docentes ---- //
document.getElementById('buscaDocente').addEventListener('input', async (e) => {
    const busca = e.target.value.trim();
    try {
        const docentes = await apiGet(`/docentes?busca=${encodeURIComponent(busca)}`);
        if (docentes.length === 0) {
            document.getElementById('tbodyDocentes').innerHTML = 
                '<tr><td colspan="6" class="empty-state">Nenhum docente encontrado com este nome</td></tr>';
            return;
        }
        renderDocentes(docentes);
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// ---- Ver detalhe do docente (Modal) ---- //
async function verDetalheDocente(id) {
    try {
        const docente = await apiGet(`/docentes/${id}`);

        const body = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Nome</span>
                    <span class="detail-value">${docente.nome}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${docente.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Telefone</span>
                    <span class="detail-value">${docente.telefone || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tipo de Contrato</span>
                    <span class="badge ${docente.tipo_contrato === 'CLT' ? 'badge-info' : 'badge-warning'}">
                        ${docente.tipo_contrato}
                    </span>
                </div>
                <div class="detail-item detail-full">
                    <span class="detail-label">Endereço</span>
                    <span class="detail-value">${docente.endereco || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Data de Admissão</span>
                    <span class="detail-value">${formatDate(docente.data_admissao)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="badge ${docente.ativo ? 'badge-success' : 'badge-danger'}">
                        ${docente.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            </div>
            ${docente.disciplinas && docente.disciplinas.length > 0 ? `
                <h4 style="margin-top: 20px; margin-bottom: 10px; color: var(--text-secondary);">📚 Disciplinas Ministradas</h4>
                ${docente.disciplinas.map(d => `
                    <div class="list-item">
                        <div class="list-item-info">
                            <span class="list-item-primary">${d.nome}</span>
                            <span class="list-item-secondary">${d.curso_nome} • ${d.semestre}º sem • ${d.carga_hor}h</span>
                        </div>
                    </div>
                `).join('')}
            ` : '<p style="margin-top: 16px; color: var(--text-muted);">Sem disciplinas atribuídas</p>'}
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
            <button class="btn ${docente.ativo ? 'btn-danger' : 'btn-success'}" 
                    onclick="toggleStatusDocente(${docente.id}, ${docente.ativo}); closeModal();">
                ${docente.ativo ? '🚫 Inativar' : '✅ Ativar'}
            </button>
        `;

        openModal(`👨‍🏫 ${docente.nome}`, body, footer);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---- Ativar/Inativar docente ---- //
async function toggleStatusDocente(id, isAtivo) {
    const acao = isAtivo ? 'inativar' : 'ativar';

    showConfirm(
        `Tem certeza que deseja <strong class="confirm-warning">${acao}</strong> este docente?`,
        async () => {
            try {
                const result = await apiPatch(`/docentes/${id}/status`);
                showToast(result.message, 'success');
                loadDocentesLista();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    );
}

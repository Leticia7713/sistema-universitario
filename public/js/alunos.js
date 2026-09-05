/* ============================================================
   ALUNOS.JS — Módulo de Alunos (Cadastro, Matrícula, Consulta)
   ============================================================ */

// ---- Carregar formulário de matrícula ---- //
async function loadAlunosForm() {
    try {
        // Carregar alunos para o select de matrícula
        const alunos = await apiGet('/alunos');
        const selectAluno = document.getElementById('matriculaAluno');
        selectAluno.innerHTML = '<option value="">Selecione um aluno</option>';
        alunos.forEach(a => {
            selectAluno.innerHTML += `<option value="${a.id}">${a.nome} (${a.cpf})</option>`;
        });

        // Carregar cursos para o select de matrícula
        const cursos = await apiGet('/cursos');
        const selectCurso = document.getElementById('matriculaCurso');
        selectCurso.innerHTML = '<option value="">Selecione um curso</option>';
        cursos.forEach(c => {
            selectCurso.innerHTML += `<option value="${c.id}">${c.nome} (${c.duracao_sem} sem)</option>`;
        });
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---- Formulário de Cadastro de Aluno ---- //
document.getElementById('formAluno').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nome: document.getElementById('alunoNome').value.trim(),
        email: document.getElementById('alunoEmail').value.trim(),
        cpf: document.getElementById('alunoCpf').value.trim(),
        data_nasc: document.getElementById('alunoNasc').value,
        telefone: document.getElementById('alunoTelefone').value.trim() || null,
        endereco: document.getElementById('alunoEndereco').value.trim() || null
    };

    try {
        const result = await apiPost('/alunos', data);
        showToast(result.message, 'success');
        e.target.reset();
        loadAlunosForm(); // Recarrega selects
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// ---- Formulário de Matrícula ---- //
document.getElementById('formMatricula').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        id_aluno: parseInt(document.getElementById('matriculaAluno').value),
        id_curso: parseInt(document.getElementById('matriculaCurso').value)
    };

    try {
        const result = await apiPost('/alunos/matricula', data);
        showToast(result.message, 'success');
        e.target.reset();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// ---- Consultar Alunos (Lista) ---- //
async function loadAlunosLista() {
    const tbody = document.getElementById('tbodyAlunos');
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><span class="loading-spinner"></span> Carregando...</td></tr>';

    try {
        const alunos = await apiGet('/alunos');

        if (alunos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum aluno cadastrado</td></tr>';
            return;
        }

        tbody.innerHTML = alunos.map(a => `
            <tr>
                <td><strong>${a.nome}</strong></td>
                <td>${a.cpf}</td>
                <td>${a.email}</td>
                <td>${a.telefone || '—'}</td>
                <td>
                    <span class="badge ${a.ativo ? 'badge-success' : 'badge-danger'}">
                        ${a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary btn-icon" onclick="verDetalheAluno(${a.id})" title="Ver detalhes">
                        👁️
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Erro: ${err.message}</td></tr>`;
        showToast(err.message, 'error');
    }
}

// Busca de alunos
document.getElementById('buscaAluno').addEventListener('input', async (e) => {
    const busca = e.target.value.trim();
    const tbody = document.getElementById('tbodyAlunos');

    try {
        const alunos = await apiGet(`/alunos?busca=${encodeURIComponent(busca)}`);

        if (alunos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum aluno encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = alunos.map(a => `
            <tr>
                <td><strong>${a.nome}</strong></td>
                <td>${a.cpf}</td>
                <td>${a.email}</td>
                <td>${a.telefone || '—'}</td>
                <td>
                    <span class="badge ${a.ativo ? 'badge-success' : 'badge-danger'}">
                        ${a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary btn-icon" onclick="verDetalheAluno(${a.id})" title="Ver detalhes">
                        👁️
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// ---- Ver Detalhe do Aluno (Modal) ---- //
async function verDetalheAluno(id) {
    try {
        const aluno = await apiGet(`/alunos/${id}`);

        const body = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Nome</span>
                    <span class="detail-value">${aluno.nome}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">CPF</span>
                    <span class="detail-value">${aluno.cpf}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${aluno.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Telefone</span>
                    <span class="detail-value">${aluno.telefone || '—'}</span>
                </div>
                <div class="detail-item detail-full">
                    <span class="detail-label">Endereço</span>
                    <span class="detail-value">${aluno.endereco || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Data de Nascimento</span>
                    <span class="detail-value">${formatDate(aluno.data_nasc)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="badge ${aluno.ativo ? 'badge-success' : 'badge-danger'}">
                        ${aluno.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            </div>
            ${aluno.matriculas && aluno.matriculas.length > 0 ? `
                <h4 style="margin-top: 20px; margin-bottom: 10px; color: var(--text-secondary);">📋 Matrículas</h4>
                ${aluno.matriculas.map(m => `
                    <div class="list-item">
                        <div class="list-item-info">
                            <span class="list-item-primary">${m.curso_nome}</span>
                            <span class="list-item-secondary">Início: ${formatDate(m.data_inicio)}</span>
                        </div>
                        <span class="badge ${m.status === 'ATIVA' ? 'badge-success' : m.status === 'TRANCADA' ? 'badge-warning' : 'badge-neutral'}">
                            ${m.status}
                        </span>
                    </div>
                `).join('')}
            ` : '<p style="margin-top: 16px; color: var(--text-muted);">Sem matrículas registradas</p>'}
        `;

        openModal(`👨‍🎓 ${aluno.nome}`, body);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

/* ============================================================
   NOTAS.JS — Módulo de Gerenciamento de Notas
   ============================================================ */

// ---- Carregar página de notas ---- //
async function loadNotasPage() {
    try {
        // Carregar cursos no select
        const cursos = await apiGet('/cursos');
        const selectCurso = document.getElementById('notaCurso');
        selectCurso.innerHTML = '<option value="">Selecione um curso</option>';
        cursos.forEach(c => {
            selectCurso.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
        });

        // Reset disciplina select
        const selectDisciplina = document.getElementById('notaDisciplina');
        selectDisciplina.innerHTML = '<option value="">Selecione o curso primeiro</option>';
        selectDisciplina.disabled = true;

        // Esconder container de notas
        document.getElementById('notasContainer').style.display = 'none';
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---- Quando selecionar um curso, carregar disciplinas ---- //
document.getElementById('notaCurso').addEventListener('change', async (e) => {
    const cursoId = e.target.value;
    const selectDisciplina = document.getElementById('notaDisciplina');

    if (!cursoId) {
        selectDisciplina.innerHTML = '<option value="">Selecione o curso primeiro</option>';
        selectDisciplina.disabled = true;
        document.getElementById('notasContainer').style.display = 'none';
        return;
    }

    try {
        const disciplinas = await apiGet(`/cursos/${cursoId}/disciplinas`);
        selectDisciplina.innerHTML = '<option value="">Selecione uma disciplina</option>';
        disciplinas.forEach(d => {
            selectDisciplina.innerHTML += `<option value="${d.id}">${d.nome} (${d.semestre}º sem • ${d.docente_nome || 'Sem docente'})</option>`;
        });
        selectDisciplina.disabled = false;
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// ---- Quando selecionar uma disciplina, carregar notas ---- //
document.getElementById('notaDisciplina').addEventListener('change', async (e) => {
    const disciplinaId = e.target.value;

    if (!disciplinaId) {
        document.getElementById('notasContainer').style.display = 'none';
        return;
    }

    await carregarNotasDisciplina(disciplinaId);
});

// ---- Carregar notas de uma disciplina ---- //
async function carregarNotasDisciplina(disciplinaId) {
    try {
        const data = await apiGet(`/notas/disciplina/${disciplinaId}`);
        const container = document.getElementById('notasContainer');
        container.style.display = 'block';

        // Atualizar título
        document.getElementById('notaDisciplinaTitulo').textContent =
            `📝 ${data.disciplina.nome} — ${data.disciplina.semestre}º Semestre`;
        document.getElementById('notaDocenteNome').textContent =
            data.disciplina.docente_nome ? `Prof. ${data.disciplina.docente_nome}` : 'Sem docente';

        const tbody = document.getElementById('tbodyNotas');

        if (!data.alunos || data.alunos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum aluno encontrado para esta disciplina.</td></tr>';
            return;
        }

        tbody.innerHTML = data.alunos.map(a => {
            const isConsolidada = a.consolidada === 1;
            const isTrancada = a.matricula_status === 'TRANCADA';
            const disabled = isConsolidada || isTrancada;
            const media = a.media !== null ? parseFloat(a.media).toFixed(1) : '—';

            return `
                <tr>
                    <td><strong>${a.nome}</strong></td>
                    <td>
                        <span class="badge ${a.matricula_status === 'ATIVA' ? 'badge-success' : 'badge-warning'}">
                            ${a.matricula_status}
                        </span>
                    </td>
                    <td>
                        <input type="number" class="nota-input" 
                               id="nota1-${a.id_aluno}" 
                               value="${a.nota_1 !== null ? a.nota_1 : ''}" 
                               min="0" max="10" step="0.1"
                               ${disabled ? 'disabled' : ''}
                               placeholder="—">
                    </td>
                    <td>
                        <input type="number" class="nota-input"
                               id="nota2-${a.id_aluno}" 
                               value="${a.nota_2 !== null ? a.nota_2 : ''}" 
                               min="0" max="10" step="0.1"
                               ${disabled ? 'disabled' : ''}
                               placeholder="—">
                    </td>
                    <td>
                        <strong style="color: ${a.media !== null ? (parseFloat(a.media) >= 6 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)'}">
                            ${media}
                        </strong>
                    </td>
                    <td>
                        ${isConsolidada ? '<span class="badge badge-success">Consolidada</span>' :
                          isTrancada ? '<span class="badge badge-warning">Trancada</span>' :
                          '<span class="badge badge-neutral">Pendente</span>'}
                    </td>
                    <td>
                        ${!disabled ? `
                            <button class="btn btn-sm btn-primary" onclick="salvarNota(${a.id_aluno}, ${disciplinaId})">
                                💾 Salvar
                            </button>
                            ${a.nota_1 !== null && a.nota_2 !== null ? `
                                <button class="btn btn-sm btn-warning" onclick="consolidarNota(${a.id_aluno}, ${disciplinaId})" title="Consolidar nota">
                                    🔒
                                </button>
                            ` : ''}
                        ` : `
                            ${isTrancada ? '<span style="color: var(--text-muted); font-size: 0.78rem;">Bloqueado</span>' : 
                              '<span style="color: var(--text-muted); font-size: 0.78rem;">Finalizada</span>'}
                        `}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---- Salvar nota ---- //
async function salvarNota(idAluno, idDisciplina) {
    const nota1Input = document.getElementById(`nota1-${idAluno}`);
    const nota2Input = document.getElementById(`nota2-${idAluno}`);

    const nota_1 = nota1Input.value !== '' ? parseFloat(nota1Input.value) : null;
    const nota_2 = nota2Input.value !== '' ? parseFloat(nota2Input.value) : null;

    // Validar range
    if (nota_1 !== null && (nota_1 < 0 || nota_1 > 10)) {
        showToast('Nota 1 deve estar entre 0 e 10.', 'warning');
        return;
    }
    if (nota_2 !== null && (nota_2 < 0 || nota_2 > 10)) {
        showToast('Nota 2 deve estar entre 0 e 10.', 'warning');
        return;
    }

    try {
        const result = await apiPut('/notas', {
            id_aluno: idAluno,
            id_disciplina: idDisciplina,
            nota_1,
            nota_2
        });
        showToast(result.message, 'success');
        // Recarregar notas para atualizar média
        await carregarNotasDisciplina(idDisciplina);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ---- Consolidar nota ---- //
async function consolidarNota(idAluno, idDisciplina) {
    showConfirm(
        'Tem certeza que deseja <strong class="confirm-warning">consolidar</strong> esta nota?<br><small>Após consolidar, a nota não poderá mais ser alterada.</small>',
        async () => {
            try {
                const result = await apiPatch('/notas/consolidar', {
                    id_aluno: idAluno,
                    id_disciplina: idDisciplina
                });
                showToast(result.message, 'success');
                await carregarNotasDisciplina(idDisciplina);
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    );
}

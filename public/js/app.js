/* ============================================================
   APP.JS — Core do Sistema (Navegação, Modal, Toast, API)
   ============================================================ */

const API_BASE = '/api';

// ---- Utilitários de API ---- //
async function apiGet(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `Erro ${res.status}`);
    }
    return res.json();
}

async function apiPost(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    if (!res.ok) throw new Error(json.error || `Erro ${res.status}`);
    return json;
}

async function apiPut(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    if (!res.ok) throw new Error(json.error || `Erro ${res.status}`);
    return json;
}

async function apiPatch(endpoint, data = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    if (!res.ok) throw new Error(json.error || `Erro ${res.status}`);
    return json;
}

// ---- Toast Notifications ---- //
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '📌'}</span>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ---- Modal ---- //
function openModal(title, bodyHTML, footerHTML = '') {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalFooter').innerHTML = footerHTML;
    document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// Confirm dialog
function showConfirm(message, onConfirm) {
    const body = `<p class="confirm-message">${message}</p>`;
    const footer = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-danger" id="confirmBtn">Confirmar</button>
    `;
    openModal('Confirmação', body, footer);

    // Adiciona listener após renderizar
    setTimeout(() => {
        document.getElementById('confirmBtn').addEventListener('click', () => {
            closeModal();
            onConfirm();
        });
    }, 0);
}

// ---- Navegação SPA ---- //
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

const pageTitles = {
    'dashboard': 'Dashboard',
    'alunos': 'Matricular Alunos',
    'consultar-alunos': 'Consultar Alunos',
    'notas': 'Gerenciar Notas',
    'docentes': 'Consultar Docentes',
    'fornecedores': 'Gestão de Fornecedores'
};

function navigateTo(pageName) {
    // Atualizar nav
    navItems.forEach(item => item.classList.remove('active'));
    const activeNav = document.querySelector(`[data-page="${pageName}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Atualizar pages
    pages.forEach(page => page.classList.remove('active'));
    const activePage = document.getElementById(`page-${pageName}`);
    if (activePage) activePage.classList.add('active');

    // Atualizar título
    document.getElementById('pageTitle').textContent = pageTitles[pageName] || 'Dashboard';

    // Carregar dados da página
    loadPageData(pageName);
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.page);
    });
});

// ---- Mobile Menu ---- //
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// ---- Data da Header ---- //
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('pt-BR', options);
}
updateDate();

// ---- Carregar dados por página ---- //
function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard': loadDashboard(); break;
        case 'alunos': loadAlunosForm(); break;
        case 'consultar-alunos': loadAlunosLista(); break;
        case 'notas': loadNotasPage(); break;
        case 'docentes': loadDocentesLista(); break;
        case 'fornecedores': loadFornecedoresLista(); break;
    }
}

// ---- Dashboard ---- //
async function loadDashboard() {
    try {
        const stats = await apiGet('/dashboard');
        document.getElementById('statAlunos').textContent = stats.totalAlunos;
        document.getElementById('statDocentes').textContent = stats.totalDocentes;
        document.getElementById('statFornecedores').textContent = stats.totalFornecedores;
        document.getElementById('statCursos').textContent = stats.totalCursos;
        document.getElementById('statMatriculas').textContent = stats.matriculasAtivas;
        document.getElementById('statBoletos').textContent = stats.boletosPendentes;

        // Carregar matrículas recentes
        const alunos = await apiGet('/alunos');
        const recentContainer = document.getElementById('recentMatriculas');
        if (alunos.length > 0) {
            recentContainer.innerHTML = alunos.slice(0, 5).map(a => `
                <div class="list-item">
                    <div class="list-item-info">
                        <span class="list-item-primary">${a.nome}</span>
                        <span class="list-item-secondary">${a.cpf}</span>
                    </div>
                    <span class="badge ${a.ativo ? 'badge-success' : 'badge-danger'}">
                        ${a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            `).join('');
        } else {
            recentContainer.innerHTML = '<p class="empty-state">Nenhum aluno cadastrado</p>';
        }

        // Carregar boletos recentes
        const boletos = await apiGet('/boletos');
        const boletosContainer = document.getElementById('recentBoletos');
        if (boletos.length > 0) {
            boletosContainer.innerHTML = boletos.slice(0, 5).map(b => `
                <div class="list-item">
                    <div class="list-item-info">
                        <span class="list-item-primary">${b.aluno_nome}</span>
                        <span class="list-item-secondary">R$ ${parseFloat(b.valor).toFixed(2)} • ${formatDate(b.vencimento)}</span>
                    </div>
                    <span class="badge ${getBoletoStatusBadge(b.status)}">
                        ${b.status}
                    </span>
                </div>
            `).join('');
        } else {
            boletosContainer.innerHTML = '<p class="empty-state">Nenhum boleto</p>';
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function getBoletoStatusBadge(status) {
    const map = { 'PAGO': 'badge-success', 'PENDENTE': 'badge-warning', 'VENCIDO': 'badge-danger', 'CANCELADO': 'badge-neutral' };
    return map[status] || 'badge-neutral';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
}

// ---- Máscara de CPF ---- //
function maskCPF(input) {
    input.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        e.target.value = v;
    });
}

// Inicializar máscara de CPF
const cpfInput = document.getElementById('alunoCpf');
if (cpfInput) maskCPF(cpfInput);

// ---- Inicialização ---- //
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

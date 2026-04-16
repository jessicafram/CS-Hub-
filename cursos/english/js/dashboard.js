// cursos/english/js/dashboard.js

// 1. Dicionário de Gemas EFF (Tudo .png agora)
const badgeImages = {
    1: 'brasaocshubbronze.png',
    2: 'brasaocshubazulciano.png',
    3: 'brasaocshubametista.png',
    4: 'brasaocshubrubi.png',
    5: 'brasaocshubsafira.png',
    6: 'brasaocshubfurtacor.png'
};

async function initDashboard() {
    try {
        // 1. Carrega os dados dos arquivos JSON
        const [courseRes, modulesRes] = await Promise.all([
            fetch('/data/english/course-map.json'),
            fetch('/data/english/modules.json')
        ]);

        if (!courseRes.ok || !modulesRes.ok) throw new Error("Erro ao buscar arquivos JSON");

        const courseMap = await courseRes.json();
        const modules = await modulesRes.json();

        // 2. Recupera o progresso
        const savedFase = localStorage.getItem('eff_fase_id');
        const userProgress = {
            currentFase: savedFase ? parseInt(savedFase) : 1,
            currentWeek: 1,
            completedLessons: []
        };

        // 3. Renderiza a interface
        renderProgress(courseMap, userProgress);
        renderCurrentModules(modules, userProgress);

        // 4. ONBOARDING VISUAL
        const seen = localStorage.getItem('eff_onboarding_seen');
        if (!seen) {
            startOnboarding(userProgress.currentFase);
        }

    } catch (error) {
        console.error("❌ Erro no Dashboard:", error);
    }
}

function renderProgress(map, progress) {
    const currentFaseData = map.fases.find(f => f.id === progress.currentFase);
    if (currentFaseData) {
        // Atualiza o título
        document.getElementById('fase-title').textContent = currentFaseData.nome + " Stage";

        const badgeImg = document.getElementById('current-badge-img');
        if (badgeImg) {
            // CORREÇÃO 1: Fallback para .png
            const filename = badgeImages[progress.currentFase] || 'brasaocshubbronze.png';

            // CORREÇÃO 2: Pasta 'images' em inglês
            badgeImg.src = `/assets/english/images/${filename}`;

            // Garante que a imagem só tenha a classe estrutural
            badgeImg.className = 'badge-main-display';
        }
    }
}

function renderCurrentModules(allModules, progress) {
    const container = document.getElementById('modules-list');
    if (!container) return;

    // Filtra módulos da fase atual
    const currentModules = allModules.filter(m => m.faseId === progress.currentFase);

    container.innerHTML = currentModules.map(m => `
        <div class="module-card" style="background: var(--surface); border: 1px solid var(--border); padding: 20px; border-radius: 12px;">
            <div style="color: var(--accent); font-family: var(--mono); font-size: 0.7rem; margin-bottom: 5px;">WEEK ${m.semana}</div>
            <h3 style="margin: 0 0 10px 0; font-size: 1.1rem;">${m.titulo}</h3>
            <p style="color: var(--muted); font-size: 0.8rem; margin-bottom: 15px;">${m.objetivo}</p>
            <button onclick="window.location.href='lesson.html?week=${m.semana}'" style="background: var(--accent-glow); border: 1px solid var(--accent); color: var(--accent); padding: 8px 15px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: 600;">
    Open Week ${m.semana}
</button>
        </div>
    `).join('');
}

function startOnboarding(faseId) {
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
        overlay.style.display = 'flex';

        // Atualiza a imagem do brasão no modal dinamicamente com a gema certa
        const modalImg = document.getElementById('modal-badge-img');
        if (modalImg) {
            // CORREÇÃO 1: Mudamos o fallback para .png
            const filename = badgeImages[faseId] || 'brasaocshubbronze.png';

            // CORREÇÃO 2: Mudamos 'imagens' para 'images'
            modalImg.src = `/assets/english/images/${filename}`;
        }
    }
}

// Inicializa
document.addEventListener('DOMContentLoaded', initDashboard);
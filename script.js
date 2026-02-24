const codeToType = `class ComputerScience {
  String student = "Jessica França";
  int period = 3;
  
  void status() {
    System.out.println("Aprovada ✓");
  }
}`;

let charIndex = 0;
let materiasData = null; // Cache para não precisar ler o arquivo JSON toda hora

function typeCode() {
    const element = document.getElementById("typing-code");
    if (element && charIndex < codeToType.length) {
        element.textContent += codeToType.charAt(charIndex);
        charIndex++;
        setTimeout(typeCode, 40);
    }
}

// Função atualizada para aceitar o tipo (graduacao ou extensao)
async function loadContent(tipo, valor) {
    try {
        if (!materiasData) {
            const response = await fetch('data/materias.json');
            if (!response.ok) throw new Error('Falha ao carregar JSON');
            materiasData = await response.json();
        }

        const container = document.getElementById('subjects-container');
        container.innerHTML = "";
        let listaExibicao = [];

        if (tipo === 'graduacao') {
            const periodoNum = parseInt(valor);
            const periodoEncontrado = materiasData.grade_curricular.find(p => p.periodo === periodoNum);
            if (periodoEncontrado) listaExibicao = periodoEncontrado.materias;
        } else if (tipo === 'extensao') {
            // Busca nos cursos de extensão (você deve adicionar esta chave no seu JSON)
            const cursoEncontrado = materiasData.cursos_extensao.find(c => c.id === valor);
            if (cursoEncontrado) listaExibicao = [cursoEncontrado];
        }

        listaExibicao.forEach(m => {
            const card = document.createElement('div');
            card.className = 'mat-card-modern';
            card.innerHTML = `
                <div class="card-status">${m.status}</div>
                <h3>${m.nome}</h3>
                <p>${m.horas} Horas</p>
                <button class="btn-primary-small" style="background:var(--accent); color:#000; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; font-weight:bold; margin-top:10px;">VER CONTEÚDO</button>
            `;
            card.querySelector('button').addEventListener('click', () => openModal(m));
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro no carregamento:", error);
    }
}

function openModal(materia) {
    const modal = document.getElementById('course-modal');
    const body = document.getElementById('modal-body');

    const aprovado = localStorage.getItem(`${materia.id}_concluido`) === 'true';
    const statusExibicao = aprovado ? "Concluído ✓" : materia.status;
    const corStatus = aprovado ? "var(--accent)" : "#fff";

    body.innerHTML = `
        <div class="modal-details">
            <h2 style="color: var(--accent); margin-top:0;">${materia.nome}</h2>
            <p style="color:${corStatus}; font-weight:bold; margin-bottom:20px;">Status: ${statusExibicao}</p>
            <p style="color:#fff; opacity:0.8;">${materia.descricao}</p>

            <h4 style="color: var(--accent); font-size: 0.9rem; margin-top:20px;">TRILHA DE APRENDIZADO</h4>
            <ul class="syllabus-list">
                ${materia.grade_conteudo.map((item, index) => {
        const num = String(index + 1).padStart(2, '0');

        // Lógica para Extensão (n8n, Java): Libera HTML na subpasta e botão de PDF
        if (materia.links_ativos) {
            return `
                            <li style="display: flex; justify-content: space-between; align-items: center; border-left: 3px solid var(--accent); background: rgba(255,255,255,0.05); margin-top: 5px; padding: 10px; list-style: none;">
                                <div onclick="window.location.href='./materiais/${materia.id}/${materia.id}-aula-${num}.html'" style="cursor:pointer; flex-grow: 1;">
                                    📖 ${item}
                                </div>
                                <a href="assets/cursos/${materia.id}/aula-${num}.pdf" download class="btn-download" title="Baixar PDF" style="text-decoration: none; margin-left: 10px;">
                                    📥
                                </a>
                            </li>
                        `;
        }

        // Lógica para IHC (Graduação)
        if (materia.nome.includes("Interação")) {
            return `
                            <li onclick="window.location.href='./materiais/ihc-topico-${num}.html'" 
                                style="cursor:pointer; border-left: 3px solid var(--accent); background: rgba(255,255,255,0.05); margin-top: 5px; padding: 10px; list-style: none;">
                                📖 ${item}
                            </li>
                        `;
        }
        return `<li style="opacity: 0.5; padding: 10px; list-style: none;">🔒 ${item}</li>`;
    }).join('')}
            </ul>
        </div>
    `;
    modal.style.display = 'flex';
}

document.addEventListener("DOMContentLoaded", () => {
    typeCode();
    loadContent('graduacao', 1); // Carrega o 1º período por padrão

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const tipo = this.dataset.type; // graduacao ou extensao
            const valor = tipo === 'graduacao' ? this.dataset.periodo : this.dataset.curso;

            loadContent(tipo, valor);
        });
    });

    document.addEventListener('click', (e) => {
        const modal = document.getElementById('course-modal');
        if (e.target.classList.contains('close-modal') || e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
const codeToType = `class ComputerScience {
  String student = "Jessica França";
  int period = 3;
  
  void status() {
    System.out.println("Aprovada ✓");
  }
}`;

let charIndex = 0;

function typeCode() {
    const element = document.getElementById("typing-code");
    if (element && charIndex < codeToType.length) {
        element.textContent += codeToType.charAt(charIndex);
        charIndex++;
        setTimeout(typeCode, 40);
    }
}

async function loadSubjects(periodoSelecionado = 1) {
    try {
        const response = await fetch('data/materias.json');
        if (!response.ok) throw new Error('Falha ao carregar JSON');

        const data = await response.json();
        const container = document.getElementById('subjects-container');
        container.innerHTML = "";

        const periodoEncontrado = data.grade_curricular.find(p => p.periodo === periodoSelecionado);

        if (periodoEncontrado) {
            periodoEncontrado.materias.forEach(m => {
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
        }
    } catch (error) {
        console.error("Erro no carregamento:", error);
    }
}

function openModal(materia) {
    const modal = document.getElementById('course-modal');
    const body = document.getElementById('modal-body');

    // Verifica se o aluno passou no exame final salvo no localStorage
    const aprovado = localStorage.getItem('ihc_concluido') === 'true';
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

        // Libera o link se for a matéria de IHC
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
    loadSubjects(1);

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadSubjects(parseInt(this.dataset.periodo));
        });
    });

    document.addEventListener('click', (e) => {
        const modal = document.getElementById('course-modal');
        if (e.target.classList.contains('close-modal') || e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
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
    const statusExibicao = aprovado ? "Concluído ✓" : (materia.status || "Ativo");
    const corStatus = aprovado ? "var(--accent)" : "#fff";

    let trilhaHTML = "";

    // 1. NOVA LÓGICA DE MESTRADO (Hierarquia: Unidades -> Tópicos)
    if (materia.unidades) {
        trilhaHTML = materia.unidades.map(unidade => `
            <details style="margin-bottom: 10px; background: rgba(255,255,255,0.05); border-left: 3px solid var(--accent); border-radius: 4px;">
                <summary style="padding: 15px; cursor: pointer; font-weight: bold; outline: none; display: flex; align-items: center; justify-content: space-between;">
                    <span>📁 ${unidade.titulo}</span>
                    <span style="font-size: 0.8em; opacity: 0.7;">Ver aulas ▼</span>
                </summary>
                <div style="padding: 10px 15px 15px 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="font-size: 0.85rem; color: #aaa; margin-bottom: 15px; font-style: italic;">${unidade.descricao}</p>
                    <ul style="padding: 0; margin: 0;">
                        ${unidade.topicos.map(topico => `
                            <li onclick="window.location.href='./materiais/${topico.path}'"
                                style="cursor:pointer; background: rgba(46, 204, 113, 0.1); margin-bottom: 8px; padding: 12px; list-style: none; border-radius: 4px; transition: 0.3s; font-size: 0.95rem; display: flex; align-items: center;"
                                onmouseover="this.style.background='rgba(46, 204, 113, 0.2)'; this.style.transform='translateX(5px)';"
                                onmouseout="this.style.background='rgba(46, 204, 113, 0.1)'; this.style.transform='translateX(0)';">
                                <span style="margin-right: 10px;">📄</span>
                                <span><strong>${topico.ordem}</strong> - ${topico.nome}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </details>
        `).join('');
    }
    // 2. LÓGICA ANTIGA (Mantida intacta para não quebrar Java, n8n e Matemática)
    else if (materia.grade_conteudo) {
        trilhaHTML = materia.grade_conteudo.map((item, index) => {
            const num = String(index + 1).padStart(2, '0');
            const topicoNum = index + 1;

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

            let linkDestino = "#";
            if (materia.id === "mat-comp" || (materia.nome && materia.nome.includes("Matemática"))) {
                linkDestino = `./materiais/mat-comp/modulo-01/topico-1-${topicoNum}.html`;
            } else if (materia.nome && materia.nome.includes("Interação")) {
                linkDestino = `./materiais/ihc-topico-${num}.html`;
            } else {
                linkDestino = `./materiais/${materia.id}-topico-${num}.html`;
            }

            return `
                <li onclick="window.location.href='${linkDestino}'" 
                    style="cursor:pointer; border-left: 3px solid var(--accent); background: rgba(46, 204, 113, 0.1); margin-top: 8px; padding: 12px; list-style: none; border-radius: 4px; transition: 0.3s;"
                    onmouseover="this.style.background='rgba(46, 204, 113, 0.2)'; this.style.transform='translateX(5px)';"
                    onmouseout="this.style.background='rgba(46, 204, 113, 0.1)'; this.style.transform='translateX(0)';">
                    📖 ${item}
                </li>
            `;
        }).join('');
    }

    // Monta o Modal final
    const tituloExibicao = materia.nome || "Detalhes da Disciplina";
    const descricaoExibicao = materia.descricao || "";

    body.innerHTML = `
        <div class="modal-details">
            <h2 style="color: var(--accent); margin-top:0;">${tituloExibicao}</h2>
            <p style="color:${corStatus}; font-weight:bold; margin-bottom:20px;">Status: ${statusExibicao}</p>
            <p style="color:#fff; opacity:0.8;">${descricaoExibicao}</p>

            <h4 style="color: var(--accent); font-size: 0.9rem; margin-top:20px; margin-bottom: 15px;">TRILHA DE APRENDIZADO</h4>
            <div class="syllabus-list" style="padding: 0;">
                ${trilhaHTML}
            </div>
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
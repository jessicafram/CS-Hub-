async function loadLibraryData() {
    const response = await fetch("../data/library.json");

    if (!response.ok) {
        throw new Error("Não foi possível carregar o arquivo library.json");
    }

    return await response.json();
}

console.log("biblioteca.js carregou");

function getUserProfile() {
    return (
        localStorage.getItem("cshub_profile") ||
        sessionStorage.getItem("cshub_profile") ||
        "beginner-explorer"
    );
}

function getRebecaMessage(profile) {
    const messages = {
        "beginner-explorer":
            "Para o seu momento, recomendo começar pelos materiais fundamentais e gratuitos antes de avançar para livros de referência mais densos.",
        "college-learner":
            "Seu perfil combina com uma trilha híbrida: fundamentos sólidos, livros de referência e artigos que aprofundam sua base acadêmica.",
        "ai-focused":
            "Para você, selecionei materiais que equilibram clássicos da computação, agentes, IA e artigos de fronteira.",
        "career-transition":
            "Vou priorizar materiais que fortaleçam fundamentos, clareza prática e repertório técnico para acelerar sua transição para a área.",
        "global-communication":
            "Selecionei materiais que combinam conteúdo técnico com crescimento profissional e visão internacional.",
        "interview-preparation":
            "Sua curadoria prioriza raciocínio técnico, clareza de explicação e repertório útil para entrevistas."
    };

    return (
        messages[profile] ||
        "Organizei esta biblioteca para ajudar você a estudar com mais profundidade, consistência e direção."
    );
}

function getTopRecommendations(items, profile, limit = 3) {
    return items
        .map((item) => ({
            ...item,
            score: (item.profiles?.includes(profile) ? 10 : 0) + (item.priority || 0)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

function renderRebecaHighlights(items) {
    const container = document.getElementById("rebeca-library-highlights");
    if (!container) return;

    container.innerHTML = items
        .map((item) => {
            const badgeMap = {
                open_source: "Open Source",
                reference: "Referência",
                insights: "Insight",
                scientific_articles: "Artigo"
            };

            return `
        <article class="rebeca-highlight-card">
          <div class="rebeca-highlight-cover">
            <img src="${item.cover}" alt="${item.title}">
          </div>

          <div class="rebeca-highlight-body">
            <div class="rebeca-highlight-meta">
              <span class="rebeca-highlight-label">Rebeca recomenda</span>
              <span class="rebeca-highlight-type">${badgeMap[item.library] || "Material"}</span>
            </div>

            <h3>${item.title}</h3>
            <p class="rebeca-highlight-author">${item.author}</p>
            <p>${item.description}</p>

            <a href="${item.action_url}" target="_blank" rel="noopener noreferrer nofollow sponsored">
              ${item.action_label}
            </a>
          </div>
        </article>
      `;
        })
        .join("");
}

function markRecommendedBooks(items) {
    const recommendedIds = new Set(items.map((item) => item.id));

    document.querySelectorAll("[data-book-id]").forEach((bookEl) => {
        const bookId = bookEl.getAttribute("data-book-id");

        if (recommendedIds.has(bookId)) {
            bookEl.classList.add("rebeca-book-recommended");
        } else {
            bookEl.classList.remove("rebeca-book-recommended");
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const libraryItems = await loadLibraryData();
        const profile = getUserProfile();

        const messageEl = document.getElementById("rebeca-library-message");
        if (messageEl) {
            messageEl.textContent = getRebecaMessage(profile);
        }

        const recommendations = getTopRecommendations(libraryItems, profile, 3);
        renderRebecaHighlights(recommendations);
        markRecommendedBooks(recommendations);

        console.log("Biblioteca carregada com sucesso.");
        console.log("Perfil detectado:", profile);
        console.log("Itens carregados:", libraryItems);
    } catch (error) {
        console.error("Erro ao inicializar a biblioteca:", error);
    }
});
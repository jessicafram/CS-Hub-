async function loadTranslations() {
    const response = await fetch("../data/i18n.json");

    if (!response.ok) {
        throw new Error("Não foi possível carregar o arquivo i18n.json");
    }

    return await response.json();
}

function getSavedLanguage() {
    return localStorage.getItem("cshub_language") || "pt";
}

function applyTranslations(translations, lang) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        const value = translations?.[lang]?.[key];

        if (value) {
            el.textContent = value;
        }
    });

    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
    });
}

async function setLanguage(lang) {
    localStorage.setItem("cshub_language", lang);

    const translations = await loadTranslations();
    applyTranslations(translations, lang);

    console.log("Idioma salvo:", lang);
}

document.addEventListener("DOMContentLoaded", async () => {
    const savedLang = getSavedLanguage();
    await setLanguage(savedLang);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const lang = btn.dataset.lang;
            await setLanguage(lang);
        });
    });
});
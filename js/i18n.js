function getSavedLanguage() {
    return localStorage.getItem("cshub_language") || "pt-br";
}

function applyTranslations(translations, lang) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        const parts = key.split(".");

        let value = translations?.[lang];
        for (const part of parts) {
            value = value?.[part];
        }

        if (value !== undefined && value !== null) {
            el.textContent = value;
        }
    });

    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
    });
}

function setLanguage(lang) {
    const translations = window.TRANSLATIONS || {};

    if (!translations[lang]) {
        lang = "pt-br";
    }

    localStorage.setItem("cshub_language", lang);
    applyTranslations(translations, lang);

    console.log("Idioma salvo:", lang);
}

document.addEventListener("DOMContentLoaded", () => {
    const savedLang = getSavedLanguage();
    setLanguage(savedLang);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
        });
    });
});

window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;

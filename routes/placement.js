const express = require('express');
const router = express.Router();

// ==========================================
// BANCO DE QUESTÕES (EFF - Do Zero ao Pro)
// ==========================================
const questions = [
    {
        id: 0,
        text: "Hi! I'm Rebeca. Let's start with your workspace. Look at your desk: Is that a 'laptop' or a 'book'?",
        options: [
            { label: "It is a laptop", value: "a" },
            { label: "It is a book", value: "b" }
        ],
        correct: "a" // A1 - Iniciante
    },
    {
        id: 1,
        text: "I am your AI tutor. Are you a 'developer'?",
        options: [
            { label: "Yes, I am", value: "a" },
            { label: "No, I am not", value: "b" }
        ],
        correct: "a" // A1 - Verb To Be
    },
    {
        id: 2,
        text: "Great! In your daily routine, do you 'code' every day?",
        options: [
            { label: "Yes, I code every day", value: "a" },
            { label: "No, I don't code", value: "b" }
        ],
        correct: "a" // A2 - Present Simple
    },
    {
        id: 3,
        text: "Interesting. Did you study English before joining CS Hub?",
        options: [
            { label: "Yes, I studied before", value: "a" },
            { label: "No, this is my first time", value: "b" }
        ],
        correct: "a" // B1 - Past Simple
    },
    {
        id: 4,
        text: "Final question: What is your main goal right now?",
        options: [
            { label: "Get a job abroad", value: "interviews" },
            { label: "Understand documentation", value: "tech" },
            { label: "Just start learning", value: "basics" }
        ],
        correct: null // Pergunta de Perfil
    }
];

router.post('/start', (req, res) => {
    res.json({
        sessionId: `session_${Date.now()}`,
        step: 0,
        total: questions.length,
        message: questions[0].text,
        options: questions[0].options
    });
});

router.post('/answer', (req, res) => {
    const { sessionId, answer, allAnswers } = req.body;
    const currentStep = Object.keys(allAnswers).length;

    if (currentStep < questions.length) {
        const nextQ = questions[currentStep];
        let feedback = "Nice!";
        if (currentStep === 1) feedback = "Good job!";
        if (currentStep === 4) feedback = "Got it! Let's see your path.";

        res.json({
            done: false,
            step: currentStep,
            total: questions.length,
            message: `${feedback} ${nextQ.text}`,
            options: nextQ.options
        });
    } else {
        // CÁLCULO DE RESULTADO BASEADO NA NOVA METODOLOGIA
        let score = 0;
        if (allAnswers['q_0'] === 'a') score++;
        if (allAnswers['q_1'] === 'a') score++;
        if (allAnswers['q_2'] === 'a') score++;
        if (allAnswers['q_3'] === 'a') score++;

        let recommendedFaseId = 1; // Padrão: Fase 1 (Bronze)
        let levelStr = "A1 - Starter (Zero)";

        if (score === 2) {
            levelStr = "A2 - Elementary";
            recommendedFaseId = 1;
        } else if (score === 3) {
            levelStr = "B1 - Pre-Intermediate";
            recommendedFaseId = 2; // Já pula para o Brasão de Prata
        } else if (score === 4) {
            levelStr = "B2 - Intermediate Pro";
            recommendedFaseId = 3; // Pula para o Esmeralda
        }

        res.json({
            done: true,
            message: "Diagnostic completed! Your path is ready.",
            profileType: levelStr,
            faseId: recommendedFaseId, // ENVIA O ID PARA O DASHBOARD
            redirectUrl: "/cursos/english/dashboard.html",
            summary: `You got ${score} questions right. Based on your profile, we prepared your 48-week journey.`,
            recommendation: {
                primary: {
                    title: `Phase ${recommendedFaseId}`,
                    url: "/cursos/english/dashboard.html",
                    icon: "🛡️",
                    tag: "Your Badge",
                    description: "Click below to enter your dashboard and start your first mission."
                }
            }
        });
    }
});

module.exports = router;
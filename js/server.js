require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;

const app = express();
const PORT = process.env.PORT || 3000; // O Replit ama a 3000
const ROOT_DIR = path.join(__dirname, "..");

// 1. MIDDLEWARES DE PARSE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CONFIGURAÇÃO DE SESSÃO
app.use(session({
  secret: process.env.SESSION_SECRET || "cshub-secret-2026-dev",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// 3. APIS INTERNAS (IMPORTANTE: Antes dos arquivos estáticos)
const onboardingRoutes = require("../routes/onboarding");
const dashboardRoutes = require("../routes/dashboard");
const workspaceRoutes = require("../routes/workspace");
const placementRoutes = require('../routes/placement');

app.use("/api/onboarding", onboardingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use('/api/placement', placementRoutes);

// 4. CONFIGURAÇÃO DE ARQUIVOS ESTÁTICOS (O Segredo do 404 está aqui)
// Servindo a pasta de cursos e de dados explicitamente
app.use('/cursos', express.static(path.join(ROOT_DIR, 'cursos')));
app.use('/data', express.static(path.join(ROOT_DIR, 'data')));
app.use('/assets', express.static(path.join(ROOT_DIR, 'assets')));

// Servindo a raiz para os arquivos globais (index, hub, etc)
app.use(express.static(ROOT_DIR));

// 5. ROTAS DE PÁGINAS (Frontend)
app.get("/cursos/english/dashboard", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "cursos", "english", "dashboard.html"));
});

// Suas outras rotas de páginas existentes...
app.get("/hub.html", (_req, res) => res.sendFile(path.join(ROOT_DIR, "hub.html")));
app.get("/dashboard", (_req, res) => res.sendFile(path.join(ROOT_DIR, "dashboard.html")));

// 6. TRATAMENTO DE ERROS E START
app.use((req, res) => {
  console.log(`⚠️ 404 Not Found: ${req.url}`);
  res.status(404).send("CS Hub: Caminho não encontrado.");
});

app.listen(PORT, () => {
  console.log(`🚀 CS Hub online na porta ${PORT}`);
});
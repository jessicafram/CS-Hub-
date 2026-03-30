const express = require('express');
const session = require('express-session');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

const onboardingRoutes = require('./routes/onboarding');
const dashboardRoutes  = require('./routes/dashboard');
const workspaceRoutes  = require('./routes/workspace');

const app  = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret:            process.env.SESSION_SECRET || 'cshub-secret-2026-dev',
  resave:            false,
  saveUninitialized: true,
  cookie:            { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// Ensure every request has a stable session ID
app.use((req, _res, next) => {
  if (!req.session.id) req.session.regenerate(() => next());
  else next();
});

app.use('/api/onboarding', onboardingRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/workspace',  workspaceRoutes);

// Serve static files from project root
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  setHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

app.get('/onboarding', (_req, res) => res.sendFile(path.join(__dirname, 'onboarding.html')));
app.get('/dashboard',  (_req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/workspace',  (_req, res) => res.sendFile(path.join(__dirname, 'workspace.html')));

app.use((_req, res) => res.status(404).send('Not found'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CS Hub running on http://0.0.0.0:${PORT}`);
});

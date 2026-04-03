require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;

const onboardingRoutes = require("../routes/onboarding");
const dashboardRoutes = require("../routes/dashboard");
const workspaceRoutes = require("../routes/workspace");

const app = express();
const PORT = process.env.PORT || 5000;

// raiz do projeto (porque este arquivo está em /js)
const ROOT_DIR = path.join(__dirname, "..");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sessão: use apenas UMA vez
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cshub-secret-2026-dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

// passport
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (_accessToken, _refreshToken, profile, done) => {
      return done(null, {
        provider: "google",
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails || [],
        photos: profile.photos || [],
      });
    }
  )
);

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ["identify", "email"],
    },
    (_accessToken, _refreshToken, profile, done) => {
      return done(null, {
        provider: "discord",
        id: profile.id,
        displayName: profile.username,
        email: profile.email || null,
        avatar: profile.avatar || null,
      });
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

// arquivos estáticos da RAIZ do projeto
app.use(
  express.static(ROOT_DIR, {
    index: false,
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

// rotas de autenticação
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html" }),
  (_req, res) => {
    res.redirect("/hub.html");
  }
);

app.get("/auth/discord", passport.authenticate("discord"));

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login.html" }),
  (_req, res) => {
    res.redirect("/hub.html");
  }
);

app.get("/auth/me", (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    user: req.user,
  });
});

app.get("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

// APIs internas
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/workspace", workspaceRoutes);

// páginas
app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.get("/hub.html", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "hub.html"));
});

app.get("/login.html", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "login.html"));
});

app.get("/signup.html", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "signup.html"));
});

app.get("/assinatura.html", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "assinatura.html"));
});

app.get("/onboarding", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "onboarding.html"));
});

app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "dashboard.html"));
});

app.get("/workspace", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "workspace.html"));
});

app.use((_req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CS Hub running on http://localhost:${PORT}`);
});
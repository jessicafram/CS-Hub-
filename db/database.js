const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', 'data', 'cshub.db');

const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    session_id   TEXT UNIQUE NOT NULL,
    name         TEXT,
    display_name TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS onboarding_sessions (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL,
    status       TEXT DEFAULT 'in_progress',
    current_step INTEGER DEFAULT 0,
    profile_type TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id           TEXT PRIMARY KEY,
    session_id   TEXT NOT NULL,
    role         TEXT NOT NULL,
    content      TEXT NOT NULL,
    question_key TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES onboarding_sessions(id)
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    id             TEXT PRIMARY KEY,
    user_id        TEXT UNIQUE NOT NULL,
    profile_type   TEXT,
    background     TEXT,
    goal           TEXT,
    learning_style TEXT,
    focus_area     TEXT,
    short_term_goal TEXT,
    answers_json   TEXT,
    summary        TEXT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id           TEXT PRIMARY KEY,
    user_id      TEXT NOT NULL,
    primary_path TEXT NOT NULL,
    next_steps   TEXT NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notebook_entries (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    title      TEXT,
    content    TEXT NOT NULL DEFAULT '',
    last_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS agent_interactions (
    id             TEXT PRIMARY KEY,
    user_id        TEXT NOT NULL,
    mode           TEXT NOT NULL,
    user_input     TEXT,
    agent_response TEXT NOT NULL,
    note_context   TEXT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_activity (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    action     TEXT NOT NULL,
    detail     TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const queries = {
  getOrCreateUser(sessionId) {
    let user = db.prepare('SELECT * FROM users WHERE session_id = ?').get(sessionId);
    if (!user) {
      const id = uuidv4();
      db.prepare('INSERT INTO users (id, session_id) VALUES (?, ?)').run(id, sessionId);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    return user;
  },

  getActiveOnboardingSession(userId) {
    return db.prepare(
      "SELECT * FROM onboarding_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
    ).get(userId);
  },

  createOnboardingSession(userId) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO onboarding_sessions (id, user_id) VALUES (?, ?)'
    ).run(id, userId);
    return db.prepare('SELECT * FROM onboarding_sessions WHERE id = ?').get(id);
  },

  addMessage(sessionId, role, content, questionKey = null) {
    const id = uuidv4();
    db.prepare(
      'INSERT INTO messages (id, session_id, role, content, question_key) VALUES (?, ?, ?, ?, ?)'
    ).run(id, sessionId, role, content, questionKey);
    return id;
  },

  getMessages(sessionId) {
    return db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC').all(sessionId);
  },

  updateSessionStep(sessionId, step) {
    db.prepare('UPDATE onboarding_sessions SET current_step = ? WHERE id = ?').run(step, sessionId);
  },

  completeSession(sessionId, profileType) {
    db.prepare(
      "UPDATE onboarding_sessions SET status = 'completed', profile_type = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(profileType, sessionId);
  },

  upsertProfile(userId, profileData) {
    const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(userId);
    if (existing) {
      db.prepare(`
        UPDATE user_profiles SET
          profile_type = ?, background = ?, goal = ?, learning_style = ?,
          focus_area = ?, short_term_goal = ?, answers_json = ?, summary = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        profileData.profileType, profileData.background, profileData.goal,
        profileData.learningStyle, profileData.focusArea, profileData.shortTermGoal,
        JSON.stringify(profileData.answers), profileData.summary, userId
      );
    } else {
      db.prepare(`
        INSERT INTO user_profiles
          (id, user_id, profile_type, background, goal, learning_style, focus_area, short_term_goal, answers_json, summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(), userId, profileData.profileType, profileData.background,
        profileData.goal, profileData.learningStyle, profileData.focusArea,
        profileData.shortTermGoal, JSON.stringify(profileData.answers), profileData.summary
      );
    }
  },

  upsertRecommendation(userId, primaryPath, nextSteps) {
    const existing = db.prepare('SELECT id FROM recommendations WHERE user_id = ?').get(userId);
    if (existing) {
      db.prepare('UPDATE recommendations SET primary_path = ?, next_steps = ? WHERE user_id = ?')
        .run(JSON.stringify(primaryPath), JSON.stringify(nextSteps), userId);
    } else {
      db.prepare('INSERT INTO recommendations (id, user_id, primary_path, next_steps) VALUES (?, ?, ?, ?)')
        .run(uuidv4(), userId, JSON.stringify(primaryPath), JSON.stringify(nextSteps));
    }
  },

  setDisplayName(userId, name) {
    db.prepare('UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, userId);
  },

  getUserProfile(userId) {
    return db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
  },

  getLatestNote(userId) {
    return db.prepare('SELECT * FROM notebook_entries WHERE user_id = ? ORDER BY last_saved DESC LIMIT 1').get(userId);
  },

  saveNote(userId, title, content) {
    const existing = db.prepare('SELECT id FROM notebook_entries WHERE user_id = ?').get(userId);
    if (existing) {
      db.prepare('UPDATE notebook_entries SET title = ?, content = ?, last_saved = CURRENT_TIMESTAMP WHERE user_id = ?')
        .run(title, content, userId);
    } else {
      db.prepare('INSERT INTO notebook_entries (id, user_id, title, content) VALUES (?, ?, ?, ?)')
        .run(uuidv4(), userId, title, content);
    }
  },

  saveAgentInteraction(userId, mode, userInput, agentBlocks, noteContext) {
    db.prepare('INSERT INTO agent_interactions (id, user_id, mode, user_input, agent_response, note_context) VALUES (?, ?, ?, ?, ?, ?)')
      .run(uuidv4(), userId, mode, userInput, JSON.stringify(agentBlocks), noteContext || '');
  },

  getRecentAgentInteractions(userId, limit = 5) {
    return db.prepare('SELECT * FROM agent_interactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
      .all(userId, limit)
      .map(r => ({ ...r, agent_response: JSON.parse(r.agent_response) }))
      .reverse();
  },

  logActivity(userId, action, detail) {
    db.prepare('INSERT INTO user_activity (id, user_id, action, detail) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), userId, action, detail || '');
  },

  getRecentActivity(userId, limit = 5) {
    return db.prepare('SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
      .all(userId, limit);
  },

  getNotesCount(userId) {
    const note = db.prepare('SELECT content FROM notebook_entries WHERE user_id = ?').get(userId);
    if (!note || !note.content) return 0;
    return note.content.split('\n').filter(l => l.trim().length > 0).length;
  },

  getDashboardData(userId) {
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
    const recommendation = db.prepare('SELECT * FROM recommendations WHERE user_id = ?').get(userId);
    const session = db.prepare(
      "SELECT * FROM onboarding_sessions WHERE user_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 1"
    ).get(userId);
    const messageCount = session
      ? db.prepare("SELECT COUNT(*) as c FROM messages WHERE session_id = ? AND role = 'user'").get(session.id)
      : { c: 0 };

    return {
      profile,
      recommendation: recommendation ? {
        primaryPath: JSON.parse(recommendation.primary_path),
        nextSteps: JSON.parse(recommendation.next_steps)
      } : null,
      session,
      messageCount: messageCount.c
    };
  }
};

module.exports = { db, queries };

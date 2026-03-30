const express = require('express');
const router  = express.Router();
const { queries } = require('../db/database');
const { respond, MODES } = require('../engine/socratic');

// GET /api/workspace — load user's notebook + profile context
router.get('/', (req, res) => {
  try {
    const user = queries.getOrCreateUser(req.session.id);
    req.session.userId = user.id;

    const note    = queries.getLatestNote(user.id);
    const profile = queries.getUserProfile(user.id);
    const history = queries.getRecentAgentInteractions(user.id, 8);

    res.json({
      user: { id: user.id, name: user.display_name },
      note: note || { title: '', content: '' },
      profile: profile ? { type: profile.profile_type, summary: profile.summary } : null,
      agentHistory: history,
      modes: MODES
    });
  } catch (err) {
    console.error('Workspace load error:', err);
    res.status(500).json({ error: 'Failed to load workspace' });
  }
});

// POST /api/workspace/note — save note
router.post('/note', (req, res) => {
  try {
    const { title, content } = req.body;
    if (content === undefined) return res.status(400).json({ error: 'Content required' });

    const user = queries.getOrCreateUser(req.session.id);
    req.session.userId = user.id;

    queries.saveNote(user.id, title || 'Sem título', content);
    queries.logActivity(user.id, 'note_saved', title || 'Nota salva');

    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Note save error:', err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// POST /api/workspace/agent — Socratic Agent interaction
router.post('/agent', (req, res) => {
  try {
    const { mode, freeText, noteContent } = req.body;
    if (!mode && !freeText) return res.status(400).json({ error: 'mode or freeText required' });

    const user    = queries.getOrCreateUser(req.session.id);
    req.session.userId = user.id;

    const profile = queries.getUserProfile(user.id);
    const profileType = profile?.profile_type || 'beginner_explorer';

    const blocks = respond(mode || 'free', noteContent || '', freeText || '', profileType);

    queries.saveAgentInteraction(user.id, mode || 'free', freeText || '', blocks, noteContent);
    queries.logActivity(user.id, 'agent_interaction', mode || 'free');

    res.json({ blocks, profileType });
  } catch (err) {
    console.error('Agent error:', err);
    res.status(500).json({ error: 'Agent interaction failed' });
  }
});

// POST /api/workspace/identify — soft login: save display name
router.post('/identify', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 1) return res.status(400).json({ error: 'Name required' });

    const user = queries.getOrCreateUser(req.session.id);
    queries.setDisplayName(user.id, name.trim());
    queries.logActivity(user.id, 'identified', name.trim());

    res.json({ ok: true, name: name.trim() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save name' });
  }
});

module.exports = router;

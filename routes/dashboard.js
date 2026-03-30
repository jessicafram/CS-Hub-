const express = require('express');
const router  = express.Router();
const { queries } = require('../db/database');
const { PROFILE_MAP } = require('../engine/recommender');
const { buildContextualMessage } = require('../engine/socratic');

router.get('/', (req, res) => {
  try {
    const user = queries.getOrCreateUser(req.session.id);
    req.session.userId = user.id;

    const data = queries.getDashboardData(user.id);

    if (!data.profile) {
      return res.json({ onboardingRequired: true });
    }

    const profileMeta = PROFILE_MAP[data.profile.profile_type] || { label: 'Explorador', color: '#2ecc71' };
    const note        = queries.getLatestNote(user.id);
    const noteLines   = queries.getNotesCount(user.id);
    const activity    = queries.getRecentActivity(user.id, 4);

    const primaryTitle = data.recommendation?.primaryPath?.title || 'seu caminho recomendado';
    const hasNotes     = noteLines > 0;
    const rebecaMsg    = buildContextualMessage(data.profile.profile_type, primaryTitle, hasNotes);

    res.json({
      onboardingRequired: false,
      user: {
        id:          user.id,
        name:        user.display_name,
        createdAt:   user.created_at
      },
      profile: {
        type:    data.profile.profile_type,
        label:   profileMeta.label,
        color:   profileMeta.color,
        summary: data.profile.summary,
        answers: data.profile.answers_json ? JSON.parse(data.profile.answers_json) : {}
      },
      recommendation: data.recommendation,
      session: data.session ? {
        completedAt:  data.session.completed_at,
        messageCount: data.messageCount
      } : null,
      notes: {
        hasContent: hasNotes,
        lineCount:  noteLines,
        title:      note?.title || null,
        lastSaved:  note?.last_saved || null
      },
      rebecaMessage: rebecaMsg,
      recentActivity: activity
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;

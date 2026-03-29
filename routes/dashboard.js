const express = require('express');
const router  = express.Router();
const { queries } = require('../db/database');
const { PROFILE_MAP } = require('../engine/recommender');

router.get('/', (req, res) => {
  try {
    const user = queries.getOrCreateUser(req.session.id);
    req.session.userId = user.id;

    const data = queries.getDashboardData(user.id);

    if (!data.profile) {
      return res.json({ onboardingRequired: true });
    }

    const profileMeta = PROFILE_MAP[data.profile.profile_type] || { label: 'Explorador', color: '#2ecc71' };

    res.json({
      onboardingRequired: false,
      user: { id: user.id, createdAt: user.created_at },
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
      } : null
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;

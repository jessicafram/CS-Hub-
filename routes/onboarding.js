const express = require('express');
const router  = express.Router();
const { queries } = require('../db/database');
const { QUESTIONS, classifyProfile, buildSummary, recommend, getClosingMessage } = require('../engine/recommender');

router.post('/start', (req, res) => {
  try {
    const user = queries.getOrCreateUser(req.session.id);
    req.session.userId = user.id;

    let session = queries.getActiveOnboardingSession(user.id);

    if (!session || session.status === 'completed') {
      session = queries.createOnboardingSession(user.id);
    }

    const firstQ = QUESTIONS[0];
    queries.addMessage(session.id, 'rebeca', firstQ.text, firstQ.key);

    res.json({
      sessionId: session.id,
      message: firstQ.text,
      options: firstQ.options,
      step: 0,
      total: QUESTIONS.length
    });
  } catch (err) {
    console.error('Error starting onboarding:', err);
    res.status(500).json({ error: 'Failed to start onboarding' });
  }
});

router.post('/answer', (req, res) => {
  try {
    const { sessionId, answer, answerLabel } = req.body;
    if (!sessionId || !answer) return res.status(400).json({ error: 'Missing fields' });

    const user = queries.getOrCreateUser(req.session.id);
    const session = queries.getActiveOnboardingSession(user.id);

    if (!session || session.id !== sessionId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const currentStep = session.current_step;
    const currentQ    = QUESTIONS[currentStep];

    queries.addMessage(session.id, 'user', answerLabel || answer, currentQ.key);

    const nextStep = currentStep + 1;
    queries.updateSessionStep(session.id, nextStep);

    if (nextStep < QUESTIONS.length) {
      const nextQ = QUESTIONS[nextStep];
      queries.addMessage(session.id, 'rebeca', nextQ.text, nextQ.key);

      return res.json({
        done: false,
        message: nextQ.text,
        options: nextQ.options,
        step: nextStep,
        total: QUESTIONS.length
      });
    }

    // All questions answered — classify and recommend
    const messages = queries.getMessages(session.id);
    const answers  = {};
    messages.filter(m => m.role === 'user').forEach((m, i) => {
      answers[QUESTIONS[i]?.key] = m.content;
    });

    // Re-collect actual answer values from session messages
    const rawAnswers = {};
    const userMessages = messages.filter(m => m.role === 'user');
    userMessages.forEach((m, i) => {
      if (QUESTIONS[i]) rawAnswers[QUESTIONS[i].key] = req.body.allAnswers?.[QUESTIONS[i].key] || m.content;
    });

    // Use structured answers passed from frontend if available
    const structuredAnswers = req.body.allAnswers || rawAnswers;
    const profileType  = classifyProfile(structuredAnswers);
    const summary      = buildSummary(profileType, structuredAnswers);
    const recs         = recommend(profileType);
    const closingMsg   = getClosingMessage(profileType);

    queries.completeSession(session.id, profileType);
    queries.upsertProfile(user.id, {
      profileType,
      background:     structuredAnswers.background,
      goal:           structuredAnswers.goal,
      learningStyle:  structuredAnswers.learning_style,
      focusArea:      structuredAnswers.focus_area,
      shortTermGoal:  structuredAnswers.short_term_goal,
      answers:        structuredAnswers,
      summary
    });
    queries.upsertRecommendation(user.id, recs.primary, recs.next);
    queries.addMessage(session.id, 'rebeca', closingMsg, 'closing');

    return res.json({
      done: true,
      message: closingMsg,
      profileType,
      summary,
      recommendation: { primary: recs.primary, next: recs.next }
    });
  } catch (err) {
    console.error('Error processing answer:', err);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

router.get('/status', (req, res) => {
  try {
    const user = queries.getOrCreateUser(req.session.id);
    req.session.userId = user.id;
    const session = queries.getActiveOnboardingSession(user.id);
    const dashboard = queries.getDashboardData(user.id);

    res.json({
      hasCompletedOnboarding: session?.status === 'completed',
      hasProfile: !!dashboard.profile,
      userId: user.id
    });
  } catch (err) {
    res.status(500).json({ error: 'Status check failed' });
  }
});

module.exports = router;

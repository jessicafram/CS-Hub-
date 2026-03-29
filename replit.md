# CS Hub

An independent, social-impact educational platform by Jéssica França (Software Architect). It democratizes access to high-complexity Computer Science content, bridging academic theory and market practice.

## Tech Stack

- **Runtime**: Node.js 20 (Express.js backend)
- **Database**: SQLite via `better-sqlite3` (stored at `data/cshub.db`)
- **Sessions**: `express-session` with server-side storage
- **Frontend**: Vanilla HTML5, CSS3, JavaScript — no build step
- **Fonts**: Inter, Fira Code, Dancing Script (Google Fonts)
- **Image processing**: `sharp` (installed, for banner resize tasks)

## Architecture

```
/
├── server.js               # Express entry point — serves static files + API (port 5000)
├── db/database.js          # SQLite connection, schema init, all query helpers
├── engine/recommender.js   # Onboarding questions, profile classifier, recommendation engine
├── routes/
│   ├── onboarding.js       # POST /api/onboarding/start, /answer, GET /status
│   └── dashboard.js        # GET /api/dashboard
├── onboarding.html         # Premium Rebeca onboarding experience
├── dashboard.html          # User profile + recommendations dashboard
├── data/cshub.db           # SQLite database (gitignored)
└── materiais/              # Static course content (HTML lessons by subject)
    ├── java-basico/        # Java basics course
    ├── backend/            # Payment API engineering
    ├── ihc/                # Human-Computer Interaction
    ├── mat-discreta/       # Discrete Mathematics
    ├── mat-comp/           # Computational Mathematics
    └── n8n/                # n8n automation & AI
```

## Key Features (Phase 2)

### Rebeca Onboarding Flow
- 5 Socratic questions covering: background, goal, learning style, focus area, short-term goal
- Session-persistent (resumes across page loads)
- Typing indicator, animated message bubbles, progress bar
- Visual: `assets/rebeca.jpeg` displayed with glowing animated border

### Profile Classification Engine
8 profiles: `beginner_explorer`, `college_learner`, `career_transition_learner`, `ai_learner`, `frontend_learner`, `backend_learner`, `global_learner`, `interview_learner`

### Recommendation Engine
Maps profiles to primary learning path + 3 next steps, all linking to existing CS Hub course pages.

### Database Schema
- `users` — session-keyed user records
- `onboarding_sessions` — tracks state and completion
- `messages` — full conversation history
- `user_profiles` — inferred profile and all answers
- `recommendations` — primary path + next steps (JSON)

### Pages
- `/` — CS Hub main landing (static)
- `/onboarding` — Rebeca diagnostic flow
- `/dashboard` — User profile, recommendations, session stats
- `/materiais/*` — Course content pages

## Development

Workflow: **Start application** runs `node server.js` on port 5000.

## Deployment

Configured as **static** deployment (update to autoscale if backend needs to be included in production).

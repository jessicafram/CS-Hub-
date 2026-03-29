const QUESTIONS = [
  {
    key: 'background',
    text: 'Olá! Sou a Rebeca, sua guia pessoal no CS Hub. Estou aqui para entender seu momento e encontrar o melhor caminho para você. Me conta: qual é a sua situação atual?',
    options: [
      { value: 'professional', label: '💼 Já trabalho com tecnologia' },
      { value: 'student',      label: '🎓 Estou na faculdade ou curso técnico' },
      { value: 'beginner',     label: '🌱 Estou começando do zero' }
    ]
  },
  {
    key: 'goal',
    text: 'Que ótimo ponto de partida! Agora me diz: o que você mais quer aprender ou dominar agora?',
    options: [
      { value: 'programming', label: '⌨️ Lógica e programação' },
      { value: 'web',         label: '🌐 Desenvolvimento web e interfaces' },
      { value: 'ai',          label: '🤖 Inteligência Artificial e automação' },
      { value: 'theory',      label: '📐 Teoria da computação e matemática' },
      { value: 'interviews',  label: '🎯 Preparação para entrevistas técnicas' }
    ]
  },
  {
    key: 'learning_style',
    text: 'Perfeito. Cada pessoa aprende diferente. Como você se identifica mais?',
    options: [
      { value: 'practice',  label: '🔨 Praticando com projetos reais' },
      { value: 'theory',    label: '📖 Entendendo a teoria primeiro' },
      { value: 'portfolio', label: '🗂️ Construindo um portfólio sólido' },
      { value: 'career',    label: '📈 Foco direto em resultado de carreira' }
    ]
  },
  {
    key: 'focus_area',
    text: 'Interessante! Me conta onde você quer se destacar nos próximos meses:',
    options: [
      { value: 'ai',         label: '🧠 IA, automação e agentes inteligentes' },
      { value: 'frontend',   label: '🎨 Frontend e experiência do usuário' },
      { value: 'backend',    label: '⚙️ Backend, APIs e arquitetura de sistemas' },
      { value: 'global',     label: '🌎 Carreira global e comunicação em inglês' },
      { value: 'interviews', label: '🏆 Entrevistas e empresas top tier' }
    ]
  },
  {
    key: 'short_term_goal',
    text: 'Quase lá! Última pergunta: qual é o seu objetivo mais urgente agora?',
    options: [
      { value: 'first_job',     label: '🚀 Conseguir meu primeiro emprego em tech' },
      { value: 'career_change', label: '🔄 Mudar de área ou crescer na carreira' },
      { value: 'interviews',    label: '📝 Passar em processos seletivos difíceis' },
      { value: 'learning',      label: '💡 Me desenvolver e aprender com profundidade' }
    ]
  }
];

const PROFILE_MAP = {
  beginner_explorer:         { label: 'Explorador Iniciante',          color: '#2ecc71' },
  college_learner:           { label: 'Aprendiz Acadêmico',            color: '#3498db' },
  career_transition_learner: { label: 'Transição de Carreira',         color: '#e67e22' },
  ai_learner:                { label: 'Entusiasta de IA',              color: '#9b59b6' },
  frontend_learner:          { label: 'Especialista Front-End',        color: '#1abc9c' },
  backend_learner:           { label: 'Engenheiro de Backend',         color: '#e74c3c' },
  global_learner:            { label: 'Profissional Global',           color: '#f39c12' },
  interview_learner:         { label: 'Preparação para Entrevistas',   color: '#e91e63' }
};

const PATHS = {
  java_basics: {
    title: 'Java Básico',
    description: 'A base sólida de toda engenharia de software. Você vai dominar OOP, lógica e estruturas de dados.',
    url: '/materiais/java-basico/index.html',
    icon: '☕',
    tag: 'Iniciante',
    duration: '~18h'
  },
  backend_api: {
    title: 'Engenharia de APIs de Pagamento',
    description: 'Construa APIs robustas com AdonisJS e TypeScript. Arquitetura real, segurança e resiliência.',
    url: '/materiais/backend/index.html',
    icon: '⚙️',
    tag: 'Avançado',
    duration: '~40h'
  },
  n8n_ai: {
    title: 'Automação com n8n e IA',
    description: 'Crie agentes de IA e automatize processos complexos com ferramentas de low-code modernas.',
    url: '/materiais/n8n/index.html',
    icon: '🤖',
    tag: 'IA & Automação',
    duration: '~12h'
  },
  ihc: {
    title: 'Interação Humano-Computador',
    description: 'Design de interfaces, heurísticas de usabilidade e pesquisa com usuário para produtos digitais.',
    url: '/materiais/ihc/index.html',
    icon: '🎨',
    tag: 'UX & Design',
    duration: '~20h'
  },
  mat_discreta: {
    title: 'Matemática Discreta',
    description: 'Os fundamentos matemáticos da ciência da computação: lógica, conjuntos, grafos e combinatória.',
    url: '/materiais/mat-discreta/index.html',
    icon: '📐',
    tag: 'Teoria',
    duration: '~30h'
  },
  mat_comp: {
    title: 'Matemática Computacional',
    description: 'Álgebra linear, cálculo numérico e estatística aplicados à computação moderna e IA.',
    url: '/materiais/mat-comp/index.html',
    icon: '🔢',
    tag: 'Matemática',
    duration: '~25h'
  }
};

function classifyProfile(answers) {
  const { background, goal, focus_area, short_term_goal } = answers;

  if (goal === 'ai' || focus_area === 'ai')                                        return 'ai_learner';
  if (focus_area === 'frontend' || goal === 'web')                                  return 'frontend_learner';
  if (focus_area === 'backend')                                                      return 'backend_learner';
  if (focus_area === 'global')                                                       return 'global_learner';
  if (focus_area === 'interviews' || short_term_goal === 'interviews')              return 'interview_learner';
  if (background === 'student' && (goal === 'theory' || goal === 'programming'))   return 'college_learner';
  if (background === 'professional' && short_term_goal === 'career_change')        return 'career_transition_learner';

  return 'beginner_explorer';
}

function buildSummary(profileType, answers) {
  const profile = PROFILE_MAP[profileType];
  const bgMap = { professional: 'um profissional de tecnologia', student: 'um estudante', beginner: 'uma pessoa iniciando na área' };
  const goalMap = { programming: 'lógica e programação', web: 'desenvolvimento web', ai: 'IA e automação', theory: 'teoria da computação', interviews: 'entrevistas técnicas' };
  const bg = bgMap[answers.background] || 'alguém determinado';
  const g  = goalMap[answers.goal] || 'tecnologia';
  return `Você é ${bg} com foco em ${g}. Seu perfil — ${profile.label} — indica que seu maior potencial está no caminho que recomendamos abaixo. Confie no processo.`;
}

const RECS = {
  beginner_explorer:         { primary: PATHS.java_basics,  next: [PATHS.mat_discreta, PATHS.ihc,        PATHS.backend_api] },
  college_learner:           { primary: PATHS.mat_discreta, next: [PATHS.java_basics,  PATHS.mat_comp,   PATHS.backend_api] },
  career_transition_learner: { primary: PATHS.backend_api,  next: [PATHS.java_basics,  PATHS.n8n_ai,     PATHS.ihc]         },
  ai_learner:                { primary: PATHS.n8n_ai,       next: [PATHS.backend_api,  PATHS.mat_comp,   PATHS.java_basics]  },
  frontend_learner:          { primary: PATHS.ihc,          next: [PATHS.java_basics,  PATHS.backend_api, PATHS.n8n_ai]      },
  backend_learner:           { primary: PATHS.backend_api,  next: [PATHS.java_basics,  PATHS.mat_discreta, PATHS.n8n_ai]    },
  global_learner:            { primary: PATHS.ihc,          next: [PATHS.backend_api,  PATHS.n8n_ai,     PATHS.java_basics]  },
  interview_learner:         { primary: PATHS.backend_api,  next: [PATHS.mat_discreta, PATHS.java_basics, PATHS.mat_comp]   }
};

function recommend(profileType) {
  return RECS[profileType] || RECS.beginner_explorer;
}

function getClosingMessage(profileType) {
  const msgs = {
    beginner_explorer:         'Analisei tudo e tenho um caminho perfeito para você. Cada grande engenheiro começou exatamente onde você está agora.',
    college_learner:           'Seu background acadêmico é um trunfo. Veja o caminho que vai turbinar sua formação com profundidade real.',
    career_transition_learner: 'Transições de carreira exigem coragem e estratégia. Preparei um caminho direto ao ponto para você.',
    ai_learner:                'Ótimo foco! IA está transformando tudo. Seu caminho começa com ferramentas práticas e poderosas.',
    frontend_learner:          'Interfaces incríveis nascem de profundo entendimento do usuário. Seu caminho vai te diferenciar.',
    backend_learner:           'Sistemas robustos são construídos com fundamentos sólidos. Seu caminho é intenso e recompensador.',
    global_learner:            'Uma carreira global começa com a habilidade de comunicar ideias complexas. Seu caminho está traçado.',
    interview_learner:         'Entrevistas técnicas são previsíveis quando você sabe o que estudar. Seu caminho é cirúrgico e eficiente.'
  };
  return msgs[profileType] || msgs.beginner_explorer;
}

module.exports = { QUESTIONS, PROFILE_MAP, classifyProfile, buildSummary, recommend, getClosingMessage };

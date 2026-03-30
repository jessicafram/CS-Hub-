// Socratic Agent — pedagogically-aware, rule-based response engine
// No LLM dependency: uses structured templates + content analysis

const MODES = {
  summarize: { label: 'Resumir', icon: '📋', hint: 'Criar um resumo estruturado das notas' },
  reflect:   { label: 'Refletir', icon: '🤔', hint: 'Perguntas para aprofundar o entendimento' },
  organize:  { label: 'Organizar', icon: '🗂️', hint: 'Sugerir uma organização mais clara' },
  simplify:  { label: 'Simplificar', icon: '💡', hint: 'Explicar de forma mais acessível' },
  outline:   { label: 'Roteiro', icon: '🗺️', hint: 'Estrutura de conceitos em estilo mapa mental' },
  next_step: { label: 'Próximo Passo', icon: '🎯', hint: 'Sugerir o que estudar a seguir' }
};

function analyzeContent(text) {
  if (!text || text.trim().length < 10) return null;
  const words   = text.trim().split(/\s+/);
  const lines   = text.split('\n').filter(l => l.trim().length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);

  // Extract potential keywords (capitalized words, repeated terms)
  const wordFreq = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-záàâãéêíóôõúüç]/g, '');
    if (clean.length > 4) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  return { wordCount: words.length, lineCount: lines.length, sentences, keywords, lines };
}

function respond(mode, noteContent, freeText, profileType) {
  const analysis = analyzeContent(noteContent);
  const hasContent = analysis && analysis.wordCount > 10;

  switch (mode) {
    case 'summarize':  return summarize(analysis, noteContent, hasContent);
    case 'reflect':    return reflect(analysis, noteContent, hasContent, profileType);
    case 'organize':   return organize(analysis, noteContent, hasContent);
    case 'simplify':   return simplify(freeText, noteContent, hasContent);
    case 'outline':    return outline(analysis, noteContent, hasContent);
    case 'next_step':  return nextStep(profileType, noteContent, hasContent);
    default:           return freeResponse(freeText, noteContent, hasContent, profileType);
  }
}

function summarize(analysis, content, hasContent) {
  if (!hasContent) return [
    { type: 'text', text: 'Ainda não tenho notas para resumir. Escreva seu conteúdo no editor à esquerda e eu vou estruturá-lo para você.' }
  ];

  const { sentences, keywords, lineCount } = analysis;
  const topSentences = sentences.slice(0, 3).map(s => s.trim()).filter(s => s.length > 10);

  return [
    { type: 'text', text: 'Aqui está um resumo estruturado do que você escreveu:' },
    { type: 'section', title: '📌 Pontos Principais', items: topSentences.length > 0 ? topSentences : ['Texto com ' + lineCount + ' linhas de conteúdo'] },
    { type: 'section', title: '🔑 Conceitos-chave identificados', items: keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)) },
    { type: 'question', text: 'Há algum ponto que você acha que não ficou claro ou precisa de mais desenvolvimento?' }
  ];
}

function reflect(analysis, content, hasContent, profileType) {
  const profileQuestions = {
    beginner_explorer:         ['O que foi mais difícil de entender até agora?', 'Se você tivesse que explicar isso para um amigo, como faria?', 'Que exemplo do mundo real você poderia usar para ilustrar esse conceito?'],
    college_learner:           ['Como esse conceito se conecta com o que você estudou na faculdade?', 'Quais são as premissas fundamentais que sustentam essa ideia?', 'Existe uma prova formal ou derivação que justifica esse resultado?'],
    career_transition_learner: ['Como você aplicaria isso no ambiente profissional?', 'Que problema de negócio esse conceito resolve?', 'Como isso se diferencia do que você já fazia antes na sua carreira?'],
    ai_learner:                ['Como esse conceito se aplica em sistemas de IA ou automação?', 'Que dados ou padrões esse modelo precisaria aprender?', 'Quais são as limitações dessa abordagem em escala?'],
    frontend_learner:          ['Como isso afeta a experiência do usuário final?', 'Que decisão de design esse conceito influencia?', 'Como você tornaria isso acessível e intuitivo?'],
    backend_learner:           ['Como isso se comporta sob alta carga ou falha?', 'Quais são as implicações para a consistência dos dados?', 'Que trade-off de desempenho esse approach traz?'],
    interview_learner:         ['Como você explicaria isso em uma entrevista técnica em 2 minutos?', 'Qual seria a pergunta de follow-up que um entrevistador sênior faria?', 'Que código você escreveria para demonstrar esse conceito?'],
    global_learner:            ['Como você explicaria isso em inglês para um colega?', 'Qual é o vocabulário técnico em inglês que você precisa dominar aqui?', 'Esse conceito tem equivalentes culturais ou variações regionais?']
  };

  const questions = profileQuestions[profileType] || profileQuestions.beginner_explorer;

  return [
    { type: 'text', text: 'Ótimo momento para refletir. Não vou dar respostas prontas — quero que você pense:' },
    { type: 'questions', items: questions },
    { type: 'text', text: 'Escolha a que mais te provoca e tente responder nas suas notas. A escrita é parte do aprendizado.' }
  ];
}

function organize(analysis, content, hasContent) {
  if (!hasContent) return [
    { type: 'text', text: 'Escreva suas notas primeiro e eu vou sugerir uma organização mais clara para elas.' }
  ];

  const { lineCount, keywords } = analysis;
  const suggestedStructure = [
    'Contexto / O que é este conceito?',
    'Por que é importante?',
    'Como funciona na prática?',
    'Exemplos concretos',
    'Conexões com outros conceitos',
    'Dúvidas e próximos passos'
  ];

  return [
    { type: 'text', text: 'Suas notas têm ' + lineCount + ' linhas. Aqui está uma estrutura que tornaria o conteúdo mais claro e reutilizável:' },
    { type: 'section', title: '📐 Estrutura Sugerida', items: suggestedStructure },
    { type: 'text', text: 'Tente reorganizar o que você escreveu seguindo essa estrutura. Isso vai facilitar tanto a revisão quanto a memorização.' },
    { type: 'question', text: 'Qual dessas seções você sente que está mais vazia no seu conteúdo atual?' }
  ];
}

function simplify(freeText, content, hasContent) {
  const concept = freeText && freeText.trim().length > 3 ? freeText.trim() : 'o conceito das suas notas';
  return [
    { type: 'text', text: 'Vou ajudar a simplificar "' + concept + '". Mas primeiro, uma pergunta socrática:' },
    { type: 'question', text: 'O que você já entende sobre isso? Descreva com suas próprias palavras, mesmo que pareça incompleto.' },
    { type: 'text', text: 'Depois que você escrever sua tentativa de explicação, eu consigo identificar exatamente onde está o nó de dificuldade e ajudar de forma cirúrgica.' },
    { type: 'section', title: '💡 Dica de Aprendizado', items: [
      'Explique como se fosse para um leigo — se você não consegue, ainda não entendeu',
      'Use analogias: "isso funciona como..."',
      'Separe o "o quê" do "por quê" do "como"'
    ]}
  ];
}

function outline(analysis, content, hasContent) {
  if (!hasContent) return [
    { type: 'text', text: 'Escreva seu conteúdo nas notas e eu vou criar um roteiro de conceitos para você.' }
  ];

  const { keywords, sentences } = analysis;
  const nodes = keywords.slice(0, 4).map(k => k.charAt(0).toUpperCase() + k.slice(1));

  return [
    { type: 'text', text: 'Aqui está um esboço de mapa conceitual baseado no que você escreveu:' },
    { type: 'outline', root: 'Tópico Central', branches: nodes.length > 0 ? nodes : ['Conceito A', 'Conceito B', 'Conceito C'] },
    { type: 'section', title: '🗺️ Para expandir cada ramo, pergunte-se:', items: [
      'O que define este conceito?',
      'Que exemplos o ilustram?',
      'Como ele se conecta aos outros?',
      'Onde ele é aplicado na prática?'
    ]},
    { type: 'question', text: 'Qual desses ramos você sente que precisa de mais profundidade?' }
  ];
}

function nextStep(profileType, content, hasContent) {
  const stepMap = {
    beginner_explorer:         { action: 'Pratique com exercícios simples', detail: 'Escreva um pequeno programa ou resolva um exercício baseado no que você acabou de estudar. A prática concreta fixa o aprendizado.' },
    college_learner:           { action: 'Aprofunde com referências acadêmicas', detail: 'Procure o artigo ou livro base que formalizou esse conceito. Entender a origem fortalece a compreensão.' },
    career_transition_learner: { action: 'Aplique em um projeto real', detail: 'Crie um mini-projeto que use esse conceito. Portfólio com aplicações reais tem mais peso que teoria pura.' },
    ai_learner:                { action: 'Experimente com uma implementação', detail: 'Rode um exemplo prático, modifique parâmetros e observe os resultados. Experimentação é parte essencial do aprendizado em IA.' },
    frontend_learner:          { action: 'Construa um componente', detail: 'Implemente uma pequena interface que aplique o que você estudou. Ver no navegador é mais poderoso que apenas ler.' },
    backend_learner:           { action: 'Implemente e teste a resiliência', detail: 'Escreva o código, quebre-o intencionalmente e veja como ele falha. Entender falhas é essencial no backend.' },
    interview_learner:         { action: 'Resolva um problema de entrevista', detail: 'Procure um exercício no LeetCode ou HackerRank que use esse conceito e resolva sem olhar a solução.' },
    global_learner:            { action: 'Explique em inglês', detail: 'Escreva um parágrafo sobre o conceito em inglês. Produção ativa no idioma é a forma mais eficiente de consolidar.' }
  };

  const step = stepMap[profileType] || stepMap.beginner_explorer;

  return [
    { type: 'text', text: 'Com base no seu perfil e no que você está estudando, aqui está o que recomendo como próximo passo:' },
    { type: 'action', title: step.action, detail: step.detail },
    { type: 'question', text: 'O que impediria você de fazer isso hoje? Se houver um obstáculo, vamos identificá-lo.' }
  ];
}

function freeResponse(freeText, content, hasContent, profileType) {
  if (!freeText || freeText.trim().length < 3) {
    return [{ type: 'text', text: 'Use os botões acima para interagir comigo, ou escreva sua dúvida e eu responderei de forma socrática.' }];
  }

  const text = freeText.toLowerCase();
  if (text.includes('não entend') || text.includes('nao entend') || text.includes('confus') || text.includes('difíci') || text.includes('dificil')) {
    return simplify(freeText, content, hasContent);
  }
  if (text.includes('resumo') || text.includes('resumir') || text.includes('sintetiz')) {
    return summarize(analyzeContent(content), content, hasContent);
  }
  if (text.includes('organiz') || text.includes('estrutur')) {
    return organize(analyzeContent(content), content, hasContent);
  }
  if (text.includes('próximo') || text.includes('proximo') || text.includes('estudar depois') || text.includes('continuar')) {
    return nextStep(profileType, content, hasContent);
  }

  return [
    { type: 'text', text: 'Você disse: "' + freeText.trim() + '"' },
    { type: 'question', text: 'Antes de eu responder diretamente: o que você já tentou ou já sabe sobre isso? Me conta, mesmo que incompleto.' },
    { type: 'text', text: 'Minha abordagem é socrática — prefiro que você pense junto comigo a receber uma resposta pronta. Isso produz um aprendizado muito mais sólido.' }
  ];
}

function buildContextualMessage(profileType, recommendationTitle, hasNotes) {
  const msgs = {
    beginner_explorer:         `Você está no início da jornada mais importante da sua carreira. Cada nota que você salva é um tijolo. Comece pelo **${recommendationTitle}** e não pule etapas.`,
    college_learner:           `Sua base acadêmica é um diferencial real. Use o **${recommendationTitle}** para conectar teoria e prática de forma sólida.`,
    career_transition_learner: `Transições exigem foco e consistência. O **${recommendationTitle}** foi escolhido especificamente para acelerar sua mudança de carreira.`,
    ai_learner:                `IA está evoluindo rápido, mas os fundamentos não mudam. Comece com o **${recommendationTitle}** e construa de baixo para cima.`,
    frontend_learner:          `Boas interfaces nascem de profundo entendimento do usuário. O **${recommendationTitle}** vai transformar como você enxerga produto.`,
    backend_learner:           `Sistemas robustos não se constroem com pressa. O **${recommendationTitle}** vai fortalecer sua base técnica de forma consistente.`,
    global_learner:            `Uma carreira global é construída com comunicação precisa. O **${recommendationTitle}** vai te preparar para isso.`,
    interview_learner:         `Entrevistas técnicas recompensam quem pratica de forma sistemática. O **${recommendationTitle}** é o seu ponto de partida estratégico.`
  };
  const note = hasNotes ? ' Suas notas estão salvas e prontas para continuar.' : ' Abra sua área de estudos e comece a registrar o que aprendeu.';
  return (msgs[profileType] || msgs.beginner_explorer) + note;
}

module.exports = { MODES, respond, buildContextualMessage };

const questions = [
  ['Você se considera uma pessoa difícil?', [['Sim', 'Pelo menos é sincera.'], ['Não', 'Informação questionável.'], ['Depende', 'Resposta diplomaticamente conveniente.']]],
  ['Você costuma bloquear pessoas quando elas demoram para responder?', [['Sim', 'Histórico confirmado.'], ['Não', 'Contradição detectada.'], ['Às vezes', 'Estamos cientes.']]],
  ['Você considera alguém seu amigo mesmo quando a pessoa discorda?', [['Sim', 'Comportamento previamente identificado.'], ['Não', 'Houve uma atualização de comportamento.'], ['Depende da pessoa', 'Interessante...']]],
  ['Você gosta de receber elogios?', [['Sim', 'Informação registrada.'], ['Não', 'Evidências sugerem o contrário.'], ['Depende de quem elogia', 'Resposta relevante.']]],
  ['Você gosta de coisas muito fáceis?', [['Sim', 'Contradição com declarações anteriores.'], ['Não', 'Conforme esperado.'], ['Depende', 'Suspeito.']]],
  ['Você costuma sentir falta de pessoas que vê frequentemente?', [['Sim', 'Informação importante.'], ['Não', 'Será?'], ['De algumas', 'Cada vez mais interessante.']]],
  ['Você prefere descobrir as coisas sozinha ou receber uma resposta diretamente?', [['Descobrir sozinha', 'Infelizmente, o suspense acabou.'], ['Receber uma resposta', 'Excelente.'], ['Depende', 'O sistema decidiu por você.']]],
];

const metrics = [['Personalidade', 98], ['Bom humor', 95], ['Capacidade de ser difícil', 100], ['Estabilidade no WhatsApp', 12], ['Potencial de compatibilidade', 96]];
const panel = document.querySelector('#panel');
const suggestedName = new URLSearchParams(location.hash.slice(1)).get('c')?.trim().slice(0, 50) || '';
const historyPrefix = 'sac:assessment:v1:';
let candidate = '';
let attempt = null;
let index = 0;
let selected = -1;

function saveAttempt() {
  if (!attempt) return;
  attempt.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(historyPrefix + attempt.id, JSON.stringify(attempt));
    document.getElementById('storage-status').textContent = 'Histórico salvo neste navegador. Nenhuma resposta é transmitida.';
  } catch {
    document.getElementById('storage-status').textContent = 'Não foi possível salvar o histórico neste navegador.';
  }
}

function readHistory() {
  const records = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(historyPrefix)) continue;
      try {
        const record = JSON.parse(localStorage.getItem(key));
        if (record && typeof record.name === 'string' && Array.isArray(record.answers)) records.push(record);
      } catch { /* Ignore an unreadable entry without affecting other tests. */ }
    }
  } catch {
    document.getElementById('storage-status').textContent = 'Não foi possível acessar o histórico neste navegador.';
  }
  return records.sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function formatMeetingDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(year, month - 1, day));
}

function historyActions() {
  return '<div class="history-actions"><button class="secondary" id="open-history">Ver histórico local</button><button class="subtle" id="new-test">Fazer outro teste</button></div>';
}

function bindHistoryActions() {
  bind('open-history', showHistory);
  bind('new-test', intro);
}

function showHistory() {
  const records = readHistory();
  const states = { started: 'Em andamento', evaluated: 'Avaliação concluída · Convite sem resposta', accepted: 'Convite aceito · Data a combinar', declined: 'Convite recusado', planned: 'Encontro escolhido' };
  const cards = records.map(record => {
    const started = new Date(record.startedAt);
    const timestamp = Number.isFinite(started.getTime()) ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(started) : 'Data indisponível';
    const answers = record.answers.map(answer => `<li><strong>${escapeHtml(answer.question)}</strong><span>${escapeHtml(answer.answer)}</span><small>${escapeHtml(answer.feedback)}</small></li>`).join('');
    const day = record.meetingDate && /^\d{4}-\d{2}-\d{2}$/.test(record.meetingDate) ? formatMeetingDate(record.meetingDate) : '';
    return `<details class="history-entry"><summary><span><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml(timestamp)} · ${record.answers.length}/7 perguntas</small></span><span class="history-score">${record.score === 96 ? '96/100' : 'Em curso'}</span></summary><div class="history-body"><p class="history-state">${escapeHtml(states[record.status] || 'Em andamento')}</p>${record.idea ? `<p><strong>Programa:</strong> ${escapeHtml(record.idea)}</p>` : ''}${day ? `<p><strong>Dia:</strong> ${escapeHtml(day)}</p>` : ''}${answers ? `<ol class="history-answers">${answers}</ol>` : '<p>Nenhuma pergunta respondida ainda.</p>'}</div></details>`;
  }).join('');
  render(`<div class="eyebrow">SEUS REGISTROS</div><h1>Histórico de avaliações</h1><p>Testes realizados neste navegador, disponíveis apenas neste dispositivo e perfil de navegador.</p><div class="history-count">${records.length} ${records.length === 1 ? 'teste registrado' : 'testes registrados'}</div><div class="history-list">${cards || '<p class="empty-history">Nenhuma avaliação registrada ainda.</p>'}</div><div class="history-actions"><button class="primary" id="new-test">Voltar ao início</button></div>`, 'Avaliação / Histórico', 1);
  bind('new-test', intro);
}

function bunnyArt(kind) {
  const romantic = kind === 'invitation' || kind === 'celebration';
  const bunny = (x, coat, ear, flip = 1) => `<g transform="translate(${x} 0) scale(${flip} 1)" stroke="#9b7186" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="0" cy="132" rx="37" ry="7" fill="#d9a8ba" opacity=".18" stroke="none"/>
    <ellipse cx="0" cy="113" rx="28" ry="24" fill="${coat}"/>
    <ellipse cx="-20" cy="132" rx="14" ry="8" fill="${coat}"/><ellipse cx="20" cy="132" rx="14" ry="8" fill="${coat}"/>
    <path d="M-23 63 C-42 25 -33 10 -22 15 C-12 20 -9 41 -8 55" fill="${coat}"/>
    <path d="M15 56 C12 29 19 9 30 13 C44 18 34 47 28 63" fill="${coat}"/>
    <path d="M-25 24 Q-28 39 -17 53 M29 23 Q24 35 23 49" fill="none" stroke="${ear}" stroke-width="6"/>
    <path d="M-39 79 C-39 54 -19 49 0 51 C23 49 39 63 39 82 C39 104 20 111 0 111 C-24 111 -39 102 -39 79Z" fill="${coat}"/>
    <ellipse cx="-15" cy="81" rx="3" ry="4.5" fill="#694658" stroke="none"/><ellipse cx="15" cy="81" rx="3" ry="4.5" fill="#694658" stroke="none"/>
    <ellipse cx="-25" cy="91" rx="7" ry="4" fill="#f2a9b9" stroke="none" opacity=".85"/><ellipse cx="25" cy="91" rx="7" ry="4" fill="#f2a9b9" stroke="none" opacity=".85"/>
    <path d="M-3 88 Q0 85 3 88 L0 91Z" fill="#b77a8e" stroke="none"/><path d="M0 91 Q-4 96 -7 92 M0 91 Q4 96 7 92" fill="none" stroke-width="1.4"/>
    <path d="M-22 111 Q-31 117 -21 121 M22 111 Q31 117 21 121" fill="none"/>
  </g>`;
  return `<svg class="bunny-art" viewBox="0 0 280 158" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <ellipse cx="140" cy="80" rx="108" ry="65" fill="#fff1f1"/>
    <path d="M15 62l5-9 5 9 9 5-9 5-5 9-5-9-9-5z M242 37l4-8 4 8 8 4-8 4-4 8-4-8-8-4z" fill="#e6bdde"/>
    <circle cx="45" cy="24" r="4" fill="#f5c1cf"/><circle cx="236" cy="116" r="3.5" fill="#f2c4d0"/>
    ${romantic ? `${bunny(99,'#fff9ed','#f2c2c8')}${bunny(181,'#f6dce8','#f1b4c7',-1)}<g transform="translate(140 107)" stroke="#c27e9d" stroke-width="1.5"><rect x="-23" y="-12" width="46" height="29" rx="5" fill="#fff9f5"/><path d="M-21 -9L0 5 21 -9" fill="none"/><path d="M0 1C-10-8-13 1 0 11 13 1 10-8 0 1Z" fill="#d77c9a" stroke="none"/></g><path class="floating-heart" d="M140 27C128 10 113 25 140 45 167 25 152 10 140 27Z" fill="#dd8eab"/>` : `${bunny(140,'#fff9ee','#f2c0c8')}<g transform="translate(140 111) rotate(-5)" stroke="#b78098" stroke-width="1.4"><rect x="-21" y="-15" width="42" height="34" rx="5" fill="#eac9e3"/><rect x="-16" y="-10" width="32" height="25" rx="2" fill="#fffaf5" stroke="none"/><rect x="-7" y="-18" width="14" height="6" rx="3" fill="#f7c8d5"/><path d="M-10-3l3 3 4-6M1-3h9M-10 7l3 3 4-6M1 7h9" fill="none"/></g><g transform="translate(178 45)"><path d="M0 0 C-17-14-22 5-3 7 C-5 22 11 20 7 6 C24 8 21-10 5-3 C11-20-7-20 0 0Z" fill="#f4aec4"/><circle cx="3" cy="3" r="4" fill="#fff0b8"/></g>`}
  </svg>`;
}

function render(html, breadcrumb, stage) {
  panel.innerHTML = html;
  panel.dataset.stage = stage;
  panel.dataset.screen = panel.querySelector('#candidate-name') ? 'intro' : panel.querySelector('[data-choice]') ? 'question' : panel.querySelector('.score') ? 'report' : panel.querySelector('#accept, #yes') ? 'invitation' : panel.querySelector('[data-idea]') ? 'ideas' : panel.querySelector('#meeting-day') ? 'date' : panel.querySelector('.celebration') ? 'celebration' : panel.querySelector('.history-list') ? 'history' : 'other';
  if (['intro', 'invitation', 'celebration'].includes(panel.dataset.screen)) {
    const art = document.createElement('div');
    art.className = 'storybook-art';
    art.innerHTML = bunnyArt(panel.dataset.screen);
    panel.querySelector('h1').before(art);
  }
  if (panel.dataset.screen === 'invitation') {
    const ornament = document.createElement('div');
    ornament.className = 'love-letter';
    ornament.setAttribute('aria-hidden', 'true');
    ornament.innerHTML = '<span class="letter-spark">✦</span><span class="envelope"><i>♡</i></span><span class="letter-spark">✧</span>';
    panel.querySelector('h1').before(ornament);
  }
  if (panel.dataset.screen === 'celebration') {
    const sparkle = document.createElement('div');
    sparkle.className = 'celebration-sparkles';
    sparkle.setAttribute('aria-hidden', 'true');
    sparkle.innerHTML = '<span>✦</span><span>♡</span><span>✧</span><span>♡</span><span>✦</span>';
    panel.prepend(sparkle);
  }
  if (panel.dataset.screen === 'question') {
    const progress = panel.querySelector('.progress');
    const steps = document.createElement('div');
    steps.className = 'petal-progress';
    steps.setAttribute('aria-hidden', 'true');
    steps.innerHTML = Array.from({length: 7}, (_, i) => `<span class="${i < index ? 'bloomed' : i === index ? 'blooming' : ''}">✿</span>`).join('');
    progress.after(steps);
  }
  document.querySelector('#breadcrumb').textContent = breadcrumb;
  for (let step = 1; step <= 3; step++) {
    const state = step < stage ? 'done' : step === stage ? 'active' : '';
    const desktop = document.querySelector(`#step${step}`);
    desktop.className = state;
    if (step === stage) desktop.setAttribute('aria-current', 'step');
    else desktop.removeAttribute('aria-current');
    document.querySelector(`#mobile${step}`).className = state === 'active' ? 'current' : state;
  }
  panel.style.animation = 'none';
  void panel.offsetWidth;
  panel.style.animation = '';
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'instant' });
  panel.querySelector('h1, h2')?.setAttribute('tabindex', '-1');
  panel.querySelector('h1, h2')?.focus({ preventScroll: true });
}

function bind(id, action) {
  document.getElementById(id).addEventListener('click', action);
}

function intro() {
  index = 0;
  selected = -1;
  attempt = null;
  render(`<div class="eyebrow">PROTOCOLO DE AVALIAÇÃO INDIVIDUAL</div>
    <h1>Sistema de Avaliação de Compatibilidade</h1>
    <p>Este procedimento consiste em uma breve avaliação comportamental. Selecione a resposta que melhor representa seu perfil em cada questão.</p>
    <div class="intro-meta"><div class="meta"><small>Questões</small><strong>07</strong></div><div class="meta"><small>Tempo estimado</small><strong>2 minutos</strong></div></div>
    <form id="name-form"><label for="candidate-name">Qual é o seu nome?</label><input class="date-input" id="candidate-name" name="name" type="text" autocomplete="given-name" maxlength="50" required placeholder="Digite seu nome"><p class="local-note">Seu nome e suas respostas serão guardados neste navegador, inclusive se você sair antes de terminar.</p><button class="primary" id="start" type="submit">Iniciar avaliação <span class="arrow" aria-hidden="true">→</span></button></form><div class="history-actions"><button class="secondary" id="open-history">Ver histórico local</button></div>`, 'Avaliação / Início', 1);
  const input = document.getElementById('candidate-name');
  input.value = candidate || suggestedName;
  input.addEventListener('input', () => input.setCustomValidity(''));
  document.getElementById('name-form').addEventListener('submit', event => {
    event.preventDefault();
    candidate = input.value.trim();
    if (!candidate) {
      input.setCustomValidity('Digite seu nome para continuar.');
      input.reportValidity();
      return;
    }
    attempt = { id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: candidate, startedAt: new Date().toISOString(), answers: [], status: 'started', score: null, idea: null, meetingDate: null };
    saveAttempt();
    question();
  });
  bind('open-history', showHistory);
}

function question() {
  selected = -1;
  const [prompt, options] = questions[index];
  render(`<div class="question-head"><span class="eyebrow">ETAPA 1 — AVALIAÇÃO COMPORTAMENTAL</span><span class="counter">${String(index + 1).padStart(2, '0')} / 07</span></div>
    <div class="progress" role="progressbar" aria-label="Progresso" aria-valuenow="${index + 1}" aria-valuemin="0" aria-valuemax="7"><span style="width:${(index + 1) / 7 * 100}%"></span></div>
    <h2>${prompt}</h2><div class="options">${options.map(([label], i) => `<button class="option" data-choice="${i}" aria-pressed="false"><span class="option-letter" aria-hidden="true">${'ABC'[i]}</span>${label}</button>`).join('')}</div>
    <div id="feedback" class="feedback" role="status" hidden></div>
    <div class="question-actions"><span class="hint">Selecione uma alternativa.</span><button class="primary" id="next" disabled>${index === 6 ? 'Concluir avaliação' : 'Continuar'} <span class="arrow" aria-hidden="true">→</span></button></div>`, 'Avaliação / Questionário', 1);
  panel.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
    selected = Number(button.dataset.choice);
    panel.querySelectorAll('[data-choice]').forEach(choice => {
      const active = choice === button;
      choice.classList.toggle('selected', active);
      choice.setAttribute('aria-pressed', String(active));
    });
    const feedback = document.getElementById('feedback');
    feedback.textContent = options[selected][1];
    feedback.hidden = false;
    feedback.classList.remove('feedback-pop');
    void feedback.offsetWidth;
    feedback.classList.add('feedback-pop');
    document.getElementById('next').disabled = false;
  }));
  bind('next', () => {
    if (selected < 0) return;
    attempt.answers.push({ question: prompt, answer: options[selected][0], feedback: options[selected][1] });
    if (index === questions.length - 1) {
      attempt.status = 'evaluated';
      attempt.score = 96;
    }
    saveAttempt();
    if (++index < questions.length) question();
    else processing();
  });
}

function processing() {
  render(`<div class="eyebrow">PROCESSAMENTO DE RESULTADOS</div><h1>Gerando relatório</h1><p>Consolidando os indicadores comportamentais.</p><div class="processing"><span class="spinner" aria-hidden="true"></span> Analisando compatibilidade...</div>`, 'Avaliação / Processamento', 2);
  setTimeout(report, 1100);
}

function report() {
  render(`<div class="eyebrow">RELATÓRIO DE DESEMPENHO</div><h1>Avaliação de compatibilidade</h1><p>Candidata: <strong id="candidate"></strong></p>
    <div class="result-top"><div><span class="result-caption">RESULTADO DA PRIMEIRA ETAPA</span><div class="score">96<small>/100</small></div></div><span class="status">APROVADA</span></div>
    <div class="metrics">${metrics.map(([label, value]) => `<div><div class="metric-head"><span>${label}</span><span>${value}%</span></div><div class="metric-track" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span class="${value < 20 ? 'low' : ''}" style="width:${value}%"></span></div></div>`).join('')}</div>
    <div class="approval"><strong>Parabéns, você foi aprovada!</strong><p>Apesar das irregularidades encontradas, seu desempenho foi considerado satisfatório. Você está habilitada a participar da segunda etapa.</p></div>
    <button class="primary" id="proceed">Prosseguir <span class="arrow" aria-hidden="true">→</span></button>`, 'Avaliação / Relatório', 2);
  document.getElementById('candidate').textContent = candidate;
  bind('proceed', invite);
}

function invite() {
  render(`<div class="eyebrow">ETAPA 2 — CONVITE EXCLUSIVO</div><h1>Convite autorizado</h1><p>Com base no resultado da primeira etapa, o sistema concedeu acesso a uma oportunidade exclusiva.</p>
    <div class="reveal"><h2>Você aceita sair comigo?</h2><p>Um encontro a dois, com dia e horário a combinar.</p><div class="actions"><button class="primary" id="accept">Aceitar</button><button class="secondary" id="decline">Recusar</button><button class="subtle" id="clarify">Esclarecer a natureza do convite</button></div></div>`, 'Avaliação / Convite exclusivo', 3);
  bind('accept', chooseDateIdea);
  bind('decline', () => finish(false));
  bind('clarify', clarify);
}

function clarify() {
  render(`<div class="eyebrow">ETAPA 2 — ESCLARECIMENTO</div><h1>Natureza do convite</h1><p>Sim, é um convite para um encontro romântico. A avaliação anterior foi uma brincadeira.</p><div class="reveal"><h2>Você quer sair comigo?</h2><div class="actions"><button class="primary" id="yes">Sim</button><button class="secondary" id="no">Não</button></div></div>`, 'Avaliação / Esclarecimento', 3);
  bind('yes', chooseDateIdea);
  bind('no', () => finish(false));
}

const dateIdeas = [
  ['🍣', 'Sushi', 'Um jantar gostoso e muita conversa.'],
  ['🍿', 'Filme em casa', 'Conforto, filme e pipoca.'],
  ['🎬', 'Cinema', 'Uma sessão de cinema a dois.'],
  ['🏎️', 'Andar de kart', 'Um pouco de adrenalina.'],
  ['✨', 'Todos, porque quero viver muito!', 'Por que escolher só um?'],
];

function chooseDateIdea() {
  attempt.status = attempt.meetingDate ? 'planned' : 'accepted';
  saveAttempt();
  let idea = -1;
  render(`<div class="eyebrow">ETAPA 2 — NOSSO PRIMEIRO ENCONTRO</div><h1>Qual seria o seu primeiro encontro ideal?</h1><p>Escolha o programa que mais combina com você.</p><div class="options date-ideas">${dateIdeas.map(([icon, label, detail], i) => `<button class="option idea-option" data-idea="${i}" aria-pressed="false"><span class="idea-icon" aria-hidden="true">${icon}</span><span class="idea-text"><strong>${label}</strong><small>${detail}</small></span></button>`).join('')}</div><div class="question-actions"><span class="hint">Escolha uma opção.</span><button class="primary" id="idea-next" disabled>Continuar <span class="arrow" aria-hidden="true">→</span></button></div>`, 'Avaliação / Primeiro encontro', 3);
  panel.querySelectorAll('[data-idea]').forEach(button => button.addEventListener('click', () => {
    idea = Number(button.dataset.idea);
    panel.querySelectorAll('[data-idea]').forEach(choice => {
      const active = choice === button;
      choice.classList.toggle('selected', active);
      choice.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('idea-next').disabled = false;
  }));
  bind('idea-next', () => {
    if (idea < 0) return;
    if (attempt.idea !== dateIdeas[idea][1]) attempt.meetingDate = null;
    attempt.idea = dateIdeas[idea][1];
    attempt.status = attempt.meetingDate ? 'planned' : 'accepted';
    saveAttempt();
    chooseDay(idea);
  });
}

function chooseDay(idea) {
  const today = new Date();
  const minimum = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  render(`<div class="eyebrow">ETAPA 2 — RESERVE UM DIA</div><h1>E qual dia funciona para você?</h1><p>Escolha uma data para nosso primeiro encontro.</p><div class="chosen-idea"><span aria-hidden="true">${dateIdeas[idea][0]}</span><strong>${dateIdeas[idea][1]}</strong></div><form id="date-form"><label for="meeting-day">Data do encontro</label><input class="date-input" type="date" id="meeting-day" name="meeting-day" min="${minimum}" required><div class="question-actions"><button class="subtle" type="button" id="change-idea">Mudar programa</button><button class="primary" type="submit">Confirmar <span class="arrow" aria-hidden="true">→</span></button></div></form>`, 'Avaliação / Data do encontro', 3);
  bind('change-idea', chooseDateIdea);
  document.getElementById('date-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('meeting-day');
    if (input.checkValidity() && input.value >= minimum) showDateSummary(idea, input.value);
  });
}

function showDateSummary(idea, date) {
  const formatted = formatMeetingDate(date);
  const label = dateIdeas[idea][1];
  attempt.status = 'planned';
  attempt.idea = label;
  attempt.meetingDate = date;
  saveAttempt();
  render(`<div class="eyebrow">PROCESSO CONCLUÍDO</div><div class="end-mark celebration" aria-hidden="true">♡</div><h1>Temos um encontro!</h1><p>Seu programa e dia estão escolhidos. Agora só falta combinar o horário.</p><dl class="date-summary"><div><dt>Primeiro encontro</dt><dd>${dateIdeas[idea][0]} ${label}</dd></div><div><dt>Dia escolhido</dt><dd>${formatted}</dd></div></dl><p class="share-note">Copie o resumo para enviar a quem te convidou.</p><div class="actions"><button class="primary" id="copy-plan">Copiar nosso plano</button><button class="secondary" id="edit-day">Alterar data</button></div><p id="copy-status" class="copy-status" role="status"></p>${historyActions()}`, 'Avaliação / Conclusão', 3);
  bindHistoryActions();
  const note = document.createElement('p');
  note.className = 'personal-note';
  note.textContent = `Que seja um dia lindo, ${candidate}!`;
  panel.querySelector('h1').after(note);
  bind('edit-day', () => chooseDay(idea));
  bind('copy-plan', async () => {
    const message = `Aceito sair com você!\nPrograma: ${label}\nDia: ${formatted}`;
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(message);
      status.textContent = 'Copiado! Agora é só enviar.';
    } catch {
      const field = document.createElement('textarea');
      field.value = message;
      field.readOnly = true;
      field.className = 'copy-fallback';
      status.replaceChildren(field);
      field.select();
    }
  });
}

function finish() {
  attempt.status = 'declined';
  saveAttempt();
  render(`<div class="eyebrow">PROCESSO ENCERRADO</div><div class="end-mark neutral" aria-hidden="true">–</div><h1>Avaliação encerrada</h1><div class="closure-message"><p><span id="closure-name"></span>, você é exatamente o tipo de garota que eu gosto, e não quero continuar me aproximando de alguém por quem posso desenvolver sentimentos sem que exista interesse recíproco.</p><p>Por isso, a partir de hoje, prefiro que nosso contato seja exclusivamente profissional. Não quero manter uma relação de amizade com você.</p><p>Obrigado por participar da avaliação.</p></div><button class="primary" id="close-assessment">Encerrar avaliação</button>`, 'Avaliação / Conclusão', 3);
  document.getElementById('closure-name').textContent = candidate;
  bind('close-assessment', () => {
    render(`<div class="eyebrow">PROCESSO ENCERRADO</div><div class="end-mark neutral" aria-hidden="true">–</div><h1>Avaliação encerrada</h1><p>Obrigado por participar da avaliação. Você pode fechar esta página.</p>`, 'Avaliação / Conclusão', 3);
    attempt = null;
  });
}

intro();

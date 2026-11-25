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
const candidate = new URLSearchParams(location.hash.slice(1)).get('c')?.trim().slice(0, 50) || 'Candidata';
let index = 0;
let selected = -1;

function render(html, breadcrumb, stage) {
  panel.innerHTML = html;
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
  render(`<div class="eyebrow">PROTOCOLO DE AVALIAÇÃO INDIVIDUAL</div>
    <h1>Sistema de Avaliação de Compatibilidade</h1>
    <p>Este procedimento consiste em uma breve avaliação comportamental. Selecione a resposta que melhor representa seu perfil em cada questão.</p>
    <div class="intro-meta"><div class="meta"><small>Questões</small><strong>07</strong></div><div class="meta"><small>Tempo estimado</small><strong>2 minutos</strong></div></div>
    <button class="primary" id="start">Iniciar avaliação <span class="arrow" aria-hidden="true">→</span></button>`, 'Avaliação / Início', 1);
  bind('start', question);
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
    document.getElementById('next').disabled = false;
  }));
  bind('next', () => {
    if (selected < 0) return;
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
  bind('idea-next', () => { if (idea >= 0) chooseDay(idea); });
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
  const [year, month, day] = date.split('-').map(Number);
  const formatted = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(year, month - 1, day));
  const label = dateIdeas[idea][1];
  render(`<div class="eyebrow">PROCESSO CONCLUÍDO</div><div class="end-mark celebration" aria-hidden="true">♡</div><h1>Temos um encontro!</h1><p>Seu programa e dia estão escolhidos. Agora só falta combinar o horário.</p><dl class="date-summary"><div><dt>Primeiro encontro</dt><dd>${dateIdeas[idea][0]} ${label}</dd></div><div><dt>Dia escolhido</dt><dd>${formatted}</dd></div></dl><p class="share-note">Copie o resumo para enviar a quem te convidou.</p><div class="actions"><button class="primary" id="copy-plan">Copiar nosso plano</button><button class="secondary" id="edit-day">Alterar data</button></div><p id="copy-status" class="copy-status" role="status"></p>`, 'Avaliação / Conclusão', 3);
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
  render(`<div class="eyebrow">PROCESSO ENCERRADO</div><div class="end-mark neutral" aria-hidden="true">–</div><h1>Avaliação encerrada</h1><p>Resposta registrada nesta sessão. Obrigado por participar da avaliação.</p>`, 'Avaliação / Conclusão', 3);
}

intro();

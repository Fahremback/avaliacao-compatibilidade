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
  bind('accept', () => finish(true));
  bind('decline', () => finish(false));
  bind('clarify', clarify);
}

function clarify() {
  render(`<div class="eyebrow">ETAPA 2 — ESCLARECIMENTO</div><h1>Natureza do convite</h1><p>Sim, é um convite para um encontro romântico. A avaliação anterior foi uma brincadeira.</p><div class="reveal"><h2>Você quer sair comigo?</h2><div class="actions"><button class="primary" id="yes">Sim</button><button class="secondary" id="no">Não</button></div></div>`, 'Avaliação / Esclarecimento', 3);
  bind('yes', () => finish(true));
  bind('no', () => finish(false));
}

function finish(accepted) {
  render(`<div class="eyebrow">PROCESSO ENCERRADO</div><div class="end-mark ${accepted ? '' : 'neutral'}" aria-hidden="true">${accepted ? '✓' : '–'}</div><h1>${accepted ? 'Encontro confirmado!' : 'Avaliação encerrada'}</h1><p>${accepted ? 'Parabéns. Você concluiu todas as etapas. Agora só falta combinarmos o dia e o horário.' : 'Resposta registrada nesta sessão. Obrigado por participar da avaliação.'}</p>`, 'Avaliação / Conclusão', 3);
}

intro();

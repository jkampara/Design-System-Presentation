const SLIDE_TITLES = [
  'The Agent-First Design System',
  'The Paradigm Shift',
  'How It Actually Works',
  'Where Are We Today',
  'What Is Needed',
  'The DS Package',
  'Thank You'
];

let current = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.nav-dot');
const label = document.getElementById('slide-label');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const navBar = document.querySelector('.nav-bar');
let transitioning = false;

navBar.classList.add('nav-hidden');

function goToSlide(index) {
  if (transitioning || index === current || index < 0 || index >= slides.length) return;
  transitioning = true;

  const direction = index > current ? 1 : -1;
  const oldSlide = slides[current];
  const newSlide = slides[index];

  oldSlide.classList.remove('active');
  oldSlide.style.transform = direction > 0 ? 'translateX(-60px)' : 'translateX(60px)';
  oldSlide.style.opacity = '0';

  newSlide.style.transition = 'none';
  newSlide.style.transform = direction > 0 ? 'translateX(60px)' : 'translateX(-60px)';
  newSlide.style.opacity = '0';
  newSlide.offsetHeight;

  newSlide.style.transition = '';
  newSlide.classList.add('active');
  newSlide.style.transform = '';
  newSlide.style.opacity = '';

  dots[current].classList.remove('active');
  dots[index].classList.add('active');

  current = index;

  if (current === 0 || current === slides.length - 1) {
    navBar.classList.add('nav-hidden');
  } else {
    navBar.classList.remove('nav-hidden');
    label.textContent = `${current} / ${slides.length - 2} \u2014 ${SLIDE_TITLES[current]}`;
  }

  btnPrev.disabled = current === 0;
  btnNext.disabled = current === slides.length - 1;

  setTimeout(() => {
    oldSlide.style.transform = '';
    oldSlide.style.opacity = '';
    transitioning = false;
    if (typeof drawJourneyLines === 'function') drawJourneyLines();
  }, 650);
}

function navigate(dir) {
  goToSlide(current + dir);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); navigate(1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
  if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
  if (e.key === 'Escape' && document.fullscreenElement) { document.exitFullscreen(); }
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(function() {});
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener('fullscreenchange', function() {
  var btn = document.getElementById('btn-fullscreen');
  if (!btn) return;
  if (document.fullscreenElement) {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.title = 'Exit presentation mode (Esc)';
  } else {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.title = 'Presentation mode (F)';
  }
});

/* ─── Slide 1: Toggle panels — only one open at a time ─── */
function togglePanel(el) {
  const items = el.querySelector('.panel-items');
  const isOpen = items.classList.contains('revealed');
  const container = el.closest('.split-container');

  document.querySelectorAll('.split-panel').forEach(panel => {
    const pItems = panel.querySelector('.panel-items');
    const pCta = panel.querySelector('.panel-cta');
    pItems.classList.remove('revealed');
    pCta.innerHTML = '&#x25BC; Click to reveal';
  });

  if (!isOpen) {
    items.classList.add('revealed');
    el.querySelector('.panel-cta').innerHTML = '&#x25B2; Click to collapse';
    container.classList.add('has-expanded');
  } else {
    container.classList.remove('has-expanded');
  }
}

/* ─── Slide 2: Terminal typing demo ─── */
const badLines = [
  { cls: 't-comment', text: '/* Prompt: "Build an urgent marketing hero" */' },
  { cls: 't-comment', text: '/* Agent output WITHOUT knowledge graph: */' },
  { cls: '',          text: '' },
  { cls: 't-keyword', text: '.hero-section {' },
  { cls: 't-bad',     text: '  background: #FF0000;           /* ← invented */' },
  { cls: 't-bad',     text: '  font-size: 72px;               /* ← arbitrary */' },
  { cls: 't-bad',     text: '  font-family: Impact, serif;    /* ← wrong */' },
  { cls: 't-bad',     text: '  padding: 20px;                 /* ← guessed */' },
  { cls: 't-bad',     text: '  border-radius: 0;              /* ← off-brand */' },
  { cls: 't-bad',     text: '  color: white;                  /* ← hardcoded */' },
  { cls: 't-keyword', text: '}' },
];

const goodLines = [
  { cls: 't-comment', text: '/* Prompt: "Build an urgent marketing hero" */' },
  { cls: 't-comment', text: '/* Agent output WITH knowledge graph injected: */' },
  { cls: '',          text: '' },
  { cls: 't-keyword', text: '.hero-blade--2col {' },
  { cls: 't-good',    text: '  background: var(--color-surface-1);' },
  { cls: 't-good',    text: '  font-size: var(--font-style-display-2-size);' },
  { cls: 't-good',    text: '  font-family: var(--font-family-display);' },
  { cls: 't-good',    text: '  padding: var(--space-surface-padding);' },
  { cls: 't-good',    text: '  border-radius: var(--radius-hero-card);' },
  { cls: 't-good',    text: '  color: var(--color-on-surface-1);' },
  { cls: 't-keyword', text: '}' },
];

let demoRunning = false;

function runTerminalDemo() {
  if (demoRunning) return;
  demoRunning = true;

  const termBad = document.getElementById('term-bad');
  const termGood = document.getElementById('term-good');

  const labelBad = termBad.querySelector('.terminal-label');
  const labelGood = termGood.querySelector('.terminal-label');
  termBad.innerHTML = '';
  termGood.innerHTML = '';
  termBad.appendChild(labelBad);
  termGood.appendChild(labelGood);

  function typeLine(container, lines, index) {
    if (index >= lines.length) return;
    const line = document.createElement('div');
    line.className = 'type-line';
    line.innerHTML = `<span class="${lines[index].cls}">${lines[index].text || '&nbsp;'}</span>`;
    container.appendChild(line);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => line.classList.add('visible'));
    });
    setTimeout(() => typeLine(container, lines, index + 1), 120);
  }

  typeLine(termBad, badLines, 0);
  setTimeout(() => typeLine(termGood, goodLines, 0), 400);

  setTimeout(() => { demoRunning = false; }, badLines.length * 120 + 800);
}

/* ─── Slide 2: Path toggle ─── */
var journeyConnectionsRecipe = [
  { step: 'step-2', ds: 'ds-schema',      key: 'schema',      side: 'left' },
  { step: 'step-3', ds: 'ds-recipes',     key: 'recipes',     side: 'left' },
  { step: 'step-6', ds: 'ds-tokens',      key: 'tokens',      side: 'left' },
  { step: 'step-7', ds: 'ds-constraints', key: 'constraints', side: 'left' },
  { step: 'step-4', ds: 'agent-content',  key: 'agent-content', side: 'right' },
  { step: 'step-5', ds: 'agent-media',    key: 'agent-media',   side: 'right' },
  { step: 'step-7', ds: 'agent-seo',      key: 'agent-seo',     side: 'right' }
];

var journeyConnectionsNoRecipe = [
  { step: 'step-2', ds: 'ds-schema',      key: 'schema',      side: 'left' },
  { step: 'step-3', ds: 'ds-recipes',     key: 'guidelines',  side: 'left' },
  { step: 'step-6', ds: 'ds-tokens',      key: 'tokens',      side: 'left' },
  { step: 'step-7', ds: 'ds-constraints', key: 'constraints', side: 'left' },
  { step: 'step-4', ds: 'agent-content',  key: 'agent-content', side: 'right' },
  { step: 'step-5', ds: 'agent-media',    key: 'agent-media',   side: 'right' },
  { step: 'step-7', ds: 'agent-seo',      key: 'agent-seo',     side: 'right' }
];

function getJourneyConnections() {
  var layout = document.getElementById('journeyLayout');
  return (layout && layout.dataset.path === 'no-recipe') ? journeyConnectionsNoRecipe : journeyConnectionsRecipe;
}

function toggleJourneyPath(path) {
  var layout = document.getElementById('journeyLayout');
  if (layout) layout.dataset.path = path;
  var toggle = document.getElementById('journeyToggle');
  var valueEl = document.getElementById('journeyToggleValue');
  if (toggle) {
    if (path === 'no-recipe') {
      toggle.classList.add('active');
      toggle.setAttribute('aria-checked', 'false');
    } else {
      toggle.classList.remove('active');
      toggle.setAttribute('aria-checked', 'true');
    }
  }
  if (valueEl) valueEl.textContent = path === 'recipe' ? 'Yes' : 'No';
  drawJourneyLines();
}

/* ─── Slide 2: Draw SVG connection lines between steps & DS cards ─── */

function drawJourneyLines() {
  var svg = document.getElementById('journeyLines');
  var layout = document.getElementById('journeyLayout');
  if (!svg || !layout) return;

  svg.innerHTML = '';
  var layoutRect = layout.getBoundingClientRect();

  getJourneyConnections().forEach(function(conn) {
    var stepEl = document.getElementById(conn.step);
    var dsEl   = document.getElementById(conn.ds);
    if (!stepEl || !dsEl) return;

    var stepBody = stepEl.querySelector('.journey-step-body');
    var stepRect = (stepBody || stepEl).getBoundingClientRect();
    var dsRect   = dsEl.getBoundingClientRect();

    var x1, y1, x2, y2;
    if (conn.side === 'right') {
      x1 = stepRect.right - layoutRect.left;
      y1 = stepRect.top + stepRect.height / 2 - layoutRect.top;
      x2 = dsRect.left - layoutRect.left;
      y2 = dsRect.top + dsRect.height / 2 - layoutRect.top;
    } else {
      x1 = dsRect.right - layoutRect.left;
      y1 = dsRect.top + dsRect.height / 2 - layoutRect.top;
      x2 = stepRect.left - layoutRect.left;
      y2 = stepRect.top + stepRect.height / 2 - layoutRect.top;
    }

    var midX = (x1 + x2) / 2;
    var path = 'M ' + x1 + ' ' + y1 + ' C ' + midX + ' ' + y1 + ', ' + midX + ' ' + y2 + ', ' + x2 + ' ' + y2;

    var hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hitArea.setAttribute('d', path);
    hitArea.setAttribute('class', 'journey-line-hit');
    hitArea.setAttribute('data-journey', conn.key);
    hitArea.addEventListener('click', function() { openJourneyOverlay(conn.key); });
    hitArea.addEventListener('mouseenter', function() { highlightConnection(conn, true); });
    hitArea.addEventListener('mouseleave', function() { highlightConnection(conn, false); });

    var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', path);
    line.setAttribute('class', 'journey-line');
    line.setAttribute('data-journey', conn.key);
    line.addEventListener('click', function() { openJourneyOverlay(conn.key); });
    line.addEventListener('mouseenter', function() { highlightConnection(conn, true); });
    line.addEventListener('mouseleave', function() { highlightConnection(conn, false); });

    var dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot1.setAttribute('cx', x1);
    dot1.setAttribute('cy', y1);
    dot1.setAttribute('class', 'journey-line-dot');
    dot1.setAttribute('data-journey', conn.key);

    var dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot2.setAttribute('cx', x2);
    dot2.setAttribute('cy', y2);
    dot2.setAttribute('class', 'journey-line-dot');
    dot2.setAttribute('data-journey', conn.key);

    svg.appendChild(hitArea);
    svg.appendChild(line);
    svg.appendChild(dot1);
    svg.appendChild(dot2);
  });
}

function highlightConnection(conn, on) {
  var stepEl = document.getElementById(conn.step);
  var dsEl   = document.getElementById(conn.ds);
  var lines  = document.querySelectorAll('.journey-line[data-journey="' + conn.key + '"]');
  var dots   = document.querySelectorAll('.journey-line-dot[data-journey="' + conn.key + '"]');

  if (on) {
    if (stepEl) stepEl.classList.add('highlight');
    if (dsEl) dsEl.classList.add('highlight');
    lines.forEach(function(l) { l.classList.add('active'); });
    dots.forEach(function(d) { d.style.opacity = '1'; });
  } else {
    if (stepEl) stepEl.classList.remove('highlight');
    if (dsEl) dsEl.classList.remove('highlight');
    lines.forEach(function(l) { l.classList.remove('active'); });
    dots.forEach(function(d) { d.style.opacity = ''; });
  }
}

function openJourneyOverlay(key) {
  var overlay = document.getElementById('journeyOverlay');
  if (overlay.parentNode !== document.body) {
    document.body.appendChild(overlay);
  }
  document.querySelectorAll('.journey-overlay-card').forEach(function(c) { c.classList.remove('active'); });
  var card = overlay.querySelector('.journey-overlay-card[data-journey="' + key + '"]');
  if (card) card.classList.add('active');
  overlay.classList.add('active');
}

function closeJourneyOverlay(e, force) {
  if (force || e.target === e.currentTarget) {
    var overlay = document.getElementById('journeyOverlay');
    overlay.classList.remove('active');
    document.querySelectorAll('.journey-overlay-card').forEach(function(c) { c.classList.remove('active'); });
  }
}

function openDsCardOverlay(key) {
  var overlay = document.getElementById('dsCardOverlay');
  if (overlay.parentNode !== document.body) {
    document.body.appendChild(overlay);
  }
  overlay.querySelectorAll('.journey-overlay-card').forEach(function(c) { c.classList.remove('active'); });
  var card = overlay.querySelector('.journey-overlay-card[data-ds="' + key + '"]');
  if (card) card.classList.add('active');
  overlay.classList.add('active');
}

function closeDsCardOverlay(e, force) {
  if (force || e.target === e.currentTarget) {
    var overlay = document.getElementById('dsCardOverlay');
    overlay.classList.remove('active');
    overlay.querySelectorAll('.journey-overlay-card').forEach(function(c) { c.classList.remove('active'); });
  }
}

function openAgentOverlay(key) {
  var overlay = document.getElementById('agentOverlay');
  if (overlay.parentNode !== document.body) {
    document.body.appendChild(overlay);
  }
  overlay.querySelectorAll('.journey-overlay-card').forEach(function(c) { c.classList.remove('active'); });
  var card = overlay.querySelector('.journey-overlay-card[data-agent="' + key + '"]');
  if (card) card.classList.add('active');
  overlay.classList.add('active');
}

function closeAgentOverlay(e, force) {
  if (force || e.target === e.currentTarget) {
    var overlay = document.getElementById('agentOverlay');
    overlay.classList.remove('active');
    overlay.querySelectorAll('.journey-overlay-card').forEach(function(c) { c.classList.remove('active'); });
  }
}

window.addEventListener('resize', drawJourneyLines);
setTimeout(drawJourneyLines, 300);

/* ─── Slide 3: Axis expansion ─── */
function toggleAxis(card) {
  const wasExpanded = card.classList.contains('expanded');
  document.querySelectorAll('.axis-card').forEach(c => c.classList.remove('expanded'));
  if (!wasExpanded) card.classList.add('expanded');
}

/* ─── Slide 3: Recipe tabs ─── */
function switchRecipe(tab, id) {
  document.querySelectorAll('.recipe-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.recipe-content').forEach(c => c.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(id).classList.add('active');
}

/* ─── Slide 4: Rule expansion ─── */

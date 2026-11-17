(() => {
  'use strict';
  const q = selector => document.querySelector(selector);
  const chapters = [...document.querySelectorAll('.chapter')];
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = q('#motion-toggle');
  let motionPaused = reduced.matches;
  try { motionPaused = localStorage.getItem('hymn-motion') === 'paused' || reduced.matches; } catch { /* Storage may be unavailable for a local file. */ }
  function setMotion(paused) {
    motionPaused = paused;
    document.body.classList.toggle('motion-paused', paused);
    document.documentElement.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    motionButton.setAttribute('aria-label', paused ? 'Resume ambient animation' : 'Pause ambient animation');
    motionButton.title = paused ? 'Resume ambient animation' : 'Pause ambient animation';
  }
  setMotion(motionPaused);
  motionButton.addEventListener('click', () => { setMotion(!motionPaused); try { localStorage.setItem('hymn-motion', motionPaused ? 'paused' : 'playing'); } catch {} });
  reduced.addEventListener('change', event => { if (event.matches) setMotion(true); });

  const contentsButton = q('#contents-toggle');
  const scrim = q('#nav-scrim');
  const nav = q('#chapter-navigation');
  function toggleContents(open, returnFocus = false) {
    document.body.classList.toggle('nav-open', open);
    contentsButton.setAttribute('aria-expanded', String(open));
    scrim.hidden = !open;
    syncNavAccess();
    if (open) q('#contents-close').focus();
    else if (returnFocus) contentsButton.focus();
  }
  function syncNavAccess() {
    const mobile = window.matchMedia('(max-width: 900px)').matches;
    nav.inert = mobile && !document.body.classList.contains('nav-open');
  }
  contentsButton.addEventListener('click', () => toggleContents(!document.body.classList.contains('nav-open')));
  q('#contents-close').addEventListener('click', () => toggleContents(false, true));
  scrim.addEventListener('click', () => toggleContents(false, true));
  nav.addEventListener('click', event => { if (event.target.closest('a') && document.body.classList.contains('nav-open')) toggleContents(false); });
  document.addEventListener('keydown', event => {
    if (!document.body.classList.contains('nav-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); toggleContents(false, true); }
    if (event.key === 'Tab') {
      const focusable = [...nav.querySelectorAll('button, summary, a')].filter(el => el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  syncNavAccess();

  function rng(seed) { let state = seed * 1093 + 929; return () => { state = (Math.imul(1664525, state) + 1013904223) | 0; return (state >>> 0) / 4294967296; }; }
  const line = (x1, y1, x2, y2, opacity = .4, width = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" opacity="${opacity}" stroke-width="${width}"/>`;
  const circle = (x, y, r, opacity = .5, fill = 'none') => `<circle cx="${x}" cy="${y}" r="${r}" opacity="${opacity}" fill="${fill}"/>`;
  const ellipse = (cx, cy, rx, ry, opacity = .5) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" opacity="${opacity}"/>`;
  const leaf = (x, y, size, angle = 0, opacity = .7) => `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${size})" opacity="${opacity}"><path d="M0 0 Q-20-23 0-52 Q20-23 0 0Z" fill="#cbb17b" fill-opacity=".3"/><path d="M0 0 Q-5-21 0-52 M-1-15 L-11-27 M-1-27 L9-38" stroke-width=".8"/></g>`;
  function stars(random, count = 65) { let markup = ''; for (let i = 0; i < count; i++) { const x = random() * 900, y = random() * 850, r = .5 + random() * 1.7; markup += circle(x, y, r, .15 + random() * .6, '#e7d3a9'); if (i % 15 === 0) markup += line(x - 6, y, x + 6, y, .35) + line(x, y - 6, x, y + 6, .35); } return markup; }
  function branch(random, x, y, length, angle, depth, green = false) {
    if (!depth) return leaf(x, y, .2 + random() * .35, angle * 57.3 + 90, .3 + random() * .5);
    const nx = x + Math.cos(angle) * length, ny = y + Math.sin(angle) * length;
    let markup = `<path d="M${x} ${y} Q${x + Math.cos(angle + .12) * length * .45} ${y + Math.sin(angle + .12) * length * .45} ${nx} ${ny}" stroke-width="${Math.max(.5, depth * .85)}" opacity="${.3 + depth * .06}"/>`;
    markup += branch(random, nx, ny, length * (.64 + random() * .13), angle - .28 - random() * .35, depth - 1, green);
    markup += branch(random, nx, ny, length * (.64 + random() * .13), angle + .28 + random() * .35, depth - 1, green);
    return markup;
  }
  function tree(random, id) {
    let markup = `<circle cx="450" cy="430" r="270" fill="url(#${id}-halo)" stroke="none"/>`;
    markup += `<g class="orbital-ring">${circle(450, 450, 287, .35)}${circle(450, 450, 302, .12)}${ellipse(450, 450, 348, 115, .18)}<g transform="rotate(64 450 450)">${ellipse(450, 450, 330, 170, .15)}</g></g>`;
    for (let i = 0; i < 36; i++) { const a = i * Math.PI / 18; markup += line(450 + Math.cos(a) * 291, 450 + Math.sin(a) * 291, 450 + Math.cos(a) * (i % 3 ? 296 : 304), 450 + Math.sin(a) * (i % 3 ? 296 : 304), .45); }
    markup += branch(random, 450, 710, 120, -Math.PI / 2, 8);
    markup += `<g opacity=".4">${branch(random, 450, 710, 65, Math.PI / 2 + .3, 4)}${branch(random, 450, 710, 65, Math.PI / 2 - .3, 4)}</g>`;
    markup += ellipse(450, 720, 228, 26, .17);
    markup += `<g class="floating-leaf">${leaf(630, 640, 1, 32)}${leaf(295, 660, .55, -44)}${leaf(675, 390, .5, 56)}</g>`;
    return markup;
  }
  function blackHole(random, id) {
    let markup = `<g transform="rotate(-19 450 450)"><ellipse cx="450" cy="450" rx="343" ry="89" stroke="#e6b46b" stroke-width="26" opacity=".13" filter="url(#${id}-blur)"/>`;
    for (let i = 0; i < 12; i++) markup += ellipse(450, 450, 220 + i * 11, 42 + i * 5, .14 + i * .03);
    markup += `<circle cx="450" cy="450" r="155" fill="#090910" stroke="#e9be80" stroke-width="3"/><circle cx="450" cy="450" r="161" fill="none" stroke="#e9be80" stroke-width="14" opacity=".2" filter="url(#${id}-blur)"/>`;
    markup += `<path d="M112 450 Q450 612 788 450" fill="none" stroke="#f5ce8f" stroke-width="7" opacity=".8"/><path d="M112 450 Q450 612 788 450" fill="none" stroke="#f5ce8f" stroke-width="24" opacity=".25" filter="url(#${id}-blur)"/></g>`;
    markup += `<g stroke-dasharray="2 9">${circle(450, 450, 350, .25)}${circle(450, 450, 375, .12)}</g>`;
    markup += `<path d="M170 765 Q260 520 305 505" opacity=".5" stroke-dasharray="3 7"/><path d="M161 756 l18 7 -15 11 2-8Z" fill="#f4d6a1" stroke-width="1"/>`;
    return markup;
  }
  function celestial(random) {
    let markup = `<g class="orbital-ring">${circle(450, 450, 280, .25)}${circle(450, 450, 212, .22)}${circle(450, 450, 120, .15)}${ellipse(450, 450, 330, 120, .24)}<g transform="rotate(63 450 450)">${ellipse(450, 450, 330, 120, .2)}</g></g>`;
    const points = Array.from({ length: 12 }, () => [210 + random() * 500, 170 + random() * 520]);
    markup += `<polyline points="${points.map(p => p.join(',')).join(' ')}" opacity=".25"/>`;
    points.forEach(([x, y], i) => { markup += circle(x, y, i % 3 ? 3 : 5, .8, '#d5ba87'); if (i % 3 === 0) markup += circle(x, y, 13, .3); });
    markup += line(110, 450, 790, 450, .15) + line(450, 110, 450, 790, .15);
    for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30; markup += line(450 + Math.cos(a) * 284, 450 + Math.sin(a) * 284, 450 + Math.cos(a) * (i % 5 ? 289 : 300), 450 + Math.sin(a) * (i % 5 ? 289 : 300), .4); }
    return markup;
  }
  function machine(random, id) {
    let markup = `<circle cx="450" cy="330" r="175" fill="url(#${id}-halo)" stroke="none"/>${circle(450, 330, 176, .3)}${circle(450, 330, 190, .12)}`;
    for (let i = 0; i < 13; i++) markup += line(450, 500, -350 + i * 130, 850, .13);
    for (let i = 0; i < 8; i++) markup += line(90, 520 + i * i * 6, 810, 520 + i * i * 6, .12);
    for (let i = 0; i < 17; i++) {
      const x = 110 + i * 40, h = 60 + random() * 250, y = 660 + Math.abs(i - 8) * 9, w = 17 + random() * 12;
      markup += `<path d="M${x} ${y} v${-h} l${w} -12 12 8 v${h} l${-w} 12Z M${x} ${y-h} l12 8 ${w}-12 M${x+12} ${y-h+8} v${h}" fill="#102a2c" fill-opacity=".7" opacity=".6"/>`;
      for (let j = 0; j < 5; j++) markup += line(x + 17, y - h + 25 + j * 18, x + 24, y - h + 20 + j * 18, .4);
    }
    markup += `<path d="M245 325 h85 v-80 h145 v80 h95 v-45 h87" stroke-dasharray="3 8" opacity=".4"/>${circle(245,325,6,.8)}${circle(657,280,6,.8)}`;
    return markup;
  }
  function garden(random, id) {
    let markup = `<circle cx="450" cy="460" r="260" fill="url(#${id}-halo)" stroke="none"/>${circle(450,460,260,.35)}${circle(450,460,273,.14)}`;
    markup += `<path d="M205 545 Q450 655 695 545 M205 545 Q450 460 695 545" opacity=".35"/><path d="M230 565 Q450 780 670 565" opacity=".3"/>`;
    markup += branch(random,450,575,77,-Math.PI/2,6);
    for (let i = 0; i < 15; i++) { const x = 270 + i * 25, y = 570 + Math.sin(i / 3) * 9; markup += `<path d="M${x} ${y} q-15-35 ${-5 + random()*20} ${-40 - random()*35}" opacity=".5"/>${leaf(x, y - 20, .3, i % 2 ? 45 : -40, .5)}`; }
    markup += `<g transform="rotate(-25 450 460)">${ellipse(450,460,340,95,.25)}</g>${circle(330,225,13,.65,'#dfca99')}`;
    return markup;
  }
  function orbit(random, id) {
    let markup = `<circle cx="450" cy="450" r="180" fill="url(#${id}-planet)" stroke-opacity=".6"/>${ellipse(450,450,180,48,.17)}`;
    markup += `<g transform="rotate(-30 450 450)">${ellipse(450,450,330,105,.6)}${ellipse(450,450,350,115,.15)}</g>`;
    for (let i = 0; i < 5; i++) markup += `<path d="M${330+i*15} ${320+i*28} Q${530+i*4} ${310+i*40} ${540+i*4} ${380+i*48}" opacity=".15"/>`;
    markup += circle(720,260,40,.5) + circle(720,260,46,.15) + `<path d="M180 645 l28-12 -7 22 -7-11Z" fill="#d6bf94"/>`;
    return markup;
  }
  function veil(random, id) {
    let markup = `<circle cx="450" cy="440" r="240" fill="url(#${id}-halo)" stroke="none"/>`;
    for (let i = 0; i < 10; i++) markup += `<path d="M${180+i*13} 730 Q${160+i*30} ${300-i*14} 450 ${180+i*13} Q${740-i*30} ${300-i*14} ${720-i*13} 730" opacity="${.12+i*.03}"/>`;
    for (let i=0;i<6;i++) markup += `<path d="M170 ${470+i*22} Q300 ${410+i*24} 450 ${475+i*15} T760 ${450+i*24}" opacity=".22"/>`;
    markup += `<g class="pulsing">${circle(450,420,65,.5)}${circle(450,420,12,.7,'#d4bb87')}</g>`;
    return markup;
  }
  function ember(random, id) {
    let markup = `<circle cx="450" cy="420" r="230" fill="url(#${id}-halo)" stroke="none"/>${circle(450,420,230,.15)}`;
    markup += `<path d="M430 660 V487 Q450 500 470 487 V660Z" fill="#c9aa7133"/><ellipse cx="450" cy="487" rx="20" ry="7" opacity=".6"/><path d="M450 475 C370 425 463 360 449 305 C525 400 482 447 450 475Z" fill="#e7bc6740" stroke="#e0bd82"/><path class="pulsing" d="M450 459 Q424 419 450 373 Q480 424 450 459Z" fill="#f5d7a1" stroke="none"/>`;
    for(let i=0;i<4;i++) markup += `<path d="M170 ${550+i*25} Q310 ${510+i*23} 450 ${550+i*25} T750 ${540+i*24}" opacity=".2"/>`;
    markup += `<g class="floating-leaf">${leaf(650,490,1.4,45)}${leaf(305,320,.8,-35)}</g>${ellipse(450,670,170,30,.25)}`;
    return markup;
  }
  function silence(random) { let markup = circle(450,450,225,.25) + circle(450,450,235,.1); for(let i=0;i<7;i++) markup += `<path d="M140 ${610+i*20} Q450 ${580+i*20} 770 ${610+i*20}" opacity="${.15-i*.015}"/>`; markup += `<path d="M470 230 A225 225 0 0 1 665 380" stroke-width="2" opacity=".45"/>${leaf(310,660,.8,-60,.4)}`; return markup; }
  function dawn(random, id) {
    let markup = `<circle cx="450" cy="450" r="310" fill="url(#${id}-halo)" stroke="none"/><g class="pulsing">${circle(450,450,90,.8,'#e3c69122')}${circle(450,450,100,.4)}${circle(450,450,140,.3)}${circle(450,450,220,.2)}</g>`;
    for(let i=0;i<64;i++) { const a=i*Math.PI/32, r=150+random()*100; markup += line(450+Math.cos(a)*r,450+Math.sin(a)*r,450+Math.cos(a)*(r+30+random()*130),450+Math.sin(a)*(r+30+random()*130),.2+random()*.3); }
    markup += `<g class="floating-leaf">${leaf(650,340,.8,70)}${leaf(300,620,.7,-20)}</g>`;
    return markup;
  }
  const renderers = { tree, abyss: blackHole, celestial, machine, garden, orbit, veil, ember, silence, dusk: silence, dawn, leaf: () => `<g transform="translate(450 650) scale(5)">${leaf(0,0,1,25,1)}</g>` };
  for (const element of document.querySelectorAll('[data-scene]')) {
    const theme = element.dataset.scene, seed = Number(element.dataset.seed), random = rng(seed + 7), id = `hymn-${seed}-${theme}`;
    const defs = `<defs><radialGradient id="${id}-halo"><stop stop-color="#d7b777" stop-opacity=".25"/><stop offset=".45" stop-color="#a88757" stop-opacity=".08"/><stop offset="1" stop-color="#a88757" stop-opacity="0"/></radialGradient><linearGradient id="${id}-planet" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#a7b7b2" stop-opacity=".25"/><stop offset=".6" stop-color="#2f535e" stop-opacity=".35"/><stop offset="1" stop-color="#101c28"/></linearGradient><filter id="${id}-blur" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="8"/></filter></defs>`;
    element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" fill="none" stroke="#cfb27c" stroke-width="1" focusable="false">${defs}${theme==='leaf' ? '' : stars(random)}${(renderers[theme] || celestial)(random,id)}</svg>`;
  }
  q('.starfield').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#cfb27c" focusable="false">${stars(rng(61), 130)}</svg>`;

  let chapterPositions = [], closingTop = 0, scheduled = false, current = -2;
  function measure() {
    chapterPositions = chapters.map(ch => ch.getBoundingClientRect().top + window.scrollY);
    closingTop = q('.closing').getBoundingClientRect().top + window.scrollY;
    syncNavAccess();
    update();
  }
  function update() {
    scheduled = false;
    const offset = window.scrollY + window.innerHeight * .35;
    let selected = -1;
    for (let i = 0; i < chapterPositions.length; i++) { if (chapterPositions[i] <= offset) selected = i; else break; }
    const extent = Math.max(1, closingTop - chapterPositions[0]);
    q('#reading-progress').style.transform = `scaleX(${Math.max(0, Math.min(1, (offset - chapterPositions[0]) / extent))})`;
    if (selected !== current) {
      current = selected;
      document.querySelectorAll('[data-nav-chapter][aria-current]').forEach(link => link.removeAttribute('aria-current'));
      if (selected >= 0) {
        const ch = chapters[selected], number = ch.dataset.chapter, act = Number(ch.dataset.act);
        document.body.dataset.theme = ch.dataset.theme;
        const activeLink = q(`[data-nav-chapter="${number}"]`);
        activeLink.setAttribute('aria-current', 'location');
        const activeAct = activeLink.closest('.nav-act');
        document.querySelectorAll('.nav-act').forEach(detail => { detail.open = detail === activeAct; });
        q('#chapter-position').textContent = `Chapter ${String(number).padStart(2,'0')} of 28`;
        q('#current-act').textContent = `Act ${roman[act-1]}`;
        q('#current-chapter').textContent = ch.querySelector('h3').textContent;
        const scrollArea = q('.nav-scroll');
        const linkBox = activeLink.getBoundingClientRect(), navBox = scrollArea.getBoundingClientRect();
        if (linkBox.top < navBox.top) scrollArea.scrollTop -= navBox.top - linkBox.top + 12;
        else if (linkBox.bottom > navBox.bottom) scrollArea.scrollTop += linkBox.bottom - navBox.bottom + 12;
      } else {
        document.body.dataset.theme = 'ember';
        q('#chapter-position').textContent = 'Prologue to a journey';
        q('#current-act').textContent = 'The beginning';
        q('#current-chapter').textContent = 'The yearning';
      }
    }
    if (offset >= closingTop) { q('#current-act').textContent = 'The first hymn'; q('#current-chapter').textContent = 'The yearning begins again'; }
    else if (selected >= 0) { q('#current-act').textContent = `Act ${roman[Number(chapters[selected].dataset.act)-1]}`; q('#current-chapter').textContent = chapters[selected].querySelector('h3').textContent; }
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  document.addEventListener('toggle', () => requestAnimationFrame(measure), true);
  function revealHash(initial = false) {
    if (!location.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    if (target && initial) requestAnimationFrame(() => { target.scrollIntoView({ behavior: 'instant', block: 'start' }); measure(); });
  }
  window.addEventListener('hashchange', () => revealHash());
  window.addEventListener('load', () => { measure(); revealHash(true); });
  measure();
})();

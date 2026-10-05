'use strict';
(function () {
  const frame = document.getElementById('journey');
  frame.addEventListener('load', function () {
    const doc = frame.contentDocument, scene = doc && doc.getElementById('scene');
    if (!scene || doc.getElementById('v52-drawer')) return;
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('./cockpit.css', location.href).href;
    const launcher = doc.createElement('button');
    launcher.id = 'v52-tools-toggle';
    launcher.type = 'button';
    launcher.textContent = '☷ FERRAMENTAS';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'v52-drawer');
    const drawer = doc.createElement('aside');
    drawer.id = 'v52-drawer';
    drawer.hidden = true;
    drawer.setAttribute('aria-label', 'Ferramentas da Jornada');
    drawer.innerHTML = '<header><div><strong>JORNADA · FERRAMENTAS</strong><p id="v52-drawer-stage"></p></div><button type="button" id="v52-drawer-close" aria-label="Fechar ferramentas">×</button></header><div class="v52-drawer-scroll"></div><footer><nav aria-label="Navegação pelo painel"><button type="button" id="v52-drawer-prev">← Voltar etapa</button><button type="button" id="v52-drawer-next">Avançar etapa →</button></nav><p>Recolher preserva os ajustes</p></footer>';
    doc.body.append(launcher, drawer);
    doc.body.appendChild(link);
    const previous = scene.querySelector('.prev'), next = scene.querySelector('.next');
    const drawerPrevious = doc.getElementById('v52-drawer-prev'), drawerNext = doc.getElementById('v52-drawer-next');
    drawerPrevious.addEventListener('click', () => previous.click());
    drawerNext.addEventListener('click', () => next.click());
    const scroll = drawer.querySelector('.v52-drawer-scroll');
    const sections = [];
    function group(title, subtitle) {
      const section = doc.createElement('details');
      section.className = 'v52-group';
      section.innerHTML = '<summary>' + title + '</summary><p class="v52-group-note">' + subtitle + '</p><div class="v52-group-body"></div>';
      scroll.appendChild(section);
      sections.push(section);
      section.addEventListener('toggle', () => {
        if (section.open) sections.forEach(other => { if (other !== section) other.open = false; });
      });
      return section.querySelector('.v52-group-body');
    }
    const camera = group('Câmera', 'Panorama na etapa 4 · controles e profundidade');
    const layers = group('Camadas', 'Céu, nuvens, rio e malha TERRAIN de teste');
    const study = doc.createElement('a');
    study.href = new URL('./descent.html', location.href).href;
    study.target = '_top';
    study.textContent = 'Abrir estudo da descida · artes 001–005';
    study.style.cssText = 'color:#f5df9b;padding:14px;display:block';
    layers.appendChild(study);
    const calibration = group('Calibração', 'Guias, âncoras e ajustes específicos de cada etapa');
    const information = group('Informações', 'Geometrias, estados e contrato DNA');
    function neutralize(element) {
      const reset = {position:'static',left:'auto',right:'auto',top:'auto',bottom:'auto',transform:'none',width:'100%',maxWidth:'100%',minWidth:'0',maxHeight:'none',opacity:'1',visibility:'visible',pointerEvents:'auto',zIndex:'auto',margin:'0'};
      for (const [property, value] of Object.entries(reset)) {
        element.style.setProperty(property.replace(/[A-Z]/g, m => '-' + m.toLowerCase()), value, 'important');
      }
    }
    function move(id, target, conditional = false) {
      const element = doc.getElementById(id);
      if (!element) return null;
      target.appendChild(element);
      element.classList.add('v52-module');
      neutralize(element);
      if (!conditional) element.style.setProperty('display', 'flex', 'important');
      return element;
    }
    move('cameraLabBar', camera);
    move('v31', camera);
    ['skyDNAbar','cloudDNAbar','river-dna-panel','v40TerrainPanel'].forEach(id => move(id, layers));
    move('stdnaBar', calibration);
    const guides = doc.createElement('div');
    guides.className = 'v52-guide-buttons';
    guides.setAttribute('role', 'group');
    guides.setAttribute('aria-label', 'Guias da Águia e do Galho');
    calibration.appendChild(guides);
    ['eagle-grid-toggle','path-grid-toggle','branch-path-toggle'].forEach(id => {
      const element = doc.getElementById(id);
      if (!element) return;
      guides.appendChild(element);
      neutralize(element);
      element.style.setProperty('width','auto','important');
    });
    const presets = doc.createElement('section');
    presets.innerHTML = '<h3>Águia · presets W0</h3>';
    calibration.appendChild(presets);
    move('eagle-position-presets', presets);
    move('eagle-scale-presets', presets);
    const grip = doc.createElement('section');
    grip.innerHTML = '<h3>Galho · pegada W1</h3>';
    calibration.appendChild(grip);
    move('grip-calibrator', grip);
    const panel = doc.getElementById('cal-panel');
    if (panel) neutralize(panel);
    const context = doc.createElement('p');
    context.className = 'v52-group-note';
    calibration.appendChild(context);
    ['stage-geometry-readout','v28-note','v42-badge','v48IntegrationBadge'].forEach(id => move(id, information));
    move('dnaBar', information);
    move('dnaPanel', information, true);
    const oldCockpit = doc.getElementById('v49Cockpit');
    if (oldCockpit) oldCockpit.style.setProperty('display','none','important');
    const stage = doc.getElementById('v52-drawer-stage');
    function updateContext() {
      const state = ['state-w0','state-w1','state-w2','state-w3'].findIndex(name => scene.classList.contains(name));
      stage.textContent = 'ETAPA ' + (state + 1) + ' · W' + state;
      drawerPrevious.disabled = previous.disabled;
      drawerNext.disabled = next.disabled;
      presets.hidden = state !== 0;
      grip.hidden = state !== 1;
      context.textContent = state === 0 ? 'Presets disponíveis nesta etapa. CAL do Galho aparece em W1.' : state === 1 ? 'CAL do Galho disponível nesta etapa. Presets da Águia ficam em W0.' : 'Guias e âncoras disponíveis. Presets W0 e CAL W1 ficam nas suas etapas.';
    }
    new frame.contentWindow.MutationObserver(updateContext).observe(scene, {attributes:true,attributeFilter:['class']});
    updateContext();
    let open = false, closeTimer;
    const close = doc.getElementById('v52-drawer-close');
    function setOpen(value, returnFocus = true) {
      open = value;
      frame.contentWindow.clearTimeout(closeTimer);
      launcher.setAttribute('aria-expanded', String(open));
      if (open) {
        drawer.hidden = false;
        frame.contentWindow.requestAnimationFrame(() => drawer.classList.toggle('v52-open', open));
        close.focus();
      } else {
        drawer.classList.remove('v52-open');
        closeTimer = frame.contentWindow.setTimeout(() => { if (!open) drawer.hidden = true; }, 220);
        if (returnFocus) launcher.focus();
      }
    }
    launcher.addEventListener('click', () => setOpen(!open));
    close.addEventListener('click', () => setOpen(false));
    doc.addEventListener('keydown', event => {
      if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
    }, true);
    doc.addEventListener('click', event => {
      if (!event.isTrusted) return;
      if (open && !drawer.contains(event.target) && !launcher.contains(event.target)) setOpen(false, false);
    });
  });
}());

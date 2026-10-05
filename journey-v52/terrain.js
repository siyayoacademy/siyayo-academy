'use strict';
// Independent diagnostic mesh; does not replace or crop the preserved panorama.
(function () {
  const frame = document.getElementById('journey');
  frame.addEventListener('load', function () {
    const doc = frame.contentDocument, scene = doc && doc.getElementById('scene');
    if (!scene) return;
    const root = doc.documentElement, button = doc.getElementById('v40TerrainToggle');
    const layer = doc.createElement('div');
    layer.id = 'v52-terrain-mesh';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<svg viewBox="0 0 1000 700" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#f5d979" stroke-width="1.4" opacity=".75"><path d="M-100 525 L90 445 L210 495 L340 435 L485 500 L620 442 L770 488 L925 425 L1100 490"/><path d="M-100 560 L1100 560 M-100 610 L1100 610 M-100 680 L1100 680"/><path d="M500 475 L-100 720 M500 475 L100 720 M500 475 L300 720 M500 475 L500 720 M500 475 L700 720 M500 475 L900 720 M500 475 L1100 720"/></g></svg>';
    scene.appendChild(layer);
    const style = doc.createElement('style');
    style.textContent = '#v52-terrain-mesh{position:absolute;inset:0;z-index:2;pointer-events:none;display:none;transform-origin:50% 50%;transform:perspective(1200px) translate3d(var(--v40-terrain-x,0vw),calc(var(--v52-terrain-camera-y,0vh) + var(--v40-terrain-y,0vh)),0) rotateZ(calc(var(--v52-terrain-camera-roll,0deg) + var(--v40-terrain-roll,0deg))) rotateX(calc(var(--v52-terrain-camera-tilt,0deg) + var(--v40-terrain-tilt,0deg))) scale(calc(var(--v52-terrain-camera-zoom,1) * var(--v40-terrain-zoom,1)))}#scene.state-w3 #v52-terrain-mesh.on{display:block}#v52-terrain-mesh svg{width:100%;height:100%}';
    doc.head.appendChild(style);
    const status = doc.createElement('span');
    status.id = 'v52-terrain-status';
    status.setAttribute('role', 'status');
    status.style.cssText = 'display:block;flex-basis:100%;color:#f5d979;font-size:10px';
    button.parentElement.appendChild(status);
    const num = (id, fallback) => Number(doc.getElementById(id).value) || fallback;
    const variable = name => parseFloat(frame.contentWindow.getComputedStyle(root).getPropertyValue(name)) || 0;
    function apply() {
      const enabled = button.classList.contains('on');
      const camera = doc.body.classList.contains('camera-lab-on');
      const depth = enabled && doc.body.classList.contains('v31on');
      const response = .60;
      layer.classList.toggle('on', enabled);
      button.textContent = 'TERRAIN TEST 0.60× ' + (enabled ? 'ON' : 'OFF');
      button.setAttribute('aria-pressed', String(enabled));
      root.style.setProperty('--v52-terrain-camera-roll', (camera ? num('camRoll', 0) * response : 0) + 'deg');
      root.style.setProperty('--v52-terrain-camera-tilt', (camera ? num('camTilt', 0) * response : 0) + 'deg');
      root.style.setProperty('--v52-terrain-camera-y', (camera ? num('camY', 0) * response : 0) + 'vh');
      root.style.setProperty('--v52-terrain-camera-zoom', String(camera ? 1 + (num('camZoom', 100) / 100 - 1) * response : 1));
      for (const [name, input, unit] of [['x','--vx','vw'],['y','--vy','vh'],['roll','--vr','deg'],['tilt','--vt','deg']]) {
        root.style.setProperty('--v40-terrain-' + name, (depth ? variable(input) * response : 0) + unit);
      }
      root.style.setProperty('--v40-terrain-zoom', String(1 + (depth ? variable('--vz') * response : 0)));
      status.textContent = 'MALHA DE TESTE · ' + (!enabled ? 'desligada' : scene.classList.contains('state-w3') ? 'ativa na etapa 4 · arte definitiva pendente' : 'aguarda etapa 4 · arte definitiva pendente');
    }
    const schedule = () => frame.contentWindow.requestAnimationFrame(apply);
    button.addEventListener('click', schedule);
    for (const id of ['camRoll','camTilt','camZoom','camY']) doc.getElementById(id).addEventListener('input', schedule);
    for (const id of ['camReset','camOn','v31on','loadCam']) doc.getElementById(id).addEventListener('click', schedule);
    const observer = new frame.contentWindow.MutationObserver(schedule);
    observer.observe(doc.body, {attributes:true,attributeFilter:['class']});
    observer.observe(scene, {attributes:true,attributeFilter:['class']});
    apply();
  });
}());

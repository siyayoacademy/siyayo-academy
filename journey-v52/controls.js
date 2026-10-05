'use strict';
// V52 adds controls to the unchanged, same-origin V51 scene.
(function () {
  const frame = document.getElementById('journey');
  frame.addEventListener('load', function () {
    const doc = frame.contentDocument;
    const scene = doc && doc.getElementById('scene');
    if (!scene) {
      return;
    }
    const branch = scene.querySelector('.branch');
    const cal = doc.getElementById('grip-calibrator');
    if (branch && cal) {
      const style = doc.createElement('style');
      style.textContent = '#scene.cal-grip.state-w1 .branch{transform:translate(-50%,-50%) translate(var(--v52-cal-x,0vw),var(--v52-cal-y,0vh)) rotate(var(--v52-cal-r,0deg)) scale(var(--v52-cal-s,1))!important;transform-origin:50% 50%!important}';
      doc.head.appendChild(style);
      function applyCalibration() {
        branch.style.setProperty('--v52-cal-x', doc.getElementById('cal-x').value + 'vw');
        branch.style.setProperty('--v52-cal-y', doc.getElementById('cal-y').value + 'vh');
        branch.style.setProperty('--v52-cal-r', (Number(doc.getElementById('cal-r').value) - 4) + 'deg');
        branch.style.setProperty('--v52-cal-s', String(Number(doc.getElementById('cal-s').value) / 70));
      }
      cal.addEventListener('input', applyCalibration);
      doc.getElementById('cal-reset').addEventListener('click', applyCalibration);
      applyCalibration();
      const note = cal.querySelector('small');
      if (note) note.textContent = 'W1 · ajuste relativo à posição aprovada · RESET restaura a base.';
    }
    const navigationKeys = new Set(['ArrowRight','ArrowDown','PageDown',' ','ArrowLeft','ArrowUp','PageUp']);
    doc.addEventListener('keydown', function (event) {
      if (!navigationKeys.has(event.key)) return;
      const control = event.target && event.target.closest &&
        event.target.closest('input,select,textarea,button,summary,a,[contenteditable]:not([contenteditable="false"]),[role="slider"],[role="textbox"]');
      if (control || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) {
        // Leave native editing/slider actions intact; prevent V51's document navigation.
        event.stopPropagation();
        return;
      }
      event.preventDefault();
    }, true);
    const bar = doc.getElementById('cameraLabBar');
    if (bar) {
      const scope = doc.createElement('span');
      scope.id = 'v52-camera-scope';
      scope.style.cssText = 'display:block;flex-basis:100%;font-size:10px;color:#f5df9b';
      scope.setAttribute('role', 'status');
      bar.appendChild(scope);
      function updateScope() {
        const stage4 = scene.classList.contains('state-w3');
        const on = doc.body.classList.contains('camera-lab-on');
        scope.textContent = 'PANORAMA · ETAPA 4 (W3) · ' +
          (!stage4 ? 'aguarda etapa 4' : on ? 'câmera ligada' : 'câmera desligada');
      }
      updateScope();
      const observer = new frame.contentWindow.MutationObserver(updateScope);
      observer.observe(scene, {attributes:true,attributeFilter:['class']});
      observer.observe(doc.body, {attributes:true,attributeFilter:['class']});
    }
    document.getElementById('status').hidden = true;
    frame.focus();
  });
}());

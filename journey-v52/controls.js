'use strict';
// V52 adds controls to the unchanged, same-origin V51 scene.
(function () {
  const frame = document.getElementById('journey');
  frame.addEventListener('load', function () {
    const doc = frame.contentDocument;
    const scene = doc && doc.getElementById('scene');
    if (!scene) {
      document.getElementById('status').textContent = 'Não foi possível carregar a cena. Recarregue a página.';
      return;
    }
    const navigationKeys = new Set(['ArrowRight','ArrowDown','PageDown',' ','ArrowLeft','ArrowUp','PageUp']);
    doc.addEventListener('keydown', function (event) {
      if (!navigationKeys.has(event.key)) return;
      const control = event.target && event.target.closest &&
        event.target.closest('input,select,textarea,button,a,[contenteditable]:not([contenteditable="false"]),[role="slider"],[role="textbox"]');
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

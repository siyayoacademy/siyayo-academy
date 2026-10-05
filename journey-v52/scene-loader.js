'use strict';
// Preserve the portable source; defer only the two early camera initializers.
function prepareJourneySource(source) {
  for (const id of ['v36-camera-depth-response-js', 'v37-camera-composition-js']) {
    const pattern = new RegExp('(<script id="' + id + '">)([\\s\\S]*?)(</script>)');
    if (!pattern.test(source)) throw new Error('Missing camera initializer: ' + id);
    source = source.replace(pattern, (_, open, code, close) =>
      open + '\ndocument.addEventListener("DOMContentLoaded", function () {\n' +
      code + '\n}, {once:true});\n' + close);
  }
  return source;
}
(async function () {
  try {
    const response = await fetch('../journey-v51/');
    if (!response.ok) throw new Error('Scene HTTP ' + response.status);
    const source = prepareJourneySource(await response.text());
    document.getElementById('journey').srcdoc = source;
  } catch (error) {
    document.getElementById('status').textContent = 'Não foi possível carregar a jornada. Recarregue a página.';
    console.error(error);
  }
}());

// Verb Explorer PSAC boundary: releases grounded Profile/Session/Attempt/Context only when all four are present.
// It creates no pedagogical evidence and owns no adaptive decision.
(function(root){
  function resolve(source, name, choice, state, target){
    var getter = source && source['get' + name];
    var value = typeof getter === 'function'
      ? getter(choice, state, target)
      : source && source[name.charAt(0).toLowerCase() + name.slice(1)];
    return value || null;
  }

  function compose(source, choice, state, target){
    if(!source || !state) return null;

    var profile = resolve(source, 'Profile', choice, state, target);
    var session = resolve(source, 'Session', choice, state, target);
    var attempt = resolve(source, 'Attempt', choice, state, target);
    var context = resolve(source, 'Context', choice, state, target);

    if(!profile || !session || !attempt || !context) return null;

    return Object.freeze({
      profile: profile,
      session: session,
      attempt: attempt,
      context: context,
      state: state,
      resumeState: state
    });
  }

  root.SIYAYOVerbExplorerAdaptivePSACBoundary = Object.freeze({compose:compose});
})(typeof globalThis!=='undefined'?globalThis:this);

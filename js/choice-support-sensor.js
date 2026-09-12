(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SIYAYOChoiceSupportSensor = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function create() {
    var audioObserved = false;

    return Object.freeze({
      observe: function (event) {
        if (event && event.type === 'choice-audio') audioObserved = true;
        return audioObserved ? 'audio' : 'none';
      },
      support: function () {
        return audioObserved ? 'audio' : 'none';
      },
      reset: function () {
        audioObserved = false;
        return 'none';
      }
    });
  }

  return Object.freeze({ create: create });
}));

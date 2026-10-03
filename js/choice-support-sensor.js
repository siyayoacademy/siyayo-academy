(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SIYAYOChoiceSupportSensor = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function key(context) {
    if (!context) return null;
    var experienceId = context.currentExperienceId;
    var language = context.experienceLanguage;
    var question = context.experienceQuestion;
    var choice = context.experienceChoiceCandidate;
    if (!experienceId || !language || question == null || !choice) return null;
    return [String(experienceId), String(language), String(question), String(choice)].join('\u001f');
  }

  function create() {
    var audioContextKey = null;

    return Object.freeze({
      observe: function (event) {
        if (event && event.type === 'choice-audio') {
          audioContextKey = key(event.context);
          return audioContextKey ? 'audio' : 'none';
        }
        return audioContextKey ? 'audio' : 'none';
      },
      support: function (context) {
        if (!audioContextKey) return 'none';
        if (arguments.length === 0) return 'audio';
        var currentKey = key(context);
        return currentKey && currentKey === audioContextKey ? 'audio' : 'none';
      },
      reset: function () {
        audioContextKey = null;
        return 'none';
      }
    });
  }

  return Object.freeze({ create: create });
}));

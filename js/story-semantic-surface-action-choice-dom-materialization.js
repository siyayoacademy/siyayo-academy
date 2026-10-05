(function(root) {
  "use strict";

  function normalize(value) {
    if (typeof value !== "string") {
      return null;
    }

    var normalized = value.trim();

    return normalized || null;
  }

  function describe(choice) {
    if (!choice || typeof choice !== "object") {
      return null;
    }

    var surfaceId = normalize(choice.surfaceId);

    if (
      !surfaceId ||
      !Array.isArray(choice.actions) ||
      choice.actions.length === 0
    ) {
      return null;
    }

    var actions = [];

    for (var action of choice.actions) {
      var normalizedAction = normalize(action);

      if (!normalizedAction) {
        return null;
      }

      actions.push(
        Object.freeze({
          action: normalizedAction,
          type: "button"
        })
      );
    }

    return Object.freeze({
      surfaceId: surfaceId,
      actions: Object.freeze(actions)
    });
  }

  root
    .SIYAYOStorySemanticSurfaceActionChoiceDOMMaterialization =
      Object.freeze({
        describe: describe
      });
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : this
);

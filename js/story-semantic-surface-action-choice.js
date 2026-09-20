(function(root) {
  "use strict";

  function normalize(value) {
    if (typeof value !== "string") {
      return null;
    }

    var normalized = value.trim();

    return normalized || null;
  }

  function describe(input) {
    if (!input || typeof input !== "object") {
      return null;
    }

    var surfaceId = normalize(input.surfaceId);

    if (!surfaceId) {
      return null;
    }

    var actions = [
      "explore"
    ];

    if (
      input.selectAvailable === true
    ) {
      actions.push(
        "select"
      );
    }

    return Object.freeze({
      surfaceId: surfaceId,
      actions: Object.freeze(
        actions
      )
    });
  }

  root.SIYAYOStorySemanticSurfaceActionChoice =
    Object.freeze({
      describe: describe
    });
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : this
);

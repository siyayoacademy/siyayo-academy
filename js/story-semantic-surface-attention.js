(function(root) {
  "use strict";

  function normalize(value) {
    if (typeof value !== "string") {
      return null;
    }

    var normalized = value.trim();

    return normalized || null;
  }

  function focus(input) {
    if (!input || typeof input !== "object") {
      return null;
    }

    var surfaceId = normalize(input.surfaceId);

    if (!surfaceId) {
      return null;
    }

    return Object.freeze({
      surfaceId: surfaceId
    });
  }

  root.SIYAYOStorySemanticSurfaceAttention =
    Object.freeze({
      focus: focus
    });
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : this
);

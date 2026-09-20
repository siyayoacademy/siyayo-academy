(function(root) {
  "use strict";

  function normalize(value) {
    if (typeof value !== "string") {
      return null;
    }

    var normalized = value.trim();

    return normalized || null;
  }

  function create(input) {
    if (!input || typeof input !== "object") {
      return null;
    }

    var surfaceId = normalize(input.surfaceId);
    var action = normalize(input.action);

    if (!surfaceId || !action) {
      return null;
    }

    if (
      action !== "explore" &&
      action !== "select"
    ) {
      return null;
    }

    return Object.freeze({
      surfaceId: surfaceId,
      action: action
    });
  }

  root.SIYAYOStorySemanticSurfaceInteractionIntent =
    Object.freeze({
      create: create
    });
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : this
);

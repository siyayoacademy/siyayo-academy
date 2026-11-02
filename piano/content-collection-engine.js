(() => {
  "use strict";

  class ContentCollectionEngine {
    constructor() {
      this.collections = new Map();
      this.activeCollectionId = null;
    }

    register(collection) {
      if (!collection || !collection.id) return false;
      const frozen = Object.freeze({
        ...collection,
        items: Array.isArray(collection.items)
          ? Object.freeze(collection.items.map(item => Object.freeze({ ...item })))
          : Object.freeze([])
      });
      this.collections.set(frozen.id, frozen);
      if (!this.activeCollectionId) this.activeCollectionId = frozen.id;
      return true;
    }

    has(id) {
      return this.collections.has(id);
    }

    get(id) {
      return this.collections.get(id) || null;
    }

    list() {
      return [...this.collections.values()];
    }

    activate(id, source = "experience") {
      if (!this.collections.has(id)) {
        window.dispatchEvent(new CustomEvent("siyayo:content-collection-rejected", {
          detail: { id, source, reason: "collection-not-registered" }
        }));
        return null;
      }

      this.activeCollectionId = id;
      const collection = this.collections.get(id);
      window.dispatchEvent(new CustomEvent("siyayo:content-collection-changed", {
        detail: {
          id,
          source,
          collection,
          evaluated: false,
          evidenceProduced: false
        }
      }));
      return collection;
    }

    active() {
      return this.get(this.activeCollectionId);
    }
  }

  const engine = new ContentCollectionEngine();

  [
    ["nouns","Nouns"],
    ["pronouns","Pronouns"],
    ["verbs","Verbs"],
    ["adjectives","Adjectives"],
    ["conjunctions","Conjunctions"],
    ["articles","Articles"],
    ["adverbs","Adverbs"],
    ["prepositions","Prepositions"],
    ["interjections","Interjections"],
    ["numerals","Numerals"]
  ].forEach(([id,label]) => engine.register({
    id,
    label,
    status: "registered",
    items: []
  }));

  window.SIYAYOContentCollectionEngine = engine;
})();
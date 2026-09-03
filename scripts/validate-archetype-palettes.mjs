import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const archetypesDir = path.join(root, "data/archetypes");
const palettesDir = path.join(root, "data/palettes");

const archetypeFiles = fs.readdirSync(archetypesDir).filter(file => file.endsWith(".json"));
const paletteFiles = fs.readdirSync(palettesDir).filter(file => file.endsWith(".json"));

const palettes = new Map();
const errors = [];

for (const file of paletteFiles) {
  const palette = JSON.parse(fs.readFileSync(path.join(palettesDir, file), "utf8"));
  if (!palette.id) {
    errors.push(`${file}: palette is missing id`);
    continue;
  }
  if (palettes.has(palette.id)) {
    errors.push(`${file}: duplicate palette id: ${palette.id}`);
    continue;
  }
  palettes.set(palette.id, { palette, file });
}

for (const file of archetypeFiles) {
  const archetype = JSON.parse(fs.readFileSync(path.join(archetypesDir, file), "utf8"));
  const paletteId = archetype.visual?.paletteId;

  if (!paletteId) continue;

  const resolved = palettes.get(paletteId);
  if (!resolved) {
    errors.push(`${file}: visual.paletteId '${paletteId}' does not resolve to data/palettes`);
    continue;
  }

  const targetsArchetype = resolved.palette.relations?.some(
    relation => relation.type === "palette-for" && relation.target === archetype.id
  );

  if (!targetsArchetype) {
    errors.push(`${resolved.file}: palette '${paletteId}' does not declare palette-for '${archetype.id}'`);
  }
}

if (errors.length) {
  console.error("Archetype palette reference validation failed:\n" + errors.join("\n"));
  process.exit(1);
}

console.log(`Archetype palette references passed: ${archetypeFiles.length} archetype(s), ${paletteFiles.length} palette(s).`);

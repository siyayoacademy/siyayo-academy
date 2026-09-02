import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schemaPath = path.join(root, "data/schemas/archetype.schema.json");
const archetypesDir = path.join(root, "data/archetypes");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const allowedStatus = new Set(schema.properties.status.enum);
const idPattern = new RegExp(schema.properties.id.pattern);

function validate(archetype, file) {
  const errors = [];
  for (const key of schema.required) {
    if (!(key in archetype)) errors.push(`missing required property: ${key}`);
  }
  if (archetype.id && !idPattern.test(archetype.id)) errors.push("invalid id format");
  if (archetype.status && !allowedStatus.has(archetype.status)) errors.push("invalid status");
  for (const language of ["en", "es", "pt"]) {
    if (!archetype.name?.[language]) errors.push(`missing name.${language}`);
  }
  if (!Array.isArray(archetype.role) || archetype.role.length === 0) errors.push("role must contain at least one value");
  if (typeof archetype.visual?.canonicalImage !== "boolean") errors.push("visual.canonicalImage must be boolean");
  return errors.map(error => `${file}: ${error}`);
}

const files = fs.readdirSync(archetypesDir).filter(file => file.endsWith(".json"));
const errors = files.flatMap(file => {
  const archetype = JSON.parse(fs.readFileSync(path.join(archetypesDir, file), "utf8"));
  return validate(archetype, file);
});

if (errors.length) {
  console.error("Archetype validation failed:\n" + errors.join("\n"));
  process.exit(1);
}

console.log(`Archetype validation passed: ${files.length} file(s).`);

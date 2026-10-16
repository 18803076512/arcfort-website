import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const coreSkills = [
  "product-data-ingestion",
  "technical-verification",
  "compatibility-mapping",
  "product-media-manager",
  "product-publishing",
  "seo-architecture",
  "release-qa",
] as const;

const requiredSections = [
  "## Purpose",
  "## Trigger Conditions",
  "## Required Inputs",
  "## Optional Inputs",
  "## Source Priority",
  "## Workflow",
  "## Output Contract",
  "## Validation",
  "## Stop Conditions",
  "## Approval Requirements",
  "## Data That May Be Modified",
  "## Data That Must Never Be Modified Automatically",
] as const;

const skillTerms: Record<(typeof coreSkills)[number], readonly string[]> = {
  "product-data-ingestion": [
    "Excel",
    "CSV",
    "PDF",
    "duplicate SKU",
    "duplicate slug",
    "publication_performed: false",
  ],
  "technical-verification": [
    "CONFIRMED",
    "OEM_REFERENCE",
    "STANDARD_REFERENCE",
    "NEEDS_FACTORY_CONFIRMATION",
    "DATA_CONFLICT",
  ],
  "compatibility-mapping": [
    "SKU",
    "series",
    "torch",
    "machine",
    "appearance",
    "confirmed dimensions",
  ],
  "product-media-manager": [
    "45-degree",
    "thread detail",
    "hole/orifice detail",
    "dimension image",
    "packaging image",
    "bulk image",
    "product geometry",
  ],
  "product-publishing": [
    "Technical table",
    "Governed gallery",
    "Compatibility confidence",
    "Product/Breadcrumb/FAQ structured data",
    "RFQ CTA",
    "$release-qa",
  ],
  "seo-architecture": [
    "search intent",
    "canonical target URL",
    "cannibalization",
    "Product page",
    "Product-series page",
    "Commercial category page",
  ],
  "release-qa": [
    "PASS",
    "PASS_WITH_WARNINGS",
    "BLOCKED",
    "duplicate SKU",
    "duplicate slug",
    "Never allow `BLOCKED`",
  ],
};

const root = process.cwd();
const skillsRoot = join(root, ".agents", "skills");
const indexPath = join(root, "docs", "SKILLS_INDEX.md");
const errors: string[] = [];

function requireText(scope: string, content: string, value: string) {
  if (!content.includes(value)) {
    errors.push(`${scope}: missing required text "${value}"`);
  }
}

if (!existsSync(skillsRoot)) {
  errors.push("Missing .agents/skills directory");
}

for (const skill of coreSkills) {
  const skillPath = join(skillsRoot, skill, "SKILL.md");

  if (!existsSync(skillPath)) {
    errors.push(`${skill}: missing SKILL.md`);
    continue;
  }

  const content = readFileSync(skillPath, "utf8");
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatter) {
    errors.push(`${skill}: invalid YAML frontmatter boundary`);
    continue;
  }

  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();

  if (name !== skill) {
    errors.push(`${skill}: frontmatter name must match folder name`);
  }

  if (!description) {
    errors.push(`${skill}: frontmatter description is required`);
  }

  let previousSectionIndex = -1;
  for (const section of requiredSections) {
    const sectionIndex = content.indexOf(section);
    if (sectionIndex < 0) {
      errors.push(`${skill}: missing section ${section}`);
      continue;
    }
    if (sectionIndex < previousSectionIndex) {
      errors.push(`${skill}: section out of order ${section}`);
    }
    previousSectionIndex = sectionIndex;
  }

  for (const term of skillTerms[skill]) {
    requireText(skill, content, term);
  }

  if (/\[TODO:|TODO\b/.test(content)) {
    errors.push(`${skill}: unfinished TODO marker found`);
  }
}

if (!existsSync(indexPath)) {
  errors.push("Missing docs/SKILLS_INDEX.md");
} else {
  const index = readFileSync(indexPath, "utf8");
  for (const header of [
    "Skill",
    "Purpose",
    "Trigger",
    "Input",
    "Output",
    "May Modify Database?",
    "May Publish?",
    "Approval Required?",
  ]) {
    requireText("SKILLS_INDEX", index, header);
  }

  for (const skill of coreSkills) {
    requireText("SKILLS_INDEX", index, `../.agents/skills/${skill}/SKILL.md`);
    requireText("SKILLS_INDEX", index, `$${skill}`);
  }
}

if (existsSync(skillsRoot)) {
  const duplicateNames = readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name, index, names) => names.indexOf(name) !== index);

  for (const duplicateName of duplicateNames) {
    errors.push(`Duplicate skill directory: ${duplicateName}`);
  }
}

if (errors.length > 0) {
  console.error("Core skill validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${coreSkills.length} ArcFort Weld core skills and docs/SKILLS_INDEX.md.`);

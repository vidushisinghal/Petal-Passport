import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const blooms = JSON.parse(fs.readFileSync(path.join(ROOT, "petal_passport_blooms.json"), "utf-8"));

// 26 stories chosen for English-friendly pronunciation. Anything with heavy
// non-English place names (Yangmingshan, Shibazakura, Ipê Amarelo, Pōhutukawa,
// Higanbana, etc.) is left out so the speaker can read fluidly.
const PICKS = [
  "ooty-roses",
  "skagit-tulips",
  "dc-cherry",
  "antelope-poppies",
  "carlsbad-ranunculus",
  "keukenhof",
  "lisse-hyacinths",
  "holland-tulip-farm",
  "texas-bluebonnets",
  "tuscany-sunflowers",
  "england-lavender",
  "hallerbos-bluebells",
  "olympic-wildflowers",
  "wildflowers-colorado",
  "tekapo-lupins",
  "ba-jacaranda",
  "portland-roses",
  "chelsea-flower",
  "dahlia-garden-sf",
  "savannah-magnolia",
  "morges-tulips",
  "valensole-sunflowers",
  "anza-borrego-wildflowers",
  "hawaii-plumeria",
  "munnar-neelakurinji",
  "bougainvillea-india",
];

const opener = `Read at your natural pace. Talk like you are telling a friend about each place over the phone. Lean into your real accent — exaggerate slightly toward how you actually speak. Smile when the words feel warm. Pause where it feels right. Take a breath between paragraphs. Take three full seconds of silence between stories. The model learns whatever you give it, so be yourself, fully.

Before you start, read these few practice sentences out loud at your normal pace. They are just to warm up your voice and help you find a steady rhythm.

Some flowers wait for the season. Others arrive without warning, and the world catches up later. A garden is a place that holds the year for you. The most beautiful gardens are the ones that look like nothing at all in winter, and then quietly remember themselves every spring.

Now begin.

`;

const closer = `

That is the end of the script. Take a moment, breathe, and read these last few lines slowly. Just for closing.

The reason flowers move us is partly the color, partly the smell, partly the time. They cost us nothing and ask for nothing. They are simply there, briefly, and then they are gone.

A garden does not need to be visited to matter. Knowing it exists, somewhere, with someone tending it, is already part of the gift.

Thank you for reading.
`;

let body = "";
let totalWords = 0;

PICKS.forEach((id, i) => {
  const b = blooms.find((x) => x.id === id);
  if (!b) {
    console.error("MISSING:", id);
    return;
  }
  const words = b.story.split(/\s+/).length;
  totalWords += words;
  body += `## ${i + 1}. ${b.flower} — ${b.location}\n`;
  body += `*(approx ${words} words · ~${Math.round((words / 150) * 60)} sec)*\n\n`;
  body += b.story + "\n\n";
  body += `*[pause — three seconds before next]*\n\n`;
  body += `---\n\n`;
});

const wordsOpener = opener.split(/\s+/).length;
const wordsCloser = closer.split(/\s+/).length;
const grand = wordsOpener + totalWords + wordsCloser;

const out = [
  "# Petal Passport — Voice Cloning Script (easier read)",
  "",
  `**${PICKS.length} stories + warm-up + closing · ~${grand} words · ~${Math.round(grand / 140)} min at natural pace.**`,
  "",
  "Most place names are English. A handful of foreign names appear (Tuscany, Provence, Tekapo, Munnar, Jaipur, Skagit) — these are familiar enough that it's fine to read them in your own pronunciation. Don't worry about \"correctness\" of pronunciation; the goal is *fluid, confident reading*. The model learns confidence.",
  "",
  "---",
  "",
  opener,
  "---",
  "",
  body,
  closer,
].join("\n");

fs.writeFileSync(path.join(ROOT, "VOICE_SCRIPT.md"), out);
console.log("Wrote VOICE_SCRIPT.md");
console.log("Stories:", PICKS.length);
console.log("Total words (incl. warm-up + closing):", grand);
console.log("Estimated time at natural pace (~140 wpm):", Math.round(grand / 140), "min");

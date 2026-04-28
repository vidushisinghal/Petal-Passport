import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "petal_passport_blooms.json");

const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));

const rewrites = {
  "ooty-roses":
    "Few gardens in India hold this kind of scale. Ooty's rose garden spreads across terraced hillsides — over twenty thousand plants, more than two thousand varieties, all perched at seven thousand feet above sea level. The mornings here are cool in a way only these hills can manage, and the roses hold onto the dew like small held breaths. Go before nine, when the fragrance is strongest and the gardeners haven't yet started their rounds. You smell them before you see them. There are Damasks the color of old photographs, climbers twisted around wooden arches, deep red hybrid teas that look almost black at sunrise. Wear a cardigan and walk slowly, bending now and then to read the little metal name tags. The garden is easy to reach: a morning train from Coimbatore, a flask of hot chai at the gate, and the whole afternoon to wander. No hurry, no plan, just the long rows and the smell of everything opening at once.",

  "canary-almond":
    "On the high slopes of Tenerife, winter does something unusual — it throws flowers instead of snow. For a few weeks in late January and February, the almond orchards above Santiago del Teide come into bloom, and the pale pink clouds float against a volcano that's still sometimes capped in white. The drive from Santiago del Teide to Arguayo is the one to take — slow and winding, windows down, the air full of soft almond perfume. Locals call this the almendros en flor season, and they've marked it with a festival for generations, a celebration of light returning. The bloom is fleeting — miss it by a week and the blossoms are gone, replaced by green leaves and the beginning of fruit. It's the kind of bloom that teaches you to show up on time. Stop at any of the little pueblos along the way for a bowl of almond soup and a piece of bienmesabe — the Canarian almond dessert — and watch the orchards stretch toward the sea.",

  "taiwan-cherry":
    "Yangmingshan sits right above Taipei — you can be in the city's noise in the morning and standing under pale pink cherry trees by lunchtime. The Taiwan cherry blooms earlier than its Japanese cousins, in a deeper, almost magenta shade that looks like watercolor against the mountain mist. Take the bus from Shilin MRT; the mountain road jams with cars on weekends, and the bus lets you look out the windows. The park has hot springs too, so after the flowers you can soak your feet in water that smells faintly of sulfur and earth. There's something Taipei does casually — a city of seven million, and just twenty minutes up the road are silent hillsides covered in blossom, with cups of oolong being poured in wooden teahouses. Go on a weekday if you can. Find one of the benches under the trees, close your eyes, and listen to the little birds they call white-eyes moving through the branches.",

  "rio-ipe":
    "There's a moment in Rio's summer when the city turns yellow. The ipê amarelo — the golden trumpet tree — flowers almost all at once, and suddenly the avenues of Copacabana, the hills above Santa Teresa, the quiet streets of Laranjeiras, all become lit from above by canopies of gold. The trees shed their leaves before blooming, so the flowers look like they're floating unattached. Avenida Atlântica is the most photographed stretch, with the sea on one side and the golden tunnel on the other. The smaller streets reward attention too — Rua Jardim Botânico, the paths inside the botanical gardens themselves — where you can hear a bird and smell the coffee from a corner café. The ipê is Brazil's national tree, and Brazilians mark its blooming the way other places mark a festival. Walk slowly. Look up often. The petals fall in that specific way yellow petals fall, and for a few weeks the sidewalks look like someone has scattered gold all over the city.",

  "kashmir-tulip":
    "The Indira Gandhi Tulip Garden sits on a hillside overlooking Dal Lake in Srinagar, and at 1.5 million tulips, it's Asia's largest tulip garden. The flowers bloom in April, just as the apple and almond orchards elsewhere in the valley are opening, and the whole Kashmir Valley becomes a soft bowl of color under snow-capped mountains. Walk to the top terrace — the view from there is the Dal Lake below, wooden shikaras sliding across the water, the old Mughal Shalimar Gardens in the distance, and, behind it all, the Pir Panjal range. The Mughals called Kashmir their paradise, and they built garden after garden here. This tulip garden is newer but fits into that long tradition. Take a shikara ride on Dal Lake afterward. Have kahwa — saffron and cinnamon tea with almonds — at one of the floating houseboat restaurants. A few days here pair naturally with the rest of the valley: stay on a houseboat, take long slow walks through the tulip garden and the old Mughal gardens, watch lotus flowers begin to come up on the lake by summer.",

  "ladakh-wildflowers":
    "Ladakh is a cold desert at 3,500 meters and higher, and yet every July its valleys surprise visitors with wildflowers. Edelweiss, blue poppies, wild roses, gentians, and anemones grow at altitudes where you wouldn't expect anything to grow. Hemis National Park is the largest high-altitude park in India and the stronghold of the snow leopard, though sightings are rare. What you will see: miles of rolling valleys covered in little bright flowers, old Buddhist monasteries clinging to cliffs, yaks grazing in the distance. The Markha Valley trek is a classic eight-day circuit that passes through the best meadows. Combine it with a few days in Leh to acclimatize first — Leh is itself at 3,500m, and altitude is no joke. The monasteries around Leh — Thiksey, Hemis, Alchi — are breathtaking even if you do nothing else. Eat thukpa and momos in small family kitchens. Drink butter tea. Ladakh opens to visitors only from June through September; the rest of the year the passes close with snow. The wildflowers here are tough, small, and fierce — they have the whole winter to survive and only ten weeks to bloom, and they make the most of it.",

  "valley-flowers":
    "The Valley of Flowers is a high Himalayan valley in Uttarakhand — a glacier-fed meadow at 3,500 meters where more than 600 species of wildflowers bloom between July and September. Brahma Kamal, the sacred mountain lotus. The blue Himalayan poppy. Marsh marigolds, primulas, Himalayan balsam, a dozen kinds of orchid. It's a UNESCO World Heritage site, and visiting it is one of the great walking experiences in India. The trek starts from Govindghat and climbs 17 kilometers through pine forest to the village of Ghangaria, which is where you sleep. From Ghangaria the final 4 km into the valley begins early the next morning, when the flowers are most vibrant in the soft light. The trail is steady but not technical, and local porters can help with bags. The journey from the plains is part of the gift: a flight to Dehradun, a slow drive up through Rishikesh, three or four days at the monastery town of Govindghat, and then the walk into a valley of flowers waist-high.",

  "dal-lake-lotus":
    "Picture this: Dal Lake in Srinagar at dawn, the mountains rising pink behind, the water as still as a held breath, and across wide patches of the surface, lotus flowers opening with the morning light. The sacred lotus — Nelumbo nucifera — has bloomed on Dal Lake for as long as anyone has recorded. The flowers lift themselves above the leaves on long stems, the petals curling open to show deep pink centers, and by mid-morning a whole area of the lake is covered in blossoms. Take a shikara ride at sunrise — the wooden boats are painted in pinks and greens, paddled by quiet men in woolen caps, and they glide through the lotus gardens as the whole valley wakes. Vendors paddle up with hot kahwa in steel cups, or freshly baked kulcha bread, or bunches of yellow lotus stems eaten as a vegetable across Kashmir. This is one of the oldest continuous landscapes in India — the houseboats, the floating gardens, the Mughal shalimar gardens a few kilometers away. Book a houseboat. Spend three days doing almost nothing but watching the lake change color.",

  "munnar-neelakurinji":
    "This one is magic — a flower that blooms only once every twelve years. The neelakurinji is a small blue-violet shrub that grows on the high hills of the Western Ghats, and when it flowers, the entire Eravikulam National Park above Munnar turns blue-violet. It's so rare that generations of Malayali poets have written about it. The next big bloom is expected in 2030 — worth marking the calendar for. The Muthuvan tribal people who live in these hills traditionally counted their age in neelakurinji blooms. Even outside the mass flowering year, you can visit Eravikulam in August and September to see smaller patches and to look for the nearly-extinct Nilgiri tahr, the small mountain goat that still grazes these slopes. Munnar itself is a tea country town — green tea estates stepping down the valleys, the air thin and cool, small chai shops on every corner. Take a long drive through the estates in the morning when the mist is still rising. Eat a plate of puttu and kadala curry for breakfast. The trip is gentle: a flight to Kochi, a winding drive up into the hills, a few days in a tea plantation guesthouse, waiting for something blue.",

  "marigold-india":
    "The Dadar flower market is the best in Mumbai, and every October it transforms. From Navratri through Diwali, the market is a river of orange and yellow, mountains of marigolds heaped into brass scales, garlands being threaded by women sitting cross-legged on the pavement, the smell of fresh flowers cutting through the morning city. Go at 5 am. The vendors have been there since 3, arranging their fresh deliveries from Pune and Nashik, and by sunrise the whole market is a photograph. Buy a kilo. Bring it home and string your own garlands. The marigold is the flower of auspicious beginnings across India — a doorway flower, a wedding flower, a festival flower — and during Diwali every threshold in the country wears one. Cross the bridge to Ranade Road for the adjacent flower stalls. Get chai from the little stand at the corner. Walk back through the morning rush. The market hasn't changed much in decades — for many Mumbaikars it's a childhood memory still happening, the same brass scales, the same orange piles, the same morning light.",

  "bougainvillea-india":
    "Jaipur in the dry winter months is wrapped in bougainvillea. The pink, magenta, orange, and white papery flowers cascade over the walls of the old city, over the arches of the Hawa Mahal, over the windowsills of haveli guesthouses, over the stone bases of Nahargarh Fort looking down on everything. The Rajput architects of three centuries ago didn't design with bougainvillea in mind — the plant was introduced later — but it has adopted their rose-pink walls and fluted pavilions as if it were always meant to be here. Walk the old city at late afternoon, in the golden hour, when the light catches the flowers and the pink walls and everything glows. Stop at the Amber Fort overlook for the classic view. Eat a thali at LMB in Johari Bazaar. Buy a jar of pickle, a length of block-printed cotton. The rooftop cafés behind the City Palace serve chai and curries with the whole pink city spread below. Bougainvillea needs heat, sun, and very little water — perfect for the dry Rajasthan winter — and it blooms almost continuously from October through March. An easy weekend: a morning train from Delhi, three days in Jaipur, a slow breakfast every morning on a haveli rooftop, and bougainvillea everywhere.",

  "udaipur-lotus":
    "Udaipur is a city of seven lakes, and in the rainy and post-monsoon months, all of them come into lotus. Lake Pichola, Fateh Sagar, Swaroop Sagar — the blooms spread across quiet bays, the flowers pink and white and sacred. The Mewar royal families built their palaces around these waters, and today you can ride a boat across Pichola past the Jag Mandir and Jagniwas palaces, lotus-edged shores on either side. Go at dawn. The mist is still on the water, the city's white palaces turn pink in the first light, and the lotus flowers open slowly as the day arrives. The Sahelion ki Bari — the Garden of the Maidens — has a small lotus pool with marble cenotaphs at its center; the City Palace has gardens overlooking Pichola's lotus-strewn water. Have a cup of chai at the rooftop of a haveli, looking down. Udaipur's Rajput culture has honored the lotus in architecture, painting, and poetry for centuries. You'll recognize the motif on a hundred surfaces once you've seen it on the lake itself. A train from Delhi, three days of slow boats and palace hotels, marigold sellers and evening kathak performances, and lotus opening every morning on the water.",
};

let updated = 0;
Object.entries(rewrites).forEach(([id, story]) => {
  const b = data.find((x) => x.id === id);
  if (b) {
    b.story = story;
    updated++;
  }
});

const skagit = data.find((x) => x.id === "skagit-tulips");
if (skagit) {
  skagit.isPersonal = false;
  delete skagit.personalNote;
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log("Rewrote", updated, "stories. Skagit isPersonal cleared, personalNote removed.");

const remaining = data.filter(
  (b) =>
    /\bMom\b|\bMa,/.test(b.story) ||
    /imagine you|let's go|we could|we should|us together|for us\b|I keep|I'm writing|I went today|I love how|But I love/.test(b.story)
);
console.log("Remaining personal markers:", remaining.length);
if (remaining.length) console.log(" -", remaining.map((b) => b.id).join(", "));

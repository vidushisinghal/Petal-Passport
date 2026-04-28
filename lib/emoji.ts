export function emojiFor(flower: string): string {
  const f = flower.toLowerCase();
  if (f.includes("cherry") || f.includes("plum") || f.includes("almond") || f.includes("peach") || f.includes("magnolia"))
    return "🌸";
  if (f.includes("tulip")) return "🌷";
  if (f.includes("rose") && !f.includes("desert")) return "🌹";
  if (f.includes("sunflower")) return "🌻";
  if (f.includes("lotus") || f.includes("water lil")) return "🪷";
  if (f.includes("hibiscus") || f.includes("plumeria") || f.includes("frangipani") || f.includes("bougainv")) return "🌺";
  if (f.includes("daisy") || f.includes("daisies") || f.includes("cosmos") || f.includes("chrysanthemum") || f.includes("dahlia"))
    return "🌼";
  if (f.includes("lavender") || f.includes("heather") || f.includes("bluebell") || f.includes("wisteria") || f.includes("jacaranda") || f.includes("lupin") || f.includes("shibazakura") || f.includes("muhly") || f.includes("nemophila"))
    return "💜";
  if (f.includes("poppy") || f.includes("poppies") || f.includes("flame") || f.includes("spider") || f.includes("poinsett") || f.includes("ipê") || f.includes("ipe") || f.includes("pōhutukawa") || f.includes("pohutukawa"))
    return "🌺";
  if (f.includes("orchid") || f.includes("bird of paradise") || f.includes("neelakurinji") || f.includes("kadupul"))
    return "🌷";
  if (f.includes("marigold") || f.includes("canola") || f.includes("saffron") || f.includes("ranunculus") || f.includes("hyacinth") || f.includes("baobab"))
    return "🌼";
  if (f.includes("protea") || f.includes("fynbos") || f.includes("rhododendron") || f.includes("bluebonnet") || f.includes("kangaroo"))
    return "🌸";
  return "🌿";
}

import type { FertilizerInfo } from "@/domain/types";

export const FERTILIZERS: FertilizerInfo[] = [
  {
    id: "compost",
    name: "Compost",
    npk: "varies (roughly 1-1-1)",
    organic: true,
    description:
      "Decomposed organic matter that improves soil structure, feeds soil life and releases mild nutrients slowly.",
    bestFor: ["All garden beds", "Vegetables and fruit", "Improving sandy and clay soil", "Top-dressing containers"],
    howToApply:
      "Spread 1-2 inches over beds and lightly work in before planting, or top-dress around plants in spring and mid-season. Mix up to 25% into potting mix.",
    cautions: [
      "Use fully finished compost; immature compost can burn roots and tie up nitrogen",
      "Avoid compost made from pet waste or treated with persistent herbicides",
      "Low nutrient content, so heavy feeders may need extra fertilizer",
    ],
    petSafe: true,
  },
  {
    id: "aged-manure",
    name: "Aged manure",
    npk: "varies (about 1-1-1; poultry is higher)",
    organic: true,
    description:
      "Composted cow, horse, sheep or chicken manure that adds nutrients and organic matter to the soil.",
    bestFor: ["Heavy feeders such as corn, squash and tomatoes", "Preparing beds in fall", "Building poor soil"],
    howToApply:
      "Dig 1-2 inches into beds in fall or at least 2-4 weeks before planting. Use less of hot manures like chicken.",
    cautions: [
      "Fresh manure can burn plants and carry pathogens such as E. coli; use only fully aged or composted manure (at least 6 months)",
      "Apply 90-120 days before harvesting crops whose edible parts touch the soil",
      "Can contain weed seeds and herbicide residue, and excess salt",
      "Dogs are attracted to the smell and may eat it; keep out of reach",
    ],
    petSafe: false,
  },
  {
    id: "balanced-10-10-10",
    name: "Balanced fertilizer 10-10-10",
    npk: "10-10-10",
    organic: false,
    description: "General-purpose granular fertilizer with equal parts nitrogen, phosphorus and potassium.",
    bestFor: ["General vegetable gardens", "Established flower beds", "Lawns and shrubs"],
    howToApply:
      "Broadcast about 1-2 pounds per 100 square feet before planting and water in, or side-dress along rows every 4-6 weeks. Follow label rates.",
    cautions: [
      "Over-fertilizing burns roots and causes leafy growth at the expense of fruit",
      "Keep granules off leaves and away from stems; water in well",
      "Excess runoff pollutes waterways",
      "Store out of reach of pets and children",
    ],
    petSafe: false,
  },
  {
    id: "high-nitrogen",
    name: "High-nitrogen fertilizer",
    npk: "e.g. 24-8-16 or 21-0-0",
    organic: false,
    description: "Fertilizer rich in nitrogen to boost green leafy growth.",
    bestFor: ["Leafy greens such as lettuce, spinach and kale", "Lawns", "Corn", "Foliage houseplants"],
    howToApply:
      "Apply at half the label rate to start; side-dress leafy crops every 3-4 weeks and water in. Stop feeding as fruit or flowers form.",
    cautions: [
      "Too much nitrogen gives lush, weak growth and few flowers or fruit",
      "Burns plants when overapplied or applied to dry soil",
      "Attracts aphids to soft growth",
      "Keep away from pets and children",
    ],
    petSafe: false,
  },
  {
    id: "bloom-booster",
    name: "Bloom booster (high phosphorus)",
    npk: "e.g. 5-10-5 or 15-30-15",
    organic: false,
    description: "Phosphorus-rich fertilizer that encourages flower and fruit formation.",
    bestFor: ["Flowering annuals and perennials", "Roses", "Container flowers", "Fruiting plants once flowering starts"],
    howToApply:
      "Dilute liquid formulas to label strength and apply every 1-2 weeks once buds appear, or scatter granules and water in.",
    cautions: [
      "Excess phosphorus builds up in soil and runs off into waterways; test soil first",
      "Do not use on phosphorus-sensitive plants such as some Australian natives",
      "Over-fertilizing causes salt burn and brown leaf tips",
      "Keep products away from pets and children",
    ],
    petSafe: false,
  },
  {
    id: "fish-emulsion",
    name: "Fish emulsion",
    npk: "about 5-1-1",
    organic: true,
    description: "Liquid fertilizer made from processed fish, a fast-acting organic source of nitrogen.",
    bestFor: ["Leafy vegetables", "Seedlings and transplants", "Container plants", "Quick green-up"],
    howToApply:
      "Dilute according to the label (usually 1-2 tablespoons per gallon) and water around the roots or spray onto leaves every 2-4 weeks.",
    cautions: [
      "Smells strongly of fish and attracts dogs, raccoons and flies; water it in and avoid indoor use",
      "Overuse can burn tender plants",
      "Deodorized versions are available for indoor use",
      "Keep containers closed and away from pets",
    ],
    petSafe: false,
  },
  {
    id: "bone-meal",
    name: "Bone meal",
    npk: "about 3-15-0",
    organic: true,
    description:
      "Ground animal bones that provide slow-release phosphorus and calcium for roots and blooms.",
    bestFor: ["Bulbs", "Root crops", "Roses", "Fruiting plants in low-phosphorus soil"],
    howToApply:
      "Mix 1-2 tablespoons into the planting hole or scratch into soil and water in. Release is slow and works best in acidic to neutral soil (pH below 7).",
    cautions: [
      "Dogs love to dig it up and eat it; large amounts can cause vomiting, pancreatitis and blockage. Bury well and cover",
      "Does not work well in alkaline soil",
      "Adds little benefit if soil phosphorus is already high; test first",
      "Wear gloves and a mask; the dust can irritate lungs",
    ],
    petSafe: false,
  },
  {
    id: "blood-meal",
    name: "Blood meal",
    npk: "about 12-0-0",
    organic: true,
    description: "Dried slaughterhouse blood: a fast-acting, concentrated organic nitrogen source.",
    bestFor: ["Leafy greens", "Corn", "Nitrogen-hungry plants and compost activation"],
    howToApply:
      "Sprinkle 1-2 tablespoons around plants, scratch into the soil lightly and water in. Reapply every 6-8 weeks.",
    cautions: [
      "Very high nitrogen can burn plants if overapplied",
      "Dogs and wildlife dig it up and eat it; it can cause vomiting, pancreatitis and iron toxicity in pets. Bury well and keep out of reach",
      "Can lower soil pH over time",
      "Wear gloves and a mask; avoid inhaling the dust",
    ],
    petSafe: false,
  },
  {
    id: "kelp-seaweed",
    name: "Kelp / seaweed",
    npk: "about 1-0-2 (rich in trace minerals)",
    organic: true,
    description:
      "Seaweed extract or meal supplying potassium, trace minerals and natural growth hormones, which supports stress tolerance.",
    bestFor: ["Seedlings and transplants", "Container plants", "General plant health and stress recovery"],
    howToApply:
      "Dilute liquid kelp per label and drench or spray leaves every 2-4 weeks. Dried meal can be mixed into soil or compost.",
    cautions: [
      "Low NPK, so it works as a supplement rather than a main fertilizer",
      "Rinse harvested beach kelp to remove salt",
      "Strong smell for some products",
    ],
    petSafe: true,
  },
  {
    id: "worm-castings",
    name: "Worm castings",
    npk: "about 1-0-0 (varies)",
    organic: true,
    description:
      "Worm compost rich in beneficial microbes and gentle, plant-available nutrients. Impossible to burn plants.",
    bestFor: ["Seedlings", "Houseplants", "Containers and potting mixes", "Top-dressing beds"],
    howToApply:
      "Mix 10-20% into potting mix or top-dress with 1/2 to 1 inch around plants. Brew as 'tea' for a liquid feed.",
    cautions: [
      "Fairly low in nutrients, so supplement heavy feeders",
      "Quality varies widely; buy from a reputable source",
    ],
    petSafe: true,
  },
  {
    id: "tomato-feed",
    name: "Tomato fertilizer",
    npk: "e.g. 3-4-6 or 5-10-10",
    organic: false,
    description: "Fertilizer with lower nitrogen and higher potassium and phosphorus for fruiting crops, often with calcium.",
    bestFor: ["Tomatoes", "Peppers", "Eggplant", "Cucumbers and other fruiting vegetables"],
    howToApply:
      "Begin when the first flower clusters appear. Apply every 1-2 weeks as liquid or every 4-6 weeks as granules, per label. Water consistently.",
    cautions: [
      "Too much nitrogen gives leafy plants and few fruit",
      "Inconsistent watering causes blossom end rot despite feeding",
      "Do not exceed label rates; salts burn roots",
      "Store out of reach of pets and children",
    ],
    petSafe: false,
  },
  {
    id: "acid-fertilizer",
    name: "Acid-loving plant fertilizer",
    npk: "e.g. 30-10-10 or 4-3-4",
    organic: false,
    description:
      "Fertilizer formulated with ammonium-based nitrogen, sulfur and iron to feed plants that need acidic soil.",
    bestFor: ["Blueberries", "Azaleas and rhododendrons", "Hydrangeas", "Camellias", "Gardenias"],
    howToApply:
      "Apply in early spring and again after flowering, following the label, and water in well. Keep granules away from stems.",
    cautions: [
      "Can over-acidify soil if used repeatedly on neutral soil; test pH",
      "Do not use on plants that prefer alkaline soil",
      "Burns shallow roots if overapplied",
      "Keep away from pets and children",
    ],
    petSafe: false,
  },
  {
    id: "cactus-fertilizer",
    name: "Cactus & succulent fertilizer",
    npk: "e.g. 2-7-7 or 1-2-2",
    organic: false,
    description: "Dilute, low-nitrogen fertilizer for cacti and succulents.",
    bestFor: ["Cacti", "Succulents", "Jade plants and aloe"],
    howToApply:
      "Dilute to half strength or less. Feed once a month in spring and summer during active growth; do not feed in winter.",
    cautions: [
      "Too much nitrogen causes weak, leggy, soft growth",
      "Never feed dormant plants or dry roots",
      "Flush container with water every few months to remove salts",
    ],
    petSafe: false,
  },
  {
    id: "orchid-fertilizer",
    name: "Orchid fertilizer",
    npk: "e.g. 20-20-20 or 30-10-10 (low strength)",
    organic: false,
    description: "Balanced, urea-free fertilizer designed for orchid roots in bark mixes, applied very dilute.",
    bestFor: ["Phalaenopsis and other orchids", "Bromeliads"],
    howToApply:
      "Use 'weakly, weekly': 1/4 strength every week, or full label strength every 2-4 weeks, on damp media. Flush with plain water monthly.",
    cautions: [
      "Salt buildup burns roots; flush the pot monthly",
      "Never apply to dry roots or a dormant plant",
      "Use less in winter",
    ],
    petSafe: false,
  },
  {
    id: "houseplant-liquid",
    name: "Houseplant liquid fertilizer",
    npk: "e.g. 10-10-10 or 3-1-2 (diluted)",
    organic: false,
    description: "Water-soluble fertilizer diluted into water for container and indoor plants.",
    bestFor: ["Foliage houseplants", "Flowering houseplants", "Herbs on a windowsill"],
    howToApply:
      "Dilute to label strength (or half strength) and apply with watering every 2-4 weeks in spring and summer. Cut back or stop in winter.",
    cautions: [
      "Overfeeding leaves white crusts, brown leaf tips and root burn",
      "Never fertilize dry or stressed plants",
      "Flush pots with water every few months",
      "Keep bottles away from pets and children",
    ],
    petSafe: false,
  },
  {
    id: "slow-release-granules",
    name: "Slow-release granules",
    npk: "e.g. 14-14-14",
    organic: false,
    description: "Coated pellets that release nutrients gradually over 3-6 months, triggered by water and warmth.",
    bestFor: ["Containers and hanging baskets", "Annual flowers", "Vegetable beds (season-long feeding)"],
    howToApply:
      "Mix into potting mix or sprinkle on the soil surface at planting time at the label rate, then water in. Reapply when the labelled period ends.",
    cautions: [
      "Release speeds up in heat; do not overapply in hot weather",
      "Pets and children may eat the pellets; keep out of reach",
      "Not instant: plants may need a liquid boost early on",
      "Do not crush the coating",
    ],
    petSafe: false,
  },
  {
    id: "epsom-salt",
    name: "Epsom salt",
    npk: "0-0-0 (magnesium sulfate)",
    organic: true,
    description:
      "Magnesium sulfate, sometimes used to correct magnesium deficiency. It is not a general fertilizer.",
    bestFor: ["Plants with a confirmed magnesium deficiency (yellowing between leaf veins on older leaves)", "Peppers, tomatoes and roses in magnesium-poor soil"],
    howToApply:
      "Only use after a soil test shows low magnesium. Dissolve 1 tablespoon per gallon of water and apply to soil or as a foliar spray, no more than once or twice a season.",
    cautions: [
      "Popular myth: it does not 'boost blooms' or cure blossom end rot (that is calcium and uneven watering)",
      "Excess magnesium blocks calcium and potassium uptake",
      "Adds nothing if soil magnesium is already adequate",
      "Do not apply as a routine treatment",
    ],
    petSafe: true,
  },
  {
    id: "none",
    name: "No fertilizer",
    npk: "n/a",
    organic: true,
    description: "No feeding needed — lean soil preferred.",
    bestFor: ["Succulents and drought-tolerant natives", "Mediterranean herbs like lavender, rosemary and thyme", "Wildflowers"],
    howToApply: "Skip fertilizer. A light top-dressing of compost once a year is plenty, if anything.",
    cautions: [
      "Fertilizing these plants causes weak, floppy growth and fewer flowers or less flavor",
      "Rich soil can shorten the life of lean-soil plants",
    ],
    petSafe: true,
  },
];

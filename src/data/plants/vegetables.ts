import type { Plant, Toxicity } from "@/domain/types";

/** Baseline for plants with no known toxicity to any group; spread and add notes. */
const SAFE = {
  cat: "non-toxic",
  dog: "non-toxic",
  horse: "non-toxic",
  bird: "non-toxic",
  rabbit: "non-toxic",
  human: "non-toxic",
} as const satisfies Omit<Toxicity, "notes">;

export const VEGETABLES: Plant[] = [
  // ---------------------------------------------------------------------------
  // Nightshades (Solanaceae)
  // ---------------------------------------------------------------------------
  {
    id: "tomato",
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    emoji: "🍅",
    category: "vegetable",
    lifeCycle: "annual",
    description:
      "The quintessential warm-season fruiting vegetable. Choose determinate (bush) types for pots and a concentrated harvest, or indeterminate (vining) types for fruit all summer until frost.",
    difficulty: "moderate",
    environments: ["outdoor"],
    edible: true,
    sun: ["full-sun"],
    water: "moderate",
    wateringIntervalDays: 3,
    waterNotes:
      "Give 1–2 inches per week as deep, infrequent soaks at the base. Uneven moisture causes blossom-end rot and split fruit; mulch to even out swings and keep leaves dry to limit early blight and septoria.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 65, idealMaxF: 85, maxF: 90 },
    hardinessZones: { min: 3, max: 11 },
    soil: { types: ["loam", "sandy", "potting-mix"], phMin: 6.2, phMax: 6.8, drainage: "well-drained" },
    fertilizer: {
      feeding: "heavy",
      recommended: ["compost", "tomato-feed", "bone-meal", "epsom-salt"],
      frequencyDays: 14,
      notes:
        "Work compost and bone meal into the planting hole. Once the first fruit sets, switch from high-nitrogen to a low-N, high-potassium tomato feed every 2 weeks. Too much nitrogen gives lush leaves and few fruit.",
    },
    container: {
      suitable: true,
      minGallons: 10,
      notes:
        "Determinate and dwarf types need 10+ gallons; full-size indeterminate types do best in 15–20 gallons. Use potting mix, not garden soil, and water daily in summer heat.",
    },
    spacingInches: 24,
    heightInches: { min: 36, max: 96 },
    daysToMaturity: { min: 60, max: 90 },
    planting: {
      startIndoorsWeeks: -7,
      transplantWeeks: 2,
      notes:
        "Start seeds 6–8 weeks before last frost; transplant once nights stay above 50°F and soil is at least 60°F. Bury the stem up to the first true leaves so it roots along the buried portion.",
    },
    companions: ["basil", "carrot", "onion", "garlic", "chives", "parsley", "marigold", "nasturtium", "borage", "sweet-alyssum", "lettuce"],
    antagonists: ["potato", "fennel", "cabbage", "broccoli", "cauliflower", "brussels-sprouts", "sweet-corn"],
    companionNotes:
      "Basil, marigold and borage are traditional partners (borage and basil may deter hornworms; marigolds suppress root-knot nematodes). Keep away from potatoes (shared late blight and Colorado potato beetle), fennel (inhibits growth), brassicas (compete for nutrients) and corn (shares corn earworm, which is also the tomato fruitworm). Rotate out of beds that had tomatoes, peppers, eggplant or potatoes in the past 3 years.",
    attracts: ["bumblebees", "native-bees", "hoverflies", "parasitic-wasps"],
    pests: ["tomato-hornworm", "aphids", "whiteflies", "flea-beetles", "cutworms", "squirrels", "birds", "deer"],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "moderate",
      bird: "mild",
      rabbit: "mild",
      human: "mild",
      notes:
        "Leaves, stems and green (unripe) fruit contain tomatine and solanine: drooling, vomiting, diarrhea, lethargy and in larger amounts weakness or slowed heart rate in pets and horses. Ripe fruit is safe for people and most pets in moderation.",
    },
    allergens: ["nightshade", "contact-dermatitis"],
    allergyNotes:
      "Foliage hairs and sap can cause itchy contact dermatitis. Tomato fruit is a common food sensitivity in people with nightshade intolerance; some grass-pollen-allergic people react to raw tomato.",
    requiredTools: ["tomato-cage"],
    helpfulTools: ["stakes", "mulch", "seed-trays", "heat-mat", "grow-light", "drip-irrigation", "pruners", "soil-test-kit"],
    goals: ["edible"],
    careTips: [
      "Mulch 2–3 inches deep after the soil warms to stabilize moisture and keep soil splash (a disease vector) off the lower leaves.",
      "Prune suckers and the lowest 10–12 inches of leaves on indeterminate types to improve airflow; do not prune determinate types heavily.",
      "Stake or cage at planting time, not later, so you don't damage established roots.",
      "Hand-pick hornworms (large green caterpillars) and leave any wearing white parasitic wasp cocoons on the plant.",
      "Rotate to a new bed each year and choose disease-resistant varieties (look for V, F, N, T on the tag).",
    ],
    harvestTips:
      "Pick when fruit is fully colored and slightly yielding, usually 6–8 weeks after fruit set. Before a frost, harvest mature-green fruit and ripen indoors at room temperature. Do not refrigerate ripe tomatoes.",
  },
  {
    id: "cherry-tomato",
    name: "Cherry Tomato",
    scientificName: "Solanum lycopersicum var. cerasiforme",
    emoji: "🍒",
    category: "vegetable",
    lifeCycle: "annual",
    description:
      "Small, sweet, prolific tomatoes that ripen earlier and tolerate heat and uneven watering better than slicers. Compact patio and dwarf varieties can even fruit indoors under strong grow lights.",
    difficulty: "easy",
    environments: ["outdoor", "indoor"],
    edible: true,
    sun: ["full-sun"],
    indoorLight: ["direct"],
    water: "moderate",
    wateringIntervalDays: 3,
    waterNotes:
      "Water deeply 1–2 inches per week. Cherry types crack less than slicers but still suffer if soil swings from bone dry to soaked. Indoors, water when the top inch of mix is dry.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 65, idealMaxF: 85, maxF: 92 },
    hardinessZones: { min: 3, max: 11 },
    soil: { types: ["loam", "sandy", "potting-mix"], phMin: 6.2, phMax: 6.8, drainage: "well-drained" },
    fertilizer: {
      feeding: "heavy",
      recommended: ["compost", "tomato-feed", "worm-castings", "epsom-salt"],
      frequencyDays: 14,
      notes:
        "Feed every 2 weeks with a tomato fertilizer after the first flower cluster sets; container plants may need weekly half-strength feeding because nutrients leach with frequent watering.",
    },
    container: {
      suitable: true,
      minGallons: 5,
      notes:
        "Dwarf and determinate patio types (e.g. Tiny Tim, Tumbling Tom) grow in 5-gallon pots; vining cherry types want 10+ gallons. Indoors, provide at least 12–14 hours of strong full-spectrum light and hand-pollinate by tapping flowers.",
    },
    spacingInches: 24,
    heightInches: { min: 12, max: 96 },
    daysToMaturity: { min: 55, max: 75 },
    planting: {
      startIndoorsWeeks: -7,
      transplantWeeks: 2,
      notes:
        "Start seeds 6–8 weeks before last frost. Transplant outdoors when nights stay above 50°F. Indoors, they can be started any time of year under lights.",
    },
    companions: ["basil", "carrot", "onion", "garlic", "chives", "parsley", "marigold", "nasturtium", "borage", "sweet-alyssum", "lettuce"],
    antagonists: ["potato", "fennel", "cabbage", "broccoli", "cauliflower", "brussels-sprouts", "sweet-corn"],
    companionNotes:
      "Same partners as full-size tomatoes: basil, marigolds and borage nearby; carrots and alliums as low-growing neighbors. Keep away from potatoes (blight), fennel and brassicas. Sweet alyssum at the base draws hoverflies that eat aphids.",
    attracts: ["bumblebees", "native-bees", "hoverflies", "parasitic-wasps"],
    pests: ["tomato-hornworm", "aphids", "whiteflies", "spider-mites", "flea-beetles", "birds", "squirrels"],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "moderate",
      bird: "mild",
      rabbit: "mild",
      human: "mild",
      notes:
        "Leaves, stems and green fruit contain tomatine/solanine: drooling, vomiting, diarrhea and lethargy in pets. Ripe cherry tomatoes are safe in moderation, but the whole fruit is a choking hazard for small children.",
    },
    allergens: ["nightshade", "contact-dermatitis"],
    allergyNotes:
      "Foliage can irritate skin on contact. Tomatoes are a nightshade; people with nightshade sensitivity may react to the fruit.",
    requiredTools: ["tomato-cage"],
    helpfulTools: ["stakes", "mulch", "seed-trays", "grow-light", "heat-mat", "pruners", "containers"],
    goals: ["edible", "kid-friendly"],
    careTips: [
      "Support vining types with a tall cage or a stake, and pinch suckers to keep one to three main stems.",
      "Keep soil evenly moist; letting it dry out then flooding it is the main cause of split fruit.",
      "Pick regularly. Heavy clusters left on the vine slow new flowering.",
      "Under grow lights, keep the light 4–6 inches above the canopy and shake flower clusters daily to pollinate.",
    ],
    harvestTips:
      "Pick when fully colored and easily separating from the stem, often in the morning for the sweetest flavor. Cherry types ripen over a long period, so harvest every 2–3 days.",
  },
  {
    id: "bell-pepper",
    name: "Bell Pepper",
    scientificName: "Capsicum annuum",
    emoji: "🫑",
    category: "vegetable",
    lifeCycle: "annual",
    description:
      "Thick-walled, sweet peppers that start green and ripen to red, yellow or orange with higher sugar and vitamin C. They need a long warm season, so start early and keep plants consistently warm.",
    difficulty: "moderate",
    environments: ["outdoor"],
    edible: true,
    sun: ["full-sun"],
    water: "moderate",
    wateringIntervalDays: 3,
    waterNotes:
      "About 1–2 inches per week. Consistent moisture prevents blossom-end rot and thin-walled fruit; mulch to hold soil moisture and temperature steady.",
    humidity: "average",
    temperature: { minF: 35, idealMinF: 70, idealMaxF: 85, maxF: 90 },
    hardinessZones: { min: 3, max: 11 },
    soil: { types: ["loam", "sandy", "potting-mix"], phMin: 6.0, phMax: 6.8, drainage: "well-drained" },
    fertilizer: {
      feeding: "moderate",
      recommended: ["compost", "balanced-10-10-10", "fish-emulsion", "epsom-salt"],
      frequencyDays: 21,
      notes:
        "Amend with compost at planting and side-dress with a balanced fertilizer when the first flowers appear. Excess nitrogen yields big bushes with few peppers. A teaspoon of Epsom salt per gallon once or twice mid-season can help where soil is low in magnesium.",
    },
    container: {
      suitable: true,
      minGallons: 5,
      notes: "A 5-gallon pot per plant works well. Dark pots overheat in the afternoon sun; light-colored or fabric pots keep roots cooler.",
    },
    spacingInches: 18,
    heightInches: { min: 18, max: 36 },
    daysToMaturity: { min: 60, max: 90 },
    planting: {
      startIndoorsWeeks: -8,
      transplantWeeks: 2,
      notes:
        "Start seeds 8–10 weeks before last frost on a heat mat (80–85°F for germination). Transplant 2–3 weeks after last frost when soil is above 65°F. Cold nights below 55°F stall growth and flower set.",
    },
    companions: ["basil", "onion", "carrot", "chives", "parsley", "oregano", "marigold", "nasturtium", "spinach", "lettuce", "borage"],
    antagonists: ["fennel", "potato"],
    companionNotes:
      "Basil and oregano repel aphids and attract beneficial insects, while onions and chives deter aphids and leave room for peppers to spread overhead. Low spinach and lettuce shade the soil. Avoid fennel and rotate away from beds that held potatoes, tomatoes or eggplant to avoid shared soil diseases (verticillium, bacterial spot).",
    attracts: ["native-bees", "bumblebees", "hoverflies"],
    pests: ["aphids", "flea-beetles", "cutworms", "tomato-hornworm", "thrips", "spider-mites", "rabbits"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes:
        "Fruit is safe for people and pets in small amounts. Leaves and stems are nightshade foliage and may cause mild stomach upset if eaten in quantity. Do not feed seasoned or cooked peppers with onion or garlic to pets.",
    },
    allergens: ["nightshade"],
    allergyNotes: "Peppers are nightshades; sensitive individuals may react to the fruit. Pollen is minimal.",
    requiredTools: [],
    helpfulTools: ["seed-trays", "heat-mat", "grow-light", "stakes", "mulch", "row-cover", "drip-irrigation"],
    goals: ["edible"],
    careTips: [
      "Pinch off the first flowers on young transplants so the plant builds a strong frame before fruiting.",
      "Stake or cage heavily loaded plants; the branches are brittle and snap under fruit weight.",
      "Mulch after the soil is warm, and water at the base to avoid sunscald and fungal leaf spot.",
      "Row cover or a hot cap helps in cool springs, but remove it once flowers open so pollinators can reach them.",
      "Above 90°F days or 75°F nights, flowers drop; provide afternoon shade cloth in hot climates.",
    ],
    harvestTips:
      "Cut (do not pull) fruit with 1/2 inch of stem. Green peppers are mature at full size; leaving them 2–4 more weeks gives sweeter red, yellow or orange fruit. Frequent picking encourages more fruit.",
  },
  {
    id: "hot-pepper",
    name: "Hot Pepper",
    scientificName: "Capsicum annuum, C. chinense, C. frutescens",
    emoji: "🌶️",
    category: "vegetable",
    lifeCycle: "annual",
    description:
      "Capsaicin-rich peppers from mild jalapeños to fiery habaneros. Compact plants that love heat and are productive in pots, and many are pretty enough to double as ornamentals.",
    difficulty: "moderate",
    environments: ["outdoor", "indoor"],
    edible: true,
    sun: ["full-sun"],
    indoorLight: ["direct"],
    water: "moderate",
    wateringIntervalDays: 4,
    waterNotes:
      "Slightly stressed (not wilting) hot peppers often have more heat. Water deeply when the top inch is dry. Overwatering and soggy soil promote root rot.",
    humidity: "average",
    temperature: { minF: 35, idealMinF: 70, idealMaxF: 90, maxF: 95 },
    hardinessZones: { min: 3, max: 11 },
    soil: { types: ["loam", "sandy", "potting-mix"], phMin: 6.0, phMax: 6.8, drainage: "well-drained" },
    fertilizer: {
      feeding: "moderate",
      recommended: ["compost", "balanced-10-10-10", "fish-emulsion", "bone-meal"],
      frequencyDays: 21,
      notes:
        "Light feeders. Excess nitrogen produces foliage at the cost of fruit; switch to a lower-nitrogen fertilizer once flowers appear. Add a little bone meal at planting for phosphorus.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes:
        "Excellent in pots: 3 gallons for compact types like Thai or cayenne, 5 gallons for large plants. Indoors, give 14–16 hours of strong light and a warm spot (70–85°F). Overwinter perennial types (C. chinense, C. baccatum) indoors.",
    },
    spacingInches: 18,
    heightInches: { min: 12, max: 36 },
    daysToMaturity: { min: 65, max: 100 },
    planting: {
      startIndoorsWeeks: -10,
      transplantWeeks: 2,
      notes:
        "Slow to germinate: start 8–12 weeks before last frost on a heat mat at 80–90°F. Superhots (habanero, ghost, Carolina Reaper) benefit from 12 weeks. Transplant when nights stay above 55°F.",
    },
    companions: ["basil", "onion", "carrot", "chives", "parsley", "oregano", "marigold", "nasturtium", "spinach", "lettuce"],
    antagonists: ["fennel", "potato"],
    companionNotes:
      "Same friends as bell peppers: basil, oregano and chives help deter aphids and spider mites; low greens shade the soil. Avoid fennel and do not follow potatoes, tomatoes or eggplant in the same bed.",
    attracts: ["native-bees", "bumblebees", "hoverflies"],
    pests: ["aphids", "thrips", "spider-mites", "whiteflies", "fungus-gnats", "flea-beetles", "cutworms"],
    repels: ["deer"],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "non-toxic",
      rabbit: "mild",
      human: "mild",
      notes:
        "Capsaicin in fruit and seeds irritates the mouth, eyes and stomach of mammals: drooling, pawing at the mouth, vomiting and diarrhea. Birds are insensitive to capsaicin. Leaves are nightshade foliage and mildly upsetting if eaten.",
    },
    allergens: ["nightshade", "contact-dermatitis"],
    allergyNotes:
      "Capsaicin burns skin and eyes: wear gloves when handling hot varieties and never touch your face. Smoke or dust from drying/cooking peppers can trigger coughing and eye irritation.",
    requiredTools: [],
    helpfulTools: ["garden-gloves", "seed-trays", "heat-mat", "grow-light", "stakes", "mulch", "containers"],
    goals: ["edible", "ornamental"],
    careTips: [
      "Wear gloves when harvesting habaneros and other very hot types, and wash tools afterwards.",
      "Pinch growing tips on young plants to encourage bushier growth and more fruit.",
      "Stake tall or heavy-fruiting varieties; branches snap easily.",
      "Leave pods on the plant to mature (usually red or orange) for fuller flavor and heat; green fruit is milder.",
      "Indoors, hand-pollinate by gently shaking the plant or brushing flowers with a small brush.",
    ],
    harvestTips:
      "Cut pods with scissors, leaving a short stem. Harvest regularly to keep plants producing. At the end of the season, pick everything before the first frost and dry, pickle or freeze.",
  },
  {
    id: "eggplant",
    name: "Eggplant",
    scientificName: "Solanum melongena",
    emoji: "🍆",
    category: "vegetable",
    lifeCycle: "annual",
    description:
      "A heat-loving nightshade producing glossy purple, white or striped fruit. It needs a long, warm season and benefits from black plastic mulch or raised beds in cool climates.",
    difficulty: "moderate",
    environments: ["outdoor"],
    edible: true,
    sun: ["full-sun"],
    water: "moderate",
    wateringIntervalDays: 3,
    waterNotes:
      "Needs 1–2 inches per week; irregular watering produces bitter, small or woody fruit. Mulch to hold moisture and warmth.",
    humidity: "average",
    temperature: { minF: 35, idealMinF: 70, idealMaxF: 90, maxF: 95 },
    hardinessZones: { min: 4, max: 11 },
    soil: { types: ["loam", "sandy", "potting-mix"], phMin: 5.8, phMax: 6.8, drainage: "well-drained" },
    fertilizer: {
      feeding: "heavy",
      recommended: ["compost", "balanced-10-10-10", "fish-emulsion", "aged-manure"],
      frequencyDays: 21,
      notes:
        "Heavy feeder: work in compost or aged manure at planting, then side-dress with balanced fertilizer when the first fruit sets and again 4 weeks later.",
    },
    container: {
      suitable: true,
      minGallons: 5,
      notes:
        "Compact types (Fairy Tale, Patio Baby, Little Fingers) thrive in 5-gallon pots; large Globe types need 10 gallons. Stake in pots.",
    },
    spacingInches: 24,
    heightInches: { min: 24, max: 48 },
    daysToMaturity: { min: 65, max: 85 },
    planting: {
      startIndoorsWeeks: -8,
      transplantWeeks: 2,
      notes:
        "Start seeds 8–10 weeks before last frost with bottom heat (80–90°F). Transplant only after soil reaches 65–70°F, usually 2–3 weeks after last frost. Chilling stunts plants.",
    },
    companions: ["basil", "bush-bean", "marigold", "thyme", "tarragon", "oregano", "spinach", "nasturtium"],
    antagonists: ["fennel", "potato"],
    companionNotes:
      "Bush beans may help deter Colorado potato beetle, a main eggplant pest. Thyme, oregano and tarragon confuse flea beetles. Don't plant near potatoes (shared beetles and verticillium wilt) or fennel; rotate from other nightshades.",
    attracts: ["bumblebees", "native-bees", "hoverflies"],
    pests: ["flea-beetles", "colorado-potato-beetle", "aphids", "spider-mites", "whiteflies", "tomato-hornworm", "cutworms"],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "mild",
      rabbit: "mild",
      human: "mild",
      notes:
        "Leaves, stems and flowers contain solanine-type glycoalkaloids: drooling, vomiting, diarrhea and lethargy if eaten in quantity. The ripe cooked fruit is safe; raw fruit is bitter and can upset the stomach.",
    },
    allergens: ["nightshade", "contact-dermatitis"],
    allergyNotes:
      "Stems have prickles on many varieties; leaf hairs can irritate skin. Eggplant is a nightshade and a known trigger for some with nightshade sensitivity.",
    requiredTools: [],
    helpfulTools: ["stakes", "mulch", "row-cover", "seed-trays", "heat-mat", "grow-light", "garden-gloves", "pruners"],
    goals: ["edible", "ornamental"],
    careTips: [
      "Use floating row cover for the first month to block flea beetles and keep young plants warm; remove at flowering.",
      "Stake or cage plants so heavy fruits do not snap branches.",
      "Limit to 4–6 fruits per plant on large-fruited types for bigger, better fruit.",
      "Black plastic mulch or a raised bed warms soil in short-season zones.",
    ],
    harvestTips:
      "Harvest when the skin is glossy and springs back lightly when pressed; dull, soft or seedy fruit is overripe and bitter. Cut with pruners, leaving the calyx and a bit of stem.",
  },

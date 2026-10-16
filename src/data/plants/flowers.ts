import type { Plant, Toxicity } from "@/domain/types";

/** Shared "no known toxicity" baseline; spread and add `notes`. */
const SAFE = {
  cat: "non-toxic",
  dog: "non-toxic",
  horse: "non-toxic",
  bird: "non-toxic",
  rabbit: "non-toxic",
  human: "non-toxic",
} as const satisfies Omit<Toxicity, "notes">;

export const FLOWERS: Plant[] = [
  // ---------------------------------------------------------------------------
  // MARIGOLD
  // ---------------------------------------------------------------------------
  {
    id: "marigold",
    name: "Marigold",
    scientificName: "Tagetes patula / Tagetes erecta",
    emoji: "🏵️",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Cheerful, heat-loving annual in gold, orange and mahogany that blooms from early summer to frost. French marigolds (T. patula) are the classic vegetable-garden companion and a proven cover crop against root-knot nematodes.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun"],
    water: "moderate",
    wateringIntervalDays: 5,
    waterNotes:
      "Water deeply when the top inch of soil is dry; established plants tolerate short dry spells. Water at the base, because wet foliage and flowers invite botrytis and powdery mildew. Container plants may need water daily in summer heat.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 65, idealMaxF: 85, maxF: 95 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["loam", "sandy", "clay"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["compost"],
      frequencyDays: 0,
      notes:
        "Average soil is enough; rich soil or extra nitrogen gives lush foliage and fewer flowers. Containers benefit from a half-strength bloom booster about once a month.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes:
        "Dwarf French types do well in 6–8 in pots; tall African marigolds need 3+ gallons.",
    },
    spacingInches: 10,
    heightInches: { min: 8, max: 36 },
    daysToMaturity: { min: 45, max: 70 },
    planting: {
      startIndoorsWeeks: -6,
      transplantWeeks: 0,
      directSowWeeks: 0,
      notes:
        "Frost-tender: transplant or direct sow once frost danger has passed and soil is warm. Seeds germinate in 5–7 days. For nematode suppression, plant French marigolds (e.g. 'Nemagold', 'Tangerine') densely as a solid stand for at least 2–3 months, then till them in.",
    },
    companions: [
      "tomato",
      "cherry-tomato",
      "bell-pepper",
      "hot-pepper",
      "eggplant",
      "potato",
      "zucchini",
      "winter-squash",
      "pumpkin",
      "cucumber",
      "bush-bean",
      "lettuce",
    ],
    antagonists: [],
    companionNotes:
      "French marigolds release alpha-terthienyl from their roots, which suppresses root-knot nematodes (best for tomatoes, peppers, potatoes and squash when planted as a dense cover crop, not just scattered). Their scent may also confuse whiteflies, and open single-flowered types draw hoverflies whose larvae eat aphids. The pest-repelling effect above ground is modest; treat it as a bonus, not a substitute for pest management.",
    attracts: ["hoverflies", "honeybees", "native-bees", "butterflies", "ladybugs"],
    pests: ["spider-mites", "slugs-snails", "aphids"],
    repels: ["whiteflies"],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "non-toxic",
      rabbit: "non-toxic",
      human: "mild",
      notes:
        "Leaves, stems and flowers (Tagetes): mild stomach upset (drooling, vomiting) if eaten; sap can cause skin irritation, and photosensitivity in sunlight in sensitive people. Not a food plant (only T. tenuifolia 'Gem' types are culinary).",
    },
    allergens: ["asteraceae", "contact-dermatitis"],
    allergyNotes:
      "Daisy-family plant: can trigger reactions in people allergic to ragweed. Sap and pungent foliage may cause contact dermatitis.",
    requiredTools: [],
    helpfulTools: ["mulch", "stakes", "garden-gloves"],
    goals: ["pollinators", "ornamental", "low-maintenance", "kid-friendly"],
    careTips: [
      "Deadhead spent blooms every week or two to keep flowers coming until frost.",
      "Pinch seedlings at 4–6 in to encourage bushy, branching plants.",
      "Do not over-fertilize: too much nitrogen means leaves instead of blooms.",
      "Space plants so air circulates; crowded plants in humid weather are prone to powdery mildew and botrytis.",
      "Tall African marigolds can topple in wind or heavy rain; stake or plant in groups that prop each other up.",
    ],
  },

  // ---------------------------------------------------------------------------
  // NASTURTIUM
  // ---------------------------------------------------------------------------
  {
    id: "nasturtium",
    name: "Nasturtium",
    scientificName: "Tropaeolum majus",
    emoji: "🌺",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Fast-growing annual with round leaves and bright edible flowers that taste peppery like watercress. Trailing types spill from baskets and walls; the plants make an excellent aphid trap crop.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: true,
    sun: ["full-sun", "partial-sun"],
    water: "moderate",
    wateringIntervalDays: 5,
    waterNotes:
      "Water when the top inch is dry. Nasturtiums are happiest with steady but not excessive moisture; soggy soil promotes rot, and too much water plus rich soil gives foliage with few flowers.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 55, idealMaxF: 75, maxF: 88 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["loam", "sandy"],
      phMin: 6.1,
      phMax: 7.8,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["none"],
      frequencyDays: 0,
      notes:
        "Thrives in poor to average soil. Fertile soil or nitrogen produces huge leaves and few flowers. No feeding needed in the ground; in containers a single weak bloom-booster feeding in midsummer is plenty.",
    },
    container: {
      suitable: true,
      minGallons: 2,
      notes: "Excellent in hanging baskets, window boxes and 10–12 in pots; trailing types spill over the edge.",
    },
    spacingInches: 12,
    heightInches: { min: 10, max: 72 },
    daysToMaturity: { min: 50, max: 65 },
    planting: {
      directSowWeeks: 0,
      transplantWeeks: 1,
      notes:
        "Direct sow large seeds 1/2–1 in deep from about the last frost date; soaking overnight speeds germination. Roots resent disturbance, so avoid transplanting. Frost kills plants; heat above about 85°F slows flowering. Succession sow every 3–4 weeks for steady flowers.",
    },
    companions: [
      "cucumber",
      "zucchini",
      "winter-squash",
      "pumpkin",
      "cabbage",
      "broccoli",
      "cauliflower",
      "kale",
      "brussels-sprouts",
      "tomato",
      "radish",
    ],
    antagonists: [],
    companionNotes:
      "Black bean aphids and other aphids prefer nasturtiums, so the plants work as a sacrificial trap crop for brassicas, cucumbers, squash and tomatoes: plant them 1–2 ft away and remove or hose off heavily infested plants. They also draw cabbage white butterflies away from brassicas, though caterpillars will then feed on the nasturtiums (hand-pick). Trailing squash-bed edges and tomato bases are ideal spots. Reports of repelling squash bugs, whiteflies and cucumber beetles are anecdotal.",
    attracts: ["hummingbirds", "honeybees", "bumblebees", "native-bees", "hoverflies", "butterflies"],
    pests: ["aphids", "cabbage-worms", "slugs-snails"],
    repels: ["whiteflies", "squash-bugs"],
    toxicity: {
      ...SAFE,
      notes:
        "Listed as non-toxic to cats, dogs and horses by the ASPCA. Leaves, flowers and seed pods are edible for people (peppery, high in vitamin C). Large amounts may cause mild stomach upset in pets.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["trellis", "hanging-basket", "mulch"],
    goals: ["edible", "pollinators", "ornamental", "kid-friendly", "low-maintenance", "fast-harvest"],
    careTips: [
      "Plant in lean soil with no extra fertilizer; rich soil trades flowers for leaves.",
      "Pinch back long vines in midsummer to renew flowering and keep plants tidy.",
      "Check leaf undersides weekly for aphids and cabbage worm eggs; blast aphids off with water.",
      "In hot summers give afternoon shade; plants often rebloom in cool fall weather.",
      "Let a few seed pods mature to self-sow, or collect them dry for next year.",
    ],
    harvestTips:
      "Pick flowers just after they open for salads and garnishes (mild-to-peppery, best in the morning). Young leaves are also edible, and green seed pods can be pickled as 'poor man's capers'. Harvest only from plants you have not sprayed with non-food-safe products.",
  },

  // ---------------------------------------------------------------------------
  // SUNFLOWER
  // ---------------------------------------------------------------------------
  {
    id: "sunflower",
    name: "Sunflower",
    scientificName: "Helianthus annuus",
    emoji: "🌻",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Iconic, fast-growing annual that tracks the sun as a seedling and produces huge pollen- and seed-rich heads. Dwarf, branching and giant cultivars suit everything from containers to back fences.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: true,
    sun: ["full-sun"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water seedlings regularly, then deeply once a week; established sunflowers have deep taproots and tolerate drought. Water at the base and avoid wetting the heads and foliage. Giants need extra water when heads are forming.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 70, idealMaxF: 78, maxF: 95 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["loam", "sandy", "clay"],
      phMin: 6.0,
      phMax: 7.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["compost", "slow-release-granules"],
      frequencyDays: 0,
      notes:
        "Work compost into the planting site. Giants benefit from one side-dressing of balanced fertilizer when about 1–2 ft tall; avoid excess nitrogen, which produces weak, floppy stems.",
    },
    container: {
      suitable: true,
      minGallons: 5,
      notes: "Choose dwarf cultivars ('Teddy Bear', 'Sunny Smile', 'Elf') for containers; one plant per 5-gallon pot.",
    },
    spacingInches: 18,
    heightInches: { min: 18, max: 144 },
    daysToMaturity: { min: 70, max: 110 },
    planting: {
      directSowWeeks: 0,
      startIndoorsWeeks: -3,
      notes:
        "Direct sow seeds 1 in deep once soil reaches about 50–55°F (around the last frost). Taproots resent transplanting, so start indoors only in biodegradable pots. Succession sow every 2 weeks until midsummer for continuous bloom. Giant types need 100+ days; sow early enough to mature before fall frost.",
    },
    companions: [
      "cucumber",
      "sweet-corn",
      "zucchini",
      "winter-squash",
      "pumpkin",
      "watermelon",
      "cantaloupe",
      "lettuce",
    ],
    antagonists: ["potato", "pole-bean"],
    companionNotes:
      "Cucumbers and melons can climb sunflower stalks, and corn and sunflowers share a similar footprint and attract pollinators and predators. Sunflowers release allelopathic compounds from roots and decaying residue that can stunt neighbors, notably potatoes and pole beans, so keep them apart and do not grow beans on the pole of a sunflower.",
    attracts: ["honeybees", "native-bees", "bumblebees", "butterflies", "ladybugs", "hoverflies"],
    pests: ["birds", "squirrels", "deer", "aphids"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes:
        "Non-toxic to cats, dogs and horses per the ASPCA. Seeds are edible (shells can be a choking or intestinal obstruction risk in pets and birds if eaten in quantity).",
    },
    allergens: ["asteraceae", "pollen"],
    allergyNotes:
      "Daisy-family plant that may cross-react with ragweed allergy. Conventional varieties shed a lot of pollen; choose pollenless cultivars ('ProCut', 'Sunrich') for cutting and indoor use.",
    requiredTools: [],
    helpfulTools: ["stakes", "bird-netting", "mulch"],
    goals: ["pollinators", "ornamental", "kid-friendly", "edible", "low-maintenance"],
    careTips: [
      "Plant on the north side of the garden so tall stalks do not shade sun-loving vegetables.",
      "Stake giants (8 ft and up) or plant them against a fence or south wall; wind-rocked stalks can snap.",
      "Protect seedlings from rabbits, cutworms and birds with collars or a row cover until 12 in tall.",
      "Leave a few spent heads standing in fall for wild birds, or cover them with netting to save seed.",
      "Chop spent stalks before composting and keep sunflower debris out of potato and bean beds; decaying residue can inhibit seed germination.",
    ],
    harvestTips:
      "Harvest seeds when the head droops, the back turns brown and florets in the center have dried (about 30–45 days after bloom). Cut the head with 12 in of stem, protect with a paper or mesh bag against birds, and hang to dry 2–3 weeks before rubbing out the seeds. For cut flowers, harvest buds just beginning to open in the early morning.",
  },

  // ---------------------------------------------------------------------------
  // ZINNIA
  // ---------------------------------------------------------------------------
  {
    id: "zinnia",
    name: "Zinnia",
    scientificName: "Zinnia elegans",
    emoji: "🌸",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Heat-loving, fast-blooming annual with bold, long-lasting flowers in nearly every color but blue. A top cut flower and one of the best butterfly and pollinator plants for the summer vegetable garden.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun"],
    water: "moderate",
    wateringIntervalDays: 5,
    waterNotes:
      "Water deeply at the base about once or twice a week; wet foliage promotes powdery mildew, the main zinnia disease. Established plants tolerate heat and short dry periods.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 70, idealMaxF: 85, maxF: 100 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["loam", "sandy", "clay"],
      phMin: 5.5,
      phMax: 7.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["compost", "bloom-booster"],
      frequencyDays: 30,
      notes:
        "Work compost into the bed at planting. A monthly low-nitrogen bloom booster boosts flower production in poor soil or containers.",
    },
    container: {
      suitable: true,
      minGallons: 2,
      notes: "Compact types such as 'Profusion', 'Zahara' and 'Thumbelina' thrive in 8–12 in pots.",
    },
    spacingInches: 10,
    heightInches: { min: 8, max: 48 },
    daysToMaturity: { min: 60, max: 75 },
    planting: {
      directSowWeeks: 1,
      startIndoorsWeeks: -4,
      transplantWeeks: 1,
      notes:
        "Zinnias dislike cold soil and root disturbance: direct sow 1/4 in deep 1–2 weeks after last frost when soil is above 65–70°F, or start indoors in peat or biodegradable pots only 4 weeks ahead. Succession sow every 2–3 weeks into midsummer.",
    },
    companions: [
      "tomato",
      "cherry-tomato",
      "cucumber",
      "zucchini",
      "winter-squash",
      "pumpkin",
      "bush-bean",
      "bell-pepper",
      "sweet-corn",
    ],
    antagonists: [],
    companionNotes:
      "Zinnias are summer-long magnets for bees, butterflies and hummingbirds, improving pollination of squash, cucumbers and beans, and their open flowers supply nectar to predatory wasps and hoverflies. Plant them in ends of rows or as an interplanted border; they are not a pest repellent.",
    attracts: ["butterflies", "hummingbirds", "honeybees", "native-bees", "bumblebees", "hoverflies"],
    pests: ["japanese-beetles", "aphids", "spider-mites", "slugs-snails"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Listed as non-toxic to cats, dogs and horses by the ASPCA.",
    },
    allergens: ["asteraceae"],
    allergyNotes:
      "Daisy-family plant; may trigger people with ragweed or chrysanthemum allergies. Pollen load is modest compared to wind-pollinated plants.",
    requiredTools: [],
    helpfulTools: ["mulch", "stakes"],
    goals: ["pollinators", "ornamental", "kid-friendly", "low-maintenance"],
    careTips: [
      "Pinch the tip of seedlings at about 6 in to create bushier plants with more stems.",
      "Space plants at least 10–12 in apart with good airflow to limit powdery mildew; choose resistant types such as 'Profusion' and 'Zahara'.",
      "Water at the soil line in the morning, not overhead.",
      "Deadhead or cut flowers regularly; the more you cut, the more they bloom.",
      "Hand-pick Japanese beetles into soapy water in the morning.",
    ],
    harvestTips:
      "Cut stems in the morning when the flower is fully open and the stem is stiff (the 'wiggle test': hold the stem just under the bloom and shake gently; a straight stem means ready). Cut just above a pair of leaves, strip lower leaves and place in cool water; vase life is 5–7 days.",
  },

  // ---------------------------------------------------------------------------
  // COSMOS
  // ---------------------------------------------------------------------------
  {
    id: "cosmos",
    name: "Cosmos",
    scientificName: "Cosmos bipinnatus",
    emoji: "🌼",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Airy annual with ferny foliage and daisy-like pink, white and magenta flowers on tall stems. Easy from seed, drought tolerant and a magnet for bees, butterflies and beneficial insects.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun"],
    water: "low",
    wateringIntervalDays: 7,
    waterNotes:
      "Water seedlings regularly until established, then deeply about once a week or less. Overwatering in rich soil gives floppy foliage and fewer flowers.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 60, idealMaxF: 80, maxF: 95 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["sandy", "loam", "clay"],
      phMin: 6.0,
      phMax: 8.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["none"],
      frequencyDays: 0,
      notes: "Does best in lean soil; fertilizer and rich soil make tall plants with weak stems and few flowers.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes: "Choose dwarf types ('Sonata', 'Sensation Dwarf') for containers; tall types are better in the ground.",
    },
    spacingInches: 12,
    heightInches: { min: 18, max: 60 },
    daysToMaturity: { min: 60, max: 90 },
    planting: {
      directSowWeeks: 0,
      startIndoorsWeeks: -4,
      transplantWeeks: 1,
      notes:
        "Direct sow seeds 1/4 in deep after last frost; they germinate in 7–10 days when soil is 65–70°F. Starting indoors is fine but transplant young. Sow again at midsummer for fall bloom. Self-sows freely.",
    },
    companions: [
      "tomato",
      "cherry-tomato",
      "bell-pepper",
      "cucumber",
      "zucchini",
      "winter-squash",
      "bush-bean",
      "cabbage",
    ],
    antagonists: [],
    companionNotes:
      "Cosmos draws parasitic wasps, lacewings and hoverflies whose larvae prey on aphids, and its tall airy stems support pollination of squash and beans without shading short crops too much. Plant them at bed edges or between rows.",
    attracts: ["butterflies", "native-bees", "honeybees", "bumblebees", "hoverflies", "lacewings", "parasitic-wasps"],
    pests: ["aphids", "japanese-beetles"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Not listed as toxic to cats, dogs or horses. Large ingestions of any garden plant may upset the stomach.",
    },
    allergens: ["asteraceae"],
    allergyNotes: "Daisy-family plant; may cross-react with ragweed allergy.",
    requiredTools: [],
    helpfulTools: ["stakes", "mulch"],
    goals: ["pollinators", "ornamental", "low-maintenance", "kid-friendly"],
    careTips: [
      "Pinch seedlings at 12 in to make shorter, bushier plants that need less staking.",
      "Support tall cultivars with stakes or by growing through a grid of twine; wind breaks the brittle stems.",
      "Deadhead often; stop fertilizing if plants produce more leaves than flowers.",
      "Cut plants back by a third in late summer if they get leggy to encourage fall rebloom.",
    ],
    harvestTips:
      "Cut stems when flowers are just opening, in the morning; strip leaves below the water line. Vase life is 4–6 days.",
  },

  // ---------------------------------------------------------------------------
  // CALENDULA
  // ---------------------------------------------------------------------------
  {
    id: "calendula",
    name: "Calendula",
    scientificName: "Calendula officinalis",
    emoji: "🌼",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Cool-season pot marigold with cheerful orange and yellow edible petals that bloom from spring until hot weather and again in fall. A classic cottage-garden, kitchen-garden and herbal skincare plant.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: true,
    sun: ["full-sun", "partial-sun"],
    water: "moderate",
    wateringIntervalDays: 5,
    waterNotes:
      "Keep soil evenly moist but not wet; water at the base to avoid powdery mildew. Plants wilt and decline in summer heat regardless of watering.",
    humidity: "average",
    temperature: { minF: 25, idealMinF: 50, idealMaxF: 70, maxF: 85 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["loam", "sandy", "clay"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["compost"],
      frequencyDays: 0,
      notes: "Grows well in average soil. Excess nitrogen reduces flowering; in containers feed monthly with a weak balanced fertilizer.",
    },
    container: {
      suitable: true,
      minGallons: 2,
      notes: "Does well in 8–12 in pots and window boxes in cool weather.",
    },
    spacingInches: 10,
    heightInches: { min: 12, max: 24 },
    daysToMaturity: { min: 45, max: 60 },
    planting: {
      directSowWeeks: -4,
      startIndoorsWeeks: -6,
      transplantWeeks: -2,
      fallSowWeeksBeforeFirstFrost: 8,
      notes:
        "Frost-tolerant to about 25°F: sow outdoors as early as 4 weeks before last frost, or in late summer for fall bloom. In zones 8–11 sow in fall for winter and spring flowers. Seeds need darkness to germinate; cover 1/4 in deep.",
    },
    companions: [
      "tomato",
      "asparagus",
      "lettuce",
      "cabbage",
      "broccoli",
      "kale",
      "cucumber",
      "bush-bean",
      "strawberry",
    ],
    antagonists: [],
    companionNotes:
      "Calendula attracts hoverflies, lacewings and ladybugs that feed on aphids, and its sticky resinous foliage traps some pests. It is a favorite trap crop for aphids near tomatoes and brassicas, and edges of asparagus and cabbage beds work well.",
    attracts: ["hoverflies", "lacewings", "ladybugs", "honeybees", "native-bees", "butterflies", "parasitic-wasps"],
    pests: ["aphids", "whiteflies", "slugs-snails", "thrips"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes:
        "Listed as non-toxic to cats, dogs and horses by the ASPCA. Petals are edible and used in teas and salves. Rarely causes skin reactions.",
    },
    allergens: ["asteraceae"],
    allergyNotes:
      "Daisy-family plant; avoid eating or using on skin if you are allergic to ragweed, chrysanthemums or marigolds.",
    requiredTools: [],
    helpfulTools: ["mulch", "pruners"],
    goals: ["edible", "pollinators", "ornamental", "kid-friendly", "low-maintenance"],
    careTips: [
      "Deadhead spent blooms (or harvest petals) regularly; plants stop flowering if allowed to set seed.",
      "Provide afternoon shade where summers are hot, and expect plants to fade by midsummer; cut back and renew in fall.",
      "Check for aphids and powdery mildew in humid weather; space plants for good airflow.",
      "Let a few flowers go to seed to self-sow, or collect the curved seeds.",
    ],
    harvestTips:
      "Pick flowers fully open on a dry morning. Use fresh petals in salads, rice and baking as a saffron substitute, or dry the whole heads on a screen in shade for tea, infused oil and salves.",
  },

  // ---------------------------------------------------------------------------
  // BORAGE
  // ---------------------------------------------------------------------------
  {
    id: "borage",
    name: "Borage",
    scientificName: "Borago officinalis",
    emoji: "💙",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Bristly, easy annual herb with star-shaped sky-blue flowers that taste faintly of cucumber. One of the best bee plants for the vegetable garden and a self-sowing companion for tomatoes, strawberries and squash.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: true,
    sun: ["full-sun", "partial-sun"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water deeply once a week; borage tolerates moderate drought thanks to its taproot, but will wilt dramatically in dry spells. Soggy soil causes root rot.",
    humidity: "average",
    temperature: { minF: 25, idealMinF: 60, idealMaxF: 75, maxF: 90 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["loam", "sandy", "clay"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["compost"],
      frequencyDays: 0,
      notes: "Thrives in average to poor soil; no feeding needed.",
    },
    container: {
      suitable: true,
      minGallons: 5,
      notes: "Deep taproot and 2–3 ft size need a deep pot of 5+ gallons; best in the ground.",
    },
    spacingInches: 18,
    heightInches: { min: 18, max: 36 },
    daysToMaturity: { min: 50, max: 60 },
    planting: {
      directSowWeeks: -2,
      notes:
        "Direct sow 1/2 in deep from 2 weeks before last frost through early summer; taproot makes transplanting difficult. Light frost is tolerated. Self-sows prolifically, so remove seedlings you do not want.",
    },
    companions: [
      "tomato",
      "cherry-tomato",
      "strawberry",
      "zucchini",
      "winter-squash",
      "pumpkin",
      "cucumber",
      "cabbage",
    ],
    antagonists: [],
    companionNotes:
      "Borage is a favorite of honeybees and bumblebees, boosting pollination and fruit set of strawberries, squash and tomatoes. Folk wisdom says it deters tomato hornworms and cabbage worms, and it adds trace minerals to compost, but the evidence for pest deterrence is mainly anecdotal. It can sprawl; keep it at the edge of beds.",
    attracts: ["honeybees", "bumblebees", "native-bees", "hoverflies", "parasitic-wasps"],
    pests: ["aphids", "slugs-snails"],
    repels: ["tomato-hornworm", "cabbage-worms"],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "moderate",
      bird: "mild",
      rabbit: "mild",
      human: "mild",
      notes:
        "Leaves and stems contain small amounts of pyrrolizidine alkaloids that can damage the liver with heavy or prolonged ingestion, mainly a concern for horses and livestock. Occasional use of flowers is generally considered safe; avoid regular consumption of leaves, and avoid in pregnancy or liver disease.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Coarse bristly hairs on leaves and stems can prick and irritate skin; wear gloves when handling.",
    requiredTools: [],
    helpfulTools: ["garden-gloves", "stakes"],
    goals: ["pollinators", "edible", "ornamental", "low-maintenance"],
    careTips: [
      "Sow where it will grow; the long taproot resents transplanting.",
      "Wear gloves when pruning or pulling plants; the bristles irritate skin.",
      "Deadhead if you do not want self-sown seedlings everywhere, or let a few go to seed for next year.",
      "Plants flop in rain and wind; provide a little support in exposed sites.",
    ],
    harvestTips:
      "Pick open blue flowers in the morning; use fresh in salads, drinks or frozen in ice cubes (the bristly calyx should be removed or the flower popped out). Young leaves taste like cucumber but are fuzzy; eat only occasionally because of the alkaloids.",
  },

  // ---------------------------------------------------------------------------
  // PETUNIA
  // ---------------------------------------------------------------------------
  {
    id: "petunia",
    name: "Petunia",
    scientificName: "Petunia × hybrida",
    emoji: "🌸",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Prolific bloomer for baskets, borders and containers, in every color from spring to frost. Spreading 'Wave' and 'Supertunia' types fill hanging baskets with minimal deadheading.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun"],
    water: "moderate",
    wateringIntervalDays: 3,
    waterNotes:
      "Water when the top inch is dry. In-ground plants need water about every 3–4 days in mild weather, while hanging baskets and containers may need daily watering in summer heat. Water the soil, not the flowers.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 65, idealMaxF: 85, maxF: 95 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["loam", "potting-mix", "sandy"],
      phMin: 5.5,
      phMax: 6.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "heavy",
      recommended: ["bloom-booster", "slow-release-granules"],
      frequencyDays: 14,
      notes:
        "Petunias, especially vigorous spreading types, are heavy feeders: mix slow-release granules into the soil at planting, then feed with a diluted liquid bloom booster every 1–2 weeks.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "One plant per 10–12 in basket or pot for spreading types; use fresh potting mix with good drainage.",
    },
    spacingInches: 12,
    heightInches: { min: 6, max: 18 },
    daysToMaturity: { min: 70, max: 90 },
    planting: {
      startIndoorsWeeks: -10,
      transplantWeeks: 1,
      notes:
        "Seed is dust-fine and needs light: surface-sow on moist mix at 75–80°F and do not cover; most gardeners buy transplants. Plant out 1–2 weeks after last frost. Pinch back leggy plants in midsummer.",
    },
    companions: ["bush-bean", "pole-bean", "geranium", "sweet-alyssum", "salvia", "snapdragon"],
    antagonists: [],
    companionNotes:
      "Petunias are in the nightshade family (Solanaceae), so they share pests such as tomato hornworm and tobacco budworm with tomatoes; many gardeners nonetheless plant them near beans and brassicas. Their sticky foliage is said to repel some insects, but that is largely anecdotal. Pair with flowers that like the same sun and feeding.",
    attracts: ["hummingbirds", "bumblebees", "butterflies", "moths", "honeybees"],
    pests: ["aphids", "whiteflies", "thrips", "slugs-snails", "tomato-hornworm"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Listed as non-toxic to cats, dogs and horses by the ASPCA.",
    },
    allergens: ["strong-fragrance", "contact-dermatitis"],
    allergyNotes:
      "Some varieties are strongly scented in the evening, which can bother fragrance-sensitive people. Sticky glandular hairs can cause mild skin irritation.",
    requiredTools: [],
    helpfulTools: ["hanging-basket", "containers", "pruners"],
    goals: ["ornamental", "pollinators", "fragrance", "kid-friendly"],
    careTips: [
      "Deadhead spent flowers on grandiflora and multiflora types; Wave and Supertunia types are self-cleaning.",
      "Trim leggy plants back by one-third in midsummer, then feed, for a flush of fall bloom.",
      "Yellowing between green veins signals iron chlorosis in alkaline soil or water: use a chelated iron supplement or acid fertilizer.",
      "Keep rain off the flowers where possible; petals turn to mush and invite botrytis in wet weather.",
      "Inspect weekly for budworms: tiny holes in buds and frass are the giveaway; hand-pick or treat with Bt.",
    ],
  },

  // ---------------------------------------------------------------------------
  // ECHINACEA
  // ---------------------------------------------------------------------------
  {
    id: "echinacea",
    name: "Purple Coneflower",
    scientificName: "Echinacea purpurea",
    emoji: "🌸",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "Tough North American native perennial with large pink-purple daisy flowers and a prominent orange cone. Very drought tolerant once established, a staple for pollinators and, in winter, goldfinches.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun"],
    water: "low",
    wateringIntervalDays: 7,
    waterNotes:
      "Water new plants weekly for the first season. Established coneflowers are drought tolerant and need water only during extended dry spells. Soggy winter soil causes crown rot.",
    humidity: "average",
    temperature: { minF: -40, idealMinF: 65, idealMaxF: 85, maxF: 100 },
    hardinessZones: { min: 3, max: 9 },
    soil: {
      types: ["loam", "sandy", "clay"],
      phMin: 6.0,
      phMax: 7.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["compost"],
      frequencyDays: 0,
      notes: "Rich soil or fertilizer makes floppy plants and shortens their life. A light top-dressing of compost in spring is enough.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes: "Compact cultivars (e.g. 'PowWow Wild Berry', 'Kismet') do well in 3–5 gallon pots; overwinter containers protected in zones 3–6.",
    },
    spacingInches: 18,
    heightInches: { min: 24, max: 48 },
    planting: {
      startIndoorsWeeks: -10,
      transplantWeeks: 0,
      fallSowWeeksBeforeFirstFrost: 6,
      notes:
        "Plant nursery divisions or container plants in spring or early fall. From seed, cold-stratify 4 weeks (or sow outdoors in fall for natural stratification); plants started early indoors may flower the first summer, otherwise expect bloom in year 2. Divide every 3–4 years in spring or fall.",
    },
    companions: [
      "black-eyed-susan",
      "salvia",
      "milkweed",
      "lavender",
      "sage",
      "thyme",
      "oregano",
      "chives",
    ],
    antagonists: [],
    companionNotes:
      "Pairs naturally with other prairie and sun-loving, drought-tolerant plants (black-eyed Susan, salvia, milkweed, herbs). Avoid planting beside plants that need rich, constantly moist soil.",
    attracts: ["butterflies", "native-bees", "bumblebees", "honeybees", "hoverflies", "ladybugs"],
    pests: ["japanese-beetles", "rabbits", "deer", "aphids"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Listed as non-toxic to cats, dogs and horses by the ASPCA. Not intended for ingestion without guidance; herbal use should follow medical advice.",
    },
    allergens: ["asteraceae"],
    allergyNotes:
      "Daisy-family plant; people allergic to ragweed, chrysanthemums or marigolds may react, and ingestion of echinacea products can trigger severe reactions in some atopic people.",
    requiredTools: [],
    helpfulTools: ["pruners", "mulch"],
    goals: ["pollinators", "ornamental", "low-maintenance"],
    careTips: [
      "Plant in full sun with good drainage; heavy wet clay is the main killer.",
      "Deadhead early flowers to prolong bloom, but leave late-season seed heads standing for goldfinches and winter interest.",
      "Divide crowded clumps every 3–4 years in spring or early fall.",
      "Mulch lightly in cold zones, and do not mulch the crown too heavily or it may rot.",
      "Newer double and exotic-colored hybrids are less cold-hardy and shorter-lived than the straight species; give them extra care.",
    ],
  },

  // ---------------------------------------------------------------------------
  // BLACK-EYED SUSAN
  // ---------------------------------------------------------------------------
  {
    id: "black-eyed-susan",
    name: "Black-Eyed Susan",
    scientificName: "Rudbeckia hirta",
    emoji: "🌼",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "Native wildflower with golden daisy-like petals and a dark brown center that blooms from midsummer to fall. Short-lived perennial (often biennial) that reseeds readily and thrives in poor soil and heat.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun"],
    water: "low",
    wateringIntervalDays: 7,
    waterNotes:
      "Keep seedlings evenly moist until established; thereafter plants tolerate heat and drought well, needing water only in prolonged dry spells.",
    humidity: "average",
    temperature: { minF: -40, idealMinF: 65, idealMaxF: 85, maxF: 100 },
    hardinessZones: { min: 3, max: 9 },
    soil: {
      types: ["loam", "sandy", "clay"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["compost"],
      frequencyDays: 0,
      notes: "Does best in average soil; fertilizer produces tall, floppy plants.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes: "Compact selections work in 3–5 gallon pots; water more often than in the ground.",
    },
    spacingInches: 15,
    heightInches: { min: 12, max: 36 },
    daysToMaturity: { min: 90, max: 120 },
    planting: {
      startIndoorsWeeks: -8,
      directSowWeeks: -2,
      transplantWeeks: 0,
      fallSowWeeksBeforeFirstFrost: 6,
      notes:
        "Surface-sow seed (needs light) in early spring or fall; seeds started 8 weeks before last frost often bloom the first summer. R. hirta is a biennial or short-lived perennial that usually persists by self-seeding; for a longer-lived clump choose Rudbeckia fulgida 'Goldsturm' (zones 3–9).",
    },
    companions: ["echinacea", "milkweed", "salvia", "sunflower", "zinnia", "cosmos", "lavender", "oregano"],
    antagonists: [],
    companionNotes:
      "A natural partner for coneflowers, milkweed and ornamental grasses in meadow-style plantings. Provides season-long nectar and later seeds for finches.",
    attracts: ["butterflies", "native-bees", "bumblebees", "honeybees", "hoverflies", "parasitic-wasps"],
    pests: ["aphids", "rabbits", "japanese-beetles", "slugs-snails"],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "non-toxic",
      rabbit: "non-toxic",
      human: "mild",
      notes:
        "Generally low toxicity, though not formally rated by the ASPCA; eating leaves or flowers may cause mild vomiting or drooling. Do not eat.",
    },
    allergens: ["asteraceae", "contact-dermatitis"],
    allergyNotes:
      "Daisy-family plant that may cross-react with ragweed allergy; the bristly foliage can irritate skin.",
    requiredTools: [],
    helpfulTools: ["pruners", "mulch"],
    goals: ["pollinators", "ornamental", "low-maintenance"],
    careTips: [
      "Allow some seed heads to remain to reseed; remove unwanted seedlings in spring.",
      "Cut plants back by a third in early summer for shorter, sturdier stems if they flop.",
      "Space for good airflow and avoid overhead watering; powdery mildew and leaf spots are common in humid summers.",
      "Divide perennial clumps every 3 years in early spring.",
    ],
  },

  // ---------------------------------------------------------------------------
  // SWEET ALYSSUM
  // ---------------------------------------------------------------------------
  {
    id: "sweet-alyssum",
    name: "Sweet Alyssum",
    scientificName: "Lobularia maritima",
    emoji: "🤍",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Low, spreading carpet of tiny honey-scented white, pink or purple flowers that blooms from spring until hot weather and again in fall. Insectary favorite for tiny beneficial insects.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun", "partial-shade"],
    water: "moderate",
    wateringIntervalDays: 4,
    waterNotes:
      "Keep soil evenly moist during establishment and bloom; shallow roots dry out quickly, especially in containers. Plants stall in summer heat; shear and water to encourage a fall flush.",
    humidity: "average",
    temperature: { minF: 25, idealMinF: 50, idealMaxF: 75, maxF: 85 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["loam", "sandy"],
      phMin: 6.0,
      phMax: 7.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["compost"],
      frequencyDays: 0,
      notes: "Light feeder: compost at planting; shear and feed lightly with a balanced liquid fertilizer after the midsummer trim.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "Ideal at the edge of containers, hanging baskets and window boxes, where it trails.",
    },
    spacingInches: 8,
    heightInches: { min: 3, max: 8 },
    daysToMaturity: { min: 40, max: 60 },
    planting: {
      directSowWeeks: -4,
      startIndoorsWeeks: -6,
      transplantWeeks: -2,
      notes:
        "Surface-sow seed (it needs light) as early as 4 weeks before last frost; seedlings tolerate light frost. Sow again in midsummer for fall bloom, or in fall in zones 8–11 for winter flowers.",
    },
    companions: [
      "lettuce",
      "kale",
      "cabbage",
      "broccoli",
      "cauliflower",
      "brussels-sprouts",
      "swiss-chard",
      "potato",
      "strawberry",
      "tomato",
      "bell-pepper",
    ],
    antagonists: [],
    companionNotes:
      "Tiny flowers feed hoverflies, parasitic wasps and lacewings, whose larvae and young control aphids on lettuce, brassicas, potatoes and peppers. Plant a ground-cover edge under taller crops or as a border beside beds; research shows sweet alyssum strips boost natural aphid control in lettuce.",
    attracts: ["hoverflies", "parasitic-wasps", "lacewings", "ladybugs", "honeybees", "native-bees"],
    pests: ["flea-beetles", "slugs-snails", "cabbage-worms"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Listed as non-toxic to cats, dogs and horses by the ASPCA.",
    },
    allergens: ["strong-fragrance"],
    allergyNotes: "Honey-like scent is strong when planted in masses and can bother fragrance-sensitive or asthmatic people.",
    requiredTools: [],
    helpfulTools: ["hanging-basket", "pruners"],
    goals: ["pollinators", "fragrance", "ornamental", "low-maintenance", "kid-friendly"],
    careTips: [
      "Shear plants back by half when blooming slows in midsummer; they rebound quickly with water and a light feeding.",
      "Mass along edges of lettuce, kale and brassica beds to bring beneficial insects close to crops.",
      "Choose heat-tolerant selections ('Snow Crystals', 'Clear Crystals') in warm climates.",
      "Self-sows in cool gardens; remove stray seedlings if not wanted.",
    ],
  },

  // ---------------------------------------------------------------------------
  // SNAPDRAGON
  // ---------------------------------------------------------------------------
  {
    id: "snapdragon",
    name: "Snapdragon",
    scientificName: "Antirrhinum majus",
    emoji: "🌷",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Cool-season spikes of dragon-mouth flowers in nearly every color except true blue. A tender perennial grown as a hardy annual that thrives in spring and fall, favored by bumblebees and cut-flower growers.",
    difficulty: "moderate",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun"],
    water: "moderate",
    wateringIntervalDays: 5,
    waterNotes:
      "Keep soil evenly moist but never soggy, and water at the base: wet foliage encourages rust and gray mold. Mulch to conserve moisture.",
    humidity: "average",
    temperature: { minF: 25, idealMinF: 55, idealMaxF: 75, maxF: 85 },
    hardinessZones: { min: 3, max: 10 },
    soil: {
      types: ["loam", "sandy"],
      phMin: 6.2,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["bloom-booster", "compost"],
      frequencyDays: 28,
      notes: "Work compost into the bed at planting; feed monthly with a balanced or bloom-booster fertilizer through the bloom period.",
    },
    container: {
      suitable: true,
      minGallons: 2,
      notes: "Dwarf and intermediate types (6–24 in) do well in 8–12 in pots.",
    },
    spacingInches: 9,
    heightInches: { min: 6, max: 48 },
    daysToMaturity: { min: 85, max: 110 },
    planting: {
      startIndoorsWeeks: -10,
      transplantWeeks: -4,
      fallSowWeeksBeforeFirstFrost: 8,
      notes:
        "Seeds are tiny and need light: surface-sow 8–10 weeks before last frost and keep at 65–70°F. Transplant 2–4 weeks before last frost; seedlings tolerate light frost. In zones 7–10 sow in fall for winter and spring flowers. Plants usually fade in midsummer heat.",
    },
    companions: ["sweet-alyssum", "calendula", "petunia", "geranium", "dahlia"],
    antagonists: [],
    companionNotes:
      "Snapdragon flowers are large enough that only strong bees (bumblebees, carpenter bees) can open them. Pair with other cool-season annuals; keep away from spots where rust problems have been seen.",
    attracts: ["bumblebees", "hummingbirds", "native-bees", "honeybees"],
    pests: ["aphids", "slugs-snails", "spider-mites"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Listed as non-toxic to cats, dogs and horses by the ASPCA.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["stakes", "mulch", "pruners"],
    goals: ["ornamental", "pollinators", "kid-friendly"],
    careTips: [
      "Pinch seedlings when they have 3–4 pairs of leaves to produce side shoots and more flower spikes.",
      "Stake tall types or plant them in groups and support with netting.",
      "Snapdragon rust (orange pustules under leaves) is the main disease: choose rust-resistant series, rotate planting sites, and avoid overhead watering.",
      "Cut faded spikes to just above a side shoot for a second flush; cooler fall weather brings a final bloom.",
    ],
    harvestTips:
      "Cut stems when the lowest third of the flowers have opened. Strip lower leaves and place in cool water; stems last 7–10 days and bend upward if laid on their side.",
  },

  // ---------------------------------------------------------------------------
  // GERANIUM (Pelargonium)
  // ---------------------------------------------------------------------------
  {
    id: "geranium",
    name: "Zonal Geranium",
    scientificName: "Pelargonium × hortorum",
    emoji: "🌺",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "Classic sun-loving container and bedding plant (Pelargonium, not the hardy 'cranesbill' Geranium) with domed flower clusters and often zoned, aromatic leaves. A tender perennial that overwinters indoors as a bright windowsill plant in cold climates.",
    difficulty: "easy",
    environments: ["outdoor", "indoor"],
    edible: false,
    sun: ["full-sun", "partial-sun"],
    indoorLight: ["bright-indirect", "direct"],
    water: "low",
    wateringIntervalDays: 5,
    waterNotes:
      "Let the top inch or two of soil dry between waterings, then water thoroughly; overwatering is the main cause of failure. Indoors in winter water every 10–14 days. Avoid wetting foliage.",
    humidity: "average",
    temperature: { minF: 35, idealMinF: 60, idealMaxF: 75, maxF: 90 },
    hardinessZones: { min: 10, max: 11 },
    soil: {
      types: ["loam", "potting-mix"],
      phMin: 6.0,
      phMax: 6.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["bloom-booster", "slow-release-granules"],
      frequencyDays: 14,
      notes: "Feed every 2 weeks with a diluted bloom-booster or fertilizer high in phosphorus during active growth; withhold feeding in winter.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "Thrives in 8–10 in pots; roots like being slightly pot-bound. Use pots with drainage holes and fast-draining mix.",
    },
    spacingInches: 10,
    heightInches: { min: 12, max: 24 },
    planting: {
      transplantWeeks: 1,
      startIndoorsWeeks: -14,
      notes:
        "Perennial only in zones 10–11; elsewhere grown as an annual or overwintered indoors. Plant out 1–2 weeks after last frost. Seed-grown types need 12–16 weeks indoors; stem cuttings root easily in late summer for winter plants. Bring pots inside before fall frost.",
    },
    companions: ["cabbage", "broccoli", "cauliflower", "kale", "brussels-sprouts", "rose", "grape", "petunia"],
    antagonists: [],
    companionNotes:
      "Folklore holds that geraniums deter cabbage worms and other pests when planted near brassicas and grapes, and Japanese beetles that eat the petals are temporarily paralyzed (they usually recover, so geraniums are not an effective trap). Evidence for pest control is limited; grow them mainly for color. Plants overwinter indoors beside other bright-window plants.",
    attracts: ["bumblebees", "honeybees", "butterflies"],
    pests: ["aphids", "whiteflies", "spider-mites", "japanese-beetles"],
    repels: ["deer", "cabbage-worms"],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "non-toxic",
      rabbit: "mild",
      human: "mild",
      notes:
        "Pelargonium (geranium) leaves and flowers contain essential oils and tannins: vomiting, anorexia, depression and skin irritation in pets; the ASPCA lists it as toxic to dogs, cats and horses (mild).",
    },
    allergens: ["contact-dermatitis", "strong-fragrance"],
    allergyNotes: "Aromatic oils in foliage can cause contact dermatitis in sensitive people, and the strong scent may bother some.",
    requiredTools: [],
    helpfulTools: ["containers", "pruners", "moisture-meter", "grow-light"],
    goals: ["ornamental", "pollinators", "fragrance", "low-maintenance"],
    careTips: [
      "Deadhead spent flower clusters at the base of their stalks to prolong bloom.",
      "Pinch tips in spring to encourage bushy growth.",
      "Overwinter indoors in a sunny window (or at 45–50°F in a dim spot with minimal water), after cutting back by about half.",
      "Take 4-inch tip cuttings in late summer, let the cut end callus for a day, and root them in moist perlite and peat.",
      "Treat with insecticidal soap for whiteflies and aphids, and remove leaves with edema (corky bumps) caused by overwatering.",
    ],
  },

  // ---------------------------------------------------------------------------
  // DAHLIA
  // ---------------------------------------------------------------------------
  {
    id: "dahlia",
    name: "Dahlia",
    scientificName: "Dahlia × hybrida",
    emoji: "🌺",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "Tuberous summer bloomer with flowers from 2 in pompons to dinner-plate giants in every color but blue. Blooms from midsummer to frost and is a top choice for cut flowers.",
    difficulty: "moderate",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun"],
    water: "moderate",
    wateringIntervalDays: 3,
    waterNotes:
      "Do not water newly planted tubers until sprouts show (rot risk), then water deeply 2–3 times a week once plants are 6+ in tall and weekly in mild weather. Keep soil evenly moist during bloom, and avoid wetting the foliage.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 8, max: 11 },
    soil: {
      types: ["loam", "sandy"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["bloom-booster", "compost"],
      frequencyDays: 21,
      notes: "Start feeding when plants are about 12 in tall, using a low-nitrogen, high-phosphorus and potassium fertilizer (e.g. 5-10-10) every 3 weeks. Too much nitrogen gives big plants and few blooms.",
    },
    container: {
      suitable: true,
      minGallons: 5,
      notes: "Dwarf and border dahlias do well in 5–10 gallon pots; tall dinnerplate types need 15+ gallons and staking.",
    },
    spacingInches: 24,
    heightInches: { min: 12, max: 72 },
    daysToMaturity: { min: 70, max: 120 },
    planting: {
      startIndoorsWeeks: -4,
      transplantWeeks: 1,
      notes:
        "Plant tubers 4–6 in deep with eyes up after last frost when soil is above 60°F, 1–2 weeks after the average last frost date. Pot tubers indoors 4 weeks earlier for a head start. Tubers are hardy outdoors only in zones 8–11: in zone 7 and colder, dig tubers after the first killing frost, dry, and store in a cool (40–50°F) frost-free spot in peat or vermiculite.",
    },
    companions: ["zinnia", "cosmos", "marigold", "sweet-alyssum", "salvia", "snapdragon"],
    antagonists: [],
    companionNotes:
      "Marigolds and sweet alyssum at the base help control some pests and attract beneficials; plant dahlias with other sun lovers that share their water needs. Avoid dense plantings, since airflow reduces mildew.",
    attracts: ["honeybees", "native-bees", "bumblebees", "butterflies", "hoverflies"],
    pests: ["slugs-snails", "earwigs", "aphids", "spider-mites", "deer", "thrips"],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "non-toxic",
      rabbit: "mild",
      human: "mild",
      notes: "Leaves, stems, flowers and tubers: mild stomach upset and skin irritation in pets (vomiting, diarrhea); the ASPCA lists dahlia as toxic to dogs, cats and horses. Tubers are edible but not recommended.",
    },
    allergens: ["asteraceae", "contact-dermatitis"],
    allergyNotes: "Daisy-family plant that may cross-react with ragweed allergy; sap can cause skin irritation. Double-flowered types produce little pollen.",
    requiredTools: ["stakes"],
    helpfulTools: ["pruners", "mulch", "garden-gloves"],
    goals: ["ornamental", "pollinators"],
    careTips: [
      "Install stakes when planting tubers, not after, to avoid spearing the tuber.",
      "Pinch the center shoot when plants have 3 sets of leaves to encourage branching and more flowers.",
      "Disbud for giant dinnerplate flowers by removing side buds, or leave all buds for more, smaller blooms.",
      "Set slug traps and check regularly in spring when shoots emerge.",
      "Cut stems regularly and deadhead; the more you cut, the more they bloom. In cold zones lift tubers after frost blackens the foliage and store them dry and cool.",
    ],
    harvestTips:
      "Cut stems in early morning when blooms are fully open (dahlias do not ripen after cutting). Cut long stems, immediately sear the cut end in hot water or dip in boiling water for 10 seconds, then condition in cool water for several hours. Vase life is 3–6 days.",
  },

  // ---------------------------------------------------------------------------
  // TULIP
  // ---------------------------------------------------------------------------
  {
    id: "tulip",
    name: "Tulip",
    scientificName: "Tulipa gesneriana (hybrids)",
    emoji: "🌷",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "Spring-blooming bulb in every color and form, planted in fall and bloomed April to May. Most hybrid tulips bloom best the first year and decline afterwards, while species and Darwin hybrids repeat better.",
    difficulty: "moderate",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun"],
    water: "low",
    wateringIntervalDays: 7,
    waterNotes:
      "Water after planting to settle bulbs in fall, then rely on rain (about 1 in a week) while shoots grow and flower. Stop watering after the foliage yellows and keep summer soil dry: wet summer soil rots bulbs.",
    humidity: "average",
    temperature: { minF: -40, idealMinF: 45, idealMaxF: 65, maxF: 75 },
    hardinessZones: { min: 3, max: 8 },
    soil: {
      types: ["loam", "sandy"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["bone-meal", "compost"],
      frequencyDays: 0,
      notes: "Mix bone meal or a bulb fertilizer into the planting hole in fall, or top-dress with compost as shoots emerge. Do not feed after bloom; do not use nitrogen-rich fertilizer.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes: "Plant bulbs shoulder-to-shoulder in 12 in pots, 6–8 in deep. Containers need protection in zones 3–6 so bulbs do not freeze solid; bulbs need 12–16 weeks of cold (below 45°F) to bloom.",
    },
    spacingInches: 5,
    heightInches: { min: 6, max: 28 },
    planting: {
      fallSowWeeksBeforeFirstFrost: 2,
      notes:
        "Plant bulbs in fall, pointed end up, 6–8 in deep (about 3 times the bulb height), when soil temperature is below 60°F and about 4–6 weeks before the ground freezes. That is usually October to November in zones 3–7 and December in zones 8 and warmer (where pre-chilled bulbs in the refrigerator for 8–12 weeks are treated as annuals). Set bulbs where soil drains well; foliage must die back naturally for the bulb to recharge.",
    },
    companions: ["daffodil", "foxglove", "sweet-alyssum"],
    antagonists: [],
    companionNotes:
      "Interplant with daffodils, which squirrels, deer and rodents avoid, to offer some protection. Cover bulbs with hardware cloth if squirrels dig them. Plant perennials or annuals over fading tulip foliage to hide the mess.",
    attracts: ["honeybees", "native-bees", "bumblebees"],
    pests: ["deer", "squirrels", "rabbits", "aphids"],
    repels: [],
    toxicity: {
      cat: "moderate",
      dog: "moderate",
      horse: "mild",
      bird: "mild",
      rabbit: "moderate",
      human: "moderate",
      notes:
        "All parts, bulbs most: tulipalin A and B can cause drooling, vomiting, diarrhea, depression and, with large amounts of bulb, irritation of the mouth and gastrointestinal tract and an increased heart rate in dogs and cats. Bulbs are often dug up by dogs and mistaken for onions by people.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes:
      "Handling bulbs can cause 'tulip fingers' (allergic contact dermatitis from tuliposide A) with cracked, itchy skin; wear gloves when planting.",
    requiredTools: [],
    helpfulTools: ["hand-trowel", "garden-gloves", "mulch"],
    goals: ["ornamental", "pollinators"],
    careTips: [
      "Plant in fall in well-drained soil; waterlogged soil rots bulbs. Plant bulbs 6–8 in deep to discourage squirrels and keep bulbs cool.",
      "Deadhead spent flowers but let the foliage yellow naturally (at least 6 weeks) to feed next year's bulb.",
      "In zones 7–8, treat hybrid tulips as annuals or chill bulbs in the refrigerator (away from ripening fruit, which releases ethylene) for 8–12 weeks before planting.",
      "Protect against deer and rabbits with repellents or plant 'species' tulips and daffodils, which are less palatable.",
      "Mulch lightly after the ground freezes to prevent frost heaving.",
    ],
    harvestTips:
      "For cut flowers, harvest when buds are fully colored but still closed. Cutting the whole stem weakens the bulb, so treat hybrid tulips as annuals if you cut heavily, or cut only the flower and leave the foliage. Vase life is 5–7 days, and stems keep growing after cutting.",
  },

  // ---------------------------------------------------------------------------
  // DAFFODIL
  // ---------------------------------------------------------------------------
  {
    id: "daffodil",
    name: "Daffodil",
    scientificName: "Narcissus pseudonarcissus (hybrids)",
    emoji: "🌼",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "Reliable spring bulb with trumpet-shaped yellow, white or bicolor flowers that naturalizes and returns for decades. Deer, rabbits, squirrels and voles avoid it because every part is bitter and toxic.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun", "partial-shade"],
    water: "low",
    wateringIntervalDays: 10,
    waterNotes:
      "Water bulbs in after planting, then rely on spring rains while shoots and flowers grow. Plants need about 1 in of water weekly during growth and bloom; once foliage yellows in early summer, keep the site dry.",
    humidity: "average",
    temperature: { minF: -40, idealMinF: 40, idealMaxF: 65, maxF: 80 },
    hardinessZones: { min: 3, max: 8 },
    soil: {
      types: ["loam", "sandy", "clay"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["bone-meal", "compost"],
      frequencyDays: 0,
      notes: "Mix bone meal or bulb fertilizer into the planting hole, or top-dress with a low-nitrogen fertilizer when shoots emerge in spring. Do not feed after bloom.",
    },
    container: {
      suitable: true,
      minGallons: 2,
      notes: "Plant in 8–12 in pots with drainage, 6 in deep and close together; protect from freezing solid in zones 3–6.",
    },
    spacingInches: 6,
    heightInches: { min: 6, max: 24 },
    planting: {
      fallSowWeeksBeforeFirstFrost: 4,
      notes:
        "Plant bulbs in fall, pointed side up, 6 in deep (three times the bulb's height) about 6 weeks before the ground freezes, usually September to November. Early planting helps roots develop; daffodils tolerate earlier planting than tulips. Leave foliage until it yellows (6+ weeks after bloom). Divide crowded clumps in early summer when foliage dies back.",
    },
    companions: ["tulip", "dwarf-apple", "hydrangea", "foxglove"],
    antagonists: [],
    companionNotes:
      "Daffodils protect neighboring bulbs, fruit trees and shrubs because rodents and deer avoid them. Plant them in drifts around tulips, under dwarf apples and between perennials, which hide the dying foliage. Cut daffodils exude sap that shortens the vase life of other flowers: condition them separately for 12–24 hours before mixing in a vase.",
    attracts: ["honeybees", "native-bees", "bumblebees"],
    pests: ["slugs-snails"],
    repels: ["deer", "rabbits", "squirrels"],
    toxicity: {
      cat: "severe",
      dog: "severe",
      horse: "moderate",
      bird: "moderate",
      rabbit: "moderate",
      human: "moderate",
      notes:
        "All parts, bulb most: lycorine and other alkaloids cause drooling, vomiting, diarrhea and abdominal pain; large ingestions (especially bulbs) can cause cardiac arrhythmias, low blood pressure, tremors and seizures in dogs and cats. Bulbs are mistaken for onions by people.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes:
      "Sap contains calcium oxalate crystals and alkaloids that cause 'daffodil itch' (a dry, cracked rash) in florists and gardeners; wear gloves when handling stems and bulbs.",
    requiredTools: [],
    helpfulTools: ["hand-trowel", "garden-gloves", "mulch"],
    goals: ["ornamental", "pollinators", "low-maintenance"],
    careTips: [
      "Plant in groups of 10 or more for impact; plant early in fall so roots have time to grow before frost.",
      "Leave foliage in place for 6 weeks or more after bloom; do not braid or tie it up, which reduces bulb recharge.",
      "Divide overcrowded clumps (fewer or smaller flowers) in early summer once leaves die back, replanting at once.",
      "Wear gloves when handling bulbs and cut stems, and keep bulbs well out of reach of pets and children.",
      "Mulch lightly in cold zones after the ground freezes.",
    ],
  },

  // ---------------------------------------------------------------------------
  // HYDRANGEA
  // ---------------------------------------------------------------------------
  {
    id: "hydrangea",
    name: "Bigleaf Hydrangea",
    scientificName: "Hydrangea macrophylla",
    emoji: "💠",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "Deciduous shrub with huge mophead or lacecap flowers from early summer into fall. Flower color changes with soil pH: blue in acidic soil, pink in alkaline. Panicle (H. paniculata, zones 3–8) and smooth (H. arborescens, zones 3–9) hydrangeas are hardier alternatives.",
    difficulty: "moderate",
    environments: ["outdoor"],
    edible: false,
    sun: ["partial-sun", "partial-shade"],
    water: "high",
    wateringIntervalDays: 3,
    waterNotes:
      "Hydrangea means 'water vessel': needs deep watering 2–3 times a week in summer, with soil kept consistently moist but well drained. Leaves wilt in afternoon heat even when soil is moist; check the soil before watering. Mulch to hold moisture.",
    humidity: "average",
    temperature: { minF: -20, idealMinF: 60, idealMaxF: 80, maxF: 95 },
    hardinessZones: { min: 5, max: 9 },
    soil: {
      types: ["loam", "silt"],
      phMin: 5.2,
      phMax: 6.5,
      drainage: "moist",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["acid-fertilizer", "compost", "slow-release-granules"],
      frequencyDays: 42,
      notes:
        "Feed in spring and again in early summer only; stop by midsummer so new growth can harden before frost. Soil pH controls color: pH 5.2–5.5 (with aluminum available) gives blue flowers, pH 6.0–6.2 pink, and in between purple. White hydrangeas do not change color.",
    },
    container: {
      suitable: true,
      minGallons: 10,
      notes: "Compact selections ('Endless Summer', 'Cityline') do well in large 10–15 gallon containers; water daily in summer and protect the pot from freezing.",
    },
    spacingInches: 48,
    heightInches: { min: 36, max: 72 },
    planting: {
      transplantWeeks: 0,
      notes:
        "Plant container-grown shrubs in spring after danger of frost, or in early fall, at the same depth they grew in the pot, in morning sun and afternoon shade. H. macrophylla blooms on old wood (last year's stems) in older cultivars: prune only right after flowering, avoid cutting in fall or winter. Reblooming types ('Endless Summer') also flower on new wood. Protect from late spring frost.",
    },
    companions: ["daffodil", "tulip", "foxglove"],
    antagonists: [],
    companionNotes:
      "Plant spring bulbs (daffodils, tulips) around the base to bloom before hydrangea leaves emerge, and shade-tolerant perennials beneath. Keep away from thirsty, shallow-rooted competitors such as large maples.",
    attracts: ["native-bees", "bumblebees", "butterflies"],
    pests: ["deer", "aphids", "spider-mites", "japanese-beetles", "scale-insects"],
    repels: [],
    toxicity: {
      cat: "moderate",
      dog: "moderate",
      horse: "moderate",
      bird: "mild",
      rabbit: "moderate",
      human: "mild",
      notes:
        "Leaves, flower buds and stems contain cyanogenic glycosides (hydrangin): vomiting, diarrhea and lethargy; large ingestions may lead to cyanide-type symptoms such as labored breathing. The ASPCA lists hydrangea as toxic to dogs, cats and horses.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Rarely causes skin allergy; mophead types produce little pollen.",
    requiredTools: [],
    helpfulTools: ["pruners", "mulch", "soil-test-kit", "soaker-hose"],
    goals: ["ornamental", "pollinators"],
    careTips: [
      "To make blue flowers, lower pH with aluminum sulfate or sulfur and use low-phosphorus fertilizer; for pink, add garden lime to raise pH to about 6.0–6.5. Changes take a season or more.",
      "Mulch with 2–3 in of shredded bark, and water at the base in the morning.",
      "Prune old wood bloomers (bigleaf) only just after bloom; pruning in fall, winter or spring removes the flower buds.",
      "In zones 5–6, mulch or wrap canes in fall to protect flower buds from winter dieback, and do not remove the covering until frost danger is over.",
      "If leaves scorch, move potted plants to afternoon shade; afternoon wilting that recovers at night is normal.",
    ],
  },

  // ---------------------------------------------------------------------------
  // ROSE
  // ---------------------------------------------------------------------------
  {
    id: "rose",
    name: "Rose",
    scientificName: "Rosa spp. (hybrid tea, floribunda, shrub)",
    emoji: "🌹",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "The classic fragrant flowering shrub, from repeat-blooming hybrid teas to tough landscape shrub roses. Modern disease-resistant shrub roses (Knock Out, Drift, Easy Elegance) are far lower maintenance than hybrid teas.",
    difficulty: "moderate",
    environments: ["outdoor"],
    edible: true,
    sun: ["full-sun", "partial-sun"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water deeply once a week (about 1–2 in total, including rain), more often in sandy soil or heat; shallow frequent watering encourages weak roots. Water at the base in the morning so foliage dries; wet leaves promote black spot and powdery mildew.",
    humidity: "average",
    temperature: { minF: -30, idealMinF: 60, idealMaxF: 80, maxF: 95 },
    hardinessZones: { min: 3, max: 10 },
    soil: {
      types: ["loam", "clay", "sandy"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "heavy",
      recommended: ["compost", "slow-release-granules", "bloom-booster"],
      frequencyDays: 35,
      notes:
        "Feed in early spring as new growth starts and then every 4–6 weeks until about 6–8 weeks before first fall frost. Top-dress with compost each spring and mulch to keep roots cool. Don't feed newly planted roses until the first flush of bloom.",
    },
    container: {
      suitable: true,
      minGallons: 10,
      notes: "Choose compact, miniature or patio roses; use pots at least 15–18 in wide and deep. Containers dry out quickly and need winter protection in zones 3–6.",
    },
    spacingInches: 36,
    heightInches: { min: 24, max: 96 },
    planting: {
      transplantWeeks: 0,
      notes:
        "Plant bare-root roses in early spring while dormant (soak roots 12–24 hours first), as soon as soil can be worked, or container roses any time after last frost until 6 weeks before fall frost. Plant with the bud union at or just above soil in zones 7 and warmer, and 1–2 in below in zones 6 and colder. Prune in late winter or early spring as buds swell; in cold zones, mound soil or mulch over the base in late fall.",
    },
    companions: [
      "garlic",
      "chives",
      "parsley",
      "lavender",
      "thyme",
      "catnip",
      "marigold",
      "sweet-alyssum",
      "geranium",
    ],
    antagonists: [],
    companionNotes:
      "Alliums (garlic, chives) planted around the base are said to reduce aphids and black spot, and their scent may mask the rose. Lavender, catnip and thyme attract pollinators and predators. Avoid crowding; roses need airflow and 6+ hours of sun.",
    attracts: ["honeybees", "native-bees", "bumblebees", "hoverflies", "ladybugs"],
    pests: ["aphids", "japanese-beetles", "spider-mites", "thrips", "deer", "rabbits"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes:
        "Petals, leaves and hips are non-toxic to pets per the ASPCA. Thorns are the main hazard (puncture wounds and infections). Petals and hips are edible for people if grown without pesticides.",
    },
    allergens: ["strong-fragrance"],
    allergyNotes:
      "Strongly scented roses can trigger headaches or asthma in fragrance-sensitive people; roses are insect-pollinated and rarely a hay-fever trigger. Thorns can cause cuts and infection; wear sturdy gloves.",
    requiredTools: ["pruners", "garden-gloves"],
    helpfulTools: ["mulch", "soaker-hose", "drip-irrigation", "spade"],
    goals: ["fragrance", "ornamental", "pollinators", "edible"],
    careTips: [
      "Plant in full sun with good air circulation; at least 6 hours of sun and morning light reduce disease.",
      "Prune out dead, damaged, crossing and diseased canes in late winter or early spring; cut at 45° just above an outward-facing bud.",
      "Deadhead repeat bloomers to a five-leaflet leaf; stop deadheading about 6 weeks before first frost to let hips form and plants harden.",
      "Rake up and discard diseased leaves (black spot, powdery mildew) and don't compost them; choose disease-resistant varieties.",
      "Blast aphids off with water, hand-pick Japanese beetles into soapy water, and apply neem or horticultural oil when needed, avoiding spraying open flowers visited by bees.",
    ],
    harvestTips:
      "Cut roses in the morning when buds are half open, just above a five-leaflet leaf. Hips (rich in vitamin C) are best after the first frost; remove seeds before making tea or jelly. Only eat petals from plants not sprayed with chemicals.",
  },

  // ---------------------------------------------------------------------------
  // MILKWEED
  // ---------------------------------------------------------------------------
  {
    id: "milkweed",
    name: "Butterfly Milkweed",
    scientificName: "Asclepias tuberosa",
    emoji: "🦋",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "Native perennial topped with flat clusters of brilliant orange flowers in summer, and the host plant of monarch caterpillars. Clump-forming, drought tolerant and well-behaved, unlike the aggressive common milkweed (A. syriaca) or the moisture-loving swamp milkweed (A. incarnata).",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun"],
    water: "low",
    wateringIntervalDays: 14,
    waterNotes:
      "Water new plants weekly until established, then rarely: the deep taproot makes it very drought tolerant. Soggy, poorly drained soil is the main cause of death.",
    humidity: "average",
    temperature: { minF: -40, idealMinF: 65, idealMaxF: 90, maxF: 105 },
    hardinessZones: { min: 3, max: 9 },
    soil: {
      types: ["sandy", "loam"],
      phMin: 6.0,
      phMax: 7.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["none"],
      frequencyDays: 0,
      notes: "Thrives in poor soil; fertilizer is not needed and promotes weak growth.",
    },
    container: {
      suitable: true,
      minGallons: 5,
      notes: "A deep taproot needs a pot at least 12 in deep; plants are best left in the ground.",
    },
    spacingInches: 18,
    heightInches: { min: 12, max: 36 },
    planting: {
      startIndoorsWeeks: -10,
      transplantWeeks: 0,
      notes:
        "Plant container-grown plants in spring after frost; the taproot resents moving, so choose the site carefully. Seeds need 4–6 weeks of cold-moist stratification (sow outdoors in late fall or refrigerate seed before sowing indoors). Plants emerge late in spring (May), so mark the location. Expect bloom in the second or third year from seed.",
    },
    companions: ["echinacea", "black-eyed-susan", "salvia", "zinnia", "cosmos", "lavender"],
    antagonists: [],
    companionNotes:
      "Pairs with other drought-tolerant, full-sun natives. Leave aphids on milkweed to ladybugs and lacewings and avoid insecticides entirely, since they harm monarch caterpillars.",
    attracts: [
      "butterflies",
      "honeybees",
      "native-bees",
      "bumblebees",
      "hummingbirds",
      "ladybugs",
      "hoverflies",
    ],
    pests: ["aphids", "rabbits"],
    repels: ["deer"],
    toxicity: {
      cat: "moderate",
      dog: "moderate",
      horse: "severe",
      bird: "moderate",
      rabbit: "moderate",
      human: "moderate",
      notes:
        "All parts contain cardiac glycosides (cardenolides): ingestion causes vomiting, weakness, irregular heart rate and, in horses, cattle and sheep, can be fatal at 0.1–1% of body weight. Pets rarely eat the bitter plant; keep livestock away. Milky sap (clear in A. tuberosa) irritates skin and eyes.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Sap can irritate skin and eyes; wear gloves when cutting and wash hands before touching your face. Fluff from seed pods is mildly irritating.",
    requiredTools: [],
    helpfulTools: ["garden-gloves", "pruners"],
    goals: ["pollinators", "ornamental", "low-maintenance"],
    careTips: [
      "Plant where it can stay: the long taproot makes transplanting a mature plant difficult.",
      "Mark the spot: shoots emerge late in spring, so don't mistake bare ground for dead plants.",
      "Never spray insecticides on or near milkweed; check leaf undersides for monarch eggs and tiny caterpillars.",
      "Leave seed pods to ripen for the birds or collect seed; remove pods to prevent spreading (A. tuberosa spreads little).",
      "Cut stems in late fall or leave standing for overwintering insects and cut back in early spring.",
    ],
  },

  // ---------------------------------------------------------------------------
  // FOXGLOVE
  // ---------------------------------------------------------------------------
  {
    id: "foxglove",
    name: "Foxglove",
    scientificName: "Digitalis purpurea",
    emoji: "🔔",
    category: "flower",
    lifeCycle: "biennial",
    description:
      "Stately biennial that forms a leafy rosette its first year and sends up tall spires of speckled, bell-shaped flowers in its second. Beloved by bumblebees and hummingbirds, but every part is poisonous.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["partial-sun", "partial-shade"],
    water: "moderate",
    wateringIntervalDays: 5,
    waterNotes:
      "Keep soil evenly moist but not soggy; do not let plants dry out in their first summer or during bloom. Water at the base to avoid leaf spot.",
    humidity: "average",
    temperature: { minF: -30, idealMinF: 55, idealMaxF: 75, maxF: 85 },
    hardinessZones: { min: 4, max: 9 },
    soil: {
      types: ["loam", "silt", "sandy"],
      phMin: 5.5,
      phMax: 7.0,
      drainage: "moist",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["compost"],
      frequencyDays: 0,
      notes: "Top-dress with compost in early spring; rich, humusy soil is enough.",
    },
    container: {
      suitable: true,
      minGallons: 5,
      notes: "Dwarf selections ('Camelot', 'Dalmatian') grow in deep containers; keep out of reach of children and pets.",
    },
    spacingInches: 18,
    heightInches: { min: 24, max: 60 },
    planting: {
      startIndoorsWeeks: -8,
      transplantWeeks: 0,
      directSowWeeks: 2,
      notes:
        "Biennial: sow seed (needs light, don't cover) in late spring through midsummer to flower the following year, or buy second-year plants. Seeds started indoors early in the year may flower in their first summer in some cultivars (e.g. 'Camelot'). Self-sows readily; let some seedpods ripen to keep a colony going.",
    },
    companions: ["hydrangea", "rose", "tulip", "daffodil", "salvia"],
    antagonists: [],
    companionNotes:
      "Beautiful with roses, hydrangeas and spring bulbs. Keep away from vegetable and herb beds: its basal rosette resembles comfrey and borage, and has been mistaken for them with fatal results.",
    attracts: ["bumblebees", "hummingbirds", "honeybees", "native-bees"],
    pests: ["aphids", "slugs-snails"],
    repels: ["deer", "rabbits"],
    toxicity: {
      cat: "severe",
      dog: "severe",
      horse: "severe",
      bird: "severe",
      rabbit: "severe",
      human: "severe",
      notes:
        "All parts (leaves, flowers, seeds, even water from the vase): cardiac glycosides (digitoxin, digoxin) cause vomiting, abdominal pain, slow or irregular heartbeat, tremors, visual disturbances (yellow-green halos), collapse and potentially death. Seek veterinary or Poison Control help (1-800-222-1222 in the US) immediately.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Contact with leaves can cause skin irritation (foxglove dermatitis) in sensitive people. Wash hands after handling.",
    requiredTools: [],
    helpfulTools: ["garden-gloves", "stakes", "mulch"],
    goals: ["ornamental", "pollinators"],
    careTips: [
      "Plant out of reach of children and pets, and well away from edible plants and herbs; label clearly.",
      "Wear gloves when handling, and wash hands afterwards. Never use foxglove for herbal remedies.",
      "Stake tall spires in windy sites; shelter in partial shade with some morning sun.",
      "Cut spent main spikes to encourage side-spikes and reduce unwanted self-sowing; leave some to set seed for next year.",
      "Mulch the first-year rosette lightly in cold winters, but don't smother the crown.",
    ],
  },

  // ---------------------------------------------------------------------------
  // ASIATIC LILY
  // ---------------------------------------------------------------------------
  {
    id: "asiatic-lily",
    name: "Asiatic Lily",
    scientificName: "Lilium (Asiatic hybrids)",
    emoji: "🌺",
    category: "flower",
    lifeCycle: "perennial",
    description:
      "Easy, early-summer bulb with upward-facing, brightly colored flowers on stiff stems. Unlike fragrant Oriental and trumpet lilies, most Asiatics have little or no scent. WARNING: true lilies are extremely dangerous to cats.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water deeply about once a week during growth and bloom (about 1 in per week including rain); mulch to keep roots cool and moist. Bulbs rot in waterlogged soil, so good drainage matters more than frequent watering.",
    humidity: "average",
    temperature: { minF: -40, idealMinF: 55, idealMaxF: 75, maxF: 85 },
    hardinessZones: { min: 3, max: 9 },
    soil: {
      types: ["loam", "sandy"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["bone-meal", "balanced-10-10-10", "compost"],
      frequencyDays: 30,
      notes: "Mix bone meal or compost into the planting hole. Apply a balanced fertilizer when shoots are 4–6 in tall and again after flowering; stop feeding by midsummer.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes: "Plant 3–5 bulbs in a 12 in pot at least 8 in deep; dwarf Asiatics ('Pixies') suit patio containers. Keep pets, especially cats, away.",
    },
    spacingInches: 10,
    heightInches: { min: 24, max: 48 },
    daysToMaturity: { min: 60, max: 90 },
    planting: {
      transplantWeeks: -2,
      fallSowWeeksBeforeFirstFrost: 4,
      notes:
        "Plant bulbs in spring (2–4 weeks before last frost) or fall (at least 4–6 weeks before the ground freezes), 6 in deep (about 3 times the bulb height) with the pointed side up. They bloom in June to July. Divide congested clumps every 3–4 years in fall. Shoots hit by late frost usually recover.",
    },
    companions: ["rose", "salvia", "geranium", "echinacea"],
    antagonists: [],
    companionNotes:
      "Lilies like cool roots and sunny heads: underplant with low annuals or perennials to shade the soil. Keep them out of beds and borders that cats visit, including plantings next to vegetable beds.",
    attracts: ["butterflies", "bumblebees", "native-bees"],
    pests: ["deer", "rabbits", "squirrels", "aphids"],
    repels: [],
    toxicity: {
      cat: "severe",
      dog: "mild",
      horse: "non-toxic",
      bird: "mild",
      rabbit: "mild",
      human: "mild",
      notes:
        "SEVERE FOR CATS: every part of Lilium (leaves, flowers, pollen, bulb and even the vase water) can cause acute kidney failure in cats, which can be fatal within 3–7 days; even a bite of a leaf or grooming pollen off fur can be lethal. Seek emergency veterinary care immediately. Dogs and horses may get mild stomach upset only; humans are generally unaffected apart from mild GI upset.",
    },
    allergens: ["pollen"],
    allergyNotes:
      "Heavy, staining pollen can trigger allergies; remove the anthers of cut flowers. Most Asiatic lilies have little scent, but Oriental and trumpet lilies are strongly fragrant and may trigger headaches or asthma.",
    requiredTools: [],
    helpfulTools: ["stakes", "mulch", "garden-gloves", "hand-trowel"],
    goals: ["ornamental", "pollinators"],
    careTips: [
      "Do not grow where cats can reach the plants, and never bring cut lilies into a home with cats.",
      "Plant 6 in deep in well-drained soil in full sun, with a shaded base; mulch to keep roots cool.",
      "Remove spent flowers but leave the stem and leaves to die back naturally to feed the bulb.",
      "Check for red lily leaf beetles (bright scarlet) in spring where they occur, and hand-pick them; protect bulbs from voles and squirrels with wire cages.",
      "Stake tall cultivars in windy sites; cut stems carefully and leave at least a third of the foliage on the plant.",
    ],
    harvestTips:
      "Cut stems when the first bud begins to show color and open, leaving at least one third of the foliage so the bulb can recharge. Remove the pollen-bearing anthers to prevent staining and reduce pollen. Never keep cut lilies in a home with cats.",
  },

  // ---------------------------------------------------------------------------
  // SALVIA (Salvia splendens - scarlet sage)
  // ---------------------------------------------------------------------------
  {
    id: "salvia",
    name: "Scarlet Sage",
    scientificName: "Salvia splendens",
    emoji: "🔴",
    category: "flower",
    lifeCycle: "annual",
    description:
      "Compact bedding annual (Salvia splendens) with dense spikes of scarlet, salmon, purple or white flowers that bloom from early summer until frost. A reliable hummingbird and butterfly plant; for a hardy perennial alternative (zones 4–8), consider Salvia nemorosa 'May Night'.",
    difficulty: "easy",
    environments: ["outdoor"],
    edible: false,
    sun: ["full-sun", "partial-sun"],
    water: "moderate",
    wateringIntervalDays: 4,
    waterNotes:
      "Water when the top inch of soil is dry; plants are moderately drought tolerant once established but bloom best with steady moisture. Water at the base, as wet foliage invites leaf spot.",
    humidity: "average",
    temperature: { minF: 32, idealMinF: 65, idealMaxF: 85, maxF: 95 },
    hardinessZones: { min: 2, max: 11 },
    soil: {
      types: ["loam", "sandy"],
      phMin: 6.0,
      phMax: 7.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["bloom-booster", "compost"],
      frequencyDays: 21,
      notes: "Mix compost into the bed at planting, then feed every 3 weeks with a diluted bloom-boosting fertilizer in containers or poor soil.",
    },
    container: {
      suitable: true,
      minGallons: 2,
      notes: "Great in 8–12 in pots and window boxes; plant in groups of three or more for impact.",
    },
    spacingInches: 10,
    heightInches: { min: 12, max: 36 },
    daysToMaturity: { min: 70, max: 100 },
    planting: {
      startIndoorsWeeks: -8,
      transplantWeeks: 1,
      notes:
        "Frost-tender: start seed (needs light) indoors 8–10 weeks before last frost at 70–75°F, and plant out 1–2 weeks after last frost when nights are above 50°F. Perennial only in zones 10–11. Most gardeners buy transplants.",
    },
    companions: ["marigold", "zinnia", "cosmos", "petunia", "sunflower", "dahlia"],
    antagonists: [],
    companionNotes:
      "Pair with other sun-loving, long-blooming annuals. The red blooms are especially attractive to hummingbirds; combine with zinnias and cosmos to feed pollinators around the vegetable garden.",
    attracts: ["hummingbirds", "butterflies", "honeybees", "bumblebees", "native-bees"],
    pests: ["aphids", "whiteflies", "spider-mites", "slugs-snails", "thrips"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Not listed as toxic to cats, dogs or horses by the ASPCA. Ornamental, not the culinary sage (Salvia officinalis).",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["mulch", "pruners"],
    goals: ["pollinators", "ornamental", "kid-friendly", "low-maintenance"],
    careTips: [
      "Pinch young plants once to encourage branching, and deadhead faded spikes to extend flowering.",
      "Plant in groups of 3–5 for a bold color block; red forms are most attractive to hummingbirds.",
      "Good airflow prevents powdery mildew and leaf spots; water from below.",
      "Cut back by one-third in midsummer if plants decline in heat, then feed lightly.",
    ],
  },
];

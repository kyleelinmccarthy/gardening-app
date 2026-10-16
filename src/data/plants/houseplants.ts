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

/**
 * Insoluble calcium oxalate (aroids: pothos, philodendron, monstera, peace lily,
 * ZZ plant, Chinese evergreen). Chewing releases needle-like raphides that cause
 * immediate oral pain and swelling. Painful but self-limiting and rarely
 * life-threatening, so "mild" (a warning, not a blocker; see safety.ts rubric).
 */
const OXALATE = {
  cat: "mild",
  dog: "mild",
  horse: "mild",
  bird: "mild",
  rabbit: "mild",
  human: "mild",
} as const satisfies Omit<Toxicity, "notes">;

export const HOUSEPLANTS: Plant[] = [
  // ---------------------------------------------------------------------------
  // POTHOS
  // ---------------------------------------------------------------------------
  {
    id: "pothos",
    name: "Pothos",
    scientificName: "Epipremnum aureum",
    emoji: "🌿",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Nearly indestructible trailing vine with heart-shaped, often golden-variegated leaves. Tolerates low light and irregular watering, making it the classic beginner houseplant.",
    difficulty: "easy",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["low", "medium", "bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water thoroughly when the top 1–2 in of mix is dry, then let excess drain. Wilting leaves signal thirst and recover quickly; yellow leaves and mushy stems signal overwatering. Water less in winter.",
    humidity: "average",
    temperature: { minF: 50, idealMinF: 65, idealMaxF: 85, maxF: 95 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix"],
      phMin: 6.0,
      phMax: 6.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 30,
      notes: "Feed monthly in spring and summer with a half-strength balanced houseplant fertilizer; skip in fall and winter.",
    },
    container: {
      suitable: true,
      minGallons: 0.5,
      notes: "Thrives in a 6–8 in pot or hanging basket with drainage holes. Repot every 1–2 years in spring or when roots circle.",
    },
    spacingInches: 12,
    heightInches: { min: 36, max: 120 },
    planting: {
      notes:
        "Repot in spring into a pot only 1–2 in larger. Easy to propagate: cut a stem below a node, root in water (2–4 weeks) or moist mix. Vines grow 6–10 ft indoors; trim or train on a trellis or moss pole.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Compatible with most foliage houseplants of similar light needs; no special grouping needs.",
    attracts: [],
    pests: ["mealybugs", "spider-mites", "scale-insects", "fungus-gnats"],
    repels: [],
    toxicity: {
      ...OXALATE,
      notes:
        "Leaves, stems and sap (insoluble calcium oxalate): oral pain and swelling, drooling, pawing at the mouth, vomiting and difficulty swallowing in cats and dogs. ASPCA lists as toxic to cats, dogs and horses. Usually self-limiting and rarely life-threatening; keep out of reach of pets and call a vet if swelling is severe.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Sap can irritate skin and eyes; wear gloves when pruning.",
    requiredTools: [],
    helpfulTools: ["moisture-meter", "hanging-basket", "trellis", "pruners"],
    goals: ["air-purifying", "low-maintenance", "ornamental"],
    careTips: [
      "Allow the top 1–2 in of mix to dry between waterings; empty the saucer after watering.",
      "Variegated types ('Golden', 'Marble Queen') lose color in very low light; give bright indirect light for best patterning.",
      "Trim leggy vines above a node to encourage fullness; use cuttings to propagate in water.",
      "Wipe leaves every month or two to remove dust.",
      "Keep out of reach of pets and small children. Pothos was in NASA's 1989 air-purification study, but real-world effects in homes are modest; do not rely on it to clean the air.",
    ],
  },

  // ---------------------------------------------------------------------------
  // SNAKE PLANT
  // ---------------------------------------------------------------------------
  {
    id: "snake-plant",
    name: "Snake Plant",
    scientificName: "Dracaena trifasciata (Sansevieria trifasciata)",
    emoji: "🪴",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Upright, sword-shaped, succulent-like leaves with banded or edged patterns. Tolerates neglect, low light and dry air; rot from overwatering is the main way to kill it.",
    difficulty: "easy",
    environments: ["indoor", "outdoor"],
    edible: false,
    sun: ["partial-sun", "partial-shade", "full-shade"],
    indoorLight: ["low", "medium", "bright-indirect", "direct"],
    water: "low",
    wateringIntervalDays: 18,
    waterNotes:
      "Water only when the mix is dry through the pot: about every 2–3 weeks in summer and every 4–6 weeks in winter. Water at the soil, not into the leaf rosette. Overwatering and cold, wet soil cause root and rhizome rot.",
    humidity: "low",
    temperature: { minF: 40, idealMinF: 65, idealMaxF: 85, maxF: 100 },
    hardinessZones: { min: 9, max: 11 },
    soil: {
      types: ["potting-mix", "cactus-mix", "sandy"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid", "cactus-fertilizer"],
      frequencyDays: 60,
      notes: "Feed once or twice during spring and summer with a diluted houseplant or cactus fertilizer; none in fall or winter.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "Prefers being slightly root-bound; use a heavy clay pot with drainage so tall plants do not tip. Thick roots can crack plastic pots.",
    },
    spacingInches: 12,
    heightInches: { min: 12, max: 48 },
    planting: {
      notes:
        "Repot only every 3–5 years in spring when roots fill or break the pot. In zones 9–11 can be grown outdoors in shade to partial sun, where it can spread by rhizomes; bring indoors before temperatures fall below 40°F. Propagate by dividing rhizomes or leaf sections (variegation is lost in leaf cuttings).",
    },
    companions: ["zz-plant"],
    antagonists: [],
    companionNotes: "Groups well with other drought-tolerant plants (ZZ plant, succulents) that dry out between waterings.",
    attracts: [],
    pests: ["mealybugs", "spider-mites", "thrips", "fungus-gnats"],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "mild",
      rabbit: "mild",
      human: "mild",
      notes:
        "Leaves (saponins): nausea, vomiting, diarrhea and drooling if chewed. ASPCA lists as toxic to cats and dogs. Usually mild; call a vet if vomiting persists.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["moisture-meter"],
    goals: ["low-maintenance", "air-purifying", "ornamental"],
    careTips: [
      "When in doubt, don't water: it stores water in its leaves and rhizomes and recovers from drought but not from soggy soil.",
      "Use a fast-draining mix with extra perlite or sand, and a pot with drainage holes.",
      "Wipe dust from leaves with a damp cloth every month or two; do not use leaf-shine products.",
      "Keep above 50°F indoors; cold drafts cause soft, collapsed leaves.",
      "Snake plant was in NASA's air-purification study, but effects in typical homes are small.",
    ],
  },

  // ---------------------------------------------------------------------------
  // SPIDER PLANT
  // ---------------------------------------------------------------------------
  {
    id: "spider-plant",
    name: "Spider Plant",
    scientificName: "Chlorophytum comosum",
    emoji: "🌱",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Arching green or green-and-white striped leaves with dangling baby 'spiderettes' that can be rooted for new plants. Fast-growing, forgiving and pet-safe.",
    difficulty: "easy",
    environments: ["indoor", "outdoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["medium", "bright-indirect", "low"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water when the top inch of mix is dry; thick, tuberous roots store water. Brown leaf tips often come from fluoride, chlorine or mineral salts in tap water, or from underwatering: use rainwater or distilled water, and flush the pot monthly.",
    humidity: "average",
    temperature: { minF: 40, idealMinF: 60, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 9, max: 11 },
    soil: {
      types: ["potting-mix"],
      phMin: 6.0,
      phMax: 7.2,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 30,
      notes: "Feed monthly in spring and summer with a half-strength houseplant fertilizer; too much fertilizer builds up salts and browns leaf tips.",
    },
    container: {
      suitable: true,
      minGallons: 0.5,
      notes: "Good in hanging baskets; roots are thick and fill pots quickly, so repot annually or divide when roots crowd.",
    },
    spacingInches: 18,
    heightInches: { min: 8, max: 24 },
    planting: {
      notes:
        "Repot in spring when thick roots push out of the pot. Propagate by planting spiderettes in small pots of moist mix while still attached to the mother plant, or by dividing the clump. Can be grown outdoors in zones 9–11 in shade.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Compatible with most foliage plants in similar light.",
    attracts: [],
    pests: ["spider-mites", "mealybugs", "scale-insects", "fungus-gnats"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes:
        "Non-toxic to cats, dogs and horses per the ASPCA. Cats may be drawn to nibble the leaves, which may cause mild stomach upset or vomiting from the fiber.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["hanging-basket", "moisture-meter"],
    goals: ["air-purifying", "low-maintenance", "kid-friendly", "ornamental"],
    careTips: [
      "Use rainwater, distilled or filtered water if the leaf tips keep browning.",
      "Plants bloom and make plantlets more freely when slightly root-bound and in bright indirect light.",
      "Cut the long stems with spiderettes and root them in water or soil for free new plants.",
      "Trim brown tips with clean scissors at an angle following the leaf shape.",
      "Spider plant was in NASA's air-purification study, but the real-world effect in homes is modest.",
    ],
  },

  // ---------------------------------------------------------------------------
  // PEACE LILY
  // ---------------------------------------------------------------------------
  {
    id: "peace-lily",
    name: "Peace Lily",
    scientificName: "Spathiphyllum wallisii",
    emoji: "🤍",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Glossy dark-green foliage with white spathes that rise on slender stalks, thriving in lower light. Dramatically droops when thirsty and rebounds within hours of watering.",
    difficulty: "easy",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["low", "medium", "bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Keep the mix evenly moist but not soggy; water when the top inch is dry or when leaves begin to droop slightly. Brown leaf tips come from dry air, fluoride or salts in tap water, or overwatering; use filtered or rain water if tips brown.",
    humidity: "average",
    temperature: { minF: 55, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix", "peat"],
      phMin: 5.8,
      phMax: 6.5,
      drainage: "moist",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 45,
      notes: "Feed every 6 weeks in spring and summer with a half-strength balanced fertilizer; heavy feeding burns the leaves.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "Use a pot 1–2 in wider than the root ball with drainage; repot every 1–2 years in spring. Divide crowded clumps when repotting.",
    },
    spacingInches: 24,
    heightInches: { min: 12, max: 36 },
    planting: {
      notes: "Repot in spring. White spathes come with bright (not direct) light; plants in low light stay green but rarely flower.",
    },
    companions: ["calathea", "boston-fern"],
    antagonists: [],
    companionNotes: "Group with calathea and Boston fern: they all appreciate higher humidity and evenly moist soil.",
    attracts: [],
    pests: ["spider-mites", "mealybugs", "scale-insects", "thrips", "fungus-gnats"],
    repels: [],
    toxicity: {
      ...OXALATE,
      notes:
        "Leaves, stems and flowers (insoluble calcium oxalate): oral irritation, drooling, vomiting and difficulty swallowing in cats and dogs. ASPCA lists as toxic to dogs, cats and horses. Not a true lily: it does not cause the kidney failure that true lilies (Lilium) cause in cats. Usually self-limiting; keep out of reach of pets.",
    },
    allergens: ["contact-dermatitis", "pollen"],
    allergyNotes: "Sap may irritate skin and the pollen has been linked to occupational allergy; wear gloves when repotting.",
    requiredTools: [],
    helpfulTools: ["moisture-meter", "pebble-tray", "humidifier"],
    goals: ["air-purifying", "ornamental", "low-maintenance"],
    careTips: [
      "Droop is a useful watering signal; water thoroughly when leaves sag slightly, but do not let it wilt repeatedly.",
      "Keep out of direct sun, which scorches leaves; a north or east window or bright interior spot is ideal.",
      "Remove faded flowers at the base of the stalk, and yellow leaves at the soil line.",
      "Wipe leaves every month or two to remove dust and improve light absorption.",
      "Peace lily was in NASA's air-purification study, but the effect in real homes is small.",
    ],
  },

  // ---------------------------------------------------------------------------
  // MONSTERA
  // ---------------------------------------------------------------------------
  {
    id: "monstera",
    name: "Monstera",
    scientificName: "Monstera deliciosa",
    emoji: "🍃",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Bold climbing aroid with huge, glossy, split and perforated leaves ('Swiss cheese plant'). Grows quickly indoors with a moss pole and bright indirect light.",
    difficulty: "easy",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["medium", "bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 8,
    waterNotes:
      "Water thoroughly when the top 2 in of mix is dry (about every 7–10 days in summer, less in winter). Overwatering causes yellow leaves and root rot; underwatering causes brown edges and drooping.",
    humidity: "average",
    temperature: { minF: 50, idealMinF: 65, idealMaxF: 85, maxF: 95 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix"],
      phMin: 5.5,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["houseplant-liquid", "slow-release-granules"],
      frequencyDays: 21,
      notes: "Feed every 3–4 weeks from spring to early fall with a balanced liquid fertilizer at half strength; none in winter.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes: "Start in a 6–8 in pot and move up one size every 1–2 years; mature specimens need 5–10 gallon pots and a sturdy moss pole.",
    },
    spacingInches: 36,
    heightInches: { min: 24, max: 96 },
    planting: {
      notes: "Repot every 1–2 years in spring in an airy mix (potting mix + bark + perlite). Provide a moss pole or trellis to encourage large, split leaves. Propagate stem cuttings with a node and aerial root in water.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Compatible with most large foliage plants in bright, indirect light.",
    attracts: [],
    pests: ["spider-mites", "mealybugs", "scale-insects", "thrips", "fungus-gnats"],
    repels: [],
    toxicity: {
      ...OXALATE,
      notes:
        "Leaves, stems and unripe fruit (insoluble calcium oxalate): mouth and tongue irritation, drooling, vomiting and difficulty swallowing in cats and dogs. ASPCA lists as toxic to dogs, cats and horses. Ripe fruit is edible only in the tropics; unripe fruit irritates. Usually self-limiting; keep out of reach of pets.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Sap can cause skin irritation; wear gloves when pruning or repotting.",
    requiredTools: [],
    helpfulTools: ["stakes", "moisture-meter", "grow-light", "pruners"],
    goals: ["ornamental"],
    careTips: [
      "Give bright indirect light; low light produces small leaves without splits (fenestrations).",
      "Support with a moss pole so aerial roots can attach, which produces larger leaves.",
      "Wipe leaves monthly to remove dust and check for spider mites, especially in dry winter air.",
      "Rotate regularly so growth is even; prune leggy stems back to a node in spring.",
      "Wear gloves when handling, and keep out of reach of pets and young children.",
    ],
  },

  // ---------------------------------------------------------------------------
  // ZZ PLANT
  // ---------------------------------------------------------------------------
  {
    id: "zz-plant",
    name: "ZZ Plant",
    scientificName: "Zamioculcas zamiifolia",
    emoji: "🪴",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Glossy, wand-like stems of oval leaves growing from water-storing rhizomes. Tolerates low light and weeks of neglect, making it perfect for offices and dim rooms.",
    difficulty: "easy",
    environments: ["indoor", "outdoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["low", "medium", "bright-indirect"],
    water: "low",
    wateringIntervalDays: 18,
    waterNotes:
      "Water only after the mix has dried out completely, about every 2–3 weeks in summer and every 4–6 weeks in winter. Rhizomes store water; overwatering causes yellow leaves and rhizome rot, the main cause of death.",
    humidity: "low",
    temperature: { minF: 40, idealMinF: 65, idealMaxF: 80, maxF: 95 },
    hardinessZones: { min: 9, max: 11 },
    soil: {
      types: ["potting-mix", "cactus-mix"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 60,
      notes: "Feed every 2 months in spring and summer with a half-strength houseplant fertilizer; no feeding in winter.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "Swollen rhizomes can crack plastic pots; use a heavy pot with drainage and repot only every 2–3 years in spring.",
    },
    spacingInches: 18,
    heightInches: { min: 18, max: 36 },
    planting: {
      notes: "Repot in spring only when rhizomes crowd the pot. Slow-growing; propagate by dividing rhizomes or rooting leaflets (takes many months). Grown outdoors in shade in zones 9–11; bring in before temperatures fall below 40°F.",
    },
    companions: ["snake-plant"],
    antagonists: [],
    companionNotes: "Groups well with other drought-tolerant plants like snake plant and succulents.",
    attracts: [],
    pests: ["mealybugs", "scale-insects", "spider-mites", "thrips", "fungus-gnats"],
    repels: [],
    toxicity: {
      ...OXALATE,
      notes:
        "All parts, especially sap (insoluble calcium oxalate): mouth irritation, drooling, vomiting and skin irritation in cats and dogs. ASPCA lists as toxic to dogs, cats and horses. Usually self-limiting; keep out of reach of pets and wash hands after handling.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Sap can irritate skin and eyes; wear gloves when dividing or repotting and wash hands after handling.",
    requiredTools: [],
    helpfulTools: ["moisture-meter"],
    goals: ["low-maintenance", "ornamental"],
    careTips: [
      "Underwater rather than overwater: wrinkled stems mean thirst; yellow, mushy stems mean rot.",
      "Tolerates low light but grows faster in bright indirect light; avoid direct sun, which scorches leaves.",
      "Wipe the glossy leaves with a damp cloth to keep them shiny.",
      "Wear gloves when repotting or dividing, and wash your hands afterward.",
    ],
  },

  // ---------------------------------------------------------------------------
  // FIDDLE-LEAF FIG
  // ---------------------------------------------------------------------------
  {
    id: "fiddle-leaf-fig",
    name: "Fiddle-Leaf Fig",
    scientificName: "Ficus lyrata",
    emoji: "🌳",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Statement tree with large, violin-shaped, veined leaves. Beautiful but fussy: it dislikes changes in light, drafts and overwatering, and drops leaves when stressed.",
    difficulty: "challenging",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water thoroughly when the top 2 in of mix is dry, then let it drain fully; do not let it sit in water. Be consistent: both soggy and bone-dry soil cause brown spots and leaf drop. Use room-temperature water.",
    humidity: "average",
    temperature: { minF: 55, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["houseplant-liquid", "slow-release-granules"],
      frequencyDays: 21,
      notes: "Feed every 3–4 weeks from spring to early fall with a balanced houseplant fertilizer (3-1-2 ratio is ideal); none in winter.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes: "Start in a 10 in pot; large specimens need 10–15 gallon pots with excellent drainage. Repot every 2 years in spring.",
    },
    spacingInches: 24,
    heightInches: { min: 36, max: 120 },
    planting: {
      notes: "Repot in spring into a pot 2 in larger. Place near a bright east or south window with a sheer curtain and do not move it often; it takes weeks to adjust to new light.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Keep away from drafts, heating vents and air conditioners.",
    attracts: [],
    pests: ["spider-mites", "scale-insects", "mealybugs", "thrips", "fungus-gnats"],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "mild",
      rabbit: "mild",
      human: "mild",
      notes:
        "Leaves and milky sap (insoluble calcium oxalate and the enzyme ficin): oral irritation, drooling, vomiting and skin irritation in pets; ASPCA lists as toxic to cats, dogs and horses. Sap can also irritate skin and eyes.",
    },
    allergens: ["latex", "contact-dermatitis"],
    allergyNotes: "Milky sap contains latex-like proteins that can trigger reactions in people with latex allergy; wear gloves and avoid sap contact when pruning.",
    requiredTools: [],
    helpfulTools: ["moisture-meter", "grow-light", "stakes", "pruners"],
    goals: ["ornamental"],
    careTips: [
      "Place in the brightest spot you have out of hot afternoon sun, and rotate a quarter turn weekly for even growth.",
      "Avoid moving it or changing the location: sudden changes cause leaf drop.",
      "Brown spots on lower leaves often mean root rot from overwatering; brown, crispy edges mean dryness or cold drafts.",
      "Wipe the large leaves monthly to remove dust.",
      "Prune or notch in spring to encourage branching, and wear gloves because the sap is irritating.",
    ],
  },

  // ---------------------------------------------------------------------------
  // RUBBER PLANT
  // ---------------------------------------------------------------------------
  {
    id: "rubber-plant",
    name: "Rubber Plant",
    scientificName: "Ficus elastica",
    emoji: "🌳",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Tough, upright tree with thick, glossy leaves in deep green, burgundy or variegated forms. Far easier than a fiddle-leaf fig and can reach ceiling height indoors.",
    difficulty: "easy",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["medium", "bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 8,
    waterNotes:
      "Water when the top 2 in of mix is dry, about every 7–10 days in summer and every 2–3 weeks in winter. Drooping lower leaves and leaf drop are signs of overwatering or too little light.",
    humidity: "average",
    temperature: { minF: 50, idealMinF: 65, idealMaxF: 80, maxF: 95 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "moderate",
      recommended: ["houseplant-liquid"],
      frequencyDays: 30,
      notes: "Feed monthly in spring and summer with a balanced houseplant fertilizer; none in winter.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes: "Start in a 8–10 in pot and repot every 2 years in spring; plants grow well when slightly root-bound.",
    },
    spacingInches: 24,
    heightInches: { min: 36, max: 120 },
    planting: {
      notes: "Repot in spring. Variegated ('Tineke', 'Ruby') and burgundy types need brighter light to keep their color. To branch, cut the top above a node in spring; air layering produces new plants.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Compatible with most foliage plants in bright indirect light.",
    attracts: [],
    pests: ["spider-mites", "scale-insects", "mealybugs", "thrips", "fungus-gnats"],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "mild",
      rabbit: "mild",
      human: "mild",
      notes:
        "Leaves and milky latex sap: oral irritation, drooling and vomiting in pets; ASPCA lists Ficus elastica as toxic to cats, dogs and horses. Sap irritates skin and eyes.",
    },
    allergens: ["latex", "contact-dermatitis"],
    allergyNotes: "White sap contains latex-like proteins and can trigger reactions in people with latex allergy; wear gloves and avoid sap contact when pruning.",
    requiredTools: [],
    helpfulTools: ["moisture-meter", "grow-light", "pruners"],
    goals: ["ornamental", "low-maintenance"],
    careTips: [
      "Wipe the broad leaves monthly with a damp cloth to keep them glossy and photosynthesizing well.",
      "Rotate regularly so the plant grows evenly toward the light; stake tall plants if they lean.",
      "Prune in spring to control height and encourage branching; wear gloves to avoid sap.",
      "Lower leaf drop is normal as it ages; sudden mass leaf drop means a draft, overwatering or a recent move.",
    ],
  },

  // ---------------------------------------------------------------------------
  // BOSTON FERN
  // ---------------------------------------------------------------------------
  {
    id: "boston-fern",
    name: "Boston Fern",
    scientificName: "Nephrolepis exaltata",
    emoji: "🌿",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Lush, arching fronds that look best in a hanging basket or on a pedestal. Thrives in cool, humid conditions but sheds leaves quickly in dry, heated air.",
    difficulty: "moderate",
    environments: ["indoor", "outdoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["bright-indirect", "medium"],
    water: "high",
    wateringIntervalDays: 3,
    waterNotes:
      "Keep the mix evenly moist (never soggy and never fully dry): check every 2–3 days and water when the surface just begins to dry. Dry-out causes fronds to brown and drop; soggy soil causes root rot.",
    humidity: "high",
    temperature: { minF: 40, idealMinF: 60, idealMaxF: 75, maxF: 85 },
    hardinessZones: { min: 9, max: 11 },
    soil: {
      types: ["potting-mix", "peat"],
      phMin: 5.0,
      phMax: 6.5,
      drainage: "moist",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 30,
      notes: "Feed monthly in spring through early fall with a half-strength balanced fertilizer; no feeding in winter.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "Hanging baskets suit the arching fronds; use a peat-based mix with perlite and a pot with drainage. Repot every 1–2 years in spring.",
    },
    spacingInches: 24,
    heightInches: { min: 12, max: 36 },
    planting: {
      notes: "Repot or divide in spring. Outdoors in zones 9–11 grows in shade; protect from frost. Cut back dead fronds to the base at any time.",
    },
    companions: ["calathea", "peace-lily"],
    antagonists: [],
    companionNotes: "Group with calathea and peace lily to raise local humidity; keep away from heating vents.",
    attracts: [],
    pests: ["scale-insects", "mealybugs", "spider-mites", "fungus-gnats", "whiteflies"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Non-toxic to cats, dogs and horses per the ASPCA. Cats may chew the dangling fronds, which can cause minor stomach upset.",
    },
    allergens: ["mold-spores"],
    allergyNotes: "Constantly moist potting mix can grow mold; fern spores may bother people with spore sensitivities. Let the surface dry between waterings and remove dead fronds.",
    requiredTools: [],
    helpfulTools: ["humidifier", "pebble-tray", "spray-bottle", "hanging-basket", "moisture-meter"],
    goals: ["ornamental", "air-purifying", "kid-friendly"],
    careTips: [
      "Raise humidity above 50% with a humidifier or by grouping plants; a pebble tray helps a little. Avoid heating vents.",
      "Provide bright indirect light; direct sun scorches fronds.",
      "Shake outdoors or shower occasionally to remove dust and drop old fronds; trim browned fronds at the base.",
      "Brown crispy fronds usually mean dry soil or air; yellow fronds mean overwatering or cold.",
      "Boston fern ranked well in NASA's formaldehyde removal tests, but real-world effects in homes are small.",
    ],
  },

  // ---------------------------------------------------------------------------
  // CALATHEA
  // ---------------------------------------------------------------------------
  {
    id: "calathea",
    name: "Calathea",
    scientificName: "Goeppertia spp. (syn. Calathea; e.g. G. orbifolia, G. makoyana, G. roseopicta)",
    emoji: "🍃",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Showy foliage plants with bold striped, feathered or purple-backed leaves that fold up at night (prayer-plant family). Beautiful but fussy about humidity and water quality.",
    difficulty: "challenging",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["medium", "bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 5,
    waterNotes:
      "Keep the mix evenly moist (not soggy): water every 4–5 days when the top inch is dry, and less in winter. Use distilled, rain or filtered water: fluoride, chlorine and salts cause brown, crispy leaf edges.",
    humidity: "high",
    temperature: { minF: 55, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix", "peat"],
      phMin: 5.5,
      phMax: 6.5,
      drainage: "moist",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 30,
      notes: "Feed monthly in spring and summer with a quarter- to half-strength houseplant fertilizer; salts burn leaf edges. None in winter.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "Use a peat-based, well-aerated mix in a pot with drainage; divide and repot every 2 years in spring.",
    },
    spacingInches: 18,
    heightInches: { min: 12, max: 30 },
    planting: {
      notes: "Repot or divide in spring. Keep above 60°F and away from drafts. Leaf movement (rising at night, lowering by day) is normal.",
    },
    companions: ["boston-fern", "peace-lily"],
    antagonists: [],
    companionNotes: "Group with Boston fern and peace lily to share humidity; bathrooms and kitchens with bright indirect light suit them.",
    attracts: [],
    pests: ["spider-mites", "thrips", "mealybugs", "fungus-gnats"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Non-toxic to cats, dogs and horses per the ASPCA.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["humidifier", "pebble-tray", "moisture-meter", "spray-bottle"],
    goals: ["ornamental", "kid-friendly"],
    careTips: [
      "Aim for 50–60% humidity: use a humidifier near the plant, since misting gives only brief relief.",
      "Use distilled or rain water; crispy brown edges are usually from low humidity or tap-water minerals.",
      "Avoid direct sun, which fades patterns and burns leaves; medium to bright indirect light is best.",
      "Check leaf undersides weekly for spider mites, which thrive in dry air.",
      "Never let the mix dry out completely, and never let it sit in water.",
    ],
  },

  // ---------------------------------------------------------------------------
  // HEARTLEAF PHILODENDRON
  // ---------------------------------------------------------------------------
  {
    id: "heartleaf-philodendron",
    name: "Heartleaf Philodendron",
    scientificName: "Philodendron hederaceum",
    emoji: "💚",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Easy trailing or climbing vine with soft, heart-shaped, deep-green leaves. Similar to pothos but with thinner, velvety leaves and a cooler tolerance of lower light.",
    difficulty: "easy",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["low", "medium", "bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water when the top 1–2 in of mix is dry; let excess drain. Yellow leaves signal overwatering; browning edges or drooping signal underwatering. Reduce watering in winter.",
    humidity: "average",
    temperature: { minF: 55, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix"],
      phMin: 5.5,
      phMax: 6.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 30,
      notes: "Feed monthly in spring and summer with a half-strength balanced houseplant fertilizer; none in winter.",
    },
    container: {
      suitable: true,
      minGallons: 0.5,
      notes: "Does well in hanging baskets and shelf pots of 6–8 in with drainage; repot every 2 years in spring.",
    },
    spacingInches: 12,
    heightInches: { min: 36, max: 120 },
    planting: {
      notes: "Repot in spring. Propagate stem cuttings with at least one node in water or moist mix. Train on a moss pole for larger leaves or let it trail.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Compatible with most foliage plants in similar light.",
    attracts: [],
    pests: ["spider-mites", "mealybugs", "scale-insects", "aphids", "fungus-gnats"],
    repels: [],
    toxicity: {
      ...OXALATE,
      notes:
        "Leaves, stems and sap (insoluble calcium oxalate): oral pain, drooling, vomiting and difficulty swallowing in cats and dogs. ASPCA lists philodendron as toxic to cats, dogs and horses. Usually self-limiting and rarely life-threatening; keep out of reach of pets.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Sap can cause skin irritation; wear gloves when pruning.",
    requiredTools: [],
    helpfulTools: ["hanging-basket", "trellis", "moisture-meter", "pruners"],
    goals: ["low-maintenance", "ornamental", "air-purifying"],
    careTips: [
      "Give medium to bright indirect light for fuller growth; leaves yellow in too much direct sun.",
      "Pinch or trim vine tips above a node to encourage bushy growth.",
      "Keep above 55°F and out of cold drafts.",
      "Wipe leaves to remove dust and check for pests such as spider mites.",
      "Keep out of reach of pets and young children.",
    ],
  },

  // ---------------------------------------------------------------------------
  // ENGLISH IVY
  // ---------------------------------------------------------------------------
  {
    id: "english-ivy",
    name: "English Ivy",
    scientificName: "Hedera helix",
    emoji: "🍃",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Evergreen clinging vine with lobed leaves in many variegated forms, good for hanging baskets and topiary forms indoors. Outdoors it is hardy to zone 4 but is a seriously invasive plant in many regions.",
    difficulty: "moderate",
    environments: ["indoor", "outdoor"],
    edible: false,
    sun: ["partial-sun", "partial-shade", "full-shade"],
    indoorLight: ["medium", "bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Keep the mix lightly moist; water when the top inch is dry. Dry air and drought cause spider mites and crispy leaves, while soggy soil causes root rot. Outdoors, water weekly until established.",
    humidity: "average",
    temperature: { minF: -20, idealMinF: 50, idealMaxF: 70, maxF: 85 },
    hardinessZones: { min: 4, max: 9 },
    soil: {
      types: ["potting-mix", "loam"],
      phMin: 6.0,
      phMax: 7.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 30,
      notes: "Feed monthly in spring and summer with a half-strength balanced fertilizer; none in winter.",
    },
    container: {
      suitable: true,
      minGallons: 0.5,
      notes: "Suits hanging baskets and trellis pots of 6–8 in; trim to shape. Keep cool (50–70°F).",
    },
    spacingInches: 12,
    heightInches: { min: 6, max: 360 },
    planting: {
      notes:
        "Prefers cool rooms; hot, dry heated air invites spider mites. Outdoors in zones 4–9, but English ivy is invasive in the Pacific Northwest, Southeast, mid-Atlantic and other regions: confine it to containers or choose a native groundcover. Root stem cuttings in water or moist mix in spring.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Outdoors it can smother neighboring plants and climb trees; keep it contained.",
    attracts: [],
    pests: ["spider-mites", "scale-insects", "mealybugs", "aphids", "whiteflies"],
    repels: [],
    toxicity: {
      cat: "moderate",
      dog: "moderate",
      horse: "moderate",
      bird: "moderate",
      rabbit: "moderate",
      human: "moderate",
      notes:
        "Leaves and berries (triterpenoid saponins; falcarinol in sap): vomiting, drooling, abdominal pain, diarrhea and skin irritation. ASPCA lists as toxic to dogs, cats and horses. Berries are more toxic than leaves; keep away from pets and children.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Sap contains falcarinol, which can cause allergic contact dermatitis; wear gloves and long sleeves when pruning.",
    requiredTools: [],
    helpfulTools: ["hanging-basket", "trellis", "pruners", "garden-gloves", "humidifier"],
    goals: ["ornamental"],
    careTips: [
      "Provide bright indirect light and cool temperatures (50–70°F); avoid hot, dry rooms, which cause spider mites.",
      "Rinse leaves in the shower occasionally and check the undersides for tiny webbing.",
      "Trim long stems to keep it full; wear gloves because the sap irritates skin.",
      "Don't plant outdoors where English ivy is invasive; keep it in pots and never dispose of clippings in natural areas.",
      "Keep out of reach of pets and children.",
    ],
  },

  // ---------------------------------------------------------------------------
  // CHINESE EVERGREEN
  // ---------------------------------------------------------------------------
  {
    id: "chinese-evergreen",
    name: "Chinese Evergreen",
    scientificName: "Aglaonema commutatum",
    emoji: "🌿",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Low, bushy foliage plant with silver-, pink- or red-patterned leaves. One of the most tolerant plants for low light and dry homes.",
    difficulty: "easy",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["low", "medium", "bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 8,
    waterNotes:
      "Water when the top 1–2 in of mix is dry (about every 7–10 days in summer, less in winter). Overwatering and cold water cause root rot and yellow leaves; drooping means thirst.",
    humidity: "average",
    temperature: { minF: 55, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix"],
      phMin: 5.6,
      phMax: 6.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 45,
      notes: "Feed every 6 weeks in spring and summer with a half-strength houseplant fertilizer; none in winter.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "Slow-growing; repot every 2–3 years in spring into a pot only slightly larger.",
    },
    spacingInches: 18,
    heightInches: { min: 12, max: 36 },
    planting: {
      notes: "Repot in spring. Dark-green types tolerate the lowest light; pink and red cultivars need brighter indirect light to keep color. Keep above 60°F and away from drafts.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Compatible with other low-light foliage plants.",
    attracts: [],
    pests: ["mealybugs", "spider-mites", "scale-insects", "thrips", "fungus-gnats"],
    repels: [],
    toxicity: {
      ...OXALATE,
      notes:
        "Leaves, stems and red berries (insoluble calcium oxalate): oral irritation, drooling, vomiting and difficulty swallowing in cats and dogs. ASPCA lists as toxic to cats, dogs and horses. Sap may irritate skin. Usually self-limiting; keep out of reach of pets.",
    },
    allergens: ["contact-dermatitis"],
    allergyNotes: "Sap can cause skin irritation; wear gloves when handling.",
    requiredTools: [],
    helpfulTools: ["moisture-meter", "thermometer"],
    goals: ["low-maintenance", "ornamental"],
    careTips: [
      "Tolerates low light but colored cultivars need medium to bright indirect light to keep their patterns.",
      "Let the mix dry slightly between waterings and keep it away from cold drafts below 55°F.",
      "Wipe leaves with a damp cloth to remove dust.",
      "Remove flowers (spathes) if you want to keep energy for the leaves; red berries are especially toxic to pets.",
    ],
  },

  // ---------------------------------------------------------------------------
  // PARLOR PALM
  // ---------------------------------------------------------------------------
  {
    id: "parlor-palm",
    name: "Parlor Palm",
    scientificName: "Chamaedorea elegans",
    emoji: "🌴",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Compact, slow-growing palm with graceful arching fronds, a classic Victorian parlor plant. Tolerates low light and is safe for pets.",
    difficulty: "easy",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["low", "medium", "bright-indirect"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water when the top inch of mix is dry; keep lightly moist in spring and summer and reduce in winter. Brown frond tips come from dry air, salts or overwatering; use filtered water if possible.",
    humidity: "average",
    temperature: { minF: 50, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix"],
      phMin: 6.0,
      phMax: 7.0,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 60,
      notes: "Feed every 2 months in spring and summer with a half-strength fertilizer; palms are sensitive to fertilizer salts. None in winter.",
    },
    container: {
      suitable: true,
      minGallons: 1,
      notes: "Likes being slightly root-bound; repot only every 2–3 years in spring.",
    },
    spacingInches: 18,
    heightInches: { min: 24, max: 72 },
    planting: {
      notes: "Repot in spring only when roots crowd the pot. Slow-growing (a few inches per year). Do not cut the growing tip or remove green fronds; trim only brown fronds.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Compatible with other low-light foliage plants; keep away from drafts.",
    attracts: [],
    pests: ["spider-mites", "mealybugs", "scale-insects", "thrips"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Non-toxic to cats, dogs and horses per the ASPCA.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["moisture-meter", "humidifier", "spray-bottle"],
    goals: ["low-maintenance", "ornamental", "kid-friendly"],
    careTips: [
      "Avoid direct sun, which scorches fronds; bright indirect light gives the best growth.",
      "Brown tips mean dry air or fertilizer salts: flush the pot with water every few months.",
      "Check fronds for spider mites in dry heated air, and wipe them with a damp cloth.",
      "Trim only fully brown fronds at the base; never cut the green growing point.",
    ],
  },

  // ---------------------------------------------------------------------------
  // AFRICAN VIOLET
  // ---------------------------------------------------------------------------
  {
    id: "african-violet",
    name: "African Violet",
    scientificName: "Streptocarpus ionanthus (syn. Saintpaulia ionantha)",
    emoji: "💜",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Compact rosette of fuzzy leaves that blooms nearly year-round in purple, pink, blue or white when given steady bright light. Needs special potting mix and gentle watering.",
    difficulty: "moderate",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["bright-indirect", "medium"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water when the top of the mix feels dry, using room-temperature water at the base or from below (let it soak 20 minutes, then drain). Cold water or drops on fuzzy leaves cause ring spots; overwatering causes crown and root rot.",
    humidity: "average",
    temperature: { minF: 55, idealMinF: 65, idealMaxF: 80, maxF: 85 },
    hardinessZones: { min: 11, max: 12 },
    soil: {
      types: ["potting-mix", "peat"],
      phMin: 6.0,
      phMax: 6.8,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 14,
      notes: "Use a fertilizer formulated for African violets (balanced, with urea-free nitrogen) at one-quarter strength with each watering, or every 2 weeks at half strength. Flush the mix monthly to prevent salt buildup.",
    },
    container: {
      suitable: true,
      minGallons: 0.25,
      notes: "Use a small pot only one-third the leaf spread (typically 3–4 in) with drainage and a light, peat-based African violet mix with extra perlite; repot into fresh mix once a year.",
    },
    spacingInches: 8,
    heightInches: { min: 3, max: 8 },
    planting: {
      notes: "Repot annually in fresh African violet mix. Propagate from leaf cuttings with a 1–2 in petiole in moist mix. Needs 12–14 hours of light under a grow light if window light is poor.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Do well in groups on a bright shelf or under grow lights with other small plants.",
    attracts: [],
    pests: ["mealybugs", "thrips", "aphids", "fungus-gnats", "spider-mites"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Non-toxic to cats, dogs and horses per the ASPCA.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["grow-light", "watering-can", "moisture-meter", "pebble-tray"],
    goals: ["ornamental", "kid-friendly"],
    careTips: [
      "Give bright, indirect light (an east window or 12–14 hours under a grow light) for continuous bloom; too little light means few flowers.",
      "Water from below or at the soil with room-temperature water; avoid wetting the leaves and crown.",
      "Rotate the pot a quarter turn weekly for even growth and remove spent blooms and old lower leaves.",
      "Repot into fresh African violet mix every year; pot size should stay small.",
      "Avoid cold drafts and temperatures below 60°F, which stall growth and flowering.",
    ],
  },

  // ---------------------------------------------------------------------------
  // MOTH ORCHID
  // ---------------------------------------------------------------------------
  {
    id: "moth-orchid",
    name: "Moth Orchid",
    scientificName: "Phalaenopsis spp.",
    emoji: "🌸",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "The easiest orchid for the home, with arching sprays of long-lasting blooms for 2–3 months. Epiphytic: its roots grow in bark rather than soil and thrive in bright indirect light.",
    difficulty: "moderate",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["bright-indirect", "medium"],
    water: "moderate",
    wateringIntervalDays: 7,
    waterNotes:
      "Water when the bark is nearly dry and roots turn silvery-gray (about weekly): soak the pot 10–15 minutes or run water through, then drain completely. Never leave roots sitting in water; keep water out of the crown to avoid rot.",
    humidity: "average",
    temperature: { minF: 55, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 11, max: 12 },
    soil: {
      types: ["orchid-bark"],
      phMin: 5.5,
      phMax: 6.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["orchid-fertilizer"],
      frequencyDays: 14,
      notes: "Use a balanced orchid fertilizer at quarter strength weekly or half strength every 2 weeks while growing; water plain every fourth time to flush salts. Reduce in winter.",
    },
    container: {
      suitable: true,
      minGallons: 0.25,
      notes: "Grow in a clear plastic pot with slots in coarse fir bark or sphagnum moss so roots can photosynthesize and drain; repot every 1–2 years after blooming.",
    },
    spacingInches: 12,
    heightInches: { min: 12, max: 36 },
    planting: {
      notes: "Repot after flowering every 1–2 years when the bark breaks down, using fresh orchid bark. A 10–15°F nighttime drop in fall (to about 60–65°F) for 2–3 weeks triggers flower spikes. After blooms fade, cut the spike just above a node (if green) or to the base (if brown).",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Do well with humidity-loving plants; keep away from ripening fruit (ethylene causes bud drop).",
    attracts: [],
    pests: ["mealybugs", "scale-insects", "spider-mites", "thrips", "aphids"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Non-toxic to cats, dogs and horses per the ASPCA.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["spray-bottle", "humidifier", "thermometer", "pruners"],
    goals: ["ornamental", "kid-friendly"],
    careTips: [
      "Provide bright indirect light (an east window is ideal); leaves should be a medium olive green, not dark green or reddish.",
      "Water by soaking and draining, in the morning, and keep water out of the crown; gray-silver roots mean it is time to water, green roots mean wait.",
      "Aerial roots are normal; do not bury them, and cut only dead (brown, mushy) roots with sterile scissors.",
      "Use only orchid bark mix, never regular potting soil, and repot after bloom when bark decomposes.",
      "After bloom, cut the spike above a node to possibly get a second flush, or cut to the base to rebloom next year.",
    ],
  },

  // ---------------------------------------------------------------------------
  // PEPEROMIA
  // ---------------------------------------------------------------------------
  {
    id: "peperomia",
    name: "Peperomia",
    scientificName: "Peperomia obtusifolia",
    emoji: "🌱",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Compact, semi-succulent plant with thick, glossy, cupped leaves in solid or variegated forms (baby rubber plant). Small, undemanding and pet-safe; other species include watermelon and ripple peperomia.",
    difficulty: "easy",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["medium", "bright-indirect", "low"],
    water: "low",
    wateringIntervalDays: 10,
    waterNotes:
      "Thick leaves store water: water thoroughly only when the top 1–2 in of mix is dry, about every 10–14 days in summer and every 3 weeks in winter. Overwatering causes leaf drop, stem rot and root rot.",
    humidity: "average",
    temperature: { minF: 50, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix"],
      phMin: 6.0,
      phMax: 6.6,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 60,
      notes: "Feed every 2 months in spring and summer with a half-strength houseplant fertilizer; they have small root systems and are easily burned.",
    },
    container: {
      suitable: true,
      minGallons: 0.5,
      notes: "Small root system: use a 4–6 in pot with drainage and a light, airy mix with extra perlite; repot only every 2–3 years.",
    },
    spacingInches: 8,
    heightInches: { min: 6, max: 12 },
    planting: {
      notes: "Repot in spring only when roots fill the pot. Propagate from leaf-petiole or stem cuttings in moist mix or water. Variegated and watermelon types need brighter light.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Compatible with other small foliage plants and succulents with similar dry-down watering.",
    attracts: [],
    pests: ["mealybugs", "spider-mites", "thrips", "fungus-gnats"],
    repels: [],
    toxicity: {
      ...SAFE,
      notes: "Non-toxic to cats, dogs and horses per the ASPCA.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["moisture-meter", "grow-light"],
    goals: ["low-maintenance", "kid-friendly", "ornamental"],
    careTips: [
      "Let the mix dry out between waterings; wrinkled leaves usually mean thirst, soft or dropping leaves mean overwatering.",
      "Bright indirect light keeps leaves compact and patterned; direct afternoon sun burns them.",
      "Pinch tips to encourage bushiness; stems root easily from cuttings.",
      "Keep above 50°F and away from cold drafts.",
    ],
  },

  // ---------------------------------------------------------------------------
  // DRACAENA
  // ---------------------------------------------------------------------------
  {
    id: "dracaena",
    name: "Dracaena",
    scientificName: "Dracaena fragrans / Dracaena marginata",
    emoji: "🌴",
    category: "houseplant",
    lifeCycle: "perennial",
    description:
      "Upright, cane-like houseplants with arching strap-shaped leaves: corn plant (D. fragrans) has broad green or striped leaves, dragon tree (D. marginata) has narrow red-edged leaves. Tolerant of low light and neglect.",
    difficulty: "easy",
    environments: ["indoor"],
    edible: false,
    sun: ["partial-shade", "full-shade"],
    indoorLight: ["low", "medium", "bright-indirect"],
    water: "low",
    wateringIntervalDays: 10,
    waterNotes:
      "Water when the top 1–2 in of mix is dry (about every 10 days in summer, every 2–3 weeks in winter). Dracaenas are sensitive to fluoride and salts in tap water, which cause brown leaf tips and edges; use filtered or rain water. Overwatering causes yellowing and stem rot.",
    humidity: "average",
    temperature: { minF: 50, idealMinF: 65, idealMaxF: 80, maxF: 90 },
    hardinessZones: { min: 10, max: 12 },
    soil: {
      types: ["potting-mix"],
      phMin: 6.0,
      phMax: 6.5,
      drainage: "well-drained",
    },
    fertilizer: {
      feeding: "light",
      recommended: ["houseplant-liquid"],
      frequencyDays: 45,
      notes: "Feed every 6 weeks in spring and summer with a half-strength houseplant fertilizer; none in fall and winter.",
    },
    container: {
      suitable: true,
      minGallons: 3,
      notes: "Use a heavy pot with drainage to balance tall canes; repot every 2–3 years in spring.",
    },
    spacingInches: 18,
    heightInches: { min: 24, max: 72 },
    planting: {
      notes: "Repot in spring. Cut tall canes back to the desired height in spring to produce new branches below the cut; the cut piece can be rooted. Lower leaf drop is normal as canes age.",
    },
    companions: [],
    antagonists: [],
    companionNotes: "Compatible with other low- to medium-light foliage plants.",
    attracts: [],
    pests: ["spider-mites", "mealybugs", "scale-insects", "thrips", "fungus-gnats"],
    repels: [],
    toxicity: {
      cat: "mild",
      dog: "mild",
      horse: "mild",
      bird: "mild",
      rabbit: "mild",
      human: "mild",
      notes:
        "Leaves and stems (saponins): vomiting (sometimes with blood), drooling, loss of appetite, lethargy; in cats also dilated pupils and an increased heart rate. ASPCA lists as toxic to cats and dogs. Usually self-limiting; keep out of reach of pets and call a vet if vomiting persists or contains blood.",
    },
    allergens: [],
    requiredTools: [],
    helpfulTools: ["moisture-meter", "pruners"],
    goals: ["low-maintenance", "ornamental"],
    careTips: [
      "Use filtered or rain water to prevent brown leaf tips from fluoride and salts.",
      "Provide bright indirect to medium light; direct sun scorches the leaves, and low light slows growth.",
      "Let the mix dry between waterings; yellow lower leaves usually mean overwatering.",
      "Prune leggy canes in spring; new shoots emerge just below the cut.",
      "Wipe leaves to remove dust and watch for spider mites; keep away from pets that chew plants.",
    ],
  },
];

import type { Insect, InsectId } from "@/domain/types";

/** Shared caution for sprays that can harm pollinators and beneficials. */
const SPRAY_BEE_NOTE =
  "Spray only in the evening or early morning when bees are not foraging, never on open flowers, and skip plants in bloom.";

export const INSECTS: Insect[] = [
  // ---------------------------------------------------------------------------
  // Soft-bodied sap suckers
  // ---------------------------------------------------------------------------
  {
    id: "aphids",
    name: "Aphids",
    emoji: "🐛",
    role: "pest",
    description:
      "Tiny soft-bodied sap-sucking insects (green, black, yellow or white) that cluster on new growth and flower buds and multiply very quickly.",
    signs: [
      "Clusters of small insects on shoot tips, buds and leaf undersides",
      "Curled, distorted or yellowing new leaves",
      "Sticky honeydew and black sooty mold on leaves",
      "Ants farming the colony",
    ],
    management: [
      "Knock them off with a strong jet of water; repeat every few days",
      "Pinch off and bag heavily infested shoot tips",
      "Encourage ladybugs, lacewings and hoverflies; avoid broad-spectrum sprays",
      "Use reflective mulch or row covers on susceptible crops",
      "Plant trap crops such as nasturtiums away from valuable plants",
      "Spray insecticidal soap, covering leaf undersides (repeat every 5-7 days)",
      "Use neem oil or horticultural oil as a later resort",
      "Control ants so they cannot protect the aphids",
    ],
    safetyNotes: `Insecticidal soap and neem are low risk to pets once dry, but keep pets off wet foliage. ${SPRAY_BEE_NOTE}`,
  },
  {
    id: "spider-mites",
    name: "Spider Mites",
    emoji: "🕷️",
    role: "pest",
    description:
      "Microscopic arachnids that thrive in hot, dry conditions, feeding on leaf cells. Common on indoor plants, tomatoes, beans and strawberries.",
    signs: [
      "Fine stippling or tiny yellow/white dots on leaves",
      "Delicate webbing between leaves and stems",
      "Bronzed, dry, dropping leaves",
      "Tapping a leaf over white paper shows tiny moving specks",
    ],
    management: [
      "Raise humidity and mist or rinse plants; mites dislike moisture",
      "Spray leaf undersides forcefully with water every few days",
      "Isolate infested houseplants and wipe leaves with a damp cloth",
      "Remove badly infested leaves",
      "Introduce predatory mites (Phytoseiulus persimilis) or encourage lacewings and ladybugs",
      "Spray insecticidal soap or horticultural oil, repeating weekly for 3 weeks",
      "Use neem oil as a follow-up; avoid spraying in hot sun",
    ],
    safetyNotes: `Avoid broad-spectrum miticides that kill predators. Soap and oil sprays are low risk to pets when dry. ${SPRAY_BEE_NOTE}`,
  },
  {
    id: "whiteflies",
    name: "Whiteflies",
    emoji: "🦟",
    role: "pest",
    description:
      "Tiny white winged insects that fly up in a cloud when a plant is disturbed. Nymphs suck sap from leaf undersides; common on tomatoes, brassicas, squash and greenhouse plants.",
    signs: [
      "White flies scatter when foliage is shaken",
      "Yellowing, wilting leaves",
      "Sticky honeydew and sooty mold",
      "Tiny pale scale-like nymphs on leaf undersides",
    ],
    management: [
      "Vacuum adults off with a handheld vacuum in the early morning",
      "Hang yellow sticky traps near plants",
      "Spray leaves with water to dislodge nymphs",
      "Use reflective mulch to confuse adults",
      "Release or encourage parasitic wasps (Encarsia formosa) and lacewings",
      "Spray insecticidal soap or neem oil on leaf undersides weekly",
      "Remove and dispose of heavily infested leaves; clear weeds that act as hosts",
    ],
    safetyNotes: `Sticky traps can catch beneficial insects; place them only near infested plants. ${SPRAY_BEE_NOTE}`,
  },
  {
    id: "fungus-gnats",
    name: "Fungus Gnats",
    emoji: "🪰",
    role: "pest",
    description:
      "Small dark flies whose larvae live in constantly damp potting mix, feeding on fungi and sometimes seedling roots. Adults are mostly a nuisance.",
    signs: [
      "Tiny black flies hovering around soil or windows",
      "Thin translucent larvae with black heads in the top of the soil",
      "Seedlings damping off or wilting despite moist soil",
    ],
    management: [
      "Let the top 1-2 inches of soil dry out between waterings",
      "Water from below and empty saucers promptly",
      "Add a 1/2 inch layer of sand or fine grit on the soil surface",
      "Catch adults with yellow sticky traps",
      "Drench soil with Bacillus thuringiensis israelensis (BTi, e.g. mosquito dunks soaked in water)",
      "Apply beneficial nematodes (Steinernema feltiae) to the soil",
      "Repot into fresh, well-draining mix if the infestation is severe",
    ],
    safetyNotes:
      "BTi and beneficial nematodes are safe for pets, people and pollinators. Keep pets from drinking treated water out of saucers as a precaution.",
  },
  {
    id: "mealybugs",
    name: "Mealybugs",
    emoji: "🐞",
    role: "pest",
    description:
      "Slow-moving soft insects covered in white, cottony wax. They hide in leaf axils and stem joints of houseplants, succulents and greenhouse plants.",
    signs: [
      "White cottony fluff in leaf joints, under leaves and on stems",
      "Sticky honeydew and sooty mold",
      "Stunted, yellowing growth and leaf drop",
      "White fluff on roots when repotting",
    ],
    management: [
      "Isolate affected plants immediately",
      "Dab individual bugs with a cotton swab dipped in 70% isopropyl alcohol",
      "Wash plants with a strong water spray (outdoors or in a sink)",
      "Spray insecticidal soap or diluted neem oil, repeating weekly for several weeks",
      "Release mealybug destroyer ladybugs (Cryptolaemus) or lacewings in greenhouses",
      "Check roots and repot in fresh mix if root mealybugs are found",
      "Inspect new plants before bringing them home",
    ],
    safetyNotes:
      "Rubbing alcohol is flammable and can burn tender leaves; test on one leaf first. Store alcohol, soap and neem products away from pets and children.",
  },
  {
    id: "scale-insects",
    name: "Scale Insects",
    emoji: "🪲",
    role: "pest",
    description:
      "Sap-sucking insects that sit still under a waxy shell, looking like small brown or tan bumps on stems and leaves. Common on citrus, fig, ferns and many houseplants.",
    signs: [
      "Small immobile bumps on stems and leaf veins",
      "Sticky honeydew and sooty mold",
      "Yellowing leaves and branch dieback",
      "Ants tending the bumps",
    ],
    management: [
      "Scrape off scales with a fingernail or soft toothbrush",
      "Dab with a cotton swab dipped in 70% isopropyl alcohol",
      "Prune out heavily infested branches",
      "Apply horticultural oil or dormant oil to smother scales (follow label temperatures)",
      "Spray insecticidal soap or neem on young 'crawler' stages in late spring",
      "Encourage parasitic wasps and ladybugs; control ants",
    ],
    safetyNotes: `Do not apply oils in hot weather or to stressed plants. Keep pets away until sprays dry. ${SPRAY_BEE_NOTE}`,
  },
  {
    id: "thrips",
    name: "Thrips",
    emoji: "🦗",
    role: "pest",
    description:
      "Slender, tiny insects that rasp plant surfaces and flowers. They affect onions, roses, beans and many indoor plants and spread plant viruses.",
    signs: [
      "Silvery streaks or flecks on leaves",
      "Distorted, scarred flowers and buds",
      "Tiny black specks (frass) on leaves",
      "Shake a flower over white paper to see slender moving insects",
    ],
    management: [
      "Use blue or yellow sticky traps to monitor and reduce adults",
      "Spray plants with water to dislodge them",
      "Remove infested flowers and weedy hosts",
      "Use reflective mulch to deter adults",
      "Encourage minute pirate bugs, lacewings and predatory mites",
      "Spray spinosad or insecticidal soap on affected plants (not on blooms visited by bees)",
      "Apply neem oil, repeating weekly",
    ],
    safetyNotes:
      "Spinosad is highly toxic to bees while wet; spray only at dusk and never on open flowers. Dried residue is far less harmful. Keep pets and children away until sprays dry.",
  },
  // ---------------------------------------------------------------------------
  // Chewing pests
  // ---------------------------------------------------------------------------
  {
    id: "slugs-snails",
    name: "Slugs & Snails",
    emoji: "🐌",
    role: "pest",
    description:
      "Soft-bodied mollusks that feed at night and on damp days, shredding seedlings, lettuce, hostas and strawberries.",
    signs: [
      "Ragged holes in leaves, especially on seedlings and lettuce",
      "Silvery slime trails",
      "Damage worst after rain or in shady, damp beds",
    ],
    management: [
      "Water in the morning so surfaces are dry at night",
      "Hand-pick at dusk with a flashlight and drop into soapy water",
      "Set board or upturned-pot traps and empty them daily",
      "Sink shallow beer traps (replace every few days)",
      "Use copper tape around containers and bed edges",
      "Remove debris and boards that provide daytime hiding places",
      "Scatter iron phosphate bait (labelled for organic use) if numbers stay high",
      "Encourage ground beetles, birds, toads and frogs",
    ],
    safetyNotes:
      "Avoid metaldehyde slug bait: it is highly toxic to dogs, cats and wildlife, and even small amounts can be fatal. Iron phosphate baits are much safer around pets but still keep out of reach and use as directed. Beer traps can attract pets; use covered traps.",
  },
  {
    id: "cabbage-worms",
    name: "Cabbage Worms",
    emoji: "🐛",
    role: "pest",
    description:
      "Green caterpillars of the cabbage white butterfly, cabbage looper and diamondback moth that chew holes in broccoli, cabbage, kale and other brassicas.",
    signs: [
      "Ragged holes in leaves and bored heads",
      "Small green or dark pellets of frass",
      "White butterflies fluttering around brassicas",
      "Velvety green caterpillars blending into leaves",
    ],
    management: [
      "Cover plants with floating row cover from planting time so butterflies cannot lay eggs",
      "Hand-pick caterpillars and crush eggs on leaf undersides",
      "Interplant with thyme, dill, or sage and use nasturtium trap crops",
      "Encourage parasitic wasps and birds",
      "Spray Bacillus thuringiensis kurstaki (BTk) on leaves; caterpillars stop feeding within a day",
      "Apply spinosad only if infestation is severe",
      "Remove and compost crop residue after harvest",
    ],
    safetyNotes: `BTk is safe for people, pets and bees, but also kills the caterpillars of butterflies and moths; apply only to affected crops and never to host plants for butterflies you want to keep. ${SPRAY_BEE_NOTE}`,
  },
  {
    id: "tomato-hornworm",
    name: "Tomato Hornworm",
    emoji: "🐛",
    role: "pest",
    description:
      "Huge green caterpillars (up to 4 inches) with a horn at the rear that can strip a tomato, pepper or eggplant plant in days.",
    signs: [
      "Large chunks of leaves missing from the top of plants",
      "Big dark green droppings on leaves below",
      "Bare stems and chewed fruit",
      "White rice-like cocoons on the caterpillar mean parasitic wasps are at work",
    ],
    management: [
      "Hand-pick caterpillars (check at dusk or use a blacklight to spot them) and drop in soapy water",
      "Leave caterpillars covered in wasp cocoons; they are already doomed and will multiply wasps",
      "Till soil in fall to destroy overwintering pupae",
      "Plant dill, borage or marigolds nearby to attract beneficials",
      "Spray BTk on young caterpillars",
      "Rotate tomatoes and related crops each year",
    ],
    safetyNotes: `Hornworms are harmless to touch. BTk is safe for people, pets and bees but kills all caterpillars it is sprayed on. ${SPRAY_BEE_NOTE}`,
  },
  {
    id: "cucumber-beetles",
    name: "Cucumber Beetles",
    emoji: "🪲",
    role: "pest",
    description:
      "Yellow-green striped or spotted beetles that chew cucumbers, melons and squash and spread bacterial wilt.",
    signs: [
      "Yellow beetles with stripes or 12 black spots on leaves and flowers",
      "Chewed seedlings and scarred fruit rinds",
      "Plants suddenly wilting from bacterial wilt",
    ],
    management: [
      "Cover seedlings with floating row cover until flowering",
      "Hand-pick beetles in the morning when sluggish",
      "Use yellow sticky traps",
      "Plant a trap crop such as Blue Hubbard squash and treat the trap crop",
      "Grow resistant varieties and rotate crops each year",
      "Use kaolin clay spray as a deterrent",
      "Apply beneficial nematodes to soil to attack larvae",
      "Spray pyrethrin or spinosad only in severe cases",
    ],
    safetyNotes: `Remove row cover when plants flower so bees can pollinate. Pyrethrin and spinosad are toxic to bees and fish; ${SPRAY_BEE_NOTE.toLowerCase()}`,
  },
  {
    id: "squash-vine-borer",
    name: "Squash Vine Borer",
    emoji: "🐛",
    role: "pest",
    description:
      "A clearwing moth whose larvae tunnel inside squash and pumpkin stems near the base, causing sudden wilting.",
    signs: [
      "Sudden wilting of a whole vine in midsummer",
      "Small holes with orange-yellow sawdust-like frass at the stem base",
      "Orange-red day-flying moths in early summer",
      "White grub-like larva inside split stems",
    ],
    management: [
      "Cover young plants with row cover until flowering and hand-pollinate if needed",
      "Monitor for moths and eggs (tiny flat brown eggs on stems) and scrape them off",
      "Wrap the lower stem with foil or fabric strips",
      "Slit the stem lengthwise, remove the larva, and mound soil over the wound",
      "Inject BTk into stems with a syringe",
      "Plant resistant types such as butternut or Tromboncino",
      "Replant a second crop in midsummer after moths have finished laying",
      "Remove vines after harvest to destroy pupae",
    ],
    safetyNotes: `Row cover must be removed during flowering to allow bee pollination, or pollinate by hand. BTk is safe for people, pets and bees.`,
  },
  {
    id: "squash-bugs",
    name: "Squash Bugs",
    emoji: "🪲",
    role: "pest",
    description:
      "Flat, grayish-brown shield-shaped bugs that suck sap from squash, pumpkin and cucumber leaves and vines, causing wilting and yellowing.",
    signs: [
      "Clusters of shiny bronze-brown eggs on leaf undersides",
      "Gray nymphs in groups",
      "Yellow speckled leaves that turn brown ('anasa wilt')",
      "Bugs hiding under boards at the plant base",
    ],
    management: [
      "Scrape or tape off egg clusters every few days",
      "Lay boards near plants at night, then collect and destroy bugs in the morning",
      "Hand-pick adults and nymphs into soapy water",
      "Grow resistant varieties and use row cover until flowering",
      "Plant nasturtiums or radishes as deterrents",
      "Spray neem or insecticidal soap on nymphs (adults are hard to kill)",
      "Clean up garden debris in fall to remove overwintering sites",
    ],
    safetyNotes: `Insecticidal soap and neem are best on young nymphs. ${SPRAY_BEE_NOTE} Row cover must come off at flowering for pollination.`,
  },
  {
    id: "flea-beetles",
    name: "Flea Beetles",
    emoji: "🪲",
    role: "pest",
    description:
      "Tiny shiny beetles that jump like fleas and chew small holes in leaves of brassicas, eggplant, potatoes and radishes, especially seedlings.",
    signs: [
      "Hundreds of tiny 'shot-holes' in leaves",
      "Seedlings stunted or killed",
      "Tiny beetles jumping when plants are disturbed",
    ],
    management: [
      "Cover seedlings with floating row cover immediately after planting",
      "Delay planting until the first wave of adults has passed",
      "Grow a trap crop such as radish or Chinese mustard",
      "Use yellow sticky traps",
      "Keep soil moist and shade seedlings; beetles prefer dry, sunny conditions",
      "Dust with kaolin clay or diatomaceous earth (food grade) on leaves",
      "Apply beneficial nematodes to soil for larvae",
      "Spray neem or spinosad only on severe infestations",
    ],
    safetyNotes:
      "Food-grade diatomaceous earth dust can irritate lungs; wear a dust mask when applying, and avoid applying to open flowers because it harms bees. Keep pets and children away while dust is airborne.",
  },
  {
    id: "colorado-potato-beetle",
    name: "Colorado Potato Beetle",
    emoji: "🪲",
    role: "pest",
    description:
      "Yellow-orange beetles with black stripes whose red humpbacked larvae defoliate potatoes, eggplant and tomatoes.",
    signs: [
      "Defoliated plants with bare stems",
      "Clusters of orange-yellow eggs on leaf undersides",
      "Dark red humpbacked larvae with black spots",
      "Black droppings on leaves",
    ],
    management: [
      "Hand-pick adults, larvae and eggs daily in early season",
      "Cover plants with row cover until flowering",
      "Mulch heavily with straw to hinder emerging adults and larvae",
      "Rotate crops at least 400 yards away from last year's potatoes where possible",
      "Plant trap crops such as early potatoes or eggplant",
      "Encourage ground beetles, stink bugs and lacewings",
      "Spray BTt (tenebrionis) strains or spinosad on young larvae",
      "Apply neem to early larval stages",
    ],
    safetyNotes: `Spinosad is highly toxic to bees when wet; spray at dusk and away from flowering weeds. Keep pets away until dry.`,
  },
  {
    id: "japanese-beetles",
    name: "Japanese Beetles",
    emoji: "🪲",
    role: "pest",
    description:
      "Metallic green and copper beetles that skeletonize leaves and flowers of roses, grapes, beans and fruit trees. Their grubs feed on lawn roots.",
    signs: [
      "Leaves chewed into lace-like 'skeletons'",
      "Clusters of shiny beetles feeding in sunny spots",
      "Brown patches in lawn that peel up like carpet (grubs)",
    ],
    management: [
      "Hand-pick into soapy water in the early morning when beetles are sluggish",
      "Use row covers on vulnerable crops during beetle season (mid-summer)",
      "Avoid pheromone traps near plants; they can draw more beetles in",
      "Plant less-favored species and avoid roses next to beans",
      "Apply beneficial nematodes (Heterorhabditis) or milky spore to lawns for grubs",
      "Spray neem or kaolin clay for deterrence",
      "Water lawns less in July-August so females avoid laying eggs",
    ],
    safetyNotes: `Pyrethrin and carbaryl kill pollinators; avoid them on flowering plants. Milky spore and nematodes are safe for pets and people. ${SPRAY_BEE_NOTE}`,
  },
  {
    id: "carrot-rust-fly",
    name: "Carrot Rust Fly",
    emoji: "🪰",
    role: "pest",
    description:
      "Small flies whose larvae tunnel into carrots, parsnips, celery and parsley roots, leaving rusty brown channels.",
    signs: [
      "Foliage reddening and wilting",
      "Rusty-brown tunnels in the roots",
      "Stunted, forked roots",
    ],
    management: [
      "Cover crops with fine insect mesh or row cover at sowing",
      "Surround beds with a 24-inch high barrier (flies fly low)",
      "Sow thinly to avoid thinning (the bruised foliage smell attracts flies)",
      "Sow late spring or early summer after the first generation",
      "Rotate crops yearly",
      "Interplant with onions, leeks or chives to confuse flies",
      "Harvest promptly in fall and remove damaged roots",
    ],
    safetyNotes: "Physical barriers are the main control and carry no pet, child, or pollinator risk.",
  },
  {
    id: "leaf-miners",
    name: "Leaf Miners",
    emoji: "🪰",
    role: "pest",
    description:
      "Larvae of tiny flies and moths that tunnel between leaf surfaces of spinach, chard, beets, tomatoes, citrus and columbine.",
    signs: [
      "Winding white or tan squiggly trails in leaves",
      "Blotchy brown patches on spinach and chard",
      "Small white egg clusters on leaf undersides",
    ],
    management: [
      "Remove and destroy mined leaves (do not compost)",
      "Squash larvae inside leaves by pinching",
      "Cover susceptible crops with row cover before adults appear",
      "Rotate crops and till soil in fall to expose pupae",
      "Encourage parasitic wasps by growing nectar flowers",
      "Spray spinosad or neem oil early, at first signs",
      "Control weeds such as lambsquarters that harbor leaf miners",
    ],
    safetyNotes: `Spinosad is toxic to bees while wet; avoid spraying flowering plants and spray at dusk. Mined leaves are generally safe to harvest and eat once washed on edible crops.`,
  },
  {
    id: "cutworms",
    name: "Cutworms",
    emoji: "🐛",
    role: "pest",
    description:
      "Fat gray-brown caterpillars that hide in soil by day and sever seedling stems at ground level at night.",
    signs: [
      "Young seedlings cut off at the base overnight",
      "Plants lying on the ground, stems intact above the cut",
      "C-shaped grubs in soil when digging near damaged plants",
    ],
    management: [
      "Place collars (cardboard tubes, toilet rolls, cups with bottoms cut out) around seedlings, pressed 1 inch into soil",
      "Dig around plants at night with a flashlight and hand-pick",
      "Till garden before planting to expose and kill larvae",
      "Sprinkle cornmeal or bran with BTk around plants",
      "Keep weeds down and delay planting until weeds are cleared",
      "Apply beneficial nematodes (Steinernema carpocapsae) to soil",
      "Encourage birds and ground beetles",
    ],
    safetyNotes:
      "Collars and hand-picking carry no risk. BTk and nematodes are safe for pets, children and pollinators. Avoid scattering bait where pets may eat it.",
  },
  {
    id: "corn-earworm",
    name: "Corn Earworm",
    emoji: "🐛",
    role: "pest",
    description:
      "Caterpillars that feed in corn ear tips and also attack tomatoes (as tomato fruitworm), beans and peppers.",
    signs: [
      "Chewed kernels at the ear tip with frass",
      "Caterpillars inside silk",
      "Bored holes in tomato fruit",
    ],
    management: [
      "Plant early to avoid peak moth flights",
      "Select varieties with tight, long husks",
      "Apply a few drops of mineral oil to silks 3-5 days after they wilt, or add BTk",
      "Release Trichogramma wasps to parasitize eggs",
      "Hand-pick and discard affected fruit",
      "Till soil in fall to disturb pupae",
      "Use spinosad on silks as a last resort",
    ],
    safetyNotes: "BTk is safe for people, pets and bees. Spinosad is toxic to bees when wet; apply on silks at dusk.",
  },
  {
    id: "mexican-bean-beetle",
    name: "Mexican Bean Beetle",
    emoji: "🐞",
    role: "pest",
    description:
      "Copper-colored, ladybug-like beetles with 16 black spots; adults and spiny yellow larvae skeletonize bean leaves.",
    signs: [
      "Lacy, skeletonized leaves",
      "Yellow-orange egg clusters on leaf undersides",
      "Spiny yellow larvae on the leaves",
    ],
    management: [
      "Hand-pick adults, larvae and eggs",
      "Grow beans under row cover until flowering",
      "Plant early and choose fast-maturing varieties",
      "Interplant with potatoes, rosemary or marigolds as repellents",
      "Release Pediobius foveolatus parasitic wasps",
      "Spray neem or spinosad on larvae",
      "Remove bean debris after harvest",
    ],
    safetyNotes: `Do not confuse with ladybugs; ladybugs are beneficial. ${SPRAY_BEE_NOTE}`,
  },
  {
    id: "onion-maggots",
    name: "Onion Maggots",
    emoji: "🪰",
    role: "pest",
    description:
      "White maggots of a gray fly that tunnel into onion, leek and garlic bulbs and seedlings, especially in cool, wet springs.",
    signs: [
      "Wilting yellow seedlings that pull up easily",
      "Hollowed, rotting bulbs with white maggots",
      "Small gray flies near onions",
    ],
    management: [
      "Cover plantings with floating row cover from planting",
      "Rotate onion family crops yearly (at least 3 years)",
      "Remove and destroy infested plants",
      "Plant onion sets instead of seeds",
      "Keep beds free of rotting debris and cull piles",
      "Apply beneficial nematodes (Steinernema feltiae) to soil",
      "Delay planting after the spring fly peak",
    ],
    safetyNotes: "Row cover and rotation are the safest controls. Nematodes are safe for pets, children and pollinators.",
  },
  {
    id: "earwigs",
    name: "Earwigs",
    emoji: "🪲",
    role: "pest",
    description:
      "Brown insects with rear pincers that hide by day and feed at night on soft petals, seedlings and corn silk. They also eat aphids and other pests.",
    signs: [
      "Ragged holes in petals, dahlias and lettuce",
      "Chewed seedlings and corn silks",
      "Groups hiding in rolled newspaper or flower pots in the morning",
    ],
    management: [
      "Set rolled damp newspaper or a tuna-can oil trap; empty it each morning",
      "Stuff upturned flower pots with straw on stakes and empty daily",
      "Remove mulch, boards and debris near plants",
      "Use sticky barrier on stems or tree trunks",
      "Dust with food-grade diatomaceous earth around base",
      "Tolerate small numbers: they eat aphids and mites",
    ],
    safetyNotes:
      "Earwigs are harmless to people (pincers do not hurt). Wear a dust mask with diatomaceous earth and avoid dusting flowers where bees forage.",
  },
  // ---------------------------------------------------------------------------
  // Animal pests
  // ---------------------------------------------------------------------------
  {
    id: "deer",
    name: "Deer",
    emoji: "🦌",
    role: "animal-pest",
    description:
      "Browsing mammals that eat hostas, roses, tulips, fruit trees and many vegetables, and can quickly strip plants, especially in winter and spring.",
    signs: [
      "Ragged, torn leaf and twig edges (no upper front teeth)",
      "Hoof prints and droppings",
      "Browsing line on shrubs and trees at about 6 feet high",
      "Buck rub damage to young tree trunks",
    ],
    management: [
      "Install an 8-foot fence or two shorter fences spaced 3-4 feet apart",
      "Cover young plants and trees with netting or tree guards",
      "Choose deer-resistant plants such as lavender, rosemary, daffodils and alliums",
      "Use motion-activated sprinklers or lights",
      "Rotate scent or taste repellents (egg-based, garlic or soap sprays) and reapply after rain",
      "Plant favorite foods inside protection and resistant plants on the outside edge",
      "Use dog presence or scare devices as extra deterrents",
    ],
    safetyNotes:
      "Repellent sprays should not be used on edible portions close to harvest. Keep blood meal and similar scent products away from pets. Electric fences must be signed and kept out of reach of children.",
  },
  {
    id: "rabbits",
    name: "Rabbits",
    emoji: "🐇",
    role: "animal-pest",
    description:
      "Cottontails nibble seedlings, beans, lettuce, carrots and flower beds and gnaw bark off young trees in winter.",
    signs: [
      "Clean, 45-degree angled cuts on stems",
      "Round pellet droppings",
      "Seedlings and low plants nipped to the ground",
      "Gnawed bark at snow level",
    ],
    management: [
      "Fence beds with 2-foot-high chicken wire, buried 3-6 inches or bent outward",
      "Use cloches or row covers on seedlings",
      "Wrap young tree trunks with hardware cloth guards",
      "Grow raised beds or containers",
      "Plant less appealing herbs like lavender, onions and marigolds",
      "Apply repellent sprays (capsaicin or predator scent) and reapply after rain",
      "Remove brush piles that provide shelter",
    ],
    safetyNotes:
      "Avoid poison baits, which endanger pets, children and wildlife. Predator-scent and blood-based repellents can attract dogs.",
  },
  {
    id: "birds",
    name: "Birds",
    emoji: "🐦",
    role: "animal-pest",
    description:
      "Robins, starlings, finches and crows peck ripening berries, cherries, grapes and corn and pull up newly sown seed. Many birds are also valuable insect predators.",
    signs: [
      "Pecked or half-eaten fruit",
      "Pulled-up seedlings and dug seed rows",
      "Flocks visiting ripening crops",
    ],
    management: [
      "Drape bird netting over fruit bushes and trees, with a support frame so birds cannot get tangled",
      "Use floating row cover over newly sown seed",
      "Hang reflective tape, pinwheels or old CDs",
      "Move scare devices every few days so birds do not get used to them",
      "Provide a water source or feeders elsewhere as a distraction",
      "Harvest ripe fruit promptly",
    ],
    safetyNotes:
      "Use fine-mesh or taut netting (not loose, large-mesh) to prevent birds, snakes and small animals from getting trapped. Check netting regularly and remove it after harvest.",
  },
  {
    id: "squirrels",
    name: "Squirrels",
    emoji: "🐿️",
    role: "animal-pest",
    description:
      "Squirrels dig up bulbs and containers, take tomatoes, strawberries, corn and nuts, and bury and unearth seeds.",
    signs: [
      "Small holes dug in beds and pots",
      "Missing bulbs and half-eaten fruit",
      "Tomatoes with a single bite",
      "Stripped nuts and chewed shells",
    ],
    management: [
      "Cover freshly planted bulbs and seed beds with hardware cloth or chicken wire",
      "Plant squirrel-resistant bulbs such as daffodils, alliums and fritillaria",
      "Use netting or cages around ripening fruit",
      "Cover potted soil with pebbles or mesh",
      "Provide a separate feeder or corn cob to distract them",
      "Use spicy capsaicin repellents and reapply after rain",
      "Remove fallen fruit and nuts",
    ],
    safetyNotes:
      "Capsaicin sprays can irritate eyes and skin; wear gloves. Avoid poisons, which can kill pets and wildlife. Do not handle wild squirrels.",
  },
  // ---------------------------------------------------------------------------
  // Pollinators
  // ---------------------------------------------------------------------------
  {
    id: "honeybees",
    name: "Honeybees",
    emoji: "🐝",
    role: "pollinator",
    description:
      "Social managed bees that pollinate fruit trees, squash, berries and many flowers, living in hives of thousands.",
    signs: [
      "Steady buzzing on flowers on warm days",
      "Better fruit set on trees and vegetable crops",
      "Bees carrying yellow or orange pollen baskets",
    ],
    management: [
      "Plant a succession of nectar and pollen flowers from early spring to fall",
      "Choose single-flower varieties (herbs, borage, lavender, sunflower, clover) over double blooms",
      "Provide a shallow water dish with pebbles for landing",
      "Avoid pesticides, especially neonicotinoids and spinosad, during bloom",
      "Allow clover and dandelions to flower in lawns in spring",
      "Plant in clumps of the same species so bees can forage efficiently",
    ],
    safetyNotes:
      "Honeybees sting only when threatened; people with bee-sting allergies should keep an epinephrine auto-injector accessible and avoid planting heavily bee-visited flowers near doors and play areas. Spray pesticides only at dusk and never on open blooms.",
  },
  {
    id: "native-bees",
    name: "Native Bees",
    emoji: "🐝",
    role: "pollinator",
    description:
      "Solitary and small social bees such as mason, leafcutter, sweat and mining bees that are excellent pollinators and rarely sting.",
    signs: [
      "Small metallic or dark bees visiting flowers",
      "Pencil-sized holes in bare soil or hollow stems",
      "Leaf pieces cut in neat circles (leafcutters, harmless)",
    ],
    management: [
      "Leave patches of bare, well-drained soil for ground-nesting bees",
      "Provide nesting sites: bee hotels with 3/8 inch holes, drilled wood blocks, and hollow stems left standing over winter",
      "Plant native flowers with varied bloom times and shapes",
      "Reduce tilling and heavy mulch over nesting areas",
      "Avoid pesticides, especially during bloom",
      "Clean or replace bee hotel tubes every year to prevent parasites",
    ],
    safetyNotes:
      "Native solitary bees are very docile and rarely sting, making them a good choice for family gardens. Keep nesting areas away from heavily sprayed zones.",
  },
  {
    id: "bumblebees",
    name: "Bumblebees",
    emoji: "🐝",
    role: "pollinator",
    description:
      "Large, fuzzy bees that buzz-pollinate tomatoes, peppers, blueberries and eggplant and forage in cool weather.",
    signs: [
      "Loud buzzing on tomato, pepper, blueberry and squash flowers",
      "Large fuzzy bees active in cool or cloudy weather",
      "Nests in abandoned rodent burrows or grassy tussocks",
    ],
    management: [
      "Plant early spring flowers (crocus, willow, lungwort) to feed queens",
      "Grow long-blooming perennials such as salvia, catmint, bee balm and lavender",
      "Leave undisturbed rough grass and leaf litter for nesting",
      "Avoid mowing early in the season in meadow patches",
      "Use no neonicotinoids and minimize insecticides",
      "Provide shallow water with landing stones",
    ],
    safetyNotes:
      "Bumblebees are gentle and sting only if the nest is disturbed. Keep children and pets away from nests; do not use insecticides to remove nests that are not in a high-traffic area.",
  },
  {
    id: "butterflies",
    name: "Butterflies",
    emoji: "🦋",
    role: "pollinator",
    description:
      "Day-flying pollinators whose caterpillars feed on specific host plants. Adults sip nectar and need sun, shelter and water.",
    signs: [
      "Adults visiting flowers on sunny days",
      "Chewed leaves on host plants (monarch on milkweed, swallowtail on dill/parsley/fennel)",
      "Eggs and chrysalises on stems",
    ],
    management: [
      "Plant nectar flowers in sun: zinnias, coneflower, butterfly bush, lantana, milkweed",
      "Grow caterpillar host plants (milkweed, dill, parsley, fennel, violets) and accept some leaf damage",
      "Provide flat stones for basking and a damp sand or mud puddle",
      "Shelter plantings from strong wind",
      "Avoid BTk, spinosad and pyrethrin near host plants",
      "Leave some leaf litter and stems for overwintering chrysalises",
    ],
    safetyNotes:
      "Do not spray BTk or insecticides on butterfly host plants; caterpillars will die. Some host plants (milkweed) are toxic to pets, livestock and children if eaten.",
  },
  {
    id: "moths",
    name: "Moths",
    emoji: "🦋",
    role: "pollinator",
    description:
      "Night-flying pollinators such as hawk moths that visit pale, fragrant evening flowers. Some moth larvae are garden pests (cutworms, hornworms), but most moths are harmless.",
    signs: [
      "Hovering hummingbird-like visitors at dusk",
      "Pale flowers opening in the evening",
      "Moths attracted to outdoor lights",
    ],
    management: [
      "Plant night-blooming and fragrant flowers such as evening primrose, nicotiana, moonflower, jasmine and honeysuckle",
      "Use white or pale blooms that show up at night",
      "Reduce outdoor lighting and use warm, shielded bulbs",
      "Avoid insecticide sprays in the evening",
      "Provide host plants and leave some leaf litter for pupae",
    ],
    safetyNotes:
      "Moths are harmless to pets and people. Some night-blooming plants (angel's trumpet, moonflower, nicotiana) are toxic if eaten, so keep them away from children and pets.",
  },
  {
    id: "hummingbirds",
    name: "Hummingbirds",
    emoji: "🐦",
    role: "pollinator",
    description:
      "Tiny nectar-feeding birds attracted to tubular red, orange and pink flowers. They also eat small insects like gnats and aphids.",
    signs: [
      "Rapid hovering at tubular flowers",
      "Buzzing sound of wings near flowers",
      "Territorial chasing at feeders",
    ],
    management: [
      "Plant tubular flowers such as salvia, bee balm, trumpet vine, columbine, fuchsia and penstemon",
      "Offer a feeder with 1 part white sugar to 4 parts water, no dye or honey; change every 2-3 days in heat",
      "Provide perches and shelter from wind",
      "Add a misting fountain for bathing",
      "Avoid pesticides that remove their insect food",
      "Keep feeders clean and out of reach of cats",
    ],
    safetyNotes:
      "Do not use red dye or honey in feeders; dirty feeders can spread fungal disease. Keep feeders away from windows and outdoor cats.",
  },
  // ---------------------------------------------------------------------------
  // Beneficials
  // ---------------------------------------------------------------------------
  {
    id: "ladybugs",
    name: "Ladybugs",
    emoji: "🐞",
    role: "beneficial",
    description:
      "Spotted beetles whose adults and spiky alligator-like larvae eat large numbers of aphids, mites and scale insects.",
    signs: [
      "Red or orange spotted beetles on stems",
      "Spiny dark larvae with orange spots feeding on aphids",
      "Clusters of yellow eggs on leaf undersides",
    ],
    management: [
      "Plant pollen and nectar flowers: dill, fennel, yarrow, alyssum, cosmos, calendula",
      "Tolerate some aphids to keep ladybugs around",
      "Avoid broad-spectrum insecticides",
      "Provide shallow water with pebbles and leaf litter for overwintering",
      "Release purchased ladybugs at dusk onto damp plants (many fly away; native ones are better to attract)",
      "Do not mistake larvae for pests",
    ],
    safetyNotes:
      "Ladybugs are harmless. Invasive Asian lady beetles may bite lightly and enter homes in fall. Pesticides, even organic sprays like soap or neem, can harm them.",
  },
  {
    id: "lacewings",
    name: "Lacewings",
    emoji: "🪰",
    role: "beneficial",
    description:
      "Delicate green insects with lacy wings; their larvae ('aphid lions') devour aphids, mites, thrips and small caterpillars.",
    signs: [
      "Pale green adults at dusk",
      "Eggs on tiny silk stalks on leaves",
      "Spindle-shaped, alligator-like larvae hunting aphids",
    ],
    management: [
      "Plant nectar and pollen sources: dill, fennel, cosmos, coriander, angelica",
      "Provide shelter with hedges and perennial borders",
      "Avoid insecticides; even soaps can harm larvae",
      "Allow some aphids as food",
      "Supply a shallow water source",
      "Buy lacewing eggs or larvae for greenhouse and garden releases",
    ],
    safetyNotes: "Lacewings are harmless to people and pets. Avoid spraying neem or pyrethrin where they are active.",
  },
  {
    id: "hoverflies",
    name: "Hoverflies",
    emoji: "🪰",
    role: "beneficial",
    description:
      "Bee-mimicking flies that hover over flowers. Adults pollinate; their larvae eat large numbers of aphids.",
    signs: [
      "Striped bee-like flies hovering in place",
      "Slug-like translucent larvae among aphids",
      "Visits to small, flat flowers",
    ],
    management: [
      "Plant small, open flowers: alyssum, calendula, coriander, dill, fennel, phacelia",
      "Interplant flowers in or near vegetable beds",
      "Leave areas of long grass and leaf litter",
      "Avoid pesticides",
      "Provide shallow water",
      "Leave aphid colonies in small amounts to feed larvae",
    ],
    safetyNotes: "Hoverflies cannot sting despite looking like wasps. Insecticide sprays kill the larvae.",
  },
  {
    id: "parasitic-wasps",
    name: "Parasitic Wasps",
    emoji: "🐝",
    role: "beneficial",
    description:
      "Tiny stingless wasps (braconids, trichogramma, Encarsia) that lay eggs in or on caterpillars, aphids and whiteflies, killing them.",
    signs: [
      "White rice-like cocoons on hornworms",
      "Bloated tan 'mummified' aphids",
      "Tiny holes in dead pest bodies",
    ],
    management: [
      "Plant tiny-flowered nectar plants: dill, parsley, yarrow, sweet alyssum, wild carrot, coriander",
      "Avoid insecticides, including BTk during adult flights when possible",
      "Leave parasitized hornworms and mummified aphids in place",
      "Release Trichogramma, Encarsia or Aphidius from suppliers in greenhouses and beds",
      "Provide shelter in perennial beds and hedges",
    ],
    safetyNotes: "These wasps are tiny and do not sting people or pets. Any broad-spectrum spray will kill them.",
  },
  {
    id: "ground-beetles",
    name: "Ground Beetles",
    emoji: "🪲",
    role: "beneficial",
    description:
      "Shiny black or brown nocturnal beetles that hunt slugs, cutworms, root maggots and other soil pests.",
    signs: [
      "Fast black beetles running when mulch is lifted",
      "Fewer slugs and cutworms",
      "Night-time activity under boards or stones",
    ],
    management: [
      "Provide permanent mulch, stone piles or beetle banks (raised strips of tussock grass)",
      "Use perennial ground covers and avoid frequent tilling",
      "Avoid soil insecticides and slug pellets",
      "Stepping stones and boards make daytime shelter",
      "Plant clover or other living mulch",
    ],
    safetyNotes: "Ground beetles are harmless. Metaldehyde slug bait and soil insecticides kill them.",
  },
  {
    id: "praying-mantis",
    name: "Praying Mantis",
    emoji: "🦗",
    role: "beneficial",
    description:
      "Large ambush predators that eat flies, moths, beetles and aphids, but also bees and other beneficial insects.",
    signs: [
      "Green or brown insects with folded front legs on plants",
      "Foam-like tan egg cases on twigs in winter",
      "Missing insects around the area",
    ],
    management: [
      "Provide tall perennials, shrubs and grasses as perches",
      "Leave egg cases (oothecae) undisturbed in fall and winter",
      "Avoid pesticides",
      "Plant a diverse garden with raspberry canes, dill, cosmos",
      "Do not rely on bought egg cases: mantises are generalists and do not control specific pests",
    ],
    safetyNotes: "Mantises are harmless to people and pets. They eat many insects indiscriminately, including pollinators.",
  },
  {
    id: "earthworms",
    name: "Earthworms",
    emoji: "🪱",
    role: "beneficial",
    description:
      "Soil-dwelling decomposers that aerate soil and produce nutrient-rich castings. A high earthworm count signals healthy soil.",
    signs: [
      "Dark castings on the soil surface",
      "Worm channels and burrows",
      "Several worms found in every shovelful of moist soil",
    ],
    management: [
      "Add compost and organic mulch regularly",
      "Reduce tilling and avoid compaction",
      "Keep soil moist and covered",
      "Avoid synthetic fertilizers, pesticides and fungicides",
      "Use cover crops and leaf litter to feed worms",
      "Maintain soil pH near neutral",
    ],
    safetyNotes:
      "Earthworms are harmless. Heavy salt-based fertilizers and some pesticides harm them. Note that invasive earthworms can damage some native forests; do not release worms in woodlands.",
  },
];

const INSECTS_BY_ID: ReadonlyMap<InsectId, Insect> = new Map(INSECTS.map((i) => [i.id, i]));

/** Look up an insect by id; throws if the id is unknown. */
export function getInsect(id: InsectId): Insect {
  const insect = INSECTS_BY_ID.get(id);
  if (!insect) throw new Error(`Unknown insect id: ${id}`);
  return insect;
}

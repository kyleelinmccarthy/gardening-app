import type { SoilInfo } from "@/domain/types";

export const SOILS: SoilInfo[] = [
  {
    id: "loam",
    name: "Loam",
    description:
      "The gardener's ideal: a balanced mix of sand, silt and clay that holds moisture and nutrients yet drains well.",
    drainage: "well-drained",
    nutrients: "high",
    typicalPh: { min: 6.0, max: 7.0 },
    pros: [
      "Holds moisture and nutrients while draining freely",
      "Easy to dig and crumbly",
      "Suits nearly all vegetables, herbs and flowers",
    ],
    cons: [
      "Organic matter depletes with heavy cropping",
      "Can still compact if worked when wet",
    ],
    improveWith: [
      "Top-dress with 1-2 inches of compost each year",
      "Mulch to protect structure and retain moisture",
      "Rotate crops and use cover crops",
    ],
    identify:
      "Squeeze test: a moist handful forms a ball that crumbles when poked. It feels slightly gritty yet smooth, neither sticky nor loose. Jar test: roughly 40% sand, 40% silt, 20% clay.",
  },
  {
    id: "sandy",
    name: "Sandy soil",
    description:
      "Gritty, coarse-particled soil that warms quickly and drains fast but holds little water or nutrients.",
    drainage: "well-drained",
    nutrients: "low",
    typicalPh: { min: 5.5, max: 7.0 },
    pros: [
      "Drains fast, so roots rarely rot",
      "Warms early in spring",
      "Easy to dig and light to work",
    ],
    cons: [
      "Dries out quickly; needs frequent watering",
      "Nutrients leach away fast",
      "Low organic matter",
    ],
    improveWith: [
      "Work in generous compost or aged manure every season",
      "Add coco coir or peat to boost water holding",
      "Mulch thickly and use cover crops",
      "Feed little and often with slow-release or organic fertilizer",
    ],
    identify:
      "Squeeze test: a moist handful falls apart as soon as you open your hand. It feels gritty and you can see individual grains. Jar test: more than 70% sand settles within a minute.",
  },
  {
    id: "clay",
    name: "Clay soil",
    description:
      "Dense, fine-particled soil that is rich in nutrients but holds water, drains slowly and compacts easily.",
    drainage: "wet",
    nutrients: "high",
    typicalPh: { min: 6.0, max: 7.5 },
    pros: [
      "Holds water and nutrients well",
      "Naturally fertile",
      "Good for crops like brassicas and many perennials once improved",
    ],
    cons: [
      "Slow to warm in spring",
      "Waterlogs and compacts; roots can suffocate",
      "Heavy, sticky when wet and rock-hard when dry",
    ],
    improveWith: [
      "Add plenty of compost and leaf mold to build structure (not sand, which can create concrete-like soil)",
      "Use raised beds or mounded rows for drainage",
      "Avoid working it when wet",
      "Plant deep-rooted cover crops such as daikon radish or rye",
      "Mulch with coarse organic material",
    ],
    identify:
      "Squeeze test: a moist handful forms a sticky ball that holds its shape and makes a long smooth ribbon when pressed between thumb and finger. Jar test: more than 40% clay settles as a thick layer on top after 24-48 hours.",
  },
  {
    id: "silt",
    name: "Silt soil",
    description:
      "Smooth, flour-like soil with fine particles that holds moisture and nutrients well, but compacts and crusts easily.",
    drainage: "moist",
    nutrients: "high",
    typicalPh: { min: 6.0, max: 7.0 },
    pros: [
      "Fertile and holds moisture well",
      "Easier to dig than clay",
      "Good for most vegetables and fruit",
    ],
    cons: [
      "Compacts and forms a surface crust",
      "Prone to erosion",
      "Drains slower than loam",
    ],
    improveWith: [
      "Add compost and organic mulch to improve structure",
      "Avoid walking on beds; use raised beds or paths",
      "Cover bare soil with cover crops or mulch",
      "Add coarse material like grit or fine bark in heavy areas",
    ],
    identify:
      "Squeeze test: feels smooth and soapy, like flour or talcum powder when dry. A moist ball holds shape but does not make a long ribbon. Jar test: a distinct middle layer of silt settles after a few hours.",
  },
  {
    id: "peat",
    name: "Peat soil",
    description:
      "Dark, spongy, organic-rich soil that holds a lot of water and is typically acidic and low in nutrients such as calcium.",
    drainage: "moist",
    nutrients: "moderate",
    typicalPh: { min: 3.5, max: 6.0 },
    pros: [
      "Holds large amounts of water",
      "Light and easy to dig",
      "Great for acid-loving plants like blueberries",
    ],
    cons: [
      "Highly acidic and can be low in nutrients",
      "Waterlogs when wet, becomes hard to rewet when dry",
      "Peat is a non-renewable resource; harvesting harms wetlands",
    ],
    improveWith: [
      "Add lime to raise pH for vegetables",
      "Mix in compost and sand or grit for drainage",
      "Add balanced fertilizer, as nutrients are limited",
      "Use coco coir as a renewable substitute in potting mixes",
    ],
    identify:
      "Looks dark brown or black, feels spongy and fibrous. A squeezed handful releases water and leaves a dark stain. Soil often sits in low, boggy areas.",
  },
  {
    id: "chalky",
    name: "Chalky soil",
    description:
      "Alkaline, stony soil rich in calcium carbonate that drains fast and can lock up iron and manganese.",
    drainage: "well-drained",
    nutrients: "low",
    typicalPh: { min: 7.5, max: 8.5 },
    pros: [
      "Drains freely",
      "Suits lime-loving plants such as lavender, clematis and brassicas",
      "Rarely waterlogged",
    ],
    cons: [
      "High pH causes yellowing (chlorosis) in acid-loving plants",
      "Stony and shallow, dries quickly",
      "Low in nutrients, especially iron and manganese",
    ],
    improveWith: [
      "Add plenty of compost and well-rotted manure",
      "Use chelated iron or sulfur to lower pH locally",
      "Mulch to hold moisture",
      "Grow acid-lovers in containers or raised beds",
      "Feed regularly, as nutrients wash away",
    ],
    identify:
      "Pale, stony, often with visible white chalk or limestone lumps. A few drops of vinegar fizz on contact. A soil pH test reads above 7.5.",
  },
  {
    id: "potting-mix",
    name: "Potting mix",
    description:
      "Soilless blend of peat or coco coir, perlite or vermiculite and bark, designed for containers. Light, sterile and well-aerated.",
    drainage: "well-drained",
    nutrients: "moderate",
    typicalPh: { min: 5.5, max: 6.5 },
    pros: [
      "Light and sterile; free of most weeds and diseases",
      "Drains and holds water well in pots",
      "Consistent quality",
    ],
    cons: [
      "Nutrients run out in 4-8 weeks; regular feeding is needed",
      "Can dry out or become hydrophobic",
      "Breaks down and compacts over a season or two",
    ],
    improveWith: [
      "Mix in slow-release fertilizer or compost",
      "Add perlite for extra drainage or coco coir for water retention",
      "Refresh or replace every 1-2 years",
      "Never use garden soil in pots; it compacts",
    ],
    identify:
      "Light, fluffy and dark brown, with white perlite or vermiculite flecks and bark pieces. A moist handful springs back when squeezed.",
  },
  {
    id: "cactus-mix",
    name: "Cactus mix",
    description:
      "Fast-draining, gritty blend of potting mix with sand, perlite, pumice or grit for cacti and succulents.",
    drainage: "well-drained",
    nutrients: "low",
    typicalPh: { min: 6.0, max: 7.0 },
    pros: [
      "Drains very fast, which prevents rot",
      "Dries out quickly after watering",
      "Mimics desert conditions",
    ],
    cons: [
      "Holds almost no water, so it dries between waterings",
      "Few nutrients",
      "Pots may need heavy bases because the mix is light",
    ],
    improveWith: [
      "Make your own with 1 part potting mix, 1 part coarse sand and 1 part perlite or pumice",
      "Top-dress with grit for stability and to keep stems dry",
      "Feed with dilute cactus fertilizer in spring and summer",
      "Use unglazed terracotta pots to speed drying",
    ],
    identify:
      "Visibly gritty with sand, pumice or perlite particles. Water runs through almost immediately and the mix falls apart after squeezing.",
  },
  {
    id: "orchid-bark",
    name: "Orchid bark mix",
    description:
      "Coarse chunks of fir bark, charcoal and perlite or sphagnum that give epiphytic orchid roots plenty of air.",
    drainage: "well-drained",
    nutrients: "low",
    typicalPh: { min: 5.5, max: 6.5 },
    pros: [
      "Excellent airflow for epiphytic roots",
      "Drains instantly, preventing root rot",
      "Suits orchids, bromeliads and some aroids",
    ],
    cons: [
      "Dries quickly and needs more frequent watering or soaking",
      "Breaks down in 1-2 years and then holds too much water",
      "Few nutrients; regular feeding required",
    ],
    improveWith: [
      "Soak bark overnight before use so it absorbs water",
      "Add charcoal and perlite for drainage and freshness",
      "Mix in a little sphagnum moss to retain moisture",
      "Repot every 1-2 years as the bark decays",
      "Feed with dilute orchid fertilizer",
    ],
    identify:
      "Looks like chunky bark pieces about 1/4 to 1 inch across with lots of air gaps; water drains straight through and there is no fine soil.",
  },
];

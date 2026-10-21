// Safe and unsafe greens/chickens-feed plants for Kerala conditions.
// ═══════════════════════════════════════════════════════════════════════════
// 🌿  GREENS DATA
// ═══════════════════════════════════════════════════════════════════════════
const SAFE_GREENS = [
  {
    name:"Banana Stem (Trunk core)", icon:"🍌", benefit:"Hydration, fibre, potassium, Vitamin B6. Reduces Salmonella risk. Old-time Kerala remedy. Helps digestion.",
    howToFeed:"Chop inner soft core into small pieces. Feed occasionally — once or twice a week as supplement. Very high water content — chickens love it in summer.",
    frequency:"1–2x per week", qty:`Handful per ${10} birds`, season:"Year round (chop after harvest)", local:true, medicinal:false
  },
  {
    name:"Banana Leaves", icon:"🍌", benefit:"Rich in polyphenols, antioxidants. Good as occasional fodder. Also useful as a litter liner.",
    howToFeed:"Tear or chop fresh leaves. Spread on coop floor as enrichment — chickens will peck at them.",
    frequency:"Occasional", qty:"A few leaves", season:"Year round", local:true, medicinal:false
  },
  {
    name:"Papaya Leaves (Unripe fruit & seeds)", icon:"🥭", benefit:"Natural dewormer (papain enzyme). Anticoccidial properties. Antibacterial. Antifungal. Boosts immunity. UNRIPE fruit/seeds have the highest benefit.",
    howToFeed:"Fresh papaya leaves: chop and mix with feed (small amounts). Unripe papaya: cut and offer directly. Seeds: grind 1–2 seeds per bird into feed weekly as dewormer.",
    frequency:"Leaves: 2–3x per week. Seeds: weekly as dewormer", qty:"2–3 leaves or half an unripe fruit for 10 birds", season:"Year round in Kerala", local:true, medicinal:true
  },
  {
    name:"Moringa / Drumstick Leaves (Muringa)", icon:"🌿", benefit:"Extremely nutritious — protein, calcium, iron, Vitamin A, C, E. Improves egg yolk colour. Boosts immunity. Called 'miracle tree'. Well studied in poultry nutrition.",
    howToFeed:"Fresh or dried leaves. Mix into feed or hang bunches in coop for pecking. Can replace 5% of normal feed by weight.",
    frequency:"Daily if available", qty:"Small handful per day for 10 birds", season:"Year round in Kerala", local:true, medicinal:true
  },
  {
    name:"Spinach / Cheera (Amaranthus)", icon:"🥬", benefit:"Iron, calcium, Vitamins A, C, K. Improves egg production. Feed in moderation — oxalic acid in large amounts binds calcium.",
    howToFeed:"Fresh leaves, raw. Do NOT cook. Small amounts mixed with regular feed.",
    frequency:"2–3x per week (moderation!)", qty:"Small handful", season:"Year round, grows easily", local:true, medicinal:false
  },
  {
    name:"Sweet Potato Leaves", icon:"🍠", benefit:"High protein (the leaves, not the tuber). Rich in antioxidants. Good digestibility. Very common in Kerala gardens.",
    howToFeed:"Chop fresh leaves and mix with feed. Chickens enjoy them.",
    frequency:"3–4x per week", qty:"Generous handful", season:"Year round in Kerala", local:true, medicinal:false
  },
  {
    name:"Neem Leaves (Veppu)", icon:"🌿", benefit:"Natural antiparasitic, antibacterial, antiviral. Helps prevent worms and external parasites. Bitter — use in small amounts. Boosts immunity.",
    howToFeed:"Add a few fresh neem leaves to coop as scatter — birds will selectively peck. Can also make neem leaf water (boil 10 leaves in 1L water, cool, add to drinker 1x per week).",
    frequency:"Once a week (small amount)", qty:"5–10 leaves", season:"Year round", local:true, medicinal:true
  },
  {
    name:"Turmeric / Manjal (leaf or powder)", icon:"🟡", benefit:"Anti-inflammatory, antibacterial, antiviral. Improves gut health. Brightens egg yolks. Well studied in poultry — reduces ammonia in droppings.",
    howToFeed:"1/4 teaspoon turmeric powder per kg of feed. Or add fresh turmeric leaves chopped into feed occasionally.",
    frequency:"Daily in feed (powder) or 2x week (fresh leaf)", qty:"1/4 tsp powder per kg feed", season:"Year round", local:true, medicinal:true
  },
  {
    name:"Ginger / Inji", icon:"🫚", benefit:"Natural antibiotic, anti-inflammatory. Helps respiratory health. Especially useful during monsoon when CRD risk rises.",
    howToFeed:"Grate fresh ginger, add to water (1 small piece per litre). Or dry and powder — add tiny pinch per bird to feed.",
    frequency:"Once a week in water or feed", qty:"1 small piece per litre of water", season:"Year round", local:true, medicinal:true
  },
  {
    name:"Curry Leaves / Kariveppu", icon:"🌿", benefit:"Rich in calcium, phosphorus, iron. Antimicrobial. Stimulates digestion. Natural deodoriser — reduces coop smell.",
    howToFeed:"Scatter fresh leaves in coop or mix with feed. Chickens peck selectively.",
    frequency:"2–3x per week", qty:"Small bunch", season:"Year round in Kerala", local:true, medicinal:false
  },
  {
    name:"Pumpkin / Mathanga (fruit and seeds)", icon:"🎃", benefit:"Natural dewormer (pumpkin seeds — cucurbitacin compound). High in Vitamin A. Improves immune function and egg yolk colour.",
    howToFeed:"Cut pumpkin in half — chickens peck freely. Seeds can be ground and mixed into feed for deworming.",
    frequency:"1–2x per week", qty:"Half a medium pumpkin for 10 birds", season:"Year round, very common in Kerala", local:true, medicinal:true
  },
  {
    name:"Hibiscus Leaves & Flowers (Chembarathi)", icon:"🌺", benefit:"Rich in Vitamin C. Antioxidant. Reduces heat stress. Very common in Kerala compounds.",
    howToFeed:"Fresh flowers and leaves — just scatter or chop and add to feed.",
    frequency:"2–3x per week", qty:"4–5 flowers/leaves", season:"Year round", local:true, medicinal:false
  },
  {
    name:"Lemongrass / Inchi Pula", icon:"🌾", benefit:"Antibacterial, antifungal. Repels insects. Excellent for respiratory health. Can reduce mosquitoes near coop.",
    howToFeed:"Crush a few stalks and place in coop corners. Can steep in water for drinker (1–2 stalks per litre, let cool).",
    frequency:"Once a week in water, constant in coop", qty:"2–3 stalks", season:"Year round", local:true, medicinal:true
  },
];

const UNSAFE_GREENS = [
  { name:"Avocado leaves/skin/seed", icon:"🥑", reason:"Contains persin — highly toxic, causes heart failure in birds. The flesh is safe but never leaves, skin, or seed." },
  { name:"Raw beans (uncooked)", icon:"🫘", reason:"Hemagglutinin toxin causes red blood cell clumping. ALWAYS cook beans before feeding. Even a few raw kidney beans can kill." },
  { name:"Onion / Shallot / Ulli", icon:"🧅", reason:"Sulfur compounds cause hemolytic anaemia. Also makes eggs taste of onion. Avoid completely." },
  { name:"Nightshade plants (tomato/potato leaves, brinjal leaves)", icon:"🍅", reason:"Solanine toxin in leaves and stems. Fruit is safe but green parts are toxic. Keep chickens away from tomato/potato garden areas." },
  { name:"Rhubarb leaves", icon:"🌿", reason:"Very high oxalic acid — causes kidney failure. Not common in Kerala but worth knowing." },
  { name:"Raw potato / potato peel", icon:"🥔", reason:"Solanine in raw potato and especially green potato skin. Cooked potato is fine." },
  { name:"Castor bean / Amanakku", icon:"☠️", reason:"Ricin is one of the most toxic natural substances known. Even small amounts are fatal. Very common in Kerala — keep chickens far away from castor plants." },
  { name:"Oleander / Arali", icon:"🌸", reason:"All parts are highly toxic. Contains cardiac glycosides that cause heart failure. Very common ornamental plant in Kerala — fence off or remove from coop area." },
  { name:"Croton / Crotton plant", icon:"🍃", reason:"Toxic diterpenoids cause severe gastrointestinal damage and liver failure." },
  { name:"Mango leaves (in large amounts)", icon:"🥭", reason:"Fine as occasional scatter but high tannin content in large amounts causes digestive upset. Don't overfeed." },
  { name:"Coffee / Caffeine (coffee grounds)", icon:"☕", reason:"Caffeine is toxic to poultry. Never add coffee grounds to feed or litter." },
  { name:"Chocolate / Cocoa", icon:"🍫", reason:"Theobromine is toxic — can cause cardiac arrhythmia and death." },
];

export { SAFE_GREENS, UNSAFE_GREENS };

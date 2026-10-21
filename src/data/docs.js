// Curated BV380 reference documents + local knowledge-base search.
const BV380_REFERENCE_DOCS = [
  {
    title: "Hot & Tropical Climates Guide",
    type: "PDF",
    note: "Best official fit for South Indian farm conditions including heat, ventilation, water, and light management.",
    url: "https://layinghens.hendrix-genetics.com/documents/2034/Management_Guide_Hot_and_Tropical_Climate_EN_4.pdf",
    source: "Official Hendrix Genetics guide",
  },
  {
    title: "Tropical Rearing Tips",
    type: "PDF",
    note: "Focused practical paper for rearing pullets under hot and tropical conditions.",
    url: "https://layinghens.hendrix-genetics.com/documents/974/Tips_and_Tricks_for_Rearing_Poultry_in_Hot_and_Tropical_Climates_EN.pdf",
    source: "Official Hendrix Genetics paper",
  },
  {
    title: "Optimal Chick Start",
    type: "PDF",
    note: "Direct chick-start guidance for feed, water, density, light, temperature, and humidity during early brooding.",
    url: "https://layinghens.hendrix-genetics.com/documents/2020/HGL_Layer_Vision_29_October_2023_EN.pdf",
    source: "Official Hendrix Genetics paper",
  },
  {
    title: "Nutrition Guide 2025",
    type: "PDF",
    note: "Useful for feed formulation and nutrient targets when adjusting the BV380 feeding programme.",
    url: "https://layinghens.hendrix-genetics.com/documents/2396/Nutrition_Guide_2025_vs2.pdf",
    source: "Official Hendrix Genetics guide",
  },
  {
    title: "Preparing the Long-Life Layer",
    type: "PDF",
    note: "Supporting paper for pullet growth, bodyweight targets, and the transition into lay.",
    url: "https://layinghens.hendrix-genetics.com/documents/1260/Preparing_the_long-life_Layer.pdf",
    source: "Official Hendrix Genetics paper",
  },
];

const BV380_DOC_KNOWLEDGE = [
  {
    id: "doc-hot-climate-water",
    title: "Hot Climate Water Management",
    source: "Hot & Tropical Climates Guide",
    tags: ["heat", "summer", "water", "kerala", "tropical", "drinkers", "electrolytes"],
    text: "In hot and tropical conditions, birds must have cool clean water available at all times. Increase drinker checks during afternoon heat, keep water shaded, and use electrolyte or vitamin support after heat stress. Wet litter, stale water, and poor drinker hygiene quickly worsen disease pressure in humid Kerala-style weather.",
  },
  {
    id: "doc-hot-climate-ventilation",
    title: "Ventilation And Housing",
    source: "Hot & Tropical Climates Guide",
    tags: ["housing", "ventilation", "humidity", "ammonia", "kerala", "rain"],
    text: "Tropical layer housing must prioritize airflow, dry litter, and low ammonia. Open-sided houses need strong cross ventilation, protection from rain splash, and frequent replacement of damp litter patches. Heat and humidity together reduce feed intake and increase stress, so crowding and poor airflow should be avoided.",
  },
  {
    id: "doc-tropical-rearing-chick",
    title: "Chick Brooding In Tropical Conditions",
    source: "Tropical Rearing Tips",
    tags: ["chick", "brooding", "brooder", "temperature", "humidity", "starter"],
    text: "Early chick management in tropical conditions depends on correct brooder temperature, dry bedding, fast access to feed and water, and frequent observation. Chicks that huddle are too cold, chicks far from the heat source may be too hot, and uneven spread suggests setup problems. The first week should focus on stable temperature, hydration, and easy feed access.",
  },
  {
    id: "doc-optimal-chick-start",
    title: "Optimal Chick Start",
    source: "Optimal Chick Start",
    tags: ["chick", "start", "feed", "water", "light", "placement"],
    text: "A strong chick start requires immediate placement with feed and water already ready, bright enough light for chicks to find resources, and close monitoring in the first days. Early intake drives later bodyweight and uniformity. Poor chick start cannot be fully recovered later, so the first days are critical for future laying performance.",
  },
  {
    id: "doc-feed-phases",
    title: "BV380 Feed Phases",
    source: "Embedded Farm Programme",
    tags: ["feed", "phase", "starter", "grower", "pre-layer", "layer"],
    text: "The current BV380 programme in this app uses pre-starter on days 1 to 7, starter through day 42, grower I through day 70, grower II through day 120, pre-layer through day 140, and layer feed from day 141 onward. Feed changes should be gradual across transition weeks to avoid intake drops and gut upset.",
  },
  {
    id: "doc-grower-calcium",
    title: "Do Not Start Layer Feed Too Early",
    source: "Embedded Farm Programme",
    tags: ["calcium", "grower", "pre-layer", "kidney", "layer feed"],
    text: "Developer or grower feed should continue until the pre-layer window because high-calcium layer feed given too early can damage kidneys and reduce long-term pullet development. Pre-layer feed and calcium grit should be introduced close to point of lay, not in mid-grower stage.",
  },
  {
    id: "doc-lighting-to-lay",
    title: "Lighting For Transition To Lay",
    source: "Embedded Farm Programme + Long-Life Layer Paper",
    tags: ["light", "lay", "pre-lay", "photo stimulation", "hours"],
    text: "The flock should remain around 14 hours of light during grower weeks, then be stepped up during weeks 16 to 20 until 16 hours total light is reached before lay. Once production starts, light hours should not be reduced. Sudden drops in light can harm laying consistency.",
  },
  {
    id: "doc-lay-readiness",
    title: "Preparing For Start Of Lay",
    source: "Preparing the Long-Life Layer",
    tags: ["lay", "bodyweight", "uniformity", "nest boxes", "pre-layer"],
    text: "Good lay performance depends on pullets reaching target bodyweight, maintaining uniformity, and moving into lay without stress. Before expected lay, nest boxes, calcium access, and light programme should already be ready. Birds that are underweight or uneven at this stage often show weaker early production.",
  },
  {
    id: "doc-weight-targets",
    title: "Bodyweight Tracking",
    source: "Embedded Farm Programme",
    tags: ["weight", "bodyweight", "uniformity", "growth"],
    text: "The app includes staged BV380 weight targets from week 1 through week 18. Random sample weighing is useful for checking whether the flock is on track. If birds are below expected target ranges, feed quality, intake, water access, and health status should be reviewed early rather than waiting until lay.",
  },
  {
    id: "doc-feed-tomorrow",
    title: "Prepare Feed One Day Early",
    source: "Operational Planning Rule",
    tags: ["tomorrow", "prep", "feed planning", "mixing", "purchase"],
    text: "For farm operations, next-day feed should be prepared or planned one day early, especially near phase changes. When tomorrow starts a new phase, the correct feed bag, mixing ratio, and water plan should be ready today so there is no morning delay.",
  },
  {
    id: "doc-vaccination-practice",
    title: "Vaccination And Stress Control",
    source: "Embedded Farm Programme",
    tags: ["vaccination", "stress", "water", "brooding", "health"],
    text: "Vaccination works best when birds are healthy, hydrated, and not under strong heat stress. Drinkers used for live vaccine should be clean and free from chlorine residues. Avoid unnecessary stress before and after vaccination and follow the age schedule consistently.",
  },
  {
    id: "doc-nutrition",
    title: "Nutrition Priorities",
    source: "Nutrition Guide 2025",
    tags: ["nutrition", "protein", "energy", "amino acids", "layer", "grower"],
    text: "Nutrition should match the flock stage. Starter phases require higher protein support, grower phases focus on controlled development, and pre-layer plus layer phases need balanced calcium, phosphorus, and production nutrients. In hot weather, intake may fall, so feed quality and nutrient density matter more.",
  },
];

function tokenizeForSearch(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function searchDocKnowledge(query, limit = 5) {
  const qTokens = tokenizeForSearch(query);
  if (!qTokens.length) return [];
  return BV380_DOC_KNOWLEDGE.map(chunk => {
    const haystack = `${chunk.title} ${chunk.source} ${chunk.text} ${chunk.tags.join(" ")}`.toLowerCase();
    let score = 0;
    qTokens.forEach(token => {
      if (chunk.tags.some(tag => tag.includes(token))) score += 4;
      if (chunk.title.toLowerCase().includes(token)) score += 3;
      if (chunk.source.toLowerCase().includes(token)) score += 2;
      if (haystack.includes(token)) score += 1;
    });
    return { ...chunk, score };
  })
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function buildLocalDocAnswer(question, sources) {
  if (!sources.length) {
    return "I could not find a matching answer in the built-in BV380 knowledge base.";
  }
  const q = question.toLowerCase();
  const top = sources.slice(0, 3);
  const primary = top[0];

  const extractSentences = text => String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean);

  const firstUsefulSentence = text => extractSentences(text)[0] || String(text || "");

  const classifyQuestion = () => {
    if (/(weight|body ?weight|uniform|growth|track)/.test(q)) return "weight";
    if (/(chick|brood|brooder|first week|placement|start)/.test(q)) return "chick";
    if (/(heat|tropical|summer|humidity|monsoon|ventilation|kerala)/.test(q)) return "climate";
    if (/(lay|egg|pre-?lay|nest|calcium|light)/.test(q)) return "lay";
    if (/(feed|starter|grower|layer feed|pre-layer|nutrition)/.test(q)) return "feed";
    if (/(vaccine|vaccination|stress|disease|health)/.test(q)) return "health";
    return "general";
  };

  const type = classifyQuestion();
  const answerLineByType = {
    weight: "Bodyweight tracking should be used as an early warning tool, not only as a record. The flock should be weighed in random samples and compared against the staged BV380 target ranges so action can be taken before lay.",
    chick: "Early chick management has the biggest long-term effect on later bodyweight and laying performance. Feed, water, temperature, and observation must all be right from the first days.",
    climate: "In Kerala-like tropical conditions, heat, humidity, stale water, and poor airflow are major operational risks. Water management and ventilation should be treated as daily priorities.",
    lay: "As the flock approaches lay, bodyweight, uniformity, calcium access, nest preparation, and the light programme need to be ready together. Weak preparation at this stage usually shows up as weaker early production.",
    feed: "Feed decisions should follow the flock stage closely. Phase changes should be gradual, and feed quality matters more when intake is reduced by heat or stress.",
    health: "Health and stress control work best when birds are hydrated, feed intake is stable, and routine handling is calm. Preventive steps matter more than recovery after stress.",
    general: firstUsefulSentence(primary.text),
  };

  const actionLines = [];
  if (type === "weight") {
    actionLines.push("Weigh a small random sample of birds regularly and compare it with the app's target range.");
    actionLines.push("If birds are below target, review feed intake, water access, feed quality, and health immediately.");
    actionLines.push("Do not wait until laying starts to correct poor growth or poor uniformity.");
  } else if (type === "chick") {
    actionLines.push("Prepare feed and water before chicks are placed.");
    actionLines.push("Watch chick spread under the brooder to judge temperature and comfort.");
    actionLines.push("Treat the first week as critical because weak intake early is hard to recover later.");
  } else if (type === "climate") {
    actionLines.push("Check drinkers more often in afternoon heat and keep water cool and clean.");
    actionLines.push("Keep airflow strong, reduce damp litter, and prevent ammonia buildup.");
    actionLines.push("Treat humidity plus heat as a combined risk, especially during monsoon or hot summer days.");
  } else if (type === "lay") {
    actionLines.push("Before expected lay, confirm target bodyweight, nest readiness, calcium access, and light schedule.");
    actionLines.push("Avoid reducing light hours once production is approaching or active.");
    actionLines.push("Underweight or uneven pullets should be corrected before lay rather than after production starts.");
  } else if (type === "feed") {
    actionLines.push("Use the flock stage to decide whether starter, grower, pre-layer, or layer feed is appropriate.");
    actionLines.push("Handle feed transitions gradually to avoid intake drops or gut upset.");
    actionLines.push("Do not start high-calcium layer feed too early in grower birds.");
  } else if (type === "health") {
    actionLines.push("Keep birds hydrated and calm before any vaccination or stressful handling.");
    actionLines.push("Use clean water systems and avoid avoidable heat stress around health events.");
    actionLines.push("Follow the age schedule consistently and intervene early when birds are off feed or weak.");
  } else {
    top.forEach(source => actionLines.push(firstUsefulSentence(source.text)));
  }

  const whyLines = top.map((source, idx) => `[${idx + 1}] ${firstUsefulSentence(source.text)}`);
  const sourceLine = `Sources used: ${top.map((source, idx) => `[${idx + 1}] ${source.title}`).join(", ")}`;

  return [
    `Answer`,
    answerLineByType[type],
    ``,
    `What To Do`,
    ...actionLines.map(line => `- ${line}`),
    ``,
    `Why`,
    ...whyLines.map(line => `- ${line}`),
    ``,
    sourceLine,
  ].join("\n");
}

export { BV380_REFERENCE_DOCS, searchDocKnowledge, buildLocalDocAnswer };

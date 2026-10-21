// Poultry disease reference data for the health tab.
// ═══════════════════════════════════════════════════════════════════════════
// 🩺  HEALTH DATA
// ═══════════════════════════════════════════════════════════════════════════
const DISEASES = [
  {
    id:"crd", name:"CRD / Mycoplasma", icon:"😮‍💨", color:"#90CAF9",
    symptoms:["Nasal discharge / mucus from nostrils","Wheezing, rattling, gurgling sounds when breathing","Swollen face or eyes (sinusitis)","Reduced feed intake, dull and lethargic","Coughing, sneezing continuously","Drop in egg production"],
    causes:"Mycoplasma gallisepticum bacteria. Spreads via contaminated air, water, equipment. Stress, overcrowding, poor ventilation trigger outbreaks.",
    treatment:["Tylosin (Tylan) in water: 500mg/litre for 5 days — most effective for Mycoplasma","Enrofloxacin (Baytril) 10mg/kg body weight for 5 days — broad spectrum","Doxycycline (available as Doxyvet) in water for 5–7 days","Add electrolyte + vitamin C supplement to boost immunity","Isolate sick birds immediately","Improve ventilation — remove ammonia buildup"],
    prevention:["Vaccinate with MG bacterin if available","Never mix birds of different ages","Disinfect drinkers daily with potassium permanganate","Keep litter dry — wet litter causes respiratory infections"],
    medicines:["Tylosin (Tylan Soluble) — veterinary pharmacies","Enrofloxacin (Baytril/Quintas) — prescription needed","Doxycycline (Doxyvet, Dox-O-Sol)","Vitamin C + Electrolyte powder (Rehydion, Electral-Vet)"],
    severity:"medium", vetNeeded:false,
    note:"Most common disease in Kerala backyard flocks. Stress after rains triggers outbreaks. Keep coop dry."
  },
  {
    id:"ranikhet", name:"Ranikhet / Newcastle Disease (ND)", icon:"⚠️", color:"#EF9A9A",
    symptoms:["Sudden deaths — multiple birds in 1–2 days","Twisting of neck, walking in circles (nervous form)","Greenish watery diarrhoea","Gasping for breath, gurgling","Swollen eyes and face","Complete stop in egg laying","Blue or purple discoloration of comb"],
    causes:"Newcastle Disease Virus (NDV). Highly contagious. Spreads through droppings, contaminated water, wild birds, clothing of visitors. Mortality up to 100% in unvaccinated flocks.",
    treatment:["NO CURE — prevention by vaccination is the only solution","Supportive care: electrolytes + vitamins in water","Isolate and cull severely affected birds to stop spread","Antibiotic (Amoxicillin) to prevent secondary bacterial infections","Notify nearby poultry farmers immediately","Disinfect entire coop with Virkon S or bleach solution"],
    prevention:["Day 5–7: Lasota F strain vaccine (eye drops) ✅ Already in your schedule","Day 70: Lasota booster ✅ Already in your schedule","Day 120: R2B/Mukteswar ✅ Already in your schedule","Never allow visitors into coop without foot dip","Burn/bury all dead birds — do NOT throw in open"],
    medicines:["No antiviral medicine available — vaccination is only protection","Amoxicillin (Amoxysol) for secondary infection prevention","Electral-Vet or ORS + glucose for supportive care","Virkon S disinfectant for coop"],
    severity:"critical", vetNeeded:true,
    note:"Most dangerous disease for Kerala poultry. Your vaccination schedule already covers this. Stay on schedule!"
  },
  {
    id:"gumboro", name:"Gumboro / IBD (Infectious Bursal Disease)", icon:"🫁", color:"#CE93D8",
    symptoms:["Watery white or yellowish diarrhoea","Birds look depressed, sitting hunched","Ruffled feathers, shivering","Loss of appetite suddenly","Picking at their own vent area","Increased mortality at 3–6 weeks age","Birds look 'sleepy' with eyes half closed"],
    causes:"IBD virus attacks the Bursa of Fabricius (immune organ). Most dangerous at 3–6 weeks age. Spreads through contaminated litter, droppings, water, feed equipment.",
    treatment:["No specific antiviral cure","Vitamin + electrolyte supplementation immediately","Glucose 5g per litre of water for energy","Vitamin AD3E supplement to boost recovery","Anti-stress supplement (B-complex)","Remove wet litter, keep coop clean and dry","Mild cases recover in 1 week with good supportive care"],
    prevention:["Day 10–14: IBD vaccine ✅ Already in your schedule","Day 24–28: IBD booster ✅ Already in your schedule","Strict biosecurity at 3–6 week age","Thorough cleaning and disinfection between batches"],
    medicines:["No specific medicine","Vita Plus or Aminovit (Vitamin + Amino acid supplement)","Glucose powder (Glucolin or plain sugar as emergency)","AD3E vitamin supplement","Electral-Vet for rehydration"],
    severity:"high", vetNeeded:false,
    note:"Covered by your Day 10 & Day 24 vaccination. Main risk is in chicks 3–6 weeks. After vaccination window passes, risk drops significantly."
  },
  {
    id:"coccidiosis", name:"Coccidiosis", icon:"🔴", color:"#FF8A65",
    symptoms:["Bloody or dark reddish-brown droppings","Pale comb and wattles (anaemia)","Diarrhoea, watery stools","Birds sitting in corners, hunched","Loss of appetite, severe weight loss","Ruffled feathers, drooping wings","Sudden death in young birds (3–8 weeks)"],
    causes:"Eimeria protozoan parasite. Lives in wet, dirty litter. Young birds (2–8 weeks) most vulnerable. Warm humid Kerala climate accelerates spread. Overcrowding worsens it.",
    treatment:["Amprolium (Coxistac/Ampro) in water for 5–7 days — first choice","Sulpha-TMP (Sulphadimethoxine + TMP) in water for 5 days","Toltrazuril (Baycox) — single dose, highly effective","After treatment: give Vitamin K for 3 days to stop bleeding","Give ADE vitamins for recovery","Remove and replace wet litter immediately"],
    prevention:["Keep litter DRY — the single most important prevention","Raise feed and water containers to reduce contamination","Gradual exposure to litter at young age builds immunity","Amprolium can be used preventively in high-risk periods","Allow dust bathing — natural behaviour reduces stress"],
    medicines:["Amprolium 20% (Coxistac, Amprovine) — water soluble","Sulphadimethoxine (Sulfadim) — water soluble","Toltrazuril (Baycox 2.5%) — most effective, single dose","Vitamin K injection or powder (AquaMephyton, Koagulant-K)","Vitamin ADE supplement after recovery"],
    severity:"high", vetNeeded:false,
    note:"Most common killer of chicks aged 2–8 weeks in Kerala. Wet litter = coccidiosis. Check litter every day. Dry litter = healthy birds."
  },
  {
    id:"fowlpox", name:"Fowl Pox", icon:"🔵", color:"#80DEEA",
    symptoms:["Wart-like scabs/bumps on comb, wattles, face, eyelids","Yellow sores inside the mouth or throat (wet pox)","Difficulty eating or swallowing","Eyes partially closed due to swelling","Reduced egg production","Weight loss and lethargy","Slow spreading — takes weeks to go through flock"],
    causes:"Fowl pox virus. Two forms: Dry pox (skin) and Wet pox (inside throat — more dangerous). Spreads through biting insects (mosquitoes) and direct contact with infected birds.",
    treatment:["No specific antiviral treatment","Apply iodine or betadine gently on skin lesions","For wet pox: carefully remove lesions from mouth with forceps, apply iodine","Antibiotic to prevent secondary infection (Oxytetracycline)","Vitamin A supplement — essential for healing mouth/eye lesions","Soft feed or mash if bird has difficulty swallowing","Isolate affected birds"],
    prevention:["Day 90: Fowl Pox vaccine (wing web stab) ✅ Already in your schedule","Control mosquitoes — use coil/net at night","Screen coop openings to prevent insect entry","Good overall management and nutrition"],
    medicines:["Betadine/Povidone iodine (topical on lesions)","Oxytetracycline (Terramycin, Oxybold) for secondary infections","Vitamin A supplement (Rovimix A)","ADE injection for severe cases (veterinarian)"],
    severity:"medium", vetNeeded:false,
    note:"Covered by your Day 90 vaccine. If pox appears despite vaccination, check if vaccine was stored correctly (must be cold chain)."
  },
  {
    id:"cholera", name:"Fowl Cholera", icon:"💛", color:"#FFF176",
    symptoms:["Sudden unexpected deaths (acute form)","Yellowish or greenish diarrhoea","Rapid breathing, open-beak breathing","Blue-purple discoloration of comb","Swollen joints (chronic form)","Swollen wattles, hot and painful","Mucus discharge from nose and mouth"],
    causes:"Pasteurella multocida bacteria. Spreads through contaminated water, soil, wild birds, rodents. Stress, wet conditions, and poor sanitation are risk factors.",
    treatment:["Sulpha drugs + TMP combination in water for 5–7 days","Enrofloxacin (10mg/kg) for 5 days — highly effective","Ampicillin injection for severe acute cases (vet)","Remove and safely dispose of dead birds immediately","Disinfect water containers and coop with Virkon S","Improve drainage around coop area"],
    prevention:["Keep rodents away from coop — they are major carriers","Good drainage — standing water near coop is a risk","Killed bacterin vaccine available — consult local vet","Do not bring new birds without quarantine period of 10 days"],
    medicines:["Sulpha-TMP (Sulfatrim, Trimetho-Sulpha) in water","Enrofloxacin (Enrox, Baytril) in water","Ampicillin injection — veterinarian only","Virkon S disinfectant for environment"],
    severity:"high", vetNeeded:true,
    note:"More common in wet Kerala conditions. Check drainage around coop. Dead birds must be buried 2 feet deep or burned — never left in open."
  },
  {
    id:"worms", name:"Internal Worms / Parasites", icon:"🪱", color:"#A5D6A7",
    symptoms:["Gradual weight loss despite eating well","Pale comb (anaemia from blood-sucking worms)","Watery diarrhoea","Reduced egg production in layers","Worms visible in droppings (roundworms look like spaghetti)","Dull, rough, dry feathers","Birds look thin and weak"],
    causes:"Roundworms (Ascaridia), Tapeworms, Cecal worms (Heterakis). Spread through contaminated soil and droppings. Earthworms and insects carry tapeworm eggs.",
    treatment:["Piperazine citrate in water for 1–2 days — for roundworms","Albendazole (Albomar, Valbazen) 10mg/kg single dose — broad spectrum","Fenbendazole (Safeguard) 5mg/kg for 5 days","After deworming: give ADE vitamins for recovery","Repeat deworming after 3 weeks","Papaya seeds (1–2 seeds per bird) — natural anthelmintic — grind and mix in feed"],
    prevention:["Deworm every 3 months as routine","Keep coop floor clean and dry","Rotate grazing areas if free range","Papaya seeds regularly as supplement"],
    medicines:["Piperazine citrate powder (Piperazin, Pip-Worm) — safe and cheap","Albendazole (Albomar Bolus, Valbazen) — ask for poultry dose","Fenbendazole (Safeguard, Panacur)","Levamisole HCl (Nilzan, Levacide) — injectable, vet"],
    severity:"low", vetNeeded:false,
    note:"Routine deworming every 90 days is essential in Kerala's humid climate. Papaya seeds are a proven natural dewormer — always available locally."
  },
  {
    id:"mites_lice", name:"Mites & Lice (Ectoparasites)", icon:"🐛", color:"#BCAAA4",
    symptoms:["Birds scratching and preening excessively","Feather loss especially around vent, neck, and wings","Pale comb — anaemia from blood loss (red mites)","Restless at night, not sleeping (red mites feed at night)","Tiny bugs visible on feathers or skin","Dark specks in coop corners and perches (mite eggs/droppings)","Reduced egg production"],
    causes:"Red mite (Dermanyssus gallinae) hides in coop cracks during day, feeds at night. Lice (Mallophaga) live permanently on bird. Spreads through new birds, wild birds, contaminated equipment.",
    treatment:["Dust birds with Sevin (Carbaryl) powder — safe and effective","Pyrethrin-based spray on birds and coop","Deltamethrin (Butox) — dilute and spray entire coop","Clean and spray all perches, nest boxes, coop corners","Repeat treatment after 7–10 days (to kill eggs that hatch)","Wood ash bath — provide a dust bath area with wood ash"],
    prevention:["Provide dust bath area always — birds self-treat by dust bathing","Inspect birds weekly for lice/mites","Check perches and cracks for red mites at night","Add neem leaves to nest boxes — natural repellent","Garlic in water (1 clove per litre) has some evidence for mite prevention"],
    medicines:["Sevin 5% dust (Carbaryl) — for birds and coop","Deltamethrin (Butox EC) — dilute 1ml in 1 litre water","Permethrin spray (Ectokill, Parastar) — for coop","Ivermectin (Ivomec) drops on skin — veterinarian recommended dose"],
    severity:"low", vetNeeded:false,
    note:"Very common in Kerala monsoon season. Wood ash dust bath is free, always available, and works well. Neem leaves in coop corners help repel insects."
  },
  {
    id:"eggdrop", name:"Egg Drop / Poor Production", icon:"🥚", color:"#FFB74D",
    symptoms:["Sudden drop in egg production","Soft-shelled or shell-less eggs","Pale or discoloured yolks","Rough or thin eggshells","Misshapen eggs","Birds appear otherwise healthy"],
    causes:"Multiple causes: insufficient calcium (most common), nutritional deficiency, stress, lighting insufficient (<16hrs), disease (ND, IBD), heat stress, sudden feed change, or not yet on layer feed.",
    treatment:["Check calcium: add oyster shell or limestone grit free access","Ensure 16 hours light per day (your app already tracks this)","Check you have switched to Layer feed at Day 141+","Vitamin AD3E supplement for 7–10 days","Reduce stress — avoid sudden changes, loud noises","Check for ND or IBD — diseases cause egg drop"],
    prevention:["Always have calcium grit freely available","Maintain 16 hour lighting from Day 112","Switch to Layer feed on time (Day 141)","Avoid sudden feed brand changes"],
    medicines:["Calcium grit / Oyster shell — always free access","Vitamin AD3E (Rovimix, AD3E powder)","Calcium + Vitamin D3 supplement (CalD3 Vet)","Shell-rite or Shell-Grit supplement"],
    severity:"low", vetNeeded:false,
    note:"99% of egg drop issues in backyard flocks are from insufficient calcium or insufficient light. Check these two things first before assuming disease."
  },
];

const SYMPTOM_CHECKLIST = [
  { q:"Are birds dying suddenly (1 or more per day)?", disease:["ranikhet","cholera"] },
  { q:"Twisting of neck, walking in circles?", disease:["ranikhet"] },
  { q:"Bloody or dark red droppings?", disease:["coccidiosis"] },
  { q:"Nasal discharge, rattling/wheezing sound?", disease:["crd"] },
  { q:"Watery white/yellow diarrhoea in chicks 3–6 weeks?", disease:["gumboro","coccidiosis"] },
  { q:"Wart-like bumps on face/comb/wattles?", disease:["fowlpox"] },
  { q:"Worms visible in droppings?", disease:["worms"] },
  { q:"Birds scratching, feather loss around vent?", disease:["mites_lice"] },
  { q:"Sudden drop in egg production or soft shells?", disease:["eggdrop","ranikhet","crd"] },
  { q:"Pale comb + gradual weight loss?", disease:["worms","mites_lice","coccidiosis"] },
];

export { DISEASES, SYMPTOM_CHECKLIST };

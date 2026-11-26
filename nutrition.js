// Athlete meal planning for older players (u19 / pro — ages 16+).
// General sports nutrition language only — not medical advice.

const NUTRITION_MIN_AGE = 16; // unlocks with u19 (16–18) and pro (19+) groups

const DIET_STYLES = [
  { id: "omnivore", label: "Omnivore", blurb: "Meat, fish, dairy, eggs, plants — no major limits." },
  { id: "pescatarian", label: "Pescatarian", blurb: "Fish and seafood yes; no meat from land animals." },
  { id: "vegetarian", label: "Vegetarian", blurb: "No meat or fish; eggs and dairy are OK." },
  { id: "vegan", label: "Vegan", blurb: "Plant-based only — no animal products." },
];

const DIET_TAGS = [
  { id: "halalFriendly", label: "Halal-friendly", blurb: "Prefer recipes without pork or alcohol." },
  { id: "glutenFree", label: "Gluten-free", blurb: "Hide recipes that use wheat, barley, or rye." },
];

const AVOID_OPTIONS = [
  { id: "dairy", label: "Dairy" },
  { id: "nuts", label: "Nuts" },
  { id: "eggs", label: "Eggs" },
  { id: "shellfish", label: "Shellfish" },
  { id: "pork", label: "Pork" },
  { id: "gluten", label: "Gluten / wheat" },
];

const SPICE_OPTIONS = [
  { id: "mild", label: "Mild" },
  { id: "medium", label: "Medium OK" },
  { id: "hot", label: "I like heat" },
];

const COOK_TIME_OPTIONS = [
  { id: 20, label: "Under 20 min" },
  { id: 35, label: "Under 35 min" },
  { id: 50, label: "Under 50 min" },
  { id: 90, label: "Any time" },
];

const MEAL_TYPES = [
  { id: "pre-match", label: "Pre-match", icon: "🏟️" },
  { id: "recovery", label: "Post-training", icon: "💪" },
  { id: "breakfast", label: "Breakfast", icon: "🌅" },
  { id: "snack", label: "Snack", icon: "🍌" },
];

const DEFAULT_NUTRITION = {
  dietText: "",
  style: "omnivore",
  tags: [],
  avoid: [],
  spice: "medium",
  maxMinutes: 50,
};

/** Quick phrases users can tap into the diet text field. */
const DIET_QUICK_PHRASES = [
  "omnivore",
  "vegetarian",
  "pescatarian",
  "vegan",
  "gluten free",
  "dairy free",
  "halal",
  "no nuts",
  "mild spice",
  "under 30 min",
];

/**
 * Parse free-text diet description into structured prefs for recipe filtering.
 * Synonyms: plant-based→vegan, veggie→vegetarian, fish-only→pescatarian, etc.
 */
function evaluateDietText(text, overrides = {}) {
  const raw = String(text || "").trim();
  const t = raw.toLowerCase().replace(/[_/]+/g, " ");

  let style = "omnivore";
  const tags = [];
  const avoid = [];
  let spice = "medium";
  let maxMinutes = 50;
  let spiceFromText = false;
  let minutesFromText = false;

  // Styles — most restrictive / specific first
  if (/\b(vegan|plant[\s-]*based|no\s+animal)\b/.test(t)) {
    style = "vegan";
  } else if (/\b(pescatarian|pesco[\s-]*tarian|fish[\s-]*only|seafood[\s-]*only)\b/.test(t)) {
    style = "pescatarian";
  } else if (/\b(vegetarian|veggie|meat[\s-]*free|no\s+meat)\b/.test(t)) {
    style = "vegetarian";
  } else if (/\b(omnivore|everything|no\s+restrictions|eat\s+everything)\b/.test(t)) {
    style = "omnivore";
  }

  // Tags + linked avoids
  if (/\b(gluten[\s-]*free|no\s+gluten|celiac|\bgf\b)\b/.test(t) || /\bwheat[\s-]*free\b/.test(t)) {
    tags.push("glutenFree");
    avoid.push("gluten");
  }
  if (/\bhalal\b/.test(t)) {
    tags.push("halalFriendly");
    avoid.push("pork");
  }

  // Avoid / allergies
  if (/\b(dairy[\s-]*free|no\s+dairy|without\s+dairy|lactose|no\s+milk|milk[\s-]*free)\b/.test(t)) {
    avoid.push("dairy");
  }
  if (/\b(nut[\s-]*free|no\s+nuts|without\s+nuts|tree[\s-]*nut|peanut)\b/.test(t)) {
    avoid.push("nuts");
  }
  if (/\b(egg[\s-]*free|no\s+eggs?|without\s+eggs?)\b/.test(t)) {
    avoid.push("eggs");
  }
  if (/\b(shellfish[\s-]*free|no\s+shellfish|avoid\s+shellfish|allergic\s+to\s+shellfish|no\s+shrimp|no\s+crab|no\s+lobster)\b/.test(t)) {
    avoid.push("shellfish");
  }
  if (/\b(no\s+pork|pork[\s-]*free|without\s+pork)\b/.test(t)) {
    avoid.push("pork");
  }
  if (/\b(no\s+wheat|wheat[\s-]*free|avoid\s+gluten|no\s+barley|no\s+rye)\b/.test(t)) {
    avoid.push("gluten");
    if (!tags.includes("glutenFree")) tags.push("glutenFree");
  }

  // Spice
  if (/\b(mild|no\s+spice|no\s+heat|not\s+spicy|low\s+spice)\b/.test(t)) {
    spice = "mild";
    spiceFromText = true;
  } else if (/\b(spicy|hot\s+spice|i\s+like\s+heat|extra\s+hot|chili|chilli)\b/.test(t)) {
    spice = "hot";
    spiceFromText = true;
  } else if (/\b(medium\s+spice|medium\s+heat)\b/.test(t)) {
    spice = "medium";
    spiceFromText = true;
  }

  // Cook time
  if (/\b(under\s*20|under\s*15|quick|15\s*min|20\s*min|fast\s+cook)\b/.test(t)) {
    maxMinutes = 20;
    minutesFromText = true;
  } else if (/\b(under\s*30|under\s*35|30\s*min|35\s*min)\b/.test(t)) {
    maxMinutes = 35;
    minutesFromText = true;
  } else if (/\b(under\s*45|under\s*50|45\s*min|50\s*min)\b/.test(t)) {
    maxMinutes = 50;
    minutesFromText = true;
  } else if (/\b(any\s+time|no\s+time\s+limit|slow\s+cook|90\s*min)\b/.test(t)) {
    maxMinutes = 90;
    minutesFromText = true;
  }

  // Form selects fill gaps; typed spice / cook time wins when present
  if (overrides.style) style = overrides.style;
  if (Array.isArray(overrides.tags)) {
    for (const x of overrides.tags) if (!tags.includes(x)) tags.push(x);
  }
  if (Array.isArray(overrides.avoid)) {
    for (const x of overrides.avoid) if (!avoid.includes(x)) avoid.push(x);
  }
  if (overrides.spice && !spiceFromText) spice = overrides.spice;
  if (overrides.maxMinutes != null && overrides.maxMinutes !== "" && !minutesFromText) {
    maxMinutes = Number(overrides.maxMinutes) || maxMinutes;
  }

  return {
    dietText: raw,
    style,
    tags: [...new Set(tags)],
    avoid: [...new Set(avoid)],
    spice,
    maxMinutes,
  };
}

/** Human-readable chips for what the evaluator understood. */
function dietUnderstoodLabels(prefs = {}) {
  const labels = [];
  const style = DIET_STYLES.find((d) => d.id === prefs.style);
  if (style) labels.push(style.label);
  for (const id of prefs.tags || []) {
    const tag = DIET_TAGS.find((t) => t.id === id);
    if (tag) labels.push(tag.label);
  }
  for (const id of prefs.avoid || []) {
    const opt = AVOID_OPTIONS.find((a) => a.id === id);
    labels.push(opt ? `Avoid ${opt.label.toLowerCase()}` : `Avoid ${id}`);
  }
  const spice = SPICE_OPTIONS.find((s) => s.id === prefs.spice);
  if (spice && prefs.spice !== "medium") labels.push(spice.label);
  const cook = COOK_TIME_OPTIONS.find((c) => c.id === Number(prefs.maxMinutes));
  if (cook && Number(prefs.maxMinutes) !== 50) labels.push(cook.label);
  return labels;
}

function dietUnderstoodHtml(prefs) {
  const labels = dietUnderstoodLabels(prefs);
  if (!labels.length) {
    return `<p class="diet-understood muted" data-diet-understood>Type a diet (e.g. “vegetarian, no dairy”) — we’ll show what we match.</p>`;
  }
  return `<p class="diet-understood" data-diet-understood><span class="muted">We understood:</span> ${
    labels.map((l) => `<span class="tag diet-eval-chip">${l}</span>`).join(" ")
  }</p>`;
}

/** Build a starter phrase from legacy structured prefs (no dietText yet). */
function synthesizeDietText(prefs = {}) {
  if (prefs.dietText) return prefs.dietText;
  const parts = [];
  const style = DIET_STYLES.find((d) => d.id === prefs.style);
  if (style && prefs.style !== "omnivore") parts.push(style.label.toLowerCase());
  for (const id of prefs.tags || []) {
    if (id === "glutenFree") parts.push("gluten free");
    if (id === "halalFriendly") parts.push("halal");
  }
  for (const id of prefs.avoid || []) {
    if (id === "dairy") parts.push("no dairy");
    else if (id === "nuts") parts.push("no nuts");
    else if (id === "eggs") parts.push("no eggs");
    else if (id === "shellfish") parts.push("no shellfish");
    else if (id === "pork") parts.push("no pork");
    else if (id === "gluten" && !(prefs.tags || []).includes("glutenFree")) parts.push("no gluten");
  }
  return parts.join(", ");
}

// diets[] = styles this recipe fits. contains[] = allergens / foods to avoid.
// spice: mild | medium | hot. mealType: pre-match | recovery | breakfast | snack.
// macros: approx per-serving estimates (kcal; protein/carbs/fat/fiber in grams).
const RECIPES = [
  {
    id: "pasta-marinara-chicken",
    name: "Pasta with chicken & tomato sauce",
    icon: "🍝",
    mealType: "pre-match",
    diets: ["omnivore"],
    contains: [],
    spice: "mild",
    minutes: 30,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "250 g dry pasta",
      "1 chicken breast, sliced",
      "1 jar / can tomato pasta sauce",
      "Olive oil, salt, garlic powder",
      "Optional side salad",
    ],
    steps: [
      "Boil pasta in salted water until al dente.",
      "Pan-cook chicken in a little oil until cooked through.",
      "Warm sauce, toss with pasta and chicken.",
      "Eat 3–4 hours before kick-off with water.",
    ],
    why: "Steady carbs for energy plus lean protein so you feel fueled, not heavy.",
    macros: { kcal: 520, protein: 38, carbs: 62, fat: 12, fiber: 4 },
  },
  {
    id: "rice-bowl-beef",
    name: "Rice bowl with lean beef & veggies",
    icon: "🍚",
    mealType: "pre-match",
    diets: ["omnivore"],
    contains: [],
    spice: "medium",
    minutes: 35,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup dry rice",
      "150 g lean ground beef or steak strips",
      "Frozen mixed vegetables",
      "Soy sauce or gluten-free tamari",
      "Oil, pepper",
    ],
    steps: [
      "Cook rice per package.",
      "Brown beef; add veggies until hot.",
      "Season lightly; serve over rice.",
    ],
    why: "Carbs from rice top up muscle fuel; protein supports recovery if you play hard.",
    macros: { kcal: 560, protein: 36, carbs: 58, fat: 18, fiber: 5 },
  },
  {
    id: "bagel-pb-banana",
    name: "Bagel with peanut butter & banana",
    icon: "🥯",
    mealType: "pre-match",
    diets: ["omnivore", "vegetarian", "vegan"],
    contains: ["nuts", "gluten"],
    spice: "mild",
    minutes: 5,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "1 bagel (or GF roll)",
      "2 tbsp peanut or seed butter",
      "1 banana",
      "Honey or maple (optional)",
    ],
    steps: [
      "Toast bagel if you like.",
      "Spread nut/seed butter; slice banana on top.",
      "Eat 1.5–2.5 hours before a match or hard session.",
    ],
    why: "Quick digestible carbs with a bit of fat and protein for lasting energy.",
    macros: { kcal: 480, protein: 16, carbs: 68, fat: 16, fiber: 6 },
  },
  {
    id: "oatmeal-berries",
    name: "Oatmeal with berries & honey",
    icon: "🥣",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "vegan"],
    contains: [],
    spice: "mild",
    minutes: 10,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1/2 cup rolled oats (certified GF if needed)",
      "1 cup water or plant milk",
      "Handful of berries",
      "Honey or maple syrup",
      "Pinch of salt",
    ],
    steps: [
      "Simmer oats with liquid 3–5 minutes.",
      "Top with berries and a drizzle of sweetener.",
    ],
    why: "Slow carbs for morning fuel and easy digestion before school or training.",
    macros: { kcal: 320, protein: 9, carbs: 58, fat: 6, fiber: 8 },
  },
  {
    id: "eggs-toast-fruit",
    name: "Scrambled eggs, toast & fruit",
    icon: "🍳",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["eggs", "gluten"],
    spice: "mild",
    minutes: 15,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "2–3 eggs",
      "2 slices toast",
      "Fruit (apple, orange, or berries)",
      "Butter or oil, salt, pepper",
    ],
    steps: [
      "Scramble eggs gently in a pan.",
      "Toast bread; plate with fruit.",
    ],
    why: "Protein-rich start plus carbs to support focus and training later.",
    macros: { kcal: 420, protein: 24, carbs: 38, fat: 18, fiber: 4 },
  },
  {
    id: "yogurt-granola",
    name: "Greek yogurt parfait",
    icon: "🥛",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["dairy", "nuts"],
    spice: "mild",
    minutes: 5,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup Greek yogurt",
      "1/2 cup granola (check labels if GF)",
      "Berries or banana",
      "Honey (optional)",
    ],
    steps: [
      "Layer yogurt, fruit, and granola in a bowl.",
      "Eat soon after mixing so granola stays crunchy.",
    ],
    why: "Protein for muscle repair and carbs for energy — great after an early session too.",
    macros: { kcal: 380, protein: 28, carbs: 42, fat: 10, fiber: 4 },
  },
  {
    id: "overnight-oats-chia",
    name: "Overnight oats with chia",
    icon: "🫙",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "vegan"],
    contains: [],
    spice: "mild",
    minutes: 5,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1/2 cup oats",
      "1 tbsp chia seeds",
      "3/4 cup milk or plant milk",
      "Fruit to top in the morning",
    ],
    steps: [
      "Mix oats, chia, and milk in a jar; fridge overnight.",
      "Add fruit in the morning and eat cold or warmed.",
    ],
    why: "Prep-ahead carbs and fiber so match mornings stay calm and fueled.",
    macros: { kcal: 360, protein: 12, carbs: 52, fat: 12, fiber: 10 },
  },
  {
    id: "salmon-potato",
    name: "Baked salmon with potatoes",
    icon: "🐟",
    mealType: "recovery",
    diets: ["omnivore", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 35,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 salmon fillet",
      "2 medium potatoes, cubed",
      "Olive oil, lemon, salt, pepper",
      "Steamed broccoli or green beans",
    ],
    steps: [
      "Toss potatoes in oil; roast at 200°C / 400°F for 20 min.",
      "Add salmon; bake 12–15 min until flaky.",
      "Squeeze lemon; serve with greens.",
    ],
    why: "Protein and omega-3 fats support recovery; potatoes refill carb stores.",
    macros: { kcal: 540, protein: 40, carbs: 42, fat: 22, fiber: 6 },
  },
  {
    id: "chicken-rice-veg",
    name: "Chicken, rice & steamed veg",
    icon: "🍗",
    mealType: "recovery",
    diets: ["omnivore"],
    contains: [],
    spice: "mild",
    minutes: 30,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 chicken breast or thighs",
      "1 cup dry rice",
      "Bagged or fresh vegetables",
      "Oil, salt, herbs",
    ],
    steps: [
      "Cook rice; steam or microwave veg.",
      "Pan-cook or bake chicken until done.",
      "Plate together; drink water with the meal.",
    ],
    why: "Classic post-training plate: carbs to refill glycogen, protein to rebuild muscle.",
    macros: { kcal: 510, protein: 42, carbs: 55, fat: 10, fiber: 4 },
  },
  {
    id: "turkey-wrap",
    name: "Turkey wrap with hummus",
    icon: "🌯",
    mealType: "recovery",
    diets: ["omnivore"],
    contains: ["gluten"],
    spice: "mild",
    minutes: 10,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "1 large tortilla or wrap",
      "Sliced turkey breast",
      "2 tbsp hummus",
      "Lettuce, tomato, cucumber",
    ],
    steps: [
      "Spread hummus on wrap; layer turkey and veg.",
      "Roll tightly; eat within an hour after training if you can.",
    ],
    why: "Portable protein + carbs when you need food fast after practice.",
    macros: { kcal: 390, protein: 32, carbs: 36, fat: 12, fiber: 5 },
  },
  {
    id: "bean-chili",
    name: "One-pot bean chili",
    icon: "🌶️",
    mealType: "recovery",
    diets: ["omnivore", "vegetarian", "vegan"],
    contains: [],
    spice: "hot",
    minutes: 40,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 can black beans, rinsed",
      "1 can kidney beans, rinsed",
      "1 can diced tomatoes",
      "Onion, chili powder, cumin, oil",
      "Rice or corn chips to serve",
    ],
    steps: [
      "Sauté chopped onion; add spices 30 seconds.",
      "Add beans and tomatoes; simmer 20 minutes.",
      "Serve over rice; cool the spice if needed with yogurt or avocado.",
    ],
    why: "Plant protein and carbs for a filling recovery meal on a budget.",
    macros: { kcal: 450, protein: 22, carbs: 68, fat: 10, fiber: 16 },
  },
  {
    id: "tofu-stirfry",
    name: "Tofu veggie stir-fry with rice",
    icon: "🥬",
    mealType: "recovery",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "medium",
    minutes: 25,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 block firm tofu, cubed",
      "Mixed stir-fry vegetables",
      "Rice",
      "Soy sauce or tamari, garlic, oil",
    ],
    steps: [
      "Press tofu lightly; pan-fry until golden.",
      "Add veg and sauce; cook until tender-crisp.",
      "Serve over rice.",
    ],
    why: "Plant protein plus carbs — solid vegan-friendly recovery option.",
    macros: { kcal: 480, protein: 28, carbs: 52, fat: 16, fiber: 7 },
  },
  {
    id: "tuna-pasta",
    name: "Tuna pasta salad",
    icon: "🥗",
    mealType: "recovery",
    diets: ["omnivore", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 20,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "200 g pasta",
      "1 can tuna in water, drained",
      "Corn, peas, or chopped cucumber",
      "Olive oil or light mayo, lemon",
    ],
    steps: [
      "Cook pasta; rinse under cold water if serving cold.",
      "Mix with tuna, veg, and dressing.",
    ],
    why: "Easy carbs and fish protein — good fridge meal after evening training.",
    macros: { kcal: 470, protein: 34, carbs: 52, fat: 12, fiber: 4 },
  },
  {
    id: "lentil-soup-bread",
    name: "Lentil soup with bread",
    icon: "🍲",
    mealType: "recovery",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: ["gluten"],
    spice: "mild",
    minutes: 35,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "1 cup dry red lentils (or 2 cans cooked)",
      "Carrot, onion, garlic",
      "Vegetable broth, cumin",
      "Bread or GF bread for dipping",
    ],
    steps: [
      "Sauté veg; add lentils and broth.",
      "Simmer until soft (15–20 min for red lentils).",
      "Blend partly if you like; serve with bread.",
    ],
    why: "Iron-friendly plant protein and fluids — helpful when you feel drained.",
    macros: { kcal: 420, protein: 22, carbs: 62, fat: 8, fiber: 14 },
  },
  {
    id: "smoothie-banana-milk",
    name: "Banana recovery smoothie",
    icon: "🥤",
    mealType: "snack",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["dairy"],
    spice: "mild",
    minutes: 5,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 banana",
      "1 cup milk or chocolate milk",
      "1 tbsp peanut butter (optional)",
      "Ice",
    ],
    steps: [
      "Blend until smooth.",
      "Drink within about an hour after hard work.",
    ],
    why: "Liquid carbs + protein help refill energy when solid food is hard to face.",
    macros: { kcal: 340, protein: 14, carbs: 48, fat: 10, fiber: 4 },
  },
  {
    id: "smoothie-plant",
    name: "Berry plant-milk smoothie",
    icon: "🫐",
    mealType: "snack",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 5,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup frozen berries",
      "1 banana",
      "1 cup fortified plant milk",
      "1 scoop plant protein (optional)",
    ],
    steps: [
      "Blend all ingredients.",
      "Add water if too thick.",
    ],
    why: "Dairy-free carb + protein option for quick post-session refuel.",
    macros: { kcal: 310, protein: 18, carbs: 52, fat: 6, fiber: 8 },
  },
  {
    id: "chocolate-milk",
    name: "Chocolate milk & fruit",
    icon: "🍫",
    mealType: "snack",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["dairy"],
    spice: "mild",
    minutes: 2,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1–2 cups chocolate milk",
      "An apple or banana",
    ],
    steps: [
      "Drink chocolate milk and eat the fruit after training.",
    ],
    why: "Simple research-backed combo of carbs and protein for busy athletes.",
    macros: { kcal: 280, protein: 12, carbs: 48, fat: 6, fiber: 3 },
  },
  {
    id: "rice-cakes-tuna",
    name: "Rice cakes with tuna",
    icon: "🍘",
    mealType: "snack",
    diets: ["omnivore", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 5,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "3–4 rice cakes",
      "1 small can tuna",
      "Mustard or light mayo",
      "Cucumber slices",
    ],
    steps: [
      "Mix tuna with a little mustard or mayo.",
      "Spread on rice cakes; add cucumber.",
    ],
    why: "Light gluten-free snack with protein between sessions.",
    macros: { kcal: 250, protein: 22, carbs: 28, fat: 5, fiber: 1 },
  },
  {
    id: "trail-mix-fruit",
    name: "Homemade trail mix & fruit",
    icon: "🥜",
    mealType: "snack",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: ["nuts"],
    spice: "mild",
    minutes: 5,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "Handful of mixed nuts",
      "Dried fruit (raisins, dates)",
      "Fresh fruit on the side",
    ],
    steps: [
      "Portion a small handful of mix — don't graze the whole bag.",
      "Pair with water and fresh fruit.",
    ],
    why: "Portable energy for travel days; keep portions modest before matches.",
    macros: { kcal: 320, protein: 8, carbs: 36, fat: 16, fiber: 5 },
  },
  {
    id: "hummus-veg-pita",
    name: "Hummus, veg sticks & pita",
    icon: "🥙",
    mealType: "snack",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: ["gluten"],
    spice: "mild",
    minutes: 5,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "1 cup hummus",
      "Carrot, cucumber, pepper sticks",
      "Pita or GF crackers",
    ],
    steps: [
      "Plate hummus with cut veg and pita.",
      "Good as a light pre-evening-session snack 1–2 hours out.",
    ],
    why: "Carbs and plant protein without feeling stuffed.",
    macros: { kcal: 340, protein: 12, carbs: 42, fat: 14, fiber: 8 },
  },
  {
    id: "egg-fried-rice",
    name: "Quick egg fried rice",
    icon: "🍚",
    mealType: "recovery",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["eggs"],
    spice: "medium",
    minutes: 15,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "2 cups leftover cooked rice",
      "2 eggs",
      "Frozen peas/carrots",
      "Soy sauce or tamari, oil, green onion",
    ],
    steps: [
      "Scramble eggs in oil; set aside.",
      "Stir-fry rice and veg; return eggs; season.",
    ],
    why: "Uses leftover rice for fast carbs and protein after a late practice.",
    macros: { kcal: 480, protein: 20, carbs: 58, fat: 16, fiber: 4 },
  },
  {
    id: "sweet-potato-black-bean",
    name: "Loaded sweet potato with black beans",
    icon: "🍠",
    mealType: "recovery",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "medium",
    minutes: 45,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "2 sweet potatoes",
      "1 can black beans, warmed",
      "Salsa, avocado or olive oil",
      "Salt, cumin",
    ],
    steps: [
      "Bake sweet potatoes at 200°C / 400°F until soft (~40 min), or microwave 8–10 min.",
      "Split open; top with beans, salsa, avocado.",
    ],
    why: "Potassium-rich carbs and plant protein for next-day legs.",
    macros: { kcal: 460, protein: 16, carbs: 72, fat: 12, fiber: 16 },
  },
  {
    id: "shrimp-noodles",
    name: "Garlic shrimp with noodles",
    icon: "🦐",
    mealType: "pre-match",
    diets: ["omnivore", "pescatarian"],
    contains: ["shellfish", "gluten"],
    spice: "medium",
    minutes: 25,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "200 g shrimp, peeled",
      "Noodles or spaghetti",
      "Garlic, olive oil, lemon, parsley",
      "Side of steamed veg",
    ],
    steps: [
      "Cook noodles.",
      "Sauté garlic; cook shrimp 2–3 min per side.",
      "Toss with noodles and lemon.",
    ],
    why: "Lighter protein with pasta carbs — easy on the stomach before games for many players.",
    macros: { kcal: 490, protein: 32, carbs: 55, fat: 14, fiber: 3 },
  },
  {
    id: "pancake-stack",
    name: "Banana oat pancakes",
    icon: "🥞",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["eggs"],
    spice: "mild",
    minutes: 20,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 ripe banana",
      "2 eggs",
      "1/2 cup oats, blended",
      "Cinnamon; berries to top",
    ],
    steps: [
      "Mash banana; mix with eggs and oat flour.",
      "Cook small pancakes on a lightly oiled pan.",
      "Top with berries.",
    ],
    why: "Weekend breakfast with carbs and protein before a double session.",
    macros: { kcal: 380, protein: 18, carbs: 48, fat: 12, fiber: 6 },
  },
  {
    id: "cottage-cheese-pineapple",
    name: "Cottage cheese & pineapple",
    icon: "🍍",
    mealType: "snack",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["dairy"],
    spice: "mild",
    minutes: 3,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup cottage cheese",
      "1/2 cup pineapple chunks (fresh or canned in juice)",
    ],
    steps: [
      "Stir together and eat chilled.",
    ],
    why: "High-protein snack that supports overnight recovery between hard days.",
    macros: { kcal: 240, protein: 28, carbs: 22, fat: 4, fiber: 1 },
  },
  {
    id: "veggie-omelette-potatoes",
    name: "Veggie omelette with potatoes",
    icon: "🥔",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["eggs"],
    spice: "mild",
    minutes: 25,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "3 eggs",
      "Peppers, spinach, onion",
      "Boiled or leftover potatoes",
      "Oil, salt, pepper",
    ],
    steps: [
      "Warm potatoes in a pan.",
      "Cook veg; pour in beaten eggs; fold when set.",
      "Serve together.",
    ],
    why: "Protein-forward breakfast with potato carbs for midweek training days.",
    macros: { kcal: 440, protein: 26, carbs: 32, fat: 22, fiber: 5 },
  },
  {
    id: "pork-free-kebab-bowl",
    name: "Chicken kebab bowl (no pork)",
    icon: "🥙",
    mealType: "recovery",
    diets: ["omnivore"],
    contains: [],
    spice: "medium",
    minutes: 30,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "Chicken thigh or breast, cubed",
      "Rice or couscous (use rice if GF)",
      "Cucumber, tomato, onion salad",
      "Yogurt-garlic sauce or dairy-free alternative",
      "Cumin, paprika, oil",
    ],
    steps: [
      "Season and pan-grill chicken.",
      "Serve over rice with salad and sauce.",
    ],
    why: "Familiar takeaway flavors made at home — protein and carbs after matches.",
    macros: { kcal: 550, protein: 42, carbs: 52, fat: 16, fiber: 5 },
  },
  {
    id: "quinoa-chickpea",
    name: "Quinoa chickpea bowl",
    icon: "🌱",
    mealType: "pre-match",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 30,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup dry quinoa",
      "1 can chickpeas, rinsed",
      "Roasted or raw veg",
      "Olive oil, lemon, herbs",
    ],
    steps: [
      "Cook quinoa; warm chickpeas with spices.",
      "Assemble bowl; dress lightly.",
      "Keep seasoning mild before matches.",
    ],
    why: "Plant carbs and protein that sit well for many athletes before competition.",
    macros: { kcal: 480, protein: 20, carbs: 62, fat: 14, fiber: 12 },
  },
  {
    id: "avocado-toast-egg",
    name: "Avocado toast with egg",
    icon: "🥑",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["eggs", "gluten"],
    spice: "mild",
    minutes: 10,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "2 slices bread",
      "1 ripe avocado",
      "1–2 eggs (fried or boiled)",
      "Salt, pepper, chili flakes optional",
    ],
    steps: [
      "Toast bread; mash avocado on top.",
      "Add cooked egg; season.",
    ],
    why: "Balanced fats, protein, and carbs for a solid training-day morning.",
    macros: { kcal: 420, protein: 18, carbs: 34, fat: 24, fiber: 10 },
  },
  {
    id: "pasta-pesto-veg",
    name: "Pesto pasta with peas",
    icon: "🌿",
    mealType: "pre-match",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["dairy", "nuts", "gluten"],
    spice: "mild",
    minutes: 20,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "250 g pasta",
      "3–4 tbsp pesto (check nuts)",
      "1 cup peas",
      "Optional grated cheese",
    ],
    steps: [
      "Cook pasta; add peas in the last 2 minutes.",
      "Drain; stir in pesto. Keep portions moderate.",
    ],
    why: "Familiar carb meal that's easy to cook the afternoon before a game.",
    macros: { kcal: 520, protein: 16, carbs: 64, fat: 22, fiber: 6 },
  },
  {
    id: "turkey-meatballs-rice",
    name: "Turkey meatballs with rice",
    icon: "🍖",
    mealType: "recovery",
    diets: ["omnivore"],
    contains: ["eggs"],
    spice: "mild",
    minutes: 35,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "400 g ground turkey",
      "1 egg, garlic powder, salt, parsley",
      "1 cup dry rice",
      "Tomato sauce or passata",
      "Side salad",
    ],
    steps: [
      "Mix turkey with egg and seasoning; roll small meatballs.",
      "Bake or pan-cook until done; warm in tomato sauce.",
      "Serve over rice with salad.",
    ],
    why: "Lean protein and rice carbs for a solid post-match rebuild without feeling greasy.",
    macros: { kcal: 540, protein: 40, carbs: 50, fat: 16, fiber: 3 },
  },
  {
    id: "cod-couscous-veg",
    name: "Baked cod with couscous & veg",
    icon: "🐟",
    mealType: "pre-match",
    diets: ["omnivore", "pescatarian"],
    contains: ["gluten"],
    spice: "mild",
    minutes: 25,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "1–2 cod fillets (or other white fish)",
      "1 cup couscous",
      "Zucchini, peppers, or frozen veg",
      "Lemon, olive oil, salt, herbs",
    ],
    steps: [
      "Bake fish with lemon and oil at 200°C / 400°F for 12–15 min.",
      "Pour boiling water over couscous; fluff after 5 minutes.",
      "Sauté or steam veg; plate together.",
    ],
    why: "Light fish protein with easy couscous carbs that sit well before evening kick-offs.",
    macros: { kcal: 450, protein: 36, carbs: 48, fat: 10, fiber: 5 },
  },
  {
    id: "chickpea-pasta-marinara",
    name: "Chickpea pasta marinara",
    icon: "🍝",
    mealType: "pre-match",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 20,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "200 g chickpea or lentil pasta (GF)",
      "Tomato pasta sauce",
      "Olive oil, garlic, basil",
      "Optional spinach stirred in",
    ],
    steps: [
      "Boil pasta per package (don't overcook).",
      "Warm sauce with garlic; toss together.",
    ],
    why: "Gluten-free carbs plus plant protein — a reliable vegan-friendly pre-match plate.",
    macros: { kcal: 480, protein: 28, carbs: 58, fat: 12, fiber: 12 },
  },
  {
    id: "breakfast-burrito-bean",
    name: "Bean & salsa breakfast burrito",
    icon: "🌯",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: ["gluten"],
    spice: "medium",
    minutes: 15,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "1 large tortilla (or GF wrap)",
      "1/2 can black or pinto beans, warmed",
      "Salsa, sliced avocado",
      "Spinach or shredded lettuce",
      "Optional dairy-free yogurt drizzle",
    ],
    steps: [
      "Warm tortilla; fill with beans, salsa, and greens.",
      "Roll tightly; wrap in foil for the commute.",
    ],
    why: "Portable plant protein and carbs for early academy mornings.",
    macros: { kcal: 420, protein: 16, carbs: 52, fat: 16, fiber: 14 },
  },
  {
    id: "greek-chicken-orzo",
    name: "Greek-style chicken orzo bowl",
    icon: "🫒",
    mealType: "recovery",
    diets: ["omnivore"],
    contains: ["gluten", "dairy"],
    spice: "medium",
    minutes: 30,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "1 chicken breast, cubed",
      "1 cup orzo or small pasta",
      "Cucumber, tomato, red onion",
      "Feta, olive oil, lemon, oregano",
    ],
    steps: [
      "Cook orzo; pan-sear seasoned chicken.",
      "Toss with chopped salad veg, oil, lemon, and feta.",
    ],
    why: "Familiar Mediterranean flavors with carbs and protein after tough sessions.",
    macros: { kcal: 530, protein: 40, carbs: 48, fat: 18, fiber: 4 },
  },
  {
    id: "miso-tofu-rice",
    name: "Miso-glazed tofu with rice",
    icon: "🥢",
    mealType: "recovery",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 30,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 block firm tofu",
      "1–2 tbsp white miso, maple, splash of tamari",
      "1 cup dry rice",
      "Steamed greens (bok choy or broccoli)",
    ],
    steps: [
      "Press tofu; cube and pan-sear until golden.",
      "Brush with miso-maple mix; warm 1–2 minutes.",
      "Serve over rice with greens.",
    ],
    why: "Savory plant protein and rice to refill after evening training.",
    macros: { kcal: 470, protein: 26, carbs: 55, fat: 14, fiber: 6 },
  },
  {
    id: "overnight-rice-pudding",
    name: "Overnight rice pudding jar",
    icon: "🍚",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 5,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup leftover cooked rice",
      "3/4 cup milk or fortified plant milk",
      "Cinnamon, maple or honey",
      "Berries or banana in the morning",
    ],
    steps: [
      "Mix rice, milk, sweetener, and cinnamon in a jar; fridge overnight.",
      "Stir and top with fruit before eating cold or warmed.",
    ],
    why: "Uses leftover rice for calm, carb-forward match-morning fuel.",
    macros: { kcal: 340, protein: 10, carbs: 62, fat: 6, fiber: 3 },
  },
  {
    id: "tuna-avocado-rice",
    name: "Tuna avocado rice bowl",
    icon: "🥑",
    mealType: "recovery",
    diets: ["omnivore", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 15,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 can tuna, drained",
      "1 cup cooked rice (leftover OK)",
      "1/2 avocado, cucumber, soy/tamari",
      "Sesame seeds optional",
    ],
    steps: [
      "Fluff warm or cold rice in a bowl.",
      "Top with tuna, sliced avocado, cucumber, and a splash of tamari.",
    ],
    why: "Fast gluten-free recovery bowl with fish protein and easy carbs.",
    macros: { kcal: 460, protein: 34, carbs: 42, fat: 16, fiber: 7 },
  },
  {
    id: "veggie-fried-noodles",
    name: "Quick veggie fried noodles",
    icon: "🍜",
    mealType: "pre-match",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: ["gluten"],
    spice: "medium",
    minutes: 20,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "200 g wheat noodles or ramen (check labels)",
      "Bagged stir-fry veg",
      "Garlic, ginger, soy/tamari, oil",
      "Optional firm tofu cubes",
    ],
    steps: [
      "Cook noodles; drain.",
      "Stir-fry veg (and tofu); toss with noodles and sauce — keep salt moderate pre-match.",
    ],
    why: "Familiar carb base that cooks fast the afternoon before a game.",
    macros: { kcal: 490, protein: 18, carbs: 68, fat: 14, fiber: 6 },
  },
  {
    id: "protein-pancake-berries",
    name: "Protein pancakes with berries",
    icon: "🥞",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["eggs", "dairy"],
    spice: "mild",
    minutes: 20,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 scoop protein powder (or 1/2 cup cottage cheese blended)",
      "2 eggs, 1 banana",
      "Splash of milk",
      "Berries and maple to top",
    ],
    steps: [
      "Blend or mash ingredients into a batter.",
      "Cook small pancakes on a lightly oiled pan; top with berries.",
    ],
    why: "Higher-protein breakfast before double sessions or gym + pitch days.",
    macros: { kcal: 400, protein: 32, carbs: 38, fat: 12, fiber: 5 },
  },
  {
    id: "lamb-free-shawarma-bowl",
    name: "Chicken shawarma-style bowl",
    icon: "🌶️",
    mealType: "recovery",
    diets: ["omnivore"],
    contains: [],
    spice: "hot",
    minutes: 35,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "Chicken thighs, cumin, paprika, garlic, oil",
      "Rice or roasted potatoes",
      "Cucumber-tomato salad",
      "Tahini or yogurt sauce (dairy-free tahini if needed)",
    ],
    steps: [
      "Coat chicken in spices; roast or pan-cook until done.",
      "Serve over rice with salad and sauce; ease chili if you prefer mild.",
    ],
    why: "Halal-friendly takeaway vibes at home — protein-heavy after weekend matches.",
    macros: { kcal: 560, protein: 44, carbs: 48, fat: 20, fiber: 5 },
  },
  {
    id: "edamame-rice-snack",
    name: "Edamame & rice snack box",
    icon: "🫛",
    mealType: "snack",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 10,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup shelled edamame (frozen OK)",
      "1/2–1 cup cooked rice",
      "Sea salt, chili flakes optional",
      "Orange or apple on the side",
    ],
    steps: [
      "Microwave edamame; salt lightly.",
      "Pack with rice and fruit for between sessions.",
    ],
    why: "Plant protein plus carbs when you need something light but filling.",
    macros: { kcal: 320, protein: 18, carbs: 42, fat: 8, fiber: 8 },
  },
  {
    id: "smoked-salmon-bagel",
    name: "Smoked salmon bagel plate",
    icon: "🥯",
    mealType: "breakfast",
    diets: ["omnivore", "pescatarian"],
    contains: ["gluten", "dairy"],
    spice: "mild",
    minutes: 10,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "1 bagel",
      "2–3 tbsp cream cheese or dairy-free spread",
      "Smoked salmon slices",
      "Cucumber, lemon, black pepper",
    ],
    steps: [
      "Toast bagel; spread cream cheese.",
      "Layer salmon and cucumber; squeeze lemon.",
    ],
    why: "Quick omega-3 rich breakfast before morning training or travel.",
    macros: { kcal: 450, protein: 26, carbs: 48, fat: 16, fiber: 3 },
  },
  {
    id: "polenta-mushroom-bowl",
    name: "Creamy polenta with mushrooms",
    icon: "🌽",
    mealType: "recovery",
    diets: ["omnivore", "vegetarian", "pescatarian"],
    contains: ["dairy"],
    spice: "mild",
    minutes: 30,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup instant or quick polenta",
      "Milk or broth + splash of milk",
      "Mushrooms, garlic, olive oil",
      "Optional Parmesan or nutritional yeast",
    ],
    steps: [
      "Cook polenta until creamy.",
      "Sauté mushrooms with garlic; spoon over polenta.",
    ],
    why: "Comforting gluten-free carbs with savory protein-friendly toppings after cold-weather matches.",
    macros: { kcal: 420, protein: 14, carbs: 55, fat: 16, fiber: 5 },
  },
  {
    id: "date-oat-energy-bites",
    name: "Date & oat energy bites",
    icon: "🥜",
    mealType: "snack",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: ["nuts"],
    spice: "mild",
    minutes: 15,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup dates, pitted",
      "1 cup oats (certified GF if needed)",
      "2 tbsp peanut or almond butter",
      "Pinch of salt; cocoa optional",
    ],
    steps: [
      "Pulse dates, oats, and nut butter in a food processor.",
      "Roll into balls; chill 10 minutes.",
    ],
    why: "Make-ahead snack for bus rides — keep portions small before kick-off.",
    macros: { kcal: 280, protein: 7, carbs: 40, fat: 12, fiber: 5 },
  },
  {
    id: "shrimp-free-fish-tacos",
    name: "Mild white-fish tacos",
    icon: "🌮",
    mealType: "recovery",
    diets: ["omnivore", "pescatarian"],
    contains: ["gluten"],
    spice: "medium",
    minutes: 25,
    glutenFree: false,
    halalFriendly: true,
    ingredients: [
      "White fish fillets (cod, tilapia)",
      "Soft tortillas",
      "Cabbage slaw, lime, cilantro",
      "Yogurt or dairy-free crema",
    ],
    steps: [
      "Season and pan-cook fish until flaky.",
      "Warm tortillas; fill with fish, slaw, and lime.",
    ],
    why: "Shellfish-free pescatarian recovery meal that still feels like a treat.",
    macros: { kcal: 440, protein: 32, carbs: 42, fat: 14, fiber: 5 },
  },
  {
    id: "baked-oat-apple",
    name: "Baked apple oatmeal cup",
    icon: "🍎",
    mealType: "breakfast",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 35,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "1 cup oats",
      "1 apple, diced",
      "1 cup plant milk or milk",
      "Cinnamon, maple, baking powder pinch",
    ],
    steps: [
      "Mix everything in an oven-safe dish.",
      "Bake at 180°C / 350°F for ~25–30 min until set.",
      "Cool slightly; portion for 2 mornings.",
    ],
    why: "Batch breakfast with slow carbs — easy to reheat on school days.",
    macros: { kcal: 310, protein: 8, carbs: 58, fat: 6, fiber: 7 },
  },
  {
    id: "beef-stirfry-noodles-gf",
    name: "Beef stir-fry with rice noodles",
    icon: "🥩",
    mealType: "recovery",
    diets: ["omnivore"],
    contains: [],
    spice: "medium",
    minutes: 25,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "200 g lean beef strips",
      "Rice noodles",
      "Mixed stir-fry vegetables",
      "Tamari, garlic, ginger, oil",
    ],
    steps: [
      "Soak or cook rice noodles per package.",
      "Sear beef quickly; add veg and sauce; toss with noodles.",
    ],
    why: "Gluten-free noodle recovery option with iron-rich beef after hard weeks.",
    macros: { kcal: 530, protein: 36, carbs: 52, fat: 18, fiber: 4 },
  },
  {
    id: "hummus-rice-cake-stack",
    name: "Hummus rice-cake stack",
    icon: "🍘",
    mealType: "snack",
    diets: ["omnivore", "vegetarian", "vegan", "pescatarian"],
    contains: [],
    spice: "mild",
    minutes: 5,
    glutenFree: true,
    halalFriendly: true,
    ingredients: [
      "3–4 rice cakes",
      "Hummus",
      "Sliced cucumber and tomato",
      "Everything-bagel seasoning or salt/pepper",
    ],
    steps: [
      "Spread hummus on rice cakes; top with veg and seasoning.",
      "Eat 1–2 hours before a light technical session if you need a top-up.",
    ],
    why: "Nut-free, gluten-free snack that still gives carbs and plant protein.",
    macros: { kcal: 260, protein: 8, carbs: 36, fat: 10, fiber: 5 },
  },
];

function nutritionEligible(age = typeof getAge === "function" ? getAge() : null) {
  return age != null && age >= NUTRITION_MIN_AGE;
}

function getNutritionPrefs() {
  try {
    const stored = { ...DEFAULT_NUTRITION, ...JSON.parse(localStorage.getItem("sth-nutrition") || "{}") };
    // Prefer free-text as source of truth when present; keep structured fields in sync.
    if (stored.dietText && String(stored.dietText).trim()) {
      return {
        ...stored,
        ...evaluateDietText(stored.dietText, {
          spice: stored.spice,
          maxMinutes: stored.maxMinutes,
        }),
        dietText: stored.dietText,
      };
    }
    return stored;
  } catch {
    return { ...DEFAULT_NUTRITION };
  }
}

function saveNutritionPrefs(prefs) {
  const dietText = prefs.dietText != null ? String(prefs.dietText) : "";
  // Text drives style/tags/avoid; spice & cook-time selects can override.
  const evaluated = evaluateDietText(dietText, {
    spice: prefs.spice,
    maxMinutes: prefs.maxMinutes,
  });
  localStorage.setItem("sth-nutrition", JSON.stringify({
    ...DEFAULT_NUTRITION,
    ...evaluated,
    dietText,
    updatedAt: new Date().toISOString(),
  }));
}

function recipeMatchesPrefs(recipe, prefs = getNutritionPrefs()) {
  if (!recipe.diets.includes(prefs.style || "omnivore")) return false;
  const avoid = prefs.avoid || [];
  if (avoid.some((a) => recipe.contains.includes(a))) return false;
  if ((prefs.tags || []).includes("glutenFree") && !recipe.glutenFree) return false;
  if ((prefs.tags || []).includes("halalFriendly") && !recipe.halalFriendly) return false;
  if ((prefs.tags || []).includes("halalFriendly") && recipe.contains.includes("pork")) return false;
  const spiceRank = { mild: 0, medium: 1, hot: 2 };
  const maxSpice = spiceRank[prefs.spice || "medium"] ?? 1;
  if ((spiceRank[recipe.spice] ?? 0) > maxSpice) return false;
  const maxMin = Number(prefs.maxMinutes) || 90;
  if (recipe.minutes > maxMin) return false;
  return true;
}

function filterRecipes(prefs = getNutritionPrefs(), mealType = null) {
  return RECIPES.filter((r) => {
    if (mealType && r.mealType !== mealType) return false;
    return recipeMatchesPrefs(r, prefs);
  });
}

// Map Today plan vibes to a meal type for suggestions.
function mealTypeForTodayPlan(plan) {
  const title = (plan?.title || "").toLowerCase();
  if (title.includes("match")) return "pre-match";
  if (title.includes("recovery") || title.includes("done for today") || title.includes("rest")) return "recovery";
  if (title.includes("practice") || title.includes("session") || title.includes("gym")) return "snack";
  return "breakfast";
}

function suggestRecipes(plan, limit = 3) {
  const prefs = getNutritionPrefs();
  const preferred = mealTypeForTodayPlan(plan);
  const matched = filterRecipes(prefs, preferred);
  const pool = matched.length ? matched : filterRecipes(prefs);
  // Stable-ish pick: rotate by day of year so suggestions change daily.
  const day = Math.floor(Date.now() / 86400000);
  if (!pool.length) return [];
  const start = day % pool.length;
  const out = [];
  for (let i = 0; i < pool.length && out.length < limit; i++) {
    out.push(pool[(start + i) % pool.length]);
  }
  return out;
}

const YOUNG_NUTRITION_TIPS = [
  "Eat regular meals and drink water through the day — skip extreme diets.",
  "After training, a simple snack like fruit + yogurt or a sandwich helps you recover.",
  "Focus on sleep and fun with the ball; detailed meal plans unlock at 16.",
];

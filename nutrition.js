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
  style: "omnivore",
  tags: [],
  avoid: [],
  spice: "medium",
  maxMinutes: 50,
};

// diets[] = styles this recipe fits. contains[] = allergens / foods to avoid.
// spice: mild | medium | hot. mealType: pre-match | recovery | breakfast | snack.
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
  },
];

function nutritionEligible(age = typeof getAge === "function" ? getAge() : null) {
  return age != null && age >= NUTRITION_MIN_AGE;
}

function getNutritionPrefs() {
  try {
    return { ...DEFAULT_NUTRITION, ...JSON.parse(localStorage.getItem("sth-nutrition") || "{}") };
  } catch {
    return { ...DEFAULT_NUTRITION };
  }
}

function saveNutritionPrefs(prefs) {
  localStorage.setItem("sth-nutrition", JSON.stringify({
    ...DEFAULT_NUTRITION,
    ...prefs,
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

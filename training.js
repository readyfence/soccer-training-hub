// Age groups drive training volume, gym loading, heading rules, and weekly load limits.
// gymMode: "bw" = bodyweight only, "light" = light external load, "loaded" = full strength training.
const AGE_GROUPS = [
  {
    id: "u10",
    label: "Under 10",
    min: 5,
    max: 9,
    stage: "Love the Ball",
    sets: [1, 2, 2, 2],
    volume: 0.6,
    gymMode: "bw",
    maxPerWeek: 3,
    focus: "Fun, coordination and lots of touches. Play every position.",
  },
  {
    id: "u13",
    label: "10–12",
    min: 10,
    max: 12,
    stage: "Golden Age of Skill",
    sets: [2, 2, 3, 3],
    volume: 0.8,
    gymMode: "light",
    maxLoad: "5 lb (about 2.5 kg)",
    maxPerWeek: 4,
    focus: "Master both feet, first touch and 1v1 moves. Bodyweight strength, plus 5 lb weights only with a strength coach.",
  },
  {
    id: "u16",
    label: "13–15",
    min: 13,
    max: 15,
    stage: "Train to Train",
    sets: [2, 3, 3, 4],
    volume: 1,
    gymMode: "light",
    maxPerWeek: 5,
    focus: "Build your engine and learn gym technique with light loads. Growth spurts happen here, so listen to your body.",
  },
  {
    id: "u19",
    label: "16–18",
    min: 16,
    max: 18,
    stage: "Train to Compete",
    sets: [3, 3, 4, 5],
    volume: 1.15,
    gymMode: "loaded",
    maxPerWeek: 6,
    focus: "Position specialization, real strength and power work, and getting seen by scouts.",
  },
  {
    id: "pro",
    label: "19+",
    min: 19,
    max: 99,
    stage: "Train to Win",
    sets: [3, 4, 4, 5],
    volume: 1.25,
    gymMode: "loaded",
    maxPerWeek: 7,
    focus: "Full professional standard: high intensity, recovery, and consistency every week.",
  },
];

const GYM_MODE_LABEL = {
  bw: "Bodyweight",
  light: "Light load",
  loaded: "Loaded strength",
};

const GYM_LOAD_NOTE = {
  bw: "Bodyweight only. Focus on perfect form and control. No weights needed at your age.",
  light: "Use a light dumbbell or kettlebell. Form comes before weight.",
  loaded: "Pick a weight you could lift 2–3 more reps with (about RPE 7–8). Use a spotter on heavy sets.",
};

const GYM_REST = { bw: 45, light: 60, loaded: 90 };

const GYM = {
  squat: {
    icon: "🏋️",
    category: "Strength",
    muscles: "Quads, glutes, core",
    variants: { bw: "Bodyweight Squat", light: "Goblet Squat", loaded: "Back Squat" },
    reps: { bw: "12", light: "10", loaded: "5" },
    steps: [
      "Feet shoulder-width apart, toes slightly out.",
      "Brace your core and sit your hips back and down.",
      "Go to at least thighs parallel, knees tracking over your toes.",
      "Drive up through your whole foot.",
    ],
    coaching: "Chest up, heels down. Knees should never cave inward.",
  },
  rdl: {
    icon: "🏋️",
    category: "Strength",
    muscles: "Hamstrings, glutes, lower back",
    variants: { bw: "Single-Leg Reach (bodyweight)", light: "Dumbbell RDL", loaded: "Barbell Romanian Deadlift" },
    reps: { bw: "8 each leg", light: "10", loaded: "6" },
    steps: [
      "Soft knees, hinge at your hips, pushing them back.",
      "Keep the weight close to your legs and your back flat.",
      "Lower until you feel a strong hamstring stretch.",
      "Squeeze your glutes to stand tall.",
    ],
    coaching: "This protects against hamstring strains, the most common soccer injury.",
  },
  lunge: {
    icon: "🦵",
    category: "Strength",
    muscles: "Quads, glutes, balance",
    variants: { bw: "Walking Lunge", light: "Dumbbell Walking Lunge", loaded: "Bulgarian Split Squat" },
    reps: { bw: "10 each leg", light: "8 each leg", loaded: "6 each leg" },
    steps: [
      "Step forward and lower your back knee toward the floor.",
      "Front knee stays over the middle of your foot.",
      "Push through your front heel to stand or step forward.",
    ],
    coaching: "Single-leg strength carries over directly to sprinting and cutting.",
  },
  nordic: {
    icon: "🦵",
    category: "Injury Prevention",
    muscles: "Hamstrings",
    variants: { bw: "Partner Hamstring Lean (short range)", light: "Assisted Nordic Curl", loaded: "Nordic Hamstring Curl" },
    reps: { bw: "5", light: "5", loaded: "6" },
    steps: [
      "Kneel with a partner holding your ankles.",
      "Keep your body straight from knees to head.",
      "Lower forward as slowly as possible.",
      "Catch yourself with your hands and push back up.",
    ],
    coaching: "Proven to cut hamstring injuries dramatically. Control the lowering phase.",
  },
  copenhagen: {
    icon: "🧘",
    category: "Injury Prevention",
    muscles: "Adductors (groin), core",
    variants: { bw: "Side Plank with Top-Leg Lift", light: "Short-Lever Copenhagen (knee on bench)", loaded: "Long-Lever Copenhagen Plank" },
    reps: { bw: "15 sec each side", light: "20 sec each side", loaded: "30 sec each side" },
    steps: [
      "Lie on your side with your top leg on a bench.",
      "Lift your hips so your body is in a straight line.",
      "Bottom leg can hang or lift to the bench.",
      "Hold, then switch sides.",
    ],
    coaching: "Protects against groin strains from passing and shooting.",
  },
  boxjump: {
    icon: "📦",
    category: "Power",
    muscles: "Legs (explosive)",
    variants: { bw: "Squat Jumps", light: "Box Jumps (low box)", loaded: "Box Jumps" },
    reps: { bw: "6", light: "5", loaded: "5" },
    steps: [
      "Quick dip with an arm swing.",
      "Explode up as high as possible.",
      "Land softly with bent knees, hips back.",
      "Step down from the box; don't jump down.",
    ],
    coaching: "Quality over quantity. Every rep should be maximum effort.",
  },
  broadjump: {
    icon: "🐸",
    category: "Power",
    muscles: "Legs, hips (horizontal power)",
    variants: { bw: "Standing Broad Jump", light: "Broad Jump", loaded: "Broad Jump + Sprint 10m" },
    reps: { bw: "5", light: "5", loaded: "5" },
    steps: [
      "Swing your arms back and load your hips.",
      "Jump forward as far as you can.",
      "Stick the landing for 2 seconds.",
    ],
    coaching: "Builds the first-step acceleration that wins races to the ball.",
  },
  lateralbound: {
    icon: "⛸️",
    category: "Power",
    muscles: "Glutes, adductors, ankles",
    variants: { bw: "Skater Hops", light: "Lateral Bounds", loaded: "Lateral Bounds (max distance)" },
    reps: { bw: "8 each side", light: "6 each side", loaded: "6 each side" },
    steps: [
      "Push off one leg sideways.",
      "Land on the opposite leg and hold for a second.",
      "Bound back the other way.",
    ],
    coaching: "Builds explosive change of direction for 1v1s and goalkeeper dives.",
  },
  calfraise: {
    icon: "🦶",
    category: "Injury Prevention",
    muscles: "Calves, Achilles",
    variants: { bw: "Double-Leg Calf Raise", light: "Single-Leg Calf Raise", loaded: "Weighted Single-Leg Calf Raise" },
    reps: { bw: "15", light: "12 each leg", loaded: "10 each leg" },
    steps: [
      "Stand on the edge of a step.",
      "Rise as high as possible onto your toes.",
      "Lower slowly below the step level.",
    ],
    coaching: "Strong calves and Achilles protect you during sprinting.",
  },
  pushup: {
    icon: "💪",
    category: "Upper Body",
    muscles: "Chest, shoulders, triceps",
    variants: { bw: "Push-Ups", light: "Push-Ups (feet elevated)", loaded: "Dumbbell Bench Press" },
    reps: { bw: "8–12", light: "10", loaded: "8" },
    steps: [
      "Hands slightly wider than your shoulders.",
      "Body straight like a plank.",
      "Lower your chest close to the floor and push up.",
    ],
    coaching: "Upper body strength helps you hold off defenders.",
  },
  row: {
    icon: "💪",
    category: "Upper Body",
    muscles: "Back, biceps, posture",
    variants: { bw: "Inverted Row (table or bar)", light: "Dumbbell Row", loaded: "Barbell Row" },
    reps: { bw: "8", light: "10 each arm", loaded: "8" },
    steps: [
      "Keep your back flat and core braced.",
      "Pull your elbows back to your ribs.",
      "Squeeze your shoulder blades, lower with control.",
    ],
    coaching: "Balances pushing work and protects your shoulders, which matters a lot for goalkeepers.",
  },
  plank: {
    icon: "🧱",
    category: "Core",
    muscles: "Core, anti-rotation",
    variants: { bw: "Front Plank", light: "Plank with Shoulder Taps", loaded: "Band Pallof Press" },
    reps: { bw: "20 sec", light: "30 sec", loaded: "45 sec" },
    steps: [
      "Forearms on the floor, body in a straight line.",
      "Squeeze your glutes and brace your stomach.",
      "Don't let your hips sag or rise.",
    ],
    coaching: "A strong core transfers power from your legs to your shots and passes.",
  },
  medball: {
    icon: "🏐",
    category: "Power",
    muscles: "Core, hips (rotational power)",
    variants: { bw: "Partner Ball Throw (soccer ball)", light: "Med-Ball Rotational Throw (light ball)", loaded: "Med-Ball Rotational Throw (4–6 kg)" },
    reps: { bw: "8 each side", light: "6 each side", loaded: "6 each side" },
    steps: [
      "Stand side-on to a wall or partner.",
      "Rotate away and load your back hip.",
      "Explode and throw the ball with your whole body.",
    ],
    coaching: "Rotational power equals harder shots and longer goalkeeper throws.",
  },
};

const EQUIPMENT = {
  dumbbells: "Dumbbells",
  kettlebell: "Kettlebell",
  barbell: "Barbell & squat rack",
  bench: "Weight bench",
  box: "Plyo box or sturdy step",
  medball: "Medicine ball",
  bands: "Resistance bands",
};

// Equipment each variant requires: every inner list must be matched by at least one item.
// Variants not listed need no equipment.
const GYM_NEEDS = {
  squat: { light: [["dumbbells", "kettlebell"]], loaded: [["barbell"]] },
  rdl: { light: [["dumbbells", "kettlebell"]], loaded: [["barbell"]] },
  lunge: { light: [["dumbbells", "kettlebell"]], loaded: [["dumbbells", "kettlebell", "barbell"], ["bench", "box"]] },
  copenhagen: { light: [["bench", "box"]], loaded: [["bench", "box"]] },
  boxjump: { light: [["box"]], loaded: [["box"]] },
  calfraise: { loaded: [["dumbbells", "kettlebell"]] },
  pushup: { loaded: [["dumbbells"], ["bench"]] },
  row: { light: [["dumbbells", "kettlebell"]], loaded: [["barbell"]] },
  plank: { loaded: [["bands"]] },
  medball: { light: [["medball"]], loaded: [["medball"]] },
};

const POSITION_GYM = {
  gk: ["boxjump", "lateralbound", "squat", "medball", "row", "plank"],
  cb: ["squat", "rdl", "nordic", "copenhagen", "row", "boxjump"],
  fb: ["lateralbound", "nordic", "lunge", "copenhagen", "calfraise", "plank"],
  cdm: ["squat", "copenhagen", "row", "plank", "rdl", "lunge"],
  cm: ["lunge", "nordic", "calfraise", "plank", "broadjump", "row"],
  cam: ["broadjump", "lateralbound", "copenhagen", "plank", "lunge", "medball"],
  wing: ["broadjump", "nordic", "lateralbound", "calfraise", "rdl", "plank"],
  st: ["squat", "boxjump", "nordic", "pushup", "medball", "copenhagen"],
};

const PATHWAY = [
  {
    ages: "6–9",
    stage: "Love the Ball",
    hours: "2–4 hrs/week + free play",
    goals: [
      "Play a lot. Street soccer, futsal, backyard games all count.",
      "Use both feet equally.",
      "Try every position, including goalkeeper.",
    ],
  },
  {
    ages: "10–12",
    stage: "Golden Age of Skill",
    hours: "4–6 hrs/week",
    goals: [
      "Join a competitive club team.",
      "Master first touch, turning and 1v1 moves under pressure.",
      "Learn basic tactics: width, depth and support angles.",
      "Juggle 25+ touches in a row.",
    ],
  },
  {
    ages: "13–15",
    stage: "Train to Train",
    hours: "6–10 hrs/week",
    goals: [
      "Try out for academy or elite club teams.",
      "Start supervised gym training with light loads.",
      "Keep a training diary and start fitness testing.",
      "Learn 2 positions well.",
      "Watch pro games and study players in your position.",
    ],
  },
  {
    ages: "16–18",
    stage: "Train to Compete",
    hours: "10–15 hrs/week",
    goals: [
      "Make a highlight video with your best clips.",
      "Attend ID camps, showcases and college or academy trials.",
      "Specialize in your main position.",
      "Treat sleep (8–10 hrs), nutrition and recovery like training.",
      "Keep your grades up, because college soccer is a major pathway to pro.",
    ],
  },
  {
    ages: "19+",
    stage: "Train to Win",
    hours: "15–25 hrs/week",
    goals: [
      "Trial with semi-pro and pro clubs, or play college soccer.",
      "Work with a strength coach and track your load.",
      "Train your mental game: pressure, focus and confidence.",
      "Be consistent. Pros show up every single day.",
    ],
  },
];

// Approximate targets per age group. `lower` means a smaller number is better.
const BENCHMARKS = [
  { id: "sprint30", name: "30 m sprint", unit: "sec", lower: true, targets: { u16: 4.8, u19: 4.45, pro: 4.2 } },
  { id: "agility", name: "5-10-5 agility shuttle", unit: "sec", lower: true, targets: { u16: 5.0, u19: 4.7, pro: 4.5 } },
  { id: "vjump", name: "Vertical jump", unit: "cm", lower: false, targets: { u16: 38, u19: 45, pro: 50 } },
  { id: "yoyo", name: "Yo-Yo Intermittent Recovery 1", unit: "m", lower: false, targets: { u16: 1200, u19: 1600, pro: 2000 } },
  { id: "juggle", name: "Juggling record", unit: "touches", lower: false, targets: { u10: 10, u13: 25, u16: 250, u19: 500, pro: 500 } },
];

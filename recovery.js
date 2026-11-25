// Practical recovery guidance for student / youth athletes.
// Not medical advice — ice baths and aggressive methods need adult/coach clearance.

const RECOVERY_SLEEP_BY_AGE = [
  { maxAge: 12, hours: "9–12 hours", nap: "A short nap (20–30 min) after school is fine if it doesn't wreck night sleep." },
  { maxAge: 15, hours: "8–10 hours", nap: "Naps of 20–30 minutes can help on heavy training weeks." },
  { maxAge: 18, hours: "8–10 hours", nap: "Keep naps short so you still sleep well at night." },
  { maxAge: 99, hours: "7–9 hours (aim for 8+ in heavy weeks)", nap: "Use short naps when travel or late matches cut night sleep." },
];

const RECOVERY_METHODS = [
  {
    id: "sleep",
    icon: "😴",
    title: "Sleep & naps",
    summary: "Your #1 recovery tool. Muscles, brain, and mood all rebuild while you sleep.",
    tips: [
      "Keep a steady bedtime, even on weekends when you can.",
      "Dim screens 30–60 minutes before bed when possible.",
      "Dark, cool, quiet room beats fancy gadgets.",
    ],
    ageNote: true, // filled from RECOVERY_SLEEP_BY_AGE in the view
    caution: "",
  },
  {
    id: "active",
    icon: "🚶",
    title: "Active recovery",
    summary: "Easy movement the day after a match or hard session helps you feel less stiff.",
    tips: [
      "20–30 minutes of walking, easy jog, bike, or light swim.",
      "Stay conversational — if you can't talk easily, slow down.",
      "Finish with 5–10 minutes of the gym Mobility stretches.",
    ],
    caution: "",
  },
  {
    id: "foam",
    icon: "🧴",
    title: "Foam rolling & massage",
    summary: "Roll tight spots gently to feel looser before or after training.",
    tips: [
      "Quads, glutes, calves, and IT-band area — 30–60 seconds per spot.",
      "Breathe; ease off if it feels sharp or makes you tense up.",
      "A parent, athletic trainer, or licensed masseur is better for deep work than DIY force.",
    ],
    caution: "Skip rolling over joints, bones, or fresh injuries. Ask a coach or parent if you're unsure.",
  },
  {
    id: "nutrition",
    icon: "🍽️",
    title: "Nutrition & hydration",
    summary: "Refuel within about an hour after training or matches when you can.",
    tips: [
      "Pair carbs + protein: chocolate milk, yogurt + fruit, rice + chicken, sandwich + milk.",
      "Drink water through the day; add electrolytes in hot weather or after heavy sweat.",
      "Don't skip meals on double-session or match days.",
    ],
    caution: "",
  },
  {
    id: "rest",
    icon: "🛌",
    title: "Rest days",
    summary: "Getting stronger happens between sessions. Planned rest is part of the program.",
    tips: [
      "Follow your weekly load limit for your age group.",
      "A rest day can still include a walk and light stretching.",
      "If you're unusually sore, moody, or sleeping poorly, take an extra easy day.",
    ],
    caution: "",
  },
  {
    id: "ice",
    icon: "🧊",
    title: "Ice baths / cold plunge",
    summary: "Cold water can feel refreshing after hard matches for older athletes — it is optional, not required.",
    tips: [
      "Ages 16+: short cold showers or brief ice baths are sometimes used after intense games.",
      "Start mild: cool shower 1–2 minutes. Full ice baths only with adult supervision.",
      "Warm up afterward; don't drive or train hard right after if you feel shaky.",
    ],
    minAgeHint: 16,
    caution: "Not recommended as a routine for younger athletes. Always ask a coach, parent, or doctor before trying ice baths — especially if you have asthma, heart issues, or get dizzy in the cold.",
  },
  {
    id: "contrast",
    icon: "🚿",
    title: "Contrast showers",
    summary: "Alternating warm and cool water is a gentler option than a full ice bath.",
    tips: [
      "Example: 1 minute warm, 30–60 seconds cool, repeat 3–4 times.",
      "End on cool if you like; dry off and dress warmly.",
      "Useful when your legs feel heavy but you don't want a plunge.",
    ],
    caution: "Skip if you feel unwell, dizzy, or have circulation concerns — check with a parent or doctor.",
  },
  {
    id: "elevation",
    icon: "🦵",
    title: "Elevation & light compression",
    summary: "Simple ways to help swollen or heavy legs after travel or a tough match.",
    tips: [
      "Lie down and put your legs up on a wall or pillows for 10–15 minutes.",
      "Light compression socks on travel days can feel good for some players.",
      "Combine with water, a snack, and an early night.",
    ],
    caution: "",
  },
];

function recoverySleepForAge(age) {
  const a = age || 14;
  return RECOVERY_SLEEP_BY_AGE.find((row) => a <= row.maxAge) || RECOVERY_SLEEP_BY_AGE[RECOVERY_SLEEP_BY_AGE.length - 1];
}

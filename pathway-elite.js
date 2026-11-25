// Elite Pathway layer: weekly checklist, scout toolkit, match reflection, parent tips.
// Copy frames preparation as maximizing chance — never as guaranteed outcomes.

const ELITE_WEEK_KEY = "sth-elite-week";
const MATCH_LOG_KEY = "sth-match-log";

const ELITE_CHECKLIST = [
  {
    id: "teamIntensity",
    label: "Full intensity at every team practice",
    hint: "Club sessions are your highest-leverage hours. Compete in every drill.",
  },
  {
    id: "oneVone",
    label: "Extra 1v1 games or futsal this week",
    hint: "Small-sided play builds decision speed under pressure — what pathway coaches watch for.",
  },
  {
    id: "highlights",
    label: "Film at least one clean highlight clip",
    hint: "Phone on a tripod or parent/coach filming from the sideline is enough.",
  },
  {
    id: "sleep",
    label: "Hit sleep target most nights (8–10 hrs for teens)",
    hint: "Sleep is when skill and fitness stick. Treat it like a session.",
  },
  {
    id: "mobility",
    label: "Mobility / cool-down 3+ times",
    hint: "Use the Gym mobility block or Recovery page after hard days.",
  },
  {
    id: "matchReview",
    label: "Write short match or practice review notes",
    hint: "One thing you did well + one thing to fix. Feeds your next Today tip.",
  },
];

const PARENT_COACH_TIPS = [
  "Club games and team practice come first. Extra solo work should never leave a player flat for match day.",
  "Don't stack hard sessions on back-to-back days without a reason. Rest is part of getting better.",
  "Ages ~6–12: multi-sport (or free play) builds athleticism and cuts burnout risk. Specialization can wait.",
  "Protect sleep. Growth, mood, and learning all suffer when nights are short.",
  "Watch for overuse pain (knees, heels, groin). Cut jumping/sprinting volume and tell a coach or doctor early.",
  "Your job is support and logistics — not coaching every touch. Let the club coach own technical feedback.",
  "Celebrate effort and improvement, not only results. Pressure from home is one of the fastest ways to kill love of the game.",
];

const SCOUT_FILMING = {
  title: "How to film highlights",
  intro: "A clean, honest reel helps coaches and scouts see you quickly. Keep it short and truthful.",
  points: [
    "Angle: film from the side / slightly elevated (bleachers or phone on a stick), not from behind the goal only. Scouts need to see body shape and decision-making.",
    "Clip length: 3–6 minutes total for a highlight reel. Open with your best 30–60 seconds.",
    "Show the ball and your number. Add a lower-third with name, year of birth, position, club, and dominant foot.",
    "Include full actions: receive → decide → execute → outcome. Cut dead time, not context.",
    "By position — GK: shot-stopping, crosses, distribution, command. Defenders: 1v1 defending, recovery, aerials, build-out passes. Midfielders: scanning, receiving under pressure, progressive passes. Attackers: 1v1s, finishing with both feet, runs in behind, link play.",
    "Never fake clips or use other players' footage. Integrity matters more than polish.",
  ],
};

const SCOUT_ID_CAMPS = {
  title: "ID camps / trials prep checklist",
  intro: "Camps and trials are evaluations, not magic tickets. Prepare like a professional and stay scam-aware.",
  points: [
    "Confirm it's a legitimate club, college, or federation event. Real opportunities don't require big 'guaranteed roster' fees.",
    "Arrive with match-fit fitness, both feet usable, and a clear primary position (plus one secondary).",
    "Pack: boots (broken in), trainers, shin guards, water, simple carbs snack, tape if you use it.",
    "Warm up thoroughly on your own before the first drill — don't wait for staff to babysit your readiness.",
    "Compete in every rep: communication, recovery runs, and body language count as much as flashy skills.",
    "Ask polite, specific questions after sessions. Follow up with a short thank-you email and your highlight link if invited.",
    "Never pay an 'agent' for a trial introduction. See the anti-scam tips on Pro Pathway.",
  ],
};

const SCOUT_BY_AGE = [
  {
    ages: "10–12",
    lookFor: [
      "Love of the ball and both-foot comfort",
      "Curiosity, coachability, and bravery in 1v1s",
      "Game understanding basics: width, support, scanning",
      "Not adult athleticism — that comes later",
    ],
  },
  {
    ages: "13–15",
    lookFor: [
      "Receiving and deciding under pressure",
      "Competitive intensity in training, not just matches",
      "Physical resilience through growth spurts (smart load management)",
      "Two positions known well; emerging specialty",
    ],
  },
  {
    ages: "16–18",
    lookFor: [
      "Position-specific habits at match speed",
      "Athletic profile (speed, agility, repeat sprint) plus football IQ",
      "Highlight reel + consistent club minutes at a high level",
      "Professional habits: sleep, nutrition, recovery, grades where college is a route",
    ],
  },
  {
    ages: "19+",
    lookFor: [
      "Ready-now contribution in competitive environments",
      "Mental consistency under pressure",
      "Proven availability (injury management) and trainable body",
      "Clear pathway: college, academy graduate, or senior trials",
    ],
  },
];

const RESUME_CONTACT_TIPS = {
  title: "Contact / one-pager tips",
  intro: "A one-page player sheet helps coaches find the facts fast. This is not agent advice — keep it simple and honest.",
  points: [
    "Include: full name, DOB, height/weight (approx), dominant foot, primary + secondary position, club/team, coach contact, and a highlight link.",
    "Add recent minutes / level (league name), and 2–3 measurable strengths (e.g. left-foot crossing, aerial duels).",
    "One photo in kit is fine. Skip hype language ('next Messi'). Let the footage talk.",
    "Share via email or a clean cloud link. Update it when you change clubs or levels.",
    "Parents/coaches: send to verified club emails only. Cross-check event organizers before sharing personal details.",
  ],
};

const PRO_STANDARD_BY_WEEK = [
  "Pro standard (when load allows): every technical rep at match tempo. Film one set and note one fix.",
  "Pro standard (when load allows): add a sharp 10–15 min weak-foot or pressure-receive block after team practice — only if legs feel fresh.",
  "Pro standard (when load allows): compete in small-sided or 1v1 work like it's a showcase. Intensity without chaos.",
  "Pro standard (when load allows): taper volume, raise quality. Sleep and nutrition are non-negotiable before game-ready week.",
];

function eliteWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getEliteWeekState() {
  try {
    const raw = JSON.parse(localStorage.getItem(ELITE_WEEK_KEY) || "{}");
    const week = eliteWeekId();
    if (raw.week !== week) return { week, checks: {} };
    return { week, checks: raw.checks || {} };
  } catch {
    return { week: eliteWeekId(), checks: {} };
  }
}

function setEliteCheck(id, done) {
  const state = getEliteWeekState();
  if (done) state.checks[id] = true;
  else delete state.checks[id];
  localStorage.setItem(ELITE_WEEK_KEY, JSON.stringify(state));
}

function eliteChecklistHtml() {
  const { week, checks } = getEliteWeekState();
  const done = ELITE_CHECKLIST.filter((i) => checks[i.id]).length;
  return `
    <div class="card elite-week" id="eliteWeekCard">
      <h3>⭐ Weekly Elite Plan <span class="tag">${week}</span></h3>
      <p class="muted">What serious pathway players stack on top of their club week — check off as you go. Resets each Monday-week.</p>
      <p><strong>${done}/${ELITE_CHECKLIST.length}</strong> complete this week</p>
      <ul class="elite-checks">
        ${ELITE_CHECKLIST.map((item) => `
          <li>
            <label class="elite-check">
              <input type="checkbox" data-elite="${item.id}" ${checks[item.id] ? "checked" : ""} />
              <span><strong>${item.label}</strong><br><small class="muted">${item.hint}</small></span>
            </label>
          </li>`).join("")}
      </ul>
      <p class="muted"><a href="#/scout">Scout-ready toolkit →</a> · <a href="#/pathway">Full Pro Pathway →</a></p>
    </div>`;
}

function bindEliteChecklist(onChange) {
  document.querySelectorAll("[data-elite]").forEach((input) => {
    input.addEventListener("change", () => {
      setEliteCheck(input.dataset.elite, input.checked);
      if (onChange) onChange();
    });
  });
}

function getMatchLogs() {
  try {
    const list = JSON.parse(localStorage.getItem(MATCH_LOG_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveMatchLog(entry) {
  const list = getMatchLogs();
  list.unshift({ ...entry, at: new Date().toISOString() });
  localStorage.setItem(MATCH_LOG_KEY, JSON.stringify(list.slice(0, 20)));
}

function latestMatchLog() {
  return getMatchLogs()[0] || null;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function parseImpact(actions) {
  const text = String(actions || "").toLowerCase();
  const goals =
    Number((text.match(/(\d+)\s*(goals?|g\b)/) || [])[1]) ||
    (/\bbrace\b/.test(text) ? 2 : /\bhat\s*trick\b/.test(text) ? 3 : 0);
  const assists =
    Number((text.match(/(\d+)\s*(assists?|a\b)/) || [])[1]) || 0;
  return { goals, assists };
}

/** Build a match rating /10 from minutes, impact, and self scores. */
function computeMatchRating(entry) {
  const effort = Number(entry.effort) || 5;
  const technique = Number(entry.technique) || 5;
  const decisions = Number(entry.decisions) || 5;
  const physical = Number(entry.physical) || 5;
  const selfAvg = (effort + technique + decisions + physical) / 4;

  const minutes = clamp(Number(entry.minutes) || 0, 0, 120);
  const minuteFactor = minutes <= 0 ? 0.85 : minutes < 30 ? 0.9 : minutes < 60 ? 0.96 : 1;

  const { goals, assists } = parseImpact(entry.actions);
  const impactBoost = clamp(goals * 0.35 + assists * 0.25, 0, 1.4);

  // Honest reflection is part of elite habits — tiny bump, not a free 10.
  const improveBump = String(entry.improve || "").trim().length >= 8 ? 0.15 : 0;

  const raw = selfAvg * minuteFactor + impactBoost + improveBump;
  const score = Math.round(clamp(raw, 1, 10) * 10) / 10;

  let label = "Needs work";
  if (score >= 9) label = "Outstanding";
  else if (score >= 8) label = "Excellent";
  else if (score >= 7) label = "Strong";
  else if (score >= 6) label = "Solid";
  else if (score >= 5) label = "Average";
  else if (score >= 4) label = "Below par";

  const parts = [];
  if (minutes) parts.push(`${minutes} min`);
  if (goals) parts.push(`${goals} goal${goals === 1 ? "" : "s"}`);
  if (assists) parts.push(`${assists} assist${assists === 1 ? "" : "s"}`);
  parts.push(`effort ${effort}/10`);

  return {
    score,
    label,
    blurb: parts.length ? parts.join(" · ") : "Based on your self-scores",
  };
}

function matchRatingBadgeHtml(rating) {
  if (!rating) return "";
  const band = rating.score >= 7 ? "high" : rating.score >= 5 ? "mid" : "low";
  return `
    <div class="match-rating ${band}" aria-label="Match rating ${rating.score} out of 10">
      <div class="match-rating-score">${rating.score}<span>/10</span></div>
      <div>
        <strong>${escapeElite(rating.label)}</strong>
        <div class="muted">${escapeElite(rating.blurb)}</div>
      </div>
    </div>`;
}

/** Tip for Today based on the last post-match note. */
function matchReflectionTip() {
  const log = latestMatchLog();
  if (!log?.improve) return "";
  const when = log.at ? new Date(log.at).toLocaleDateString() : "recently";
  const rating = log.rating || computeMatchRating(log);
  const rateBit = rating ? ` Match rating: <strong>${rating.score}/10 (${escapeElite(rating.label)})</strong>.` : "";
  return `From your ${when} match note:${rateBit} Focus on <strong>${escapeElite(log.improve)}</strong> in today's work.`;
}

function escapeElite(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scoreSelect(name, label) {
  return `
    <label>${label}
      <select name="${name}" required>
        <option value="">—</option>
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<option value="${n}">${n}</option>`).join("")}
      </select>
    </label>`;
}

function matchLogHtml() {
  const last = latestMatchLog();
  const lastRating = last ? (last.rating || computeMatchRating(last)) : null;
  const lastHtml = last
    ? `${matchRatingBadgeHtml(lastRating)}
      <p class="muted">Last log (${new Date(last.at).toLocaleDateString()}):
        ${last.minutes != null && last.minutes !== "" ? `${escapeElite(last.minutes)} min` : "—"}
        ${last.actions ? ` · ${escapeElite(last.actions)}` : ""}
        ${last.improve ? ` · Improve: <em>${escapeElite(last.improve)}</em>` : ""}</p>`
    : `<p class="muted">No match logged yet. After your next game, rate yourself and we'll give you a match rating out of 10.</p>`;

  return `
    <div class="card match-log" id="matchLogCard">
      <h3>🏟️ After-match reflection</h3>
      <p>Rate your game → get a match rating /10. It also feeds your next tip on <a href="#/today">Today</a>.</p>
      ${lastHtml}
      <form id="matchLogForm" class="match-log-form">
        <label>Minutes played
          <input type="number" name="minutes" min="0" max="120" placeholder="e.g. 65" />
        </label>
        <label>Goals / assists or key actions
          <input type="text" name="actions" maxlength="120" placeholder="e.g. 1 goal, 1 assist, won 4 duels" />
        </label>
        <div class="match-scores">
          ${scoreSelect("effort", "Effort")}
          ${scoreSelect("technique", "Technique")}
          ${scoreSelect("decisions", "Decisions")}
          ${scoreSelect("physical", "Physical / duels")}
        </div>
        <label>One thing to improve
          <input type="text" name="improve" maxlength="160" required placeholder="e.g. first touch under pressure" />
        </label>
        <button class="btn small" type="submit">Save & get rating</button>
      </form>
    </div>`;
}

function bindMatchLog(onSave) {
  const form = document.getElementById("matchLogForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const improve = String(fd.get("improve") || "").trim();
    if (!improve) return;
    const entry = {
      minutes: String(fd.get("minutes") || "").trim(),
      actions: String(fd.get("actions") || "").trim(),
      effort: String(fd.get("effort") || "").trim(),
      technique: String(fd.get("technique") || "").trim(),
      decisions: String(fd.get("decisions") || "").trim(),
      physical: String(fd.get("physical") || "").trim(),
      improve,
    };
    entry.rating = computeMatchRating(entry);
    saveMatchLog(entry);
    if (onSave) onSave();
  });
}

function parentCoachTipHtml(date = new Date()) {
  const tip = PARENT_COACH_TIPS[date.getDate() % PARENT_COACH_TIPS.length];
  return `
    <div class="card parent-tip">
      <h3>👪 Parent / coach mode</h3>
      <p>${tip}</p>
      <p class="muted">Short guidance only — club coaches still lead the technical plan.</p>
    </div>`;
}

function honestyNoteHtml() {
  return `
    <div class="coach honesty">
      <strong>Honest note:</strong> Going pro is rare. No app can promise a roster spot.
      What this system does is help you maximize your chance with structured daily/weekly habits —
      the same kind of deliberate prep serious pathway players use. You still need a real club,
      competitive minutes, and (when the time comes) real scouts — never paid “guarantees.”
    </div>`;
}

function proStandardNoteHtml(weekIndex, group) {
  if (!group || !["u16", "u19", "pro"].includes(group.id)) return "";
  const note = PRO_STANDARD_BY_WEEK[weekIndex] || PRO_STANDARD_BY_WEEK[0];
  return `<p class="pro-standard"><span class="tag cone">Pro Standard</span> ${note}</p>`;
}

function scoutToolkitHtml() {
  return `
    <h2>🎬 Scout-ready toolkit</h2>
    <p class="muted">Practical prep that separates organized pathway players — not a shortcut past club football.</p>

    <div class="card">
      <h3>${SCOUT_FILMING.title}</h3>
      <p>${SCOUT_FILMING.intro}</p>
      <ul>${SCOUT_FILMING.points.map((p) => `<li>${p}</li>`).join("")}</ul>
    </div>

    <div class="card">
      <h3>${SCOUT_ID_CAMPS.title}</h3>
      <p>${SCOUT_ID_CAMPS.intro}</p>
      <ul>${SCOUT_ID_CAMPS.points.map((p) => `<li>${p}</li>`).join("")}</ul>
    </div>

    <h3>What scouts look for by age</h3>
    <div class="pathway scout-ages">
      ${SCOUT_BY_AGE.map((band) => `
        <div class="card stage">
          <span class="tag">Ages ${band.ages}</span>
          <ul>${band.lookFor.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>`).join("")}
    </div>

    <div class="card">
      <h3>${RESUME_CONTACT_TIPS.title}</h3>
      <p>${RESUME_CONTACT_TIPS.intro}</p>
      <ul>${RESUME_CONTACT_TIPS.points.map((p) => `<li>${p}</li>`).join("")}</ul>
    </div>`;
}

function viewScout() {
  const appEl = document.getElementById("app");
  appEl.innerHTML = `
    <a href="#/pathway">← Pro Pathway</a>
    <h1>🎬 Scout-ready toolkit</h1>
    ${honestyNoteHtml()}
    ${scoutToolkitHtml()}
    <div class="btn-row">
      <a class="btn secondary" href="#/pathway">Age stages & benchmarks</a>
      <a class="btn secondary" href="#/today">Weekly Elite Plan on Today</a>
    </div>`;
}

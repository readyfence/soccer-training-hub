const app = document.getElementById("app");
const STORE_KEY = "sth-progress";
const POS_KEY = "sth-position";
const AGE_KEY = "sth-age";
const BENCH_KEY = "sth-benchmarks";
const GYM_KEY = "sth-gym-setup";
const GYM_MODES = ["bw", "light", "loaded"];
const PROFILE_KEY = "sth-profile";
const ROLE_KEY = "sth-roles";
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

let timerHandle = null;

const store = {
  get() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  },
  markDone(key) {
    const data = store.get();
    data[key] = new Date().toISOString();
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  },
  reset() { localStorage.removeItem(STORE_KEY); },
};

// ---------- Age ----------

function getAge() {
  const age = Number(localStorage.getItem(AGE_KEY));
  return age > 0 ? age : null;
}

// Without an age we fall back to the 13–15 group as a middle-ground default.
function ageGroup(age = getAge()) {
  if (!age) return AGE_GROUPS.find((g) => g.id === "u16");
  return AGE_GROUPS.find((g) => age >= g.min && age <= g.max) || AGE_GROUPS[AGE_GROUPS.length - 1];
}

function headingRule(age = getAge()) {
  if (age && age < 11) return "none";
  if (age && age <= 13) return "limited";
  return "full";
}

const HEADING_TEXT = {
  none: "No heading under 11. Heading drills are swapped for juggling.",
  limited: "Limited heading (ages 11–13): about 15–20 headers per week, with a lighter ball.",
  full: "Heading allowed. Keep technique sharp and avoid high-volume sessions.",
};

function sessionsThisWeek() {
  const now = Date.now();
  return Object.values(store.get()).filter((iso) => now - new Date(iso).getTime() < WEEK_MS).length;
}

function ageFormHtml() {
  const age = getAge();
  return `
    <form class="age-form">
      <label>Your age
        <input type="number" name="age" min="5" max="60" required value="${age ?? ""}" placeholder="e.g. 14" />
      </label>
      <button class="btn small" type="submit">${age ? "Update" : "Save"}</button>
    </form>`;
}

function bindAgeForms(onSave) {
  app.querySelectorAll(".age-form").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const age = Number(new FormData(form).get("age"));
      if (age < 5 || age > 60) return;
      localStorage.setItem(AGE_KEY, String(age));
      updateAgeBadge();
      onSave();
    })
  );
}

function updateAgeBadge() {
  const age = getAge();
  const country = COUNTRIES[getProfile().country];
  const parts = [age && `Age ${age}`, country?.flag].filter(Boolean);
  document.getElementById("ageBadge").textContent = parts.length ? `👤 ${parts.join(" · ")}` : "👤 My profile";
}

// ---------- Profile ----------

function getProfile() {
  try { return { teamDays: [], matchDays: [], season: "auto", ...JSON.parse(localStorage.getItem(PROFILE_KEY)) }; }
  catch { return { teamDays: [], matchDays: [], season: "auto" }; }
}

function seasonPhase(profile = getProfile(), date = new Date()) {
  if (profile.season && profile.season !== "auto") return profile.season;
  const season = (COUNTRIES[profile.country] || COUNTRIES.other).season;
  const month = date.getMonth() + 1;
  if (season.off.includes(month)) return "off";
  if (season.pre.includes(month)) return "pre";
  return "in";
}

function weatherTip(profile, date = new Date()) {
  const country = COUNTRIES[profile.country];
  if (!country) return "";
  const month = date.getMonth() + 1;
  const summer = country.hemisphere === "N" ? [6, 7, 8] : [12, 1, 2];
  const winter = country.hemisphere === "N" ? [12, 1, 2] : [6, 7, 8];
  if (summer.includes(month)) return "☀️ It's summer where you are. Train early or late to avoid the heat, and drink water every 15–20 minutes.";
  if (winter.includes(month)) return "❄️ It's winter where you are. Wear layers and add 5 extra minutes to your warm-up.";
  return "";
}

function pathwayTipOfDay(profile, date = new Date()) {
  const tips = [...(COUNTRIES[profile.country] || COUNTRIES.other).pathway, ...UNIVERSAL_PATHWAY_TIPS];
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  return tips[dayOfYear % tips.length];
}

const teamLoad = (profile = getProfile()) => profile.teamDays.length + profile.matchDays.length;

function loadMeterHtml() {
  const group = ageGroup();
  const logged = sessionsThisWeek();
  const team = teamLoad();
  const count = logged + team;
  const pct = Math.min(100, (count / group.maxPerWeek) * 100);
  const level = count > group.maxPerWeek ? "over" : count === group.maxPerWeek ? "full" : "ok";
  const msg = {
    ok: "You're within a safe training load.",
    full: "You've hit your recommended limit. Take a rest day next.",
    over: "You're over the recommended load for your age. Rest is needed to avoid injury and burnout.",
  }[level];
  return `
    <div class="load ${level}">
      <strong>Weekly load monitor:</strong> ${count} of ${group.maxPerWeek} sessions
      (${logged} logged here in the last 7 days${team ? ` + ${team} team practices/matches` : ""})
      <div class="progress-bar"><span style="width:${pct}%"></span></div>
      <small>${msg} ${team ? "" : `Add your team schedule in <a href="#/profile">your profile</a> so it counts too.`}</small>
    </div>`;
}

// ---------- Gym setup ----------

function getGymSetup() {
  try { return JSON.parse(localStorage.getItem(GYM_KEY)); }
  catch { return null; }
}

// Under-18s only lift weights with a supervising strength coach.
function gymMode() {
  const base = ageGroup().gymMode;
  const age = getAge();
  if (getGymSetup()?.supervised || (age && age >= 18)) return base;
  const cap = age && age >= 16 ? "light" : "bw";
  return GYM_MODES[Math.min(GYM_MODES.indexOf(base), GYM_MODES.indexOf(cap))];
}

const gymCapped = () => gymMode() !== ageGroup().gymMode;

function pickVariant(id) {
  const owned = getGymSetup()?.equipment || [];
  for (let i = GYM_MODES.indexOf(gymMode()); i >= 0; i--) {
    const mode = GYM_MODES[i];
    const needs = GYM_NEEDS[id]?.[mode] || [];
    if (needs.every((anyOf) => anyOf.some((e) => owned.includes(e)))) {
      return { mode, name: GYM[id].variants[mode], reps: GYM[id].reps[mode] };
    }
  }
}

function gymNote(mode) {
  const setup = getGymSetup();
  const { maxLoad } = ageGroup();
  let note = mode === "light" && maxLoad
    ? `Use ${maxLoad} dumbbells or kettlebells only, and only with your strength coach watching every set. Form comes before weight.`
    : GYM_LOAD_NOTE[mode];
  if (mode !== "bw" && !setup?.supervised) note += " No coach present, so always use a spotter and stop the set if your form breaks down.";
  if (gymCapped()) note += " Heavier weights unlock when a qualified strength coach supervises you.";
  return note;
}

function gymSetupSummary() {
  const setup = getGymSetup();
  if (!setup) return `<p>You haven't told us about your gym setup yet. <a href="#/gym-setup">Set it up →</a></p>`;
  const gear = setup.equipment.length ? setup.equipment.map((e) => EQUIPMENT[e]).join(", ") : "No equipment (bodyweight)";
  return `
    <p><strong>Supervision:</strong> ${setup.supervised ? "✅ Qualified strength coach" : "❌ No strength coach"}<br>
      <strong>Equipment:</strong> ${gear}<br>
      <a href="#/gym-setup">Edit gym setup</a></p>`;
}

// ---------- Sessions ----------

const sessionKey = (pos, week, idx) => `${pos}-${week}-${idx}`;
const sessionsPerWeek = (pos) => POSITIONS[pos].sessions.length + 1;
const totalSessions = (pos) => sessionsPerWeek(pos) * WEEK_INTENSITY.length;
const completedFor = (pos) => Object.keys(store.get()).filter((k) => k.startsWith(pos + "-")).length;

function getRole(pos) {
  const roles = JSON.parse(localStorage.getItem(ROLE_KEY) || "{}");
  const id = roles[pos];
  return ROLES[pos]?.[id] ? { id, ...ROLES[pos][id] } : null;
}

function setRole(pos, roleId) {
  const roles = JSON.parse(localStorage.getItem(ROLE_KEY) || "{}");
  if (roleId) roles[pos] = roleId;
  else delete roles[pos];
  localStorage.setItem(ROLE_KEY, JSON.stringify(roles));
}

// The style drill for a session, skipping any already in it.
function styleDrill(pos, idx) {
  const role = getRole(pos);
  if (!role) return null;
  const base = POSITIONS[pos].sessions[idx];
  const n = role.drills.length;
  for (let i = 0; i < n; i++) {
    const id = role.drills[(idx + i) % n];
    if (!base.includes(id)) return id;
  }
  return null;
}

function fieldDrills(pos, idx) {
  const extra = styleDrill(pos, idx);
  const ids = extra ? [...POSITIONS[pos].sessions[idx], extra] : POSITIONS[pos].sessions[idx];
  return headingRule() === "none" ? ids.map((id) => (id === "heading" ? "juggling" : id)) : ids;
}

function buildItems(pos, week, idx) {
  const group = ageGroup();
  const sets = group.sets[week];

  if (idx === "gym") {
    return POSITION_GYM[pos].map((id) => {
      const g = GYM[id];
      const { mode, name, reps } = pickVariant(id);
      return {
        title: name,
        category: g.category,
        tags: [`${sets} sets × ${reps}`, `Rest ${GYM_REST[mode]}s`, GYM_MODE_LABEL[mode]],
        setup: `Works: ${g.muscles}. Warm up for 5–10 minutes before your first set.`,
        steps: g.steps,
        coaching: g.coaching,
        warning: gymNote(mode),
        visual: `<div class="gym-visual"><div class="big">${g.icon}</div><div>${g.muscles}</div></div>`,
        timerSec: GYM_REST[mode],
        timerLabel: "rest timer",
      };
    });
  }

  const extra = styleDrill(pos, idx);
  const role = getRole(pos);
  return fieldDrills(pos, idx).map((id) => {
    const d = DRILLS[id];
    return {
      title: d.name,
      category: d.category,
      tags: [...(id === extra ? [`⭐ ${role.name} drill`] : []), `${sets} sets`, `Equipment: ${d.equipment}`],
      setup: d.setup,
      steps: d.steps,
      coaching: d.coaching,
      warning: id === "heading" && headingRule() === "limited" ? HEADING_TEXT.limited : "",
      visual: `${drillDiagram(d)}<p><small>🔵 = you &nbsp; 🔶 = cones &nbsp; dashed line = your path</small></p>`,
      timerSec: Math.round(d.minutes * group.volume) * 60,
      timerLabel: "drill timer",
    };
  });
}

function sessionMinutes(pos, week, idx) {
  const group = ageGroup();
  if (idx === "gym") return Math.round(POSITION_GYM[pos].length * group.sets[week] * 1.5 + 10);
  return fieldDrills(pos, idx)
    .reduce((sum, id) => sum + Math.round(DRILLS[id].minutes * group.volume), 0);
}

function drillDiagram(drill) {
  const cones = drill.cones
    .map(([x, y]) => `<polygon points="${x},${y - 3} ${x - 2.5},${y + 2} ${x + 2.5},${y + 2}" fill="#ff8a00" stroke="#c55f00" stroke-width="0.4"/>`)
    .join("");
  const path = drill.path.map(([x, y]) => `${x},${y}`).join(" ");
  const [sx, sy] = drill.path[0];
  const goal = drill.goal
    ? `<rect x="35" y="1" width="30" height="5" fill="none" stroke="#fff" stroke-width="0.8"/>`
    : "";
  return `
    <svg class="pitch" viewBox="0 0 100 75" role="img" aria-label="Drill diagram for ${drill.name}">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#fff"/>
        </marker>
      </defs>
      <rect x="1" y="1" width="98" height="73" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
      ${goal}
      <polyline points="${path}" fill="none" stroke="#fff" stroke-width="0.8" stroke-dasharray="2 1.5" marker-end="url(#arrow)"/>
      ${cones}
      <circle cx="${sx}" cy="${sy}" r="2.6" fill="#1d4ed8" stroke="#fff" stroke-width="0.6"/>
    </svg>`;
}

function setActiveNav() {
  const hash = location.hash || "#/";
  document.querySelectorAll(".topbar nav a").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle("active", href === "#/" ? hash === "#/" || hash === "#" : hash.startsWith(href));
  });
}

// ---------- Daily plan ----------

function nextSession(pos, skip = () => false) {
  const done = store.get();
  const slots = [...POSITIONS[pos].sessions.map((_, s) => s), "gym"];
  for (let w = 0; w < WEEK_INTENSITY.length; w++) {
    for (const s of slots) {
      if (!done[sessionKey(pos, w, s)] && !skip(w, s)) return { week: w, idx: s };
    }
  }
  return null;
}

const trainedToday = () =>
  Object.values(store.get()).some((iso) => new Date(iso).toDateString() === new Date().toDateString());

function sessionLink(pos, { week, idx }) {
  const name = idx === "gym" ? "Gym Session" : `Field Session ${idx + 1}`;
  return {
    title: `${name} (Week ${week + 1}: ${WEEK_INTENSITY[week]})`,
    action: `<a class="btn" href="#/session/${pos}/${week}/${idx}">Start session</a>`,
    detail: `~${sessionMinutes(pos, week, idx)} min · ${getRole(pos) ? `${getRole(pos).name} ` : ""}${POSITIONS[pos].name} program`,
  };
}

// Returns { icon, title, detail, reasons[], todo[], action } for today.
function buildTodayPlan(date = new Date()) {
  const profile = getProfile();
  const pos = localStorage.getItem(POS_KEY);
  const day = date.getDay();
  const yesterday = (day + 6) % 7;
  const tomorrow = (day + 1) % 7;
  const isMatch = (d) => profile.matchDays.includes(d);
  const phase = seasonPhase(profile, date);
  const group = ageGroup();

  if (!POSITIONS[pos]) {
    return {
      icon: "🧭", title: "Find your position first",
      reasons: ["Your daily plan is built from your position's program."],
      action: `<a class="btn" href="#/finder">Find my position</a> <a class="btn secondary" href="#/pick">I know my position</a>`,
    };
  }

  if (isMatch(day)) {
    return {
      icon: "🏟️", title: "Match day!",
      reasons: [`You told us you play on ${DAY_NAMES[day]}s.`],
      todo: [
        "Eat a carb-rich meal 3–4 hours before kick-off (pasta, rice, bread).",
        "Drink water through the day so you're hydrated before the game.",
        `Do your <a href="#/drill/warmup">dynamic warm-up</a> before the match.`,
        "No extra training today. Save it all for the game.",
        "After: cool down, stretch, and eat protein + carbs within an hour.",
      ],
    };
  }

  if (trainedToday()) {
    return {
      icon: "✅", title: "Done for today",
      reasons: ["You've already finished a session today."],
      todo: ["Stretch for 10 minutes.", "Eat well and aim for 8–10 hours of sleep."],
    };
  }

  if (isMatch(yesterday)) {
    return {
      icon: "🧊", title: "Recovery day",
      reasons: [`You played yesterday (${DAY_NAMES[yesterday]}).`],
      todo: [
        "20 minutes of light movement: walking, easy jog, or a bike ride.",
        "10–15 minutes of stretching or foam rolling.",
        "Extra sleep and plenty of water.",
        "No hard training. Your body rebuilds today.",
      ],
    };
  }

  if (profile.teamDays.includes(day)) {
    const extra = isMatch(tomorrow)
      ? `Match tomorrow, so keep extras tiny: 5 minutes of <a href="#/drill/juggling">juggling</a> at most.`
      : `Optional 10–15 min extra after practice: <a href="#/drill/juggling">juggling</a> or bodyweight Nordic curls and Copenhagen planks for injury prevention.`;
    return {
      icon: "👥", title: "Team practice day",
      reasons: [`You have team practice on ${DAY_NAMES[day]}s.`],
      todo: ["Give 100% at practice. It's your most important session today.", extra],
    };
  }

  const load = sessionsThisWeek() + teamLoad(profile);
  if (load >= group.maxPerWeek) {
    return {
      icon: "🛌", title: "Rest day",
      reasons: [`You've reached ${load} of your ${group.maxPerWeek} recommended sessions this week for age group ${group.label}.`],
      todo: ["Rest is when you get stronger. Take the day off.", "Light stretching or a walk is fine."],
    };
  }

  const reasons = [`${DAY_NAMES[day]} is a free day in your schedule.`];
  const matchTomorrow = isMatch(tomorrow);
  let next = nextSession(pos);
  if (!next) {
    return {
      icon: "🏆", title: "Program complete!",
      reasons: [`You've finished all 4 weeks of the ${POSITIONS[pos].name} program.`],
      todo: [
        `Re-test your <a href="#/pathway">fitness benchmarks</a> to see how far you've come.`,
        `Reset your progress on <a href="#/progress">My Progress</a> to run the program again. Your age settings will make it harder as you grow.`,
      ],
    };
  }

  if (matchTomorrow && next.idx === "gym") {
    next = nextSession(pos, (w, s) => s === "gym") || null;
    reasons.push("Match tomorrow, so the gym session is moved to keep your legs fresh.");
  } else if (phase === "off" && next.idx !== "gym") {
    const gymFirst = nextSession(pos, (w, s) => s !== "gym" || w !== next.week);
    if (gymFirst) {
      next = gymFirst;
      reasons.push("It's the off-season, so gym work comes first this week.");
    }
  }

  if (!next) {
    return {
      icon: "🎯", title: "Light skills day",
      reasons: [...reasons, "Match tomorrow, so keep it short and sharp."],
      todo: [`15 minutes of <a href="#/drill/juggling">juggling</a> and <a href="#/drill/firsttouch">first touch</a> work. Nothing tiring.`],
    };
  }

  const session = sessionLink(pos, next);
  if (matchTomorrow) reasons.push("Match tomorrow: do just 1 set of each drill and stop well before you're tired.");
  reasons.push(`Next up in your ${POSITIONS[pos].name} program.`);
  return { icon: next.idx === "gym" ? "🏋️" : "⚽", ...session, reasons };
}

function todayCardHtml(plan) {
  return `
    <div class="card today">
      <div class="today-head">
        <div class="big">${plan.icon}</div>
        <div>
          <p class="stepper">📅 ${fullDate()}</p>
          <h2>${plan.title}</h2>
          ${plan.detail ? `<p class="muted">${plan.detail}</p>` : ""}
        </div>
      </div>
      ${plan.todo ? `<ul class="todo">${plan.todo.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}
      ${plan.action ? `<div class="btn-row">${plan.action}</div>` : ""}
      <details><summary>Why this plan?</summary><ul>${plan.reasons.map((r) => `<li>${r}</li>`).join("")}</ul></details>
    </div>`;
}

// ---------- Views ----------

function viewHome() {
  const saved = localStorage.getItem(POS_KEY);
  const age = getAge();
  const group = ageGroup();
  const resume = saved && POSITIONS[saved]
    ? `<a class="btn secondary" href="#/position/${saved}">Continue ${POSITIONS[saved].name} program</a>`
    : "";
  app.innerHTML = `
    <section class="hero">
      <h1>Train like your position demands.</h1>
      <p>From your first club team to going pro: find your position, then follow position-specific cone drills,
        gym sessions and fitness work, all matched to your age.</p>
      <div class="btn-row">
        <a class="btn" href="#/finder">Find my position</a>
        <a class="btn secondary" href="#/pick">I already know my position</a>
        ${resume}
      </div>
    </section>

    ${getProfile().country
      ? todayCardHtml(buildTodayPlan())
      : `<div class="card age-card">
          <h3>👤 Set up your profile</h3>
          <p>Tell us your country, age, position and team schedule, and we'll tell you exactly what to do each day.</p>
          <div class="btn-row"><a class="btn" href="#/profile">Set up my profile</a></div>
        </div>`}
    ${age ? `<p class="muted">🎂 Age ${age}: ${group.stage} (${group.label}). ${group.focus}</p>` : ""}

    <h2>How it works</h2>
    <div class="grid">
      <div class="card"><div class="icon">🧭</div><h3>1. Find your position</h3><p>Take the quiz or pick the position you already play.</p></div>
      <div class="card"><div class="icon">📅</div><h3>2. 4-week program</h3><p>3 field sessions and 1 gym session per week, getting harder each week.</p></div>
      <div class="card"><div class="icon">🏋️</div><h3>3. Gym sessions</h3><p>Strength, power and injury prevention, with exercises matched to your age.</p></div>
      <div class="card"><div class="icon">🚀</div><h3>4. Pro Pathway</h3><p>What to focus on at each age, plus fitness benchmarks to track against.</p></div>
      </div>`;
}

function viewToday() {
  const profile = getProfile();
  const country = COUNTRIES[profile.country];
  const phase = seasonPhase(profile);
  const missing = [
    !country && "country",
    !getAge() && "age",
    !POSITIONS[localStorage.getItem(POS_KEY)] && "position",
    !profile.teamDays.length && !profile.matchDays.length && "team schedule",
  ].filter(Boolean);
  const weather = weatherTip(profile);

  app.innerHTML = `
    <h1>📅 Today</h1>
    <p class="date-line">${fullDate()}</p>
    ${missing.length ? `
      <div class="coach warn">Add your <strong>${missing.join(", ")}</strong> to
        <a href="#/profile">your profile</a> for a more accurate plan.</div>` : ""}
    ${todayCardHtml(buildTodayPlan())}

    <div class="grid" style="margin-top:16px">
      <div class="card">
        <h3>🗓️ ${SEASON_TEXT[phase].label}${profile.season === "auto" ? ` <span class="tag">auto${country ? ` · ${country.name}` : ""}</span>` : ""}</h3>
        <p>${SEASON_TEXT[phase].tip}</p>
      </div>
      ${weather ? `<div class="card"><h3>🌡️ Weather</h3><p>${weather}</p></div>` : ""}
      <div class="card">
        <h3>🚀 Pro tip ${country ? country.flag : ""}</h3>
        <p>${pathwayTipOfDay(profile)}</p>
      </div>
    </div>
    ${loadMeterHtml()}
    <div class="btn-row"><a class="btn secondary small" href="#/profile">✏️ Update my profile</a></div>`;
}

function viewProfile() {
  const profile = getProfile();
  const pos = localStorage.getItem(POS_KEY);
  const detected = SEASON_TEXT[seasonPhase({ ...profile, season: "auto" })].label;
  const countries = Object.entries(COUNTRIES)
    .filter(([id]) => id !== "other")
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .concat([["other", COUNTRIES.other]]);
  const dayBoxes = (name, selected) => WEEK_ORDER.map((d) => `
    <label class="choice day"><input type="checkbox" name="${name}" value="${d}" ${selected.includes(d) ? "checked" : ""}/> ${DAY_NAMES[d].slice(0, 3)}</label>`).join("");

  app.innerHTML = `
    <div class="quiz">
      <h1>👤 My Profile</h1>
      <p>Your daily plan is built from this. Update it anytime, like when your team schedule changes or you have a birthday.</p>
      ${profile.updatedAt ? `<p class="muted">Last updated ${new Date(profile.updatedAt).toLocaleDateString()}</p>` : ""}
      <form id="profileForm" class="profile-form">
        <label>Country
          <select name="country" required>
            <option value="">Choose your country…</option>
            ${countries.map(([id, c]) => `<option value="${id}" ${profile.country === id ? "selected" : ""}>${c.flag} ${c.name}</option>`).join("")}
          </select>
        </label>
        <label>Age
          <input type="number" name="age" min="5" max="60" required value="${getAge() ?? ""}" />
        </label>
        <label>Position
          <select name="position" required>
            <option value="">Choose your position…</option>
            ${Object.entries(POSITIONS).map(([id, p]) => `<option value="${id}" ${pos === id ? "selected" : ""}>${p.icon} ${p.name}</option>`).join("")}
          </select>
          <small><a href="#/finder">Not sure? Take the Position Finder</a>
            ${POSITIONS[pos] ? ` · Style: <a href="#/style/${pos}">${getRole(pos)?.name || "All-round"} (change)</a>` : ""}</small>
        </label>

        <h2>Team practice days</h2>
        <div class="days">${dayBoxes("teamDays", profile.teamDays)}</div>
        <h2>Match days</h2>
        <div class="days">${dayBoxes("matchDays", profile.matchDays)}</div>

        <label>Season
          <select name="season">
            <option value="auto" ${profile.season === "auto" ? "selected" : ""}>Automatic from country (now: ${detected})</option>
            ${Object.entries(SEASON_TEXT).map(([id, s]) => `<option value="${id}" ${profile.season === id ? "selected" : ""}>${s.label}</option>`).join("")}
          </select>
        </label>

        <div class="card">
          <h3>🏋️ Gym setup</h3>
          ${gymSetupSummary()}
        </div>

        <div class="btn-row">
          <button class="btn" type="submit">Save & see today's plan</button>
        </div>
      </form>
    </div>`;

  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const matchDays = form.getAll("matchDays").map(Number);
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      country: form.get("country"),
      teamDays: form.getAll("teamDays").map(Number).filter((d) => !matchDays.includes(d)),
      matchDays,
      season: form.get("season"),
      updatedAt: new Date().toISOString(),
    }));
    localStorage.setItem(AGE_KEY, form.get("age"));
    localStorage.setItem(POS_KEY, form.get("position"));
    location.hash = "#/today";
  });
}

function viewAge() {
  const age = getAge();
  const group = ageGroup();
  app.innerHTML = `
    <h1>🎂 Age Monitor</h1>
    <p>Your age tailors every program. Young players need fun and skill; older players can handle real strength and volume.</p>
    <div class="card">${ageFormHtml()}</div>
    ${age ? `
      <h2>${group.stage} <span class="tag">${group.label}</span></h2>
      <p>${group.focus}</p>
      <div class="grid">
        <div class="card"><h3>📊 Sets per drill</h3><p>Weeks 1–4: ${group.sets.join(" → ")}</p></div>
        <div class="card"><h3>🏋️ Gym level</h3><p><strong>${GYM_MODE_LABEL[gymMode()]}</strong>: ${gymNote(gymMode())}</p><a href="#/gym-setup">Gym setup</a></div>
        <div class="card"><h3>🗣️ Heading</h3><p>${HEADING_TEXT[headingRule()]}</p></div>
        <div class="card"><h3>🛌 Max sessions / week</h3><p>${group.maxPerWeek} total, including team practice and games. Always take at least ${group.maxPerWeek >= 6 ? "1 full rest day" : "2 rest days"}.</p></div>
      </div>
      ${loadMeterHtml()}
      <p class="muted">Growth spurt? If your knees or heels ache (common from ages 10–15), cut back on jumping and sprinting and tell a coach or parent.</p>
    ` : `<p>Enter your age above to see your training guidelines.</p>`}`;
  bindAgeForms(viewAge);
}

function viewFinder() {
  const answers = QUIZ.map(() => new Set());
  let step = 0;

  function renderQuestion() {
    const item = QUIZ[step];
    const picked = answers[step];
    const isLast = step === QUIZ.length - 1;
    app.innerHTML = `
      <div class="quiz">
        <p class="skip">Already know your position? <a href="#/pick">Pick it here →</a></p>
        <p class="stepper">Question ${step + 1} of ${QUIZ.length}</p>
        <div class="progress-bar"><span style="width:${(step / QUIZ.length) * 100}%"></span></div>
        <h2>${item.q}</h2>
        <p class="hint">Pick all that apply.</p>
        <div class="options">
          ${item.a.map((ans, i) => `
            <button class="option ${picked.has(i) ? "selected" : ""}" data-i="${i}" aria-pressed="${picked.has(i)}">
              <span class="box">${picked.has(i) ? "✓" : ""}</span>${ans.t}
            </button>`).join("")}
        </div>
        <div class="btn-row" style="justify-content:space-between">
          <button class="btn secondary small" id="back" ${step === 0 ? "disabled" : ""}>← Back</button>
          <button class="btn small" id="next" ${picked.size ? "" : "disabled"}>${isLast ? "See my results" : "Next →"}</button>
        </div>
      </div>`;

    app.querySelectorAll(".option").forEach((btn) =>
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.i);
        picked.has(i) ? picked.delete(i) : picked.add(i);
        renderQuestion();
      })
    );
    document.getElementById("back").addEventListener("click", () => {
      step--;
      renderQuestion();
    });
    document.getElementById("next").addEventListener("click", () => {
      step++;
      step < QUIZ.length ? renderQuestion() : renderResults();
    });
  }

  // Points are split across picks so every question carries the same weight.
  function computeScores() {
    const scores = {};
    QUIZ.forEach((item, q) => {
      const picks = [...answers[q]];
      picks.forEach((i) => {
        for (const [pos, pts] of Object.entries(item.a[i].p)) {
          scores[pos] = (scores[pos] || 0) + pts / picks.length;
        }
      });
    });
    return scores;
  }

  function renderResults() {
    const scores = computeScores();
    const ranked = Object.keys(POSITIONS)
      .map((id) => ({ id, score: scores[id] || 0 }))
      .sort((a, b) => b.score - a.score);
    const max = ranked[0].score || 1;
    const best = POSITIONS[ranked[0].id];
    localStorage.setItem(POS_KEY, ranked[0].id);

    app.innerHTML = `
      <div class="quiz">
        <section class="hero">
          <p>Your best fit is</p>
          <h1>${best.icon} ${best.name}</h1>
          <p>${best.summary}</p>
          <div class="btn-row">
            <a class="btn" href="#/style/${ranked[0].id}">Choose my ${best.name} style →</a>
            <a class="btn secondary" href="#/finder" onclick="location.reload()">Retake quiz</a>
          </div>
        </section>
        <h2>All positions</h2>
        ${ranked.map(({ id, score }) => `
          <div class="result-row">
            <a class="label" href="#/position/${id}">${POSITIONS[id].icon} ${POSITIONS[id].name}</a>
            <div class="progress-bar"><span style="width:${(score / max) * 100}%"></span></div>
          </div>`).join("")}
      </div>`;
  }

  renderQuestion();
}

function viewPick() {
  const current = localStorage.getItem(POS_KEY);
  app.innerHTML = `
    <h1>Choose your position</h1>
    <p>Pick the position you play and we'll take you straight to its training program.
      Not sure? <a href="#/finder">Take the Position Finder</a>.</p>
    <div class="grid">
      ${Object.entries(POSITIONS).map(([id, p]) => `
        <button class="card pick ${id === current ? "current" : ""}" data-id="${id}">
          <div class="icon">${p.icon}</div>
          <h3>${p.name}</h3>
          <p>${p.traits.join(" · ")}</p>
          ${id === current ? `<span class="tag">Current position</span>` : ""}
        </button>`).join("")}
    </div>`;
  app.querySelectorAll(".pick").forEach((btn) =>
    btn.addEventListener("click", () => {
      localStorage.setItem(POS_KEY, btn.dataset.id);
      location.hash = `#/style/${btn.dataset.id}`;
    })
  );
}

function viewStyle(pos) {
  const p = POSITIONS[pos];
  if (!p) return viewNotFound();
  localStorage.setItem(POS_KEY, pos);
  const current = getRole(pos)?.id;

  app.innerHTML = `
    <a href="#/pick">← Change position</a>
    <h1>${p.icon} What kind of ${p.name} are you?</h1>
    <p>Pick your playing style. Every field session will include a ⭐ drill for it. You can change it anytime.</p>
    <div class="grid">
      ${Object.entries(ROLES[pos]).map(([id, r]) => `
        <button class="card pick ${id === current ? "current" : ""}" data-role="${id}">
          <h3>${r.name}</h3>
          <p>${r.summary}</p>
          <p><small><strong>Style drills:</strong> ${r.drills.map((d) => DRILLS[d].name).join(" · ")}</small></p>
          ${id === current ? `<span class="tag">Current style</span>` : ""}
        </button>`).join("")}
      <button class="card pick ${current ? "" : "current"}" data-role="">
        <h3>All-round</h3>
        <p>No specific style yet. Stick with the standard ${p.name} program.</p>
      </button>
    </div>`;

  app.querySelectorAll("[data-role]").forEach((btn) =>
    btn.addEventListener("click", () => {
      setRole(pos, btn.dataset.role);
      location.hash = `#/position/${pos}`;
    })
  );
}

function viewPositions() {
  app.innerHTML = `
    <h1>Position Programs</h1>
    <p>Each program is 4 weeks: 3 field sessions plus 1 gym session per week.</p>
    <div class="grid">
      ${Object.entries(POSITIONS).map(([id, p]) => {
        const pct = Math.round((completedFor(id) / totalSessions(id)) * 100);
        return `
          <a class="card" href="#/position/${id}">
            <div class="icon">${p.icon}</div>
            <h3>${p.name}</h3>
            <p>${p.summary}</p>
            <div class="progress-bar"><span style="width:${pct}%"></span></div>
            <small>${pct}% complete</small>
          </a>`;
      }).join("")}
    </div>`;
}

function viewPosition(id) {
  const p = POSITIONS[id];
  if (!p) return viewNotFound();
  localStorage.setItem(POS_KEY, id);
  const done = store.get();
  const age = getAge();
  const group = ageGroup();
  const pct = Math.round((completedFor(id) / totalSessions(id)) * 100);
  const slots = [...p.sessions.map((_, s) => s), "gym"];

  app.innerHTML = `
    <a href="#/positions">← All programs</a>
    <h1>${p.icon} ${p.name} Program</h1>
    <p>${p.summary}</p>
    <div>${p.traits.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    ${(() => {
      const role = getRole(id);
      return role
        ? `<div class="card style-card"><strong>⭐ Your style: ${role.name}</strong> <a href="#/style/${id}">change</a>
            <p>${role.summary} Each field session includes a ⭐ ${role.name} drill.</p></div>`
        : `<div class="card style-card"><strong>⭐ Pick your playing style</strong>
            <p>Add drills for how you play. <a href="#/style/${id}">Choose a style →</a></p></div>`;
    })()}

    ${age
      ? `<p><span class="tag cone">🎂 Tailored for age ${age} · ${group.stage}</span> <a href="#/age">change</a></p>`
      : `<div class="card age-card"><h3>🎂 Set your age to tailor this program</h3><p>Until then, it uses the 13–15 settings.</p>${ageFormHtml()}</div>`}
    ${loadMeterHtml()}

    <strong>Program progress</strong>
    <div class="progress-bar"><span style="width:${pct}%"></span></div>
    <small>${completedFor(id)} of ${totalSessions(id)} sessions complete</small>

    ${WEEK_INTENSITY.map((label, w) => `
      <div class="week">
        <h3>Week ${w + 1}: ${label} <span class="tag">${group.sets[w]} sets</span></h3>
        ${slots.map((s) => {
          const isGym = s === "gym";
          const isDone = Boolean(done[sessionKey(id, w, s)]);
          const names = isGym
            ? POSITION_GYM[id].map((g) => pickVariant(g).name)
            : fieldDrills(id, s).map((d) => (d === styleDrill(id, s) ? `⭐ ${DRILLS[d].name}` : DRILLS[d].name));
          return `
            <div class="session ${isDone ? "done" : ""} ${isGym ? "gym" : ""}">
              <div>
                <strong>${isGym ? "🏋️ Gym Session" : `⚽ Field Session ${s + 1}`}</strong>
                <div class="meta">${names.join(" · ")}</div>
                <div class="meta">~${sessionMinutes(id, w, s)} min${isGym ? ` · ${GYM_MODE_LABEL[gymMode()]} · <a href="#/gym-setup">gym setup</a>` : ""}</div>
              </div>
              ${isDone
                ? `<span class="check" title="Completed">✅</span>`
                : `<a class="btn small" href="#/session/${id}/${w}/${s}">Start</a>`}
            </div>`;
        }).join("")}
      </div>`).join("")}`;
  bindAgeForms(() => viewPosition(id));
}

function viewSession(pos, week, idx) {
  const p = POSITIONS[pos];
  week = Number(week);
  const validIdx = idx === "gym" || (p && p.sessions[Number(idx)]);
  if (!p || !validIdx || !WEEK_INTENSITY[week]) return viewNotFound();
  if (idx !== "gym") idx = Number(idx);
  if (idx === "gym" && !getGymSetup()) {
    location.hash = `#/gym-setup/${pos}/${week}/gym`;
    return;
  }

  const items = buildItems(pos, week, idx);
  const sessionName = idx === "gym" ? "Gym Session" : `Field Session ${idx + 1}`;
  let current = 0;

  function render() {
    clearInterval(timerHandle);
    timerHandle = null;
    const item = items[current];
    const isLast = current === items.length - 1;
    let remaining = item.timerSec;

    app.innerHTML = `
      <a href="#/position/${pos}">← ${p.name} program</a>
      <p class="stepper">Week ${week + 1} · ${sessionName} · ${current + 1} of ${items.length}</p>
      <div class="progress-bar"><span style="width:${(current / items.length) * 100}%"></span></div>
      <h1>${item.title}</h1>
      <span class="tag ${item.category === "Cone Drill" ? "cone" : ""}">${item.category}</span>
      ${item.tags.map((t) => `<span class="tag">${t}</span>`).join("")}

      <div class="runner">
        <div>${item.visual}</div>
        <div class="card">
          <p><strong>Setup:</strong> ${item.setup}</p>
          <ol class="steps">${item.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
          <div class="coach">💡 <strong>Coaching point:</strong> ${item.coaching}</div>
          ${item.warning ? `<div class="coach warn">⚠️ ${item.warning}</div>` : ""}
          <div class="timer" id="timer">${fmt(remaining)}</div>
          <div class="btn-row" style="justify-content:center">
            <button class="btn secondary small" id="startTimer">Start ${item.timerLabel}</button>
            <button class="btn small" id="next">${isLast ? "Finish session ✅" : "Next →"}</button>
          </div>
        </div>
      </div>`;

    const timerEl = document.getElementById("timer");
    const startBtn = document.getElementById("startTimer");
    startBtn.addEventListener("click", () => {
      if (timerHandle) {
        clearInterval(timerHandle);
        timerHandle = null;
        startBtn.textContent = `Resume ${item.timerLabel}`;
        return;
      }
      if (remaining === 0) remaining = item.timerSec;
      startBtn.textContent = `Pause ${item.timerLabel}`;
      timerHandle = setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        timerEl.textContent = fmt(remaining);
        if (remaining === 0) {
          clearInterval(timerHandle);
          timerHandle = null;
          timerEl.textContent = "Time! ⏱️";
          startBtn.textContent = `Restart ${item.timerLabel}`;
        }
      }, 1000);
    });

    document.getElementById("next").addEventListener("click", () => {
      clearInterval(timerHandle);
      timerHandle = null;
      if (isLast) {
        store.markDone(sessionKey(pos, week, idx));
        viewSessionComplete(pos, week, sessionName);
      } else {
        current++;
        render();
        window.scrollTo(0, 0);
      }
    });
  }

  render();
}

function viewSessionComplete(pos, week, sessionName) {
  const p = POSITIONS[pos];
  const over = sessionsThisWeek() >= ageGroup().maxPerWeek;
  app.innerHTML = `
    <section class="hero">
      <h1>Session complete! 🎉</h1>
      <p>Week ${week + 1} ${sessionName} of the ${p.name} program is done. Cool down with 5 minutes of light jogging and stretching.</p>
      <div class="btn-row">
        <a class="btn" href="#/position/${pos}">Back to program</a>
        <a class="btn secondary" href="#/progress">View progress</a>
      </div>
    </section>
    ${over ? loadMeterHtml() : ""}`;
}

function viewDrills(filter = "All") {
  const categories = ["All", ...new Set(Object.values(DRILLS).map((d) => d.category))];
  const list = Object.entries(DRILLS).filter(([, d]) => filter === "All" || d.category === filter);
  app.innerHTML = `
    <h1>Drill Library</h1>
    <div class="filters">
      ${categories.map((c) => `<button class="${c === filter ? "active" : ""}" data-c="${c}">${c}</button>`).join("")}
    </div>
    <div class="grid">
      ${list.map(([id, d]) => `
        <a class="card" href="#/drill/${id}">
          ${drillDiagram(d)}
          <h3>${d.name}</h3>
          <span class="tag ${d.category === "Cone Drill" ? "cone" : ""}">${d.category}</span>
          <span class="tag">${d.minutes} min</span>
        </a>`).join("")}
    </div>`;
  app.querySelectorAll(".filters button").forEach((b) =>
    b.addEventListener("click", () => viewDrills(b.dataset.c))
  );
}

function viewDrill(id) {
  const d = DRILLS[id];
  if (!d) return viewNotFound();
  const usedBy = Object.entries(POSITIONS)
    .filter(([, p]) => p.sessions.some((s) => s.includes(id)))
    .map(([pid, p]) => `<a class="tag" href="#/position/${pid}">${p.icon} ${p.name}</a>`)
    .join("");
  app.innerHTML = `
    <a href="#/drills">← Drill library</a>
    <h1>${d.name}</h1>
    <span class="tag">${d.category}</span><span class="tag">${d.minutes} min</span>
    <span class="tag">Equipment: ${d.equipment}</span>
    <div class="runner" style="margin-top:16px">
      ${drillDiagram(d)}
      <div class="card">
        <p><strong>Setup:</strong> ${d.setup}</p>
        <ol class="steps">${d.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
        <div class="coach">💡 <strong>Coaching point:</strong> ${d.coaching}</div>
        ${id === "heading" && headingRule() !== "full" ? `<div class="coach warn">⚠️ ${HEADING_TEXT[headingRule()]}</div>` : ""}
        ${usedBy ? `<p><strong>Used in:</strong><br>${usedBy}</p>` : ""}
      </div>
    </div>`;
}

function viewGym() {
  const age = getAge();
  const mode = gymMode();
  const pos = localStorage.getItem(POS_KEY);
  const plan = pos && POSITION_GYM[pos]
    ? `<p>Your <strong>${POSITIONS[pos].name}</strong> gym plan: ${POSITION_GYM[pos].map((g) => pickVariant(g).name).join(" · ")}.
        <a href="#/position/${pos}">Go to program →</a></p>`
    : `<p><a href="#/pick">Pick your position</a> to get a position-specific gym plan.</p>`;

  app.innerHTML = `
    <h1>🏋️ Gym Library</h1>
    <p>Strength, power and injury-prevention work. Exercises adjust to your age, supervision and equipment:
      ${age ? `you're on <strong>${GYM_MODE_LABEL[mode]}</strong>.` : `<a href="#/age">set your age</a> to tailor them.`}</p>
    <div class="card">${gymSetupSummary()}</div>
    <div class="coach warn">⚠️ ${gymNote(mode)}</div>
    ${plan}
    <div class="grid">
      ${Object.entries(GYM).map(([id, g]) => {
        const v = pickVariant(id);
        return `
        <div class="card">
          <div class="icon">${g.icon}</div>
          <h3>${v.name}</h3>
          <span class="tag">${g.category}</span><span class="tag">${v.reps} reps</span>
          <p>${g.muscles}</p>
          <details>
            <summary>How to do it</summary>
            <ol class="steps">${g.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
            <p><em>${g.coaching}</em></p>
          </details>
        </div>`;
      }).join("")}
    </div>`;
}

function viewGymSetup(pos, week, idx) {
  const setup = getGymSetup() || { supervised: null, equipment: [] };
  const returnTo = pos ? `#/session/${pos}/${week}/${idx}` : "#/gym";

  app.innerHTML = `
    <div class="quiz">
      <h1>🏋️ Gym Setup</h1>
      <p>Before you lift, tell us who's supervising you and what equipment you have. We'll pick safe exercises that fit.</p>
      <form id="gymSetup">
        <h2>Do you have a qualified strength coach or trainer supervising your weight sessions?</h2>
        <div class="options">
          <label class="choice"><input type="radio" name="supervised" value="yes" required ${setup.supervised === true ? "checked" : ""}/> Yes, a qualified coach or trainer watches my lifts</label>
          <label class="choice"><input type="radio" name="supervised" value="no" ${setup.supervised === false ? "checked" : ""}/> No, I train on my own or with friends</label>
        </div>
        <p class="hint">Under 18 without a coach? You'll get bodyweight or light versions until a coach is there to supervise. Ages 10–12 use 5 lb weights only, and only with a coach.</p>

        <h2>What equipment do you have?</h2>
        <div class="options">
          ${Object.entries(EQUIPMENT).map(([id, label]) => `
            <label class="choice"><input type="checkbox" name="equipment" value="${id}" ${setup.equipment.includes(id) ? "checked" : ""}/> ${label}</label>`).join("")}
        </div>
        <p class="hint">Nothing at all? Leave these unchecked. Bodyweight training works great.</p>

        <div class="btn-row">
          <button class="btn" type="submit">${pos ? "Save & start gym session" : "Save gym setup"}</button>
        </div>
      </form>
    </div>`;

  document.getElementById("gymSetup").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    localStorage.setItem(GYM_KEY, JSON.stringify({
      supervised: form.get("supervised") === "yes",
      equipment: form.getAll("equipment"),
    }));
    location.hash = returnTo;
  });
}

function viewPathway() {
  const age = getAge();
  const group = ageGroup();
  const saved = JSON.parse(localStorage.getItem(BENCH_KEY) || "{}");
  const benchmarks = BENCHMARKS.filter((b) => b.targets[group.id] !== undefined);

  app.innerHTML = `
    <h1>🚀 Pro Pathway</h1>
    <p>Going pro takes years of consistent, smart training. Here's what to focus on at each stage.
      ${age ? "" : `<a href="#/age">Set your age</a> to highlight your stage.`}</p>

    <div class="pathway">
      ${PATHWAY.map((s) => {
        const isCurrent = age && s.stage === group.stage;
        return `
          <div class="card stage ${isCurrent ? "current" : ""}">
            <span class="tag">Ages ${s.ages}</span>${isCurrent ? `<span class="tag cone">You are here</span>` : ""}
            <h3>${s.stage}</h3>
            <p><strong>${s.hours}</strong></p>
            <ul>${s.goals.map((g) => `<li>${g}</li>`).join("")}</ul>
          </div>`;
      }).join("")}
    </div>

    ${(() => {
      const c = COUNTRIES[getProfile().country];
      return c ? `
        <h2>${c.flag} Getting scouted in ${c.name}</h2>
        <div class="card"><ul>${[...c.pathway, ...UNIVERSAL_PATHWAY_TIPS].map((t) => `<li>${t}</li>`).join("")}</ul></div>`
        : `<p><a href="#/profile">Add your country</a> to see how players get scouted where you live.</p>`;
    })()}

    <h2>📏 Fitness Benchmarks <span class="tag">${group.label}</span></h2>
    <p>Rough targets for players on a pro track at your age. Test every 4–6 weeks and compare against your own past results most of all.</p>
    ${["u10", "u13"].includes(group.id) ? `<p class="muted">At your age, skill beats fitness. Juggling is the only benchmark for now.</p>` : ""}
    <div class="card">
      ${benchmarks.map((b) => {
        const target = b.targets[group.id];
        const value = saved[b.id];
        const hasValue = value !== undefined && value !== "";
        const onTrack = hasValue && (b.lower ? Number(value) <= target : Number(value) >= target);
        return `
          <div class="bench">
            <div class="bench-name"><strong>${b.name}</strong><br><small>Target: ${b.lower ? "≤" : "≥"} ${target} ${b.unit}</small></div>
            <input type="number" step="any" data-id="${b.id}" value="${hasValue ? value : ""}" placeholder="Your ${b.unit}" />
            <span class="bench-status">${hasValue ? (onTrack ? "✅ On track" : "🔼 Keep working") : ""}</span>
          </div>`;
      }).join("")}
    </div>`;

  app.querySelectorAll(".bench input").forEach((input) =>
    input.addEventListener("change", () => {
      const data = JSON.parse(localStorage.getItem(BENCH_KEY) || "{}");
      data[input.dataset.id] = input.value;
      localStorage.setItem(BENCH_KEY, JSON.stringify(data));
      viewPathway();
    })
  );
}

function viewProgress() {
  const data = store.get();
  const total = Object.keys(data).length;
  const rows = Object.entries(POSITIONS)
    .filter(([id]) => completedFor(id) > 0)
    .map(([id, p]) => {
      const pct = Math.round((completedFor(id) / totalSessions(id)) * 100);
      return `
        <div class="result-row">
          <a class="label" href="#/position/${id}">${p.icon} ${p.name}</a>
          <div class="progress-bar"><span style="width:${pct}%"></span></div>
          <span>${completedFor(id)}/${totalSessions(id)}</span>
        </div>`;
    }).join("");

  app.innerHTML = `
    <h1>My Progress</h1>
    <p>You've completed <strong>${total}</strong> training session${total === 1 ? "" : "s"}.</p>
    ${loadMeterHtml()}
    ${rows || `<p>No sessions yet. <a href="#/finder">Find your position</a> to get started!</p>`}
    ${total ? `<div class="btn-row"><button class="btn secondary small" id="reset">Reset all progress</button></div>` : ""}`;

  const reset = document.getElementById("reset");
  if (reset) reset.addEventListener("click", () => {
    if (confirm("Clear all completed sessions?")) { store.reset(); viewProgress(); }
  });
}

function viewNotFound() {
  app.innerHTML = `<h1>Page not found</h1><a href="#/">Go home</a>`;
}

function fullDate(date = new Date()) {
  return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ---------- Router ----------

function router() {
  clearInterval(timerHandle);
  timerHandle = null;
  const [route, ...params] = (location.hash.replace(/^#\/?/, "") || "").split("/");
  const routes = {
    "": viewHome,
    finder: viewFinder,
    pick: viewPick,
    positions: viewPositions,
    position: viewPosition,
    session: viewSession,
    drills: () => viewDrills(),
    drill: viewDrill,
    gym: viewGym,
    "gym-setup": viewGymSetup,
    pathway: viewPathway,
    age: viewAge,
    today: viewToday,
    style: viewStyle,
    profile: viewProfile,
    progress: viewProgress,
  };
  (routes[route] || viewNotFound)(...params);
  setActiveNav();
  updateAgeBadge();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
router();

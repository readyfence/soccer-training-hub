const app = document.getElementById("app");
const STORE_KEY = "sth-progress";
const POS_KEY = "sth-position";
const AGE_KEY = "sth-age";
const BENCH_KEY = "sth-benchmarks";
const GYM_KEY = "sth-gym-setup";
const GYM_MODES = ["bw", "light", "loaded"];
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
  document.getElementById("ageBadge").textContent = age ? `🎂 Age ${age}` : "🎂 Set age";
}

function loadMeterHtml() {
  const group = ageGroup();
  const count = sessionsThisWeek();
  const pct = Math.min(100, (count / group.maxPerWeek) * 100);
  const level = count > group.maxPerWeek ? "over" : count === group.maxPerWeek ? "full" : "ok";
  const msg = {
    ok: "You're within a safe training load.",
    full: "You've hit your recommended limit. Take a rest day next.",
    over: "You're over the recommended load for your age. Rest is needed to avoid injury and burnout.",
  }[level];
  return `
    <div class="load ${level}">
      <strong>Weekly load monitor:</strong> ${count} of ${group.maxPerWeek} sessions in the last 7 days
      <div class="progress-bar"><span style="width:${pct}%"></span></div>
      <small>${msg} Count team practices and matches toward this too.</small>
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
  let note = GYM_LOAD_NOTE[mode];
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

function fieldDrills(ids) {
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

  return fieldDrills(POSITIONS[pos].sessions[idx]).map((id) => {
    const d = DRILLS[id];
    return {
      title: d.name,
      category: d.category,
      tags: [`${sets} sets`, `Equipment: ${d.equipment}`],
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
  return fieldDrills(POSITIONS[pos].sessions[idx])
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

    <div class="card age-card">
      ${age
        ? `<h3>🎂 Age ${age}: ${group.stage} (${group.label})</h3><p>${group.focus}</p>`
        : `<h3>🎂 Set your age</h3><p>Your age adjusts training volume, gym loading, heading safety and weekly limits.</p>`}
      ${ageFormHtml()}
      ${age ? loadMeterHtml() : ""}
    </div>

    <h2>How it works</h2>
    <div class="grid">
      <div class="card"><div class="icon">🧭</div><h3>1. Find your position</h3><p>Take the quiz or pick the position you already play.</p></div>
      <div class="card"><div class="icon">📅</div><h3>2. 4-week program</h3><p>3 field sessions and 1 gym session per week, getting harder each week.</p></div>
      <div class="card"><div class="icon">🏋️</div><h3>3. Gym sessions</h3><p>Strength, power and injury prevention, with exercises matched to your age.</p></div>
      <div class="card"><div class="icon">🚀</div><h3>4. Pro Pathway</h3><p>What to focus on at each age, plus fitness benchmarks to track against.</p></div>
    </div>`;
  bindAgeForms(viewHome);
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
            <a class="btn" href="#/position/${ranked[0].id}">Start the ${best.name} program</a>
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
      location.hash = `#/position/${btn.dataset.id}`;
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
            : fieldDrills(p.sessions[s]).map((d) => DRILLS[d].name);
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
        <p class="hint">Under 18 without a coach? You'll get bodyweight or light versions until a coach is there to supervise.</p>

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
    progress: viewProgress,
  };
  (routes[route] || viewNotFound)(...params);
  setActiveNav();
  updateAgeBadge();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
router();

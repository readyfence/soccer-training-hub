const app = document.getElementById("app");
const STORE_KEY = "sth-progress";
const POS_KEY = "sth-position";
const SETS_BY_WEEK = [2, 3, 3, 4];

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

const sessionKey = (pos, week, idx) => `${pos}-${week}-${idx}`;
const totalSessions = (pos) => POSITIONS[pos].sessions.length * WEEK_INTENSITY.length;
const completedFor = (pos) => {
  const data = store.get();
  return Object.keys(data).filter((k) => k.startsWith(pos + "-")).length;
};
const sessionMinutes = (drills, week) =>
  drills.reduce((sum, id) => sum + DRILLS[id].minutes, 0) + week * 5;

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
    a.classList.toggle("active", hash.startsWith(a.getAttribute("href")));
  });
}

// ---------- Views ----------

function viewHome() {
  const saved = localStorage.getItem(POS_KEY);
  const resume = saved && POSITIONS[saved]
    ? `<a class="btn secondary" href="#/position/${saved}">Continue ${POSITIONS[saved].name} program</a>`
    : "";
  app.innerHTML = `
    <section class="hero">
      <h1>Train like your position demands.</h1>
      <p>Find your best position, then follow a 4-week program of cone drills, technique work, and fitness built for that role.</p>
      <div class="btn-row">
        <a class="btn" href="#/finder">Find my position</a>
        ${resume || `<a class="btn secondary" href="#/positions">Browse programs</a>`}
      </div>
    </section>

    <h2>How it works</h2>
    <div class="grid">
      <div class="card"><div class="icon">🧭</div><h3>1. Position Finder</h3><p>Answer 8 quick questions to see which positions suit your style.</p></div>
      <div class="card"><div class="icon">📅</div><h3>2. 4-Week Program</h3><p>3 sessions per week that get harder each week: Foundation, Build, Intensity, Game Ready.</p></div>
      <div class="card"><div class="icon">🔶</div><h3>3. Guided Drills</h3><p>Step-by-step cone drills with diagrams and a built-in timer.</p></div>
      <div class="card"><div class="icon">📈</div><h3>4. Track Progress</h3><p>Check off sessions and watch your progress fill up.</p></div>
    </div>`;
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

function viewPositions() {
  app.innerHTML = `
    <h1>Position Programs</h1>
    <p>Each program is 4 weeks with 3 sessions per week.</p>
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
  const pct = Math.round((completedFor(id) / totalSessions(id)) * 100);

  app.innerHTML = `
    <a href="#/positions">← All programs</a>
    <h1>${p.icon} ${p.name} Program</h1>
    <p>${p.summary}</p>
    <div>${p.traits.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    <div class="progress-bar"><span style="width:${pct}%"></span></div>
    <small>${completedFor(id)} of ${totalSessions(id)} sessions complete</small>

    ${WEEK_INTENSITY.map((label, w) => `
      <div class="week">
        <h3>Week ${w + 1}: ${label} <span class="tag">${SETS_BY_WEEK[w]} sets per drill</span></h3>
        ${p.sessions.map((drills, s) => {
          const key = sessionKey(id, w, s);
          const isDone = Boolean(done[key]);
          return `
            <div class="session ${isDone ? "done" : ""}">
              <div>
                <strong>Session ${s + 1}</strong>
                <div class="meta">${drills.map((d) => DRILLS[d].name).join(" · ")}</div>
                <div class="meta">~${sessionMinutes(drills, w)} min</div>
              </div>
              ${isDone
                ? `<span class="check" title="Completed">✅</span>`
                : `<a class="btn small" href="#/session/${id}/${w}/${s}">Start</a>`}
            </div>`;
        }).join("")}
      </div>`).join("")}`;
}

function viewSession(pos, week, idx) {
  const p = POSITIONS[pos];
  week = Number(week);
  idx = Number(idx);
  const drills = p && p.sessions[idx];
  if (!drills || !WEEK_INTENSITY[week]) return viewNotFound();
  let current = 0;

  function render() {
    clearInterval(timerHandle);
    const drill = DRILLS[drills[current]];
    const isLast = current === drills.length - 1;
    let remaining = drill.minutes * 60;

    app.innerHTML = `
      <a href="#/position/${pos}">← ${p.name} program</a>
      <p class="stepper">Week ${week + 1} · Session ${idx + 1} · Drill ${current + 1} of ${drills.length}</p>
      <div class="progress-bar"><span style="width:${(current / drills.length) * 100}%"></span></div>
      <h1>${drill.name}</h1>
      <span class="tag ${drill.category === "Cone Drill" ? "cone" : ""}">${drill.category}</span>
      <span class="tag">${SETS_BY_WEEK[week]} sets</span>
      <span class="tag">Equipment: ${drill.equipment}</span>

      <div class="runner">
        <div>
          ${drillDiagram(drill)}
          <p><small>🔵 = you &nbsp; 🔶 = cones &nbsp; dashed line = your path</small></p>
        </div>
        <div class="card">
          <p><strong>Setup:</strong> ${drill.setup}</p>
          <ol class="steps">${drill.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
          <div class="coach">💡 <strong>Coaching point:</strong> ${drill.coaching}</div>
          <div class="timer" id="timer">${fmt(remaining)}</div>
          <div class="btn-row" style="justify-content:center">
            <button class="btn secondary small" id="startTimer">Start timer</button>
            <button class="btn small" id="next">${isLast ? "Finish session ✅" : "Next drill →"}</button>
          </div>
        </div>
      </div>`;

    const timerEl = document.getElementById("timer");
    const startBtn = document.getElementById("startTimer");
    startBtn.addEventListener("click", () => {
      if (timerHandle) {
        clearInterval(timerHandle);
        timerHandle = null;
        startBtn.textContent = "Resume timer";
        return;
      }
      startBtn.textContent = "Pause timer";
      timerHandle = setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        timerEl.textContent = fmt(remaining);
        if (remaining === 0) {
          clearInterval(timerHandle);
          timerHandle = null;
          timerEl.textContent = "Time! ⏱️";
        }
      }, 1000);
    });

    document.getElementById("next").addEventListener("click", () => {
      clearInterval(timerHandle);
      timerHandle = null;
      if (isLast) {
        store.markDone(sessionKey(pos, week, idx));
        viewSessionComplete(pos, week, idx);
      } else {
        current++;
        render();
        window.scrollTo(0, 0);
      }
    });
  }

  render();
}

function viewSessionComplete(pos, week, idx) {
  const p = POSITIONS[pos];
  app.innerHTML = `
    <section class="hero">
      <h1>Session complete! 🎉</h1>
      <p>Week ${week + 1}, Session ${idx + 1} of the ${p.name} program is done. Cool down with 5 minutes of light jogging and stretching.</p>
      <div class="btn-row">
        <a class="btn" href="#/position/${pos}">Back to program</a>
        <a class="btn secondary" href="#/progress">View progress</a>
      </div>
    </section>`;
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
        ${usedBy ? `<p><strong>Used in:</strong><br>${usedBy}</p>` : ""}
      </div>
    </div>`;
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
    positions: viewPositions,
    position: viewPosition,
    session: viewSession,
    drills: () => viewDrills(),
    drill: viewDrill,
    progress: viewProgress,
  };
  (routes[route] || viewNotFound)(...params);
  setActiveNav();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
router();

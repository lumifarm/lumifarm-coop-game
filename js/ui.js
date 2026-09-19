// 畫面渲染：把 state / content 轉成 HTML 字串
(function () {
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);
  }

  function metricsBarHTML(state) {
    const keys = window.GameEngine.METRIC_KEYS;
    const labels = window.GameEngine.METRIC_LABELS;
    return keys
      .map((key) => {
        const value = state.metrics[key];
        const level = value <= 20 ? "danger" : value <= 40 ? "warn" : "ok";
        return `
          <div class="metric metric--${level}">
            <div class="metric-label">${labels[key]}</div>
            <div class="metric-track"><div class="metric-fill" style="width:${value}%"></div></div>
            <div class="metric-value">${value}</div>
          </div>`;
      })
      .join("");
  }

  function progressHTML(state) {
    const acts = window.GAME_CONTENT.acts;
    return `<div class="progress">${acts
      .map((act, i) => {
        const cls = i < state.actIndex ? "done" : i === state.actIndex ? "current" : "";
        return `<span class="progress-step ${cls}">${escapeHtml(act.title)}</span>`;
      })
      .join('<span class="progress-sep">→</span>')}</div>`;
  }

  function introHTML(act) {
    return `
      <section class="card card--intro">
        <h2>${escapeHtml(act.title)}</h2>
        <p>${escapeHtml(act.intro)}</p>
        <button class="btn btn--primary" data-action="continue">開始這個階段</button>
      </section>`;
  }

  function outroHTML(act) {
    return `
      <section class="card card--outro">
        <h2>${escapeHtml(act.title)}・階段小結</h2>
        <p>${escapeHtml(act.outro)}</p>
        <button class="btn btn--primary" data-action="continue">繼續</button>
      </section>`;
  }

  function optionsHTML(options) {
    return options
      .map(
        (opt, i) =>
          `<button class="btn btn--option" data-action="choose" data-index="${i}">${escapeHtml(opt.label)}</button>`
      )
      .join("");
  }

  function eventHTML(event) {
    return `
      <section class="card card--event">
        <h3>${escapeHtml(event.title)}</h3>
        <p class="situation">${escapeHtml(event.situation)}</p>
        <div class="options">${optionsHTML(event.options)}</div>
      </section>`;
  }

  function quizHTML(quiz) {
    return `
      <section class="card card--quiz">
        <div class="quiz-tag">民主健檢</div>
        <h3>${escapeHtml(quiz.title)}</h3>
        <p class="situation">${escapeHtml(quiz.situation)}</p>
        <div class="options">${optionsHTML(quiz.options)}</div>
      </section>`;
  }

  function feedbackHTML(feedback, unlockedTitles) {
    const unlockHTML = unlockedTitles.length
      ? `<div class="unlock-note">📖 解鎖百科：${unlockedTitles.map(escapeHtml).join("、")}</div>`
      : "";
    return `
      <section class="card card--feedback">
        <p class="feedback-text">${escapeHtml(feedback)}</p>
        ${unlockHTML}
        <button class="btn btn--primary" data-action="continue">繼續</button>
      </section>`;
  }

  function endingHTML(ending, state, unlockedCount) {
    return `
      <section class="card card--ending card--ending-${ending.type}">
        <h2>${escapeHtml(ending.title)}</h2>
        <p>${escapeHtml(ending.text)}</p>
        <div class="ending-metrics">${metricsBarHTML(state)}</div>
        <p class="ending-note">本局共解鎖 ${unlockedCount} 則合作社小百科條目。</p>
        <button class="btn btn--primary" data-action="restart">重新開始</button>
      </section>`;
  }

  function glossaryHTML(unlockedSet) {
    const entries = window.GLOSSARY;
    const ids = Object.keys(entries);
    if (unlockedSet.size === 0) {
      return `<p class="glossary-empty">還沒有解鎖任何條目，繼續遊玩來解鎖吧！</p>`;
    }
    return ids
      .filter((id) => unlockedSet.has(id))
      .map((id) => {
        const e = entries[id];
        return `<div class="glossary-entry"><h4>${escapeHtml(e.title)}</h4><p>${escapeHtml(e.text)}</p></div>`;
      })
      .join("");
  }

  window.UI = {
    metricsBarHTML,
    progressHTML,
    introHTML,
    outroHTML,
    eventHTML,
    quizHTML,
    feedbackHTML,
    endingHTML,
    glossaryHTML,
  };
})();

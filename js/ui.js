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

  function metricsBarHTML(state, deltas) {
    const keys = window.GameEngine.METRIC_KEYS;
    const labels = window.GameEngine.METRIC_LABELS;
    return keys
      .map((key) => {
        const value = state.metrics[key];
        const level = value <= 20 ? "danger" : value <= 40 ? "warn" : "ok";
        const delta = deltas ? deltas[key] : null;
        const deltaHTML =
          delta
            ? `<span class="delta-badge ${delta > 0 ? "delta-badge--up" : "delta-badge--down"}">${
                delta > 0 ? "+" : ""
              }${delta}</span>`
            : "";
        const pulseClass = delta ? (delta > 0 ? " metric--pulse-up" : " metric--pulse-down") : "";
        const evalText = window.GameEngine.evaluateMetric(key, value);
        return `
          <div class="metric metric--${level}${pulseClass}">
            <div class="metric-label"><span>${labels[key]}</span>${deltaHTML}</div>
            <div class="metric-track"><div class="metric-fill" style="width:${value}%"></div></div>
            <div class="metric-value">${value}</div>
            <div class="metric-eval">${escapeHtml(evalText)}</div>
          </div>`;
      })
      .join("");
  }

  function progressHTML(state) {
    const acts = window.GAME_CONTENT.acts;
    return `<div class="progress">${acts
      .map((act, i) => {
        const cls = i < state.actIndex ? "done" : i === state.actIndex ? "current" : "";
        const icon = act.icon ? `${act.icon} ` : "";
        return `<span class="progress-step ${cls}">${icon}${escapeHtml(act.title)}</span>`;
      })
      .join('<span class="progress-sep">→</span>')}</div>`;
  }

  function introHTML(act) {
    return `
      <section class="card card--intro">
        <div class="card-icon">${act.icon || ""}</div>
        <h2>${escapeHtml(act.title)}</h2>
        <p>${escapeHtml(act.intro)}</p>
        <button class="btn btn--primary" data-action="continue">開始這個階段</button>
      </section>`;
  }

  function outroHTML(act, route) {
    const text = (route && act.outroByRoute && act.outroByRoute[route]) || act.outro;
    return `
      <section class="card card--outro">
        <div class="card-icon">${act.icon || ""}</div>
        <h2>${escapeHtml(act.title)}・階段小結</h2>
        <p>${escapeHtml(text)}</p>
        <button class="btn btn--primary" data-action="continue">繼續</button>
      </section>`;
  }

  // 選項按鈕故意不顯示指標增減——結果只在按下之後才揭曉，避免玩家為了衝數值而選擇，
  // 而是真的憑情境判斷做決定。
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

  function feedbackHTML(feedback, unlockedEntries) {
    const unlockHTML = unlockedEntries.length
      ? `<div class="unlock-note">📖 解鎖百科：${unlockedEntries
          .map(
            (e) =>
              `<button type="button" class="unlock-link" data-action="open-glossary-entry" data-id="${e.id}">${escapeHtml(
                e.title
              )}</button>`
          )
          .join("、")}</div>`
      : "";
    return `
      <section class="card card--feedback">
        <p class="feedback-text">${escapeHtml(feedback)}</p>
        ${unlockHTML}
        <button class="btn btn--primary" data-action="continue">繼續</button>
      </section>`;
  }

  function endingHTML(ending, state, unlockedCount, routeLabel) {
    return `
      <section class="card card--ending card--ending-${ending.type}">
        <div class="card-icon">${ending.icon || ""}</div>
        <h2>${escapeHtml(ending.title)}</h2>
        ${routeLabel ? `<p class="ending-route">本局路線：${escapeHtml(routeLabel)}</p>` : ""}
        <p>${escapeHtml(ending.text)}</p>
        ${
          ending.advice
            ? `<div class="ending-advice">🔄 <strong>如何走向更好的結局：</strong>${escapeHtml(ending.advice)}</div>`
            : ""
        }
        ${
          ending.realWorld
            ? `<div class="ending-realworld">🌍 <strong>現實案例對照：</strong>${escapeHtml(ending.realWorld)}</div>`
            : ""
        }
        <div class="ending-metrics">${metricsBarHTML(state)}</div>
        <p class="ending-note">本局共解鎖 ${unlockedCount} 則合作社小百科條目。</p>
        <div class="ending-actions">
          <button class="btn btn--primary" data-action="restart">重新開始</button>
          <button class="btn btn--ghost" data-action="open-achievements">🏆 查看所有結局</button>
          <button class="btn btn--ghost" data-action="open-feedback">💬 留下你的回饋</button>
        </div>
      </section>`;
  }

  function achievementsHTML(achievedSet) {
    const endings = window.GameEngine.getAllEndings();
    return endings
      .map((e) => {
        const achieved = achievedSet.has(e.type);
        return `
          <div class="achievement-entry ${achieved ? "achievement-entry--done" : ""}">
            <div class="achievement-head">
              <span class="achievement-icon">${e.icon}</span>
              <h4>${escapeHtml(e.title)}</h4>
              <span class="achievement-status">${achieved ? "✓ 已達成" : "尚未達成"}</span>
            </div>
            <p>${escapeHtml(e.text)}</p>
            <p class="achievement-realworld">🌍 ${escapeHtml(e.realWorld)}</p>
          </div>`;
      })
      .join("");
  }

  function tutorialHTML(tutorial) {
    const paragraphs = tutorial.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    return `
      ${paragraphs}
      <label class="tutorial-skip">
        <input type="checkbox" id="tutorial-skip-checkbox" />
        下次不要自動顯示這個教學
      </label>
      <button class="btn btn--primary" data-action="tutorial-start">${escapeHtml(tutorial.cta)}</button>`;
  }

  function feedbackFormHTML() {
    const ratingButtons = [1, 2, 3, 4, 5]
      .map((n) => `<button type="button" class="rating-btn" data-action="rate" data-value="${n}">${n}</button>`)
      .join("");
    return `
      <p class="feedback-intro">這個遊戲有沒有讓你更了解合作社？你的想法能幫助我們把它做得更有趣、更貼近實際經營合作社的樣子。</p>
      <div class="feedback-field">
        <div class="feedback-label">這個遊戲好玩嗎？（1 分不好玩，5 分很好玩）</div>
        <div class="rating-group" id="rating-group">${ratingButtons}</div>
      </div>
      <div class="feedback-field">
        <label class="feedback-label" for="feedback-favorite">哪個部分最有趣，或最讓你想多了解合作社？</label>
        <textarea id="feedback-favorite" rows="2" placeholder="（選填）"></textarea>
      </div>
      <div class="feedback-field">
        <label class="feedback-label" for="feedback-suggestion">有沒有覺得卡關、不合理，或希望改進的地方？</label>
        <textarea id="feedback-suggestion" rows="3" placeholder="（選填）"></textarea>
      </div>
      <div class="feedback-actions">
        <button class="btn btn--primary" data-action="feedback-email">✉️ 用 Email 送出</button>
        <button class="btn btn--ghost" data-action="feedback-github">在 GitHub 留言</button>
      </div>
      <p class="feedback-note">送出時只會打開你自己的郵件軟體或 GitHub 頁面，內容由你確認後才會真的寄出／發佈，我們不會偷偷收集任何資料。</p>`;
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
        return `<div class="glossary-entry" id="glossary-entry-${id}"><h4>${escapeHtml(e.title)}</h4><p>${escapeHtml(
          e.text
        )}</p><p class="glossary-source">資料來源：${escapeHtml(e.source)}</p></div>`;
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
    achievementsHTML,
    glossaryHTML,
    tutorialHTML,
    feedbackFormHTML,
  };
})();

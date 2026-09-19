// 遊戲流程控制與事件綁定
(function () {
  const stage = document.getElementById("stage");
  const metricsBar = document.getElementById("metrics-bar");
  const progressBar = document.getElementById("progress-bar");
  const glossaryBtn = document.getElementById("glossary-btn");
  const glossaryOverlay = document.getElementById("glossary-overlay");
  const glossaryBody = document.getElementById("glossary-body");
  const glossaryClose = document.getElementById("glossary-close");

  let state = window.GameEngine.createInitialState();
  // 顯示回饋卡片時，「繼續」按鈕該做的事（推進到下一階段，或結束遊戲）。
  // 只交由下方唯一的委派 click listener 處理，避免同一次點擊被重複綁定的 listener 各自觸發一次。
  let pendingContinue = null;

  function renderMetrics() {
    metricsBar.innerHTML = window.UI.metricsBarHTML(state);
    progressBar.innerHTML = window.UI.progressHTML(state);
  }

  function renderGlossary() {
    glossaryBody.innerHTML = window.UI.glossaryHTML(state.unlocked);
  }

  function render() {
    renderMetrics();
    const act = window.GameEngine.currentAct(state);

    if (state.phase === "intro") {
      stage.innerHTML = window.UI.introHTML(act);
    } else if (state.phase === "event") {
      const event = window.GameEngine.currentEvent(state);
      stage.innerHTML = window.UI.eventHTML(event);
    } else if (state.phase === "quiz") {
      stage.innerHTML = window.UI.quizHTML(act.quiz);
    } else if (state.phase === "outro") {
      stage.innerHTML = window.UI.outroHTML(act);
    } else if (state.phase === "ended") {
      stage.innerHTML = window.UI.endingHTML(state.ending, state, state.unlocked.size);
    }
    renderGlossary();
  }

  function showFeedback(feedback, unlockIds, onContinue) {
    const titles = (unlockIds || [])
      .filter((id) => window.GLOSSARY[id])
      .map((id) => window.GLOSSARY[id].title);
    renderMetrics();
    stage.innerHTML = window.UI.feedbackHTML(feedback, titles);
    pendingContinue = onContinue;
  }

  function advance() {
    const act = window.GameEngine.currentAct(state);
    if (state.phase === "intro") {
      state.phase = "event";
    } else if (state.phase === "event") {
      state.eventIndex += 1;
      state.phase = state.eventIndex >= act.events.length ? "quiz" : "event";
    } else if (state.phase === "quiz") {
      state.phase = "outro";
    } else if (state.phase === "outro") {
      state.actIndex += 1;
      state.eventIndex = 0;
      if (state.actIndex >= window.GAME_CONTENT.acts.length) {
        state.ending = window.GameEngine.computeSuccessEnding(state);
        state.phase = "ended";
      } else {
        state.phase = "intro";
      }
    }
  }

  function handleChoice(option) {
    window.GameEngine.applyEffects(state, option.effects);
    window.GameEngine.applyUnlocks(state, option.unlock);
    const failure = window.GameEngine.checkFailure(state);
    if (failure) {
      state.ending = failure;
      showFeedback(option.feedback, option.unlock, () => {
        state.phase = "ended";
      });
      return;
    }
    showFeedback(option.feedback, option.unlock, advance);
  }

  function currentOptions() {
    if (state.phase === "event") {
      return window.GameEngine.currentEvent(state).options;
    }
    if (state.phase === "quiz") {
      return window.GameEngine.currentAct(state).quiz.options;
    }
    return null;
  }

  stage.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === "continue") {
      if (pendingContinue) {
        const cb = pendingContinue;
        pendingContinue = null;
        cb();
      } else {
        advance();
      }
      render();
    } else if (action === "restart") {
      pendingContinue = null;
      state = window.GameEngine.createInitialState();
      render();
    } else if (action === "choose") {
      const options = currentOptions();
      const option = options[Number(btn.dataset.index)];
      handleChoice(option);
    }
  });

  glossaryBtn.addEventListener("click", () => {
    renderGlossary();
    glossaryOverlay.hidden = false;
  });
  glossaryClose.addEventListener("click", () => {
    glossaryOverlay.hidden = true;
  });
  glossaryOverlay.addEventListener("click", (e) => {
    if (e.target === glossaryOverlay) glossaryOverlay.hidden = true;
  });

  render();
})();

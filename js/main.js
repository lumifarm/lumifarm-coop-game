// 遊戲流程控制與事件綁定
(function () {
  const REPO_URL = "https://github.com/lumifarm/lumifarm-coop-game";
  const FEEDBACK_EMAIL = "info@lumifarm.org";
  const TUTORIAL_SKIP_KEY = "lumifarm_coop_game_skip_tutorial";

  const stage = document.getElementById("stage");
  const metricsBar = document.getElementById("metrics-bar");
  const progressBar = document.getElementById("progress-bar");

  const glossaryBtn = document.getElementById("glossary-btn");
  const glossaryOverlay = document.getElementById("glossary-overlay");
  const glossaryBody = document.getElementById("glossary-body");
  const glossaryClose = document.getElementById("glossary-close");

  const tutorialBtn = document.getElementById("tutorial-btn");
  const tutorialOverlay = document.getElementById("tutorial-overlay");
  const tutorialBody = document.getElementById("tutorial-body");
  const tutorialClose = document.getElementById("tutorial-close");

  const feedbackBtn = document.getElementById("feedback-btn");
  const feedbackOverlay = document.getElementById("feedback-overlay");
  const feedbackBody = document.getElementById("feedback-body");
  const feedbackClose = document.getElementById("feedback-close");

  let state = window.GameEngine.createInitialState();
  // 顯示回饋卡片時，「繼續」按鈕該做的事（推進到下一階段，或結束遊戲）。
  // 只交由下方唯一的委派 click listener 處理，避免同一次點擊被重複綁定的 listener 各自觸發一次。
  let pendingContinue = null;
  let feedbackRating = null;

  function renderMetrics(deltas) {
    metricsBar.innerHTML = window.UI.metricsBarHTML(state, deltas);
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

  function showFeedback(feedback, unlockIds, onContinue, deltas) {
    const titles = (unlockIds || [])
      .filter((id) => window.GLOSSARY[id])
      .map((id) => window.GLOSSARY[id].title);
    renderMetrics(deltas);
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
      showFeedback(
        option.feedback,
        option.unlock,
        () => {
          state.phase = "ended";
        },
        option.effects
      );
      return;
    }
    showFeedback(option.feedback, option.unlock, advance, option.effects);
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

  // ---- 教學彈窗 ----

  function readSkipTutorial() {
    try {
      return localStorage.getItem(TUTORIAL_SKIP_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function writeSkipTutorial(skip) {
    try {
      if (skip) localStorage.setItem(TUTORIAL_SKIP_KEY, "1");
      else localStorage.removeItem(TUTORIAL_SKIP_KEY);
    } catch (e) {
      // 私密瀏覽或封鎖儲存時，安靜地放棄記住這個設定即可。
    }
  }

  function openTutorial() {
    tutorialBody.innerHTML = window.UI.tutorialHTML(window.GAME_CONTENT.tutorial);
    tutorialOverlay.hidden = false;
  }

  function closeTutorial() {
    tutorialOverlay.hidden = true;
  }

  // ---- 意見回饋 ----

  function openFeedback() {
    feedbackRating = null;
    feedbackBody.innerHTML = window.UI.feedbackFormHTML();
    feedbackOverlay.hidden = false;
  }

  function closeFeedback() {
    feedbackOverlay.hidden = true;
  }

  function buildFeedbackText() {
    const favorite = (document.getElementById("feedback-favorite") || {}).value || "";
    const suggestion = (document.getElementById("feedback-suggestion") || {}).value || "";
    const ratingText = feedbackRating ? `${feedbackRating} / 5` : "未評分";
    return { favorite: favorite.trim(), suggestion: suggestion.trim(), ratingText };
  }

  function submitFeedbackByEmail() {
    const { favorite, suggestion, ratingText } = buildFeedbackText();
    const subject = encodeURIComponent("光農合作社遊戲回饋");
    const body = encodeURIComponent(
      `好玩程度：${ratingText}\n\n最有趣／最想深入了解的部分：\n${favorite || "（未填寫）"}\n\n希望改進的地方：\n${suggestion || "（未填寫）"}\n`
    );
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
  }

  function submitFeedbackByGithub() {
    const { favorite, suggestion, ratingText } = buildFeedbackText();
    const title = encodeURIComponent(`遊戲回饋：好玩程度 ${ratingText}`);
    const body = encodeURIComponent(
      `**好玩程度**：${ratingText}\n\n**最有趣／最想深入了解的部分**\n${favorite || "（未填寫）"}\n\n**希望改進的地方**\n${suggestion || "（未填寫）"}\n`
    );
    window.open(`${REPO_URL}/issues/new?title=${title}&body=${body}`, "_blank", "noopener");
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
    } else if (action === "open-feedback") {
      openFeedback();
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

  tutorialBtn.addEventListener("click", openTutorial);
  tutorialClose.addEventListener("click", closeTutorial);
  tutorialOverlay.addEventListener("click", (e) => {
    if (e.target === tutorialOverlay) closeTutorial();
  });
  tutorialBody.addEventListener("click", (e) => {
    const btn = e.target.closest('button[data-action="tutorial-start"]');
    if (!btn) return;
    const checkbox = document.getElementById("tutorial-skip-checkbox");
    writeSkipTutorial(!!(checkbox && checkbox.checked));
    closeTutorial();
  });

  feedbackBtn.addEventListener("click", openFeedback);
  feedbackClose.addEventListener("click", closeFeedback);
  feedbackOverlay.addEventListener("click", (e) => {
    if (e.target === feedbackOverlay) closeFeedback();
  });
  feedbackBody.addEventListener("click", (e) => {
    const rateBtn = e.target.closest('button[data-action="rate"]');
    if (rateBtn) {
      feedbackRating = Number(rateBtn.dataset.value);
      feedbackBody.querySelectorAll(".rating-btn").forEach((b) => {
        b.classList.toggle("active", Number(b.dataset.value) === feedbackRating);
      });
      return;
    }
    const emailBtn = e.target.closest('button[data-action="feedback-email"]');
    if (emailBtn) {
      submitFeedbackByEmail();
      return;
    }
    const githubBtn = e.target.closest('button[data-action="feedback-github"]');
    if (githubBtn) {
      submitFeedbackByGithub();
    }
  });

  render();
  if (!readSkipTutorial()) {
    openTutorial();
  }
})();

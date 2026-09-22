// 遊戲流程控制與事件綁定
(function () {
  const EMAILJS_PUBLIC_KEY = "BcWO0rGunj8MWbrKk";
  const EMAILJS_SERVICE_ID = "service_tyvivco";
  const EMAILJS_TEMPLATE_ID = "template_gydmpku";
  const TUTORIAL_SKIP_KEY = "lumifarm_coop_game_skip_tutorial";
  const ACHIEVEMENTS_KEY = "lumifarm_coop_game_achievements";

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

  const achievementsBtn = document.getElementById("achievements-btn");
  const achievementsOverlay = document.getElementById("achievements-overlay");
  const achievementsBody = document.getElementById("achievements-body");
  const achievementsClose = document.getElementById("achievements-close");

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

  function openGlossaryEntry(id) {
    renderGlossary();
    glossaryOverlay.hidden = false;
    requestAnimationFrame(() => {
      const el = document.getElementById(`glossary-entry-${id}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("glossary-entry--highlight");
      setTimeout(() => el.classList.remove("glossary-entry--highlight"), 1600);
    });
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
      stage.innerHTML = window.UI.outroHTML(act, window.GameEngine.computeRoute(state));
    } else if (state.phase === "ended") {
      stage.innerHTML = window.UI.endingHTML(
        state.ending,
        state,
        state.unlocked.size,
        window.GameEngine.ROUTE_LABELS[window.GameEngine.computeRoute(state)]
      );
      recordAchievement(state.ending.type);
    }
    renderGlossary();
  }

  function showFeedback(feedback, unlockIds, onContinue, deltas) {
    const entries = (unlockIds || [])
      .filter((id) => window.GLOSSARY[id])
      .map((id) => ({ id, title: window.GLOSSARY[id].title }));
    renderMetrics(deltas);
    stage.innerHTML = window.UI.feedbackHTML(feedback, entries);
    pendingContinue = onContinue;
  }

  function advance() {
    if (state.phase === "intro") {
      state.phase = "event";
    } else if (state.phase === "event") {
      state.eventIndex += 1;
      state.phase = state.eventIndex >= window.GameEngine.currentEventCount(state) ? "quiz" : "event";
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
    const effects = window.GameEngine.previewEffects(option.effects);
    window.GameEngine.applyEffects(state, effects);
    window.GameEngine.applyUnlocks(state, option.unlock);
    window.GameEngine.applyRouteLean(state, option.lean);
    const failure = window.GameEngine.checkFailure(state);
    if (failure) {
      state.ending = failure;
      showFeedback(
        option.feedback,
        option.unlock,
        () => {
          state.phase = "ended";
        },
        effects
      );
      return;
    }
    showFeedback(option.feedback, option.unlock, advance, effects);
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

  // ---- 成就（所有可能的結局） ----

  function readAchievements() {
    try {
      const raw = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || "[]");
      return new Set(Array.isArray(raw) ? raw : []);
    } catch (e) {
      return new Set();
    }
  }

  function recordAchievement(type) {
    try {
      const set = readAchievements();
      set.add(type);
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(Array.from(set)));
    } catch (e) {
      // 私密瀏覽或封鎖儲存時，安靜地放棄記錄即可，不影響本局遊玩。
    }
  }

  function openAchievements() {
    achievementsBody.innerHTML = window.UI.achievementsHTML(readAchievements());
    achievementsOverlay.hidden = false;
  }

  function closeAchievements() {
    achievementsOverlay.hidden = true;
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

  function submitFeedback() {
    const favoriteEl = document.getElementById("feedback-favorite");
    const confusedDetailEl = document.getElementById("feedback-confused-detail");
    const onechangeEl = document.getElementById("feedback-onechange");
    const nicknameEl = document.getElementById("feedback-nickname");
    const emailEl = document.getElementById("feedback-email");
    const statusEl = document.getElementById("feedback-status");
    const submitBtn = feedbackBody.querySelector('[data-action="feedback-submit"]');
    const ratingText = feedbackRating ? `${feedbackRating} 分` : "未評分";
    const favorite = (favoriteEl && favoriteEl.value.trim()) || "（未填寫）";
    const confusedChecked = Array.from(
      feedbackBody.querySelectorAll("#feedback-confused-group input:checked")
    ).map((el) => el.value);
    const confused = confusedChecked.length ? confusedChecked.join("、") : "（未選擇）";
    const confusedDetail = (confusedDetailEl && confusedDetailEl.value.trim()) || "（未填寫）";
    const onechange = (onechangeEl && onechangeEl.value.trim()) || "（未填寫）";
    const nickname = (nicknameEl && nicknameEl.value.trim()) || "（未填寫）";
    const email = (emailEl && emailEl.value.trim()) || "（未填寫）";

    if (typeof emailjs === "undefined") {
      if (statusEl) statusEl.textContent = "送出功能暫時無法使用，請稍後再試一次。";
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) statusEl.textContent = "傳送中...";

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        rating: ratingText,
        favorite,
        confused,
        confusedDetail,
        onechange,
        nickname,
        email,
      })
      .then(() => {
        feedbackBody.innerHTML = window.UI.feedbackSuccessHTML();
      })
      .catch(() => {
        if (submitBtn) submitBtn.disabled = false;
        if (statusEl) statusEl.textContent = "送出失敗，請確認網路連線後再按一次「送出回饋」（你剛剛填寫的內容都還在）。";
      });
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
    } else if (action === "open-achievements") {
      openAchievements();
    } else if (action === "open-glossary-entry") {
      openGlossaryEntry(btn.dataset.id);
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

  achievementsBtn.addEventListener("click", openAchievements);
  achievementsClose.addEventListener("click", closeAchievements);
  achievementsOverlay.addEventListener("click", (e) => {
    if (e.target === achievementsOverlay) closeAchievements();
  });

  // 意見回饋視窗故意不支援「點背景關閉」——避免使用者填到一半不小心點到背景，
  // 辛苦打的內容就整個不見，只能用右上角的 ✕ 或送出成功後的「關閉」按鈕離開。
  feedbackBtn.addEventListener("click", openFeedback);
  feedbackClose.addEventListener("click", closeFeedback);
  feedbackBody.addEventListener("change", (e) => {
    const checkbox = e.target.closest("#feedback-confused-group input[type='checkbox']");
    if (!checkbox) return;
    const isAllUnderstood = checkbox.value === "都看得懂";
    const group = feedbackBody.querySelectorAll("#feedback-confused-group input[type='checkbox']");
    if (checkbox.checked && isAllUnderstood) {
      group.forEach((el) => {
        if (el !== checkbox) el.checked = false;
      });
    } else if (checkbox.checked && !isAllUnderstood) {
      group.forEach((el) => {
        if (el.value === "都看得懂") el.checked = false;
      });
    }
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
    if (e.target.closest('button[data-action="feedback-submit"]')) {
      submitFeedback();
      return;
    }
    if (e.target.closest('button[data-action="close-feedback"]')) {
      closeFeedback();
    }
  });

  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  render();
  if (!readSkipTutorial()) {
    openTutorial();
  }
})();

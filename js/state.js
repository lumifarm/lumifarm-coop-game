// 遊戲狀態：指標運算、失敗判定、結局判定
(function () {
  const METRIC_KEYS = ["trust", "democracy", "producerRel", "consumerSat", "finance"];

  const METRIC_LABELS = {
    trust: "信任",
    democracy: "民主參與",
    producerRel: "生產者關係",
    consumerSat: "消費者滿意度",
    finance: "財務",
  };

  function createInitialState() {
    return {
      actIndex: 0,
      eventIndex: 0,
      phase: "intro", // intro | event | quiz | outro | ended
      metrics: { trust: 50, democracy: 50, producerRel: 50, consumerSat: 50, finance: 50 },
      unlocked: new Set(),
      log: [],
      ending: null,
    };
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  function applyEffects(state, effects) {
    Object.keys(effects || {}).forEach((key) => {
      if (state.metrics[key] === undefined) return;
      state.metrics[key] = clamp(state.metrics[key] + effects[key]);
    });
  }

  function applyUnlocks(state, unlockIds) {
    (unlockIds || []).forEach((id) => state.unlocked.add(id));
  }

  // 核心指標歸零就判定失敗，回傳失敗類型；否則回傳 null
  function checkFailure(state) {
    const m = state.metrics;
    if (m.trust <= 0) {
      return {
        type: "misunderstand",
        title: "結局：誤解合作",
        text:
          "信任徹底崩解，社員開始把彼此當成陌生人。合作從來不是靠一次熱情的集會就能維持，而是需要日復一日的兌現與回應。沒有共同的願景，彼此終究是外人。",
      };
    }
    if (m.finance <= 0) {
      return {
        type: "underfunded",
        title: "結局：支持不足",
        text:
          "財務撐不下去了。理想需要現實的資源支撐，成員參與與財務投入若長期不足，再好的理念也無法運作下去。",
      };
    }
    if (m.democracy <= 0) {
      const isPowerConcentration = m.trust >= 40;
      return isPowerConcentration
        ? {
            type: "power",
            title: "結局：權力集中",
            text:
              "社員依然信任那個能幹的人，但決策已經完全繞過民主程序。當一切都繫於少數人的判斷，合作社在結構上，其實已經不再是「大家的」合作社。",
          }
        : {
            type: "governance",
            title: "結局：治理失敗",
            text:
              "沒有任期輪替、沒有調解機制、價值也沒有被傳承下去。民主原則不是一句口號，一旦制度長期缺席，組織終究會被自己的內部矛盾拖垮。",
          };
    }
    return null;
  }

  function computeSuccessEnding(state) {
    const m = state.metrics;
    if (m.finance >= 75) {
      return {
        type: "vertical",
        title: "結局：垂直整合型",
        text:
          "合作社從共同採購一路走到共同加工，生產者作為所有權人，享有加工後產品的完整利潤。規模與附加價值兼具，成為地方經濟裡一股不容忽視的力量。",
      };
    }
    if (m.producerRel >= 65 && m.consumerSat >= 65) {
      return {
        type: "community",
        title: "結局：深耕社區型",
        text:
          "合作社或許沒有變得很大，但生產者與消費者之間建立起深厚的信任與默契。社區不是一種業務，而合作社成了社區關係最踏實的載體。",
      };
    }
    if (m.democracy >= 70 && m.trust >= 70) {
      return {
        type: "stable",
        title: "結局：穩健民主型",
        text:
          "規模不算最大，但治理健全、資訊公開、幹部輪替。這樣的合作社或許成長得比較慢，卻走得比誰都長遠。",
      };
    }
    return {
      type: "muddling",
      title: "結局：勉強維持型",
      text:
        "合作社走完了三個階段，指標沒有任何一項歸零，但整體表現平平，稱不上特別出色。也許再多一點堅持與更好的選擇，下一輪能走出不一樣的路。",
    };
  }

  function currentAct(state) {
    return window.GAME_CONTENT.acts[state.actIndex];
  }

  function currentEvent(state) {
    const act = currentAct(state);
    return act ? act.events[state.eventIndex] : null;
  }

  window.GameEngine = {
    METRIC_KEYS,
    METRIC_LABELS,
    createInitialState,
    clamp,
    applyEffects,
    applyUnlocks,
    checkFailure,
    computeSuccessEnding,
    currentAct,
    currentEvent,
  };
})();

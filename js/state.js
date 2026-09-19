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

  // 每項指標依數值高到低分五個級距的評語，index 0 = 最差、4 = 最好
  const METRIC_EVALUATIONS = {
    trust: [
      "社員彼此猜忌，信任瀕臨崩解",
      "信任出現裂痕，需要好好修補",
      "信任還算平穩，但禁不起太多考驗",
      "社員之間有不錯的互信基礎",
      "社員彼此高度信任，默契十足",
    ],
    democracy: [
      "決策幾乎被少數人壟斷",
      "民主參與流於形式",
      "還有基本的參與管道",
      "社員普遍有參與決策的機會",
      "資訊公開、幹部輪替，民主健全",
    ],
    producerRel: [
      "生產者對合作社已經失去信心",
      "生產者開始考慮轉單其他通路",
      "生產者關係普通，仍有改善空間",
      "生產者對合作社有不錯的信賴",
      "生產者視合作社為長期夥伴",
    ],
    consumerSat: [
      "消費者大量流失、抱怨四起",
      "消費者抱怨聲浪漸增",
      "消費者滿意度普通",
      "消費者對品質與價格都算滿意",
      "消費者高度信賴、主動推薦",
    ],
    finance: [
      "財務瀕臨崩潰，隨時可能撐不下去",
      "現金流吃緊，需要謹慎規劃",
      "財務狀況普通，收支大致平衡",
      "財務穩健，有餘裕投入發展",
      "財務體質強健，具備擴張的本錢",
    ],
  };

  function evaluateMetric(key, value) {
    const tiers = METRIC_EVALUATIONS[key];
    if (!tiers) return "";
    const tierIndex = value <= 20 ? 0 : value <= 40 ? 1 : value <= 60 ? 2 : value <= 80 ? 3 : 4;
    return tiers[tierIndex];
  }

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
          "光農合作社的信任徹底崩解，社員開始把彼此當成陌生人。合作從來不是靠一次熱情的集會就能維持，而是需要日復一日的兌現與回應。沒有共同的願景，彼此終究是外人。",
      };
    }
    if (m.finance <= 0) {
      return {
        type: "underfunded",
        title: "結局：支持不足",
        text:
          "光農合作社的財務撐不下去了。理想需要現實的資源支撐，成員參與與財務投入若長期不足，再好的理念也無法運作下去。",
      };
    }
    if (m.democracy <= 0) {
      const isPowerConcentration = m.trust >= 40;
      return isPowerConcentration
        ? {
            type: "power",
            title: "結局：權力集中",
            text:
              "社員依然信任那個能幹的人，但光農合作社的決策已經完全繞過民主程序。當一切都繫於少數人的判斷，合作社在結構上，其實已經不再是「大家的」合作社。",
          }
        : {
            type: "governance",
            title: "結局：治理失敗",
            text:
              "光農合作社沒有任期輪替、沒有調解機制、價值也沒有被傳承下去。民主原則不是一句口號，一旦制度長期缺席，組織終究會被自己的內部矛盾拖垮。",
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
          "光農合作社從共同採購一路走到共同加工，生產者作為所有權人，享有加工後產品的完整利潤。規模與附加價值兼具，成為地方經濟裡一股不容忽視的力量。",
      };
    }
    if (m.producerRel >= 65 && m.consumerSat >= 65) {
      return {
        type: "community",
        title: "結局：深耕社區型",
        text:
          "光農合作社或許沒有變得很大，但生產者與消費者之間建立起深厚的信任與默契。社區不是一種業務，而合作社成了社區關係最踏實的載體。",
      };
    }
    if (m.democracy >= 70 && m.trust >= 70) {
      return {
        type: "stable",
        title: "結局：穩健民主型",
        text:
          "光農合作社規模不算最大，但治理健全、資訊公開、幹部輪替。這樣的合作社或許成長得比較慢，卻走得比誰都長遠。",
      };
    }
    return {
      type: "muddling",
      title: "結局：勉強維持型",
      text:
        "光農合作社走完了三個階段，指標沒有任何一項歸零，但整體表現平平，稱不上特別出色。也許再多一點堅持與更好的選擇，下一輪能走出不一樣的路。",
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
    evaluateMetric,
  };
})();

// 遊戲狀態：指標運算、失敗判定、結局判定
(function () {
  const METRIC_KEYS = ["trust", "democracy", "producerRel", "consumerSat", "finance"];
  const EVENTS_PER_ACT = 4;
  // 每回合被動的基本營運收支（象徵日常小額收入），讓「合理的選擇」不會單純因為
  // 投資信任／民主而必然拖垮財務。
  const PASSIVE_FINANCE_DRIFT = 4;
  // 難度倍率：把每個選項本來的指標增減幅度放大，讓單一選擇的後果更明顯、遊戲更難穩定通關。
  const DIFFICULTY_MULTIPLIER = 1.8;

  const METRIC_LABELS = {
    trust: "信任",
    democracy: "民主參與",
    producerRel: "生產者關係",
    consumerSat: "消費者滿意度",
    finance: "財務",
  };

  const METRIC_SHORT_LABELS = {
    trust: "信任",
    democracy: "民主",
    producerRel: "生產",
    consumerSat: "消費",
    finance: "財務",
  };

  const ROUTE_LABELS = {
    producer: "偏生產者導向",
    consumer: "偏消費者導向",
    hybrid: "生產者＋消費者共治",
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

  // Fisher-Yates：回傳 0..n-1 的隨機排列，用來打亂事件順序、確保同一階段不會抽到重複事件
  function shuffledRange(n) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  // 把選項原始的指標增減，依難度倍率放大，再疊加被動基本營運收支。
  // 這個結果只在玩家「按下選項之後」用來套用與顯示變化，選擇當下不會預先曝光。
  function previewEffects(effects) {
    const result = {};
    Object.keys(effects || {}).forEach((key) => {
      result[key] = Math.round(effects[key] * DIFFICULTY_MULTIPLIER);
    });
    result.finance = (result.finance || 0) + PASSIVE_FINANCE_DRIFT;
    return result;
  }

  function createInitialState() {
    const acts = window.GAME_CONTENT.acts;
    return {
      actIndex: 0,
      eventIndex: 0,
      phase: "intro", // intro | event | quiz | outro | ended
      metrics: { trust: 50, democracy: 50, producerRel: 50, consumerSat: 50, finance: 50 },
      unlocked: new Set(),
      eventOrders: acts.map((act) => shuffledRange(act.events.length).slice(0, EVENTS_PER_ACT)),
      routeTally: { producer: 0, consumer: 0 },
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

  function applyRouteLean(state, lean) {
    if (!lean) return;
    if (lean === "producer") state.routeTally.producer += 1;
    else if (lean === "consumer") state.routeTally.consumer += 1;
    else if (lean === "hybrid") {
      state.routeTally.producer += 1;
      state.routeTally.consumer += 1;
    }
  }

  // 「結識夥伴」階段的選擇傾向，決定光農合作社最終走向生產者導向、消費者導向，還是原本的共治路線
  function computeRoute(state) {
    const diff = state.routeTally.producer - state.routeTally.consumer;
    if (diff >= 2) return "producer";
    if (diff <= -2) return "consumer";
    return "hybrid";
  }

  // 所有可能結局的完整目錄：每種結局固定的圖示／標題／描述／如何轉向更好結局的建議／現實案例對照。
  // 是「成就」畫面與實際結局判定共用的唯一資料來源。
  const ENDING_CATALOG = {
    misunderstand: {
      icon: "💔",
      title: "結局：誤解合作",
      text:
        "光農合作社的信任徹底崩解，社員開始把彼此當成陌生人。合作從來不是靠一次熱情的集會就能維持，而是需要日復一日的兌現與回應。沒有共同的願景，彼此終究是外人。",
      advice:
        "下次可以在「結識夥伴」階段多花時間讓大家先想清楚「為什麼要合作」，並在信任開始下滑時，優先選擇願意花時間修補關係、而不是圖方便帶過的選項。",
      realWorld:
        "美國芝加哥的員工曾在 2008 年以自發占領工廠展開抗爭，但真正撐住組織的，是後來把占領行動轉化為有章程、有資金結構的「New Era Windows Cooperative」——單靠一時的熱情團結，撐不過長期經營的考驗。",
    },
    underfunded: {
      icon: "💸",
      title: "結局：支持不足",
      text:
        "光農合作社的財務撐不下去了。理想需要現實的資源支撐，成員參與與財務投入若長期不足，再好的理念也無法運作下去。",
      advice:
        "留意每次選擇對財務的影響，適時選擇能立即增加收入或降低支出的選項；也可以參考研究建議，及早尋求外部小額貸款或社區募資，分散資金壓力，而不是硬撐到財務見底。",
      realWorld:
        "研究指出，合作社的民主治理與股息限制，讓募資天生比一般企業慢；美國「New Era Windows Cooperative」能撐過關廠危機，關鍵之一正是取得工會組織的資金援助，而不是單靠社員自己的積蓄。",
    },
    power: {
      icon: "👑",
      title: "結局：權力集中",
      text:
        "社員依然信任那個能幹的人，但光農合作社的決策已經完全繞過民主程序。當一切都繫於少數人的判斷，合作社在結構上，其實已經不再是「大家的」合作社。",
      advice:
        "當發現決策越來越集中在少數能幹的人身上時，優先選擇建立任期制、輪替規則或監事會等制衡機制的選項，及早把權力交還給民主程序。",
      realWorld:
        "《合作的艱難》一文訪談的一家居家服務類勞動合作社，社員大會長年僅維持一年一次的最低法定頻率，實際決策早由理監事把持——這正是「所有權與控制權分離」在真實組織裡的樣貌。",
    },
    governance: {
      icon: "🧩",
      title: "結局：治理失敗",
      text:
        "光農合作社沒有任期輪替、沒有調解機制、價值也沒有被傳承下去。民主原則不是一句口號，一旦制度長期缺席，組織終究會被自己的內部矛盾拖垮。",
      advice:
        "及早建立調解機制、教育訓練與幹部輪替制度，不要等到衝突爆發或世代交替時才臨時應對；治理制度需要在還風平浪靜的時候就先蓋好。",
      realWorld:
        "學者 Gulati、Isaac 與 Klein 歸納出合作社常見的三種退化路徑：社員只想在退休前領回股金、既有社員排斥稀釋利潤的新投資、第二代社員缺乏共同奮鬥記憶——任何一條走到底，組織終將變質。",
    },
    producerled: {
      icon: "🚜",
      title: "結局：生產者自主型",
      text:
        "光農合作社最終長成一個以生產者為主體的合作社：農友們共同運銷、共同議價，不再任由中間商決定收購價。消費者依然是穩定的客戶，但真正握有決策權的，是站在產地第一線的人。",
      advice:
        "這已經是相當成熟的生產者自治結局。若想再進一步，可以嘗試在後期階段拉高消費者滿意度與參與度，看看能不能同時兼顧「深耕社區型」的雙邊信任。",
      realWorld:
        "北美數百個蔓越莓農場組成的 Ocean Spray，正是生產者共同擁有、共同決策的代表案例：農民作為所有權人，從共同生產一路整合到加工與品牌，完整保有加工後的利潤。",
    },
    consumerled: {
      icon: "🛍️",
      title: "結局：消費者自主型",
      text:
        "光農合作社最終長成一個以消費者為主體的共同購買組織：一群認同理念的家庭，穩定地向信任的產地下單。生產者是重要的合作夥伴，但真正共同擁有、共同決定這個組織的，是這群消費者社員。",
      advice:
        "這是成熟的消費者自治結局。若想讓生產者也更深入參與治理，可以在銷售與定價的情境中，多選擇邀請生產者代表加入決策會議的選項。",
      realWorld:
        "紐約的 Park Slope Food Coop、布魯塞爾的 Bees Coop、巴黎的 La Louve，都是社員以勞動時數換取優惠價格的消費合作社典範：由消費者共同擁有、共同決定要向誰採購、以什麼條件採購。",
    },
    vertical: {
      icon: "🏭",
      title: "結局：垂直整合型",
      text:
        "光農合作社從共同採購一路走到共同加工，生產者作為所有權人，享有加工後產品的完整利潤。規模與附加價值兼具，成為地方經濟裡一股不容忽視的力量。",
      advice:
        "財務與規模都已經很出色。下一步可以留意民主參與與信任是否跟上了擴張的速度，避免規模化的過程中，決策悄悄集中到少數專職人員手上。",
      realWorld:
        "印度的 SEWA（Self Employed Women's Association）結合生產、銷售、儲蓄互助與集體保險等多重合作架構，形成規模龐大又能互相支撐的合作系統，是「垂直整合＋多元服務」的代表性案例。",
    },
    community: {
      icon: "🌱",
      title: "結局：深耕社區型",
      text:
        "光農合作社或許沒有變得很大，但生產者與消費者之間建立起深厚的信任與默契。社區不是一種業務，而合作社成了社區關係最踏實的載體。",
      advice:
        "這是很難得的雙邊信任結局。如果想進一步壯大規模，可以留意財務指標，適度投入共同加工或擴大採購規模，同時小心別稀釋掉已經建立起來的信任。",
      realWorld:
        "愛爾蘭都柏林的一家社區食物合作社，六成五以上的食品供應來自本地供應商，同時提供社區健康課程與技能培訓空間，證明合作社可以同時是通路，也是社區培力的據點。",
    },
    stable: {
      icon: "⚖️",
      title: "結局：穩健民主型",
      text:
        "光農合作社規模不算最大，但治理健全、資訊公開、幹部輪替。這樣的合作社或許成長得比較慢，卻走得比誰都長遠。",
      advice:
        "治理體質已經很健全。如果想同時兼顧生產者與消費者關係，可以在銷售與定價的情境中，多選擇公開透明、雙方共同協商的選項。",
      realWorld:
        "瑞士零售合作社 Migros 面對是否開放酒精販售的章程修改時，選擇交付全體社員公投決定，即使結果不如管理層預期——重大方向交還給民主程序，正是穩健治理的具體示範。",
    },
    muddling: {
      icon: "🌤️",
      title: "結局：勉強維持型",
      text:
        "光農合作社走完了四個階段，指標沒有任何一項歸零，但整體表現平平，稱不上特別出色。也許再多一點堅持與更好的選擇，下一輪能走出不一樣的路。",
      advice:
        "沒有任何指標歸零已經不容易。下次重玩時，可以試著在某幾個指標上做出更明確的取捨（例如集中投資信任與民主），而不是每個選項都選擇四平八穩的中庸選項。",
      realWorld:
        "根據《合作的艱難》引用的官方統計，台灣勞動合作社社員數從 1991 年高峰的 2 萬 7,726 人，一路下滑到 2018 年僅剩 1 萬 6,315 人——多數合作社的真實命運，其實就是不上不下地慘澹經營，而不是戲劇性地成功或倒閉。",
    },
  };

  const ENDING_ORDER = [
    "producerled",
    "consumerled",
    "vertical",
    "community",
    "stable",
    "muddling",
    "misunderstand",
    "underfunded",
    "power",
    "governance",
  ];

  function getAllEndings() {
    return ENDING_ORDER.map((type) => Object.assign({ type }, ENDING_CATALOG[type]));
  }

  // 核心指標歸零就判定失敗，回傳失敗類型；否則回傳 null
  function checkFailure(state) {
    const m = state.metrics;
    if (m.trust <= 0) {
      return Object.assign({ type: "misunderstand" }, ENDING_CATALOG.misunderstand);
    }
    if (m.finance <= 0) {
      return Object.assign({ type: "underfunded" }, ENDING_CATALOG.underfunded);
    }
    if (m.democracy <= 0) {
      const isPowerConcentration = m.trust >= 40;
      return isPowerConcentration
        ? Object.assign({ type: "power" }, ENDING_CATALOG.power)
        : Object.assign({ type: "governance" }, ENDING_CATALOG.governance);
    }
    return null;
  }

  function computeSuccessEnding(state) {
    const m = state.metrics;
    const route = computeRoute(state);

    if (route === "producer" && m.producerRel >= 70) {
      return Object.assign({ type: "producerled" }, ENDING_CATALOG.producerled);
    }
    if (route === "consumer" && m.consumerSat >= 70) {
      return Object.assign({ type: "consumerled" }, ENDING_CATALOG.consumerled);
    }
    if (m.finance >= 75) {
      return Object.assign({ type: "vertical" }, ENDING_CATALOG.vertical);
    }
    if (m.producerRel >= 65 && m.consumerSat >= 65) {
      return Object.assign({ type: "community" }, ENDING_CATALOG.community);
    }
    if (m.democracy >= 70 && m.trust >= 70) {
      return Object.assign({ type: "stable" }, ENDING_CATALOG.stable);
    }
    return Object.assign({ type: "muddling" }, ENDING_CATALOG.muddling);
  }

  function currentAct(state) {
    return window.GAME_CONTENT.acts[state.actIndex];
  }

  function currentEventCount(state) {
    return state.eventOrders[state.actIndex].length;
  }

  function currentEvent(state) {
    const act = currentAct(state);
    if (!act) return null;
    const order = state.eventOrders[state.actIndex];
    return act.events[order[state.eventIndex]];
  }

  window.GameEngine = {
    METRIC_KEYS,
    METRIC_LABELS,
    METRIC_SHORT_LABELS,
    ROUTE_LABELS,
    PASSIVE_FINANCE_DRIFT,
    createInitialState,
    clamp,
    previewEffects,
    applyEffects,
    applyUnlocks,
    applyRouteLean,
    computeRoute,
    checkFailure,
    computeSuccessEnding,
    getAllEndings,
    currentAct,
    currentEvent,
    currentEventCount,
    evaluateMetric,
  };
})();

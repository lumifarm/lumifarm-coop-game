// 遊戲內容資料：四階段（結識夥伴 → 共同採購 → 共同銷售 → 共同信貸整合）
// 每個 event 有多個 options，每個 option 有 effects（指標增減）、feedback（回饋文字）、unlock（解鎖的百科條目 id）
window.GAME_CONTENT = {
  tutorial: {
    title: "遊戲教學",
    paragraphs: [
      "歡迎來到食農新日常！你正在思考一件事：要怎麼讓生產者與消費者一起合作，經營一個團結經濟的合作社「光農合作社」。",
      "遊戲分成四個階段：結識夥伴 → 共同採購 → 共同銷售與品牌 → 共同信貸與加工整合。每個階段會遇到幾個取材自真實案例的情境，每個情境有四個選項，你的選擇會影響五項指標：信任、民主參與、生產者關係、消費者滿意度、財務。",
      "指標介於 0 到 100 之間。信任、民主參與、財務這三項核心指標，只要有一項歸零，光農合作社就會遭遇經營危機、提前落幕。",
      "撐過四個階段後，依照最終的指標組合，光農合作社會走向不同的結局。過程中的選擇也會解鎖「合作社小百科」，可以隨時點右上角查看真實世界的案例與資料來源。",
      "沒有標準答案，但每個選項背後都有真實世界的參考依據——用你覺得最合理、最能兼顧各方的判斷，讓光農合作社經營下去吧！",
    ],
    cta: "開始遊戲",
  },
  acts: [
    {
      id: 0,
      icon: "🤝",
      title: "第一階段：結識夥伴",
      intro:
        "在光農合作社真正成立之前，你只是一個對「食物從哪裡來」感到不安的人。要組成一個生產者與消費者共同合作的合作社，得先找到願意一起走這條路的人——這是最容易被忽略、卻也最關鍵的起點。",
      outro:
        "經過幾個月的接觸、嘗試與磨合，你身邊逐漸聚集了一群理念相近、彼此信任的人：幾位願意嘗試的小農、一群真心關心食物來源的鄰居。是時候把這群人正式組織起來，成立「光農合作社」了。",
      events: [
        {
          id: "0-1",
          title: "要怎麼開始找人？",
          situation:
            "你想找到第一批願意一起嘗試的人，但不知道從何開始：是要大聲宣傳，還是先從最信任的人下手？",
          options: [
            {
              label: "辦一場小型的產地餐桌體驗活動，邀請鄰居朋友實際嘗嘗小農的作物",
              effects: { trust: 10, consumerSat: 5, finance: -5 },
              feedback:
                "比起說一百句「這個很好吃」，讓人親自嘗過一次更有說服力。人數不多，但每個人都留下了具體的印象。",
              unlock: ["communitytriangle"],
            },
            {
              label: "在社群媒體與社區佈告欄大量宣傳，盡量觸及最多人",
              effects: { consumerSat: 5, trust: -5, finance: -5 },
              feedback:
                "觸及的人數確實變多了，但多半只是被「便宜」、「新奇」吸引的短暫興趣，還稱不上真正認同理念的夥伴。",
              unlock: ["reasons"],
            },
            {
              label: "先去找相熟的小農聊聊，從產地端建立起第一個節點",
              effects: { producerRel: 15, finance: -5 },
              feedback:
                "農民願意聽你把話說完，是因為信任早就在日常往來中累積。從產地端切入，讓你第一手理解生產者真正的困境。",
              unlock: ["smallfarmer"],
            },
            {
              label: "什麼都先不做，等有興趣的人自己主動來找你",
              effects: { trust: -5, finance: -5 },
              feedback:
                "沒有踏出第一步，機會也不會自己上門。合作從來不是等出來的，而是一次次主動接觸累積出來的。",
              unlock: [],
            },
          ],
        },
        {
          id: "0-2",
          title: "第一次跟小農談契作條件",
          situation:
            "你找到一位願意聽你說話的農民，但對方對「合作社」這種新模式半信半疑，擔心又是一次「畫大餅」。",
          options: [
            {
              label: "誠實說明現在什麼都還沒有，只有一個構想，邀請對方一起共同設計規則",
              effects: { producerRel: 15, trust: 10, finance: -5 },
              feedback:
                "坦白說「我們還在摸索」，反而比誇下海口更容易建立信任。對方願意一起把規則從零磨出來，這份參與感本身就是承諾的開始。",
              unlock: ["reasons"],
            },
            {
              label: "承諾保證收購價與數量，先讓對方安心加入",
              effects: { producerRel: 10, finance: -10, trust: -5 },
              feedback:
                "對方確實比較放心加入了，但你其實還沒有能力兌現這個承諾。過度浪漫的起步，往往是後續信任崩解的伏筆。",
              unlock: [],
            },
            {
              label: "找已經合作過的其他小農幫忙背書、介紹",
              effects: { producerRel: 10, trust: 5 },
              feedback:
                "熟人的引薦，讓陌生的提案多了一層社會擔保。信任的建立，往往仰賴既有的社會網絡，而不是從零開始說服。",
              unlock: ["trustdistance"],
            },
            {
              label: "先簽一份簡單的書面備忘錄，把雙方的期待寫清楚",
              effects: { producerRel: 10, democracy: 5, finance: -5 },
              feedback:
                "白紙黑字不代表沒有人情，反而讓雙方對彼此的角色與期待，從一開始就有共同的參照點。",
              unlock: ["prototype"],
            },
          ],
        },
        {
          id: "0-3",
          title: "消費端的第一批種子成員從哪裡來？",
          situation:
            "你想找到第一批「消費者」種子成員，不只是想要便宜的人，而是真的認同這個理念、願意一起參與的人。",
          options: [
            {
              label: "從自己身邊真正認同食物議題的朋友開始邀約，人數少但認同高",
              effects: { trust: 15, consumerSat: 5, finance: -5 },
              feedback:
                "起步的人數不多，但每一個人都是因為認同而留下來，這樣的種子成員，日後比較不容易在困難時刻退出。",
              unlock: ["reasons"],
            },
            {
              label: "辦一場理念說明會，篩選出真正有共鳴的人",
              effects: { democracy: 10, trust: 10, finance: -5 },
              feedback:
                "說明會不只是招募，也是第一次讓大家練習「一起討論」的場合，這對之後的民主治理是很好的暖身。",
              unlock: ["communitytriangle"],
            },
            {
              label: "只強調「比市價便宜」，快速衝高人數",
              effects: { consumerSat: 10, finance: 5, trust: -15 },
              feedback:
                "人數很快就衝上去了，但只被價格吸引來的人，也最容易在需要一起承擔勞動或責任時悄悄消失。",
              unlock: ["freerider"],
            },
            {
              label: "來者不拒，完全不特別篩選",
              effects: { finance: 10, trust: -10, democracy: -5 },
              feedback:
                "規模快速成長，但這群人對「為什麼要合作」的理解落差很大，日後很容易出現「反正會有別人做」的心態。",
              unlock: ["bystander"],
            },
          ],
        },
        {
          id: "0-4",
          title: "要不要現在就正式登記為合作社？",
          situation:
            "討論到這裡，大家開始問：我們現在是不是該正式登記，還是再多累積一點默契比較保險？",
          options: [
            {
              label: "先用非正式的讀書會、共購社群運作幾個月，測試彼此的默契",
              effects: { trust: 15, democracy: 5, finance: -5 },
              feedback:
                "多花幾個月磨合，看起來慢，其實是把後面可能踩到的地雷提前排除。信任的文化需要時間累積，急不得。",
              unlock: ["nordic"],
            },
            {
              label: "現在就去登記，趁大家士氣正旺",
              effects: { finance: 5, trust: -10, democracy: -10 },
              feedback:
                "熱情很寶貴，但光靠熱情撐起來的組織，遇到第一次真正的分歧，往往就會發現規則與默契都還沒準備好。",
              unlock: [],
            },
            {
              label: "邀請有經驗的合作社輔導員或顧問，協助評估時機",
              effects: { democracy: 10, trust: 5, finance: -10 },
              feedback:
                "外部視角能幫你看見自己人容易忽略的盲點，這筆顧問費用，換來的是少走一些冤枉路。",
              unlock: ["orgadvantage"],
            },
            {
              label: "先寫一份簡單的章程草案，讓大家一起討論、修改",
              effects: { democracy: 15, trust: 5, finance: -5 },
              feedback:
                "章程草案讓抽象的「大家一起決定」變成具體可以逐條討論的文字，也是日後民主治理的第一份共同文件。",
              unlock: ["prototype"],
            },
          ],
        },
      ],
      quiz: {
        id: "0-quiz",
        title: "起步前的自我提問",
        situation:
          "有共同需求，就一定能順利合作嗎？在正式成立之前，有幾個問題值得先問清楚：為什麼需要合作社？誰需要合作社？合作社是誰的？服務誰？你會怎麼回答第一批夥伴的疑問？",
        options: [
          {
            label: "只要大家有共同需求，自然就會順利合作",
            effects: { democracy: -10, trust: -5 },
            feedback:
              "這是最常見的迷思。共同需求只是合作的起點，不是保證——搭便車效應、旁觀者效應這些真實的挑戰，不會因為理念相近就自動消失。",
            unlock: ["reasons"],
          },
          {
            label: "先把這四個問題想清楚，把答案攤開來跟大家討論",
            effects: { democracy: 15, trust: 10 },
            feedback:
              "把「為什麼、誰、屬於誰、服務誰」攤開來討論，等於是在還沒正式成立前，就先練習了一次民主決策。",
            unlock: ["reasons"],
          },
          {
            label: "這些之後再說，先把人湊齊比較重要",
            effects: { trust: -10, democracy: -5 },
            feedback:
              "人數確實重要，但如果連「為什麼要合作」都還說不清楚，湊齊的人越多，日後的意見分歧可能也越大。",
            unlock: [],
          },
          {
            label: "找幾位比較熟的核心成員先討論出共識，再說服其他人接受",
            effects: { democracy: -5, trust: 5 },
            feedback:
              "核心小圈圈先有共識，效率確實比較高，但如果之後沒有真正攤開來讓所有人參與討論，就已經埋下權力集中的種子。",
            unlock: ["communitytriangle"],
          },
        ],
      },
    },
    {
      id: 1,
      icon: "🧺",
      title: "第二階段：共同採購",
      intro:
        "你和一群關心食物來源的鄰居、幾位契作小農，決定籌組「光農合作社」——一個「生產者＋消費者」共同合作的合作社。最簡單的起步方式，是先從共同採購開始：集體下單、分擔行政與運載成本。",
      outro:
        "共同採購穩定運作幾個月後，大家開始討論：與其只是集體下單，能不能繞過中間商，直接把產地的東西送上餐桌？光農合作社準備進入下一階段。",
      events: [
        {
          id: "1-1",
          title: "有人從不參加分裝，卻照樣領貨",
          situation:
            "共購貨到的日子需要有人一起分裝、秤重、通知取貨。有位社員每次都缺席，卻照樣準時來領走自己那份，其他人開始在群組裡抱怨不公平。",
          options: [
            {
              label: "訂立勞動時數規則，未達標者需補繳服務費",
              effects: { democracy: 15, finance: 5, trust: -5 },
              feedback:
                "明確的規則讓「該不該出力」不再靠感情勒索，而是白紙黑字的共識。短期內會有人不開心，但長期看，這是合作社從人情走向制度的第一步。",
              unlock: ["laidlaw"],
            },
            {
              label: "睜一隻眼閉一隻眼，先求和氣",
              effects: { trust: 5, democracy: -10, consumerSat: -10 },
              feedback:
                "表面上維持了和諧，但願意出力的人心裡都記了一筆帳。當「反正有人會做」變成常態，責任感會被悄悄稀釋。",
              unlock: ["bystander"],
            },
            {
              label: "召開社員大會，公開討論怎麼訂規則",
              effects: { trust: 15, democracy: 10, finance: -5 },
              feedback:
                "花了一整個週末開會，比想像中更耗時，但規則是大家一起訂的，之後也比較沒有人有異議可提。",
              unlock: ["freerider", "geese"],
            },
            {
              label: "設計時間銀行制度，把付出的勞動時數換算成可折抵的點數",
              effects: { democracy: 10, trust: 10, finance: -5 },
              feedback:
                "時間銀行把「該不該出力」的道德爭議，轉換成透明可計算的交換機制，呼應合作不是靠道德勸說，而是靠可回應的制度設計。",
              unlock: ["reasons"],
            },
          ],
        },
        {
          id: "1-2",
          title: "記帳的人總是拖延",
          situation:
            "當初自願負責記帳、對帳的發起人，最近工作忙碌，帳目經常拖到隔週才更新，社員開始搞不清楚自己到底該收多少錢、付多少錢。",
          options: [
            {
              label: "安排共同分工與備援機制，讓兩人以上熟悉帳務",
              effects: { democracy: 10, trust: 10, finance: -5 },
              feedback:
                "培訓備援人力需要一點時間成本，但合作社的運作不再只綁在一個人身上，抗風險能力提高了。",
              unlock: ["bucket"],
            },
            {
              label: "直接換人做，找一個比較有空的人接手",
              effects: { finance: 10, trust: -15, democracy: -5 },
              feedback:
                "帳目立刻恢復正常，但原本自願付出的發起人覺得自己被「撤換」，心裡留下疙瘩，也讓其他人開始擔心自己會不會哪天也被這樣對待。",
              unlock: [],
            },
            {
              label: "先放著，畢竟是自願服務，不好意思催",
              effects: { trust: -15, consumerSat: -10, finance: -5 },
              feedback:
                "帳務持續拖延，社員對合作社的信任一點一滴流失。整體表現被這個最弱的環節拖累，而不是被最積極的人拉抬。",
              unlock: ["bucket"],
            },
            {
              label: "導入簡單的雲端共用試算表，讓所有人都能即時看到帳目",
              effects: { democracy: 10, trust: 5, finance: 5 },
              feedback:
                "當帳目變得人人可見，不再只有一個人知道發生什麼事，信任的基礎就不再只靠人品，而是靠透明。",
              unlock: ["laidlaw"],
            },
          ],
        },
        {
          id: "1-3",
          title: "中盤商又壓低了收購價",
          situation:
            "契作的小農反映，中盤商這一季又壓低了收購價，但你們在市場上買到的零售價格卻完全沒有下降。社員開始討論：要不要試著繞過中盤，直接跟農民談。",
          options: [
            {
              label: "直接與小農契作，共同議定合理價格",
              effects: { producerRel: 15, consumerSat: 10, finance: -10 },
              feedback:
                "少了中間商，生產者拿到更合理的收入，消費者也吃得更安心。代價是合作社得自己處理倉儲與物流，前期成本增加不少。",
              unlock: ["oceanspray"],
            },
            {
              label: "先維持現狀，觀望市場變化",
              effects: { producerRel: -10, finance: 5 },
              feedback:
                "短期帳面沒有壓力，但契作的小農開始猶豫，是不是該把貨轉賣給出價更高、更積極的其他通路。",
              unlock: [],
            },
            {
              label: "邀請生產者代表加入採購決策會議",
              effects: { democracy: 15, producerRel: 10, finance: -5 },
              feedback:
                "生產者第一次真正參與定價討論，而不只是被動接受條件。決策變複雜了一些，但彼此的理解也深了一層。",
              unlock: ["principles"],
            },
            {
              label: "暫時忍受現況，但開始有系統地記錄成本與價格落差",
              effects: { producerRel: 5, trust: 5, finance: -5 },
              feedback:
                "資料本身不會立刻改變現況，但把「農民賤賣、消費者貴買」的落差量化下來，會是日後談判最有力的籌碼。",
              unlock: ["pricegap"],
            },
          ],
        },
        {
          id: "1-4",
          title: "入社門檻要怎麼設計？",
          situation:
            "越來越多人想加入，理監事會需要決定：要不要收取入社費、要不要要求社員每月投入一定的勞動時數？",
          options: [
            {
              label: "適度入社費，加上每月幾小時的服務時數",
              effects: { finance: 15, democracy: 10, consumerSat: -5 },
              feedback:
                "門檻篩掉了一部分只想「便宜買東西」的人，留下來的社員對合作社的承諾感明顯更高。",
              unlock: ["parkslope", "beescoop"],
            },
            {
              label: "完全免費、零門檻，越多人加入越好",
              effects: { consumerSat: 10, finance: -15, democracy: -10 },
              feedback:
                "短期內人數暴增，大家都很開心。但沒有任何承諾機制，願意實際參與治理與勞動的比例反而下降。",
              unlock: [],
            },
            {
              label: "設高額入社費，並依股金比例分紅",
              effects: { finance: 20, consumerSat: -15, democracy: -15, trust: -5 },
              feedback:
                "財務立刻寬裕不少，但合作社開始像一間小型投資公司，而不是一群為了共同需求而集結的人。一人一票的精神正在被稀釋。",
              unlock: [],
            },
            {
              label: "依身份不同設計差異化門檻：生產者以實物或服務出資，消費者以現金入股",
              effects: { finance: 10, producerRel: 10, democracy: 5 },
              feedback:
                "門檻不必然是單一標準。讓不同角色用各自能負擔的方式參與，更貼近生產者與消費者原本就不同的現實條件。",
              unlock: ["prototype"],
            },
          ],
        },
      ],
      quiz: {
        id: "1-quiz",
        title: "民主健檢：多數決就等於民主嗎？",
        situation:
          "理監事會針對某項採購規則做出多數決，但事前沒有先讓所有社員參與討論。這樣算是民主的決策嗎？",
        options: [
          {
            label: "算，反正多數已經同意了",
            effects: { democracy: -10 },
            feedback:
              "學者 Laidlaw 提醒：民主的關鍵不是「幹部之間有沒有共識」，而是決策是否源自基層、資訊是否公開給所有社員。只在理監事之間達成共識，並不足夠。",
            unlock: ["laidlaw"],
          },
          {
            label: "不完全算，重點是人人都要有參與的機會，而不是人人都要同意",
            effects: { democracy: 15, trust: 5 },
            feedback:
              "正是如此。真正的民主不需要每個人意見一致，但需要每個人都有機會被聽見、被說服，或是提出異議。",
            unlock: ["laidlaw"],
          },
          {
            label: "不確定，先提交社員大會確認",
            effects: { democracy: 10, finance: -5 },
            feedback:
              "多花了一些時間，但把決定權交還給社員大會，本身就是一種對民主原則的實踐。",
            unlock: ["laidlaw"],
          },
          {
            label: "先確認這項決定未來是否有機會被覆議或推翻",
            effects: { democracy: 10 },
            feedback:
              "民主不是一次表決就永遠定案。保留覆議與修正的空間，本身也是對民主原則的一種實踐。",
            unlock: ["laidlaw"],
          },
        ],
      },
    },
    {
      id: 2,
      icon: "🏷️",
      title: "第三階段：共同銷售與品牌",
      intro:
        "共同採購站穩腳步後，光農合作社開始有能力繞過中間商，建立自己的銷售通路與品牌，把「產地到餐桌」的距離真正縮短。規模變大了，決策也變得更複雜。",
      outro:
        "銷售規模穩定成長，社員們開始想像更大的可能：如果能自己投資加工設備，是不是能創造更多附加價值？合作社準備進入最後一個階段。",
      events: [
        {
          id: "2-1",
          title: "最能幹的那個人，開始一手主導一切",
          situation:
            "其中一位創辦人人脈最廣、最懂通路，漸漸地，採購與銷售的重大決定都變成他一個人拍板，其他理監事開始只是「舉手附議」。",
          options: [
            {
              label: "建立任期制與輪替規則，訓練其他人接手",
              effects: { democracy: 15, trust: 5, finance: -5 },
              feedback:
                "短期內效率打了折扣，但權力不再綁在一個人身上，合作社的存續不會因為一個人的離開而動搖。",
              unlock: [],
            },
            {
              label: "能者多勞，這樣運作起來比較有效率",
              effects: { finance: 15, democracy: -20 },
              feedback:
                "業績確實成長得更快，但決策的自治精神正在悄悄流失。當這個人離開或做錯決定時，合作社將毫無準備。",
              unlock: [],
            },
            {
              label: "增設監事會與申訴調解機制，制衡決策權",
              effects: { democracy: 10, trust: 10, finance: -5 },
              feedback:
                "制度性的制衡機制建立起來了，即使能力出眾的人也需要對社員負責。",
              unlock: ["principles"],
            },
            {
              label: "引入外部治理顧問，協助設計權責分工與決策流程",
              effects: { democracy: 10, trust: 5, finance: -10 },
              feedback:
                "組織化本身就是一種優勢：讓具有同質需求的人成為市場組織的所有者，而不是依賴單一能人。外部視角有時比內部人情更容易打破僵局。",
              unlock: ["orgadvantage"],
            },
          ],
        },
        {
          id: "2-2",
          title: "要共創一個品牌，還是各自銷售？",
          situation:
            "契作的幾位農民生產的作物略有差異，社員討論：要統一打造一個合作社共同品牌，還是讓每位生產者用自己的名字個別銷售？",
          options: [
            {
              label: "共創品牌，建立統一的分潤機制",
              effects: { finance: 10, producerRel: 10, consumerSat: 5, democracy: -5 },
              feedback:
                "共同品牌讓合作社在市場上更有辨識度，但分潤機制需要更複雜的討論與共識，決策時間拉長了。",
              unlock: ["oceanspray"],
            },
            {
              label: "維持各自品牌，各自銷售",
              effects: { producerRel: -5, finance: -5 },
              feedback:
                "尊重了每位生產者的獨立性，但也失去了規模經濟——採購與行銷成本無法一起分攤。",
              unlock: [],
            },
            {
              label: "由核心團隊主導品牌決策，效率優先",
              effects: { finance: 10, democracy: -15, trust: -5 },
              feedback:
                "品牌很快就上市，但生產者與一般社員對這個「別人幫我決定」的品牌，認同感明顯偏低。",
              unlock: [],
            },
            {
              label: "採混合模式：核心產品共用品牌，特色產品保留個別生產者品牌",
              effects: { finance: 5, producerRel: 10, consumerSat: 5 },
              feedback:
                "混合模式保留了彈性，讓規模經濟與個別特色可以並存，但也考驗治理是否成熟到能處理更細緻的分潤規則。",
              unlock: ["oceanspray"],
            },
          ],
        },
        {
          id: "2-3",
          title: "要不要開放非社員也能用批發價採購？",
          situation:
            "管理層提案修改章程：開放非社員也能以接近批發的價格採購，藉此衝高營業額。這件事牽動合作社「只服務社員」的根本精神。",
          options: [
            {
              label: "交付社員大會表決，即使可能被否決",
              effects: { democracy: 20, trust: 10, finance: -5 },
              feedback:
                "這正是瑞士零售合作社 Migros 面對章程修改時的做法——把最終決定權交還給全體社員，即使結果可能不如管理層預期。",
              unlock: ["migros"],
            },
            {
              label: "理事會討論通過即可，不用麻煩全體社員",
              effects: { finance: 10, democracy: -20, trust: -10 },
              feedback:
                "決策效率提高了，但社員開始感覺，合作社的重大方向已經不再需要他們。",
              unlock: [],
            },
            {
              label: "交由少數創始元老私下拍板",
              effects: { trust: -15, democracy: -25 },
              feedback:
                "決定很快出爐，但「少數人說了算」的印象一旦形成，會員主權的核心精神就已經名存實亡。",
              unlock: [],
            },
            {
              label: "先做小範圍試辦，蒐集實際數據後再交付正式表決",
              effects: { democracy: 10, trust: 5, finance: -5 },
              feedback:
                "用實驗取代空談，讓最終的表決建立在真實數據之上，而不只是立場之爭。",
              unlock: ["migros"],
            },
          ],
        },
        {
          id: "2-4",
          title: "生產者要漲價，消費者嫌太貴",
          situation:
            "生產成本上漲，契作農民希望調高收購價；同時消費者社員反映零售價已經偏高，希望不要再漲。雙方的代表在會議上僵持不下。",
          options: [
            {
              label: "公開透明的成本核算，雙方共同協商合理價格",
              effects: { trust: 15, producerRel: 10, consumerSat: 10, finance: -5 },
              feedback:
                "把成本結構攤開來看，雙方才發現彼此面對的壓力其實是同一件事的兩面。共同協商比互相猜忌更快找到平衡點。",
              unlock: ["exchange"],
            },
            {
              label: "各退一步，各打五十大板",
              effects: { trust: 5, producerRel: 0, consumerSat: 0 },
              feedback:
                "雙方都不滿意，但也都能接受，衝突暫時被壓下來，但根本的成本問題並沒有真正解決。",
              unlock: [],
            },
            {
              label: "由管理層片面決定價格",
              effects: { democracy: -15, trust: -10, producerRel: -5, consumerSat: -5 },
              feedback:
                "價格是定下來了，但雙方都覺得自己的聲音沒有被聽見，對合作社「共同決定」的信任又少了一分。",
              unlock: [],
            },
            {
              label: "邀請中立的第三方（例如學者或 NGO）協助雙方進行成本試算與協商",
              effects: { trust: 10, producerRel: 5, consumerSat: 5, finance: -5 },
              feedback:
                "中立第三方能降低雙方各說各話的猜疑，讓協商聚焦在事實，而不是誰比較會吵。",
              unlock: ["exchange"],
            },
          ],
        },
      ],
      quiz: {
        id: "2-quiz",
        title: "民主健檢：重大方向該由誰決定？",
        situation:
          "合作社要修改章程、開放非社員也能用批發價採購。這牽動了合作社「只服務社員」的立社精神，這種等級的決定，該由誰拍板？",
        options: [
          {
            label: "理事會討論通過即可，反正是專業經營判斷",
            effects: { democracy: -15, finance: 5 },
            feedback:
              "效率是提高了，但重大方向性的決定如果繞過社員，合作社的所有權精神就只是一句口號。",
            unlock: ["migros"],
          },
          {
            label: "交付全體社員表決，即使可能被否決",
            effects: { democracy: 20, trust: 10 },
            feedback:
              "在民主裡，專家與經營者是提供建議與意見的人，但真正的決定者，應該是社員自己。",
            unlock: ["migros"],
          },
          {
            label: "交給少數資深元老拍板，比較有經驗",
            effects: { democracy: -20, trust: -10 },
            feedback:
              "經驗很寶貴，但當「少數人說了算」變成慣例，合作社離權力集中的失敗模式就不遠了。",
            unlock: [],
          },
          {
            label: "交由社員代表組成的專案小組先評估，再提交社員大會核可",
            effects: { democracy: 15, trust: 5, finance: -5 },
            feedback:
              "專案小組能先做專業把關，但最終仍尊重社員大會的核可權，兼顧了效率與民主。",
            unlock: ["migros"],
          },
        ],
      },
    },
    {
      id: 3,
      icon: "🏭",
      title: "第四階段：共同信貸與加工整合",
      intro:
        "銷售規模穩定成長，光農合作社開始有能力思考更大的可能：投入集體信貸、蓋自己的加工場，把初級農產品變成更有附加價值的商品，甚至打進更大的市場。",
      outro:
        "走到這一步，光農合作社已經不只是一群人共同買東西，而是一整條從產地到餐桌、由生產者與消費者共同擁有的價值鏈。它會走向什麼樣的未來，取決於這一路上做的每一個選擇。",
      events: [
        {
          id: "3-1",
          title: "要不要集資蓋一座共同加工場？",
          situation:
            "有機會投資興建一座共同的分級包裝與初級加工設施，能大幅提升產品的附加價值，但需要一筆不小的集體資金。",
          options: [
            {
              label: "全體社員共同出資，分擔風險也分享未來收益",
              effects: { finance: 15, producerRel: 15, trust: -5 },
              feedback:
                "這正是北美蔓越莓合作社 Ocean Spray 當年走過的路：從共同生產果醬起步，逐步投資加工，最終讓生產者作為所有權人，享有加工後的完整利潤。短期內大家對這筆投資會有點緊張，長期卻是規模化的關鑰。",
              unlock: ["oceanspray"],
            },
            {
              label: "向銀行貸款，不動用社員自己的資金",
              effects: { finance: 10, democracy: -5 },
              feedback:
                "社員的財務壓力小了，但合作社開始受制於外部債權人的條件與期程，自主性打了折扣。",
              unlock: [],
            },
            {
              label: "先觀望，維持現狀就好",
              effects: { finance: -10, producerRel: -5 },
              feedback:
                "沒有冒險，也沒有錯過任何立即的損失，但合作社也錯過了一次規模化、提高生產者利潤的機會。",
              unlock: [],
            },
            {
              label: "分階段投資：先蓋小規模試驗線，成功了再擴大",
              effects: { finance: 10, producerRel: 10, trust: 5 },
              feedback:
                "分階段投資對應的正是從共同採購到共同信貸的漸進式邏輯，用比較小的風險，換取驗證方向的機會。",
              unlock: ["threestages"],
            },
          ],
        },
        {
          id: "3-2",
          title: "規模擴大了，要不要快速吸收新社員？",
          situation:
            "加工場開始運作後，越來越多新的生產者與消費者想要加入。快速擴張能帶來更大的規模經濟，但也可能稀釋原本的共同文化。",
          options: [
            {
              label: "建立新人培力機制，慢慢融入既有的治理文化",
              effects: { democracy: 15, trust: 10, finance: -5 },
              feedback:
                "擴張的速度慢了一些，但新加入的人真正理解合作社為什麼是現在這個樣子，而不只是把它當成一個便宜的通路。",
              unlock: ["principles"],
            },
            {
              label: "來者不拒，盡快擴大規模",
              effects: { finance: 15, trust: -15, democracy: -10 },
              feedback:
                "規模衝得很快，但新舊社員對「我們為什麼要合作」的理解出現落差，內部開始出現看不見的裂痕。",
              unlock: [],
            },
            {
              label: "維持小規模，不特別對外招募",
              effects: { trust: 5, finance: -10 },
              feedback:
                "共同文化維持得很好，但合作社的成長也停滯了下來，錯過了進一步壓低成本、提高議價力的機會。",
              unlock: ["geese"],
            },
            {
              label: "設計分級會籍，新加入者先成為「預備社員」，觀察一段時間才取得表決權",
              effects: { democracy: 10, trust: 10, finance: 5 },
              feedback:
                "分級會籍讓規模擴張與治理穩定不必然衝突，這是許多國際合作社在快速成長階段常用的緩衝設計。",
              unlock: ["coopmap"],
            },
          ],
        },
        {
          id: "3-3",
          title: "生產者與消費者社員起了嚴重爭執，卻沒人出面調解",
          situation:
            "一項關於加工場產能分配的決策，讓生產者代表與消費者代表的意見嚴重分歧。合作社沒有任何既定的調解機制，衝突開始在社群裡擴大延燒。",
          options: [
            {
              label: "建立常設的申訴與調解委員會",
              effects: { democracy: 15, trust: 15, finance: -5 },
              feedback:
                "有了明確的調解管道，衝突不再只能靠情緒或人情硬撐過去，而是有制度可以依循。",
              unlock: ["laidlaw"],
            },
            {
              label: "請創辦人私下出面協調",
              effects: { trust: 5, democracy: -10 },
              feedback:
                "衝突暫時被壓下來了，但決定過程不透明，讓部分社員覺得事情又是「私下喬好」的。",
              unlock: [],
            },
            {
              label: "先冷處理，希望時間會淡化這件事",
              effects: { trust: -20, consumerSat: -10 },
              feedback:
                "問題沒有消失，只是被延後，而且在延後的過程中持續發酵，侵蝕彼此的信任。",
              unlock: ["bucket"],
            },
            {
              label: "先讓雙方代表小範圍協商，協商不成才進入正式調解程序",
              effects: { democracy: 10, trust: 10 },
              feedback:
                "先小範圍協商、再升級為正式調解，是很多治理成熟的組織常見的分層爭議解決設計，兼顧了效率與正式性。",
              unlock: ["laidlaw"],
            },
          ],
        },
        {
          id: "3-4",
          title: "創社的初衷，下一代還記得嗎？",
          situation:
            "合作社已經運作了好幾年，越來越多新加入的社員從沒參與過當初「為什麼要合作」的討論，只把合作社當成一個買東西比較便宜的地方。",
          options: [
            {
              label: "建立教育培訓機制，主動向新社員傳遞創社價值",
              effects: { democracy: 10, trust: 10, finance: -5 },
              feedback:
                "教育與培訓，本來就是國際合作社原則裡不可或缺的一環。價值觀需要被主動傳遞，不會自己遺傳下去。",
              unlock: ["principles"],
            },
            {
              label: "假設新人自然而然會慢慢懂",
              effects: { democracy: -10, trust: -5 },
              feedback:
                "價值觀不會憑空傳承。當創社者逐漸淡出，沒有人記得「為什麼」，合作社很容易退化成一般的商業組織。",
              unlock: [],
            },
            {
              label: "寫一本書面手冊，但不特別主動宣講",
              effects: { democracy: 5 },
              feedback:
                "至少留下了紀錄，但沒有人真正讀完它。書面文件本身，無法取代面對面的參與感。",
              unlock: [],
            },
            {
              label: "邀請創社元老與新社員配對成為「傳承夥伴」，一對一分享經驗",
              effects: { democracy: 5, trust: 15, finance: -5 },
              feedback:
                "比起制式的教育訓練，一對一的傳承關係更容易建立起真實的情感連結，也更容易讓價值觀真正被記住。",
              unlock: ["principles"],
            },
          ],
        },
      ],
      quiz: {
        id: "3-quiz",
        title: "民主健檢：理監事已經連任十年了",
        situation:
          "合作社成長後，理監事會的成員已經連任十年，新加入的年輕社員普遍反映參與感很低，覺得自己說什麼都不會被真的採納。",
        options: [
          {
            label: "修改章程，建立任期限制與新人培力機制",
            effects: { democracy: 15, trust: 10, finance: -5 },
            feedback:
              "章程裡若能明訂幹部輪替，較能長期保持高水準的民主參與，而不是依賴少數人的個人意願。",
            unlock: ["laidlaw"],
          },
          {
            label: "維持現狀，資深的人比較有經驗、比較穩定",
            effects: { finance: 5, democracy: -15 },
            feedback:
              "短期內確實穩定，但這正是簡報中提到的合作社失敗模式之一：理監事固定化，讓治理逐漸失去代表性。",
            unlock: [],
          },
          {
            label: "直接開放全部職位重選，不設任何過渡機制",
            effects: { democracy: 10, trust: -15 },
            feedback:
              "民主的方向是對的，但沒有過渡機制的劇烈改組，容易讓資深社員感覺被否定，反而引發新的衝突。",
            unlock: [],
          },
          {
            label: "讓資深理監事擔任導師，陪伴培力新一屆候選人，而非直接留任或直接讓位",
            effects: { democracy: 15, trust: 10, finance: -5 },
            feedback:
              "世代交替不必然是「留任」或「重選」的二選一，導師制度讓經驗傳承與新陳代謝可以同時發生。",
            unlock: ["laidlaw"],
          },
        ],
      },
    },
  ],
};

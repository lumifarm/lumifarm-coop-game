# 從產地到餐桌：合作社經營模擬

一個給完全不了解合作社的人玩的線上小遊戲。透過扮演生產者＋消費者合作社的發起人，在「共同採購 → 共同銷售 → 共同信貸整合」三個階段中做抉擇，體會合作社如何經營、民主治理怎麼落實、又通常怎麼失敗。

內容改編自簡報《從產地到餐桌：如何經濟民主》，所有情境與案例皆為改寫詮釋，非逐字引用。詳見 [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)。

## 怎麼玩

不需要安裝任何工具，是純前端的靜態網頁：

- 直接雙擊 [index.html](index.html) 用瀏覽器開啟即可遊玩。
- 或用任何靜態伺服器（例如 GitHub Pages）部署後開啟。

## 專案結構

```
index.html         進入點
css/style.css       樣式
js/content.js       三階段的事件與抉擇內容
js/glossary.js      合作社小百科條目
js/state.js         指標運算、失敗與結局判定
js/ui.js            畫面渲染
js/main.js          遊戲流程控制
docs/GAME_DESIGN.md 完整設計文件
```

沒有建置流程、沒有相依套件，`js/` 內的檔案以一般 `<script>` 標籤依序載入。

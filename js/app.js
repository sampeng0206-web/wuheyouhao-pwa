// 全局籤詩資料
let fortunesData = [];
// 抽卡狀態鎖，防止動畫中重複點擊
let isDrawing = false;

// 每日限抽（已修改：移除 lastDrawDate 限制，僅回傳 lastId 以載入上一次內容）
function checkTodayDraw() {
  const lastId = localStorage.getItem('lastFortuneId');
  return { drawnToday: false, lastId: lastId };
}

// 抽籤
function drawFortune(fortunes) {
  const randomId = Math.floor(Math.random() * 108) + 1;
  const today = new Date();
  const todayStr = formatDate(today);
  localStorage.setItem('lastDrawDate', todayStr);
  localStorage.setItem('lastFortuneId', randomId);
  return fortunes.find(f => f.id === randomId);
}

// 語音（靜默處理 iOS 限制）
function playAudio() {
  const audio = new Audio('./audio/youhao.mp3');
  audio.play().catch(() => {});
}

// ----------------------------------------------------
// 2.0 升級版新增與修改邏輯
// ----------------------------------------------------

// 格式化日期為 YYYY-MM-DD
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 解析日期字串為 Date 物件
function parseDateString(dateStr) {
  const parts = dateStr.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// 更新連續打卡天數
function updateCheckInStreak() {
  const lastCheckInStr = localStorage.getItem('lastCheckInDate');
  let streakDays = parseInt(localStorage.getItem('streakDays'), 10) || 0;
  
  const today = new Date();
  const todayStr = formatDate(today);
  
  if (lastCheckInStr === todayStr) {
    // 今日已打卡過，不改變連續天數
    renderStreak(streakDays);
    return;
  }
  
  if (lastCheckInStr) {
    const lastDate = parseDateString(lastCheckInStr);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);
    
    if (lastCheckInStr === yesterdayStr) {
      streakDays += 1;
    } else {
      streakDays = 1;
    }
  } else {
    streakDays = 1;
  }
  
  localStorage.setItem('lastCheckInDate', todayStr);
  localStorage.setItem('streakDays', streakDays);
  
  renderStreak(streakDays);
}

// 渲染打卡天數與文案
function renderStreak(streakDays) {
  const streakDaysEl = document.getElementById('streak-days');
  const streakMessageEl = document.getElementById('streak-message');
  if (!streakDaysEl || !streakMessageEl) return;
  
  streakDaysEl.textContent = streakDays;
  
  if (streakDays === 0) {
    streakMessageEl.textContent = "🌱 點擊翻牌即可開始累積好運天數喔！";
  } else if (streakDays === 1) {
    streakMessageEl.textContent = "🌱 今天是你的第一天，好的開始！";
  } else if (streakDays === 7) {
    streakMessageEl.textContent = "🔥 連續 7 天！你正在建立好習慣！";
  } else if (streakDays === 30) {
    streakMessageEl.textContent = "⭐ 連續 30 天！小鶴為人驕傲！";
  } else if (streakDays === 100) {
    streakMessageEl.textContent = "🏆 傳說中的 100 天！你是舞鶴的守護者！";
  } else {
    streakMessageEl.textContent = `你已經連續相信自己 ${streakDays} 天了。今天也不要放棄。`;
  }
}

// 小遊戲寶物列表
const treasureList = [
  { name: "掃叭石柱的祝福碎片", emoji: "🪨" },
  { name: "舞鶴大山精靈的羽毛", emoji: "🪶" },
  { name: "古伊之泉的神聖水滴", emoji: "💧" },
  { name: "蜜香紅茶的幸運茶葉", emoji: "🍃" },
  { name: "小鶴飛翔留下的微光", emoji: "✨" },
  { name: "茄苳大樹的平靜葉片", emoji: "🌿" },
  { name: "阿美族獵人的勇氣石", emoji: "💎" },
  { name: "月桃葉編成的幸福籃", emoji: "🧺" },
  { name: "刺竹林的守護竹節", emoji: "🎋" },
  { name: "舞鶴台地的晨曦金光", emoji: "🌅" },
  { name: "小米酒的甜蜜泡泡", emoji: "🫧" },
  { name: "百合花的純潔花瓣", emoji: "🌸" }
];

// 小遊戲一：餵小鶴
function setupFeedCrane() {
  const feedBtn = document.getElementById('feed-crane-btn');
  const avatar = document.getElementById('crane-avatar');
  const dialog = document.getElementById('game-dialog');
  if (!feedBtn || !avatar || !dialog) return;
  
  const todayStr = formatDate(new Date());
  const fedDate = localStorage.getItem('craneFedDate');
  
  if (fedDate === todayStr) {
    feedBtn.disabled = true;
    feedBtn.textContent = "今天已餵過小鶴了 🕊";
    dialog.textContent = "ū-hó！今天能量滿滿！謝謝你～";
  } else {
    feedBtn.disabled = false;
    feedBtn.textContent = "🍵 給小鶴一杯蜜香紅茶";
  }
  
  feedBtn.addEventListener('click', () => {
    avatar.classList.add('spin');
    setTimeout(() => {
      avatar.classList.remove('spin');
    }, 600);
    
    dialog.textContent = "ū-hó！今天能量滿滿！謝謝你～";
    feedBtn.disabled = true;
    feedBtn.textContent = "今天已餵過小鶴了 🕊";
    localStorage.setItem('craneFedDate', todayStr);
  });
}

// 小遊戲二：今日尋寶
function setupTreasureHunt() {
  const chests = document.querySelectorAll('.chest-box');
  const toast = document.getElementById('treasure-toast');
  const chancesEl = document.getElementById('hunt-chances');
  if (chests.length === 0 || !toast || !chancesEl) return;
  
  const todayStr = formatDate(new Date());
  let huntDate = localStorage.getItem('huntDate');
  let huntCount = parseInt(localStorage.getItem('huntCount'), 10) || 0;
  
  if (huntDate !== todayStr) {
    huntCount = 0;
    localStorage.setItem('huntDate', todayStr);
    localStorage.setItem('huntCount', 0);
    localStorage.removeItem('openedChests');
  }
  
  let openedChests = JSON.parse(localStorage.getItem('openedChests')) || [false, false, false];
  
  chancesEl.textContent = 3 - huntCount;
  
  chests.forEach((chest, index) => {
    // 重置與設定狀態
    chest.classList.remove('opened', 'disabled');
    chest.textContent = "🎁";
    
    if (openedChests[index]) {
      chest.classList.add('opened');
      chest.textContent = "📂";
    } else if (huntCount >= 3) {
      chest.classList.add('disabled');
    }
    
    // 移除舊的 event listener 並綁定新的
    const newChest = chest.cloneNode(true);
    chest.parentNode.replaceChild(newChest, chest);
    
    newChest.addEventListener('click', () => {
      if (newChest.classList.contains('opened') || newChest.classList.contains('disabled') || huntCount >= 3) {
        return;
      }
      
      newChest.classList.add('opened');
      newChest.textContent = "📂";
      openedChests[index] = true;
      localStorage.setItem('openedChests', JSON.stringify(openedChests));
      
      const randomIndex = Math.floor(Math.random() * treasureList.length);
      const treasure = treasureList[randomIndex];
      
      toast.textContent = `✨ 你發現了：${treasure.name} ${treasure.emoji}！`;
      
      let collection = JSON.parse(localStorage.getItem('craneCollection')) || [];
      if (!collection.includes(treasure.name)) {
        collection.push(treasure.name);
        localStorage.setItem('craneCollection', JSON.stringify(collection));
      }
      
      huntCount += 1;
      localStorage.setItem('huntCount', huntCount);
      chancesEl.textContent = 3 - huntCount;
      
      if (huntCount >= 3) {
        document.querySelectorAll('.chest-box').forEach(c => {
          if (!c.classList.contains('opened')) {
            c.classList.add('disabled');
          }
        });
        toast.textContent = "今天的寶藏都找到了！明天再來 🕊";
      }
      
      renderCollectionGrid();
      checkMedalProgress();
    });
  });
}

// 渲染收集包 3x3 網格
function renderCollectionGrid() {
  const gridItems = document.querySelectorAll('#collection-grid .grid-item');
  if (gridItems.length === 0) return;
  
  const collection = JSON.parse(localStorage.getItem('craneCollection')) || [];
  
  gridItems.forEach((item, index) => {
    if (index < collection.length) {
      const name = collection[index];
      const match = treasureList.find(t => t.name === name);
      const emoji = match ? match.emoji : "🎁";
      item.className = "grid-item collected";
      item.innerHTML = `
        <span class="grid-item-emoji">${emoji}</span>
        <span class="grid-item-name">${name}</span>
      `;
    } else {
      item.className = "grid-item empty";
      item.textContent = "?";
    }
  });
}

// 檢查並顯示金色勳章
function checkMedalProgress() {
  const collection = JSON.parse(localStorage.getItem('craneCollection')) || [];
  const overlay = document.getElementById('medal-overlay');
  if (!overlay) return;
  
  const medalDismissed = localStorage.getItem('medalDismissed') === 'true';
  if (collection.length >= 9 && !medalDismissed) {
    overlay.style.display = 'flex';
  }
}

// 設定勳章關閉按鈕
function setupMedalDismiss() {
  const closeBtn = document.getElementById('medal-close-btn');
  const overlay = document.getElementById('medal-overlay');
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
      localStorage.setItem('medalDismissed', 'true');
    });
  }
}

// 4-A：渲染幸運指數
function renderLuckIndex(fortune) {
  const loveEl = document.getElementById('luck-love');
  const moneyEl = document.getElementById('luck-money');
  const workEl = document.getElementById('luck-work');
  const moodEl = document.getElementById('luck-mood');
  if (!loveEl || !moneyEl || !workEl || !moodEl) return;
  
  const luck = fortune.luck || { love: 3, money: 3, work: 3, mood: 3 };
  
  loveEl.textContent = '★'.repeat(luck.love) + '☆'.repeat(5 - luck.love);
  moneyEl.textContent = '★'.repeat(luck.money) + '☆'.repeat(5 - luck.money);
  workEl.textContent = '★'.repeat(luck.work) + '☆'.repeat(5 - luck.work);
  moodEl.textContent = '★'.repeat(luck.mood) + '☆'.repeat(5 - luck.mood);
}

// 4-C：分享好運邏輯
function setupShareLuck(fortune) {
  const shareBtn = document.getElementById('share-luck-btn');
  const shareOptions = document.getElementById('share-options');
  const confirmBtn = document.getElementById('share-confirm-btn');
  const toast = document.getElementById('share-toast');
  if (!shareBtn || !shareOptions || !confirmBtn || !toast) return;
  
  // 重置狀態
  shareOptions.style.display = 'none';
  toast.textContent = '';
  
  shareBtn.onclick = () => {
    const isVisible = window.getComputedStyle(shareOptions).display !== 'none';
    shareOptions.style.display = isVisible ? 'none' : 'flex';
    toast.textContent = '';
  };
  
  confirmBtn.onclick = () => {
    const target = document.querySelector('input[name="shareTarget"]:checked')?.value || "朋友";
    const textToCopy = `🕊 小鶴帶路第${fortune.id}首\n\n「${fortune.quote}」\n\n心靈鶴湯：${fortune.interpretation}\n\n今日萬事 舞鶴✦\n—— 來自《今日舞鶴》\nhttps://sampeng0206-web.github.io/wuheyouhao-pwa/`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.textContent = "✅ 好運已複製！快貼給朋友吧～";
      setTimeout(() => {
        shareOptions.style.display = 'none';
        toast.textContent = '';
      }, 2500);
    }).catch(err => {
      console.error('複製失敗:', err);
      toast.textContent = "❌ 複製失敗，請手動複製";
    });
  };
}

// 108 小行動庫
const actionsList = [
  "今天對一個陌生人微笑",
  "去摸摸一棵樹或一株植物",
  "今天多喝一杯水",
  "讚美身邊的一個人",
  "今天不抱怨任何事",
  "給媽媽或爸爸傳一則溫暖訊息",
  "靜靜坐五分鐘，什麼都不做",
  "今天早點睡",
  "整理一個讓你煩躁的抽屜或桌面",
  "深呼吸三次，感謝自己還在",
  "今天吃一頓慢食，細嚼慢嚥",
  "去外面走走，看看天空",
  "今天說一句「謝謝你」給某人",
  "關掉手機螢幕五分鐘，感受當下",
  "今天做一件一直拖著沒做的小事",
  "給自己泡一杯茶，好好享受",
  "今天不比較，只欣賞自己",
  "寫下今天三件讓你感謝的小事",
  "今天早十分鐘出門，不要趕路",
  "抱抱你愛的人，或抱抱自己",
  "今天避免說負面的話",
  "找一首喜歡的歌，好好聆聽",
  "今天多走幾步路，不搭電梯",
  "給一個許久未聯絡的朋友傳訊問候",
  "今天做一件讓自己快樂的小事"
];

// 4-D：渲染與處理今日小行動
function renderTodayAction(fortune) {
  const actionDesc = document.getElementById('action-desc');
  const checkbox = document.getElementById('action-checkbox');
  const completeBtn = document.getElementById('action-complete-btn');
  const cardGlow = document.getElementById('action-card-glow');
  if (!actionDesc || !checkbox || !completeBtn || !cardGlow) return;
  
  const actionText = actionsList[fortune.id % 25];
  actionDesc.textContent = actionText;
  
  const todayStr = formatDate(new Date());
  const savedDate = localStorage.getItem('actionDoneDate');
  const isDone = savedDate === todayStr && localStorage.getItem('actionDoneId') === String(fortune.id);
  
  if (isDone) {
    checkbox.textContent = '☑';
    completeBtn.disabled = true;
    completeBtn.textContent = '已完成 ✔';
    cardGlow.classList.add('completed');
  } else {
    checkbox.textContent = '□';
    completeBtn.disabled = false;
    completeBtn.textContent = '我完成了！✔';
    cardGlow.classList.remove('completed');
  }
  
  completeBtn.onclick = () => {
    checkbox.textContent = '☑';
    completeBtn.disabled = true;
    completeBtn.textContent = '已完成 ✔';
    cardGlow.classList.add('completed');
    
    localStorage.setItem('actionDoneDate', todayStr);
    localStorage.setItem('actionDoneId', String(fortune.id));
    
    cardGlow.classList.add('glow-effect');
    
    const gameDialog = document.getElementById('game-dialog');
    if (gameDialog) {
      gameDialog.textContent = "🎉 太棒了！小鶴為你喝采！今日萬事舞鶴✦";
    }
    
    setTimeout(() => {
      cardGlow.classList.remove('glow-effect');
    }, 2000);
  };
}

// 地圖連環畫滑動點設置
function setupSlidingBook() {
  const viewport = document.querySelector('.slider-viewport');
  const dots = document.querySelectorAll('.slider-dots .dot');
  if (!viewport || dots.length === 0) return;
  
  viewport.addEventListener('scroll', () => {
    const scrollLeft = viewport.scrollLeft;
    const width = viewport.clientWidth;
    const pageIndex = Math.round(scrollLeft / width);
    
    dots.forEach((dot, index) => {
      if (index === pageIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  });
}

// ----------------------------------------------------
// 有好收藏與頁面切換邏輯
// ----------------------------------------------------

// 更新主頁愛心收藏按鈕的視覺狀態
function updateHeartButtonState(isSaved) {
  const favBtn = document.getElementById('fav-action-btn');
  if (!favBtn) return;
  const heartIcon = favBtn.querySelector('.heart-icon');
  const btnText = favBtn.querySelector('.fav-btn-text');
  
  if (isSaved) {
    favBtn.classList.add('is-saved');
    if (heartIcon) heartIcon.textContent = '♥';
    if (btnText) btnText.textContent = '已收藏';
  } else {
    favBtn.classList.remove('is-saved');
    if (heartIcon) heartIcon.textContent = '♡';
    if (btnText) btnText.textContent = '收藏這句話';
  }
}

// 處理主頁收藏按鈕點擊
function handleFavToggle() {
  const drawState = checkTodayDraw();
  if (!drawState.lastId) return;
  
  const currentId = parseInt(drawState.lastId, 10);
  const fortune = fortunesData.find(f => f.id === currentId);
  if (!fortune) return;
  
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  const index = favs.findIndex(f => f.id === currentId);
  
  if (index !== -1) {
    favs.splice(index, 1);
    updateHeartButtonState(false);
  } else {
    const todayStr = new Date().toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    favs.push({
      id: fortune.id,
      title: fortune.title,
      quote: fortune.quote,
      interpretation: fortune.interpretation,
      savedDate: todayStr
    });
    updateHeartButtonState(true);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favs));
}

// 渲染收藏頁面的卡片列表
function renderFavoritesList() {
  const container = document.getElementById('favorites-container');
  if (!container) return;
  
  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  container.innerHTML = '';
  
  if (favs.length === 0) {
    container.innerHTML = `
      <div class="empty-favorites">
        還沒有收藏，翻牌後點擊愛心即可收藏 🕊
      </div>
    `;
    return;
  }
  
  favs.forEach(item => {
    const cardEl = document.createElement('div');
    cardEl.className = 'fav-card';
    cardEl.innerHTML = `
      <h3 class="fav-card-title">${item.title}</h3>
      <blockquote class="fav-card-quote">${item.quote}</blockquote>
      <p class="fav-card-interpretation">${item.interpretation}</p>
      <div class="fav-card-footer">
        <span class="fav-card-date">收藏於 ${item.savedDate}</span>
        <button class="fav-card-remove-btn" onclick="removeFavorite(${item.id})">移除</button>
      </div>
    `;
    container.appendChild(cardEl);
  });
}

// 全域移除函數
window.removeFavorite = function(id) {
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  favs = favs.filter(f => f.id !== id);
  localStorage.setItem('favorites', JSON.stringify(favs));
  
  renderFavoritesList();
  
  const drawState = checkTodayDraw();
  if (drawState.lastId && parseInt(drawState.lastId, 10) === id) {
    updateHeartButtonState(false);
  }
};

// 設置多頁面切換
function setupNavigation() {
  const mainPage = document.getElementById('main-page');
  const favoritesPage = document.getElementById('favorites-page');
  const mapPage = document.getElementById('map-page');
  
  const navFavBtn = document.getElementById('nav-fav-btn');
  const navMapBtn = document.getElementById('nav-map-btn');
  const appLogo = document.getElementById('app-logo');
  
  const favBackBtn = document.getElementById('fav-back-btn');
  const mapBackBtn = document.getElementById('map-back-btn');
  
  function showPage(pageId) {
    document.querySelectorAll('.page-view').forEach(p => {
      p.classList.remove('active');
    });
    
    if (pageId === 'main') {
      mainPage.classList.add('active');
    } else if (pageId === 'favorites') {
      favoritesPage.classList.add('active');
      renderFavoritesList();
    } else if (pageId === 'map') {
      mapPage.classList.add('active');
    }
    
    window.scrollTo(0, 0);
  }
  
  if (navFavBtn) navFavBtn.addEventListener('click', () => showPage('favorites'));
  if (navMapBtn) navMapBtn.addEventListener('click', () => showPage('map'));
  if (appLogo) appLogo.addEventListener('click', () => showPage('main'));
  
  if (favBackBtn) favBackBtn.addEventListener('click', () => showPage('main'));
  if (mapBackBtn) mapBackBtn.addEventListener('click', () => showPage('main'));
}

// ----------------------------------------------------
// 頁面渲染與初始化
// ----------------------------------------------------

// 渲染籤詩內容到 DOM
function renderFortune(fortune) {
  const cardQuote = document.getElementById('card-quote');
  if (cardQuote) {
    cardQuote.textContent = fortune.quote;
  }

  const fortuneTitle = document.getElementById('fortune-title');
  const fortuneQuote = document.getElementById('fortune-quote');
  const fortuneInterpretation = document.getElementById('fortune-interpretation');

  if (fortuneTitle) fortuneTitle.textContent = fortune.title;
  if (fortuneQuote) fortuneQuote.textContent = fortune.quote;
  if (fortuneInterpretation) fortuneInterpretation.textContent = fortune.interpretation;

  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  const isSaved = favs.some(f => f.id === fortune.id);
  updateHeartButtonState(isSaved);
  
  // 2.0 升級版渲染項目
  renderLuckIndex(fortune);
  renderTodayAction(fortune);
  setupShareLuck(fortune);
}

// 處理抽籤點擊與正面點擊翻回背面的邏輯
function handleDraw() {
  if (isDrawing) return;
  
  const card = document.querySelector('.card');
  if (!card) return;

  // 1-D：若卡片已經是正面，再次點擊將其翻轉回背面
  if (card.classList.contains('is-flipped')) {
    isDrawing = true;
    card.classList.remove('is-flipped');
    setTimeout(() => {
      isDrawing = false;
    }, 1400); // 配合 1.4s 翻牌速度
    return;
  }

  isDrawing = true;

  // iOS 靜音播放解鎖
  const unlockAudio = new Audio('./audio/youhao.mp3');
  unlockAudio.muted = true;
  unlockAudio.play().then(() => {
    unlockAudio.pause();
  }).catch(() => {});

  if (fortunesData.length === 0) {
    isDrawing = false;
    return;
  }

  const fortune = drawFortune(fortunesData);
  if (fortune) {
    renderFortune(fortune);
    
    // 執行翻牌
    card.classList.add('is-flipped');
    setTimeout(() => { playAudio(); }, 400);

    // 4-B：更新連續打卡
    updateCheckInStreak();

    // 更新提示文字並展示解籤區（不自動滑動）
    setTimeout(() => {
      const tipText = document.getElementById('tip-text');
      const interpretationSection = document.getElementById('interpretation-section');
      
      if (tipText) {
        tipText.textContent = "舞鶴好心情送給您，再分享心靈鶴湯～";
        tipText.classList.remove('pulse');
      }
      if (interpretationSection) {
        interpretationSection.classList.add('show');
      }
      isDrawing = false;
    }, 1400); // 配合 1.4s 翻牌速度
  }
}

// 頁面載入初始化
async function initializeApp() {
  setupNavigation();
  setupSlidingBook();
  
  // 恢復與初始化小遊戲與打卡狀態
  setupFeedCrane();
  setupTreasureHunt();
  renderCollectionGrid();
  checkMedalProgress();
  setupMedalDismiss();
  
  // 恢復打卡天數顯示
  const savedStreak = parseInt(localStorage.getItem('streakDays'), 10) || 0;
  renderStreak(savedStreak);

  const favActionBtn = document.getElementById('fav-action-btn');
  if (favActionBtn) {
    favActionBtn.addEventListener('click', handleFavToggle);
  }

  try {
    const response = await fetch('./data/fortunes.json');
    if (!response.ok) {
      throw new Error(`無法載入籤詩資料，狀態碼: ${response.status}`);
    }
    fortunesData = await response.json();

    const drawState = checkTodayDraw();
    const cardScene = document.querySelector('.card-scene');
    const tipText = document.getElementById('tip-text');
    const interpretationSection = document.getElementById('interpretation-section');

    // 若過去有抽過籤，加載上一次籤詩內容直接顯示
    if (drawState.lastId) {
      const savedId = parseInt(drawState.lastId, 10);
      const fortune = fortunesData.find(f => f.id === savedId);
      if (fortune) {
        renderFortune(fortune);
        
        if (interpretationSection) {
          interpretationSection.classList.add('show');
        }
        
        if (tipText) {
          tipText.textContent = "舞鶴好心情送給您，再分享心靈鶴湯～";
          tipText.classList.remove('pulse');
        }
      }
    } else {
      if (tipText) {
        tipText.textContent = "舞鶴好心情送給您，再分享心靈鶴湯～";
        tipText.classList.add('pulse');
      }
    }
    
    // 綁定翻牌抽籤事件監聽
    if (cardScene) {
      cardScene.addEventListener('click', handleDraw);
    }
  } catch (error) {
    console.error('初始化應用程式失敗:', error);
    const tipText = document.getElementById('tip-text');
    if (tipText) {
      tipText.textContent = "載入失敗，請檢查網路連線 🕊";
    }
  }
}

// 監聽 DOM 載入
document.addEventListener('DOMContentLoaded', initializeApp);

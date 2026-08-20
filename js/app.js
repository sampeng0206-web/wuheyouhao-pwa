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
  
  // 每日登入時解鎖拼圖碎片
  unlockPuzzlePiecesForToday();
  
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
    streakMessageEl.textContent = "🌱 今天是你的第一天，萬事舞鶴的開始！";
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

// 小遊戲寶物列表 (擴充至 19 種，修正阿美族為撒奇萊雅族)
const treasureList = [
  { name: "掃叭石柱的祝福碎片", emoji: "🪨" },
  { name: "舞鶴大山精靈的羽毛", emoji: "🪶" },
  { name: "古伊之泉的神聖水滴", emoji: "💧" },
  { name: "蜜香紅茶的幸運茶葉", emoji: "🍃" },
  { name: "小鶴飛翔留下的微光", emoji: "✨" },
  { name: "茄苳大樹的平靜葉片", emoji: "🌿" },
  { name: "撒奇萊雅族獵人的勇氣石", emoji: "💎" },
  { name: "月桃葉編成的幸福籃", emoji: "🧺" },
  { name: "刺竹林的守護竹節", emoji: "🎋" },
  { name: "舞鶴台地的晨曦金光", emoji: "🌅" },
  { name: "小米酒的甜蜜泡泡", emoji: "🫧" },
  { name: "百合花的純潔花瓣", emoji: "🌸" },
  { name: "瑞穗牧場喝鮮乳", emoji: "🥛" },
  { name: "香積園的香積石", emoji: "🪨" },
  { name: "舞鶴山上彩虹橋", emoji: "🌈" },
  { name: "古伊之泉的守護", emoji: "⛲" },
  { name: "Pazik大頭目勇氣", emoji: "👑" },
  { name: "撒奇萊雅族聖石", emoji: "🗿" },
  { name: "馬立雲部落的雲", emoji: "☁️" }
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
      
      // 在開啟前檢查是否九宮格已滿 9 格，引導玩家去領勳章
      let collection = JSON.parse(localStorage.getItem('craneCollection')) || [];
      if (collection.length >= 9) {
        toast.textContent = "🏅 請先點選下方「收下勳章並開啟新一輪」，清空背包再尋寶喔！";
        const overlay = document.getElementById('medal-overlay');
        if (overlay) overlay.style.display = 'flex';
        return;
      }
      
      newChest.classList.add('opened');
      newChest.textContent = "📂";
      openedChests[index] = true;
      localStorage.setItem('openedChests', JSON.stringify(openedChests));
      
      const randomIndex = Math.floor(Math.random() * treasureList.length);
      const treasure = treasureList[randomIndex];
      
      toast.textContent = `✨ 你發現了：${treasure.name} ${treasure.emoji}！`;
      
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
        toast.textContent = `✨ 你發現了：${treasure.name} ${treasure.emoji}！今天的寶藏都找到了！明天再來 🕊`;
      }
      
      renderCollectionGrid();
      checkMedalProgress();
    });
  });
}

// 渲染與動態擴展收集包 3x3 網格，並更新勳章統計
function renderCollectionGrid() {
  const container = document.getElementById('collection-grid');
  if (!container) return;
  
  const collection = JSON.parse(localStorage.getItem('craneCollection')) || [];
  container.innerHTML = '';
  
  // 維持至少九宮格 (9個格子)，若超出則自動往下擴充
  const totalSlots = Math.max(9, collection.length);
  
  for (let i = 0; i < totalSlots; i++) {
    const itemEl = document.createElement('div');
    if (i < collection.length) {
      const name = collection[i];
      const match = treasureList.find(t => t.name === name);
      const emoji = match ? match.emoji : "🎁";
      itemEl.className = "grid-item collected";
      itemEl.innerHTML = `
        <span class="grid-item-emoji">${emoji}</span>
        <span class="grid-item-name" title="${name}">${name}</span>
      `;
    } else {
      itemEl.className = "grid-item empty";
      itemEl.textContent = "?";
    }
    container.appendChild(itemEl);
  }
  
  // 更新標題旁邊的累計勳章數顯示
  const medalsCount = parseInt(localStorage.getItem('craneMedalsCount'), 10) || 0;
  const medalContainer = document.getElementById('medal-badge-container');
  if (medalContainer) {
    if (medalsCount > 0) {
      medalContainer.innerHTML = `<span class="medal-count-badge">🏅 x ${medalsCount}</span>`;
    } else {
      medalContainer.innerHTML = '';
    }
  }
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

// 設定勳章兌換與循環重置按鈕
function setupMedalDismiss() {
  const closeBtn = document.getElementById('medal-close-btn');
  const overlay = document.getElementById('medal-overlay');
  if (closeBtn && overlay) {
    // 移除舊的 event listener，綁定新一輪的兌換重置邏輯
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    newCloseBtn.addEventListener('click', () => {
      const collection = JSON.parse(localStorage.getItem('craneCollection')) || [];
      let allTime = JSON.parse(localStorage.getItem('craneAllTimeCollection')) || [];
      
      // 1. 備份至歷史圖鑑，避免遺失曾經獲得的紀錄
      collection.forEach(item => {
        if (!allTime.includes(item)) {
          allTime.push(item);
        }
      });
      localStorage.setItem('craneAllTimeCollection', JSON.stringify(allTime));
      
      // 2. 勳章累計 + 1
      const currentMedals = parseInt(localStorage.getItem('craneMedalsCount'), 10) || 0;
      localStorage.setItem('craneMedalsCount', currentMedals + 1);
      
      // 3. 重置當前收集與彈窗狀態
      localStorage.removeItem('craneCollection');
      localStorage.removeItem('medalDismissed');
      
      overlay.style.display = 'none';
      
      // 4. 即時更新畫面
      renderCollectionGrid();
      
      // 提示重置成功
      const toast = document.getElementById('treasure-toast');
      if (toast) {
        toast.textContent = "🎉 順利兌換勳章！已開啟新一輪的尋寶包！";
      }
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
  const articles = document.querySelectorAll('.pb-slider-article');
  articles.forEach(article => {
    const viewport = article.querySelector('.slider-viewport');
    const dots = article.querySelectorAll('.slider-dots .dot');
    if (!viewport || dots.length === 0) return;
    
    viewport.addEventListener('scroll', () => {
      const scrollLeft = viewport.scrollLeft;
      const width = viewport.clientWidth;
      if (width === 0) return;
      const pageIndex = Math.round(scrollLeft / width);
      
      dots.forEach((dot, index) => {
        if (index === pageIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    });

    // 綁定圓點點擊事件，支援電腦版切換
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const width = viewport.clientWidth;
        viewport.scrollTo({
          left: index * width,
          behavior: 'smooth'
        });
      });
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
  const gamePage = document.getElementById('game-page');
  const puzzlePage = document.getElementById('puzzle-page');
  const adPage = document.getElementById('ad-page');
  const compositionPage = document.getElementById('composition-page');
  const contactPage = document.getElementById('contact-page');
  
  const appLogo = document.getElementById('app-logo');
  
  // Drawer Elements
  const drawerMenu = document.getElementById('drawer-menu');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  
  // Drawer Buttons
  const drawerFavBtn = document.getElementById('drawer-fav-btn');
  const drawerMapBtn = document.getElementById('drawer-map-btn');
  const drawerMainBtn = document.getElementById('drawer-main-btn');
  const drawerGameBtn = document.getElementById('drawer-game-btn');
  const drawerPuzzleBtn = document.getElementById('drawer-puzzle-btn');
  const drawerAdBtn = document.getElementById('drawer-ad-btn');
  const drawerCompositionBtn = document.getElementById('drawer-composition-btn');
  const drawerContactBtn = document.getElementById('drawer-contact-btn');
  
  // Back Buttons
  const favBackBtn = document.getElementById('fav-back-btn');
  const mapBackBtn = document.getElementById('map-back-btn');
  const gameBackBtn = document.getElementById('game-back-btn');
  const puzzleBackBtn = document.getElementById('puzzle-back-btn');
  const adBackBtn = document.getElementById('ad-back-btn');
  const compositionBackBtn = document.getElementById('composition-back-btn');
  const contactBackBtn = document.getElementById('contact-back-btn');
  
  function openDrawer() {
    if (drawerMenu) drawerMenu.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.classList.add('open');
  }
  
  function closeDrawer() {
    if (drawerMenu) drawerMenu.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
  }
  
  if (menuToggleBtn) menuToggleBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
  
  function updateActiveDrawerItem(pageId) {
    document.querySelectorAll('.drawer-item').forEach(item => {
      if (item.getAttribute('data-page') === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  // Favorites Tab Switching
  const favTabFortunes = document.getElementById('fav-tab-fortunes');
  const favTabMedals = document.getElementById('fav-tab-medals');
  const fortunesContainer = document.getElementById('favorites-container');
  const medalsContainer = document.getElementById('medals-container');
  
  if (favTabFortunes && favTabMedals) {
    favTabFortunes.addEventListener('click', () => {
      favTabFortunes.classList.add('active');
      favTabMedals.classList.remove('active');
      if (fortunesContainer) fortunesContainer.style.display = 'block';
      if (medalsContainer) medalsContainer.style.display = 'none';
      renderFavoritesList();
    });
    
    favTabMedals.addEventListener('click', () => {
      favTabMedals.classList.add('active');
      favTabFortunes.classList.remove('active');
      if (fortunesContainer) fortunesContainer.style.display = 'none';
      if (medalsContainer) medalsContainer.style.display = 'grid';
      renderMedalsList();
    });
  }

  function showPage(pageId) {
    document.querySelectorAll('.page-view').forEach(p => {
      p.classList.remove('active');
    });
    
    if (pageId === 'main') {
      if (mainPage) mainPage.classList.add('active');
    } else if (pageId === 'favorites') {
      if (favoritesPage) favoritesPage.classList.add('active');
      if (favTabFortunes) favTabFortunes.click(); // Default to fortunes tab
    } else if (pageId === 'map') {
      if (mapPage) mapPage.classList.add('active');
    } else if (pageId === 'game') {
      if (gamePage) gamePage.classList.add('active');
    } else if (pageId === 'puzzle') {
      if (puzzlePage) puzzlePage.classList.add('active');
      initPuzzleGame();
    } else if (pageId === 'ad') {
      if (adPage) adPage.classList.add('active');
    } else if (pageId === 'composition') {
      if (compositionPage) compositionPage.classList.add('active');
    } else if (pageId === 'contact') {
      if (contactPage) contactPage.classList.add('active');
    }
    
    updateActiveDrawerItem(pageId);
    closeDrawer();
    window.scrollTo(0, 0);
  }
  
  if (drawerFavBtn) drawerFavBtn.addEventListener('click', () => showPage('favorites'));
  if (drawerMapBtn) drawerMapBtn.addEventListener('click', () => showPage('map'));
  if (drawerMainBtn) drawerMainBtn.addEventListener('click', () => showPage('main'));
  if (drawerGameBtn) drawerGameBtn.addEventListener('click', () => showPage('game'));
  if (drawerPuzzleBtn) drawerPuzzleBtn.addEventListener('click', () => showPage('puzzle'));
  if (drawerAdBtn) drawerAdBtn.addEventListener('click', () => showPage('ad'));
  if (drawerCompositionBtn) drawerCompositionBtn.addEventListener('click', () => showPage('composition'));
  if (drawerContactBtn) drawerContactBtn.addEventListener('click', () => showPage('contact'));
  
  if (appLogo) appLogo.addEventListener('click', () => showPage('main'));
  
  if (favBackBtn) favBackBtn.addEventListener('click', () => showPage('main'));
  if (mapBackBtn) mapBackBtn.addEventListener('click', () => showPage('main'));
  if (gameBackBtn) gameBackBtn.addEventListener('click', () => showPage('main'));
  if (puzzleBackBtn) puzzleBackBtn.addEventListener('click', () => showPage('main'));
  if (adBackBtn) adBackBtn.addEventListener('click', () => showPage('main'));
  if (compositionBackBtn) compositionBackBtn.addEventListener('click', () => showPage('main'));
  if (contactBackBtn) contactBackBtn.addEventListener('click', () => showPage('main'));
}

// ----------------------------------------------------
// 頁面渲染與初始化
// ----------------------------------------------------

// 渲染籤詩內容到 DOM
function renderFortune(fortune) {
  const cardFortuneTitle = document.getElementById('card-fortune-title');
  const cardFortuneQuote = document.getElementById('card-fortune-quote');
  const cardFortuneInterpretation = document.getElementById('card-fortune-interpretation');

  if (cardFortuneTitle) cardFortuneTitle.textContent = fortune.title;
  if (cardFortuneQuote) cardFortuneQuote.textContent = fortune.quote;
  if (cardFortuneInterpretation) cardFortuneInterpretation.textContent = fortune.interpretation;

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
        tipText.textContent = "分享醍醐灌腦的～心靈鶴湯";
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
          tipText.textContent = "分享醍醐灌腦的～心靈鶴湯";
          tipText.classList.remove('pulse');
        }
      }
    } else {
      if (tipText) {
        tipText.textContent = "分享醍醐灌腦的～心靈鶴湯";
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
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
  setupPuzzleBindings();
});

// ==========================================
// 小鶴拼圖 邏輯與控制器
// ==========================================

const PUZZLE_LIST = [
  {
    id: 'wuhe_crane',
    name: '舞鶴',
    image: 'images/puzzle_wuhe_crane.jpg',
    rows: 4,
    cols: 3,
    medalName: '舞鶴之金勳章',
    medalIcon: '🕊️'
  },
  {
    id: 'kiispring',
    name: '古伊之泉',
    image: 'images/map_kiispring_new_3.jpg',
    rows: 3,
    cols: 3,
    medalName: '古伊之泉湧泉勳章',
    medalIcon: '⛲'
  },
  {
    id: 'xiangji_stone',
    name: '香積',
    image: 'images/puzzle_xiangji_stone.jpg',
    rows: 4,
    cols: 3,
    medalName: '香積之石勳章',
    medalIcon: '🪨'
  }
];

let activePuzzleId = 'wuhe_crane';

function getPuzzleProgress() {
  const defaultProgress = {
    "wuhe_crane": { "unlockedCount": 0, "completed": false },
    "kiispring": { "unlockedCount": 0, "completed": false },
    "xiangji_stone": { "unlockedCount": 0, "completed": false }
  };
  return JSON.parse(localStorage.getItem('puzzleProgress')) || defaultProgress;
}

function savePuzzleProgress(progress) {
  localStorage.setItem('puzzleProgress', JSON.stringify(progress));
}

function getSolvedPieces(puzzleId) {
  const solved = JSON.parse(localStorage.getItem('puzzleSolvedPieces')) || {};
  return solved[puzzleId] || [];
}

function saveSolvedPieces(puzzleId, solvedArray) {
  const solved = JSON.parse(localStorage.getItem('puzzleSolvedPieces')) || {};
  solved[puzzleId] = solvedArray;
  localStorage.setItem('puzzleSolvedPieces', JSON.stringify(solved));
}

function getPuzzleMedals() {
  return JSON.parse(localStorage.getItem('puzzleMedals')) || [];
}

function savePuzzleMedals(medals) {
  localStorage.setItem('puzzleMedals', JSON.stringify(medals));
}

function getPuzzleMedalDates() {
  return JSON.parse(localStorage.getItem('puzzleMedalDates')) || {};
}

function savePuzzleMedalDates(dates) {
  localStorage.setItem('puzzleMedalDates', JSON.stringify(dates));
}

function unlockPuzzlePiecesForToday() {
  const progress = getPuzzleProgress();
  
  // Find first incomplete puzzle in config order
  let activeId = null;
  let activePuzzle = null;
  for (let p of PUZZLE_LIST) {
    if (!progress[p.id] || !progress[p.id].completed) {
      activeId = p.id;
      activePuzzle = p;
      break;
    }
  }
  
  if (!activeId) return; // All puzzles completed!
  
  const maxPieces = activePuzzle.rows * activePuzzle.cols;
  let currentUnlocked = progress[activeId] ? progress[activeId].unlockedCount : 0;
  
  if (currentUnlocked < maxPieces) {
    let newUnlocked = Math.min(currentUnlocked + 3, maxPieces);
    if (!progress[activeId]) {
      progress[activeId] = { unlockedCount: 0, completed: false };
    }
    progress[activeId].unlockedCount = newUnlocked;
    savePuzzleProgress(progress);
    console.log(`[Puzzle] Unlocked +3 pieces for ${activeId}. New: ${newUnlocked}/${maxPieces}`);
  }
}

// Render medals list in favorites
function renderMedalsList() {
  const container = document.getElementById('medals-container');
  if (!container) return;
  
  const medals = getPuzzleMedals();
  const dates = getPuzzleMedalDates();
  
  if (medals.length === 0) {
    container.innerHTML = `
      <div class="empty-medals">
        <p>🧩 尚未獲得任何獎牌</p>
        <p style="font-size: 13px; margin-top: 8px;">快去「小鶴拼圖」完成挑戰獲得首張勳章吧！</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  medals.forEach(medalId => {
    const puzzle = PUZZLE_LIST.find(p => p.id === medalId) || {
      name: medalId,
      medalName: medalId,
      medalIcon: '🏅'
    };
    const date = dates[medalId] || '';
    
    html += `
      <div class="medal-badge-item">
        <div class="medal-badge-icon">${puzzle.medalIcon}</div>
        <div class="medal-badge-name">${puzzle.medalName}</div>
        <div class="medal-badge-desc">完成《${puzzle.name}》拼圖</div>
        ${date ? `<div class="medal-badge-date">${date} 獲得</div>` : ''}
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Deterministic Random Edge Config Generator based on Puzzle ID and coordinates
function getPuzzleEdges(puzzle) {
  const total = puzzle.rows * puzzle.cols;
  const edges = [];
  
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  }
  
  const baseSeed = hash(puzzle.id);
  const rightEdges = new Array(total).fill(0);
  const bottomEdges = new Array(total).fill(0);
  
  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      const idx = r * puzzle.cols + c;
      
      if (c < puzzle.cols - 1) {
        const seed = baseSeed + idx * 2;
        const rand = Math.sin(seed) * 10000;
        rightEdges[idx] = (rand - Math.floor(rand)) > 0.5 ? 1 : -1;
      }
      
      if (r < puzzle.rows - 1) {
        const seed = baseSeed + idx * 2 + 1;
        const rand = Math.sin(seed) * 10000;
        bottomEdges[idx] = (rand - Math.floor(rand)) > 0.5 ? 1 : -1;
      }
    }
  }
  
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / puzzle.cols);
    const col = i % puzzle.cols;
    
    const cellEdges = { top: 0, right: 0, bottom: 0, left: 0 };
    
    if (row > 0) {
      const aboveIdx = (row - 1) * puzzle.cols + col;
      cellEdges.top = -bottomEdges[aboveIdx];
    }
    if (col > 0) {
      const leftIdx = row * puzzle.cols + (col - 1);
      cellEdges.left = -rightEdges[leftIdx];
    }
    if (row < puzzle.rows - 1) {
      cellEdges.bottom = bottomEdges[i];
    }
    if (col < puzzle.cols - 1) {
      cellEdges.right = rightEdges[i];
    }
    
    edges.push(cellEdges);
  }
  
  return edges;
}

// Compute relative vector offset for Jigsaw tab curves
function getPoint(p1, p2, u, v, type) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const L = Math.sqrt(dx * dx + dy * dy);
  const tx = dx / L;
  const ty = dy / L;
  const nx = ty;
  const ny = -tx;
  
  const sign = type;
  const px = p1.x + u * dx + v * L * nx * sign;
  const py = p1.y + u * dy + v * L * ny * sign;
  return { x: px, y: py };
}

// Generate path segment for a single edge
function generateEdge(p1, p2, type) {
  if (type === 0) {
    return ` L ${p2.x.toFixed(4)} ${p2.y.toFixed(4)}`;
  }
  
  const pts = [
    getPoint(p1, p2, 0.38, 0, type),
    getPoint(p1, p2, 0.38, 0.05, type),
    getPoint(p1, p2, 0.42, 0.09, type),
    getPoint(p1, p2, 0.44, 0.09, type),
    getPoint(p1, p2, 0.46, 0.09, type),
    getPoint(p1, p2, 0.46, 0.13, type),
    getPoint(p1, p2, 0.50, 0.13, type),
    getPoint(p1, p2, 0.54, 0.13, type),
    getPoint(p1, p2, 0.54, 0.09, type),
    getPoint(p1, p2, 0.56, 0.09, type),
    getPoint(p1, p2, 0.58, 0.09, type),
    getPoint(p1, p2, 0.62, 0.05, type),
    getPoint(p1, p2, 0.62, 0, type)
  ];
  
  return ` L ${pts[0].x.toFixed(4)} ${pts[0].y.toFixed(4)}` +
         ` C ${pts[1].x.toFixed(4)} ${pts[1].y.toFixed(4)}, ${pts[2].x.toFixed(4)} ${pts[2].y.toFixed(4)}, ${pts[3].x.toFixed(4)} ${pts[3].y.toFixed(4)}` +
         ` C ${pts[4].x.toFixed(4)} ${pts[4].y.toFixed(4)}, ${pts[5].x.toFixed(4)} ${pts[5].y.toFixed(4)}, ${pts[6].x.toFixed(4)} ${pts[6].y.toFixed(4)}` +
         ` C ${pts[7].x.toFixed(4)} ${pts[7].y.toFixed(4)}, ${pts[8].x.toFixed(4)} ${pts[8].y.toFixed(4)}, ${pts[9].x.toFixed(4)} ${pts[9].y.toFixed(4)}` +
         ` C ${pts[10].x.toFixed(4)} ${pts[10].y.toFixed(4)}, ${pts[11].x.toFixed(4)} ${pts[11].y.toFixed(4)}, ${pts[12].x.toFixed(4)} ${pts[12].y.toFixed(4)}` +
         ` L ${p2.x.toFixed(4)} ${p2.y.toFixed(4)}`;
}

// Generate the responsive SVG clip-paths in document body
function generatePuzzleClipPaths(puzzle) {
  let container = document.getElementById('puzzle-clip-paths');
  if (!container) {
    container = document.createElement('div');
    container.id = 'puzzle-clip-paths';
    container.style.width = '0';
    container.style.height = '0';
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
  }
  
  let svgContent = `<svg id="puzzle-clip-svg" style="width: 0; height: 0; position: absolute;"><defs>`;
  const total = puzzle.rows * puzzle.cols;
  const A = 0.15 / 1.30;
  const B = 1.15 / 1.30;
  
  const edges = getPuzzleEdges(puzzle);
  
  for (let i = 0; i < total; i++) {
    const cellEdges = edges[i];
    const p1 = { x: A, y: A };
    const p2 = { x: B, y: A };
    const p3 = { x: B, y: B };
    const p4 = { x: A, y: B };
    
    let path = `M ${A.toFixed(4)} ${A.toFixed(4)}`;
    path += generateEdge(p1, p2, cellEdges.top);
    path += generateEdge(p2, p3, cellEdges.right);
    path += generateEdge(p3, p4, cellEdges.bottom);
    path += generateEdge(p4, p1, cellEdges.left);
    path += ' Z';
    
    svgContent += `<clipPath id="puzzle-clip-${puzzle.id}-${i}" clipPathUnits="objectBoundingBox">`;
    svgContent += `<path d="${path}" />`;
    svgContent += `</clipPath>`;
  }
  
  svgContent += `</defs></svg>`;
  container.innerHTML = svgContent;
}

// Deterministic Random Unlocked Indices Generator based on Puzzle ID and unlockedCount
function getUnlockedIndices(puzzle, unlockedCount) {
  const total = puzzle.rows * puzzle.cols;
  const indices = Array.from({ length: total }, (_, i) => i);
  
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  }
  
  let seed = hash(puzzle.id);
  function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  
  // Fisher-Yates shuffle using deterministic random LCG
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }
  
  return indices.slice(0, unlockedCount);
}

// Initialize active Jigsaw game
function initPuzzleGame() {
  const progress = getPuzzleProgress();
  const puzzle = PUZZLE_LIST.find(p => p.id === activePuzzleId);
  if (!puzzle) return;
  
  generatePuzzleClipPaths(puzzle);
  
  const totalPieces = puzzle.rows * puzzle.cols;
  const unlockedCount = progress[activePuzzleId] ? progress[activePuzzleId].unlockedCount : 0;
  const unlockedIndices = getUnlockedIndices(puzzle, unlockedCount);
  const solved = getSolvedPieces(activePuzzleId);
  const completed = progress[activePuzzleId] ? progress[activePuzzleId].completed : false;
  
  // Render selector badges
  PUZZLE_LIST.forEach(p => {
    const badgeEl = document.getElementById(`badge-${p.id}`);
    const btnEl = document.querySelector(`.puzzle-sel-btn[data-id="${p.id}"]`);
    
    if (badgeEl && btnEl) {
      // Set active button class
      if (p.id === activePuzzleId) {
        btnEl.classList.add('active');
      } else {
        btnEl.classList.remove('active');
      }
      
      const pProg = progress[p.id];
      if (pProg && pProg.completed) {
        badgeEl.textContent = '🏅';
      } else {
        const unl = pProg ? pProg.unlockedCount : 0;
        const max = p.rows * p.cols;
        badgeEl.textContent = unl === 0 ? '🔒' : `${unl}/${max}`;
      }
    }
  });

  // Setup info card
  const titleEl = document.getElementById('puzzle-info-title');
  const progressEl = document.getElementById('puzzle-info-progress');
  if (titleEl) titleEl.textContent = `《${puzzle.name}》拼圖挑戰`;
  if (progressEl) {
    progressEl.textContent = completed
      ? "🎉 已成功獲得勳章！"
      : `目前進度：已解鎖 ${unlockedCount}/${totalPieces} 片`;
  }
  
  // Setup Board size based on screen width
  const boardEl = document.getElementById('puzzle-board');
  if (!boardEl) return;
  
  const parentWidth = boardEl.parentElement.clientWidth || 320;
  const boardWidth = Math.min(parentWidth - 32, 320); // padding safe
  const boardHeight = boardWidth * (puzzle.rows / puzzle.cols);
  
  boardEl.style.width = boardWidth + 'px';
  boardEl.style.height = boardHeight + 'px';
  boardEl.innerHTML = '';
  
  const cellWidth = boardWidth / puzzle.cols;
  const cellHeight = boardHeight / puzzle.rows;
  
  // Setup Tray pieces
  let trayUnsolved = [];
  
  // Render cells
  for (let i = 0; i < totalPieces; i++) {
    const col = i % puzzle.cols;
    const row = Math.floor(i / puzzle.cols);
    const isLocked = !unlockedIndices.includes(i);
    const isSolved = solved.includes(i) && unlockedIndices.includes(i);
    
    const cell = document.createElement('div');
    cell.className = 'puzzle-cell';
    cell.id = `slot-${activePuzzleId}-${i}`;
    cell.style.width = cellWidth + 'px';
    cell.style.height = cellHeight + 'px';
    cell.style.left = (col * cellWidth) + 'px';
    cell.style.top = (row * cellHeight) + 'px';
    cell.style.overflow = 'visible';
    
    if (isSolved) {
      // Render solved piece inside the board cell
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece snapped';
      
      const offsetW = cellWidth * 0.15;
      const offsetH = cellHeight * 0.15;
      piece.style.width = (cellWidth * 1.3) + 'px';
      piece.style.height = (cellHeight * 1.3) + 'px';
      piece.style.position = 'absolute';
      piece.style.left = -offsetW + 'px';
      piece.style.top = -offsetH + 'px';
      piece.style.clipPath = `url(#puzzle-clip-${activePuzzleId}-${i})`;
      
      piece.style.backgroundImage = `url(${puzzle.image})`;
      piece.style.backgroundSize = `${boardWidth}px ${boardHeight}px`;
      piece.style.backgroundPosition = `-${col * cellWidth - offsetW}px -${row * cellHeight - offsetH}px`;
      cell.appendChild(piece);
    } else if (isLocked) {
      cell.classList.add('locked');
      cell.textContent = '?';
    } else {
      // Unsolved and unlocked, goes to tray
      trayUnsolved.push(i);
    }
    
    boardEl.appendChild(cell);
  }
  
  // Render tray pieces
  const trayEl = document.getElementById('puzzle-tray');
  if (!trayEl) return;
  trayEl.innerHTML = '';
  
  if (trayUnsolved.length === 0) {
    if (solved.length === totalPieces) {
      trayEl.innerHTML = '<div style="color: var(--color-accent); font-weight: bold; padding: 20px;">✨ 拼圖完成！太棒了 🕊️</div>';
    } else if (unlockedCount === 0) {
      trayEl.innerHTML = '<div style="color: var(--color-text-sub); padding: 20px;">🔒 今日尚未登入解鎖，請先抽籤</div>';
    } else {
      trayEl.innerHTML = '<div style="color: var(--color-text-sub); padding: 20px;">🎉 已放置所有可用碎片！</div>';
    }
  } else {
    // Shuffle unsnapped pieces
    trayUnsolved.sort(() => Math.random() - 0.5);
    
    trayUnsolved.forEach(index => {
      const col = index % puzzle.cols;
      const row = Math.floor(index / puzzle.cols);
      
      const wrapper = document.createElement('div');
      wrapper.className = 'puzzle-piece-wrapper';
      wrapper.style.width = cellWidth + 'px';
      wrapper.style.height = cellHeight + 'px';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.style.margin = '12px';
      wrapper.style.overflow = 'visible';
      
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.id = `piece-${activePuzzleId}-${index}`;
      
      const offsetW = cellWidth * 0.15;
      const offsetH = cellHeight * 0.15;
      piece.style.width = (cellWidth * 1.3) + 'px';
      piece.style.height = (cellHeight * 1.3) + 'px';
      piece.style.position = 'absolute';
      piece.style.left = -offsetW + 'px';
      piece.style.top = -offsetH + 'px';
      piece.style.clipPath = `url(#puzzle-clip-${activePuzzleId}-${index})`;
      
      piece.style.backgroundImage = `url(${puzzle.image})`;
      piece.style.backgroundSize = `${boardWidth}px ${boardHeight}px`;
      piece.style.backgroundPosition = `-${col * cellWidth - offsetW}px -${row * cellHeight - offsetH}px`;
      
      const slotEl = document.getElementById(`slot-${activePuzzleId}-${index}`);
      if (slotEl) {
        setupPointerDragging(piece, slotEl, index);
      }
      
      wrapper.appendChild(piece);
      trayEl.appendChild(wrapper);
    });
  }
}

// Unified mobile-friendly Pointer Events dragging
function setupPointerDragging(pieceEl, slotEl, index) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let elStartX = 0;
  let elStartY = 0;
  
  pieceEl.addEventListener('pointerdown', (e) => {
    // Only drag on left click or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    isDragging = true;
    pieceEl.setPointerCapture(e.pointerId);
    
    startX = e.clientX;
    startY = e.clientY;
    
    pieceEl.style.zIndex = 1000;
    
    const rect = pieceEl.getBoundingClientRect();
    elStartX = rect.left;
    elStartY = rect.top;
    
    // Position fixed to allow dragging outside layout boundaries
    pieceEl.style.position = 'fixed';
    pieceEl.style.left = elStartX + 'px';
    pieceEl.style.top = elStartY + 'px';
    pieceEl.style.margin = '0';
  });
  
  pieceEl.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    pieceEl.style.left = (elStartX + dx) + 'px';
    pieceEl.style.top = (elStartY + dy) + 'px';
  });
  
  pieceEl.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    pieceEl.releasePointerCapture(e.pointerId);
    
    pieceEl.style.zIndex = '';
    
    // Check snap tolerance (Bounding rect comparing)
    const rect = pieceEl.getBoundingClientRect();
    const slotRect = slotEl.getBoundingClientRect();
    
    const dx = (rect.left + rect.width / 2) - (slotRect.left + slotRect.width / 2);
    const dy = (rect.top + rect.height / 2) - (slotRect.top + slotRect.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 45) { // 45px snap radius
      // Snapped successfully!
      const solved = getSolvedPieces(activePuzzleId);
      if (!solved.includes(index)) {
        solved.push(index);
        saveSolvedPieces(activePuzzleId, solved);
        
        // Check complete
        const puzzle = PUZZLE_LIST.find(p => p.id === activePuzzleId);
        const total = puzzle.rows * puzzle.cols;
        if (solved.length === total) {
          triggerPuzzleCompletion(puzzle);
        } else {
          // Re-render to place piece on board cell
          initPuzzleGame();
        }
      }
    } else {
      // Revert piece position to tray flow (absolute inside relative wrapper)
      const cellWidth = slotEl.clientWidth;
      const cellHeight = slotEl.clientHeight;
      const offsetW = cellWidth * 0.15;
      const offsetH = cellHeight * 0.15;
      
      pieceEl.style.position = 'absolute';
      pieceEl.style.left = -offsetW + 'px';
      pieceEl.style.top = -offsetH + 'px';
      pieceEl.style.margin = '0';
    }
  });
}

function triggerPuzzleCompletion(puzzle) {
  const progress = getPuzzleProgress();
  const medals = getPuzzleMedals();
  const dates = getPuzzleMedalDates();
  
  const isFirstTime = !progress[puzzle.id] || !progress[puzzle.id].completed;
  
  // Set completed progress state
  if (!progress[puzzle.id]) {
    progress[puzzle.id] = { unlockedCount: puzzle.rows * puzzle.cols, completed: true };
  } else {
    progress[puzzle.id].completed = true;
  }
  savePuzzleProgress(progress);
  
  if (isFirstTime) {
    // Grant medal
    if (!medals.includes(puzzle.id)) {
      medals.push(puzzle.id);
      savePuzzleMedals(medals);
    }
    
    // Save earned date
    const today = new Date();
    dates[puzzle.id] = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    savePuzzleMedalDates(dates);
  }
  
  // Trigger UI celebration modal
  const overlay = document.getElementById('puzzle-celebration-overlay');
  const descEl = document.getElementById('celebration-desc');
  const iconEl = document.getElementById('celebration-medal-icon');
  const nameEl = document.getElementById('celebration-medal-name');
  
  if (descEl) descEl.textContent = `你已成功拼出《${puzzle.name}》拼圖！`;
  if (iconEl) iconEl.textContent = puzzle.medalIcon;
  if (nameEl) nameEl.textContent = puzzle.medalName;
  
  if (overlay) {
    overlay.classList.add('show');
  }
  
  // Refresh layout
  initPuzzleGame();
}

// Setup static event bindings on document load
function setupPuzzleBindings() {
  // Selector buttons
  document.querySelectorAll('.puzzle-sel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (id && id !== activePuzzleId) {
        activePuzzleId = id;
        initPuzzleGame();
      }
    });
  });
  
  // Reset button
  const resetBtn = document.getElementById('puzzle-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('確定要重新挑戰嗎？這將會清除您本張拼圖的放置記錄，重置待放置碎片。')) {
        saveSolvedPieces(activePuzzleId, []);
        initPuzzleGame();
      }
    });
  }
  
  // Dismiss celebration card
  const dismissBtn = document.getElementById('celebration-dismiss-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      const overlay = document.getElementById('puzzle-celebration-overlay');
      if (overlay) overlay.classList.remove('show');
    });
  }
}

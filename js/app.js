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
  const today = new Date().toDateString();
  localStorage.setItem('lastDrawDate', today);
  localStorage.setItem('lastFortuneId', randomId);
  return fortunes.find(f => f.id === randomId);
}

// 翻牌（已修改：翻牌後 3000ms 自動重置為背面，使用戶可繼續翻下一張）
function flipCard() {
  const card = document.querySelector('.card');
  if (!card) return;
  
  card.classList.add('is-flipped');
  setTimeout(() => { playAudio(); }, 400);
  setTimeout(() => {
    document.querySelector('#interpretation-section')
      .scrollIntoView({ behavior: 'smooth' });
  }, 1400);

  // 3000ms 後卡片自動翻轉回背面，便於下次點擊
  setTimeout(() => {
    card.classList.remove('is-flipped');
  }, 3000);
}

// 語音（靜默處理 iOS 限制）
function playAudio() {
  const audio = new Audio('./audio/youhao.mp3');
  audio.play().catch(() => {});
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

// 處理主頁收藏按鈕點擊（收藏／取消收藏切換）
function handleFavToggle() {
  const drawState = checkTodayDraw();
  // 藉由 lastId 判斷當前顯示的籤詩
  if (!drawState.lastId) return;
  
  const currentId = parseInt(drawState.lastId, 10);
  const fortune = fortunesData.find(f => f.id === currentId);
  if (!fortune) return;
  
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  const index = favs.findIndex(f => f.id === currentId);
  
  if (index !== -1) {
    // 已存在，則移除
    favs.splice(index, 1);
    updateHeartButtonState(false);
  } else {
    // 不存在，則新增
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

// 提供給行內 onclick 的全域移除函數
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

// 設置多頁面切換邏輯
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

// 渲染籤詩內容到 DOM 中
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
}

// 處理抽籤點擊事件
function handleDraw() {
  if (isDrawing) return;
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
    flipCard();

    // 更新提示文字
    setTimeout(() => {
      const tipText = document.getElementById('tip-text');
      const interpretationSection = document.getElementById('interpretation-section');
      
      if (tipText) {
        tipText.textContent = "今天好運送給您，心中還有事嗎？歡迎再問幸運小鶴喔！";
        tipText.classList.remove('pulse');
      }
      if (interpretationSection) {
        interpretationSection.classList.add('show');
      }
    }, 800);
    
    // 3800ms 後卡牌完全翻轉回背面且動畫靜止，解除點擊鎖，允許進行下一次抽取
    setTimeout(() => {
      isDrawing = false;
    }, 3800);
  }
}

// 頁面載入初始化
async function initializeApp() {
  setupNavigation();

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

    // 每次載入時卡牌固定為背面狀態，但若過去有抽過籤，則加載上一次籤詩供使用者直接查閱
    if (drawState.lastId) {
      const savedId = parseInt(drawState.lastId, 10);
      const fortune = fortunesData.find(f => f.id === savedId);
      if (fortune) {
        renderFortune(fortune);
        
        if (interpretationSection) {
          interpretationSection.style.display = 'flex';
          interpretationSection.style.opacity = '1';
        }
        
        if (tipText) {
          tipText.textContent = "今天好運送給您，心中還有事嗎？歡迎再問幸運小鶴喔！";
          tipText.classList.remove('pulse');
        }
      }
    } else {
      if (tipText) {
        tipText.textContent = "點擊翻牌，領取今日好運";
        tipText.classList.add('pulse');
      }
    }
    
    // 綁定可重複點擊的抽牌事件監聽器
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

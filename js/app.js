// 全局籤詩資料
let fortunesData = [];

// 每日限抽
function checkTodayDraw() {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('lastDrawDate');
  const lastId = localStorage.getItem('lastFortuneId');
  return { drawnToday: lastDate === today, lastId: lastId };
}

// 抽籤
function drawFortune(fortunes) {
  const randomId = Math.floor(Math.random() * 108) + 1;
  const today = new Date().toDateString();
  localStorage.setItem('lastDrawDate', today);
  localStorage.setItem('lastFortuneId', randomId);
  return fortunes.find(f => f.id === randomId);
}

// 翻牌
function flipCard() {
  const card = document.querySelector('.card');
  card.classList.add('is-flipped');
  setTimeout(() => { playAudio(); }, 400);
  setTimeout(() => {
    document.querySelector('#interpretation-section')
      .scrollIntoView({ behavior: 'smooth' });
  }, 1400);
}

// 語音（靜默處理 iOS 限制）
function playAudio() {
  const audio = new Audio('./audio/youhao.mp3');
  audio.play().catch(() => {});
}

// ----------------------------------------------------
// 新增功能：【有好收藏】與【頁面切換】邏輯
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
  if (!drawState.drawnToday || !drawState.lastId) return; // 還沒有抽籤則不處理
  
  const currentId = parseInt(drawState.lastId, 10);
  const fortune = fortunesData.find(f => f.id === currentId);
  if (!fortune) return;
  
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  const index = favs.findIndex(f => f.id === currentId);
  
  if (index !== -1) {
    // 已存在，則移除（取消收藏）
    favs.splice(index, 1);
    updateHeartButtonState(false);
  } else {
    // 不存在，則新增（收藏）
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
  container.innerHTML = ''; // 清空舊內容
  
  if (favs.length === 0) {
    container.innerHTML = `
      <div class="empty-favorites">
        還沒有收藏，翻牌後點擊愛心即可收藏 🕊
      </div>
    `;
    return;
  }
  
  // 生成卡片列表
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
  
  // 重新渲染列表
  renderFavoritesList();
  
  // 同步更新主頁上的愛心按鈕狀態
  const drawState = checkTodayDraw();
  if (drawState.drawnToday && drawState.lastId && parseInt(drawState.lastId, 10) === id) {
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
    // 隱藏所有分頁
    document.querySelectorAll('.page-view').forEach(p => {
      p.classList.remove('active');
    });
    
    // 顯示指定分頁
    if (pageId === 'main') {
      mainPage.classList.add('active');
    } else if (pageId === 'favorites') {
      favoritesPage.classList.add('active');
      renderFavoritesList();
    } else if (pageId === 'map') {
      mapPage.classList.add('active');
    }
    
    // 切換頁面時自動回到頂部
    window.scrollTo(0, 0);
  }
  
  // 綁定導覽列事件
  if (navFavBtn) navFavBtn.addEventListener('click', () => showPage('favorites'));
  if (navMapBtn) navMapBtn.addEventListener('click', () => showPage('map'));
  if (appLogo) appLogo.addEventListener('click', () => showPage('main'));
  
  // 綁定返回按鈕事件
  if (favBackBtn) favBackBtn.addEventListener('click', () => showPage('main'));
  if (mapBackBtn) mapBackBtn.addEventListener('click', () => showPage('main'));
}

// ----------------------------------------------------
// 頁面渲染與初始化
// ----------------------------------------------------

// 渲染籤詩內容到 DOM 中
function renderFortune(fortune) {
  // 填寫正面牌面（背面）底部疊加文字
  const cardQuote = document.getElementById('card-quote');
  if (cardQuote) {
    cardQuote.textContent = fortune.quote;
  }

  // 填寫解籤區塊內容
  const fortuneTitle = document.getElementById('fortune-title');
  const fortuneQuote = document.getElementById('fortune-quote');
  const fortuneInterpretation = document.getElementById('fortune-interpretation');

  if (fortuneTitle) fortuneTitle.textContent = fortune.title;
  if (fortuneQuote) fortuneQuote.textContent = fortune.quote;
  if (fortuneInterpretation) fortuneInterpretation.textContent = fortune.interpretation;

  // 檢查是否已收藏，並更新按鈕狀態
  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  const isSaved = favs.some(f => f.id === fortune.id);
  updateHeartButtonState(isSaved);
}

// 處理抽籤點擊事件
function handleDraw() {
  // iOS 靜音播放解鎖
  const unlockAudio = new Audio('./audio/youhao.mp3');
  unlockAudio.muted = true;
  unlockAudio.play().then(() => {
    unlockAudio.pause();
  }).catch(() => {});

  if (fortunesData.length === 0) return;

  const fortune = drawFortune(fortunesData);
  if (fortune) {
    renderFortune(fortune);
    flipCard();

    // 延遲更新提示文字，與翻牌同步
    setTimeout(() => {
      const tipText = document.getElementById('tip-text');
      const interpretationSection = document.getElementById('interpretation-section');
      
      if (tipText) {
        tipText.textContent = "今日的好運已收下，明天再來 🕊";
        tipText.classList.remove('pulse');
      }
      if (interpretationSection) {
        interpretationSection.classList.add('show');
      }
    }, 800);
  }
}

// 頁面載入初始化
async function initializeApp() {
  // 綁定分頁導覽
  setupNavigation();

  // 綁定收藏按鈕點擊
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
    const card = document.querySelector('.card');
    const cardScene = document.querySelector('.card-scene');
    const tipText = document.getElementById('tip-text');
    const interpretationSection = document.getElementById('interpretation-section');

    if (drawState.drawnToday && drawState.lastId) {
      // 今日已抽過，顯示結果
      const savedId = parseInt(drawState.lastId, 10);
      const fortune = fortunesData.find(f => f.id === savedId);
      if (fortune) {
        renderFortune(fortune);
        
        // 設為已翻轉
        if (card) {
          card.classList.add('is-flipped');
        }
        
        // 顯示解籤區塊
        if (interpretationSection) {
          interpretationSection.style.display = 'flex';
          interpretationSection.style.opacity = '1';
        }
        
        // 更新提示文字
        if (tipText) {
          tipText.textContent = "今日的好運已收下，明天再來 🕊";
          tipText.classList.remove('pulse');
        }

        // 移除手勢指標
        if (cardScene) {
          cardScene.style.cursor = 'default';
        }
      }
    } else {
      // 今日未抽過，設定點擊事件
      if (tipText) {
        tipText.textContent = "點擊翻牌，領取今日好運";
        tipText.classList.add('pulse');
      }
      
      if (cardScene) {
        cardScene.addEventListener('click', handleDraw, { once: true });
      }
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

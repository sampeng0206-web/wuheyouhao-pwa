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
        
        // 顯示解籤區塊 (無漸顯動畫直接顯示)
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

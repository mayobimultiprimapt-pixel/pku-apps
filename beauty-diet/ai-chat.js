// ============================================================
//  AI 美容养生顾问 — OpenRouter API (DeepSeek V3)
// ============================================================

const OPENROUTER_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = 'deepseek/deepseek-chat-v3-0324';

let chatHistory = [];
let chatLoading = false;

const BEAUTY_SYSTEM_PROMPT = '你是专属AI美容养生顾问，精通科学减脂(体积饮食法/211餐盘)、美容护肤(烟酰胺/A醇/VC)、泡澡养生(瑶浴/精油)、中医养生(体质辨识/食疗)、懒人变美方案。回答要专业但通俗，给出精确可执行方案(食材用量/时间/步骤)，有禁忌必须预警⚠️，用emoji让回答生动。';

const QUICK_QUESTIONS = [
  { icon:'💎', text:'美白最快方案' },
  { icon:'🥗', text:'今天吃什么减脂' },
  { icon:'🛁', text:'泡澡配方推荐' },
  { icon:'😴', text:'助眠养颜方案' },
  { icon:'💊', text:'胶原蛋白怎么补' },
  { icon:'🍵', text:'祛湿美白茶推荐' },
  { icon:'🧴', text:'A醇和VC能一起用吗' },
  { icon:'🏃', text:'懒人5分钟燃脂' },
];

// Load saved chat
try { const s = JSON.parse(localStorage.getItem('beauty_chat') || '[]'); if (s.length) chatHistory = s; } catch(e){}

// Format markdown
function fmtAI(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<div style="font-size:15px;font-weight:700;margin:10px 0 4px;color:var(--accent-peach)">$1</div>')
    .replace(/^## (.*$)/gm, '<div style="font-size:16px;font-weight:700;margin:12px 0 4px;color:var(--accent-rose)">$1</div>')
    .replace(/^- (.*$)/gm, '<div style="padding-left:12px;margin:2px 0">• $1</div>')
    .replace(/^(\d+)\. (.*$)/gm, '<div style="padding-left:12px;margin:2px 0"><b>$1.</b> $2</div>')
    .replace(/\n\n/g, '<div style="height:6px"></div>')
    .replace(/\n/g, '<br>');
}

// Render chat
function renderChatTab() {
  const msgHTML = chatHistory.length === 0 ? `
    <div style="text-align:center;padding:40px 20px">
      <div style="font-size:48px;margin-bottom:16px">🌸</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">你好！我是美容养生AI顾问</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">
        问我任何美容、减肥、护肤、泡澡、养生问题<br>
        比如：午餐吃什么能美白又减脂？<br>
        或点击下方快捷标签开始 👇
      </div>
    </div>
  ` : chatHistory.map(function(msg) {
    if (msg.role === 'user') {
      return '<div style="display:flex;justify-content:flex-end;margin:12px 0"><div style="max-width:85%;padding:12px 16px;border-radius:16px 16px 4px 16px;background:linear-gradient(135deg,#e8527a,#a78bfa);font-size:13px;line-height:1.6">' + msg.content + '</div></div>';
    } else {
      return '<div style="display:flex;margin:12px 0"><div style="max-width:90%;padding:14px 16px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);font-size:13px;line-height:1.7">' + fmtAI(msg.content) + '</div></div>';
    }
  }).join('');
  
  var loadingHTML = chatLoading ? '<div style="display:flex;margin:12px 0"><div style="padding:14px 16px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)"><div class="loading-spinner" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:8px"></div><span style="font-size:12px;color:var(--text-secondary)">AI 正在思考...</span></div></div>' : '';

  return '<div class="hero-card" style="margin-top:8px">' +
    '<img src="hero.png" class="hero-img" alt="ai"/>' +
    '<div class="hero-overlay">' +
    '<div class="hero-date">AI 美容顾问 · DeepSeek V3</div>' +
    '<div class="hero-title">问<em>AI</em></div>' +
    '<div class="hero-sub">美容·减肥·护肤·养生·泡澡 自由提问</div>' +
    '</div></div>' +
    
    '<div style="padding:12px 0;display:flex;gap:8px;overflow-x:auto">' +
    QUICK_QUESTIONS.map(function(q) {
      return '<button onclick="doAsk(\'' + q.text + '\')" style="flex-shrink:0;padding:8px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:var(--text-primary);font-size:12px;cursor:pointer">' + q.icon + ' ' + q.text + '</button>';
    }).join('') +
    '</div>' +

    '<div id="chatBox" style="min-height:200px;max-height:55vh;overflow-y:auto;padding-bottom:8px">' +
    msgHTML + loadingHTML +
    '</div>' +
    
    '<div id="chatError" style="display:none;padding:10px;margin:8px 0;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:12px;font-size:12px;color:#ef4444"></div>' +

    '<div style="padding:12px 0">' +
    '<div style="display:flex;gap:8px">' +
    '<input type="text" id="chatInput" placeholder="问我任何美容减肥养生问题..." style="flex:1;padding:14px 16px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:var(--text-primary);font-size:14px;outline:none"/>' +
    '<button id="chatSendBtn" style="width:48px;height:48px;border-radius:24px;border:none;background:linear-gradient(135deg,#e8527a,#a78bfa);color:white;font-size:18px;cursor:pointer">➤</button>' +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:8px;font-size:10px;color:var(--text-secondary)">' +
    '<span>🧠 DeepSeek V3 · OpenRouter</span>' +
    '<span id="chatClearBtn" style="cursor:pointer;color:rgba(255,255,255,0.3)">🗑️ 清空对话</span>' +
    '</div></div>';
}

// Bind events after render (called from app.js bindEvents)
function bindChatEvents() {
  var input = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSendBtn');
  var clearBtn = document.getElementById('chatClearBtn');
  
  if (sendBtn) {
    sendBtn.onclick = function() { doSend(); };
  }
  if (input) {
    input.onkeydown = function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    };
  }
  if (clearBtn) {
    clearBtn.onclick = function() {
      if (confirm('确认清空对话？')) {
        chatHistory = [];
        localStorage.removeItem('beauty_chat');
        renderApp();
      }
    };
  }
  // Scroll to bottom
  var box = document.getElementById('chatBox');
  if (box) box.scrollTop = box.scrollHeight;
}

// Send message
function doSend() {
  var input = document.getElementById('chatInput');
  if (!input) { alert('找不到输入框'); return; }
  var text = input.value.trim();
  if (!text) { return; }
  if (chatLoading) { return; }
  
  input.value = '';
  doAsk(text);
}

// Ask a question (from input or quick button)
function doAsk(text) {
  if (chatLoading) return;
  
  // Push user message and show loading
  chatHistory.push({ role: 'user', content: text });
  chatLoading = true;
  renderApp();
  
  // Hide error
  var errDiv = document.getElementById('chatError');
  if (errDiv) errDiv.style.display = 'none';
  
  // Make API call
  var msgs = [{ role: 'system', content: BEAUTY_SYSTEM_PROMPT }];
  var recent = chatHistory.slice(-20);
  for (var i = 0; i < recent.length; i++) msgs.push(recent[i]);
  
  fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OPENROUTER_KEY,
      'HTTP-Referer': 'http://localhost:8866',
      'X-Title': 'beauty-wellness'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: msgs,
      temperature: 0.7,
      max_tokens: 2000
    })
  })
  .then(function(res) {
    if (!res.ok) {
      return res.text().then(function(t) { throw new Error('HTTP ' + res.status + ': ' + t.substring(0, 200)); });
    }
    return res.json();
  })
  .then(function(data) {
    var reply = '未获取到回复';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      reply = data.choices[0].message.content;
    }
    chatHistory.push({ role: 'assistant', content: reply });
    try { localStorage.setItem('beauty_chat', JSON.stringify(chatHistory.slice(-50))); } catch(e){}
    chatLoading = false;
    renderApp();
  })
  .catch(function(err) {
    chatHistory.push({ role: 'assistant', content: '❌ 请求失败: ' + err.message });
    chatLoading = false;
    renderApp();
    // Also show error div
    setTimeout(function() {
      var errDiv = document.getElementById('chatError');
      if (errDiv) {
        errDiv.style.display = 'block';
        errDiv.textContent = '⚠️ API错误: ' + err.message;
      }
    }, 200);
  });
}

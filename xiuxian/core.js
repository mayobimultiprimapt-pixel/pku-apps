// ═══════════════════════════════════════════════════════
// 神霄宫 · 道法实修 — CORE.JS 底层架构
// DeepSeek R1 驱动 · 全分支深化 · 交叉引用系统
// ═══════════════════════════════════════════════════════

const PWD = 'zmqawqw1314';
const API = window.location.origin;

// ── 登录系统 ──
function doLogin() {
  if (document.getElementById('lp').value.trim() === PWD) {
    localStorage.setItem('sx_auth', '1');
    showApp();
  } else {
    document.getElementById('lerr').textContent = '口令错误';
    document.getElementById('lerr').style.animation = 'shake .3s';
  }
}
document.getElementById('lp').onkeydown = function(e) { if (e.key === 'Enter') doLogin(); };
if (localStorage.getItem('sx_auth') === '1') showApp();

// ── 导航系统 ──
var navStack = [];
function goS(el) {
  document.querySelectorAll('.ni').forEach(x => x.classList.remove('on'));
  document.querySelectorAll('.scr').forEach(x => x.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('s' + el.dataset.s).classList.add('on');
  document.getElementById('hb').style.display = 'none';
  var titles = {'1':'神霄宫 · 道法实修','4':'梅花起卦','5':'交叉引用','6':'修行日志'};
  document.getElementById('ht').textContent = titles[el.dataset.s] || '神霄宫';
}
function ssc(n, t) {
  document.querySelectorAll('.scr').forEach(x => x.classList.remove('on'));
  document.getElementById('s' + n).classList.add('on');
  document.getElementById('ht').textContent = t || '';
  document.getElementById('hb').style.display = n > 1 ? '' : 'none';
  document.querySelectorAll('.ni').forEach(x => x.classList.remove('on'));
}
function goBack() {
  if (navStack.length) {
    var p = navStack.pop();
    ssc(p.s, p.t);
    if (p.s === 1) { document.getElementById('hb').style.display = 'none'; document.querySelector('.ni[data-s="1"]').classList.add('on'); }
  } else {
    ssc(1, '神霄宫 · 道法实修');
    document.querySelector('.ni[data-s="1"]').classList.add('on');
  }
}

// ── DeepSeek API 调用 ──
function callDS(prompt, streaming) {
  return fetch(API + '/api/chat', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ message: prompt, modelName: 'deepseek/deepseek-r1', history: [] })
  }).then(r => r.json()).then(d => {
    if (d.success) return d.response;
    throw new Error('R1 failed');
  }).catch(() => {
    return fetch(API + '/api/chat', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message: prompt, modelName: 'deepseek/deepseek-chat', history: [] })
    }).then(r => r.json()).then(d => d.success ? d.response : '连接失败');
  }).catch(() => '网络错误，请稍后重试');
}

// ── Markdown 格式化 ──
function fmtMD(t) {
  if (!t) return '';
  return t
    .replace(/^#### (.+)$/gm, '<h4 style="color:#5bc0be;font-size:13px;margin:6px 0">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 style="color:#d4a843;font-size:14px;margin:8px 0;border-left:2px solid #d4a843;padding-left:8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#d4a843;font-size:15px;margin:10px 0">$2</h2>'.replace('$2','$1'))
    .replace(/^# (.+)$/gm, '<h1 style="color:#d4a843;font-size:16px;margin:10px 0">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#5bc0be">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(91,192,190,.1);padding:1px 4px;border-radius:3px;color:#5bc0be;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<div style="padding-left:12px;position:relative;margin:2px 0"><span style="position:absolute;left:0;color:#d4a843">·</span>$1</div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="padding-left:16px;position:relative;margin:2px 0"><span style="position:absolute;left:0;color:#d4a843;font-weight:700;font-size:11px">$1.</span>$2</div>')
    .replace(/\n/g, '<br>');
}

// ── 卦象计算引擎 ──
var BG = ['☰','☱','☲','☳','☴','☵','☶','☷'];
var BN = ['乾','兑','离','震','巽','坎','艮','坤'];
var BW = ['金','金','火','木','木','水','土','土'];
var BX = ['天','泽','火','雷','风','水','山','地'];
// 64卦名 (上卦*8+下卦)
var GUA64 = [
  '乾为天','天泽履','天火同人','天雷无妄','天风姤','天水讼','天山遁','天地否',
  '泽天夬','兑为泽','泽火革','泽雷随','泽风大过','泽水困','泽山咸','泽地萃',
  '火天大有','火泽睽','离为火','火雷噬嗑','火风鼎','火水未济','火山旅','火地晋',
  '雷天大壮','雷泽归妹','雷火丰','震为雷','雷风恒','雷水解','雷山小过','雷地豫',
  '风天小畜','风泽中孚','风火家人','风雷益','巽为风','风水涣','风山渐','风地观',
  '水天需','水泽节','水火既济','水雷屯','水风井','坎为水','水山蹇','水地比',
  '山天大畜','山泽损','山火贲','山雷颐','山风蛊','山水蒙','艮为山','山地剥',
  '地天泰','地泽临','地火明夷','地雷复','地风升','地水师','地山谦','坤为地'
];

function calcGua(upper, lower, dong) {
  var guaName = GUA64[upper * 8 + lower] || (BN[upper] + BN[lower]);
  // 变卦：动爻变
  var biUpper = upper, biLower = lower;
  if (dong <= 3) { biLower = biLower ^ (1 << (dong - 1)); biLower = biLower % 8; }
  else { biUpper = biUpper ^ (1 << (dong - 4)); biUpper = biUpper % 8; }
  var bianGua = GUA64[biUpper * 8 + biLower] || (BN[biUpper] + BN[biLower]);
  // 互卦
  return { upper, lower, dong, guaName, bianGua, upperName: BN[upper], lowerName: BN[lower],
    upperWx: BW[upper], lowerWx: BW[lower], upperSym: BG[upper], lowerSym: BG[lower],
    bianUpperName: BN[biUpper], bianLowerName: BN[biLower] };
}

function mhTime() {
  var n = new Date(), y = n.getFullYear(), m = n.getMonth(+ 1), d = n.getDate(), h = n.getHours();
  var month = n.getMonth() + 1;
  doGua((y + month + d) % 8, (y + month + d + h) % 8, (y + month + d + h) % 6 || 6,
    '时间起卦：' + y + '年' + month + '月' + d + '日' + h + '时');
}
function mhNum() {
  var n = prompt('输入两个数字逗号分隔如5,3');
  if (!n) return;
  var ps = n.split(/[,，]/), a = +ps[0], b = +ps[1];
  if (isNaN(a) || isNaN(b)) return alert('格式错误');
  doGua(a % 8, b % 8, (a + b) % 6 || 6, '数字：' + a + ',' + b);
}
function mhRand() {
  doGua(Math.floor(Math.random() * 8), Math.floor(Math.random() * 8),
    Math.floor(Math.random() * 6) + 1, '随机起卦');
}

function doGua(s, x, d, method) {
  var g = calcGua(s, x, d);
  document.getElementById('gn').textContent = g.guaName;
  document.getElementById('gh').textContent = g.upperSym + ' ' + g.lowerSym;
  document.getElementById('gi').textContent = method + ' | 上' + g.upperName + '(' + g.upperWx +
    ') 下' + g.lowerName + '(' + g.lowerWx + ') 动爻' + d;
  document.getElementById('gi2').textContent = '变卦：' + g.bianGua;
  var q = document.getElementById('gq').value.trim() || '问事吉凶';
  document.getElementById('ga').innerHTML = '<span class="sp"></span> DeepSeek R1 断卦中...';
  callDS('你是梅花易数断卦大师（神霄派传承）。' + method + '。本卦【' + g.guaName + '】上卦' +
    g.upperName + '(' + g.upperWx + ')下卦' + g.lowerName + '(' + g.lowerWx + ')动爻' + d +
    '，变卦【' + g.bianGua + '】。所问：' + q +
    '。请断：1.体用关系与旺衰 2.五行生克制化 3.互卦分析 4.变卦推演 5.应期与方位 6.吉凶判断与行动建议 7.注意事项。实干直说不客套。'
  ).then(t => { document.getElementById('ga').innerHTML = fmtMD(t); saveLog('起卦', g.guaName + ' | ' + q); });
}

// ── 修行日志 ──
function saveLog(type, content) {
  var logs = JSON.parse(localStorage.getItem('sx_logs') || '[]');
  logs.unshift({ time: new Date().toLocaleString(), type, content });
  if (logs.length > 200) logs.length = 200;
  localStorage.setItem('sx_logs', JSON.stringify(logs));
}
function getLogs() { return JSON.parse(localStorage.getItem('sx_logs') || '[]'); }

// ── 学习进度 ──
function saveProgress(catId, topicIdx) {
  var prog = JSON.parse(localStorage.getItem('sx_prog') || '{}');
  if (!prog[catId]) prog[catId] = [];
  if (!prog[catId].includes(topicIdx)) prog[catId].push(topicIdx);
  localStorage.setItem('sx_prog', JSON.stringify(prog));
}
function getProgress(catId) {
  var prog = JSON.parse(localStorage.getItem('sx_prog') || '{}');
  return prog[catId] || [];
}
function getTotalProgress() {
  var prog = JSON.parse(localStorage.getItem('sx_prog') || '{}');
  var total = 0; Object.values(prog).forEach(a => total += a.length);
  return total;
}

// ── 交叉引用引擎 ──
var XREF = {
  '五行': ['梅花易数→五行生克与卦气旺衰','六爻→六神用神','四柱八字→天干地支五行','符箓→五雷镇煞','雷法→神霄雷法概论','内丹→炼精化气','步罡踏斗→河图洛书罡'],
  '天干地支': ['梅花易数→十天干十二地支','四柱八字→天干地支阴阳五行','六爻→装卦纳甲','奇门遁甲→三奇六仪','大六壬→基础'],
  '八卦': ['梅花易数→八卦象例与占法','六爻→装卦纳甲','奇门遁甲→九宫九星','步罡踏斗→北斗七星罡','经典→道德经'],
  '咒语': ['符箓→金光神咒全文修持','符箓→净坛咒净口咒净身咒','符箓→急急如律令','雷法→雷祖宝诰','科仪→早坛功课经','经典→心印妙经'],
  '存思观想': ['步罡踏斗→存思观想','内丹→打坐入静','雷法→行雷步罡法','科仪→开坛请神科'],
  '北斗': ['步罡踏斗→北斗七星罡','经典→北斗经延生法','奇门遁甲→九宫九星'],
  '画符': ['符箓→符头符胆符脚画法','符箓→保安符镇宅符','符箓→催财求学姻缘符','雷法→五雷正法基础'],
  '科仪步骤': ['科仪→净坛科仪','科仪→开坛请神科','步罡踏斗→禹步三步九迹','符箓→开光点眼法诀'],
  '内炼': ['内丹→百日筑基','内丹→小周天','步罡踏斗→存思观想','经典→清静经逐句实修','经典→黄庭经内外景'],
  '数术通论': ['梅花易数→体用生克心易占卜','六爻→高级技法','四柱八字→格局论命','奇门遁甲→预测实战','大六壬→断事实操','小六壬→实战速断']
};

function findXRefs(topic) {
  var refs = [];
  Object.keys(XREF).forEach(key => {
    XREF[key].forEach(ref => {
      if (ref.indexOf(topic) >= 0) {
        XREF[key].forEach(r2 => { if (r2 !== ref && refs.indexOf(r2) < 0) refs.push(r2); });
      }
    });
  });
  return refs.slice(0, 8);
}

// ── 收藏系统 ──
function toggleFav(catId, topicIdx) {
  var favs = JSON.parse(localStorage.getItem('sx_favs') || '[]');
  var key = catId + ':' + topicIdx;
  var idx = favs.indexOf(key);
  if (idx >= 0) favs.splice(idx, 1); else favs.push(key);
  localStorage.setItem('sx_favs', JSON.stringify(favs));
  return idx < 0;
}
function isFav(catId, topicIdx) {
  var favs = JSON.parse(localStorage.getItem('sx_favs') || '[]');
  return favs.indexOf(catId + ':' + topicIdx) >= 0;
}

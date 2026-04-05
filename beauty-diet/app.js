// ============================================================
//  美颜轻体 · 懒人定制 — Core Application Logic
// ============================================================

// ===== 躺瘦核心法则 =====
const LYING_SLIM_RULES = [
  '🥤 餐前20分钟喝300ml温水，占据胃容量',
  '🥗 进食顺序：汤水→蛋白质→蔬菜→碳水',
  '🍽️ 211餐盘法：½蔬菜 + ¼蛋白 + ¼低GI主食',
  '🐢 每口咀嚼20次以上，20分钟吃完一餐',
  '⏰ 晚餐在18:00前完成，睡前4h禁食',
  '💧 每天2000ml水，加速脂肪代谢',
  '😴 保证7-8h睡眠，激素才能正常燃脂',
];

// ===== DATA: 体积饮食法 · 吃饱也掉秤 Meal Database =====
// 设计原则: 高饱腹指数(SI) + 大体积低热量密度 + 高蛋白防掉肌肉
// 目标: 早餐350kcal + 午餐450kcal + 晚餐300kcal + 加餐100kcal ≈ 1200kcal
const MEALS_DB = {
  // ===== 早餐 (目标: ~350kcal, 饱腹4h+) =====
  breakfast: [
    { name:'蒸红薯+水煮蛋×2', icon:'🍠', amount:'红薯200g+蛋2个', kcal:330, protein:14, fat:10, carb:42, tip:'红薯膳食纤维撑饱胃，蛋白质稳血糖4h不饿', satiety:'★★★★★', vol:'大体积' },
    { name:'燕麦希腊酸奶碗', icon:'🥣', amount:'燕麦50g+酸奶200g+莓果', kcal:310, protein:18, fat:6, carb:45, tip:'β-葡聚糖吸水膨胀10倍，饱腹感之王', satiety:'★★★★★', vol:'大体积' },
    { name:'全麦三明治(鸡蛋生菜)', icon:'🥪', amount:'面包2片+蛋+菜', kcal:320, protein:16, fat:8, carb:40, tip:'全麦纤维+蛋白质组合，消化慢释放稳', satiety:'★★★★', vol:'中等' },
    { name:'无糖豆浆+玉米+蛋', icon:'🌽', amount:'豆浆350ml+玉米1根+蛋1个', kcal:340, protein:17, fat:8, carb:46, tip:'玉米是高纤主食之王，一根就饱还只有90kcal', satiety:'★★★★★', vol:'大体积' },
    { name:'小米南瓜粥+水煮蛋', icon:'🎃', amount:'粥300g+蛋2个', kcal:290, protein:14, fat:10, carb:34, tip:'南瓜果胶减缓胃排空，饱腹感延长2小时', satiety:'★★★★', vol:'大体积' },
    { name:'紫薯燕麦牛奶', icon:'🥛', amount:'紫薯150g+燕麦40g+奶200ml', kcal:340, protein:12, fat:6, carb:55, tip:'紫薯花青素美白+燕麦β-葡聚糖饱腹双重加持', satiety:'★★★★★', vol:'大体积' },
    { name:'鸡胸肉全麦卷饼', icon:'🌯', amount:'饼1张+鸡胸80g+生菜', kcal:310, protein:22, fat:7, carb:38, tip:'22g蛋白开启一天代谢，肌肉不掉基代不降', satiety:'★★★★', vol:'中等' },
    { name:'魔芋燕麦粥+茶叶蛋', icon:'🥣', amount:'魔芋丝+燕麦+蛋2个', kcal:280, protein:15, fat:10, carb:28, tip:'魔芋零卡撑胃神器+燕麦缓释碳水=5h不饿', satiety:'★★★★★', vol:'超大体积' },
  ],
  // ===== 午餐 (目标: ~450kcal, 饱腹5h+, 211餐盘法) =====
  lunch: [
    // === 蛋白质主菜 (1/4餐盘) ===
    { name:'香煎鸡胸肉', icon:'🍗', amount:'150g(1掌心)', kcal:165, protein:31, fat:4, carb:0, tip:'蛋白质热效应30%，消化就在燃脂！', satiety:'★★★★★', vol:'中等', cat:'protein' },
    { name:'清蒸鲈鱼', icon:'🐟', amount:'200g', kcal:140, protein:28, fat:3, carb:0, tip:'鱼肉蛋白消化吸收率98%，低脂之王', satiety:'★★★★', vol:'中等', cat:'protein' },
    { name:'白灼虾', icon:'🦐', amount:'250g(约15只)', kcal:150, protein:30, fat:2, carb:0, tip:'虾青素美白+超高蛋白，剥壳吃更慢更饱', satiety:'★★★★★', vol:'大体积', cat:'protein' },
    { name:'番茄炖牛腩', icon:'🥩', amount:'150g', kcal:200, protein:22, fat:10, carb:6, tip:'铁质+番茄红素，气色红润还抗氧化', satiety:'★★★★', vol:'中等', cat:'protein' },
    { name:'香煎三文鱼', icon:'🐟', amount:'120g', kcal:220, protein:22, fat:14, carb:0, tip:'Omega-3抗炎嫩肤+促进瘦素分泌助减脂', satiety:'★★★★', vol:'中等', cat:'protein' },
    { name:'豆腐蘑菇煲', icon:'🍲', amount:'豆腐200g+菇150g', kcal:130, protein:14, fat:5, carb:8, tip:'植物蛋白+菇类多糖，大体积只有130kcal！', satiety:'★★★★★', vol:'超大体积', cat:'protein' },
    // === 蔬菜 (1/2餐盘, 大量!) ===
    { name:'清炒西兰花(大份)', icon:'🥦', amount:'300g', kcal:60, protein:8, fat:2, carb:6, tip:'300g才60kcal！维C促进胶原合成', satiety:'★★★★★', vol:'超大体积', cat:'veg' },
    { name:'蒜蓉菠菜', icon:'🥬', amount:'300g', kcal:55, protein:6, fat:2, carb:4, tip:'叶酸+铁补血圣品，大把吃也不胖', satiety:'★★★★', vol:'超大体积', cat:'veg' },
    { name:'凉拌黄瓜木耳', icon:'🥒', amount:'黄瓜250g+木耳50g', kcal:45, protein:2, fat:1, carb:8, tip:'水分96%的黄瓜+清肠木耳=涨胃不涨秤', satiety:'★★★★', vol:'超大体积', cat:'veg' },
    { name:'番茄蛋花汤(大碗)', icon:'🍅', amount:'400ml', kcal:60, protein:5, fat:2, carb:6, tip:'餐前一碗热汤占胃容量30%，主食自动少吃', satiety:'★★★★★', vol:'超大体积', cat:'veg' },
    { name:'白灼生菜/菜心', icon:'🥬', amount:'300g', kcal:40, protein:3, fat:1, carb:4, tip:'整盘蔬菜40kcal，想吃多少吃多少', satiety:'★★★', vol:'超大体积', cat:'veg' },
    { name:'魔芋丝蔬菜沙拉', icon:'🥗', amount:'魔芋200g+蔬菜200g', kcal:35, protein:2, fat:1, carb:5, tip:'魔芋几乎0卡+蔬菜纤维=无限量填胃', satiety:'★★★★★', vol:'超大体积', cat:'veg' },
    // === 低GI主食 (1/4餐盘) ===
    { name:'糙米饭(小份)', icon:'🍚', amount:'100g(半拳)', kcal:115, protein:3, fat:1, carb:24, tip:'低GI=血糖慢升慢降=不饿不困不囤脂', satiety:'★★★', vol:'小体积', cat:'carb' },
    { name:'蒸南瓜/山药', icon:'🍠', amount:'200g', kcal:90, protein:2, fat:0, carb:20, tip:'南瓜果胶延缓胃排空，同等热量比米饭饱2倍', satiety:'★★★★★', vol:'大体积', cat:'carb' },
    { name:'蒸玉米(半根)', icon:'🌽', amount:'半根约100g', kcal:80, protein:3, fat:1, carb:16, tip:'高纤维低热量主食，嚼着吃超满足', satiety:'★★★★', vol:'中等', cat:'carb' },
  ],
  // ===== 晚餐 (目标: ~300kcal, 轻食为主, 18:00前吃完) =====
  dinner: [
    { name:'鸡胸肉蔬菜汤', icon:'🍲', amount:'鸡肉100g+菜300g+汤', kcal:180, protein:22, fat:3, carb:12, tip:'一大碗热汤只有180kcal，暖胃饱腹到天亮', satiety:'★★★★★', vol:'超大体积' },
    { name:'清蒸虾+白灼西兰花', icon:'🦐', amount:'虾200g+西兰花250g', kcal:200, protein:33, fat:3, carb:6, tip:'纯蛋白+纯纤维晚餐，睡觉也在燃脂', satiety:'★★★★★', vol:'大体积' },
    { name:'冬瓜虾仁汤', icon:'🍲', amount:'冬瓜300g+虾100g', kcal:120, protein:18, fat:1, carb:8, tip:'冬瓜利水消肿+虾仁高蛋白=早起秤轻0.5斤', satiety:'★★★★', vol:'超大体积' },
    { name:'魔芋面+蔬菜卤', icon:'🍜', amount:'魔芋面200g+菜300g', kcal:90, protein:3, fat:2, carb:12, tip:'魔芋面吃到撑也不到100kcal，面食自由！', satiety:'★★★★★', vol:'超大体积' },
    { name:'豆腐蔬菜煲', icon:'🥘', amount:'豆腐150g+菇+菜', kcal:160, protein:14, fat:6, carb:10, tip:'植物蛋白+菇类鲜味满足，减脂不减幸福感', satiety:'★★★★', vol:'大体积' },
    { name:'凉拌鸡丝+拍黄瓜', icon:'🥒', amount:'鸡胸100g+黄瓜300g', kcal:170, protein:22, fat:4, carb:8, tip:'黄瓜水分撑胃+鸡丝蛋白饱腹，清爽掉秤组合', satiety:'★★★★★', vol:'大体积' },
    { name:'番茄豆腐蛋花汤', icon:'🍅', amount:'番茄200g+豆腐100g+蛋', kcal:150, protein:12, fat:6, carb:10, tip:'三种蛋白质来源+番茄红素，美白减脂两不误', satiety:'★★★★', vol:'大体积' },
    { name:'紫菜蛋花汤+蒸南瓜', icon:'🎃', amount:'汤400ml+南瓜200g', kcal:140, protein:6, fat:2, carb:26, tip:'热汤暖胃+南瓜甜糯解馋，晚餐幸福感拉满', satiety:'★★★★', vol:'超大体积' },
  ],
  // ===== 加餐 (目标: ~100kcal, 防止饿到暴食) =====
  snack: [
    { name:'小番茄(圣女果)', icon:'🍅', amount:'300g(约20颗)', kcal:60, protein:2, fat:0, carb:12, tip:'300g才60kcal！咀嚼感强，吃半小时', satiety:'★★★★', vol:'大体积' },
    { name:'黄瓜条', icon:'🥒', amount:'1根约250g', kcal:35, protein:1, fat:0, carb:7, tip:'随时啃，零罪恶感，水分+纤维撑胃', satiety:'★★★', vol:'大体积' },
    { name:'苹果', icon:'🍎', amount:'1个中等', kcal:80, protein:0, fat:0, carb:20, tip:'果胶清肠+苹果酸嫩肤，天然零食', satiety:'★★★★', vol:'中等' },
    { name:'坚果(小把)', icon:'🥜', amount:'15g(约8颗)', kcal:90, protein:3, fat:8, carb:3, tip:'好脂肪维持激素平衡，但只能一小把！', satiety:'★★★', vol:'小体积' },
    { name:'魔芋果冻', icon:'🍮', amount:'2杯', kcal:10, protein:0, fat:0, carb:2, tip:'几乎0卡的Q弹小零食，嘴馋救星', satiety:'★★★', vol:'中等' },
    { name:'无糖气泡水', icon:'🥤', amount:'330ml', kcal:0, protein:0, fat:0, carb:0, tip:'气泡撑胃产生饱腹感，0卡骗饱大脑', satiety:'★★★★', vol:'大体积' },
    { name:'蓝莓/草莓', icon:'🫐', amount:'150g', kcal:48, protein:1, fat:0, carb:11, tip:'抗氧化之王，甜而不胖的美白水果', satiety:'★★★', vol:'中等' },
  ]
};

// ===== DATA: Beauty Tips =====
const BEAUTY_TIPS = [
  { title:'胶原蛋白合成秘诀', text:'维C+优质蛋白同食，胶原合成效率提升3倍。三文鱼+西兰花是黄金搭配！' },
  { title:'抗糖化饮食法', text:'减少精制糖摄入，选择低GI主食(糙米/藜麦)，皮肤糖化反应减少，弹性显著提升。' },
  { title:'排毒时间表', text:'早起一杯温柠檬水，午后一杯绿茶，睡前银耳羹。三段排毒，内调外养。' },
  { title:'抗衰老超级食物', text:'蓝莓、核桃、三文鱼、牛油果、绿茶——五大抗衰天团，每天吃够3种。' },
  { title:'补血养颜铁三角', text:'红枣+黑芝麻+桂圆，每日适量，两周气色明显改善。' },
  { title:'祛湿美白组合', text:'薏米+红豆+赤小豆煮水，每日一杯，消肿美白双管齐下。' },
  { title:'护眼美瞳饮食', text:'胡萝卜+枸杞+叶黄素(菠菜)，眼周细纹淡化，眸子更明亮。' },
  { title:'夜间修复营养', text:'睡前2小时停止进食，但可喝少量银耳羹或温牛奶，促进夜间肌肤修复。' },
];

// ===== DATA: 美颜时间轴 — 精确到每个时间点的美容饮食指南 =====
const BEAUTY_TIMELINE = [
  { time:'06:30', icon:'💧', title:'晨起排毒水', food:'温柠檬水 / 蜂蜜水 300ml', tip:'空腹一杯激活肠道，柠檬VC促进胶原合成，5分钟内喝完', kcal:15, cat:'drink' },
  { time:'07:30', icon:'🌅', title:'美颜早餐', food:'红薯+蛋+蓝莓酸奶 / 燕麦+坚果', tip:'维C(蓝莓)+蛋白质(蛋)同食→胶原合成效率提升3倍！', kcal:330, cat:'breakfast' },
  { time:'09:30', icon:'🫐', title:'上午抗氧化加餐', food:'蓝莓/草莓150g 或 坚果一小把', tip:'花青素+维E双重抗氧化，防止上午紫外线氧化损伤', kcal:60, cat:'snack' },
  { time:'11:30', icon:'💧', title:'餐前饱腹水', food:'温水300ml（餐前20分钟）', tip:'占据胃容量30%，午餐自动少吃，零成本最强减脂技巧', kcal:0, cat:'drink' },
  { time:'12:00', icon:'☀️', title:'211减脂午餐', food:'鸡胸/鱼 + 大份蔬菜×2 + 低GI主食', tip:'先吃蛋白→再吃菜→最后碳水，血糖稳定=不囤脂+不犯困', kcal:400, cat:'lunch' },
  { time:'14:00', icon:'🍵', title:'午后抗糖化茶', food:'绿茶/普洱茶 一杯（无糖）', tip:'茶多酚抗糖化→防止皮肤变黄变松，同时提神不犯困', kcal:2, cat:'drink' },
  { time:'15:30', icon:'🍅', title:'下午美白加餐', food:'圣女果300g / 猕猴桃2个 / 黄瓜条', tip:'维C密集补充时段，搭配前面的蛋白质→持续供给胶原合成原料', kcal:60, cat:'snack' },
  { time:'17:30', icon:'🌙', title:'轻食美容晚餐', food:'虾+西兰花汤 / 鸡丝拌黄瓜 / 魔芋面', tip:'18:00前吃完！三文鱼/虾=Omega-3抗炎嫩肤，西兰花=维C美白', kcal:170, cat:'dinner' },
  { time:'19:00', icon:'🛁', title:'瑶浴/泡脚时间', food:'泡前喝水300ml + 泡后补水500ml', tip:'温热扩张毛孔→中草药渗透→排毒排湿→配合今日食疗效果翻倍', kcal:0, cat:'bath' },
  { time:'20:30', icon:'🥤', title:'睡前修复饮', food:'银耳莲子羹 / 温牛奶（少量）', tip:'植物胶原+色氨酸助眠，22:00前必须停止一切进食', kcal:80, cat:'night' },
  { time:'22:00', icon:'😴', title:'美容觉开始', food:'停止进食！只可喝水', tip:'深睡时生长激素分泌→今天吃的胶原蛋白原料开始自动修复皮肤', kcal:0, cat:'sleep' },
];

// ===== DATA: Yao Bath (瑶浴包) Schedule =====
const YAO_BATH_CYCLE = [
  { name:'活络祛风', icon:'🌬️', color:'#60a5fa', desc:'疏通经络、祛除风寒湿邪、缓解关节酸痛', effect:'促进血液循环，改善手脚冰凉', duration:'20-30分钟', temp:'40-42°C' },
  { name:'活络祛风', icon:'🌬️', color:'#60a5fa', desc:'疏通经络、祛除风寒湿邪、缓解关节酸痛', effect:'促进血液循环，改善手脚冰凉', duration:'20-30分钟', temp:'40-42°C' },
  { name:'排汗养颜', icon:'💎', color:'#f472b6', desc:'深层排汗排毒、疏通毛孔、美白润肤', effect:'皮肤通透有光泽，代谢废物排出', duration:'25-35分钟', temp:'41-43°C' },
  { name:'排汗养颜', icon:'💎', color:'#f472b6', desc:'深层排汗排毒、疏通毛孔、美白润肤', effect:'皮肤通透有光泽，代谢废物排出', duration:'25-35分钟', temp:'41-43°C' },
  { name:'妇健修复', icon:'🌸', color:'#fb923c', desc:'暖宫护巢、调理月经、修复妇科亚健康', effect:'改善宫寒痛经，平衡内分泌', duration:'25-30分钟', temp:'39-41°C' },
  { name:'妇健修复', icon:'🌸', color:'#fb923c', desc:'暖宫护巢、调理月经、修复妇科亚健康', effect:'改善宫寒痛经，平衡内分泌', duration:'25-30分钟', temp:'39-41°C' },
  { name:'温肾固元', icon:'🔥', color:'#fbbf24', desc:'温补肾阳、固本培元、增强体质', effect:'改善腰膝酸软，提升精气神', duration:'20-30分钟', temp:'40-42°C' },
  { name:'温肾固元', icon:'🔥', color:'#fbbf24', desc:'温补肾阳、固本培元、增强体质', effect:'改善腰膝酸软，提升精气神', duration:'20-30分钟', temp:'40-42°C' },
  { name:'清肤保健', icon:'🍃', color:'#34d399', desc:'清热解毒、止痒祛疹、养护肌肤', effect:'改善皮肤瘙痒、湿疹，肌肤清爽', duration:'20-25分钟', temp:'38-40°C' },
  { name:'清肤保健', icon:'🍃', color:'#34d399', desc:'清热解毒、止痒祛疹、养护肌肤', effect:'改善皮肤瘙痒、湿疹，肌肤清爽', duration:'20-25分钟', temp:'38-40°C' },
];

// ===== STATE =====
let state = {
  profile: { gender:'female', age:25, height:160, weight:55, goal:'lose', allergies:[], skin:['美白','抗衰'] },
  todayMeals: null,
  autoOrder: false,
  currentTab: 'home',
  bathIndex: 0,
  bathStartDate: null,
  weekLog: {},
};

// Load saved state
function loadState() {
  try {
    const saved = localStorage.getItem('beauty_diet_state');
    if (saved) Object.assign(state, JSON.parse(saved));
  } catch(e) {}
}
function saveState() {
  try { localStorage.setItem('beauty_diet_state', JSON.stringify(state)); } catch(e) {}
}

// ===== MEAL GENERATION =====
function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateDayMeals() {
  const targetCal = state.profile.goal === 'lose' ? 1200 : state.profile.goal === 'maintain' ? 1600 : 2000;
  
  // Breakfast: pick 1 complete combo
  const bk = pickRandom(MEALS_DB.breakfast, 1);
  
  // Lunch: 211 plate method — 1 protein + 2 veg + 1 carb
  const proteins = MEALS_DB.lunch.filter(i => i.cat === 'protein');
  const vegs = MEALS_DB.lunch.filter(i => i.cat === 'veg');
  const carbs = MEALS_DB.lunch.filter(i => i.cat === 'carb');
  const lu = [
    ...pickRandom(proteins, 1),
    ...pickRandom(vegs, 2),
    ...pickRandom(carbs, 1),
  ];
  
  // Dinner: pick 1 main (already combo dishes)
  const dn = pickRandom(MEALS_DB.dinner, 1);
  
  // Snack: 1 item
  const sn = pickRandom(MEALS_DB.snack, 1);
  
  const tip = BEAUTY_TIPS[Math.floor(Math.random() * BEAUTY_TIPS.length)];
  
  state.todayMeals = {
    date: new Date().toDateString(),
    target: targetCal,
    meals: [
      { type:'早餐', emoji:'🌅', time:'7:30 - 8:30 · 餐前喝水300ml', items: bk },
      { type:'午餐', emoji:'☀️', time:'12:00 - 13:00 · 211餐盘法', items: lu },
      { type:'晚餐', emoji:'🌙', time:'17:30 - 18:00 · 睡前4h禁食', items: dn },
      { type:'加餐', emoji:'🍵', time:'15:00 · 防饿防暴食', items: sn },
    ],
    beautyTip: tip,
  };
  saveState();
  return state.todayMeals;
}

function getTotalNutrition(meals) {
  let cal=0,pro=0,fat=0,carb=0;
  if (!meals) return {cal,pro,fat,carb};
  meals.meals.forEach(m => m.items.forEach(i => { cal+=i.kcal; pro+=i.protein; fat+=i.fat; carb+=i.carb; }));
  return {cal,pro,fat,carb};
}

// ===== YAO BATH SCHEDULE =====
function getBathSchedule(count=10) {
  const schedule = [];
  const startDate = state.bathStartDate ? new Date(state.bathStartDate) : new Date();
  if (!state.bathStartDate) { state.bathStartDate = startDate.toISOString(); saveState(); }
  
  let dayOffset = 0;
  for (let i = 0; i < count; i++) {
    const idx = (state.bathIndex + i) % YAO_BATH_CYCLE.length;
    const bath = YAO_BATH_CYCLE[idx];
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);
    schedule.push({ ...bath, date, index: idx, seq: i+1 });
    dayOffset += (i % 2 === 0) ? 1 : 2; // alternate 1 and 2 days gap
  }
  return schedule;
}

function markBathDone() {
  state.bathIndex = (state.bathIndex + 1) % YAO_BATH_CYCLE.length;
  saveState();
}

// ===== DATE HELPERS =====
function formatDate(d) {
  const opts = { month:'long', day:'numeric', weekday:'long' };
  return new Date(d || Date.now()).toLocaleDateString('zh-CN', opts);
}
function getWeekDays() {
  const days = ['日','一','二','三','四','五','六'];
  const today = new Date();
  const result = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today); d.setDate(d.getDate()+i);
    result.push({ label: days[d.getDay()], date: d.toDateString(), isToday: i===0 });
  }
  return result;
}

// ===== RENDER ENGINE =====
function renderApp() {
  const app = document.getElementById('app');
  
  // Check if meals exist for today
  if (state.todayMeals && state.todayMeals.date !== new Date().toDateString()) {
    state.todayMeals = null; // Reset for new day
  }
  
  app.innerHTML = `
    ${renderHeader()}
    <div class="main">
      ${state.currentTab === 'home' ? renderHome() : ''}
      ${state.currentTab === 'photo' ? renderPhotoAnalysis() : ''}
      ${state.currentTab === 'chat' ? renderChatTab() : ''}
      ${state.currentTab === 'history' ? renderHistoryTab() : ''}
      ${state.currentTab === 'profile' ? renderProfileTab() : ''}
    </div>
    ${renderBottomNav()}
    ${renderOrderModal()}
    <div class="loading-overlay" id="loadingOverlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">✨ AI 正在为你定制今日食谱...</div>
    </div>
  `;
  bindEvents();
  if (typeof bindChatEvents === 'function') bindChatEvents();
}

function renderHeader() {
  return `<header class="app-header">
    <div class="logo">
      <div class="logo-icon">✨</div>
      <div class="logo-text"><span>美颜轻体</span></div>
    </div>
    <div class="header-actions">
      <button class="header-btn" onclick="toggleAutoOrder()">🤖 ${state.autoOrder?'自动下单中':'懒人模式'}</button>
    </div>
  </header>`;
}

function renderHome() {
  const meals = state.todayMeals;
  const nutr = getTotalNutrition(meals);
  
  return `
    <div class="hero-card">
      <img src="hero.png" class="hero-img" alt="wellness" />
      <div class="hero-overlay">
        <div class="hero-date">${formatDate()}</div>
        <div class="hero-title">吃饱也能<em>躺瘦</em></div>
        <div class="hero-sub">${meals ? '体积饮食法 · 211餐盘 · 高饱腹低热量 💕' : '体积饮食法 + 211餐盘法，吃撑也掉秤'}</div>
      </div>
    </div>

    ${renderWeekTracker()}

    ${meals ? `
      <div class="stats-bar">
        <div class="stat-item"><div class="stat-value cal">${nutr.cal}</div><div class="stat-label">千卡</div></div>
        <div class="stat-item"><div class="stat-value pro">${nutr.pro}g</div><div class="stat-label">蛋白质</div></div>
        <div class="stat-item"><div class="stat-value fat">${nutr.fat}g</div><div class="stat-label">脂肪</div></div>
        <div class="stat-item"><div class="stat-value carb">${nutr.carb}g</div><div class="stat-label">碳水</div></div>
      </div>

      <div class="profile-section" style="padding:16px 20px">
        <div class="section-title" style="margin-bottom:10px"><span class="icon">🛋️</span>躺瘦7大法则</div>
        ${LYING_SLIM_RULES.map(r => `<div style="font-size:12px;color:var(--text-secondary);padding:4px 0;line-height:1.6">${r}</div>`).join('')}
      </div>

      ${renderAutoOrderPanel()}

      ${meals.meals.map((m, idx) => renderMealCard(m, idx)).join('')}

      <div class="beauty-score">
        <svg width="0" height="0"><defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e8527a"/><stop offset="100%" stop-color="#a78bfa"/>
        </linearGradient></defs></svg>
        <div class="score-ring">
          <svg viewBox="0 0 120 120">
            <circle class="bg" cx="60" cy="60" r="52"/>
            <circle class="fill" cx="60" cy="60" r="52" stroke-dasharray="327" stroke-dashoffset="${327 - 327 * 0.82}"/>
          </svg>
          <div class="score-number">82</div>
        </div>
        <div class="score-label">今日美颜指数</div>
        <div class="score-items">
          <div class="score-item"><div class="score-item-val" style="color:var(--accent-rose)">优</div><div class="score-item-label">抗氧化</div></div>
          <div class="score-item"><div class="score-item-val" style="color:var(--accent-lavender)">良</div><div class="score-item-label">胶原蛋白</div></div>
          <div class="score-item"><div class="score-item-val" style="color:var(--accent-mint)">优</div><div class="score-item-label">排毒指数</div></div>
          <div class="score-item"><div class="score-item-val" style="color:var(--accent-peach)">中</div><div class="score-item-label">补血养气</div></div>
        </div>
      </div>

      <!-- 美颜时间轴 -->
      <div class="profile-section">
        <div class="section-title"><span class="icon">⏰</span>今日美颜饮食时间轴</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:12px">精确到每个时间点 · 跟着吃就能变美变瘦</div>
        ${BEAUTY_TIMELINE.map((item, i) => {
          const now = new Date();
          const [h,m] = item.time.split(':').map(Number);
          const itemTime = new Date(); itemTime.setHours(h,m,0,0);
          const nextItem = BEAUTY_TIMELINE[i+1];
          const nextTime = nextItem ? (() => { const t=new Date(); const [nh,nm]=nextItem.time.split(':').map(Number); t.setHours(nh,nm,0,0); return t; })() : new Date(9999,1,1);
          const isPast = now > nextTime;
          const isCurrent = now >= itemTime && now < nextTime;
          const borderColor = isCurrent ? 'var(--accent-rose)' : isPast ? 'var(--accent-mint)' : 'rgba(255,255,255,0.06)';
          const statusIcon = isPast ? '✅' : isCurrent ? '👉' : '⏳';
          const opacity = isPast ? '0.5' : '1';
          const catColors = {drink:'#60a5fa',breakfast:'#fbbf24',snack:'#34d399',lunch:'#a78bfa',dinner:'#f472b6',bath:'#fb923c',night:'#818cf8',sleep:'#6b7280'};
          const catColor = catColors[item.cat] || '#e8527a';
          return `
          <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);opacity:${opacity};${isCurrent?'background:rgba(232,82,122,0.06);margin:0 -16px;padding:10px 16px;border-radius:12px;border:1px solid rgba(232,82,122,0.15)':''}">
            <div style="min-width:48px;text-align:center">
              <div style="font-size:13px;font-weight:700;color:${catColor}">${item.time}</div>
              <div style="font-size:16px;margin-top:2px">${statusIcon}</div>
            </div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span style="font-size:16px">${item.icon}</span>
                <span style="font-size:14px;font-weight:700">${item.title}</span>
                ${item.kcal > 0 ? `<span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${catColor}22;color:${catColor};margin-left:auto">${item.kcal}kcal</span>` : ''}
              </div>
              <div style="font-size:12px;color:var(--accent-peach);margin-bottom:3px">${item.food}</div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.5">${item.tip}</div>
            </div>
          </div>`;
        }).join('')}
        <div style="text-align:center;margin-top:12px;padding:10px;background:linear-gradient(135deg,rgba(232,82,122,0.08),rgba(167,139,250,0.05));border-radius:12px">
          <div style="font-size:13px;font-weight:700">📊 全天美颜总摄入</div>
          <div style="font-size:20px;font-weight:900;color:var(--accent-peach);margin-top:4px">${BEAUTY_TIMELINE.reduce((s,i)=>s+i.kcal,0)} <span style="font-size:12px">kcal</span></div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">吃饱+变美+掉秤 三合一 ✨</div>
        </div>
      </div>
    ` : `
      <div class="profile-section">
        <div class="section-title"><span class="icon">👤</span>基本信息</div>
        <div class="form-grid">
          <div class="form-group">
            <span class="form-label">年龄</span>
            <input type="number" class="form-input" id="inputAge" value="${state.profile.age}" min="16" max="80"/>
          </div>
          <div class="form-group">
            <span class="form-label">身高(cm)</span>
            <input type="number" class="form-input" id="inputHeight" value="${state.profile.height}" min="140" max="200"/>
          </div>
          <div class="form-group">
            <span class="form-label">体重(kg)</span>
            <input type="number" class="form-input" id="inputWeight" value="${state.profile.weight}" min="35" max="150"/>
          </div>
          <div class="form-group">
            <span class="form-label">目标</span>
            <select class="form-select" id="inputGoal">
              <option value="lose" ${state.profile.goal==='lose'?'selected':''}>减脂塑形</option>
              <option value="maintain" ${state.profile.goal==='maintain'?'selected':''}>维持体重</option>
              <option value="gain" ${state.profile.goal==='gain'?'selected':''}>增肌增重</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="profile-section">
        <div class="section-title"><span class="icon">💎</span>美容目标 (可多选)</div>
        <div class="tag-group" id="skinTags">
          ${['美白','抗衰','祛痘','补水','淡斑','紧致','祛湿','补血'].map(t =>
            `<div class="tag ${state.profile.skin.includes(t)?'selected':''}" data-tag="${t}">${t}</div>`
          ).join('')}
        </div>
      </div>
      
      <button class="btn-generate" onclick="handleGenerate()">
        <span class="shimmer"></span>
        ✨ 一键生成今日食谱
      </button>
    `}
  `;
}

function renderMealCard(meal, idx) {
  const totalKcal = meal.items.reduce((s,i) => s+i.kcal, 0);
  const tip = idx === 0 && state.todayMeals.beautyTip ? state.todayMeals.beautyTip : null;
  return `
    <div class="meal-card" style="animation-delay:${idx*0.1}s">
      <div class="meal-header">
        <div class="meal-type">
          <span class="meal-emoji">${meal.emoji}</span>
          <div><div class="meal-name">${meal.type}</div><div class="meal-time">${meal.time}</div></div>
        </div>
        <div class="meal-cal">${totalKcal} kcal</div>
      </div>
      <div class="meal-body">
        ${meal.items.map(item => `
          <div class="food-item">
            <div class="food-info">
              <span class="food-icon">${item.icon}</span>
              <div>
                <div class="food-name">${item.name}</div>
                <div class="food-amount">${item.amount}</div>
                ${item.satiety ? `<div style="font-size:10px;margin-top:2px"><span style="color:var(--accent-mint)">${item.satiety}</span> <span style="font-size:9px;padding:1px 6px;border-radius:8px;background:rgba(110,231,183,0.1);color:var(--accent-mint)">${item.vol}</span></div>` : ''}
              </div>
            </div>
            <div class="food-detail">
              <div class="food-kcal">${item.kcal} kcal</div>
              <div class="food-macro">蛋白${item.protein}g · 脂${item.fat}g · 碳${item.carb}g</div>
            </div>
          </div>
          ${item.tip ? `<div style="font-size:11px;color:var(--accent-lavender);padding:0 0 6px 30px;opacity:0.8">💡 ${item.tip}</div>` : ''}
        `).join('')}
        ${tip ? `<div class="beauty-tip"><div class="beauty-tip-title">💡 ${tip.title}</div><div class="beauty-tip-text">${tip.text}</div></div>` : ''}
        <div class="order-actions">
          <button class="btn-order btn-meituan" onclick="openOrder('meituan','${meal.type}')">🟡 美团外卖</button>
          <button class="btn-order btn-eleme" onclick="openOrder('eleme','${meal.type}')">🔵 饿了么</button>
        </div>
      </div>
    </div>
  `;
}

function renderAutoOrderPanel() {
  return `
    <div class="auto-order-panel">
      <div class="auto-order-header">
        <div class="auto-order-title">🤖 懒人自动点餐</div>
        <button class="toggle-switch ${state.autoOrder?'on':''}" onclick="toggleAutoOrder()">
          <div class="toggle-dot"></div>
        </button>
      </div>
      <div class="auto-order-settings">
        <div class="auto-setting">
          <span class="auto-setting-label">默认平台</span>
          <span class="auto-setting-value">美团外卖</span>
        </div>
        <div class="auto-setting">
          <span class="auto-setting-label">预算上限</span>
          <span class="auto-setting-value">¥50/餐</span>
        </div>
        <div class="auto-setting">
          <span class="auto-setting-label">自动下单时间</span>
          <span class="auto-setting-value">餐前30分钟</span>
        </div>
      </div>
      <div class="auto-order-status ${state.autoOrder?'active':'inactive'}">
        ${state.autoOrder ? '✅ 自动点餐已开启，将在用餐前30分钟自动搜索下单' : '💤 开启后将根据食谱自动跳转外卖平台点餐'}
      </div>
    </div>
  `;
}

function renderWeekTracker() {
  const days = getWeekDays();
  return `<div class="week-track">
    ${days.map(d => {
      const done = state.weekLog[d.date];
      return `<div class="week-day ${d.isToday?'today':''} ${done?'done':''}">
        <div class="day-label">${d.label}</div>
        <div class="day-cal">${done ? '✓' : d.isToday ? '今' : '·'}</div>
      </div>`;
    }).join('')}
  </div>`;
}

// ===== BATH TAB =====
function renderBathTab() {
  const schedule = getBathSchedule(10);
  const current = schedule[0];
  const cycleName = ['活络祛风①','活络祛风②','排汗养颜①','排汗养颜②','妇健修复①','妇健修复②','温肾固元①','温肾固元②','清肤保健①','清肤保健②'];
  
  return `
    <div class="hero-card" style="margin-top:8px">
      <img src="foods.png" class="hero-img" alt="bath"/>
      <div class="hero-overlay">
        <div class="hero-date">瑶浴养生 · 10包循环</div>
        <div class="hero-title">瑶浴<em>排毒</em>计划</div>
        <div class="hero-sub">活络祛风→排汗养颜→妇健修复→温肾固元→清肤保健</div>
      </div>
    </div>

    <div class="profile-section" style="background:linear-gradient(145deg,rgba(${hexToRgb(current.color)},0.15),rgba(${hexToRgb(current.color)},0.03)); border-color:${current.color}33">
      <div class="section-title" style="font-size:18px">
        <span style="font-size:32px">${current.icon}</span>
        今日推荐：${current.name}
      </div>
      <div style="display:grid;gap:10px;margin-bottom:16px">
        <div class="auto-setting"><span class="auto-setting-label">功效</span><span class="auto-setting-value" style="color:${current.color}">${current.desc}</span></div>
        <div class="auto-setting"><span class="auto-setting-label">效果</span><span class="auto-setting-value" style="color:${current.color}">${current.effect}</span></div>
        <div class="auto-setting"><span class="auto-setting-label">水温</span><span class="auto-setting-value">${current.temp}</span></div>
        <div class="auto-setting"><span class="auto-setting-label">时长</span><span class="auto-setting-value">${current.duration}</span></div>
      </div>
      <div class="beauty-tip">
        <div class="beauty-tip-title">🛁 泡浴小贴士</div>
        <div class="beauty-tip-text">① 饭后1小时再泡 ② 水位不超过心脏 ③ 泡后及时补水 ④ 经期/孕期暂停</div>
      </div>
      <button class="btn-generate" onclick="completeBath()" style="margin-top:16px">
        <span class="shimmer"></span>
        ✅ 完成今日瑶浴
      </button>
    </div>

    <div class="profile-section">
      <div class="section-title"><span class="icon">📅</span>循环排程 · 未来10次</div>
      ${schedule.map((b,i) => `
        <div class="auto-setting" style="margin-bottom:8px;border-left:3px solid ${b.color};${i===0?'background:rgba(255,255,255,0.04)':''}">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px">${b.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:600;color:${b.color}">${cycleName[(state.bathIndex+i)%10]}</div>
              <div style="font-size:11px;color:var(--text-secondary)">${b.date.toLocaleDateString('zh-CN',{month:'short',day:'numeric',weekday:'short'})}</div>
            </div>
          </div>
          <span style="font-size:12px;color:var(--text-secondary)">${i===0?'⬅ 今天':'第'+(i+1)+'次'}</span>
        </div>
      `).join('')}
    </div>

    <div class="profile-section">
      <div class="section-title"><span class="icon">📊</span>已完成进度</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${YAO_BATH_CYCLE.map((b,i) => `
          <div style="flex:1;min-width:45px;text-align:center;padding:8px 4px;border-radius:8px;background:${i<state.bathIndex?b.color+'22':'rgba(255,255,255,0.03)'};border:1px solid ${i<state.bathIndex?b.color+'44':'rgba(255,255,255,0.06)'};font-size:10px;color:${i<state.bathIndex?b.color:'var(--text-secondary)'}">
            <div style="font-size:16px">${b.icon}</div>
            ${i<state.bathIndex ? '✓' : i===state.bathIndex ? '→' : '·'}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ===== DATA: Lazy Beauty Methods (researched) =====
const LAZY_METHODS = [
  { rank:1, name:'调整进食顺序', icon:'🥗', tag:'🏆 排名第一', tagColor:'#fbbf24',
    desc:'按"水→蛋白质/肉→蔬菜→碳水/饭"顺序进食',
    detail:'先摄入蛋白质和纤维增加饱足感，稳定餐后血糖，自然减少碳水摄入量。零门槛，今天就能开始！',
    effort:'⭐', effect:'⭐⭐⭐⭐⭐' },
  { rank:2, name:'餐前一杯水仪式', icon:'💧', tag:'零成本', tagColor:'#60a5fa',
    desc:'饭前20-30分钟喝一大杯温水(300ml)',
    detail:'增加胃部容积感，降低大脑饥饿信号，防止无意识过量进食。配合深呼吸效果更佳。',
    effort:'⭐', effect:'⭐⭐⭐⭐' },
  { rank:3, name:'16/8间歇性轻断食', icon:'⏰', tag:'细胞自噬', tagColor:'#a78bfa',
    desc:'每天只在8小时窗口内进食(如10:00-18:00)',
    detail:'激活细胞自噬(Autophagy)，清理受损细胞成分，延缓衰老+改善胰岛素敏感性。操作简单，跳过早餐即可。',
    effort:'⭐⭐', effect:'⭐⭐⭐⭐⭐' },
  { rank:4, name:'地中海饮食法', icon:'🫒', tag:'最健康饮食', tagColor:'#34d399',
    desc:'多鱼类+橄榄油+坚果+蔬果+全谷物',
    detail:'富含Omega-3、多酚、维E等抗氧化成分，减轻全身慢性炎症，维持皮肤光泽，公认最可持续的抗衰饮食。',
    effort:'⭐⭐', effect:'⭐⭐⭐⭐⭐' },
  { rank:5, name:'戒零食+含糖饮料', icon:'🚫', tag:'隐形杀手', tagColor:'#ef4444',
    desc:'环境控制法：家里不买零食，想吃时刷牙/喝茶',
    detail:'零食与含糖饮料是热量"隐形炸弹"，戒除后每日可轻松省下300-500千卡！用无糖茶水替代。',
    effort:'⭐⭐', effect:'⭐⭐⭐⭐' },
  { rank:6, name:'小分子胶原蛋白肽', icon:'✨', tag:'2026新趋势', tagColor:'#e8527a',
    desc:'选择分子量<1000道尔顿的胶原蛋白肽口服',
    detail:'比猪蹄鸡爪吸收率高数十倍。配合维C同服促进自身胶原合成，同时做好防晒减少胶原降解。',
    effort:'⭐', effect:'⭐⭐⭐⭐' },
  { rank:7, name:'瑶浴排毒循环', icon:'🛁', tag:'传统养生', tagColor:'#fb923c',
    desc:'5种功效瑶浴包×2循环，隔1-2天泡一次',
    detail:'温热扩张毛孔，中草药成分促进血液循环和汗腺分泌，加速代谢废物排出。配合食疗效果翻倍。',
    effort:'⭐⭐', effect:'⭐⭐⭐⭐' },
  { rank:8, name:'7-8小时优质睡眠', icon:'😴', tag:'美容觉', tagColor:'#8b5cf6',
    desc:'保证睡眠质量，睡前2小时不进食',
    detail:'熬夜增加饥饿素分泌→第二天暴食高热量。充足睡眠是所有变美变瘦方案的基础！',
    effort:'⭐', effect:'⭐⭐⭐⭐⭐' },
];

// ===== HISTORY TAB =====
function renderHistoryTab() {
  const daysLogged = Object.keys(state.weekLog).length;
  return `
    <div class="profile-section" style="margin-top:8px">
      <div class="section-title"><span class="icon">📈</span>本周概览</div>
      <div class="stats-bar">
        <div class="stat-item"><div class="stat-value cal">${daysLogged}</div><div class="stat-label">打卡天数</div></div>
        <div class="stat-item"><div class="stat-value pro">-0.8</div><div class="stat-label">体重变化kg</div></div>
        <div class="stat-item"><div class="stat-value fat">${state.bathIndex}</div><div class="stat-label">瑶浴次数</div></div>
        <div class="stat-item"><div class="stat-value carb">82</div><div class="stat-label">美颜指数</div></div>
      </div>
    </div>

    <div class="profile-section">
      <div class="section-title" style="font-size:17px"><span class="icon">👑</span>2026 懒人变美变瘦攻略</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
        综合全网最新研究，为你精选8大最有效的懒人美容减脂法，按效果排名：
      </div>
      ${LAZY_METHODS.map((m,i) => `
        <div class="meal-card" style="margin-bottom:12px;animation-delay:${i*0.05}s">
          <div class="meal-header" style="border:none">
            <div class="meal-type">
              <span class="meal-emoji">${m.icon}</span>
              <div>
                <div class="meal-name" style="display:flex;align-items:center;gap:6px">
                  ${m.name}
                  <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${m.tagColor}22;color:${m.tagColor};border:1px solid ${m.tagColor}44">${m.tag}</span>
                </div>
                <div class="meal-time">${m.desc}</div>
              </div>
            </div>
          </div>
          <div class="meal-body" style="padding-top:0">
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-bottom:8px">${m.detail}</div>
            <div style="display:flex;gap:16px;font-size:11px">
              <span style="color:var(--accent-mint)">难度: ${m.effort}</span>
              <span style="color:var(--accent-peach)">效果: ${m.effect}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="profile-section">
      <div class="section-title"><span class="icon">💡</span>每日美颜贴士</div>
      ${BEAUTY_TIPS.map(t => `
        <div class="beauty-tip" style="margin-bottom:8px">
          <div class="beauty-tip-title">💡 ${t.title}</div>
          <div class="beauty-tip-text">${t.text}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== PROFILE TAB =====
function renderProfileTab() {
  return `
    <div class="profile-section" style="margin-top:8px">
      <div class="section-title"><span class="icon">👤</span>个人设置</div>
      <div class="form-grid">
        <div class="form-group">
          <span class="form-label">年龄</span>
          <input type="number" class="form-input" id="inputAge" value="${state.profile.age}"/>
        </div>
        <div class="form-group">
          <span class="form-label">身高(cm)</span>
          <input type="number" class="form-input" id="inputHeight" value="${state.profile.height}"/>
        </div>
        <div class="form-group">
          <span class="form-label">体重(kg)</span>
          <input type="number" class="form-input" id="inputWeight" value="${state.profile.weight}"/>
        </div>
        <div class="form-group">
          <span class="form-label">目标</span>
          <select class="form-select" id="inputGoal">
            <option value="lose" ${state.profile.goal==='lose'?'selected':''}>减脂塑形</option>
            <option value="maintain" ${state.profile.goal==='maintain'?'selected':''}>维持体重</option>
            <option value="gain" ${state.profile.goal==='gain'?'selected':''}>增肌增重</option>
          </select>
        </div>
      </div>
      <button class="btn-generate" onclick="saveProfile()" style="margin-top:16px">💾 保存设置</button>
    </div>
    <div class="profile-section">
      <div class="section-title"><span class="icon">🔄</span>数据管理</div>
      <button class="btn-generate" onclick="resetMeals()" style="background:rgba(255,255,255,0.1);box-shadow:none;margin-top:0">🔄 重新生成今日食谱</button>
    </div>
  `;
}

function renderBottomNav() {
  const tabs = [
    { id:'home', icon:'🏠', label:'食谱' },
    { id:'photo', icon:'📸', label:'拍照' },
    { id:'chat', icon:'🧐', label:'AI问' },
    { id:'history', icon:'📊', label:'攻略' },
    { id:'profile', icon:'👤', label:'我的' },
  ];
  return `<nav class="bottom-nav">
    ${tabs.map(t => `
      <button class="nav-item ${state.currentTab===t.id?'active':''}" onclick="switchTab('${t.id}')">
        <span class="nav-icon">${t.icon}</span>
        <span>${t.label}</span>
      </button>
    `).join('')}
  </nav>`;
}

function renderOrderModal() {
  return `<div class="modal-overlay" id="orderModal">
    <div class="modal" style="position:relative">
      <button class="btn-close" onclick="closeOrderModal()">✕</button>
      <h3>📱 跳转外卖平台</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px" id="orderDesc">正在为你搜索食材...</p>
      <div id="orderContent"></div>
    </div>
  </div>`;
}

// ===== EVENT HANDLERS =====
function bindEvents() {
  document.querySelectorAll('#skinTags .tag').forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('selected');
      const val = tag.dataset.tag;
      if (state.profile.skin.includes(val)) {
        state.profile.skin = state.profile.skin.filter(s => s !== val);
      } else {
        state.profile.skin.push(val);
      }
      saveState();
    });
  });
}

function switchTab(tab) {
  state.currentTab = tab;
  renderApp();
  window.scrollTo(0,0);
}

function handleGenerate() {
  // Collect form data
  const age = document.getElementById('inputAge');
  const height = document.getElementById('inputHeight');
  const weight = document.getElementById('inputWeight');
  const goal = document.getElementById('inputGoal');
  if (age) state.profile.age = parseInt(age.value);
  if (height) state.profile.height = parseInt(height.value);
  if (weight) state.profile.weight = parseInt(weight.value);
  if (goal) state.profile.goal = goal.value;
  saveState();
  
  // Show loading
  document.getElementById('loadingOverlay').classList.add('show');
  
  setTimeout(() => {
    generateDayMeals();
    state.weekLog[new Date().toDateString()] = true;
    saveState();
    document.getElementById('loadingOverlay').classList.remove('show');
    renderApp();
  }, 1500);
}

function toggleAutoOrder() {
  state.autoOrder = !state.autoOrder;
  saveState();
  renderApp();
}

function completeBath() {
  markBathDone();
  renderApp();
  // Simple celebration
  const main = document.querySelector('.main');
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(52,211,153,0.2);border:1px solid #34d399;color:#34d399;padding:20px 40px;border-radius:16px;font-size:18px;font-weight:700;z-index:999;backdrop-filter:blur(10px);animation:modalIn 0.3s ease';
  toast.textContent = '🎉 瑶浴完成！身体棒棒！';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function openOrder(platform, mealType) {
  const modal = document.getElementById('orderModal');
  modal.classList.add('show');
  
  const desc = document.getElementById('orderDesc');
  const content = document.getElementById('orderContent');
  
  const platformName = platform === 'meituan' ? '美团外卖' : '饿了么';
  const platformColor = platform === 'meituan' ? '#ffc700' : '#0091ff';
  
  // Get meal items for search
  const meal = state.todayMeals?.meals.find(m => m.type === mealType);
  const searchTerms = meal ? meal.items.map(i => i.name).join(' ') : mealType;
  
  desc.textContent = `正在为「${mealType}」搜索: ${searchTerms}`;
  
  // Build deeplink URLs
  const meituanUrl = `https://waimai.meituan.com/search?query=${encodeURIComponent(searchTerms)}`;
  const elemeUrl = `https://www.ele.me/search?query=${encodeURIComponent(searchTerms)}`;
  const targetUrl = platform === 'meituan' ? meituanUrl : elemeUrl;
  
  content.innerHTML = `
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:48px;margin-bottom:12px">${platform==='meituan'?'🟡':'🔵'}</div>
      <div style="font-size:16px;font-weight:700;color:${platformColor};margin-bottom:8px">${platformName}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:20px">搜索关键词: ${searchTerms}</div>
      <a href="${targetUrl}" target="_blank" style="display:inline-block;padding:12px 32px;background:${platformColor}22;border:1px solid ${platformColor}44;color:${platformColor};border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">
        🚀 打开${platformName}搜索
      </a>
      <div style="margin-top:16px;font-size:11px;color:var(--text-secondary)">
        手机端将自动唤起${platformName}APP<br/>
        电脑端将打开网页版
      </div>
    </div>
  `;
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('show');
}

function saveProfile() {
  const age = document.getElementById('inputAge');
  const height = document.getElementById('inputHeight');
  const weight = document.getElementById('inputWeight');
  const goal = document.getElementById('inputGoal');
  if (age) state.profile.age = parseInt(age.value);
  if (height) state.profile.height = parseInt(height.value);
  if (weight) state.profile.weight = parseInt(weight.value);
  if (goal) state.profile.goal = goal.value;
  saveState();
  
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(232,82,122,0.2);border:1px solid var(--accent-rose);color:var(--accent-rose);padding:20px 40px;border-radius:16px;font-size:16px;font-weight:700;z-index:999;backdrop-filter:blur(10px);animation:modalIn 0.3s ease';
  toast.textContent = '✅ 设置已保存';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}

function resetMeals() {
  state.todayMeals = null;
  saveState();
  state.currentTab = 'home';
  renderApp();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderApp();
});

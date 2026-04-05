// ============================================================
//  AI 食物拍照分析模块 — Gemini Vision API
//  功能: 拍照/上传食物图片 → AI识别食物 → 估算热量营养 → 美容减脂建议
// ============================================================

const GEMINI_API_KEY = 'AIzaSyCxeteFi9QNGoSnZHffsGCKUWykfv-dabc';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ===== 图片转Base64 =====
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===== 压缩图片 (避免超过API限制) =====
function compressImage(file, maxWidth = 800) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
}

// ===== AI 食物分析核心函数 =====
async function analyzeFood(imageBase64, mealType = '未知') {
  const prompt = `你是一位专业的营养师和美容养生专家。请分析这张食物照片，返回以下JSON格式（不要包含markdown标记，直接返回JSON）：

{
  "foods": [
    {
      "name": "食物名称",
      "amount": "估算份量(g/ml)",
      "calories": 数字(kcal),
      "protein": 数字(g),
      "fat": 数字(g),
      "carbs": 数字(g),
      "fiber": 数字(g)
    }
  ],
  "totalCalories": 总热量数字,
  "totalProtein": 总蛋白质数字,
  "totalFat": 总脂肪数字,
  "totalCarbs": 总碳水数字,
  "satietyScore": "饱腹评分1-10",
  "beautyScore": "美容评分1-10",
  "dietScore": "减脂评分1-10",
  "verdict": "一句话总评(比如：这餐搭配不错/热量偏高建议减少主食等)",
  "beautyTip": "从美容养颜角度的建议(如：缺少维C来源，建议加一份西兰花)",
  "dietTip": "从减脂角度的建议(如：碳水偏多，建议用糙米替代白米)",
  "betterAlternative": "更健康的替代方案建议(如：建议把炸鸡换成清蒸鸡胸肉，热量从500降到165kcal)",
  "nextMealSuggestion": "根据这餐摄入，建议下一餐吃什么(如：这餐蛋白质充足但缺纤维，晚餐建议大份蔬菜+清汤)"
}

注意：
1. 尽量准确估算份量和热量，参考中国营养成分表
2. 美容评分考虑：抗氧化成分、维C、胶原蛋白原、Omega-3等
3. 减脂评分考虑：GI值、蛋白质比例、纤维含量、总热量
4. 这是${mealType}的照片
5. 必须返回有效的JSON，不要加任何markdown标记`;

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: imageBase64
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Extract JSON from response (handle possible markdown wrapping)
  let jsonStr = text;
  const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) jsonStr = jsonMatch[1];
  // Also try to find raw JSON
  const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (braceMatch) jsonStr = braceMatch[0];
  
  return JSON.parse(jsonStr);
}

// ===== AI 每日饮食建议 =====
async function getAIDietAdvice(userProfile, todayIntake) {
  const prompt = `你是专业营养师兼美容养生顾问。根据以下信息给出今日剩余餐食建议，返回JSON格式（不要markdown标记）：

用户信息：
- 年龄：${userProfile.age}岁，身高：${userProfile.height}cm，体重：${userProfile.weight}kg
- 目标：${userProfile.goal === 'lose' ? '减脂塑形' : userProfile.goal === 'maintain' ? '维持体重' : '增肌'}
- 美容目标：${userProfile.skin.join('、')}

今日已摄入：
- 总热量：${todayIntake.calories}kcal
- 蛋白质：${todayIntake.protein}g
- 脂肪：${todayIntake.fat}g  
- 碳水：${todayIntake.carbs}g
- 已吃的餐次：${todayIntake.mealsEaten.join('、')}

请返回JSON：
{
  "remainingCalories": 今日剩余可摄入热量,
  "advice": "整体建议",
  "nextMeal": {
    "type": "下一餐类型(午餐/晚餐/加餐)",
    "items": [
      {"name":"推荐食物","amount":"份量","calories":热量,"reason":"推荐理由(从美容减脂角度)"}
    ],
    "totalCalories": 下一餐建议总热量
  },
  "beautyFocus": "今日美容重点建议(比如：今天维C摄入不足，建议加猕猴桃)",
  "warning": "如有需要注意的(比如：碳水已超标，剩余餐次避免淀粉类)"
}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1500 }
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let jsonStr = text;
  const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) jsonStr = jsonMatch[1];
  const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (braceMatch) jsonStr = braceMatch[0];
  
  return JSON.parse(jsonStr);
}

// ===== 食物分析记录管理 =====
function getFoodLog() {
  try {
    return JSON.parse(localStorage.getItem('beauty_diet_food_log') || '[]');
  } catch(e) { return []; }
}

function saveFoodEntry(entry) {
  const log = getFoodLog();
  log.push({
    ...entry,
    timestamp: Date.now(),
    date: new Date().toDateString()
  });
  localStorage.setItem('beauty_diet_food_log', JSON.stringify(log));
}

function getTodayLog() {
  const today = new Date().toDateString();
  return getFoodLog().filter(e => e.date === today);
}

function getTodayIntake() {
  const todayEntries = getTodayLog();
  const result = {
    calories: 0, protein: 0, fat: 0, carbs: 0,
    mealsEaten: [], entries: todayEntries
  };
  todayEntries.forEach(e => {
    result.calories += e.totalCalories || 0;
    result.protein += e.totalProtein || 0;
    result.fat += e.totalFat || 0;
    result.carbs += e.totalCarbs || 0;
    if (e.mealType && !result.mealsEaten.includes(e.mealType)) {
      result.mealsEaten.push(e.mealType);
    }
  });
  return result;
}

// ===== UI: 拍照分析面板 =====
function renderPhotoAnalysis() {
  const todayEntries = getTodayLog();
  const intake = getTodayIntake();
  const targetCal = state.profile.goal === 'lose' ? 1200 : state.profile.goal === 'maintain' ? 1600 : 2000;
  const remaining = Math.max(0, targetCal - intake.calories);
  const pct = Math.min(100, Math.round(intake.calories / targetCal * 100));
  
  return `
    <div class="hero-card" style="margin-top:8px">
      <img src="foods.png" class="hero-img" alt="ai-food"/>
      <div class="hero-overlay">
        <div class="hero-date">AI 食物分析 · Gemini Vision</div>
        <div class="hero-title">拍照<em>识卡</em></div>
        <div class="hero-sub">拍一张→AI 秒算热量→给你美容减脂建议</div>
      </div>
    </div>

    <!-- 今日摄入概要 -->
    <div class="profile-section">
      <div class="section-title"><span class="icon">📊</span>今日摄入追踪</div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary);margin-bottom:6px">
          <span>已摄入 ${intake.calories} kcal</span>
          <span>剩余 ${remaining} kcal</span>
        </div>
        <div style="height:8px;border-radius:4px;background:rgba(255,255,255,0.06);overflow:hidden">
          <div style="height:100%;width:${pct}%;border-radius:4px;background:${pct>100?'var(--accent-rose)':pct>80?'var(--accent-peach)':'var(--accent-mint)'};transition:width 0.5s"></div>
        </div>
      </div>
      <div class="stats-bar" style="margin-bottom:0">
        <div class="stat-item"><div class="stat-value cal">${intake.calories}</div><div class="stat-label">已摄入kcal</div></div>
        <div class="stat-item"><div class="stat-value pro">${intake.protein}g</div><div class="stat-label">蛋白质</div></div>
        <div class="stat-item"><div class="stat-value fat">${intake.fat}g</div><div class="stat-label">脂肪</div></div>
        <div class="stat-item"><div class="stat-value carb">${intake.carbs}g</div><div class="stat-label">碳水</div></div>
      </div>
    </div>

    <!-- 拍照/上传区域 -->
    <div class="profile-section" style="text-align:center">
      <div class="section-title" style="justify-content:center"><span class="icon">📸</span>拍照分析食物</div>
      
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px">
        <label class="btn-generate" style="width:auto;padding:14px 24px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px">
          <span class="shimmer"></span>
          📷 拍照
          <input type="file" accept="image/*" capture="environment" id="cameraInput" style="display:none" onchange="handleFoodPhoto(this, 'camera')"/>
        </label>
        <label class="btn-generate" style="width:auto;padding:14px 24px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;background:linear-gradient(135deg,#a78bfa,#6366f1)">
          <span class="shimmer"></span>
          🖼️ 相册
          <input type="file" accept="image/*" id="galleryInput" style="display:none" onchange="handleFoodPhoto(this, 'gallery')"/>
        </label>
      </div>

      <select class="form-select" id="mealTypeSelect" style="width:auto;margin:0 auto;text-align:center">
        <option value="早餐">🌅 这是早餐</option>
        <option value="午餐" selected>☀️ 这是午餐</option>
        <option value="晚餐">🌙 这是晚餐</option>
        <option value="加餐">🍵 这是加餐</option>
      </select>

      <!-- 预览区域 -->
      <div id="photoPreview" style="margin-top:16px;display:none">
        <img id="previewImg" style="width:100%;max-height:250px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid rgba(255,255,255,0.1)"/>
      </div>

      <!-- AI 分析结果 -->
      <div id="analysisResult" style="margin-top:16px"></div>
    </div>

    <!-- AI 下一餐建议 -->
    ${intake.calories > 0 ? `
    <div class="profile-section">
      <div class="section-title"><span class="icon">🤖</span>AI 智能推荐下一餐</div>
      <button class="btn-generate" onclick="getNextMealAdvice()" style="background:linear-gradient(135deg,#6366f1,#a78bfa)">
        <span class="shimmer"></span>
        🧠 问AI：下一餐该吃什么？
      </button>
      <div id="aiAdviceResult" style="margin-top:16px"></div>
    </div>
    ` : ''}

    <!-- 今日分析历史 -->
    ${todayEntries.length > 0 ? `
    <div class="profile-section">
      <div class="section-title"><span class="icon">📋</span>今日分析记录 (${todayEntries.length}条)</div>
      ${todayEntries.map((e, i) => `
        <div class="meal-card" style="margin-bottom:10px">
          <div class="meal-header" style="border:none">
            <div class="meal-type">
              <span class="meal-emoji">${e.mealType==='早餐'?'🌅':e.mealType==='午餐'?'☀️':e.mealType==='晚餐'?'🌙':'🍵'}</span>
              <div>
                <div class="meal-name">${e.mealType} · ${new Date(e.timestamp).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}</div>
                <div class="meal-time">${e.foods?.map(f=>f.name).join('、') || '未知食物'}</div>
              </div>
            </div>
            <div class="meal-cal">${e.totalCalories} kcal</div>
          </div>
          ${e.verdict ? `<div style="padding:0 20px 12px;font-size:12px;color:var(--text-secondary)">${e.verdict}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
  `;
}

// ===== 拍照处理 =====
async function handleFoodPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  
  // Show preview
  const preview = document.getElementById('photoPreview');
  const previewImg = document.getElementById('previewImg');
  const resultDiv = document.getElementById('analysisResult');
  const mealType = document.getElementById('mealTypeSelect').value;
  
  preview.style.display = 'block';
  previewImg.src = URL.createObjectURL(file);
  
  // Show loading
  resultDiv.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div class="loading-spinner" style="width:40px;height:40px;margin:0 auto 12px"></div>
      <div style="font-size:13px;color:var(--text-secondary)">🔍 Gemini AI 正在分析你的${mealType}...</div>
      <div style="font-size:11px;color:var(--text-secondary);margin-top:6px">识别食物 → 估算热量 → 生成建议</div>
    </div>
  `;
  
  try {
    // Compress and convert to base64
    const compressed = await compressImage(file);
    const base64 = await imageToBase64(compressed);
    
    // Call Gemini Vision API
    const result = await analyzeFood(base64, mealType);
    
    // Save to log
    saveFoodEntry({ ...result, mealType });
    
    // Display result
    resultDiv.innerHTML = renderAnalysisResult(result, mealType);
    
    // Refresh the page's intake counter after a moment
    setTimeout(() => {
      // Update just the stats without full re-render to preserve the result
      const intake = getTodayIntake();
      const targetCal = state.profile.goal === 'lose' ? 1200 : 1600;
      document.querySelectorAll('.stat-value.cal').forEach(el => {
        if (el.closest('.profile-section')) el.textContent = intake.calories;
      });
    }, 500);
    
  } catch (error) {
    resultDiv.innerHTML = `
      <div style="padding:16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-sm);text-align:left">
        <div style="font-size:14px;font-weight:700;color:#ef4444;margin-bottom:8px">❌ 分析失败</div>
        <div style="font-size:12px;color:var(--text-secondary)">${error.message}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:8px">请检查网络连接，或尝试换一张更清晰的照片</div>
      </div>
    `;
  }
}

// ===== 渲染分析结果 =====
function renderAnalysisResult(result, mealType) {
  const getScoreColor = (score) => {
    const s = parseInt(score);
    if (s >= 8) return 'var(--accent-mint)';
    if (s >= 5) return 'var(--accent-peach)';
    return 'var(--accent-rose)';
  };

  return `
    <div style="text-align:left">
      <!-- 评分栏 -->
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <div style="flex:1;text-align:center;padding:12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
          <div style="font-size:24px;font-weight:900;color:${getScoreColor(result.dietScore)}">${result.dietScore}</div>
          <div style="font-size:10px;color:var(--text-secondary)">减脂评分</div>
        </div>
        <div style="flex:1;text-align:center;padding:12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
          <div style="font-size:24px;font-weight:900;color:${getScoreColor(result.beautyScore)}">${result.beautyScore}</div>
          <div style="font-size:10px;color:var(--text-secondary)">美颜评分</div>
        </div>
        <div style="flex:1;text-align:center;padding:12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
          <div style="font-size:24px;font-weight:900;color:${getScoreColor(result.satietyScore)}">${result.satietyScore}</div>
          <div style="font-size:10px;color:var(--text-secondary)">饱腹评分</div>
        </div>
      </div>

      <!-- 总热量 -->
      <div style="text-align:center;padding:12px;background:linear-gradient(135deg,rgba(232,82,122,0.1),rgba(167,139,250,0.06));border-radius:var(--radius-sm);margin-bottom:16px">
        <div style="font-size:28px;font-weight:900;color:var(--accent-peach)">${result.totalCalories} <span style="font-size:14px">kcal</span></div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">
          蛋白 ${result.totalProtein}g · 脂肪 ${result.totalFat}g · 碳水 ${result.totalCarbs}g
        </div>
      </div>

      <!-- 食物明细 -->
      <div style="margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">🍽️ 识别到的食物</div>
        ${(result.foods || []).map(f => `
          <div class="food-item">
            <div class="food-info">
              <span class="food-icon">🔸</span>
              <div><div class="food-name">${f.name}</div><div class="food-amount">${f.amount}</div></div>
            </div>
            <div class="food-detail">
              <div class="food-kcal">${f.calories} kcal</div>
              <div class="food-macro">蛋白${f.protein}g · 脂${f.fat}g · 碳${f.carbs}g</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- AI 建议 -->
      <div class="beauty-tip" style="border-left-color:var(--accent-mint)">
        <div class="beauty-tip-title" style="color:var(--accent-mint)">📝 总评</div>
        <div class="beauty-tip-text">${result.verdict || ''}</div>
      </div>
      
      <div class="beauty-tip" style="margin-top:8px;border-left-color:var(--accent-rose)">
        <div class="beauty-tip-title" style="color:var(--accent-rose)">💎 美容建议</div>
        <div class="beauty-tip-text">${result.beautyTip || ''}</div>
      </div>

      <div class="beauty-tip" style="margin-top:8px;border-left-color:var(--accent-peach)">
        <div class="beauty-tip-title" style="color:var(--accent-peach)">⚡ 减脂建议</div>
        <div class="beauty-tip-text">${result.dietTip || ''}</div>
      </div>

      <div class="beauty-tip" style="margin-top:8px;border-left-color:var(--accent-lavender)">
        <div class="beauty-tip-title" style="color:var(--accent-lavender)">🔄 更优替代</div>
        <div class="beauty-tip-text">${result.betterAlternative || ''}</div>
      </div>

      <div class="beauty-tip" style="margin-top:8px;border-left-color:#60a5fa">
        <div class="beauty-tip-title" style="color:#60a5fa">➡️ 下一餐建议</div>
        <div class="beauty-tip-text">${result.nextMealSuggestion || ''}</div>
      </div>

      <!-- 操作按钮 -->
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn-order btn-meituan" style="flex:1" onclick="openOrder('meituan','${mealType}')">🟡 美团点替代餐</button>
        <button class="btn-order btn-eleme" style="flex:1" onclick="openOrder('eleme','${mealType}')">🔵 饿了么点替代餐</button>
      </div>
    </div>
  `;
}

// ===== AI 下一餐建议 =====
async function getNextMealAdvice() {
  const adviceDiv = document.getElementById('aiAdviceResult');
  if (!adviceDiv) return;
  
  adviceDiv.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div class="loading-spinner" style="width:40px;height:40px;margin:0 auto 12px"></div>
      <div style="font-size:13px;color:var(--text-secondary)">🧠 AI 正在分析你今日营养状况...</div>
    </div>
  `;
  
  try {
    const intake = getTodayIntake();
    const result = await getAIDietAdvice(state.profile, intake);
    
    adviceDiv.innerHTML = `
      <div style="text-align:left">
        <div style="text-align:center;padding:12px;background:rgba(99,102,241,0.1);border-radius:var(--radius-sm);margin-bottom:12px">
          <div style="font-size:11px;color:var(--text-secondary)">剩余可摄入</div>
          <div style="font-size:28px;font-weight:900;color:var(--accent-lavender)">${result.remainingCalories} <span style="font-size:14px">kcal</span></div>
        </div>
        
        <div class="beauty-tip" style="border-left-color:var(--accent-lavender)">
          <div class="beauty-tip-title" style="color:var(--accent-lavender)">🧠 AI 整体建议</div>
          <div class="beauty-tip-text">${result.advice}</div>
        </div>

        ${result.nextMeal ? `
        <div style="margin-top:12px">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px">📋 推荐${result.nextMeal.type}菜单 (~${result.nextMeal.totalCalories}kcal)</div>
          ${(result.nextMeal.items || []).map(item => `
            <div class="food-item">
              <div class="food-info">
                <span class="food-icon">✅</span>
                <div>
                  <div class="food-name">${item.name}</div>
                  <div class="food-amount">${item.amount}</div>
                  <div style="font-size:10px;color:var(--accent-lavender);margin-top:2px">${item.reason}</div>
                </div>
              </div>
              <div class="food-detail">
                <div class="food-kcal">${item.calories} kcal</div>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${result.beautyFocus ? `
        <div class="beauty-tip" style="margin-top:8px;border-left-color:var(--accent-rose)">
          <div class="beauty-tip-title" style="color:var(--accent-rose)">💎 今日美容重点</div>
          <div class="beauty-tip-text">${result.beautyFocus}</div>
        </div>
        ` : ''}

        ${result.warning ? `
        <div class="beauty-tip" style="margin-top:8px;border-left-color:#ef4444">
          <div class="beauty-tip-title" style="color:#ef4444">⚠️ 注意</div>
          <div class="beauty-tip-text">${result.warning}</div>
        </div>
        ` : ''}
      </div>
    `;
  } catch (error) {
    adviceDiv.innerHTML = `
      <div style="padding:12px;background:rgba(239,68,68,0.1);border-radius:var(--radius-sm);font-size:12px;color:#ef4444">
        ❌ 获取建议失败: ${error.message}
      </div>
    `;
  }
}

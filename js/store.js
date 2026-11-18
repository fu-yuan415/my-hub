/* 本地数据存储层：任务 / 日记 / 记账 / 习惯 / 设置，全部基于 localStorage */
const Store = (() => {
  const KEY = 'personal_hub_data_v1';

  const defaultData = () => ({
    tasks: [],
    diaries: {},   // { '2026-11-17': { content, mood, updatedAt } }
    ledger: [],    // { id, type:'expense'|'income', amount, category, note, date, createdAt }
    habits: [],    // { id, name, icon, records:{'2026-11-17':true}, createdAt }
    vault: { config: null, entries: [] },   // 密码本（内容加密存储）
    settings: {
      theme: 'light',
      nickname: '',
      modules: { tasks: true, diary: true, ledger: true, habits: true }
    }
  });

  let data = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      const d = defaultData();
      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        diaries: parsed.diaries && typeof parsed.diaries === 'object' ? parsed.diaries : {},
        ledger: Array.isArray(parsed.ledger) ? parsed.ledger : [],
        habits: Array.isArray(parsed.habits) ? parsed.habits : [],
        vault: (parsed.vault && typeof parsed.vault === 'object')
          ? { config: parsed.vault.config || null, entries: Array.isArray(parsed.vault.entries) ? parsed.vault.entries : [] }
          : { config: null, entries: [] },
        settings: {
          theme: parsed.settings && parsed.settings.theme === 'dark' ? 'dark' : 'light',
          nickname: (parsed.settings && parsed.settings.nickname) || '',
          modules: Object.assign(d.settings.modules,
            (parsed.settings && parsed.settings.modules) || {})
        }
      };
    } catch (e) {
      console.warn('读取本地数据失败，使用空数据', e);
      return defaultData();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      alert('保存失败，本地存储空间可能已满');
    }
  }

  function todayKey(d = new Date()) {
    return dateKey(d);
  }

  function dateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /* ---- 任务 ---- */
  function getTasks() {
    return data.tasks.slice().sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const pr = { high: 0, mid: 1, low: 2 };
      if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority];
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
  }

  function addTask(text, priority = 'mid', date = todayKey(), opts = {}) {
    const task = {
      id: uid(), text: String(text || '').trim(), priority, date,
      done: false, createdAt: Date.now(),
      repeat: opts.repeat || 'none',      // none | daily | weekly | monthly
      remindAt: opts.remindAt || '',      // 'HH:MM' 或 ''
      reminded: false
    };
    if (!task.text) return null;
    data.tasks.push(task); save();
    return task;
  }

  function toggleTask(id) {
    const t = data.tasks.find(x => x.id === id);
    if (!t) return null;
    t.done = !t.done;
    // 完成重复任务时，自动生成下一次
    if (t.done && t.repeat && t.repeat !== 'none') {
      const next = nextRepeatDate(t.date, t.repeat);
      if (next && next !== t.date) {
        const exists = data.tasks.some(x => x.text === t.text && x.date === next);
        if (!exists) {
          data.tasks.push({
            id: uid(), text: t.text, priority: t.priority, date: next,
            done: false, createdAt: Date.now(),
            repeat: t.repeat, remindAt: t.remindAt, reminded: false
          });
        }
      }
    }
    save();
    return t;
  }

  /** 计算下一次重复日期 */
  function nextRepeatDate(dateKey, repeat) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    if (repeat === 'daily') dt.setDate(dt.getDate() + 1);
    else if (repeat === 'weekly') dt.setDate(dt.getDate() + 7);
    else if (repeat === 'monthly') dt.setMonth(dt.getMonth() + 1);
    else return '';
    return dateKeyOf(dt);
  }

  function dateKeyOf(d) {
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  /** 更新任务（用于编辑提醒/重复等） */
  function updateTask(id, patch) {
    const t = data.tasks.find(x => x.id === id);
    if (!t) return null;
    Object.assign(t, patch);
    if (patch.remindAt !== undefined) t.reminded = false;
    save();
    return t;
  }

  /** 取出当前时刻应提醒、且尚未提醒过的任务 */
  function dueReminders(now = new Date()) {
    const today = todayKey(now);
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return data.tasks.filter(t =>
      !t.done && t.date === today && t.remindAt &&
      t.remindAt === hhmm && !t.reminded
    );
  }

  function markReminded(id) {
    const t = data.tasks.find(x => x.id === id);
    if (t) { t.reminded = true; save(); }
  }

  function deleteTask(id) {
    data.tasks = data.tasks.filter(x => x.id !== id); save();
  }

  /* ---- 日记 ---- */
  function getDiary(date) { return data.diaries[date] || null; }

  function getAllDiaries() {
    return Object.keys(data.diaries).sort().reverse()
      .map(k => ({ date: k, ...data.diaries[k] }));
  }

  function saveDiary(date, content, mood, images) {
    data.diaries[date] = {
      content: String(content || ''),
      mood: mood || '',
      images: Array.isArray(images) ? images : (data.diaries[date]?.images || []),
      updatedAt: Date.now()
    };
    save();
  }

  /** 日记图片：以 dataURL 存本地（不上传） */
  function addDiaryImage(date, dataUrl) {
    const rec = data.diaries[date] || { content: '', mood: '', images: [] };
    if (!Array.isArray(rec.images)) rec.images = [];
    rec.images.push(dataUrl);
    rec.updatedAt = Date.now();
    data.diaries[date] = rec;
    save();
  }

  function removeDiaryImage(date, index) {
    const rec = data.diaries[date];
    if (!rec || !Array.isArray(rec.images)) return;
    rec.images.splice(index, 1);
    save();
  }

  function deleteDiary(date) { delete data.diaries[date]; save(); }

  /* ---- 记账 ---- */
  function getLedger() {
    return data.ledger.slice().sort((a, b) =>
      (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));
  }

  function addRecord(rec) {
    const amount = Number(rec.amount);
    if (!isFinite(amount) || amount <= 0) return null;
    const item = {
      id: uid(),
      type: rec.type === 'income' ? 'income' : 'expense',
      amount: Math.round(amount * 100) / 100,
      category: String(rec.category || '其他').trim(),
      note: String(rec.note || '').trim(),
      date: rec.date || todayKey(),
      createdAt: Date.now()
    };
    data.ledger.push(item); save();
    return item;
  }

  function deleteRecord(id) {
    data.ledger = data.ledger.filter(x => x.id !== id); save();
  }

  function ledgerStats(monthPrefix) {
    let expense = 0, income = 0;
    const cats = {};
    data.ledger.forEach(r => {
      if (monthPrefix && (r.date || '').slice(0, 7) !== monthPrefix) return;
      if (r.type === 'income') income += r.amount;
      else {
        expense += r.amount;
        cats[r.category] = (cats[r.category] || 0) + r.amount;
      }
    });
    return {
      expense: Math.round(expense * 100) / 100,
      income: Math.round(income * 100) / 100,
      balance: Math.round((income - expense) * 100) / 100,
      categories: Object.entries(cats).sort((a, b) => b[1] - a[1])
    };
  }

  /* ---- 习惯 ---- */
  function getHabits() { return data.habits.slice(); }

  function addHabit(name, icon) {
    const h = {
      id: uid(), name: String(name || '').trim(), icon: icon || '✦',
      records: {}, createdAt: Date.now()
    };
    if (!h.name) return null;
    data.habits.push(h); save();
    return h;
  }

  function toggleHabit(id, date = todayKey()) {
    const h = data.habits.find(x => x.id === id);
    if (!h) return null;
    if (h.records[date]) delete h.records[date];
    else h.records[date] = true;
    save();
    return h;
  }

  function deleteHabit(id) {
    data.habits = data.habits.filter(x => x.id !== id); save();
  }

  function habitStreak(habit) {
    let streak = 0;
    const d = new Date();
    if (!habit.records[dateKey(d)]) d.setDate(d.getDate() - 1);
    while (habit.records[dateKey(d)]) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  /* ---- 设置 ---- */
  function getSettings() { return JSON.parse(JSON.stringify(data.settings)); }

  function setSetting(key, value) { data.settings[key] = value; save(); }

  function isModuleOn(key) { return data.settings.modules[key] !== false; }

  function toggleModule(key) {
    data.settings.modules[key] = !isModuleOn(key);
    save();
    return isModuleOn(key);
  }

  /* ---- 密码本 ---- */
  function getVaultConfig() {
    return data.vault ? data.vault.config : null;
  }

  function saveVaultConfig(config) {
    if (!data.vault) data.vault = { config: null, entries: [] };
    data.vault.config = config;
    save();
  }

  function getVaultEntries() {
    return (data.vault && Array.isArray(data.vault.entries)) ? data.vault.entries : [];
  }

  function saveVaultEntries(entries) {
    if (!data.vault) data.vault = { config: null, entries: [] };
    data.vault.entries = entries;
    save();
  }

  function hasVault() {
    return !!(data.vault && data.vault.config && data.vault.config.salt);
  }

  function resetVault() {
    if (data.vault) { data.vault = { config: null, entries: [] }; save(); }
  }

  /* ---- 导入导出 ---- */
  function exportJSON() { return JSON.stringify(data, null, 2); }

  function importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') throw new Error('格式不正确');
    const d = defaultData();
    data = {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      diaries: parsed.diaries && typeof parsed.diaries === 'object' ? parsed.diaries : {},
      ledger: Array.isArray(parsed.ledger) ? parsed.ledger : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      vault: (parsed.vault && typeof parsed.vault === 'object')
        ? { config: parsed.vault.config || null, entries: Array.isArray(parsed.vault.entries) ? parsed.vault.entries : [] }
        : { config: null, entries: [] },
      settings: {
        theme: parsed.settings && parsed.settings.theme === 'dark' ? 'dark' : 'light',
        nickname: (parsed.settings && parsed.settings.nickname) || '',
        modules: Object.assign(d.settings.modules, (parsed.settings && parsed.settings.modules) || {})
      }
    };
    save();
  }

  function clearAll() { data = defaultData(); save(); }

  function uid() {
    return Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  }

  return {
    todayKey, dateKey, uid,
    getTasks, addTask, toggleTask, deleteTask, updateTask,
    nextRepeatDate, dueReminders, markReminded,
    getDiary, getAllDiaries, saveDiary, deleteDiary, addDiaryImage, removeDiaryImage,
    getLedger, addRecord, deleteRecord, ledgerStats,
    getHabits, addHabit, toggleHabit, deleteHabit, habitStreak,
    getSettings, setSetting, isModuleOn, toggleModule,
    getVaultConfig, saveVaultConfig, getVaultEntries, saveVaultEntries, hasVault, resetVault,
    exportJSON, importJSON, clearAll
  };
})();

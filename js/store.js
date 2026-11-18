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

  function addTask(text, priority = 'mid', date = todayKey()) {
    const task = {
      id: uid(), text: String(text || '').trim(), priority, date,
      done: false, createdAt: Date.now()
    };
    if (!task.text) return null;
    data.tasks.push(task); save();
    return task;
  }

  function toggleTask(id) {
    const t = data.tasks.find(x => x.id === id);
    if (t) { t.done = !t.done; save(); }
    return t;
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

  function saveDiary(date, content, mood) {
    data.diaries[date] = {
      content: String(content || ''), mood: mood || '', updatedAt: Date.now()
    };
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
    getTasks, addTask, toggleTask, deleteTask,
    getDiary, getAllDiaries, saveDiary, deleteDiary,
    getLedger, addRecord, deleteRecord, ledgerStats,
    getHabits, addHabit, toggleHabit, deleteHabit, habitStreak,
    getSettings, setSetting, isModuleOn, toggleModule,
    getVaultConfig, saveVaultConfig, getVaultEntries, saveVaultEntries, hasVault, resetVault,
    exportJSON, importJSON, clearAll
  };
})();

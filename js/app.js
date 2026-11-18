/* 我的工作台 - 主逻辑 */
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const main = $('#main');
  const pageTitle = $('#pageTitle');
  const topbarDate = $('#topbarDate');
  const fab = $('#fab');
  const modal = $('#modal');
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  const toastEl = $('#toast');

  /* ---------- 图标（内联 SVG，比字符更专业） ---------- */
  const ICON = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/></svg>',
    task: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="16" rx="4"/><path d="m8 12 2.5 2.5L16 9.5"/></svg>',
    diary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/><path d="M8 8h7M8 12h7M8 16h4"/></svg>',
    ledger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5Z"/><path d="M4 9h16"/><circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    habit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.4 5.2 5.6.7-4.1 3.9 1.1 5.6-5-2.8-5 2.8 1.1-5.6L4 8.9l5.6-.7L12 3Z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H22a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M14.5 7.5 17 10"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3.5v3M16 3.5v3M3.5 10h17"/></svg>',
    coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.5 10h4a1.8 1.8 0 0 1 0 3.6h-4M9.5 10v4"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="3"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-3.2 3.9"/><path d="M6.3 7.9A15.6 15.6 0 0 0 2.5 12S6 18 12 18a9.6 9.6 0 0 0 3.4-.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.7-4.7 3.3 3.3 2.4-2.4 4.3 4.3"/></svg>',
    report: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/><path d="M9 8.5h6M9 12h6M9 15.5h3"/></svg>'
  };

  const MODULES = {
    tasks: { name: '任务', icon: 'task', color: '#5b73e8' },
    diary: { name: '日记', icon: 'diary', color: '#e0648b' },
    ledger: { name: '记账', icon: 'ledger', color: '#22a06b' },
    habits: { name: '习惯', icon: 'habit', color: '#e08a2e' },
    vault: { name: '密码本', icon: 'lock', color: '#7c5cd6' }
  };
  const MOODS = [
    { e: '😄', t: '很好' }, { e: '🙂', t: '不错' }, { e: '😐', t: '一般' },
    { e: '😔', t: '低落' }, { e: '😢', t: '难过' }, { e: '😡', t: '生气' }
  ];
  const EXPENSE_CATS = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '学习', '其他'];
  const INCOME_CATS = ['工资', '兼职', '理财', '红包', '其他'];

  let currentPage = 'today';
  let toastTimer = null;
  let ledgerMonth = monthKey(new Date());
  let ledgerDay = '';          // '' = 全月

  // 更新检查状态（全局持久，避免异步期间 DOM 被重绘导致状态丢失）
  const UpdateState = {
    checking: false,
    latestText: '',
    hasUpdate: false,
    changelog: '',
    remoteInfo: null
  };

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  /** 把富文本 HTML 转成纯文本预览 */
  function htmlToText(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = String(html);
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function fmtMoney(n) {
    return '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function weekdayCN(d) {
    return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()];
  }
  function monthKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  function dayLabel(key) {
    const [y, m, d] = key.split('-');
    const dt = new Date(+y, +m - 1, +d);
    return `${+m}月${+d}日 ${weekdayCN(dt)}`;
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }
  function activeModules() {
    return Object.keys(MODULES).filter(k => Store.isModuleOn(k));
  }

  /* ---------- 应用内对话框（替代原生 confirm/alert，消除网址弹窗） ---------- */
  function showDialog({ title, message, confirmText = '确定', cancelText = '取消', danger = false, showCancel = true }) {
    return new Promise(resolve => {
      const dlg = document.createElement('div');
      dlg.className = 'dialog-mask';
      dlg.innerHTML = `
        <div class="dialog-card">
          ${title ? `<div class="dialog-title">${esc(title)}</div>` : ''}
          <div class="dialog-message">${esc(message)}</div>
          <div class="dialog-actions">
            ${showCancel ? `<button class="dialog-btn ghost" data-r="0">${esc(cancelText)}</button>` : ''}
            <button class="dialog-btn ${danger ? 'danger' : 'primary'}" data-r="1">${esc(confirmText)}</button>
          </div>
        </div>`;
      document.body.appendChild(dlg);
      requestAnimationFrame(() => dlg.classList.add('show'));
      const finish = val => {
        dlg.classList.remove('show');
        setTimeout(() => dlg.remove(), 180);
        resolve(val);
      };
      dlg.querySelectorAll('[data-r]').forEach(b =>
        b.addEventListener('click', () => finish(b.dataset.r === '1')));
      dlg.addEventListener('click', e => { if (e.target === dlg) finish(false); });
    });
  }
  const uiConfirm = (message, opts = {}) => showDialog({ message, ...opts });
  const uiAlert = (message, opts = {}) =>
    showDialog({ message, confirmText: '好的', showCancel: false, ...opts });

  /* ---------- 弹窗 ---------- */
  function openModal(title, bodyHTML) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }
  function closeModal() {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  /* ---------- 导航 ---------- */
  const NAV = [
    { key: 'today', name: '今日', icon: 'home' },
    { key: 'tasks', name: '任务', icon: 'task' },
    { key: 'diary', name: '日记', icon: 'diary' },
    { key: 'ledger', name: '记账', icon: 'ledger' },
    { key: 'habits', name: '习惯', icon: 'habit' },
    { key: 'vault', name: '密码本', icon: 'lock' },
    { key: 'stats', name: '统计', icon: 'chart' },
    { key: 'settings', name: '设置', icon: 'settings' }
  ];

  /* 底部导航最多 5 项：固定「今日」开头、「设置」结尾，中间放已开启的模块（最多 3 个） */
  function navItems() {
    const mid = ['tasks', 'diary', 'ledger', 'habits', 'vault']
      .filter(k => Store.isModuleOn(k))
      .map(k => ({ key: k, name: MODULES[k].name, icon: MODULES[k].icon }));

    const items = [{ key: 'today', name: '今日', icon: 'home' }];
    // 中间最多 3 项，保证 today + 3 + settings = 5
    items.push(...mid.slice(0, 3));
    // 中间不足 3 个时，用统计补足（统计始终可达）
    if (mid.length < 3) items.push({ key: 'stats', name: '统计', icon: 'chart' });
    items.push({ key: 'settings', name: '设置', icon: 'settings' });
    return items;
  }

  let moreOpen = false;

  function renderNav() {
    const nav = $('.bottom-nav');
    const items = navItems();
    // 判断是否有未展示的模块
    const shown = new Set(items.map(i => i.key));
    const hidden = ['tasks', 'diary', 'ledger', 'habits', 'vault']
      .filter(k => Store.isModuleOn(k) && !shown.has(k));

    nav.innerHTML = items.map(n => `
      <button class="nav-item ${currentPage === n.key ? 'active' : ''}" data-page="${n.key}">
        <span class="nav-icon">${ICON[n.icon]}</span><span class="nav-label">${n.name}</span>
      </button>`).join('') + (hidden.length ? `
      <button class="nav-item ${hidden.includes(currentPage) ? 'active' : ''}" id="navMore">
        <span class="nav-icon"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18" cy="12" r="1.8"/></svg></span>
        <span class="nav-label">更多</span>
      </button>` : '');

    $$('.nav-item[data-page]').forEach(btn =>
      btn.addEventListener('click', () => go(btn.dataset.page)));

    const more = $('#navMore');
    if (more) more.addEventListener('click', () => openMoreSheet(hidden));
  }

  function openMoreSheet(hidden) {
    openModal('更多功能', `
      <div class="more-grid">
        ${hidden.map(k => `
          <button class="more-item" data-go="${k}">
            <span class="shortcut-ico" style="--c:${MODULES[k].color}">${ICON[MODULES[k].icon]}</span>
            <span>${MODULES[k].name}</span>
          </button>`).join('')}
        <button class="more-item" data-go="stats">
          <span class="shortcut-ico" style="--c:#5b73e8">${ICON.chart}</span>
          <span>统计</span>
        </button>
      </div>`);
    $$('.more-item').forEach(el => el.addEventListener('click', () => {
      closeModal(); go(el.dataset.go);
    }));
  }

  function go(page) {
    currentPage = page;
    renderNav();
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    const s = Store.getSettings();
    document.documentElement.setAttribute('data-theme', s.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', s.theme === 'dark' ? '#151823' : '#f5f6fa');
    const now = new Date();
    topbarDate.textContent = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdayCN(now)}`;

    const titles = {
      today: s.nickname ? `${greetingShort()}，${s.nickname}` : greetingShort(),
      tasks: '任务', diary: '日记', ledger: '记账', habits: '习惯',
      vault: '密码本', stats: '统计', settings: '设置'
    };
    pageTitle.textContent = titles[currentPage] || greetingShort();

    const pages = {
      today: renderToday, tasks: renderTasks, diary: renderDiary,
      ledger: renderLedger, habits: renderHabits, vault: renderVault,
      stats: renderStats, settings: renderSettings
    };
    (pages[currentPage] || renderToday)();

    fab.style.display = (currentPage === 'tasks' || currentPage === 'ledger'
      || currentPage === 'habits' || currentPage === 'vault') ? 'flex' : 'none';
  }

  function greetingShort() {
    const h = new Date().getHours();
    return h < 6 ? '夜深了' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  }

  /* ---------- 今日 ---------- */
  function renderToday() {
    const today = Store.todayKey();
    const tasks = Store.getTasks().filter(t => t.date === today);
    const done = tasks.filter(t => t.done).length;
    const diary = Store.getDiary(today);
    const todayExpense = Store.getLedger()
      .filter(r => r.date === today && r.type === 'expense')
      .reduce((a, r) => a + r.amount, 0);
    const habits = Store.getHabits();
    const checkedHabits = habits.filter(h => h.records[today]).length;

    let html = `
      <section class="hero">
        <div class="hero-greet">${greetingShort()}${Store.getSettings().nickname ? '，' + esc(Store.getSettings().nickname) : ''}<span class="hero-wave">👋</span></div>
        <div class="hero-meta">${today.replace(/-/g, '/')} · ${weekdayCN(new Date())}</div>
        <div class="hero-quote">${quoteOfDay()}</div>
      </section>`;

    /* 统计卡片：固定三列，内边距充足，数字不贴边 */
    const cards = [];
    cards.push(statCard('task', '#5b73e8', `${done}<span class="stat-sub">/${tasks.length}</span>`, '今日任务'));
    if (Store.isModuleOn('ledger')) {
      cards.push(statCard('coin', '#22a06b', fmtMoney(todayExpense), '今日支出'));
    }
    if (Store.isModuleOn('habits')) {
      cards.push(statCard('habit', '#e08a2e', `${checkedHabits}<span class="stat-sub">/${habits.length}</span>`, '习惯打卡'));
    }
    html += `<div class="stat-grid ${cards.length === 2 ? 'two' : ''}">${cards.join('')}</div>`;

    if (Store.isModuleOn('tasks')) {
      html += `<section class="card">
        <div class="card-head"><h3>今日待办</h3><button class="link-btn" data-go="tasks">全部</button></div>
        ${tasks.length === 0
          ? emptyState('今天还空着，加一件小事开始吧')
          : tasks.slice(0, 5).map(t => taskRow(t)).join('')}
      </section>`;
    }

    if (Store.isModuleOn('diary')) {
      html += `<section class="card card-tap" data-go="diary">
        <div class="card-head"><h3>今日日记</h3><span class="link-btn">${diary && diary.content ? '继续写' : '写一篇'}</span></div>
        ${diary && diary.content
          ? `<p class="diary-preview">${esc(diary.content.slice(0, 70))}${diary.content.length > 70 ? '…' : ''}</p>
             ${diary.mood ? `<span class="mood-tag">${diary.mood}</span>` : ''}`
          : emptyState('记录一点今天的心情')}
      </section>`;
    }

    if (Store.isModuleOn('habits') && habits.length) {
      html += `<section class="card">
        <div class="card-head"><h3>习惯打卡</h3><button class="link-btn" data-go="habits">全部</button></div>
        <div class="habit-pills">
          ${habits.map(h => `
            <button class="habit-pill ${h.records[today] ? 'on' : ''}" data-habit="${h.id}">
              <span class="habit-pill-ico">${esc(h.icon)}</span>
              <span class="habit-pill-name">${esc(h.name)}</span>
            </button>`).join('')}
        </div>
      </section>`;
    }

    html += `<section class="card">
      <div class="card-head"><h3>快捷入口</h3></div>
      <div class="shortcut-grid">
        ${activeModules().map(k => `
          <button class="shortcut" data-go="${k}">
            <span class="shortcut-ico" style="--c:${MODULES[k].color}">${ICON[MODULES[k].icon]}</span>
            <span class="shortcut-name">${MODULES[k].name}</span>
          </button>`).join('')}
        <button class="shortcut" id="reviewBtn">
          <span class="shortcut-ico" style="--c:#5b73e8">${ICON.report}</span>
          <span class="shortcut-name">月回顾</span>
        </button>
      </div>
    </section>`;

    main.innerHTML = html;
    $$('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));
    $$('[data-habit]').forEach(el => el.addEventListener('click', () => {
      Store.toggleHabit(el.dataset.habit); render();
    }));
    const rb = $('#reviewBtn');
    if (rb) rb.addEventListener('click', openReview);
  }

  function statCard(icon, color, value, label) {
    return `<div class="stat-card">
      <div class="stat-ico" style="--c:${color}">${ICON[icon]}</div>
      <div class="stat-body">
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    </div>`;
  }

  function quoteOfDay() {
    const quotes = [
      '把今天过好，就是对未来最好的投资。',
      '不积跬步，无以至千里。',
      '专注当下，一步一步来。',
      '把想做的事，变成正在做的事。',
      '记录，是为了更好地前行。',
      '简单一点，专注一点，快乐一点。',
      '每个平凡的日子都值得被认真对待。'
    ];
    const d = new Date();
    const idx = (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % quotes.length;
    return quotes[idx];
  }

  function emptyState(text) {
    return `<div class="empty">${esc(text)}</div>`;
  }

  /* ---------- 任务 ---------- */
  function renderTasks() {
    const today = Store.todayKey();
    const tasks = Store.getTasks();
    const pending = tasks.filter(t => !t.done);
    const done = tasks.filter(t => t.done);
    let html = `
      <div class="stat-strip">
        <div class="strip-item"><strong>${pending.length}</strong><span>待办中</span></div>
        <div class="strip-sep"></div>
        <div class="strip-item"><strong>${done.length}</strong><span>已完成</span></div>
      </div>
      <div class="add-bar">
        <input id="taskInput" type="text" placeholder="添加任务，按回车确认" autocomplete="off">
        <select id="taskPriority" aria-label="优先级">
          <option value="mid">普通</option>
          <option value="high">重要</option>
          <option value="low">次要</option>
        </select>
        <button class="icon-btn add-opt" id="taskMore" title="更多选项">${ICON.repeat}</button>
      </div>
      <div id="taskMorePanel" class="more-panel hidden">
        <div class="more-opt-row">
          <label>重复</label>
          <select id="taskRepeat">
            <option value="none">不重复</option>
            <option value="daily">每天</option>
            <option value="weekly">每周</option>
            <option value="monthly">每月</option>
          </select>
        </div>
        <div class="more-opt-row">
          <label>提醒</label>
          <input type="time" id="taskRemind">
        </div>
      </div>
      <div class="section-label">待办 <span class="count">${pending.length}</span></div>`;
    html += pending.length ? pending.map(t => taskRow(t)).join('') : emptyState('暂无待办，享受清闲');
    if (done.length) {
      html += `<div class="section-label">已完成 <span class="count">${done.length}</span>
        <button class="link-btn" id="clearDone">清空</button></div>`;
      html += done.map(t => taskRow(t)).join('');
    }
    main.innerHTML = html;

    $('#taskInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const v = e.target.value.trim();
        if (v) {
          Store.addTask(v, $('#taskPriority').value, today, {
            repeat: $('#taskRepeat') ? $('#taskRepeat').value : 'none',
            remindAt: $('#taskRemind') ? $('#taskRemind').value : ''
          });
          render(); toast('已添加');
        }
      }
    });
    const moreBtn = $('#taskMore');
    if (moreBtn) moreBtn.addEventListener('click', () => {
      const p = $('#taskMorePanel');
      p.classList.toggle('hidden');
      moreBtn.classList.toggle('on');
    });
    $$('[data-toggle-task]').forEach(el => el.addEventListener('click', () => {
      Store.toggleTask(el.dataset.toggleTask); render();
    }));
    $$('[data-edit-task]').forEach(el => el.addEventListener('click', e => {
      e.stopPropagation();
      const t = Store.getTasks().find(x => x.id === el.dataset.editTask);
      if (t) openTaskEditor(t);
    }));
    $$('[data-del-task]').forEach(el => el.addEventListener('click', async e => {
      e.stopPropagation();
      if (await uiConfirm('确定删除这条任务吗？', { danger: true, confirmText: '删除' })) {
        Store.deleteTask(el.dataset.delTask); render(); toast('已删除');
      }
    }));
    const cd = $('#clearDone');
    if (cd) cd.addEventListener('click', async () => {
      if (await uiConfirm(`确定清空 ${done.length} 条已完成任务？`, { danger: true, confirmText: '清空' })) {
        done.forEach(t => Store.deleteTask(t.id)); render(); toast('已清空');
      }
    });
  }

  function taskRow(t) {
    const badge = t.priority === 'high' ? '<span class="prio high">重要</span>'
      : t.priority === 'low' ? '<span class="prio low">次要</span>' : '';
    const repeatLabel = { daily: '每天', weekly: '每周', monthly: '每月' }[t.repeat] || '';
    const meta = [];
    if (repeatLabel) meta.push(`<span class="task-meta">${ICON.repeat}${repeatLabel}</span>`);
    if (t.remindAt) meta.push(`<span class="task-meta">⏰${t.remindAt}</span>`);
    return `<div class="row-card task-row ${t.done ? 'done' : ''}">
      <button class="check ${t.done ? 'on' : ''}" data-toggle-task="${t.id}" aria-label="完成">
        ${t.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>' : ''}
      </button>
      <div class="task-main">
        <span class="task-text">${esc(t.text)}</span>
        ${meta.length ? `<div class="task-metas">${meta.join('')}</div>` : ''}
      </div>
      ${badge}
      <button class="icon-btn" data-edit-task="${t.id}" aria-label="设置">${ICON.settings}</button>
      <button class="icon-btn del" data-del-task="${t.id}" aria-label="删除">${ICON.close}</button>
    </div>`;
  }

  /** 任务编辑：改重复、提醒、优先级、日期 */
  function openTaskEditor(t) {
    openModal('任务设置', `
      <div class="form-label">内容</div>
      <input type="text" id="teText" value="${esc(t.text)}">
      <div class="form-label">优先级</div>
      <div class="seg-switch wide">
        <button class="seg ${t.priority === 'high' ? 'on' : ''}" data-tep="high">重要</button>
        <button class="seg ${t.priority === 'mid' ? 'on' : ''}" data-tep="mid">普通</button>
        <button class="seg ${t.priority === 'low' ? 'on' : ''}" data-tep="low">次要</button>
      </div>
      <div class="form-label">日期</div>
      <input type="date" id="teDate" value="${t.date}">
      <div class="form-label">重复</div>
      <select id="teRepeat">
        <option value="none" ${t.repeat === 'none' ? 'selected' : ''}>不重复</option>
        <option value="daily" ${t.repeat === 'daily' ? 'selected' : ''}>每天</option>
        <option value="weekly" ${t.repeat === 'weekly' ? 'selected' : ''}>每周</option>
        <option value="monthly" ${t.repeat === 'monthly' ? 'selected' : ''}>每月</option>
      </select>
      <div class="form-label">提醒时间（可选）</div>
      <input type="time" id="teRemind" value="${t.remindAt || ''}">
      <p class="hint block-hint">重复任务完成后会自动生成下一次。提醒需 App 处于打开状态才会触发。</p>
      <div class="modal-actions"><button class="btn-primary block" id="teSave">保存</button></div>`);
    let priority = t.priority;
    $$('[data-tep]').forEach(b => b.addEventListener('click', () => {
      priority = b.dataset.tep;
      $$('[data-tep]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    }));
    $('#teSave').addEventListener('click', () => {
      const text = $('#teText').value.trim();
      if (!text) return toast('内容不能为空');
      Store.updateTask(t.id, {
        text, priority,
        date: $('#teDate').value,
        repeat: $('#teRepeat').value,
        remindAt: $('#teRemind').value
      });
      closeModal(); render(); toast('已保存');
    });
  }

  /* ---------- 日记 ---------- */
  function renderDiary() {
    const list = Store.getAllDiaries();
    let html = `<button class="btn-primary block" id="newDiary">${ICON.edit}<span>写今天的日记</span></button>
      <div class="section-label">历史记录 <span class="count">${list.length}</span></div>`;
    if (!list.length) {
      html += emptyState('还没有日记，写下第一篇吧');
    } else {
      html += list.map(d => `
        <div class="row-card diary-row" data-diary="${d.date}">
          <div class="diary-row-top">
            <strong>${d.date.replace(/-/g, '/')}</strong>
            ${d.mood ? `<span class="mood-tag">${d.mood}</span>` : ''}
            <span class="diary-time">${d.updatedAt ? new Date(d.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
          <div class="diary-row-text">${esc(htmlToText(d.content).slice(0, 90) || '（空白）')}${htmlToText(d.content).length > 90 ? '…' : ''}${(d.images && d.images.length) ? ` <span class="img-count">🖼 ${d.images.length}</span>` : ''}</div>
        </div>`).join('');
    }
    main.innerHTML = html;

    $('#newDiary').addEventListener('click', () => openDiaryEditor(Store.todayKey()));
    $$('[data-diary]').forEach(el => el.addEventListener('click', () => openDiaryEditor(el.dataset.diary)));
  }

  function openDiaryEditor(date) {
    const d = Store.getDiary(date) || { content: '', mood: '', images: [] };
    const imgs = Array.isArray(d.images) ? d.images : [];
    openModal(dayLabel(date), `
      <div class="mood-row">
        ${MOODS.map(m => `<button class="mood-item ${d.mood === m.e ? 'on' : ''}" data-mood="${m.e}">
          <span class="mood-emoji">${m.e}</span><span class="mood-text">${m.t}</span>
        </button>`).join('')}
      </div>
      <div class="rt-toolbar">
        <button class="rt-btn" data-rt="bold" title="加粗"><b>B</b></button>
        <button class="rt-btn" data-rt="italic" title="斜体"><i>I</i></button>
        <button class="rt-btn" data-rt="underline" title="下划线"><u>U</u></button>
        <button class="rt-btn" data-rt="insertUnorderedList" title="列表">• —</button>
        <button class="rt-btn" data-rt="img" title="插入图片">${ICON.image}</button>
      </div>
      <div id="diaryEditor" class="diary-area rt-editor" contenteditable="true"
           data-placeholder="今天发生了什么？想记下些什么…">${d.content || ''}</div>
      <div id="diaryImages" class="diary-images">
        ${imgs.map((src, i) => `
          <div class="diary-img-wrap">
            <img src="${src}" alt="日记图片">
            <button class="img-del" data-imgdel="${i}">${ICON.close}</button>
          </div>`).join('')}
      </div>
      <input type="file" id="diaryImgInput" accept="image/*" multiple hidden>
      <div class="modal-actions">
        ${(d.content || imgs.length) ? `<button class="btn-ghost danger" id="delDiary">删除</button>` : ''}
        <button class="btn-primary" id="saveDiary">保存</button>
      </div>`);

    let mood = d.mood;
    $$('.mood-item').forEach(b => b.addEventListener('click', () => {
      mood = b.dataset.mood;
      $$('.mood-item').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    }));

    const editor = $('#diaryEditor');
    // 富文本工具栏
    $$('.rt-btn').forEach(btn => btn.addEventListener('click', e => {
      e.preventDefault();
      const cmd = btn.dataset.rt;
      if (cmd === 'img') { $('#diaryImgInput').click(); return; }
      editor.focus();
      document.execCommand(cmd, false, null);
    }));

    // 插入图片（压缩后转 dataURL 存本地）
    $('#diaryImgInput').addEventListener('change', async e => {
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        try {
          const dataUrl = await fileToCompressedDataUrl(f, 1000, 0.82);
          Store.addDiaryImage(date, dataUrl);
          const wrap = document.createElement('div');
          wrap.className = 'diary-img-wrap';
          const idx = ($('#diaryImages').children.length);
          wrap.innerHTML = `<img src="${dataUrl}" alt="日记图片"><button class="img-del" data-imgdel="${idx}">${ICON.close}</button>`;
          $('#diaryImages').appendChild(wrap);
          bindImgDel();
          toast('图片已添加');
        } catch (err) { toast('图片处理失败'); }
      }
      e.target.value = '';
    });

    function bindImgDel() {
      $$('[data-imgdel]').forEach(b => b.onclick = () => {
        const i = Number(b.dataset.imgdel);
        Store.removeDiaryImage(date, i);
        const cur = Store.getDiary(date);
        $('#diaryImages').innerHTML = (cur.images || []).map((src, j) => `
          <div class="diary-img-wrap">
            <img src="${src}" alt="日记图片">
            <button class="img-del" data-imgdel="${j}">${ICON.close}</button>
          </div>`).join('');
        bindImgDel();
        toast('图片已删除');
      });
    }
    bindImgDel();

    $('#saveDiary').addEventListener('click', () => {
      const html = editor.innerHTML.trim();
      const cur = Store.getDiary(date) || { images: [] };
      Store.saveDiary(date, html, mood, cur.images || []);
      closeModal(); render(); toast('日记已保存');
    });

    const del = $('#delDiary');
    if (del) del.addEventListener('click', async () => {
      if (await uiConfirm('确定删除这篇日记吗？删除后无法恢复。', { danger: true, confirmText: '删除' })) {
        Store.deleteDiary(date); closeModal(); render(); toast('已删除');
      }
    });
  }

  /** 图片压缩为 dataURL，控制存储体积 */
  function fileToCompressedDataUrl(file, maxSize = 1000, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width: w, height: h } = img;
          const scale = Math.min(1, maxSize / Math.max(w, h));
          w = Math.round(w * scale); h = Math.round(h * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ---------- 记账 ---------- */
  function renderLedger() {
    const all = Store.getLedger();
    const inMonth = all.filter(r => (r.date || '').slice(0, 7) === ledgerMonth);
    const records = ledgerDay ? inMonth.filter(r => r.date === ledgerDay) : inMonth;

    let expense = 0, income = 0;
    const cats = {};
    records.forEach(r => {
      if (r.type === 'income') income += r.amount;
      else { expense += r.amount; cats[r.category] = (cats[r.category] || 0) + r.amount; }
    });
    const balance = Math.round((income - expense) * 100) / 100;
    const catList = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const maxCat = catList.length ? catList[0][1] : 1;

    const [y, m] = ledgerMonth.split('-');
    let html = `
      <div class="month-bar">
        <button class="icon-btn" id="prevMonth" aria-label="上月">${ICON.chevronLeft}</button>
        <label class="month-display">
          <span>${+y}年${+m}月</span>
          <input type="month" id="monthInput" value="${ledgerMonth}">
        </label>
        <button class="icon-btn" id="nextMonth" aria-label="下月">${ICON.chevronRight}</button>
      </div>

      <div class="day-picker">
        <button class="day-chip ${ledgerDay === '' ? 'on' : ''}" data-day="">全月</button>
        ${dayChips(inMonth)}
      </div>

      <div class="ledger-sum">
        <div class="sum-item"><span>支出</span><strong class="c-expense">${fmtMoney(expense)}</strong></div>
        <div class="sum-item"><span>收入</span><strong class="c-income">${fmtMoney(income)}</strong></div>
        <div class="sum-item"><span>结余</span><strong>${fmtMoney(balance)}</strong></div>
      </div>`;

    if (catList.length) {
      html += `<section class="card">
        <div class="card-head"><h3>支出构成</h3></div>
        <div class="bars">
          ${catList.slice(0, 6).map(([cat, amt]) => `
            <div class="bar-row">
              <span class="bar-name">${esc(cat)}</span>
              <div class="bar-track"><div class="bar-in" style="width:${Math.max(6, amt / maxCat * 100)}%"></div></div>
              <span class="bar-amt">${fmtMoney(amt)}</span>
            </div>`).join('')}
        </div>
      </section>`;
    }

    html += `<div class="section-label">明细 <span class="count">${records.length}</span></div>`;
    if (!records.length) {
      html += emptyState(ledgerDay ? '这天没有记录' : '本月还没有记录，点右下角 + 记一笔');
    } else {
      let lastDate = null;
      html += records.map(r => {
        let head = '';
        if (r.date !== lastDate) {
          lastDate = r.date;
          head = `<div class="date-head">${r.date.replace(/-/g, '/')} ${weekdayCN(new Date(r.date))}</div>`;
        }
        return head + `
          <div class="row-card ledger-row">
            <div class="ledger-ico ${r.type}">${r.type === 'income' ? ICON.down : ICON.up}</div>
            <div class="ledger-info">
              <strong>${esc(r.category)}</strong>
              <span>${esc(r.note || (r.type === 'income' ? '收入' : '支出'))}</span>
            </div>
            <div class="ledger-amt ${r.type}">${r.type === 'income' ? '+' : '−'}${fmtMoney(r.amount)}</div>
            <button class="icon-btn del" data-del-record="${r.id}" aria-label="删除">${ICON.close}</button>
          </div>`;
      }).join('');
    }
    main.innerHTML = html;

    $('#prevMonth').addEventListener('click', () => { shiftMonth(-1); renderLedger(); });
    $('#nextMonth').addEventListener('click', () => { shiftMonth(1); renderLedger(); });
    $('#monthInput').addEventListener('change', e => {
      if (e.target.value) { ledgerMonth = e.target.value; ledgerDay = ''; renderLedger(); }
    });
    $$('[data-day]').forEach(el => el.addEventListener('click', () => {
      ledgerDay = el.dataset.day; renderLedger();
    }));
    $$('[data-del-record]').forEach(el => el.addEventListener('click', async () => {
      if (await uiConfirm('删除这笔记录？', { danger: true, confirmText: '删除' })) {
        Store.deleteRecord(el.dataset.delRecord); renderLedger(); toast('已删除');
      }
    }));
  }

  /* 生成当月有记录的日子（横向滚动的日期胶囊） */
  function dayChips(monthRecords) {
    const days = Array.from(new Set(monthRecords.map(r => r.date))).sort().reverse();
    if (!days.length) return '';
    return days.map(d => {
      const dayNum = +d.split('-')[2];
      return `<button class="day-chip ${ledgerDay === d ? 'on' : ''}" data-day="${d}">${dayNum}日</button>`;
    }).join('');
  }

  function shiftMonth(delta) {
    const [y, m] = ledgerMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    ledgerMonth = monthKey(d);
    ledgerDay = '';
  }

  function openLedgerModal() {
    const defaultDate = ledgerDay || (ledgerMonth === monthKey(new Date()) ? Store.todayKey() : `${ledgerMonth}-01`);
    openModal('记一笔', `
      <div class="seg-switch">
        <button class="seg on" data-type="expense">支出</button>
        <button class="seg" data-type="income">收入</button>
      </div>
      <div class="amount-field">
        <span class="amount-sign">¥</span>
        <input type="number" id="recAmount" inputmode="decimal" step="0.01" min="0" placeholder="0.00">
      </div>
      <div class="form-label">分类</div>
      <div id="catChips" class="chip-wrap"></div>
      <div class="form-label">日期</div>
      <input type="date" id="recDate" value="${defaultDate}">
      <div class="form-label">备注</div>
      <input type="text" id="recNote" placeholder="可选，例如：午餐">
      <div class="modal-actions"><button class="btn-primary block" id="saveRecord">保存</button></div>`);
    let type = 'expense', category = EXPENSE_CATS[0];
    const renderCats = () => {
      const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;
      category = cats[0];
      $('#catChips').innerHTML = cats.map((c, i) =>
        `<button class="chip ${i === 0 ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('');
      $$('.chip').forEach(b => b.addEventListener('click', () => {
        category = b.dataset.cat;
        $$('.chip').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
      }));
    };
    renderCats();
    $$('.seg').forEach(b => b.addEventListener('click', () => {
      type = b.dataset.type;
      $$('.seg').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      renderCats();
    }));
    $('#saveRecord').addEventListener('click', () => {
      const rec = Store.addRecord({
        type, amount: $('#recAmount').value, category,
        note: $('#recNote').value, date: $('#recDate').value
      });
      if (!rec) { toast('请输入有效金额'); return; }
      const [ry, rm] = rec.date.split('-');
      ledgerMonth = `${ry}-${rm}`;
      ledgerDay = rec.date;
      closeModal(); renderLedger(); toast('已记录');
    });
  }

  /* ---------- 习惯 ---------- */
  function renderHabits() {
    const today = Store.todayKey();
    const habits = Store.getHabits();
    let html = `<div class="add-bar">
      <input id="habitInput" type="text" placeholder="添加习惯，如：读书 30 分钟" autocomplete="off">
      <input id="habitIcon" class="icon-input" type="text" value="✦" maxlength="2" aria-label="图标">
    </div>`;
    if (!habits.length) {
      html += emptyState('还没有习惯，添加一个开始打卡');
    } else {
      html += habits.map(h => {
        const streak = Store.habitStreak(h);
        const checked = !!h.records[today];
        const week = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const k = Store.dateKey(d);
          week.push(`<div class="week-cell ${h.records[k] ? 'on' : ''} ${i === 0 ? 'today' : ''}">
            <span class="week-dow">${['日','一','二','三','四','五','六'][d.getDay()]}</span>
            <span class="week-dot">${h.records[k] ? '✓' : ''}</span>
          </div>`);
        }
        return `<section class="card habit-card">
          <div class="habit-head">
            <span class="habit-ico">${esc(h.icon)}</span>
            <div class="habit-meta">
              <strong>${esc(h.name)}</strong>
              <span>连续 ${streak} 天</span>
            </div>
            <button class="icon-btn del" data-del-habit="${h.id}" aria-label="删除">${ICON.close}</button>
          </div>
          <div class="week-grid">${week.join('')}</div>
          <button class="btn-check ${checked ? 'on' : ''}" data-toggle-habit="${h.id}">
            ${checked ? '今日已打卡' : '今日打卡'}
          </button>
        </section>`;
      }).join('');
    }
    main.innerHTML = html;

    $('#habitInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const v = e.target.value.trim();
        if (v) { Store.addHabit(v, $('#habitIcon').value.trim() || '✦'); render(); toast('已添加'); }
      }
    });
    $$('[data-toggle-habit]').forEach(el => el.addEventListener('click', () => {
      Store.toggleHabit(el.dataset.toggleHabit); render();
    }));
    $$('[data-del-habit]').forEach(el => el.addEventListener('click', async () => {
      if (await uiConfirm('删除这个习惯及全部打卡记录？', { danger: true, confirmText: '删除' })) {
        Store.deleteHabit(el.dataset.delHabit); render(); toast('已删除');
      }
    }));
  }

  /* ---------- 设置 ---------- */
  function renderSettings() {
    const s = Store.getSettings();
    let html = `
      <section class="card">
        <div class="card-head"><h3>个人信息</h3></div>
        <div class="field"><label>昵称</label>
          <input type="text" id="nicknameInput" value="${esc(s.nickname)}" placeholder="怎么称呼你"></div>
      </section>
      <section class="card">
        <div class="card-head"><h3>外观</h3></div>
        <div class="seg-switch wide">
          <button class="seg ${s.theme === 'light' ? 'on' : ''}" data-theme="light">浅色</button>
          <button class="seg ${s.theme === 'dark' ? 'on' : ''}" data-theme="dark">深色</button>
        </div>
      </section>
      <section class="card">
        <div class="card-head"><h3>功能管理</h3><span class="hint">按需开关</span></div>
        <div class="module-list">
          ${Object.entries(MODULES).map(([k, m]) => `
            <div class="module-row">
              <span class="module-ico" style="--c:${m.color}">${ICON[m.icon]}</span>
              <div class="module-meta"><strong>${m.name}</strong><span>${moduleDesc(k)}</span></div>
              <button class="toggle ${Store.isModuleOn(k) ? 'on' : ''}" data-module="${k}" aria-label="切换"></button>
            </div>`).join('')}
        </div>
      </section>
      <section class="card">
        <div class="card-head"><h3>数据</h3></div>
        <p class="hint block-hint">数据只保存在本机。清除浏览器数据或卸载应用会丢失，建议定期导出备份。</p>
        <div class="btn-row">
          <button class="btn-primary" id="exportBtn">导出备份</button>
          <button class="btn-ghost" id="importBtn">导入备份</button>
        </div>
        <input type="file" id="importFile" accept=".json" hidden>
      </section>
      <section class="card">
        <div class="card-head"><h3>密码本</h3></div>
        <p class="hint block-hint">密码本内容使用独立主密码加密存储，忘记密码无法恢复。备份文件里的密码本内容同样处于加密状态。</p>
        ${Store.hasVault()
          ? `<div class="btn-row"><button class="btn-ghost" id="vaultGo">进入</button>
             <button class="btn-ghost danger" id="vaultReset">重置密码本</button></div>`
          : `<p class="hint" style="margin:0">尚未创建密码本，进入「密码本」页面设置。</p>`}
      </section>
      <section class="card">
        <div class="card-head"><h3>图标库</h3><span class="hint">${(() => {
          const n = native();
          if (!n) return 'App 内可用';
          try { return `第 ${n.getIconIndex()}/${n.getIconCount()} 款`; } catch (e) { return 'App 内可用'; }
        })()}</span></div>
        <p class="hint block-hint">16 款图标随时切换。点选后桌面图标会更新；个别桌面可能需等几秒或重启桌面才显示。</p>
        <button class="btn-ghost block-btn" id="openIconGallery">选择图标</button>
      </section>
      <section class="card">
        <div class="card-head"><h3>权限管理</h3></div>
        <div class="perm-list">
          <div class="perm-row">
            <div class="perm-meta">
              <strong>通知提醒</strong>
              <span id="permNotifDesc">用于任务到点提醒</span>
            </div>
            <button class="perm-btn" id="permNotifBtn">检查</button>
          </div>
          <div class="perm-row">
            <div class="perm-meta">
              <strong>安装应用更新</strong>
              <span id="permInstallDesc">允许安装新版本 APK</span>
            </div>
            <button class="perm-btn" id="permInstallBtn">检查</button>
          </div>
        </div>
        <button class="btn-ghost block-btn" id="openSysSettings">打开系统应用设置</button>
        <p class="hint block-hint">系统级权限由安卓管理，这里可以快速跳转查看和修改。</p>
      </section>
      <section class="card">
        <div class="card-head"><h3>应用更新</h3></div>
        <div class="ver-row">
          <span>当前版本</span>
          <strong id="curVer">读取中…</strong>
        </div>
        <div class="ver-row">
          <span>最新版本</span>
          <strong id="latestVer">${UpdateState.latestText || '未检查'}</strong>
        </div>
        ${UpdateState.hasUpdate ? `<div class="update-note">${esc(UpdateState.changelog || '有新版本可用')}</div>` : ''}
        <div class="btn-row">
          <button class="btn-ghost" id="checkUpdateBtn">${UpdateState.checking ? '检查中…' : '检查更新'}</button>
          ${UpdateState.hasUpdate ? `<button class="btn-primary" id="doUpdateBtn">立即更新</button>` : ''}
        </div>
        <button class="btn-ghost block-btn" id="forceRefresh">强制刷新界面</button>
        <p class="hint block-hint">更新为覆盖安装，不会清除你的数据。界面样式异常时点「强制刷新」。</p>
      </section>
      <section class="card">
        <div class="card-head"><h3>关于</h3></div>
        <p class="hint block-hint">个人本地应用 · 数据不上传服务器 · 安装后可从桌面直接打开</p>
        <p class="hint block-hint" style="margin-top:8px">网页内核版本 ${esc(WEB_VERSION)}</p>
      </section>
      <div class="version-text" id="verFooter">我的工作台</div>`;
    main.innerHTML = html;

    $('#nicknameInput').addEventListener('change', e => {
      Store.setSetting('nickname', e.target.value.trim()); toast('已保存');
    });
    $$('[data-theme]').forEach(b => b.addEventListener('click', () => {
      Store.setSetting('theme', b.dataset.theme); render();
    }));
    $$('[data-module]').forEach(b => b.addEventListener('click', () => {
      const key = b.dataset.module;
      const on = Store.toggleModule(key);
      renderNav(); render();
      toast(`${MODULES[key].name}已${on ? '开启' : '关闭'}`);
      if (currentPage === key && !on) go('today');
    }));
    $('#exportBtn').addEventListener('click', () => {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `工作台备份_${Store.todayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('备份已导出');
    });
    $('#importBtn').addEventListener('click', () => $('#importFile').click());
    const vaultGo = $('#vaultGo');
    if (vaultGo) vaultGo.addEventListener('click', () => go('vault'));
    const vaultReset = $('#vaultReset');
    if (vaultReset) vaultReset.addEventListener('click', async () => {
      if (await uiConfirm('重置将删除密码本的全部记录，且无法恢复。确定继续？',
        { danger: true, confirmText: '重置' })) {
        Store.resetVault();
        vaultUnlockedEntries = null;
        Vault.lock();
        render(); toast('密码本已重置');
      }
    });
    $('#importFile').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const ok = await uiConfirm('导入会覆盖当前全部数据，确定继续？', { confirmText: '导入' });
          if (ok) { Store.importJSON(reader.result); renderNav(); render(); toast('导入成功'); }
        } catch (err) {
          uiAlert('导入失败：文件格式不正确');
        }
      };
      reader.readAsText(f);
      e.target.value = '';
    });

    /* ---- 图标库 ---- */
    const galleryBtn = $('#openIconGallery');
    if (galleryBtn) galleryBtn.addEventListener('click', openIconGallery);
    /* ---- 权限管理 ---- */
    initPermissionPanel();
    /* ---- 应用更新 ---- */
    initUpdatePanel();
  }

  /* ---------- 原生能力桥 ---------- */
  const WEB_VERSION = '4.4';   // 网页代码版本，每次改网页会同步更新

  function native() {
    try {
      if (typeof window !== 'undefined' && window.AndroidNative) return window.AndroidNative;
    } catch (e) { /* 忽略 */ }
    return null;
  }

  /** 是否运行在 App 内（有原生桥） */
  function inApp() {
    return !!native();
  }

  function getCurrentVersion() {
    const n = native();
    if (n && typeof n.getAppVersion === 'function') {
      try {
        const raw = n.getAppVersion();       // "2.4|6"
        const [name, code] = String(raw).split('|');
        return { name, code: Number(code) || 0, web: WEB_VERSION };
      } catch (e) { /* 忽略 */ }
    }
    return { name: '—', code: 0, web: WEB_VERSION };
  }

  function initPermissionPanel() {
    const n = native();
    const notifDesc = $('#permNotifDesc');
    const notifBtn = $('#permNotifBtn');
    const installDesc = $('#permInstallDesc');
    const installBtn = $('#permInstallBtn');

    const refresh = () => {
      if (!notifBtn || !installBtn) return;
      if (!n) {
        // 在浏览器里打开，没有原生能力
        if (notifDesc) notifDesc.textContent = '当前在浏览器中打开，安装为 App 后可用';
        notifBtn.textContent = '不可用'; notifBtn.disabled = true; notifBtn.classList.remove('on');
        installDesc.textContent = '当前在浏览器中打开，安装为 App 后可用';
        installBtn.textContent = '不可用'; installBtn.disabled = true; installBtn.classList.remove('on');
        return;
      }
      notifBtn.disabled = false;
      installBtn.disabled = false;
      // 通知
      let hasNotif = false;
      try { hasNotif = !!n.hasNotificationPermission(); } catch (e) { }
      notifDesc.textContent = hasNotif ? '已开启，任务到点会弹出通知' : '未开启，无法弹系统通知';
      notifBtn.textContent = hasNotif ? '已开启' : '去开启';
      notifBtn.classList.toggle('on', hasNotif);
      // 安装权限
      let canInstall = false;
      try { canInstall = !!n.canInstallPackages(); } catch (e) { }
      installDesc.textContent = canInstall ? '已允许安装更新' : '未允许，将无法一键更新';
      installBtn.textContent = canInstall ? '已允许' : '去设置';
      installBtn.classList.toggle('on', canInstall);
    };

    if (notifBtn) notifBtn.addEventListener('click', async () => {
      if (!n) return toast('请在 App 内操作');
      try {
        const r = n.requestNotificationPermission();
        if (r === 'settings') setTimeout(refresh, 800);
        else setTimeout(refresh, 1500);
        toast('请在弹出的提示中允许通知');
      } catch (e) { toast('操作失败'); }
    });

    if (installBtn) installBtn.addEventListener('click', async () => {
      if (!n) return toast('请在 App 内操作');
      try {
        const ok = n.canInstallPackages();
        if (ok) return toast('已允许安装更新');
        n.requestInstallPermission();
        toast('请在系统中允许「安装未知应用」');
        setTimeout(refresh, 1500);
      } catch (e) { toast('操作失败'); }
    });

    const sysBtn = $('#openSysSettings');
    if (sysBtn) sysBtn.addEventListener('click', () => {
      if (!n) return toast('请在 App 内操作');
      n.openAppSettings();
    });

    // 页面回到前台时刷新状态
    window.__refreshPerm = refresh;
    refresh();
  }

  // App 回到前台时刷新权限状态
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && typeof window.__refreshPerm === 'function') {
      window.__refreshPerm();
    }
  });

  // 原生通知权限回调
  window.__onNotificationPermission = function (granted) {
    toast(granted ? '通知权限已开启' : '通知权限被拒绝');
    if (typeof window.__refreshPerm === 'function') window.__refreshPerm();
  };

  /* ---------- 图标库 ---------- */
  function openIconGallery() {
    const n = native();
    if (!n || typeof n.getIconCount !== 'function') {
      return uiAlert('图标库需要在 App 内使用');
    }
    let cur = 1, count = 16;
    try { cur = n.getIconIndex(); count = n.getIconCount(); } catch (e) { }

    let thumbs = [];
    try {
      thumbs = Array.from({ length: count }, (_, i) => `./icons/gallery/icon${String(i + 1).padStart(2, '0')}.jpg`);
    } catch (e) { }

    openModal('选择图标', `
      <p class="hint block-hint">当前第 ${cur} 款。点选即切换，桌面图标随后刷新。</p>
      <div class="icon-grid">
        ${Array.from({ length: count }, (_, i) => {
          const idx = i + 1;
          return `<button class="icon-cell ${idx === cur ? 'on' : ''}" data-icon="${idx}">
            <img src="${thumbs[i] || ''}" alt="图标 ${idx}" loading="lazy">
            <span>${idx}</span>
          </button>`;
        }).join('')}
      </div>`);

    $$('[data-icon]').forEach(b => b.addEventListener('click', async () => {
      const idx = Number(b.dataset.icon);
      if (idx === cur) { toast('已经是当前图标'); return; }
      try {
        const r = n.switchIcon(idx);
        if (String(r).startsWith('error')) return toast('切换失败');
        $$('[data-icon]').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        cur = idx;
        toast('已切换，桌面图标稍后刷新');
      } catch (e) { toast('切换失败'); }
    }));
  }

  // 原生切换完成回调（可选）
  window.__onIconSwitched = function (idx) {
    toast(`图标已切换到第 ${idx} 款`);
  };

  function initUpdatePanel() {
    const cur = $('#curVer');
    const footer = $('#verFooter');

    const v = getCurrentVersion();
    if (cur) {
      cur.textContent = inApp()
        ? `${v.name}（${v.code}）`
        : `网页版 ${v.web}（未安装 App）`;
    }
    if (footer) {
      footer.textContent = inApp()
        ? `我的工作台 · App ${v.name} · 网页 ${v.web}`
        : `我的工作台 · 网页版 ${v.web}`;
    }

    async function checkUpdate(silent) {
      UpdateState.checking = true;
      if (!silent) render();   // 立刻把按钮变成"检查中…"
      try {
        const url = location.protocol === 'file:'
          ? 'https://fu-yuan415.github.io/my-hub/version.json?t=' + Date.now()
          : './version.json?t=' + Date.now();
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const info = await res.json();
        UpdateState.remoteInfo = info;
        UpdateState.latestText = `${info.versionName}（${info.versionCode}）`;
        UpdateState.hasUpdate = Number(info.versionCode) > v.code;
        UpdateState.changelog = info.changelog || '有新版本可用';
        UpdateState.checking = false;
        render();               // 关键：检测完重新渲染，让最新版本和按钮出现在页面上
        if (!silent) toast(UpdateState.hasUpdate ? '发现新版本，可立即更新' : '已是最新版本');
        return UpdateState.hasUpdate;
      } catch (e) {
        UpdateState.checking = false;
        UpdateState.latestText = '检查失败';
        UpdateState.hasUpdate = false;
        render();
        if (!silent) toast('检查更新失败，请检查网络');
        return false;
      }
    }

    const checkBtn = $('#checkUpdateBtn');
    if (checkBtn) checkBtn.addEventListener('click', () => checkUpdate(false));

    const refreshBtn = $('#forceRefresh');
    if (refreshBtn) refreshBtn.addEventListener('click', async () => {
      toast('正在刷新…');
      try {
        // 清 Service Worker 缓存
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
      } catch (e) { /* 忽略 */ }
      // 强制重载（带时间戳绕过缓存）
      location.replace(location.pathname + '?r=' + Date.now());
    });

    const doBtn = $('#doUpdateBtn');
    if (doBtn) doBtn.addEventListener('click', async () => {
      const info = UpdateState.remoteInfo;
      if (!info) return toast('请先检查更新');
      const n = native();
      if (n && typeof n.installUpdate === 'function') {
        const r = n.installUpdate(info.apkUrl, info.versionName,
          Number(info.versionCode));
        if (String(r).startsWith('error')) toast('启动更新失败');
        else toast('开始下载，请在提示中点击「安装」');
      } else {
        window.open(info.apkUrl, '_blank');
        toast('已在新页面打开下载');
      }
    });
  }

  function moduleDesc(k) {
    return {
      tasks: '待办事项与进度',
      diary: '按天记录心情文字',
      ledger: '收支记账与统计',
      habits: '每日习惯打卡'
    }[k] || '';
  }

  /* ---------- 密码本 ---------- */
  let vaultUnlockedEntries = null;   // 解锁后内存缓存

  function renderVault() {
    if (!Vault.isSupported()) {
      main.innerHTML = `<div class="card">${emptyState('当前环境不支持加密功能')}</div>`;
      return;
    }
    if (!Vault.isInitialized()) return renderVaultSetup();
    if (!Vault.isUnlocked()) return renderVaultLock();
    return renderVaultList();
  }

  function renderVaultSetup() {
    main.innerHTML = `
      <section class="card vault-hero">
        <div class="vault-badge">${ICON.lock}</div>
        <h3>设置密码本主密码</h3>
        <p class="hint block-hint">密码本里的内容会用这个密码加密后保存在本机，不上传。密码只在你脑中，忘记将无法恢复内容，请牢记。</p>
        <div class="field"><label>设置密码（至少 4 位）</label>
          <input type="password" id="vp1" placeholder="输入主密码" autocomplete="new-password"></div>
        <div class="field"><label>再输一次</label>
          <input type="password" id="vp2" placeholder="确认主密码" autocomplete="new-password"></div>
        <button class="btn-primary block" id="vSetup">创建密码本</button>
      </section>`;
    $('#vSetup').addEventListener('click', async () => {
      const p1 = $('#vp1').value, p2 = $('#vp2').value;
      if (p1.length < 4) return toast('密码至少 4 位');
      if (p1 !== p2) return toast('两次输入不一致');
      try {
        await Vault.setup(p1);
        toast('密码本已创建');
        render();
      } catch (e) { toast(e.message || '创建失败'); }
    });
  }

  function renderVaultLock() {
    main.innerHTML = `
      <section class="card vault-hero">
        <div class="vault-badge">${ICON.lock}</div>
        <h3>密码本已锁定</h3>
        <p class="hint block-hint">输入主密码查看内容。离开页面后会自动重新锁定。</p>
        <div class="field"><label>主密码</label>
          <input type="password" id="vpUnlock" placeholder="输入密码" autocomplete="current-password"></div>
        <button class="btn-primary block" id="vUnlock">解锁</button>
      </section>`;
    const doUnlock = async () => {
      try {
        await Vault.unlock($('#vpUnlock').value);
        vaultUnlockedEntries = null;
        render();
      } catch (e) { toast('密码错误'); }
    };
    $('#vUnlock').addEventListener('click', doUnlock);
    $('#vpUnlock').addEventListener('keydown', e => { if (e.key === 'Enter') doUnlock(); });
  }

  function renderVaultList() {
    if (!vaultUnlockedEntries) {
      Vault.getEntries().then(list => {
        vaultUnlockedEntries = list;
        renderVaultList();
      }).catch(() => { toast('读取失败'); });
      main.innerHTML = `<div class="card">${emptyState('解密中…')}</div>`;
      return;
    }
    const list = vaultUnlockedEntries;
    let html = `
      <div class="vault-topbar">
        <div class="vault-count">${list.length} 条记录</div>
        <div class="vault-actions">
          <button class="icon-btn" id="vLock" title="锁定">${ICON.lock}</button>
          <button class="icon-btn" id="vPwd" title="修改主密码">⚙</button>
        </div>
      </div>`;
    if (!list.length) {
      html += emptyState('还没有记录，点右下角 + 添加');
    } else {
      html += list.map(e => `
        <div class="row-card vault-row">
          <div class="vault-ico">${esc((e.title || '?').slice(0, 1))}</div>
          <div class="vault-info">
            <strong>${esc(e.title || '未命名')}</strong>
            <span>${esc(e.account || '无账号')}</span>
          </div>
          <button class="icon-btn" data-vshow="${e.id}" title="查看">${ICON.eye}</button>
        </div>`).join('');
    }
    main.innerHTML = html;

    $('#vLock').addEventListener('click', () => {
      Vault.lock(); vaultUnlockedEntries = null; render(); toast('已锁定');
    });
    $('#vPwd').addEventListener('click', openChangeVaultPassword);
    $$('[data-vshow]').forEach(el => el.addEventListener('click', () => {
      openVaultDetail(el.dataset.vshow);
    }));
  }

  function openVaultDetail(id) {
    const e = (vaultUnlockedEntries || []).find(x => x.id === id);
    if (!e) return;
    let showPwd = false;
    openModal(e.title || '未命名', `
      <div class="detail-list">
        <div class="detail-row"><span>账号</span>
          <div class="detail-val"><code id="dAcc">${esc(e.account || '—')}</code>
            ${e.account ? `<button class="icon-btn" data-copy="${esc(e.account)}">${ICON.copy}</button>` : ''}</div>
        </div>
        <div class="detail-row"><span>密码</span>
          <div class="detail-val"><code id="dPwd">••••••••</code>
            <button class="icon-btn" id="dToggle">${ICON.eye}</button>
            <button class="icon-btn" data-copy="${esc(e.password || '')}">${ICON.copy}</button></div>
        </div>
        ${e.url ? `<div class="detail-row"><span>网址</span><div class="detail-val"><span class="wrap-text">${esc(e.url)}</span></div></div>` : ''}
        ${e.category ? `<div class="detail-row"><span>分类</span><div class="detail-val">${esc(e.category)}</div></div>` : ''}
        ${e.note ? `<div class="detail-row"><span>备注</span><div class="detail-val"><span class="wrap-text">${esc(e.note)}</span></div></div>` : ''}
      </div>
      <div class="modal-actions">
        <button class="btn-ghost danger" id="vDel">删除</button>
        <button class="btn-primary" id="vEdit">编辑</button>
      </div>`);
    $('#dToggle').addEventListener('click', () => {
      showPwd = !showPwd;
      $('#dPwd').textContent = showPwd ? (e.password || '—') : '••••••••';
      $('#dToggle').innerHTML = showPwd ? ICON.eyeOff : ICON.eye;
    });
    $$('[data-copy]').forEach(b => b.addEventListener('click', () => {
      copyText(b.dataset.copy);
    }));
    $('#vDel').addEventListener('click', async () => {
      if (await uiConfirm('删除这条密码记录？', { danger: true, confirmText: '删除' })) {
        await Vault.deleteEntry(e.id);
        vaultUnlockedEntries = null;
        closeModal(); render(); toast('已删除');
      }
    });
    $('#vEdit').addEventListener('click', () => { closeModal(); openVaultEditor(e); });
  }

  function openVaultEditor(entry) {
    const e = entry || { title: '', account: '', password: '', url: '', note: '', category: '' };
    openModal(entry ? '编辑记录' : '新增记录', `
      <div class="form-label">名称</div>
      <input type="text" id="vTitle" value="${esc(e.title)}" placeholder="例如：某网站账号">
      <div class="form-label">账号 / 用户名</div>
      <input type="text" id="vAccount" value="${esc(e.account)}" placeholder="登录账号" autocomplete="off">
      <div class="form-label">密码</div>
      <div class="pwd-input-row">
        <input type="password" id="vPassword" value="${esc(e.password)}" placeholder="密码" autocomplete="new-password">
        <button class="icon-btn" id="vToggle2">${ICON.eye}</button>
        <button class="icon-btn" id="vGen" title="生成随机密码">⟳</button>
      </div>
      <div class="form-label">网址（可选）</div>
      <input type="text" id="vUrl" value="${esc(e.url)}" placeholder="https://…">
      <div class="form-label">备注（可选）</div>
      <input type="text" id="vNote" value="${esc(e.note)}" placeholder="安全问题答案等">
      <div class="modal-actions"><button class="btn-primary block" id="vSave">保存</button></div>`);
    $('#vToggle2').addEventListener('click', () => {
      const inp = $('#vPassword');
      const isPwd = inp.type === 'password';
      inp.type = isPwd ? 'text' : 'password';
      $('#vToggle2').innerHTML = isPwd ? ICON.eyeOff : ICON.eye;
    });
    $('#vGen').addEventListener('click', () => {
      $('#vPassword').value = genPassword(16);
      $('#vPassword').type = 'text';
      toast('已生成 16 位随机密码');
    });
    $('#vSave').addEventListener('click', async () => {
      const data = {
        title: $('#vTitle').value.trim(),
        account: $('#vAccount').value.trim(),
        password: $('#vPassword').value,
        url: $('#vUrl').value.trim(),
        note: $('#vNote').value.trim(),
        category: e.category || ''
      };
      if (!data.title) return toast('请输入名称');
      try {
        if (entry) await Vault.updateEntry(entry.id, data);
        else await Vault.addEntry(data);
        vaultUnlockedEntries = null;
        closeModal(); render(); toast('已保存');
      } catch (err) { toast('保存失败'); }
    });
  }

  function openChangeVaultPassword() {
    openModal('修改主密码', `
      <div class="field"><label>当前密码</label>
        <input type="password" id="cpOld" autocomplete="current-password"></div>
      <div class="field"><label>新密码（至少 4 位）</label>
        <input type="password" id="cpNew" autocomplete="new-password"></div>
      <div class="field"><label>确认新密码</label>
        <input type="password" id="cpNew2" autocomplete="new-password"></div>
      <p class="hint block-hint">修改后所有记录会用新密码重新加密。</p>
      <div class="modal-actions"><button class="btn-primary block" id="cpSave">确认修改</button></div>`);
    $('#cpSave').addEventListener('click', async () => {
      const o = $('#cpOld').value, n = $('#cpNew').value, n2 = $('#cpNew2').value;
      if (n.length < 4) return toast('新密码至少 4 位');
      if (n !== n2) return toast('两次输入不一致');
      try {
        await Vault.changePassword(o, n);
        vaultUnlockedEntries = null;
        closeModal(); render(); toast('主密码已修改');
      } catch (e) { toast(e.message || '修改失败'); }
    });
  }

  function genPassword(len) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let out = '';
    for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
    return out;
  }

  function copyText(text) {
    if (!text) return;
    const done = () => toast('已复制');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) { toast('复制失败'); }
    document.body.removeChild(ta);
  }

  /* ---------- 统计 ---------- */
  function renderStats() {
    const today = Store.todayKey();
    const tasks = Store.getTasks();
    const ledger = Store.getLedger();
    const diaries = Store.getAllDiaries();
    const habits = Store.getHabits();

    /* 近 7 天任务完成情况 */
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = Store.dateKey(d);
      const dayTasks = tasks.filter(t => t.date === k);
      days.push({
        key: k,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        total: dayTasks.length,
        done: dayTasks.filter(t => t.done).length
      });
    }
    const maxTask = Math.max(1, ...days.map(d => d.total));

    /* 近 7 天支出 */
    const spendDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = Store.dateKey(d);
      const amt = ledger.filter(r => r.date === k && r.type === 'expense')
        .reduce((a, r) => a + r.amount, 0);
      spendDays.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, amount: amt });
    }
    const maxSpend = Math.max(1, ...spendDays.map(d => d.amount));

    /* 习惯完成热力（近 5 周） */
    const heat = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = Store.dateKey(d);
      const cnt = habits.filter(h => h.records[k]).length;
      heat.push({ key: k, count: cnt, ratio: habits.length ? cnt / habits.length : 0 });
    }

    /* 本月汇总 */
    const m = monthKey(new Date());
    const monthLedger = ledger.filter(r => (r.date || '').startsWith(m));
    const mExpense = monthLedger.filter(r => r.type === 'expense').reduce((a, r) => a + r.amount, 0);
    const mIncome = monthLedger.filter(r => r.type === 'income').reduce((a, r) => a + r.amount, 0);
    const monthDiaries = diaries.filter(d => d.date.startsWith(m)).length;
    const monthTasksDone = tasks.filter(t => t.done && (t.date || '').startsWith(m)).length;
    const totalStreak = habits.reduce((a, h) => a + Store.habitStreak(h), 0);

    let html = `
      <section class="card">
        <div class="card-head"><h3>本月概览</h3></div>
        <div class="overview-grid">
          <div class="ov-item"><strong>${monthTasksDone}</strong><span>完成任务</span></div>
          <div class="ov-item"><strong>${monthDiaries}</strong><span>篇日记</span></div>
          <div class="ov-item"><strong>${fmtMoney(mExpense)}</strong><span>支出</span></div>
          <div class="ov-item"><strong>${fmtMoney(mIncome)}</strong><span>收入</span></div>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h3>近 7 天任务</h3><span class="hint">完成 / 总数</span></div>
        <div class="chart-bars">
          ${days.map(d => `
            <div class="chart-col">
              <div class="chart-bar-wrap">
                <div class="chart-bar" style="height:${d.total ? Math.max(8, d.total / maxTask * 100) : 3}%">
                  <div class="chart-bar-fill" style="height:${d.total ? (d.done / d.total * 100) : 0}%"></div>
                </div>
              </div>
              <span class="chart-x">${d.label}</span>
            </div>`).join('')}
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h3>近 7 天支出</h3><span class="hint">${fmtMoney(spendDays.reduce((a, d) => a + d.amount, 0))}</span></div>
        <div class="chart-bars">
          ${spendDays.map(d => `
            <div class="chart-col">
              <div class="chart-bar-wrap">
                <div class="chart-bar spend" style="height:${d.amount ? Math.max(6, d.amount / maxSpend * 100) : 3}%"></div>
              </div>
              <span class="chart-x">${d.label}</span>
            </div>`).join('')}
        </div>
      </section>`;

    if (habits.length) {
      html += `<section class="card">
        <div class="card-head"><h3>习惯热力</h3><span class="hint">近 5 周</span></div>
        <div class="heat-grid">
          ${heat.map(h => {
            const lv = habits.length === 0 ? 0 : Math.ceil(h.ratio * 4);
            return `<div class="heat-cell lv${lv}" title="${h.key}：${h.count} 项"></div>`;
          }).join('')}
        </div>
        <div class="heat-legend"><span>少</span><i class="heat-cell lv0"></i><i class="heat-cell lv1"></i><i class="heat-cell lv2"></i><i class="heat-cell lv3"></i><i class="heat-cell lv4"></i><span>多</span></div>
      </section>`;
    }

    if (habits.length) {
      html += `<section class="card">
        <div class="card-head"><h3>习惯连续天数</h3></div>
        ${habits.map(h => `
          <div class="streak-row">
            <span class="streak-name">${esc(h.icon)} ${esc(h.name)}</span>
            <span class="streak-val">${Store.habitStreak(h)} 天</span>
          </div>`).join('')}
        <div class="hint" style="margin-top:10px">累计连续 ${totalStreak} 天</div>
      </section>`;
    }

    main.innerHTML = html;
  }

  /* ---------- 周/月回顾 ---------- */
  function openReview() {
    const now = new Date();
    const m = monthKey(now);
    const tasks = Store.getTasks();
    const diaries = Store.getAllDiaries();
    const ledger = Store.getLedger();
    const habits = Store.getHabits();

    const monthLedger = ledger.filter(r => (r.date || '').startsWith(m));
    const expense = monthLedger.filter(r => r.type === 'expense').reduce((a, r) => a + r.amount, 0);
    const income = monthLedger.filter(r => r.type === 'income').reduce((a, r) => a + r.amount, 0);
    const monthDiary = diaries.filter(d => d.date.startsWith(m));
    const monthTasks = tasks.filter(t => (t.date || '').startsWith(m));
    const monthDone = monthTasks.filter(t => t.done);
    const rate = monthTasks.length ? Math.round(monthDone.length / monthTasks.length * 100) : 0;

    const catSum = {};
    monthLedger.filter(r => r.type === 'expense').forEach(r => {
      catSum[r.category] = (catSum[r.category] || 0) + r.amount;
    });
    const topCats = Object.entries(catSum).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const moods = {};
    monthDiary.forEach(d => { if (d.mood) moods[d.mood] = (moods[d.mood] || 0) + 1; });
    const topMood = Object.entries(moods).sort((a, b) => b[1] - a[1])[0];

    openModal(`${now.getFullYear()} 年 ${now.getMonth() + 1} 月回顾`, `
      <div class="review-block">
        <div class="review-title">任务</div>
        <p class="review-text">本月共 <b>${monthTasks.length}</b> 项任务，完成 <b>${monthDone.length}</b> 项，完成率 <b>${rate}%</b>。</p>
      </div>
      <div class="review-block">
        <div class="review-title">日记</div>
        <p class="review-text">写了 <b>${monthDiary.length}</b> 篇日记${topMood ? `，最常出现的心情是 ${topMood[0]}（${topMood[1]} 次）` : ''}。</p>
      </div>
      <div class="review-block">
        <div class="review-title">收支</div>
        <p class="review-text">支出 <b>${fmtMoney(expense)}</b>，收入 <b>${fmtMoney(income)}</b>，结余 <b>${fmtMoney(income - expense)}</b>。</p>
        ${topCats.length ? `<p class="review-text">主要花在：${topCats.map(([c, v]) => `${c} ${fmtMoney(v)}`).join('、')}。</p>` : ''}
      </div>
      <div class="review-block">
        <div class="review-title">习惯</div>
        <p class="review-text">${habits.length ? habits.map(h => `${esc(h.name)} ${Store.habitStreak(h)} 天`).join('、') : '还没有设置习惯。'}</p>
      </div>
      <div class="modal-actions"><button class="btn-primary block" id="closeReview">好的</button></div>`);
    $('#closeReview').addEventListener('click', closeModal);
  }

  /* ---------- 全局搜索 ---------- */
  let searchQuery = '';

  function openSearch() {
    searchQuery = '';
    openModal('搜索', `
      <div class="search-bar">
        <span class="search-ico">${ICON.search}</span>
        <input type="search" id="searchInput" placeholder="搜索任务、日记、账目" autocomplete="off">
      </div>
      <div id="searchResults" class="search-results">${emptyState('输入关键词开始搜索')}</div>`);
    const input = $('#searchInput');
    input.focus();
    input.addEventListener('input', () => {
      searchQuery = input.value.trim();
      renderSearchResults();
    });
    renderSearchResults();
  }

  function renderSearchResults() {
    const box = $('#searchResults');
    if (!box) return;
    const q = searchQuery.toLowerCase();
    if (!q) { box.innerHTML = emptyState('输入关键词开始搜索'); return; }

    const tasks = Store.getTasks().filter(t => t.text.toLowerCase().includes(q));
    const diaries = Store.getAllDiaries().filter(d => htmlToText(d.content).toLowerCase().includes(q));
    const ledger = Store.getLedger().filter(r =>
      (r.note || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q));

    const total = tasks.length + diaries.length + ledger.length;
    if (!total) { box.innerHTML = emptyState(`没有找到「${esc(searchQuery)}」相关内容`); return; }

    let html = '';
    if (tasks.length) {
      html += `<div class="search-group">任务 (${tasks.length})</div>`;
      html += tasks.slice(0, 8).map(t => `
        <div class="row-card search-item" data-go="tasks">
          <span class="search-tag">任务</span>
          <span class="search-text">${esc(t.text)}${t.done ? ' <span class="hint">（已完成）</span>' : ''}</span>
        </div>`).join('');
    }
    if (diaries.length) {
      html += `<div class="search-group">日记 (${diaries.length})</div>`;
      html += diaries.slice(0, 8).map(d => `
        <div class="row-card search-item" data-diary="${d.date}">
          <span class="search-tag diary">日记</span>
          <span class="search-text">${d.date} · ${esc(htmlToText(d.content).slice(0, 50))}</span>
        </div>`).join('');
    }
    if (ledger.length) {
      html += `<div class="search-group">记账 (${ledger.length})</div>`;
      html += ledger.slice(0, 8).map(r => `
        <div class="row-card search-item" data-go="ledger">
          <span class="search-tag ledger">记账</span>
          <span class="search-text">${r.date} ${esc(r.category)} ${r.type === 'income' ? '+' : '−'}${fmtMoney(r.amount)} ${esc(r.note || '')}</span>
        </div>`).join('');
    }
    box.innerHTML = html;
    box.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => {
      closeModal(); go(el.dataset.go);
    }));
    box.querySelectorAll('[data-diary]').forEach(el => el.addEventListener('click', () => {
      closeModal(); openDiaryEditor(el.dataset.diary);
    }));
  }

  /* ---------- FAB ---------- */
  fab.addEventListener('click', () => {
    if (currentPage === 'ledger') openLedgerModal();
    else if (currentPage === 'habits') { const el = $('#habitInput'); el && el.focus(); }
    else if (currentPage === 'tasks') { const el = $('#taskInput'); el && el.focus(); }
    else if (currentPage === 'vault') {
      if (Vault.isUnlocked()) openVaultEditor(null);
      else toast('请先解锁密码本');
    }
  });

  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  $('#modalClose').addEventListener('click', closeModal);
  const searchBtn = $('#searchBtn');
  if (searchBtn) searchBtn.addEventListener('click', openSearch);

  /* ---------- 任务提醒 ---------- */
  function checkReminders() {
    try {
      const due = Store.dueReminders();
      if (!due.length) return;
      const n = native();
      due.forEach(t => {
        // 优先用原生系统通知
        if (n && typeof n.sendTestNotification === 'function') {
          try { n.sendTestNotification('任务提醒', t.text); } catch (e) { }
        } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification('任务提醒', { body: t.text, tag: t.id }); } catch (e) { }
        }
        toast(`提醒：${t.text}`);
        Store.markReminded(t.id);
      });
    } catch (e) { /* 忽略 */ }
  }
  setInterval(checkReminders, 30000);
  checkReminders();

  /* ---------- 启动 ---------- */
  // 本地版：file:// 下 Service Worker 不工作，也不必要
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  renderNav();
  render();

  /* 测试钩子（仅在自动化测试时使用，不影响正常运行） */
  if (typeof window !== 'undefined' && window.__DSH_TEST__) {
    window.__hooks = {
      go, renderToday, renderTasks, renderDiary, renderLedger,
      renderHabits, renderVault, renderStats, renderSettings, renderNav
    };
  }
})();

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
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>'
  };

  const MODULES = {
    tasks: { name: '任务', icon: 'task', color: '#5b73e8' },
    diary: { name: '日记', icon: 'diary', color: '#e0648b' },
    ledger: { name: '记账', icon: 'ledger', color: '#22a06b' },
    habits: { name: '习惯', icon: 'habit', color: '#e08a2e' }
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

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
    { key: 'settings', name: '设置', icon: 'settings' }
  ];

  function renderNav() {
    const nav = $('.bottom-nav');
    nav.innerHTML = NAV.filter(n => {
      if (n.key === 'today' || n.key === 'settings') return true;
      return Store.isModuleOn(n.key);
    }).map(n => `
      <button class="nav-item ${currentPage === n.key ? 'active' : ''}" data-page="${n.key}">
        <span class="nav-icon">${ICON[n.icon]}</span><span class="nav-label">${n.name}</span>
      </button>`).join('');
    $$('.nav-item').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.page)));
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
      tasks: '任务', diary: '日记', ledger: '记账', habits: '习惯', settings: '设置'
    };
    pageTitle.textContent = titles[currentPage] || greetingShort();

    const pages = {
      today: renderToday, tasks: renderTasks, diary: renderDiary,
      ledger: renderLedger, habits: renderHabits, settings: renderSettings
    };
    (pages[currentPage] || renderToday)();

    fab.style.display = (currentPage === 'tasks' || currentPage === 'ledger' || currentPage === 'habits')
      ? 'flex' : 'none';
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
      </div>
    </section>`;

    main.innerHTML = html;
    $$('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));
    $$('[data-habit]').forEach(el => el.addEventListener('click', () => {
      Store.toggleHabit(el.dataset.habit); render();
    }));
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
        if (v) { Store.addTask(v, $('#taskPriority').value, today); render(); toast('已添加'); }
      }
    });
    $$('[data-toggle-task]').forEach(el => el.addEventListener('click', () => {
      Store.toggleTask(el.dataset.toggleTask); render();
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
    return `<div class="row-card task-row ${t.done ? 'done' : ''}">
      <button class="check ${t.done ? 'on' : ''}" data-toggle-task="${t.id}" aria-label="完成">
        ${t.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4.5 4.5L19 7"/></svg>' : ''}
      </button>
      <span class="task-text">${esc(t.text)}</span>
      ${badge}
      <button class="icon-btn del" data-del-task="${t.id}" aria-label="删除">${ICON.close}</button>
    </div>`;
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
          <div class="diary-row-text">${esc((d.content || '').slice(0, 90) || '（空白）')}${(d.content || '').length > 90 ? '…' : ''}</div>
        </div>`).join('');
    }
    main.innerHTML = html;

    $('#newDiary').addEventListener('click', () => openDiaryEditor(Store.todayKey()));
    $$('[data-diary]').forEach(el => el.addEventListener('click', () => openDiaryEditor(el.dataset.diary)));
  }

  function openDiaryEditor(date) {
    const d = Store.getDiary(date) || { content: '', mood: '' };
    openModal(dayLabel(date), `
      <div class="mood-row">
        ${MOODS.map(m => `<button class="mood-item ${d.mood === m.e ? 'on' : ''}" data-mood="${m.e}">
          <span class="mood-emoji">${m.e}</span><span class="mood-text">${m.t}</span>
        </button>`).join('')}
      </div>
      <textarea id="diaryText" class="diary-area" placeholder="今天发生了什么？想记下些什么…">${esc(d.content)}</textarea>
      <div class="modal-actions">
        ${d.content ? `<button class="btn-ghost danger" id="delDiary">删除</button>` : ''}
        <button class="btn-primary" id="saveDiary">保存</button>
      </div>`);
    let mood = d.mood;
    $$('.mood-item').forEach(b => b.addEventListener('click', () => {
      mood = b.dataset.mood;
      $$('.mood-item').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    }));
    $('#saveDiary').addEventListener('click', () => {
      Store.saveDiary(date, $('#diaryText').value, mood);
      closeModal(); render(); toast('日记已保存');
    });
    const del = $('#delDiary');
    if (del) del.addEventListener('click', async () => {
      if (await uiConfirm('确定删除这篇日记吗？删除后无法恢复。', { danger: true, confirmText: '删除' })) {
        Store.deleteDiary(date); closeModal(); render(); toast('已删除');
      }
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
        <div class="card-head"><h3>关于</h3></div>
        <p class="hint block-hint">个人本地应用 · 数据不上传服务器 · 安装后可从桌面直接打开</p>
      </section>
      <div class="version-text">我的工作台 · 2.0</div>`;
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
  }

  function moduleDesc(k) {
    return {
      tasks: '待办事项与进度',
      diary: '按天记录心情文字',
      ledger: '收支记账与统计',
      habits: '每日习惯打卡'
    }[k] || '';
  }

  /* ---------- FAB ---------- */
  fab.addEventListener('click', () => {
    if (currentPage === 'ledger') openLedgerModal();
    else if (currentPage === 'habits') { const el = $('#habitInput'); el && el.focus(); }
    else if (currentPage === 'tasks') { const el = $('#taskInput'); el && el.focus(); }
  });

  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  $('#modalClose').addEventListener('click', closeModal);

  /* ---------- 启动 ---------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  renderNav();
  render();
})();

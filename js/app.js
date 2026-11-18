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

  const MODULES = {
    tasks: { name: '任务', icon: '✓', color: '#5b73e8' },
    diary: { name: '日记', icon: '▤', color: '#e0718b' },
    ledger: { name: '记账', icon: '¥', color: '#2fa37b' },
    habits: { name: '习惯', icon: '✦', color: '#e6a23c' }
  };
  const MOODS = ['😄', '🙂', '😐', '😔', '😢', '😡'];
  const EXPENSE_CATS = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '学习', '其他'];
  const INCOME_CATS = ['工资', '兼职', '理财', '红包', '其他'];

  let currentPage = 'today';
  let toastTimer = null;
  let ledgerFilterMonth = new Date().toISOString().slice(0, 7);

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
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }
  function activeModules() {
    return Object.keys(MODULES).filter(k => Store.isModuleOn(k));
  }

  /* ---------- 弹窗 ---------- */
  function openModal(title, bodyHTML) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modal.classList.remove('hidden');
  }
  function closeModal() { modal.classList.add('hidden'); }

  /* ---------- 导航 ---------- */
  const NAV = [
    { key: 'today', name: '今日', icon: '⌂' },
    { key: 'tasks', name: '任务', icon: '✓' },
    { key: 'diary', name: '日记', icon: '▤' },
    { key: 'ledger', name: '记账', icon: '¥' },
    { key: 'habits', name: '习惯', icon: '✦' },
    { key: 'settings', name: '设置', icon: '⚙' }
  ];

  function renderNav() {
    const nav = $('.bottom-nav');
    nav.innerHTML = NAV.filter(n => {
      if (n.key === 'today' || n.key === 'settings') return true;
      return Store.isModuleOn(n.key);
    }).map(n => `
      <button class="nav-item ${currentPage === n.key ? 'active' : ''}" data-page="${n.key}">
        <span class="nav-icon">${n.icon}</span><span class="nav-label">${n.name}</span>
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
    $('meta[name="theme-color"]').setAttribute('content', s.theme === 'dark' ? '#1f2430' : '#5b73e8');
    const now = new Date();
    topbarDate.textContent = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdayCN(now)}`;

    const titles = {
      today: s.nickname ? `你好，${s.nickname}` : '今日',
      tasks: '任务', diary: '日记', ledger: '记账', habits: '习惯打卡', settings: '设置'
    };
    pageTitle.textContent = titles[currentPage] || '今日';

    const pages = {
      today: renderToday, tasks: renderTasks, diary: renderDiary,
      ledger: renderLedger, habits: renderHabits, settings: renderSettings
    };
    (pages[currentPage] || renderToday)();

    fab.style.display = (currentPage === 'tasks' || currentPage === 'ledger' || currentPage === 'habits')
      ? 'flex' : 'none';
  }

  /* ---------- 今日 ---------- */
  function renderToday() {
    const today = Store.todayKey();
    const tasks = Store.getTasks().filter(t => t.date === today);
    const done = tasks.filter(t => t.done).length;
    const diary = Store.getDiary(today);
    const st = Store.ledgerStats(today.slice(0, 7));
    const todayExpense = Store.getLedger()
      .filter(r => r.date === today && r.type === 'expense')
      .reduce((a, r) => a + r.amount, 0);
    const habits = Store.getHabits();
    const checkedHabits = habits.filter(h => h.records[today]).length;
    const hour = new Date().getHours();
    const greet = hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
    const s = Store.getSettings();

    let html = `
      <section class="hero-card">
        <div class="hero-greet">${greet}${s.nickname ? '，' + esc(s.nickname) : ''} 👋</div>
        <div class="hero-date">${today} · ${weekdayCN(new Date())}</div>
        <div class="hero-quote">${quoteOfDay()}</div>
      </section>`;

    html += `<div class="summary-grid">`;
    html += summaryCard('✓', '今日任务', `${done}/${tasks.length}`, 'tasks', '#5b73e8');
    if (Store.isModuleOn('ledger')) {
      html += summaryCard('¥', '今日支出', fmtMoney(todayExpense), 'ledger', '#2fa37b');
    }
    if (Store.isModuleOn('habits')) {
      html += summaryCard('✦', '习惯打卡', `${checkedHabits}/${habits.length}`, 'habits', '#e6a23c');
    }
    html += `</div>`;

    if (Store.isModuleOn('tasks')) {
      html += `<section class="card">
        <div class="card-head"><h3>今日待办</h3><button class="link-btn" data-go="tasks">查看全部 ›</button></div>
        ${tasks.length === 0 ? emptyHint('还没有任务，点右下角 + 添加') :
          tasks.slice(0, 5).map(t => taskRow(t, true)).join('')}
      </section>`;
    }

    if (Store.isModuleOn('diary')) {
      html += `<section class="card" data-go="diary" style="cursor:pointer">
        <div class="card-head"><h3>今日日记</h3><span class="link-btn">${diary ? '继续编辑 ›' : '写一篇 ›'}</span></div>
        ${diary && diary.content
          ? `<p class="diary-preview">${esc(diary.content.slice(0, 80))}${diary.content.length > 80 ? '…' : ''}</p>
             ${diary.mood ? `<div class="mood-tag">今日心情 ${diary.mood}</div>` : ''}`
          : emptyHint('记录今天的心情和想法')}
      </section>`;
    }

    if (Store.isModuleOn('habits') && habits.length) {
      html += `<section class="card">
        <div class="card-head"><h3>习惯打卡</h3><button class="link-btn" data-go="habits">全部 ›</button></div>
        <div class="habit-mini-row">
          ${habits.map(h => `
            <button class="habit-mini ${h.records[today] ? 'checked' : ''}" data-habit="${h.id}" title="${esc(h.name)}">
              <span class="habit-mini-icon">${esc(h.icon)}</span>
              <span class="habit-mini-name">${esc(h.name)}</span>
            </button>`).join('')}
        </div>
      </section>`;
    }

    html += `<section class="card module-shortcuts">
      <div class="card-head"><h3>快捷入口</h3></div>
      <div class="shortcut-grid">
        ${activeModules().map(k => `
          <button class="shortcut" data-go="${k}">
            <span class="shortcut-icon" style="background:${MODULES[k].color}18;color:${MODULES[k].color}">${MODULES[k].icon}</span>
            <span>${MODULES[k].name}</span>
          </button>`).join('')}
      </div>
    </section>`;

    main.innerHTML = html;
    bindCommon();
    $$('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));
    $$('[data-habit]').forEach(el => el.addEventListener('click', () => {
      Store.toggleHabit(el.dataset.habit);
      render();
    }));
  }

  function quoteOfDay() {
    const quotes = [
      '把今天过好，就是对未来最好的投资。',
      '不积跬步，无以至千里。',
      '专注当下，一步一步来。',
      '生活是喜欢折腾的人的舞台。',
      '记录，是为了更好地前行。',
      '简单一点，专注一点，快乐一点。',
      '每个平凡的日子都值得被认真对待。'
    ];
    const d = new Date();
    const idx = (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % quotes.length;
    return quotes[idx];
  }

  function summaryCard(icon, label, value, target, color) {
    return `<button class="summary-card" data-go="${target}">
      <div class="summary-icon" style="background:${color}18;color:${color}">${icon}</div>
      <div class="summary-info"><div class="summary-value">${value}</div><div class="summary-label">${label}</div></div>
    </button>`;
  }

  function emptyHint(text) {
    return `<div class="empty-hint">${esc(text)}</div>`;
  }

  /* ---------- 任务 ---------- */
  function renderTasks() {
    const tasks = Store.getTasks();
    const today = Store.todayKey();
    const pending = tasks.filter(t => !t.done);
    const done = tasks.filter(t => t.done);
    let html = `
      <div class="stat-bar">
        <div><strong>${pending.length}</strong><span>待办</span></div>
        <div><strong>${done.length}</strong><span>已完成</span></div>
      </div>
      <div class="add-inline">
        <input id="taskInput" type="text" placeholder="添加新任务，回车确认" autocomplete="off">
        <select id="taskPriority">
          <option value="mid">普通</option>
          <option value="high">重要</option>
          <option value="low">低优先</option>
        </select>
      </div>`;
    html += `<div class="section-label">待办 (${pending.length})</div>`;
    html += pending.length ? pending.map(t => taskRow(t)).join('') : emptyHint('暂无待办任务，轻松一下 ✨');
    if (done.length) {
      html += `<div class="section-label">已完成 (${done.length})
        <button class="link-btn" id="clearDone">清除已完成</button></div>`;
      html += done.map(t => taskRow(t)).join('');
    }
    main.innerHTML = html;

    $('#taskInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const v = e.target.value.trim();
        if (v) { Store.addTask(v, $('#taskPriority').value, today); render(); toast('已添加任务'); }
      }
    });
    $$('[data-toggle-task]').forEach(el => el.addEventListener('click', () => {
      Store.toggleTask(el.dataset.toggleTask); render();
    }));
    $$('[data-del-task]').forEach(el => el.addEventListener('click', e => {
      e.stopPropagation(); Store.deleteTask(el.dataset.delTask); render(); toast('已删除');
    }));
    const cd = $('#clearDone');
    if (cd) cd.addEventListener('click', () => {
      done.forEach(t => Store.deleteTask(t.id)); render(); toast('已清除完成项');
    });
  }

  function taskRow(t, mini = false) {
    const badge = t.priority === 'high' ? '<span class="prio high">重要</span>'
      : t.priority === 'low' ? '<span class="prio low">低</span>' : '';
    return `<div class="task-row ${t.done ? 'done' : ''}">
      <button class="checkbox ${t.done ? 'checked' : ''}" data-toggle-task="${t.id}">${t.done ? '✓' : ''}</button>
      <span class="task-text">${esc(t.text)}</span>
      ${badge}
      <button class="del-btn" data-del-task="${t.id}">×</button>
    </div>`;
  }

  /* ---------- 日记 ---------- */
  function renderDiary() {
    const list = Store.getAllDiaries();
    let html = `
      <div class="diary-actions">
        <button class="primary-btn" id="newDiary">✎ 写今天的日记</button>
      </div>
      <div class="section-label">历史日记 (${list.length})</div>`;
    if (!list.length) {
      html += emptyHint('还没有日记，写下第一篇吧');
    } else {
      html += list.map(d => `
        <div class="diary-item" data-diary="${d.date}">
          <div class="diary-item-head">
            <strong>${d.date}</strong>
            ${d.mood ? `<span class="mood-tag">${d.mood}</span>` : ''}
            <span class="diary-item-time">${d.updatedAt ? new Date(d.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
          <div class="diary-item-preview">${esc((d.content || '').slice(0, 100) || '（空）')}${(d.content || '').length > 100 ? '…' : ''}</div>
        </div>`).join('');
    }
    main.innerHTML = html;

    $('#newDiary').addEventListener('click', () => openDiaryEditor(Store.todayKey()));
    $$('[data-diary]').forEach(el => el.addEventListener('click', () => openDiaryEditor(el.dataset.diary)));
  }

  function openDiaryEditor(date) {
    const d = Store.getDiary(date) || { content: '', mood: '' };
    openModal(date + ' 日记', `
      <div class="mood-picker">
        ${MOODS.map(m => `<button class="mood-btn ${d.mood === m ? 'sel' : ''}" data-mood="${m}">${m}</button>`).join('')}
      </div>
      <textarea id="diaryText" class="diary-textarea" placeholder="写下今天的想法、心情、发生的事…">${esc(d.content)}</textarea>
      <div class="modal-actions">
        ${d.content ? `<button class="danger-btn" id="delDiary">删除</button>` : ''}
        <button class="primary-btn" id="saveDiary">保存</button>
      </div>`);
    let mood = d.mood;
    $$('.mood-btn').forEach(b => b.addEventListener('click', () => {
      mood = b.dataset.mood;
      $$('.mood-btn').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel');
    }));
    $('#saveDiary').addEventListener('click', () => {
      Store.saveDiary(date, $('#diaryText').value, mood);
      closeModal(); render(); toast('日记已保存');
    });
    const del = $('#delDiary');
    if (del) del.addEventListener('click', () => {
      if (confirm('确定删除这篇日记吗？')) {
        Store.deleteDiary(date); closeModal(); render(); toast('已删除');
      }
    });
  }

  /* ---------- 记账 ---------- */
  function renderLedger() {
    const st = Store.ledgerStats(ledgerFilterMonth);
    const records = Store.getLedger().filter(r => (r.date || '').slice(0, 7) === ledgerFilterMonth);
    const maxCat = st.categories.length ? st.categories[0][1] : 1;

    let html = `
      <div class="month-nav">
        <button id="prevMonth">‹</button>
        <input type="month" id="monthInput" value="${ledgerFilterMonth}">
        <button id="nextMonth">›</button>
      </div>
      <div class="ledger-summary">
        <div class="ls-item"><span>支出</span><strong class="expense">${fmtMoney(st.expense)}</strong></div>
        <div class="ls-item"><span>收入</span><strong class="income">${fmtMoney(st.income)}</strong></div>
        <div class="ls-item"><span>结余</span><strong>${fmtMoney(st.balance)}</strong></div>
      </div>`;

    if (st.categories.length) {
      html += `<section class="card">
        <div class="card-head"><h3>支出分类</h3></div>
        <div class="bar-chart">
          ${st.categories.slice(0, 6).map(([cat, amt]) => `
            <div class="bar-row">
              <span class="bar-label">${esc(cat)}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, amt / maxCat * 100)}%"></div></div>
              <span class="bar-value">${fmtMoney(amt)}</span>
            </div>`).join('')}
        </div>
      </section>`;
    }

    html += `<div class="section-label">明细 (${records.length})</div>`;
    if (!records.length) {
      html += emptyHint('本月还没有记录，点右下角 + 记一笔');
    } else {
      // 按日期分组
      let lastDate = null;
      html += records.map(r => {
        let head = '';
        if (r.date !== lastDate) {
          lastDate = r.date;
          head = `<div class="ledger-date-head">${r.date}</div>`;
        }
        return head + `
          <div class="ledger-row">
            <div class="ledger-cat-icon ${r.type}">${r.type === 'income' ? '↓' : '↑'}</div>
            <div class="ledger-info"><strong>${esc(r.category)}</strong><span>${esc(r.note || (r.type === 'income' ? '收入' : '支出'))}</span></div>
            <div class="ledger-amount ${r.type}">${r.type === 'income' ? '+' : '-'}${fmtMoney(r.amount)}</div>
            <button class="del-btn" data-del-record="${r.id}">×</button>
          </div>`;
      }).join('');
    }
    main.innerHTML = html;

    $('#prevMonth').addEventListener('click', () => { shiftMonth(-1); renderLedger(); });
    $('#nextMonth').addEventListener('click', () => { shiftMonth(1); renderLedger(); });
    $('#monthInput').addEventListener('change', e => {
      if (e.target.value) { ledgerFilterMonth = e.target.value; renderLedger(); }
    });
    $$('[data-del-record]').forEach(el => el.addEventListener('click', () => {
      if (confirm('删除这笔记录？')) {
        Store.deleteRecord(el.dataset.delRecord); renderLedger(); toast('已删除');
      }
    }));
  }

  function shiftMonth(delta) {
    const [y, m] = ledgerFilterMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    ledgerFilterMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function openLedgerModal() {
    openModal('记一笔', `
      <div class="type-switch">
        <button class="type-btn active" data-type="expense">支出</button>
        <button class="type-btn" data-type="income">收入</button>
      </div>
      <div class="form-field"><label>金额</label>
        <input type="number" id="recAmount" inputmode="decimal" step="0.01" min="0" placeholder="0.00"></div>
      <div class="form-field"><label>分类</label>
        <div id="catChips" class="cat-chips"></div></div>
      <div class="form-field"><label>备注</label>
        <input type="text" id="recNote" placeholder="可选，例如：午餐"></div>
      <div class="form-field"><label>日期</label>
        <input type="date" id="recDate" value="${Store.todayKey()}"></div>
      <div class="modal-actions"><button class="primary-btn" id="saveRecord">保存</button></div>`);
    let type = 'expense', category = EXPENSE_CATS[0];
    const renderCats = () => {
      const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;
      category = cats[0];
      $('#catChips').innerHTML = cats.map((c, i) =>
        `<button class="cat-chip ${i === 0 ? 'sel' : ''}" data-cat="${c}">${c}</button>`).join('');
      $$('.cat-chip').forEach(b => b.addEventListener('click', () => {
        category = b.dataset.cat;
        $$('.cat-chip').forEach(x => x.classList.remove('sel'));
        b.classList.add('sel');
      }));
    };
    renderCats();
    $$('.type-btn').forEach(b => b.addEventListener('click', () => {
      type = b.dataset.type;
      $$('.type-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderCats();
    }));
    $('#saveRecord').addEventListener('click', () => {
      const rec = Store.addRecord({
        type, amount: $('#recAmount').value, category,
        note: $('#recNote').value, date: $('#recDate').value
      });
      if (!rec) { toast('请输入有效金额'); return; }
      closeModal(); renderLedger(); toast('已记录');
    });
  }

  /* ---------- 习惯 ---------- */
  function renderHabits() {
    const today = Store.todayKey();
    const habits = Store.getHabits();
    let html = `<div class="add-inline">
      <input id="habitInput" type="text" placeholder="新习惯名称，如：读书 30 分钟" autocomplete="off">
      <input id="habitIcon" type="text" value="✦" maxlength="2" style="width:52px;text-align:center" title="图标">
    </div>`;
    if (!habits.length) {
      html += emptyHint('还没有习惯，添加一个开始打卡吧');
    } else {
      html += habits.map(h => {
        const streak = Store.habitStreak(h);
        const checked = !!h.records[today];
        const week = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const k = Store.dateKey(d);
          week.push(`<span class="week-dot ${h.records[k] ? 'on' : ''}" title="${k}">${['日','一','二','三','四','五','六'][d.getDay()]}</span>`);
        }
        return `<section class="card habit-card">
          <div class="habit-head">
            <span class="habit-icon">${esc(h.icon)}</span>
            <div class="habit-title"><strong>${esc(h.name)}</strong><span>连续 ${streak} 天</span></div>
            <button class="del-btn" data-del-habit="${h.id}">×</button>
          </div>
          <div class="habit-week">${week.join('')}</div>
          <button class="checkin-btn ${checked ? 'checked' : ''}" data-toggle-habit="${h.id}">
            ${checked ? '✓ 今日已打卡' : '今日打卡'}
          </button>
        </section>`;
      }).join('');
    }
    main.innerHTML = html;

    $('#habitInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const v = e.target.value.trim();
        if (v) { Store.addHabit(v, $('#habitIcon').value.trim() || '✦'); render(); toast('已添加习惯'); }
      }
    });
    $$('[data-toggle-habit]').forEach(el => el.addEventListener('click', () => {
      Store.toggleHabit(el.dataset.toggleHabit); render();
    }));
    $$('[data-del-habit]').forEach(el => el.addEventListener('click', () => {
      if (confirm('删除这个习惯及所有打卡记录？')) {
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
        <div class="form-field"><label>昵称</label>
          <input type="text" id="nicknameInput" value="${esc(s.nickname)}" placeholder="怎么称呼你？"></div>
      </section>
      <section class="card">
        <div class="card-head"><h3>外观</h3></div>
        <div class="theme-switch">
          <button class="theme-btn ${s.theme === 'light' ? 'active' : ''}" data-theme="light">☀ 浅色</button>
          <button class="theme-btn ${s.theme === 'dark' ? 'active' : ''}" data-theme="dark">☾ 深色</button>
        </div>
      </section>
      <section class="card">
        <div class="card-head"><h3>功能管理</h3><span class="hint-text">点击开启/关闭</span></div>
        <div class="module-list">
          ${Object.entries(MODULES).map(([k, m]) => `
            <div class="module-row">
              <span class="module-icon" style="background:${m.color}18;color:${m.color}">${m.icon}</span>
              <div class="module-info"><strong>${m.name}</strong><span>${moduleDesc(k)}</span></div>
              <button class="toggle ${Store.isModuleOn(k) ? 'on' : ''}" data-module="${k}" aria-label="切换"></button>
            </div>`).join('')}
        </div>
      </section>
      <section class="card">
        <div class="card-head"><h3>数据管理</h3></div>
        <p class="hint-text">数据仅保存在本机浏览器中。请定期导出备份，清除浏览器数据会导致丢失。</p>
        <div class="settings-btns">
          <button class="primary-btn" id="exportBtn">导出备份</button>
          <button class="ghost-btn" id="importBtn">导入备份</button>
        </div>
        <input type="file" id="importFile" accept=".json" hidden>
      </section>
      <section class="card">
        <div class="card-head"><h3>添加到桌面</h3></div>
        <p class="hint-text">安卓 Chrome 浏览器 → 右上角菜单 → 「添加到主屏幕」/「安装应用」，即可像 App 一样全屏使用。iOS Safari：分享 → 添加到主屏幕。</p>
      </section>
      <div class="version-text">我的工作台 v1.0 · 本地优先 · 仅限个人使用</div>`;
    main.innerHTML = html;

    $('#nicknameInput').addEventListener('change', e => {
      Store.setSetting('nickname', e.target.value.trim()); toast('已保存');
    });
    $$('.theme-btn').forEach(b => b.addEventListener('click', () => {
      Store.setSetting('theme', b.dataset.theme); render();
    }));
    $$('[data-module]').forEach(b => b.addEventListener('click', () => {
      const on = Store.toggleModule(b.dataset.module);
      renderNav(); render();
      toast(`${MODULES[b.dataset.module].name}已${on ? '开启' : '关闭'}`);
      if (currentPage === b.dataset.module && !on) go('today');
    }));
    $('#exportBtn').addEventListener('click', () => {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `工作台备份_${Store.todayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('备份已下载');
    });
    $('#importBtn').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          if (confirm('导入将覆盖当前所有数据，确定继续？')) {
            Store.importJSON(reader.result);
            renderNav(); render(); toast('导入成功');
          }
        } catch (err) { alert('导入失败：文件格式不正确'); }
      };
      reader.readAsText(f);
      e.target.value = '';
    });
  }

  function moduleDesc(k) {
    return {
      tasks: '待办清单与任务管理',
      diary: '按天记录心情与生活',
      ledger: '收支记账与统计图表',
      habits: '每日习惯打卡追踪'
    }[k] || '';
  }

  /* ---------- FAB ---------- */
  fab.addEventListener('click', () => {
    if (currentPage === 'ledger') openLedgerModal();
    else if (currentPage === 'habits') {
      $('#habitInput') && $('#habitInput').focus();
      toast('在上方输入习惯名称');
    } else if (currentPage === 'tasks') {
      $('#taskInput') && $('#taskInput').focus();
    }
  });

  function bindCommon() {
    // 预留：通用事件绑定
  }

  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  $('#modalClose').addEventListener('click', closeModal);

  /* ---------- 启动 ---------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  renderNav();
  render();
})();

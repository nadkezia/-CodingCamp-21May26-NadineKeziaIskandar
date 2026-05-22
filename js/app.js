/* ============================================================
   Life Dashboard — app.js
   Vanilla JS only. No frameworks, no build step.
   ============================================================ */

'use strict';

/* ============================================================
   1. DARK / LIGHT MODE
   ============================================================ */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');
const themeLabel  = document.getElementById('theme-label');

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeIcon.textContent  = dark ? '☀️' : '🌙';
  themeLabel.textContent = dark ? 'Light Mode' : 'Dark Mode';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark'));
});

// Restore saved preference on load (default: light)
applyTheme(localStorage.getItem('theme') === 'dark');


/* ============================================================
   2. GREETING + LIVE CLOCK
   ============================================================ */
const greetingEl = document.getElementById('greeting');
const datetimeEl = document.getElementById('datetime');

function updateClock() {
  const now  = new Date();
  const hour = now.getHours();

  let salutation;
  if      (hour <  12) salutation = 'Good morning';
  else if (hour <  17) salutation = 'Good afternoon';
  else if (hour <  21) salutation = 'Good evening';
  else                 salutation = 'Good night';

  greetingEl.textContent = salutation + '! 👋';

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  datetimeEl.textContent = `${dateStr}  ·  ${timeStr}`;
}

updateClock();
setInterval(updateClock, 1000);


/* ============================================================
   3. FOCUS TIMER  (25-minute Pomodoro)
   ============================================================ */
const TIMER_TOTAL  = 25 * 60; // seconds

const timerDisplay = document.getElementById('timer-display');
const btnStart     = document.getElementById('timer-start');
const btnStop      = document.getElementById('timer-stop');
const btnReset     = document.getElementById('timer-reset');

let timerSeconds  = TIMER_TOTAL;
let timerInterval = null;
let timerRunning  = false;

function pad(n) { return String(n).padStart(2, '0'); }

function renderTimer() {
  timerDisplay.textContent = `${pad(Math.floor(timerSeconds / 60))}:${pad(timerSeconds % 60)}`;
}

function startTimer() {
  if (timerRunning) return;
  timerRunning  = true;
  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      renderTimer();
      alert('⏰ Focus session complete! Time for a break.');
      return;
    }
    timerSeconds--;
    renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
}

function resetTimer() {
  stopTimer();
  timerSeconds = TIMER_TOTAL;
  renderTimer();
}

btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click',  stopTimer);
btnReset.addEventListener('click', resetTimer);

renderTimer();


/* ============================================================
   4. TO-DO LIST
   ============================================================ */
const todoForm  = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList  = document.getElementById('todo-list');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  todoList.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.style.cssText = 'color:var(--text-muted);font-size:.875rem;padding:.5rem 0;';
    empty.textContent   = 'No tasks yet — add one above!';
    todoList.appendChild(empty);
    return;
  }

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'todo-item';

    // ── Checkbox ──
    const checkbox    = document.createElement('input');
    checkbox.type     = 'checkbox';
    checkbox.checked  = task.done;
    checkbox.setAttribute('aria-label', 'Mark task done');
    checkbox.addEventListener('change', () => {
      tasks[index].done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    // ── Task label (click to edit) ──
    const span       = document.createElement('span');
    span.className   = 'todo-text' + (task.done ? ' done' : '');
    span.textContent = task.text;
    span.title       = 'Click to edit';
    span.addEventListener('click', () => beginEdit(index, li, span));

    // ── Action buttons ──
    const actions   = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn         = document.createElement('button');
    editBtn.className     = 'btn btn-secondary';
    editBtn.textContent   = '✏️';
    editBtn.title         = 'Edit';
    editBtn.addEventListener('click', () => beginEdit(index, li, span));

    const delBtn          = document.createElement('button');
    delBtn.className      = 'btn btn-danger';
    delBtn.textContent    = '🗑️';
    delBtn.title          = 'Delete';
    delBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);
    todoList.appendChild(li);
  });
}

function beginEdit(index, li, span) {
  if (li.querySelector('.todo-edit-input')) return; // already editing

  const input     = document.createElement('input');
  input.type      = 'text';
  input.className = 'todo-edit-input';
  input.value     = tasks[index].text;
  input.maxLength = 120;

  li.replaceChild(input, span);
  input.focus();
  input.select();

  function commit() {
    const val = input.value.trim();
    if (val) { tasks[index].text = val; saveTasks(); }
    renderTasks();
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  input.blur();
    if (e.key === 'Escape') renderTasks(); // cancel
  });
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  tasks.push({ text, done: false });
  saveTasks();
  renderTasks();
  todoInput.value = '';
  todoInput.focus();
});

renderTasks();


/* ============================================================
   5. QUICK LINKS
   ============================================================ */
const linkForm  = document.getElementById('link-form');
const linkName  = document.getElementById('link-name');
const linkUrl   = document.getElementById('link-url');
const linksGrid = document.getElementById('links-grid');

// Seed defaults on first visit
let links = JSON.parse(localStorage.getItem('quickLinks') || 'null');
if (!links) {
  links = [
    { label: 'Google',  url: 'https://google.com'  },
    { label: 'YouTube', url: 'https://youtube.com' },
    { label: 'GitHub',  url: 'https://github.com'  },
  ];
  localStorage.setItem('quickLinks', JSON.stringify(links));
}

function saveLinks() {
  localStorage.setItem('quickLinks', JSON.stringify(links));
}

function renderLinks() {
  linksGrid.innerHTML = '';

  if (links.length === 0) {
    const empty       = document.createElement('p');
    empty.style.cssText = 'color:var(--text-muted);font-size:.875rem;';
    empty.textContent   = 'No links yet — add one above!';
    linksGrid.appendChild(empty);
    return;
  }

  links.forEach((link, index) => {
    const anchor   = document.createElement('a');
    anchor.className = 'link-btn';
    anchor.href      = link.url;
    anchor.target    = '_blank';
    anchor.rel       = 'noopener noreferrer';

    const label       = document.createElement('span');
    label.textContent = link.label;

    const removeBtn         = document.createElement('button');
    removeBtn.className     = 'link-remove';
    removeBtn.textContent   = '✕';
    removeBtn.title         = 'Remove';
    removeBtn.setAttribute('aria-label', `Remove ${link.label}`);
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      links.splice(index, 1);
      saveLinks();
      renderLinks();
    });

    anchor.appendChild(label);
    anchor.appendChild(removeBtn);
    linksGrid.appendChild(anchor);
  });
}

linkForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const label = linkName.value.trim();
  let   url   = linkUrl.value.trim();
  if (!label || !url) return;

  // Auto-add https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ label, url });
  saveLinks();
  renderLinks();
  linkName.value = '';
  linkUrl.value  = '';
  linkName.focus();
});

renderLinks();

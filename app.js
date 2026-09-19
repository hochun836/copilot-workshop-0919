// 待辦清單的資料會保存在瀏覽器的 localStorage。
const STORAGE_KEY = 'offline-todos';
const THEME_STORAGE_KEY = 'offline-theme';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');
const filterButtons = document.querySelectorAll('.filter-button');
const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

let todos = loadTodos();
let currentFilter = 'all';

// 從 localStorage 讀取資料,格式不正確時使用空清單。
function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (!savedTodos) return [];

    const parsedTodos = JSON.parse(savedTodos);
    if (!Array.isArray(parsedTodos)) return [];

    return parsedTodos
      .filter((todo) => todo && typeof todo.id === 'string' && typeof todo.text === 'string')
      .map((todo) => ({
        id: todo.id,
        text: todo.text,
        completed: Boolean(todo.completed),
      }));
  } catch (error) {
    console.warn('讀取待辦事項失敗,將以空清單開始。', error);
    return [];
  }
}

// 把最新的待辦清單寫回 localStorage。
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.warn('儲存待辦事項失敗。', error);
  }
}

// 取得使用者儲存過的主題,沒有有效設定時回傳 null。
function loadSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
  } catch (error) {
    console.warn('讀取主題設定失敗。', error);
    return null;
  }
}

// 把使用者選擇的主題寫入 localStorage。
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('儲存主題設定失敗。', error);
  }
}

// 套用主題,同時更新切換按鈕的圖示、文字與無障礙狀態。
function applyTheme(theme) {
  const isDark = theme === 'dark';

  document.documentElement.dataset.theme = theme;
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeLabel.textContent = isDark ? '淺色模式' : '深色模式';
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

// 有儲存設定就優先使用,否則跟隨作業系統的主題。
function initTheme() {
  const savedTheme = loadSavedTheme();
  const initialTheme = savedTheme || (systemThemeQuery.matches ? 'dark' : 'light');

  applyTheme(initialTheme);

  systemThemeQuery.addEventListener('change', (event) => {
    if (!loadSavedTheme()) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });
}

// 產生每筆待辦事項專用的識別碼。
function createTodoId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// 依照目前篩選條件取得要顯示的待辦事項。
function getVisibleTodos() {
  if (currentFilter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

// 依照整體資料與目前篩選條件決定空清單提示文字。
function getEmptyMessage() {
  if (todos.length === 0) {
    return '還沒有任何待辦事項,新增一個吧!';
  }

  if (currentFilter === 'active') {
    return '目前沒有符合篩選條件的未完成事項,項目並未被刪除。';
  }

  return '目前沒有符合篩選條件的已完成事項,項目並未被刪除。';
}

// 依照目前資料重新繪製清單與未完成數量。
function render() {
  const visibleTodos = getVisibleTodos();

  list.replaceChildren();

  visibleTodos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item completed' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'todo-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」${todo.completed ? '為未完成' : '為完成'}`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.title = '刪除';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);
    deleteButton.textContent = '×';

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyState.hidden = visibleTodos.length > 0;
  emptyState.textContent = getEmptyMessage();
  remainingCount.textContent = `未完成:${todos.filter((todo) => !todo.completed).length} 項`;
}

// 新增待辦事項,空白內容不會被加入清單。
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  todos.push({
    id: createTodoId(),
    text,
    completed: false,
  });

  saveTodos();
  render();
  form.reset();
  input.focus();
});

// 使用事件委派處理清單中的勾選。
list.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains('todo-checkbox')) return;

  const item = target.closest('.todo-item');
  if (!item) return;

  todos = todos.map((todo) =>
    todo.id === item.dataset.id ? { ...todo, completed: target.checked } : todo
  );

  saveTodos();
  render();
});

// 使用事件委派處理刪除按鈕。
list.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element) || !target.classList.contains('delete-button')) return;

  const item = target.closest('.todo-item');
  if (!item) return;

  todos = todos.filter((todo) => todo.id !== item.dataset.id);
  saveTodos();
  render();
});

// 切換淺色與深色模式,並記住使用者的選擇。
themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

  applyTheme(nextTheme);
  saveTheme(nextTheme);
});

// 切換清單篩選條件並更新按鈕狀態。
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('is-active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });

    render();
  });
});

initTheme();
render();

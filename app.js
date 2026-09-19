// 待辦清單的資料會保存在瀏覽器的 localStorage。
const STORAGE_KEY = 'offline-todos';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');

let todos = loadTodos();

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

// 產生每筆待辦事項專用的識別碼。
function createTodoId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// 依照目前資料重新繪製清單與未完成數量。
function render() {
  list.replaceChildren();

  todos.forEach((todo) => {
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

  emptyState.hidden = todos.length > 0;
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

render();

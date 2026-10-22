// DOM Element Targets
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercent = document.getElementById('progress-percent');

// Application Core State Tracker
let todos = JSON.parse(localStorage.getItem('advanced_todos')) || [];
let currentFilter = 'all';

// Form Submissions Lifecycle
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    todos.push({
        id: Date.now(),
        text: text,
        completed: false
    });

    todoInput.value = '';
    saveAndRender();
});

// Setup Click Events for Filter Tabs
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTodos();
    });
});

// Clear Completed Pipeline
clearAllBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveAndRender();
});

// Main Interactive Pipeline Functions
function toggleTodo(id) {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveAndRender();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveAndRender();
}

// Inline Text Editor Engine
function startEditing(todo, textSpan, itemDiv) {
    const originalText = todo.text;

    // Convert Span component into an input field on double-click
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = originalText;

    // Swap the elements out
    textSpan.replaceWith(editInput);
    editInput.focus();

    // Inside-closure handler helper function
    const finishEditing = () => {
        const newText = editInput.value.trim();
        if (newText && newText !== originalText) {
            todo.text = newText;
            saveAndRender();
        } else {
            // Revert back safely if text field was empty or unchanged
            editInput.replaceWith(textSpan);
        }
    };

    // Confirm changes on Enter, Cancel changes on Escape
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finishEditing();
        if (e.key === 'Escape') editInput.replaceWith(textSpan);
    });

    // Save automatically if the user clicks away
    editInput.addEventListener('blur', finishEditing);
}

// Dynamic Progress UI Math Refresher 
function updateProgressBar() {
    if (todos.length === 0) {
        progressBarFill.style.width = '0%';
        progressPercent.textContent = '0%';
        return;
    }
    const completedCount = todos.filter(t => t.completed).length;
    const percentage = Math.round((completedCount / todos.length) * 100);

    progressBarFill.style.width = `${percentage}%`;
    progressPercent.textContent = `${percentage}%`;
}

// Global State Synchronizer
function saveAndRender() {
    localStorage.setItem('advanced_todos', JSON.stringify(todos));
    renderTodos();
}

// Core Interface Matrix Renderer
function renderTodos() {
    todoList.innerHTML = '';
    updateProgressBar();

    // Filter logic pipeline checks
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li style="color: #64748b; text-align: center; padding: 20px; font-size: 0.9rem;">No tasks found here!</li>`;
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const leftDiv = document.createElement('div');
        leftDiv.className = 'todo-left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;
        textSpan.title = "Double-click text to edit";

        // Listen to double clicks to change element state modes
        textSpan.addEventListener('dblclick', () => {
            if (!todo.completed) startEditing(todo, textSpan, li);
        });

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(textSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(leftDiv);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
}

// Fire initial build render execution on script load
renderTodos();

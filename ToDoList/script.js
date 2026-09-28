class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        const addBtn = document.getElementById('add-btn');
        const todoInput = document.getElementById('todo-input');
        const clearCompleted = document.getElementById('clear-completed');
        const clearAll = document.getElementById('clear-all');
        const filterBtns = document.querySelectorAll('.filter-btn');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        clearCompleted.addEventListener('click', () => this.clearCompleted());
        clearAll.addEventListener('click', () => this.clearAll());

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
                this.updateFilterButtons(e.target);
            });
        });
    }

    addTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        
        if (!text) {
            this.shakeElement(input);
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStats();
        
        input.value = '';
        input.focus();
        
        this.showSuccessAnimation();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const todoItem = document.querySelector(`[data-id="${id}"]`);
        const textElement = todoItem.querySelector('.todo-text');
        const currentText = todo.text;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        input.style.cssText = `
            flex: 1;
            padding: 8px 12px;
            border: 2px solid #667eea;
            border-radius: 8px;
            font-size: 1rem;
            outline: none;
            background: white;
        `;

        textElement.replaceWith(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                todo.text = newText;
                this.saveTodos();
                this.render();
            } else {
                this.render();
            }
        };

        const cancelEdit = () => {
            this.render();
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
        });

        input.addEventListener('blur', saveEdit);
    }

    deleteTodo(id) {
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        todoItem.style.animation = 'slideOut 0.3s ease-out';
        
        setTimeout(() => {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
            this.updateStats();
        }, 300);
    }

    clearCompleted() {
        const completedTodos = this.todos.filter(t => t.completed);
        if (completedTodos.length === 0) {
            this.shakeElement(document.getElementById('clear-completed'));
            return;
        }

        completedTodos.forEach(todo => {
            const todoItem = document.querySelector(`[data-id="${todo.id}"]`);
            if (todoItem) {
                todoItem.style.animation = 'slideOut 0.3s ease-out';
            }
        });

        setTimeout(() => {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
        }, 300);
    }

    clearAll() {
        if (this.todos.length === 0) {
            this.shakeElement(document.getElementById('clear-all'));
            return;
        }

        if (confirm('确定要清除所有任务吗？此操作不可撤销。')) {
            const todoItems = document.querySelectorAll('.todo-item');
            todoItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'slideOut 0.3s ease-out';
                }, index * 50);
            });

            setTimeout(() => {
                this.todos = [];
                this.saveTodos();
                this.render();
                this.updateStats();
            }, todoItems.length * 50 + 300);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    updateFilterButtons(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        todoList.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="app.toggleTodo(${todo.id})"></div>
                <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                <div class="todo-actions">
                    <button class="todo-btn edit-btn" onclick="app.editTodo(${todo.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="todo-btn delete-btn" onclick="app.deleteTodo(${todo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const totalCount = document.getElementById('total-count');
        const completedCount = document.getElementById('completed-count');
        const clearCompletedBtn = document.getElementById('clear-completed');
        const clearAllBtn = document.getElementById('clear-all');

        totalCount.textContent = this.todos.length;
        completedCount.textContent = this.todos.filter(t => t.completed).length;

        clearCompletedBtn.disabled = this.todos.filter(t => t.completed).length === 0;
        clearAllBtn.disabled = this.todos.length === 0;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    shakeElement(element) {
        element.style.animation = 'shake 0.5s';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    showSuccessAnimation() {
        const addBtn = document.getElementById('add-btn');
        addBtn.style.animation = 'success 0.5s';
        setTimeout(() => {
            addBtn.style.animation = '';
        }, 500);
    }
}

// 添加额外的CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes slideOut {
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
    
    @keyframes success {
        0% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.2) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
    }
    
    .edit-input {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

// 初始化应用
const app = new TodoApp();
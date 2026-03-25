// Life Tracker App - Main JavaScript File
// Data Storage using localStorage

const StorageKeys = {
    TODOS: 'lifeTracker_todos',
    GOALS: 'lifeTracker_goals',
    DIARIES: 'lifeTracker_diaries'
};

// ==================== Utility Functions ====================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

// ==================== Todo Functions ====================

function getTodos() {
    const data = localStorage.getItem(StorageKeys.TODOS);
    return data ? JSON.parse(data) : [];
}

function saveTodos(todos) {
    localStorage.setItem(StorageKeys.TODOS, JSON.stringify(todos));
}

function addTodo(text) {
    const todos = getTodos();
    const todo = {
        id: generateId(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    todos.push(todo);
    saveTodos(todos);
    return todo;
}

function updateTodo(id, updates) {
    const todos = getTodos();
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
        todos[index] = { ...todos[index], ...updates };
        saveTodos(todos);
        return todos[index];
    }
    return null;
}

function deleteTodo(id) {
    const todos = getTodos();
    const filtered = todos.filter(t => t.id !== id);
    saveTodos(filtered);
}

function toggleTodo(id) {
    const todo = getTodos().find(t => t.id === id);
    if (todo) {
        return updateTodo(id, { completed: !todo.completed });
    }
    return null;
}

function getTodoStats() {
    const todos = getTodos();
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
}

// ==================== Goal Functions ====================

function getGoals() {
    const data = localStorage.getItem(StorageKeys.GOALS);
    return data ? JSON.parse(data) : [];
}

function saveGoals(goals) {
    localStorage.setItem(StorageKeys.GOALS, JSON.stringify(goals));
}

function addGoal(title, description, targetDate) {
    const goals = getGoals();
    const goal = {
        id: generateId(),
        title: title,
        description: description,
        targetDate: targetDate,
        progress: 0,
        createdAt: new Date().toISOString()
    };
    goals.push(goal);
    saveGoals(goals);
    return goal;
}

function updateGoal(id, updates) {
    const goals = getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
        goals[index] = { ...goals[index], ...updates };
        saveGoals(goals);
        return goals[index];
    }
    return null;
}

function deleteGoal(id) {
    const goals = getGoals();
    const filtered = goals.filter(g => g.id !== id);
    saveGoals(filtered);
}

function updateGoalProgress(id, progress) {
    return updateGoal(id, { progress: Math.max(0, Math.min(100, progress)) });
}

function getGoalStats() {
    const goals = getGoals();
    const total = goals.length;
    const completed = goals.filter(g => g.progress === 100).length;
    const inProgress = total - completed;
    const avgProgress = total > 0 
        ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / total)
        : 0;
    return { total, completed, inProgress, avgProgress };
}

// ==================== Diary Functions ====================

const MOODS = {
    happy: { emoji: '😊', label: '开心' },
    excited: { emoji: '🤩', label: '兴奋' },
    calm: { emoji: '😌', label: '平静' },
    tired: { emoji: '😴', label: '疲惫' },
    sad: { emoji: '😢', label: '难过' },
    angry: { emoji: '😠', label: '生气' },
    anxious: { emoji: '😰', label: '焦虑' },
    grateful: { emoji: '🙏', label: '感恩' }
};

function getDiaries() {
    const data = localStorage.getItem(StorageKeys.DIARIES);
    return data ? JSON.parse(data) : [];
}

function saveDiaries(diaries) {
    localStorage.setItem(StorageKeys.DIARIES, JSON.stringify(diaries));
}

function addDiary(content, mood) {
    const diaries = getDiaries();
    const diary = {
        id: generateId(),
        content: content,
        mood: mood,
        createdAt: new Date().toISOString()
    };
    diaries.unshift(diary);
    saveDiaries(diaries);
    return diary;
}

function updateDiary(id, updates) {
    const diaries = getDiaries();
    const index = diaries.findIndex(d => d.id === id);
    if (index !== -1) {
        diaries[index] = { ...diaries[index], ...updates };
        saveDiaries(diaries);
        return diaries[index];
    }
    return null;
}

function deleteDiary(id) {
    const diaries = getDiaries();
    const filtered = diaries.filter(d => d.id !== id);
    saveDiaries(filtered);
}

function getDiaryStats() {
    const diaries = getDiaries();
    const total = diaries.length;
    const thisMonth = diaries.filter(d => {
        const diaryDate = new Date(d.createdAt);
        const now = new Date();
        return diaryDate.getMonth() === now.getMonth() && 
               diaryDate.getFullYear() === now.getFullYear();
    }).length;
    
    // Calculate mood distribution
    const moodCounts = {};
    diaries.forEach(d => {
        moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1;
    });
    
    let dominantMood = null;
    let maxCount = 0;
    for (const [mood, count] of Object.entries(moodCounts)) {
        if (count > maxCount) {
            maxCount = count;
            dominantMood = mood;
        }
    }
    
    return { 
        total, 
        thisMonth, 
        dominantMood: dominantMood ? MOODS[dominantMood] : null 
    };
}

// ==================== UI Helper Functions ====================

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function confirmDialog(message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3 class="modal-title">确认操作</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p style="margin-bottom: 25px; color: var(--text-secondary);">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                <button class="btn btn-danger" id="confirmBtn">确认删除</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#confirmBtn').addEventListener('click', () => {
        onConfirm();
        modal.remove();
    });
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ==================== Initialize ====================

document.addEventListener('DOMContentLoaded', function() {
    // Set active nav item based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

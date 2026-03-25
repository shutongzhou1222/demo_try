// Life Tracker App - Main JavaScript File
// Data Storage using localStorage

const StorageKeys = {
    TODOS: 'lifeTracker_todos',
    GOALS: 'lifeTracker_goals',
    DIARIES: 'lifeTracker_diaries',
    SCHEDULES: 'lifeTracker_schedules',
    EXERCISES: 'lifeTracker_exercises',
    READINGS: 'lifeTracker_readings',
    PERIODS: 'lifeTracker_periods',
    TRAVELS: 'lifeTracker_travels'
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

// ==================== Schedule (日程) Functions ====================

function getSchedules() {
    const data = localStorage.getItem(StorageKeys.SCHEDULES);
    return data ? JSON.parse(data) : [];
}

function saveSchedules(schedules) {
    localStorage.setItem(StorageKeys.SCHEDULES, JSON.stringify(schedules));
}

function addSchedule(date, time, title, location) {
    const schedules = getSchedules();
    const schedule = {
        id: generateId(),
        date: date,
        time: time,
        title: title,
        location: location || '',
        createdAt: new Date().toISOString()
    };
    schedules.push(schedule);
    saveSchedules(schedules);
    return schedule;
}

function updateSchedule(id, updates) {
    const schedules = getSchedules();
    const index = schedules.findIndex(s => s.id === id);
    if (index !== -1) {
        schedules[index] = { ...schedules[index], ...updates };
        saveSchedules(schedules);
        return schedules[index];
    }
    return null;
}

function deleteSchedule(id) {
    const schedules = getSchedules();
    const filtered = schedules.filter(s => s.id !== id);
    saveSchedules(filtered);
}

function getSchedulesByDate(date) {
    return getSchedules().filter(s => s.date === date).sort((a, b) => a.time.localeCompare(b.time));
}

// ==================== Exercise (运动) Functions ====================

const EXERCISE_TYPES = ['跑步', '瑜伽', '游泳', '健身', '骑行', '跳绳', '散步', '其他'];

function getExercises() {
    const data = localStorage.getItem(StorageKeys.EXERCISES);
    return data ? JSON.parse(data) : [];
}

function saveExercises(exercises) {
    localStorage.setItem(StorageKeys.EXERCISES, JSON.stringify(exercises));
}

function addExercise(type, duration, date) {
    const exercises = getExercises();
    const exercise = {
        id: generateId(),
        type: type,
        duration: duration,
        date: date || getToday(),
        createdAt: new Date().toISOString()
    };
    exercises.unshift(exercise);
    saveExercises(exercises);
    return exercise;
}

function deleteExercise(id) {
    const exercises = getExercises();
    const filtered = exercises.filter(e => e.id !== id);
    saveExercises(filtered);
}

function getExerciseStats(period) {
    const exercises = getExercises();
    const now = new Date();
    let startDate;
    
    if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
    }
    
    const filtered = exercises.filter(e => {
        const exerciseDate = new Date(e.date);
        return exerciseDate >= startDate;
    });
    
    const count = filtered.length;
    const totalMinutes = filtered.reduce((sum, e) => sum + (parseInt(e.duration) || 0), 0);
    
    const byType = {};
    filtered.forEach(e => {
        byType[e.type] = (byType[e.type] || 0) + 1;
    });
    
    return { count, totalMinutes, byType };
}

// ==================== Reading (读书) Functions ====================

function getReadings() {
    const data = localStorage.getItem(StorageKeys.READINGS);
    return data ? JSON.parse(data) : [];
}

function saveReadings(readings) {
    localStorage.setItem(StorageKeys.READINGS, JSON.stringify(readings));
}

function addReading(bookName, duration, thoughts, date) {
    const readings = getReadings();
    const reading = {
        id: generateId(),
        bookName: bookName,
        duration: duration,
        thoughts: thoughts || '',
        date: date || getToday(),
        createdAt: new Date().toISOString()
    };
    readings.unshift(reading);
    saveReadings(readings);
    return reading;
}

function deleteReading(id) {
    const readings = getReadings();
    const filtered = readings.filter(r => r.id !== id);
    saveReadings(filtered);
}

function getReadingStats() {
    const readings = getReadings();
    const total = readings.length;
    const totalMinutes = readings.reduce((sum, r) => sum + (parseInt(r.duration) || 0), 0);
    return { total, totalMinutes };
}

// ==================== Period (生理期) Functions ====================

function getPeriods() {
    const data = localStorage.getItem(StorageKeys.PERIODS);
    return data ? JSON.parse(data) : [];
}

function savePeriods(periods) {
    localStorage.setItem(StorageKeys.PERIODS, JSON.stringify(periods));
}

function addPeriod(startDate, endDate, notes) {
    const periods = getPeriods();
    const period = {
        id: generateId(),
        startDate: startDate,
        endDate: endDate || '',
        notes: notes || '',
        createdAt: new Date().toISOString()
    };
    periods.unshift(period);
    savePeriods(periods);
    return period;
}

function deletePeriod(id) {
    const periods = getPeriods();
    const filtered = periods.filter(p => p.id !== id);
    savePeriods(filtered);
}

function getNextPeriodEstimate() {
    const periods = getPeriods().filter(p => p.startDate).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    if (periods.length < 2) return null;
    
    const lastPeriod = new Date(periods[0].startDate);
    const prevPeriod = new Date(periods[1].startDate);
    const avgCycle = Math.round((lastPeriod - prevPeriod) / (1000 * 60 * 60 * 24));
    
    const nextDate = new Date(lastPeriod);
    nextDate.setDate(nextDate.getDate() + avgCycle);
    
    return {
        nextDate: nextDate.toISOString().split('T')[0],
        avgCycle: avgCycle
    };
}

// ==================== Travel (出行) Functions ====================

function getTravels() {
    const data = localStorage.getItem(StorageKeys.TRAVELS);
    return data ? JSON.parse(data) : [];
}

function saveTravels(travels) {
    localStorage.setItem(StorageKeys.TRAVELS, JSON.stringify(travels));
}

function addTravel(title, destination, startDate, endDate, notes) {
    const travels = getTravels();
    const travel = {
        id: generateId(),
        title: title,
        destination: destination || '',
        startDate: startDate,
        endDate: endDate || '',
        notes: notes || '',
        completed: false,
        createdAt: new Date().toISOString()
    };
    travels.push(travel);
    saveTravels(travels);
    return travel;
}

function updateTravel(id, updates) {
    const travels = getTravels();
    const index = travels.findIndex(t => t.id === id);
    if (index !== -1) {
        travels[index] = { ...travels[index], ...updates };
        saveTravels(travels);
        return travels[index];
    }
    return null;
}

function deleteTravel(id) {
    const travels = getTravels();
    const filtered = travels.filter(t => t.id !== id);
    saveTravels(filtered);
}

function getUpcomingTravels() {
    const today = getToday();
    return getTravels()
        .filter(t => t.startDate >= today && !t.completed)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

// ==================== Get Greeting Message ====================

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了，早点休息哦~';
    if (hour < 9) return '早上好！新的一天开始了☀️';
    if (hour < 12) return '上午好！今天也要加油哦~';
    if (hour < 14) return '中午好！记得吃午饭哦~';
    if (hour < 18) return '下午好！继续保持好状态~';
    if (hour < 22) return '晚上好！今天辛苦了~';
    return '夜深了，早点休息哦~';
}

function getDayOfWeek() {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[new Date().getDay()];
}

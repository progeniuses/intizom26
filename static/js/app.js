
// Data Store
// Backend API ishlatiladi (localStorage bilan)
const USE_BACKEND_API = false;
let currentUserId = parseInt(localStorage.getItem('currentUserId') || '1');
const users = {
    1: { id: 1, name: 'Bekzod', avatar: '👨' },
    2: { id: 2, name: 'Shodiya', avatar: '👩' }
};

let dashboardData = {
    pageIcon: '🌿',
    pageTitle: 'Personal Life Dashboard',
    pageDescription: 'Kundalik hayotingizni tartibga soling va maqsadlaringizga erishing',
    coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&h=400&fit=crop',
    widgets: []
};
let activeFilter = 'dashboard';

// Default Widgets
const defaultWidgets = [
    {
        id: 'w1',
        type: 'clock',
        title: 'Vaqt',
        icon: '🕐'
    },
    {
        id: 'w2',
        type: 'todo',
        title: 'Kunlik Vazifalar',
        icon: '✅',
        data: {
            items: [
                { id: 't1', text: 'Ertalabki mashq', completed: true, time: '06:30', createdAt: '2025-01-01', completedAt: '2025-01-01' },
                { id: 't2', text: 'Nonushta tayyorlash', completed: true, time: '07:00', createdAt: '2025-01-01', completedAt: '2025-01-01' },
                { id: 't3', text: 'Kitob o\'qish (30 daqiqa)', completed: true, time: '08:00', createdAt: '2025-01-01', completedAt: '2025-01-02' },
                { id: 't4', text: 'Do\'stlar bilan uchrashish', completed: false, time: '14:00', createdAt: '2025-01-02', completedAt: null },
                { id: 't5', text: 'Oila bilan kechki ovqat', completed: false, time: '19:00', createdAt: '2025-01-02', completedAt: null }
            ]
        }
    },
    {
        id: 'w3',
        type: 'goals',
        title: 'Maqsadlarim',
        icon: '🎯',
        data: {
            items: [
                { id: 'g1', icon: '📖', name: '12 ta kitob o\'qish', progress: 58 },
                { id: 'g2', icon: '🏃', name: 'Marafon yugurish', progress: 30 },
                { id: 'g3', icon: '🌍', name: '3 ta yangi mamlakat', progress: 33 }
            ]
        }
    },
    {
        id: 'w4',
        type: 'habits',
        title: 'Odatlar',
        icon: '💪',
        data: {
            items: [
                { id: 'h1', emoji: '💧', name: 'Suv ichish', days: [true, true, true, true, true, false, false] },
                { id: 'h2', emoji: '🧘', name: 'Meditatsiya', days: [true, true, false, true, true, false, false] },
                { id: 'h3', emoji: '📝', name: 'Kundalik yozish', days: [true, true, true, true, true, false, false] }
            ]
        }
    },
    {
        id: 'w5',
        type: 'quote',
        title: 'Ilhom',
        icon: '💭',
        large: true,
        data: {
            text: 'Kelajakni bashorat qilishning eng yaxshi yo\'li - uni o\'zingiz yaratishdir.',
            author: 'Abraham Lincoln'
        }
    },
    {
        id: 'w6',
        type: 'notes',
        title: 'Eslatmalar',
        icon: '📝',
        data: {
            content: '• Ota-onaga qo\'ng\'iroq qilish\n• Vitaminlarni sotib olish\n• Do\'stning tug\'ilgan kuni - 15-yanvar'
        }
    }
];

// Emojis
const emojis = ['🌿', '🎯', '💪', '📚', '🎨', '🎵', '🏃', '🧘', '💡', '🚀', '⭐', '🌟', '💎', '🔥', '❤️', '💜', '💙', '💚', '🧡', '💛', '🌈', '☀️', '🌙', '⚡', '🎮', '📱', '💻', '🎬', '📷', '✈️', '🏠', '🌺', '🌸', '🍀', '🌴', '🌊', '⛰️', '🎪', '🎭', '🎨'];

// Initialize
async function init() {
    await loadData();
    setupNavFilters();
    renderDashboard();
    startClock();
    setupEventListeners();
    setupDailyStatsSaver();
}

// Load Data
async function loadData() {
    const key = `lifeos_dashboard_${currentUserId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        dashboardData = JSON.parse(saved);
    } else {
        dashboardData.widgets = [...defaultWidgets];
    }
    updateUserUI();
}

// Save Data
async function saveData() {
    const key = `lifeos_dashboard_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(dashboardData));
    
    // Also save to backend if API enabled
    try {
        await fetch('/api/dashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dashboardData)
        });
    } catch (err) {
        // Ignore if backend not available
    }
    
    showToast('Saqlandi!');
}

// User Management
function updateUserUI() {
    const user = users[currentUserId];
    if (user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userAvatar').textContent = user.avatar;
        
        // Update checkmarks
        document.getElementById('check1').style.opacity = currentUserId === 1 ? '1' : '0';
        document.getElementById('check2').style.opacity = currentUserId === 2 ? '1' : '0';
        
        document.querySelectorAll('.user-menu-item').forEach((item, idx) => {
            item.classList.toggle('active', (idx + 1) === currentUserId);
        });
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('active');
}

function switchUser(userId) {
    if (currentUserId === userId) {
        toggleUserMenu();
        return;
    }
    
    // Save current user data
    saveData();
    
    // Switch user
    currentUserId = userId;
    localStorage.setItem('currentUserId', currentUserId.toString());
    
    // Update session in backend
    fetch('/api/user/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
    }).catch(() => {});
    
    // Load new user data
    loadData();
    renderDashboard();
    
    toggleUserMenu();
    showToast(`${users[userId].name} profili ochildi`);
}

// Close user menu when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-switcher')) {
        document.getElementById('userMenu').classList.remove('active');
    }
});

// Render Dashboard
function renderDashboard() {
    // Page header
    document.getElementById('pageIcon').textContent = dashboardData.pageIcon;
    document.getElementById('pageTitle').textContent = dashboardData.pageTitle;
    document.getElementById('pageDescription').textContent = dashboardData.pageDescription;
    document.getElementById('coverImage').src = dashboardData.coverImage;

    // Widgets
    const grid = document.getElementById('widgetGrid');
    grid.innerHTML = '';
    let visibleCount = 0;

    dashboardData.widgets.forEach((widget, index) => {
        const el = createWidgetElement(widget, index);
        if (activeFilter !== 'dashboard' && widget.type !== activeFilter) {
            el.classList.add('hidden-filter');
        } else {
            visibleCount++;
        }
        grid.appendChild(el);
    });

    if (activeFilter !== 'dashboard' && visibleCount === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'Bu bo\'lim uchun widget yo\'q. + tugmasi bilan qo\'shing.';
        grid.appendChild(empty);
    }

    // Add widget card
    const addCard = document.createElement('div');
    addCard.className = 'add-widget-card';
    addCard.onclick = openWidgetModal;
    addCard.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Widget qo'shish</span>
    `;
    grid.appendChild(addCard);

    requestAnimationFrame(() => {
        renderCharts();
        refreshWeatherWidgets();
    });
}

// Create Widget Element
function createWidgetElement(widget, index) {
    const div = document.createElement('div');
    div.className = `widget ${widget.large ? 'large' : ''} ${widget.extraLarge ? 'extra-large' : ''} ${widget.fullWidth ? 'full-width' : ''}`;
    div.draggable = true;
    div.dataset.index = index;

    div.innerHTML = `
        <div class="widget-header">
            <div class="widget-title">
                <span class="widget-title-icon" onclick="openEmojiPicker(event, this, 'widget', ${index})">${widget.icon}</span>
                <input type="text" value="${widget.title}" onchange="updateWidgetTitle(${index}, this.value)">
            </div>
            <div class="widget-actions">
                <button class="widget-action-btn" onclick="cycleWidgetSize(${index})" title="O'lcham: Normal → Katta → Extra → To'liq">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                    </svg>
                </button>
                <button class="widget-action-btn danger" onclick="deleteWidget(${index})" title="O'chirish">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="widget-body">
            ${getWidgetContent(widget, index)}
        </div>
        <div class="widget-resize-handle"></div>
    `;

    // Drag events
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);

    return div;
}

// Get Widget Content
function getWidgetContent(widget, index) {
    switch(widget.type) {
        case 'clock':
            return `
                <div class="clock-display">
                    <div>
                        <div class="clock-box" id="hours-${index}">00</div>
                        <div class="clock-label">Soat</div>
                    </div>
                    <div>
                        <div class="clock-box" id="minutes-${index}">00</div>
                        <div class="clock-label">Daqiqa</div>
                    </div>
                </div>
                <div class="date-display" id="date-${index}"></div>
            `;

        case 'todo':
            const todoItems = widget.data?.items || [];
            return `
                <div class="todo-input-wrapper">
                    <input type="text" class="todo-input" placeholder="Yangi vazifa..." onkeypress="if(event.key==='Enter')addTodoItem(${index}, this)">
                    <button class="todo-add-btn" onclick="addTodoItem(${index}, this.previousElementSibling)">+</button>
                </div>
                <div class="todo-list" id="todoList-${index}">
                    ${todoItems.map((item, i) => `
                        <div class="todo-item ${item.completed ? 'completed' : ''}" onclick="toggleTodo(${index}, ${i})">
                            <div class="todo-checkbox"></div>
                            <div class="todo-text">
                                <div class="editable-field ${item.completed ? 'completed-text' : ''}" onclick="event.stopPropagation(); startEdit(this, 'todo-text', ${index}, ${i})">
                                    <span class="edit-icon">✏️</span>
                                    <input type="text" class="editable-input ${item.completed ? 'completed-input' : ''}" value="${item.text}" 
                                        onblur="finishEdit(this, 'todo-text', ${index}, ${i})"
                                        onkeypress="if(event.key==='Enter') finishEdit(this, 'todo-text', ${index}, ${i})">
                                </div>
                            </div>
                            <div class="todo-time">
                                <input type="time" value="${item.time || ''}" onclick="event.stopPropagation()" onchange="updateTodoTime(${index}, ${i}, this.value)">
                            </div>
                            <button class="todo-delete" onclick="event.stopPropagation(); deleteTodo(${index}, ${i})">✕</button>
                        </div>
                    `).join('')}
                </div>
            `;

        case 'notes':
            return `
                <div class="editable-field" onclick="startEdit(this, 'notes', ${index})">
                    <span class="edit-icon">✏️</span>
                    <textarea class="editable-textarea" placeholder="Eslatmalaringizni yozing..." 
                        onblur="finishEdit(this, 'notes', ${index})"
                        onkeydown="if(event.key==='Escape') finishEdit(this, 'notes', ${index})">${widget.data?.content || ''}</textarea>
                </div>
            `;

        case 'goals':
            const goals = widget.data?.items || [];
            return `
                <div id="goalsList-${index}">
                    ${goals.map((goal, i) => `
                        <div class="goal-item">
                            <div class="goal-icon" onclick="openEmojiPicker(event, this, 'goal', ${index}, ${i})">${goal.icon}</div>
                            <div class="goal-info">
                                <div class="editable-field" onclick="startEdit(this, 'goal-name', ${index}, ${i})">
                                    <span class="edit-icon">✏️</span>
                                    <input class="editable-input goal-name" type="text" value="${goal.name}" 
                                        onblur="finishEdit(this, 'goal-name', ${index}, ${i})"
                                        onkeypress="if(event.key==='Enter') finishEdit(this, 'goal-name', ${index}, ${i})">
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                                    <input type="range" min="0" max="100" value="${goal.progress}" 
                                        style="flex: 1; accent-color: var(--accent); height: 8px; cursor: pointer;"
                                        oninput="updateGoalProgressSlider(${index}, ${i}, this.value)"
                                        onchange="updateGoalProgressSlider(${index}, ${i}, this.value)">
                                    <span style="color: var(--accent); font-weight: 600; min-width: 45px;">${goal.progress}%</span>
                                </div>
                                <div class="goal-progress-bar" onclick="updateGoalProgress(${index}, ${i}, event)" title="Yoki bu yerga bosing">
                                    <div class="goal-progress-fill" style="width: ${goal.progress}%"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button style="width:100%; margin-top:10px; padding:10px; background:var(--bg-tertiary); border:1px dashed var(--border); border-radius:8px; color:var(--text-muted); cursor:pointer;" onclick="addGoal(${index})">+ Maqsad qo'shish</button>
            `;

        case 'habits':
            const habits = widget.data?.items || [];
            const dayNames = ['D', 'S', 'C', 'P', 'J', 'S', 'Y'];
            return `
                <div id="habitsList-${index}">
                    ${habits.map((habit, i) => `
                        <div class="habit-item">
                            <div class="habit-name">
                                <span class="habit-emoji" onclick="openEmojiPicker(event, this, 'habit', ${index}, ${i})">${habit.emoji}</span>
                                <div class="editable-field" onclick="startEdit(this, 'habit-name', ${index}, ${i})">
                                    <span class="edit-icon">✏️</span>
                                    <input type="text" class="editable-input" value="${habit.name}" 
                                        onblur="finishEdit(this, 'habit-name', ${index}, ${i})"
                                        onkeypress="if(event.key==='Enter') finishEdit(this, 'habit-name', ${index}, ${i})">
                                </div>
                            </div>
                            <div class="habit-days">
                                ${habit.days.map((done, d) => `
                                    <div class="habit-day ${done ? 'done' : ''}" onclick="toggleHabitDay(${index}, ${i}, ${d})">${dayNames[d]}</div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button style="width:100%; margin-top:10px; padding:10px; background:var(--bg-tertiary); border:1px dashed var(--border); border-radius:8px; color:var(--text-muted); cursor:pointer;" onclick="addHabit(${index})">+ Odat qo'shish</button>
            `;

        case 'quote':
            return `
                <div class="editable-field" onclick="startEdit(this, 'quote-text', ${index})">
                    <span class="edit-icon">✏️</span>
                    <textarea class="editable-textarea quote-text" placeholder="Iqtibos..." 
                        onblur="finishEdit(this, 'quote-text', ${index})"
                        onkeydown="if(event.key==='Escape') finishEdit(this, 'quote-text', ${index})">${widget.data?.text || ''}</textarea>
                </div>
                <div class="quote-author">
                    — <div class="editable-field" onclick="startEdit(this, 'quote-author', ${index})">
                        <span class="edit-icon">✏️</span>
                        <input type="text" class="editable-input" value="${widget.data?.author || ''}" placeholder="Muallif" 
                            onblur="finishEdit(this, 'quote-author', ${index})"
                            onkeypress="if(event.key==='Enter') finishEdit(this, 'quote-author', ${index})">
                    </div>
                </div>
            `;

        case 'image':
            return `
                <div class="image-widget-content" onclick="selectImage(${index})">
                    ${widget.data?.src ?
                        `<img src="${widget.data.src}" alt="Widget image">` :
                        `<div class="image-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span>Rasm tanlash</span>
                        </div>`
                    }
                </div>
            `;

        case 'weather':
            return `
                <div class="weather-actions">
                    <div>Ob-havo</div>
                    <button class="weather-refresh" onclick="event.stopPropagation(); refreshWeather(${index})">Yangilash</button>
                </div>
                <div class="weather-location">
                    📍 <input type="text" value="${widget.data?.location || 'Farg\'ona, O\'zbekiston'}" onchange="updateWeatherLocation(${index}, this.value)">
                </div>
                <div class="weather-main">
                    <div class="weather-icon" id="weather-icon-${index}">☀️</div>
                    <div>
                        <div class="weather-temp" id="weather-temp-${index}">--°C</div>
                        <div class="weather-desc" id="weather-desc-${index}">Yuklanmoqda...</div>
                    </div>
                </div>
            `;

        case 'progress':
            const progressItems = widget.data?.items || [
                { label: '📚 Kitob o\'qish', value: 70 },
                { label: '🏃 Sport', value: 45 },
                { label: '💰 Jamg\'arma', value: 80 }
            ];
            return `
                <div id="progressList-${index}">
                    ${progressItems.map((item, i) => `
                        <div class="progress-item">
                            <div class="progress-header">
                                <span class="progress-label">
                                    <input type="text" value="${item.label}" onchange="updateProgressLabel(${index}, ${i}, this.value)">
                                </span>
                                <span class="progress-value">${item.value}%</span>
                            </div>
                            <div class="progress-bar" onclick="updateProgressValue(${index}, ${i}, event)">
                                <div class="progress-fill" style="width: ${item.value}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button style="width:100%; margin-top:10px; padding:10px; background:var(--bg-tertiary); border:1px dashed var(--border); border-radius:8px; color:var(--text-muted); cursor:pointer;" onclick="addProgressItem(${index})">+ Progress qo'shish</button>
            `;

        case 'weekly': {
            const metrics = computeMetrics();
            return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Hafta vazifalari</div>
                        <div class="stat-value">${metrics.weeklyTodos}/${metrics.weeklyTotal}</div>
                        <div class="stat-sub">${metrics.weeklyRate}% bajarildi</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Odatlar bajarilishi</div>
                        <div class="stat-value">${metrics.habitRate}%</div>
                        <div class="stat-sub">${metrics.habitDone}/${metrics.habitTotal} kun</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">O'rtacha maqsad</div>
                        <div class="stat-value">${metrics.goalsAvg}%</div>
                        <div class="stat-sub">Maqsadlar kesimida</div>
                    </div>
                </div>
                <canvas id="chart-weekly-${index}" height="180"></canvas>
            `;
        }

        case 'monthly': {
            const metrics = computeMetrics();
            return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Progress o'rtacha</div>
                        <div class="stat-value">${metrics.progressAvg}%</div>
                        <div class="stat-sub">Progress items</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Maqsadlar o'rtacha</div>
                        <div class="stat-value">${metrics.goalsAvg}%</div>
                        <div class="stat-sub">Barcha maqsadlar</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">30 kun vazifalar</div>
                        <div class="stat-value">${metrics.monthlyRate}%</div>
                        <div class="stat-sub">${metrics.monthlyTodos}/${metrics.monthlyTotal}</div>
                    </div>
                </div>
                <canvas id="chart-monthly-${index}" height="180"></canvas>
            `;
        }

        case 'countdown':
            return `
                <div style="text-align:center;">
                    <input type="text" value="${widget.data?.event || 'Muhim sana'}" style="background:transparent; border:none; color:var(--text-secondary); text-align:center; font-size:0.9rem; outline:none; width:100%; margin-bottom:15px;" onchange="updateCountdownEvent(${index}, this.value)">
                    <input type="date" value="${widget.data?.date || ''}" style="background:var(--bg-tertiary); border:1px solid var(--border); color:var(--text-primary); padding:10px; border-radius:8px; font-family:inherit; margin-bottom:15px;" onchange="updateCountdownDate(${index}, this.value)">
                    <div style="font-size:2rem; font-weight:700; color:var(--accent);" id="countdown-${index}">0 kun</div>
                </div>
            `;

        default:
            return '<p>Widget</p>';
    }
}

// Clock
function startClock() {
    function update() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        dashboardData.widgets.forEach((widget, index) => {
            if (widget.type === 'clock') {
                const hoursEl = document.getElementById(`hours-${index}`);
                const minutesEl = document.getElementById(`minutes-${index}`);
                const dateEl = document.getElementById(`date-${index}`);

                if (hoursEl) hoursEl.textContent = hours;
                if (minutesEl) minutesEl.textContent = minutes;
                if (dateEl) {
                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                    dateEl.textContent = now.toLocaleDateString('uz-UZ', options);
                }
            }

            if (widget.type === 'countdown' && widget.data?.date) {
                const countdownEl = document.getElementById(`countdown-${index}`);
                if (countdownEl) {
                    const target = new Date(widget.data.date);
                    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
                    countdownEl.textContent = diff > 0 ? `${diff} kun qoldi` : diff === 0 ? 'Bugun!' : 'O\'tdi';
                }
            }
        });
    }
    update();
    setInterval(update, 1000);
}

// Widget Actions
function updateWidgetTitle(index, value) {
    dashboardData.widgets[index].title = value;
    saveData();
}

function cycleWidgetSize(index) {
    const widget = dashboardData.widgets[index];
    
    // Cycle: normal → large → extra-large → full-width → normal
    if (!widget.large && !widget.extraLarge && !widget.fullWidth) {
        widget.large = true;
        showToast('Katta o\'lcham');
    } else if (widget.large && !widget.extraLarge && !widget.fullWidth) {
        widget.large = false;
        widget.extraLarge = true;
        showToast('Extra katta o\'lcham');
    } else if (widget.extraLarge && !widget.fullWidth) {
        widget.extraLarge = false;
        widget.fullWidth = true;
        showToast('To\'liq kenglik');
    } else {
        widget.large = false;
        widget.extraLarge = false;
        widget.fullWidth = false;
        showToast('Normal o\'lcham');
    }
    
    saveData();
    renderDashboard();
}

function toggleWidgetSize(index) {
    dashboardData.widgets[index].large = !dashboardData.widgets[index].large;
    saveData();
    renderDashboard();
}

function deleteWidget(index) {
    if (confirm('Widgetni o\'chirishni xohlaysizmi?')) {
        dashboardData.widgets.splice(index, 1);
        saveData();
        renderDashboard();
    }
}

// Todo Actions
function addTodoItem(widgetIndex, input) {
    if (!input.value.trim()) return;

    if (!dashboardData.widgets[widgetIndex].data) {
        dashboardData.widgets[widgetIndex].data = { items: [] };
    }

    dashboardData.widgets[widgetIndex].data.items.push({
        id: 't' + Date.now(),
        text: input.value.trim(),
        completed: false,
        time: '',
        createdAt: new Date().toISOString(),
        completedAt: null
    });

    input.value = '';
    saveData();
    renderDashboard();
}

function toggleTodo(widgetIndex, itemIndex) {
    const item = dashboardData.widgets[widgetIndex].data.items[itemIndex];
    item.completed = !item.completed;
    if (item.completed) {
        item.completedAt = new Date().toISOString();
    } else {
        item.completedAt = null;
    }
    saveData();
    renderDashboard();
}

function updateTodoText(widgetIndex, itemIndex, value) {
    dashboardData.widgets[widgetIndex].data.items[itemIndex].text = value;
    saveData();
}

function updateTodoTime(widgetIndex, itemIndex, value) {
    dashboardData.widgets[widgetIndex].data.items[itemIndex].time = value;
    saveData();
}

function deleteTodo(widgetIndex, itemIndex) {
    dashboardData.widgets[widgetIndex].data.items.splice(itemIndex, 1);
    saveData();
    renderDashboard();
}

// Notes Actions
function updateNotes(index, value) {
    if (!dashboardData.widgets[index].data) {
        dashboardData.widgets[index].data = {};
    }
    dashboardData.widgets[index].data.content = value;
    saveData();
}

// Goals Actions
function addGoal(index) {
    if (!dashboardData.widgets[index].data) {
        dashboardData.widgets[index].data = { items: [] };
    }
    dashboardData.widgets[index].data.items.push({
        id: 'g' + Date.now(),
        icon: '🎯',
        name: 'Yangi maqsad',
        progress: 0
    });
    saveData();
    renderDashboard();
}

function updateGoalName(widgetIndex, goalIndex, value) {
    dashboardData.widgets[widgetIndex].data.items[goalIndex].name = value;
    saveData();
}

function updateGoalProgressSlider(widgetIndex, goalIndex, value) {
    dashboardData.widgets[widgetIndex].data.items[goalIndex].progress = parseInt(value);
    saveData();
    renderDashboard();
}

function updateGoalProgress(widgetIndex, goalIndex, event) {
    // Get the progress bar element (parent of the fill)
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    
    // Calculate click position relative to the bar
    const clickX = event.clientX - rect.left;
    const progress = Math.round((clickX / rect.width) * 100);
    
    // Clamp between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    dashboardData.widgets[widgetIndex].data.items[goalIndex].progress = clampedProgress;
    saveData();
    renderDashboard();
}

// Habits Actions
function addHabit(index) {
    if (!dashboardData.widgets[index].data) {
        dashboardData.widgets[index].data = { items: [] };
    }
    dashboardData.widgets[index].data.items.push({
        id: 'h' + Date.now(),
        emoji: '✨',
        name: 'Yangi odat',
        days: [false, false, false, false, false, false, false]
    });
    saveData();
    renderDashboard();
}

function updateHabitName(widgetIndex, habitIndex, value) {
    dashboardData.widgets[widgetIndex].data.items[habitIndex].name = value;
    saveData();
}

function toggleHabitDay(widgetIndex, habitIndex, dayIndex) {
    dashboardData.widgets[widgetIndex].data.items[habitIndex].days[dayIndex] =
        !dashboardData.widgets[widgetIndex].data.items[habitIndex].days[dayIndex];
    saveData();
    renderDashboard();
}

// Quote Actions
function updateQuote(index, field, value) {
    if (!dashboardData.widgets[index].data) {
        dashboardData.widgets[index].data = {};
    }
    dashboardData.widgets[index].data[field] = value;
    saveData();
}

// Progress Actions
function addProgressItem(index) {
    if (!dashboardData.widgets[index].data) {
        dashboardData.widgets[index].data = { items: [] };
    }
    dashboardData.widgets[index].data.items.push({
        label: '📈 Yangi',
        value: 0
    });
    saveData();
    renderDashboard();
}

function updateProgressLabel(widgetIndex, itemIndex, value) {
    dashboardData.widgets[widgetIndex].data.items[itemIndex].label = value;
    saveData();
}

function updateProgressValue(widgetIndex, itemIndex, event) {
    const rect = event.target.getBoundingClientRect();
    const value = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    dashboardData.widgets[widgetIndex].data.items[itemIndex].value = Math.max(0, Math.min(100, value));
    saveData();
    renderDashboard();
}

// Weather Actions
function updateWeatherLocation(index, value) {
    if (!dashboardData.widgets[index].data) {
        dashboardData.widgets[index].data = {};
    }
    dashboardData.widgets[index].data.location = value;
    saveData();
    refreshWeather(index);
}

// Countdown Actions
function updateCountdownEvent(index, value) {
    if (!dashboardData.widgets[index].data) {
        dashboardData.widgets[index].data = {};
    }
    dashboardData.widgets[index].data.event = value;
    saveData();
}

function updateCountdownDate(index, value) {
    if (!dashboardData.widgets[index].data) {
        dashboardData.widgets[index].data = {};
    }
    dashboardData.widgets[index].data.date = value;
    saveData();
}

// Image Actions
let currentImageWidgetIndex = null;

function selectImage(index) {
    currentImageWidgetIndex = index;
    document.getElementById('imageInput').click();
}

document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && currentImageWidgetIndex !== null) {
        const reader = new FileReader();
        reader.onload = function(event) {
            if (!dashboardData.widgets[currentImageWidgetIndex].data) {
                dashboardData.widgets[currentImageWidgetIndex].data = {};
            }
            dashboardData.widgets[currentImageWidgetIndex].data.src = event.target.result;
            saveData();
            renderDashboard();
        };
        reader.readAsDataURL(file);
    }
});

// Cover Image
function changeCover() {
    document.getElementById('coverInput').click();
}

document.getElementById('coverInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            dashboardData.coverImage = event.target.result;
            saveData();
            renderDashboard();
        };
        reader.readAsDataURL(file);
    }
});

// Emoji Picker
let emojiPickerTarget = null;
let emojiPickerWidgetIndex = null;
let emojiPickerItemIndex = null;

function openEmojiPicker(evt, element, type, widgetIndex, itemIndex) {
    const picker = document.getElementById('emojiPicker');
    const grid = document.getElementById('emojiGrid');

    emojiPickerTarget = { element, type };
    emojiPickerWidgetIndex = widgetIndex;
    emojiPickerItemIndex = itemIndex;

    grid.innerHTML = emojis.map(emoji =>
        `<button class="emoji-btn" onclick="selectEmoji('${emoji}')">${emoji}</button>`
    ).join('');

    const rect = element.getBoundingClientRect();
    picker.style.left = rect.left + 'px';
    picker.style.top = (rect.bottom + 5) + 'px';
    picker.classList.add('active');

    evt.stopPropagation();
}

function selectEmoji(emoji) {
    if (emojiPickerTarget.type === 'pageIcon') {
        dashboardData.pageIcon = emoji;
        document.getElementById('pageIcon').textContent = emoji;
    } else if (emojiPickerTarget.type === 'widget') {
        dashboardData.widgets[emojiPickerWidgetIndex].icon = emoji;
    } else if (emojiPickerTarget.type === 'goal') {
        dashboardData.widgets[emojiPickerWidgetIndex].data.items[emojiPickerItemIndex].icon = emoji;
    } else if (emojiPickerTarget.type === 'habit') {
        dashboardData.widgets[emojiPickerWidgetIndex].data.items[emojiPickerItemIndex].emoji = emoji;
    }

    saveData();
    renderDashboard();
    closeEmojiPicker();
}

function closeEmojiPicker() {
    document.getElementById('emojiPicker').classList.remove('active');
}

// Modal
function openWidgetModal() {
    document.getElementById('widgetModal').classList.add('active');
}

function closeWidgetModal() {
    document.getElementById('widgetModal').classList.remove('active');
}

function addWidget(type) {
    const widgetTypes = {
        clock: { title: 'Soat', icon: '🕐' },
        todo: { title: 'Vazifalar', icon: '✅', data: { items: [] } },
        notes: { title: 'Eslatmalar', icon: '📝', data: { content: '' } },
        goals: { title: 'Maqsadlar', icon: '🎯', data: { items: [] } },
        habits: { title: 'Odatlar', icon: '💪', data: { items: [] } },
        progress: { title: 'Progress', icon: '📊', data: { items: [] } },
    weekly: { title: 'Haftalik natijalar', icon: '📆', data: {} },
    monthly: { title: 'Oylik natijalar', icon: '🗓️', data: {} },
        quote: { title: 'Iqtibos', icon: '💭', data: { text: '', author: '' } },
        image: { title: 'Rasm', icon: '🖼️', data: { src: '' } },
        weather: { title: 'Ob-havo', icon: '☀️', data: { location: 'Farg\'ona' } },
        countdown: { title: 'Countdown', icon: '⏳', data: { event: '', date: '' } }
    };

    const config = widgetTypes[type];
    dashboardData.widgets.push({
        id: 'w' + Date.now(),
        type: type,
        ...config
    });

    saveData();
    renderDashboard();
    closeWidgetModal();
}

// Drag & Drop
let draggedWidget = null;

function handleDragStart(e) {
    draggedWidget = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.widget').forEach(w => w.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedWidget !== this) {
        const fromIndex = parseInt(draggedWidget.dataset.index);
        const toIndex = parseInt(this.dataset.index);

        const temp = dashboardData.widgets[fromIndex];
        dashboardData.widgets.splice(fromIndex, 1);
        dashboardData.widgets.splice(toIndex, 0, temp);

        saveData();
        renderDashboard();
    }
}

// Page Header Updates
function setupEventListeners() {
    document.getElementById('pageTitle').addEventListener('blur', function() {
        dashboardData.pageTitle = this.textContent;
        saveData();
    });

    document.getElementById('pageDescription').addEventListener('blur', function() {
        dashboardData.pageDescription = this.textContent;
        saveData();
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.emoji-picker') && !e.target.closest('.page-icon') && !e.target.closest('.widget-title-icon') && !e.target.closest('.goal-icon') && !e.target.closest('.habit-emoji')) {
            closeEmojiPicker();
        }
    });

    document.getElementById('widgetModal').addEventListener('click', function(e) {
        if (e.target === this) closeWidgetModal();
    });
}

function setupNavFilters() {
    const items = document.querySelectorAll('.nav-item[data-filter]');
    items.forEach(item => {
        item.addEventListener('click', () => {
            setNavFilter(item.dataset.filter, item);
        });
    });
    const dashboardItem = document.querySelector('.nav-item[data-filter="dashboard"]');
    if (dashboardItem) setNavFilter('dashboard', dashboardItem);
}

function setNavFilter(filter, el) {
    activeFilter = filter;
    document.querySelectorAll('.nav-item[data-filter]').forEach(item => {
        item.classList.toggle('active', item === el);
    });
    const breadcrumb = document.querySelector('.breadcrumb span');
    if (breadcrumb) {
        breadcrumb.textContent = (el?.textContent || 'Dashboard').trim();
    }
    renderDashboard();
}

// Reset
function resetDashboard() {
    if (confirm('Dashboardni boshlang\'ich holatga qaytarishni xohlaysizmi?')) {
        localStorage.removeItem('lifeos_dashboard');
        dashboardData.widgets = [...defaultWidgets];
        dashboardData.pageIcon = '🌿';
        dashboardData.pageTitle = 'Personal Life Dashboard';
        dashboardData.pageDescription = 'Kundalik hayotingizni tartibga soling va maqsadlaringizga erishing';
        dashboardData.coverImage = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&h=400&fit=crop';
        saveData();
        renderDashboard();
    }
}

// Sidebar Toggle
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Metrics helpers
function computeMetrics() {
    const now = new Date();
    const daysAgo = (dateStr) => {
        if (!dateStr) return Infinity;
        const d = new Date(dateStr);
        return (now - d) / (1000 * 60 * 60 * 24);
    };

    const todos = dashboardData.widgets.find(w => w.type === 'todo')?.data?.items || [];
    const completedTodos = todos.filter(t => t.completed).length;
    const totalTodos = todos.length || 1;
    const todoRate = Math.round((completedTodos / totalTodos) * 100);

    const weeklyTodos = todos.filter(t => daysAgo(t.completedAt) <= 7);
    const weeklyTotal = todos.filter(t => daysAgo(t.createdAt || t.completedAt) <= 7).length || 1;
    const weeklyRate = Math.round((weeklyTodos.length / weeklyTotal) * 100);

    const monthlyTodos = todos.filter(t => daysAgo(t.completedAt) <= 30);
    const monthlyTotal = todos.filter(t => daysAgo(t.createdAt || t.completedAt) <= 30).length || 1;
    const monthlyRate = Math.round((monthlyTodos.length / monthlyTotal) * 100);

    const habits = dashboardData.widgets.find(w => w.type === 'habits')?.data?.items || [];
    const habitDone = habits.reduce((sum, h) => sum + (h.days || []).filter(Boolean).length, 0);
    const habitTotal = habits.length * 7 || 1;
    const habitRate = Math.round((habitDone / habitTotal) * 100);

    const goals = dashboardData.widgets.find(w => w.type === 'goals')?.data?.items || [];
    const goalsAvg = goals.length ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) : 0;

    const progressItems = dashboardData.widgets.find(w => w.type === 'progress')?.data?.items || [];
    const progressAvg = progressItems.length ? Math.round(progressItems.reduce((s, p) => s + (p.value || 0), 0) / progressItems.length) : 0;

    return {
        completedTodos,
        totalTodos,
        todoRate,
        weeklyTodos: weeklyTodos.length,
        weeklyTotal,
        weeklyRate,
        monthlyTodos: monthlyTodos.length,
        monthlyTotal,
        monthlyRate,
        habits,
        habitDone,
        habitTotal,
        habitRate,
        goalsAvg,
        progressAvg
    };
}

const chartInstances = {};

function renderCharts() {
    if (!window.Chart) return;
    const metrics = computeMetrics();

    dashboardData.widgets.forEach((widget, index) => {
        if (widget.type === 'weekly') {
            const ctx = document.getElementById(`chart-weekly-${index}`);
            if (!ctx) return;
            if (chartInstances[`weekly-${index}`]) chartInstances[`weekly-${index}`].destroy();
            chartInstances[`weekly-${index}`] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Bajarilgan', 'Qolgan', 'Odat %'],
                    datasets: [{
                        label: 'Natija',
                        data: [
                            metrics.weeklyTodos,
                            Math.max(metrics.weeklyTotal - metrics.weeklyTodos, 0),
                            metrics.habitRate
                        ],
                        backgroundColor: ['#10b981', '#f59e0b', '#6366f1']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { color: '#a1a1aa' } },
                        x: { ticks: { color: '#a1a1aa' } }
                    }
                }
            });
        }

        if (widget.type === 'monthly') {
            const ctx = document.getElementById(`chart-monthly-${index}`);
            if (!ctx) return;
            if (chartInstances[`monthly-${index}`]) chartInstances[`monthly-${index}`].destroy();
            chartInstances[`monthly-${index}`] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Progress', 'Maqsadlar', 'Vazifalar'],
                    datasets: [{
                        data: [metrics.progressAvg, metrics.goalsAvg, metrics.monthlyRate],
                        backgroundColor: ['#10b981', '#6366f1', '#f59e0b']
                    }]
                },
                options: {
                    plugins: {
                        legend: { labels: { color: '#a1a1aa' } }
                    }
                }
            });
        }
    });
}

// Weather live
const weatherCodeMap = {
    0: { icon: '☀️', text: 'Ochiq' },
    1: { icon: '🌤️', text: 'Asosan quyoshli' },
    2: { icon: '⛅', text: 'Qisman bulutli' },
    3: { icon: '☁️', text: 'Bulutli' },
    45: { icon: '🌫️', text: 'Tuman' },
    48: { icon: '🌫️', text: 'Muzli tuman' },
    51: { icon: '🌦️', text: 'Yengil yomg\'ir' },
    61: { icon: '🌧️', text: 'Yomg\'ir' },
    71: { icon: '❄️', text: 'Qor' },
    80: { icon: '🌦️', text: 'Yomg\'irli' },
    95: { icon: '⛈️', text: 'Momaqaldiroq' }
};

let weatherTimer = null;

async function refreshWeatherWidgets() {
    const weatherIndexes = [];
    dashboardData.widgets.forEach((w, i) => {
        if (w.type === 'weather') weatherIndexes.push(i);
    });
    weatherIndexes.forEach(i => refreshWeather(i));

    if (weatherTimer) clearTimeout(weatherTimer);
    // auto refresh every 15 minutes
    weatherTimer = setTimeout(refreshWeatherWidgets, 15 * 60 * 1000);
}

async function refreshWeather(index) {
    const widget = dashboardData.widgets[index];
    if (!widget || widget.type !== 'weather') return;
    const location = widget.data?.location || 'Farg\'ona';

    const tempEl = document.getElementById(`weather-temp-${index}`);
    const descEl = document.getElementById(`weather-desc-${index}`);
    const iconEl = document.getElementById(`weather-icon-${index}`);
    if (tempEl) tempEl.textContent = '...';
    if (descEl) descEl.textContent = 'Yuklanmoqda...';

    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=uz&format=json`);
        const geo = await geoRes.json();
        if (!geo.results || !geo.results.length) throw new Error('Topilmadi');
        const { latitude, longitude } = geo.results[0];

        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`);
        const wjson = await wRes.json();
        const temp = wjson.current?.temperature_2m;
        const code = wjson.current?.weather_code;
        const map = weatherCodeMap[code] || { icon: '🌤️', text: 'Ob-havo' };

        if (tempEl) tempEl.textContent = `${Math.round(temp)}°C`;
        if (descEl) descEl.textContent = map.text;
        if (iconEl) iconEl.textContent = map.icon;
    } catch (e) {
        if (descEl) descEl.textContent = 'Topilmadi';
        if (tempEl) tempEl.textContent = '--°C';
    }
}

// Daily Stats Saver
function calculateDailyStats() {
    let todos_completed = 0;
    let todos_total = 0;
    let goals_progress_sum = 0;
    let goals_count = 0;
    let habits_completed = 0;
    let habits_total = 0;
    let notes_count = 0;
    
    const today = new Date().toISOString().split('T')[0];
    
    dashboardData.widgets.forEach(widget => {
        if (widget.type === 'todo' && widget.data?.items) {
            widget.data.items.forEach(item => {
                if (item.createdAt && item.createdAt.startsWith(today)) {
                    todos_total++;
                    if (item.completed) todos_completed++;
                }
            });
        }
        
        if (widget.type === 'goals' && widget.data?.items) {
            widget.data.items.forEach(goal => {
                goals_progress_sum += goal.progress || 0;
                goals_count++;
            });
        }
        
        if (widget.type === 'habits' && widget.data?.items) {
            widget.data.items.forEach(habit => {
                habits_total++;
                const todayIndex = new Date().getDay();
                const dayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // Monday = 0
                if (habit.days && habit.days[dayIndex]) {
                    habits_completed++;
                }
            });
        }
        
        if (widget.type === 'notes' && widget.data?.content) {
            if (widget.data.content.trim().length > 0) {
                notes_count++;
            }
        }
    });
    
    const goals_progress_avg = goals_count > 0 ? (goals_progress_sum / goals_count) : 0;
    
    return {
        todos_completed,
        todos_total,
        goals_progress_avg: Math.round(goals_progress_avg * 10) / 10,
        habits_completed,
        habits_total,
        notes_count
    };
}

async function saveDailyStats() {
    try {
        const stats = calculateDailyStats();
        const response = await fetch('/api/daily-stats/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stats)
        });
        
        if (response.ok) {
            console.log('Daily stats saved:', stats);
        }
    } catch (err) {
        console.error('Failed to save daily stats:', err);
    }
}

function setupDailyStatsSaver() {
    // Check every minute if it's 23:59
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 23 && now.getMinutes() === 59) {
            saveDailyStats();
        }
    }, 60000); // Check every minute
    
    // Also save on page load if it's near end of day
    const now = new Date();
    if (now.getHours() >= 23) {
        saveDailyStats();
    }
}

// Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show', 'success');
    setTimeout(() => toast.classList.remove('show', 'success'), 2000);
}

// Editable Field Functions
function startEdit(fieldElement, type, widgetIndex, itemIndex) {
    if (fieldElement.classList.contains('editing')) return;
    
    fieldElement.classList.add('editing');
    const input = fieldElement.querySelector('.editable-input, .editable-textarea, .page-title, .page-description');
    if (input) {
        // Handle contenteditable divs
        if (input.tagName === 'DIV' && (input.classList.contains('page-title') || input.classList.contains('page-description'))) {
            input.contentEditable = 'true';
            input.focus();
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(input);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            input.focus();
            if (input.tagName === 'INPUT') {
                input.select();
            }
        }
    }
}

function finishEdit(inputElement, type, widgetIndex, itemIndex) {
    const fieldElement = inputElement.closest('.editable-field');
    if (!fieldElement) return;
    
    fieldElement.classList.remove('editing');
    
    // Get value - handle both input/textarea and contenteditable divs
    let value;
    if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'TEXTAREA') {
        value = inputElement.value;
    } else {
        value = inputElement.textContent || inputElement.innerText;
        inputElement.contentEditable = 'false';
    }
    
    // Update based on type
    switch(type) {
        case 'todo-text':
            updateTodoText(widgetIndex, itemIndex, value);
            break;
        case 'goal-name':
            updateGoalName(widgetIndex, itemIndex, value);
            break;
        case 'habit-name':
            updateHabitName(widgetIndex, itemIndex, value);
            break;
        case 'notes':
            updateNotes(widgetIndex, value);
            break;
        case 'quote-text':
            updateQuote(widgetIndex, 'text', value);
            break;
        case 'quote-author':
            updateQuote(widgetIndex, 'author', value);
            break;
        case 'page-title':
            dashboardData.pageTitle = value;
            saveData();
            break;
        case 'page-description':
            dashboardData.pageDescription = value;
            saveData();
            break;
    }
}

// Initialize
init();

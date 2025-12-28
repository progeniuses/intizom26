# 📊 Life OS - Personal Dashboard

## 🎯 Loyiha haqida

**Life OS** - shaxsiy hayotingizni tartibga solish, vazifalarni boshqarish, maqsadlarni kuzatish va intizomni shakllantirish uchun yaratilgan zamonaviy web-dashboard. Notion'dan ilhomlangan, lekin shaxsiy ehtiyojlar uchun moslashtirilgan.

### ✨ Asosiy maqsad

Kundalik hayotda barcha ishlarni rejalashtirish, intizomni shakllantirish va maqsadlarga erishish jarayonini vizual va oson qilish.

---

## 🏗️ Fayllar tuzilmasi

```
intizomli26/
│
├── app.py                          # Flask backend - asosiy server fayli
├── requirements.txt                 # Python dependencies
├── Procfile                        # Production deploy uchun
├── runtime.txt                     # Python versiyasi
├── render.yaml                     # Render.com auto-config
├── .gitignore                      # Git ignore qoidalari
├── .env                            # Environment variables (local)
│
├── templates/                      # HTML shablonlar
│   ├── index.html                  # Asosiy dashboard sahifa
│   ├── calendar.html               # Kalendar va statistika sahifasi
│   └── competition.html            # Raqobat sahifasi (2 foydalanuvchi)
│
└── static/                         # Static fayllar
    ├── css/
    │   └── style.css               # Barcha CSS stillar
    └── js/
        └── app.js                  # Barcha JavaScript logika
```

---

## 🔧 Texnologiyalar

### Backend
- **Python 3.11+** - Asosiy dasturlash tili
- **Flask 3.0** - Web framework
- **Flask-SQLAlchemy** - Database ORM
- **SQLite** - Database (default, production uchun ham ishlaydi)
- **Gunicorn** - Production WSGI server

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling (Custom CSS, gradientlar, animations)
- **Vanilla JavaScript** - Hech qanday framework yo'q, toza JS
- **Chart.js** - Grafiklar va diagrammalar
- **Open-Meteo API** - Jonli ob-havo ma'lumotlari

### Database
- **SQLite** - Asosiy database (fayl-based, setup kerak emas)
- **PostgreSQL** - Ixtiyoriy (production uchun)

---

## 📁 Fayllar tafsiloti

### `app.py` - Backend Server

**Vazifasi:** Barcha backend logika, API endpoints, database modellar.

**Asosiy qismlar:**

1. **Database Models:**
   - `User` - Foydalanuvchilar
   - `Dashboard` - Dashboard konfiguratsiyasi
   - `Todo` - Vazifalar
   - `Goal` - Maqsadlar
   - `Habit` - Odatlar
   - `DailyStats` - Kunlik statistika

2. **API Endpoints:**
   - `GET /` - Asosiy sahifa
   - `GET /calendar` - Kalendar sahifasi
   - `GET /competition` - Raqobat sahifasi
   - `POST /api/dashboard` - Dashboard saqlash
   - `GET /api/todos` - Vazifalarni olish
   - `POST /api/todos` - Yangi vazifa
   - `GET /api/daily-stats` - Kunlik statistika
   - `POST /api/daily-stats/calculate` - Statistika hisoblash
   - `POST /api/user/switch` - Foydalanuvchi almashtirish

3. **Database Configuration:**
   - SQLite default (local development)
   - PostgreSQL ixtiyoriy (production)
   - Avtomatik table yaratish

### `templates/index.html` - Asosiy Dashboard

**Vazifasi:** Barcha widgetlar, navigation, user interface.

**Struktura:**
- **Sidebar** - Navigation menu (Dashboard, Kalendar, Raqobat)
- **Topbar** - User switcher, widget qo'shish tugmasi
- **Page Header** - Cover image, title, description
- **Widget Grid** - Drag & drop widgetlar
- **Modals** - Widget qo'shish, emoji picker

**Widget turlari:**
- `clock` - Vaqt ko'rsatkich
- `todo` - Vazifalar ro'yxati
- `goals` - Maqsadlar progress
- `habits` - Haftalik odatlar
- `notes` - Eslatmalar
- `weather` - Ob-havo
- `quote` - Iqtibos
- `countdown` - Sana hisoblagich
- `weekly` - Haftalik statistika
- `monthly` - Oylik statistika

### `templates/calendar.html` - Kalendar va Statistika

**Vazifasi:** Kalendar ko'rinishi, haftalik/oylik natijalar, vizual statistika.

**Qismlar:**
- **Stats Panel** - 4 ta stat card (animated)
- **Charts** - Haftalik bar chart, oylik doughnut chart
- **Calendar Grid** - Oylik kalendar, har kunda stats ko'rsatadi
- **User Switcher** - Foydalanuvchi almashtirish

**Funksiyalar:**
- Oylik kalendar navigatsiyasi
- Har kunda bajarilgan vazifalar ko'rsatadi
- Daily stats (completion rate, habits)
- Haftalik/oylik grafiklar

### `templates/competition.html` - Raqobat Sahifasi

**Vazifasi:** Ikki foydalanuvchi (Bekzod va Shodiya) natijalarini solishtirish.

**Qismlar:**
- **Competitor Cards** - Har bir foydalanuvchi uchun stat card
- **Comparison Section** - Yonma-yon taqqoslash
- **Charts** - Haftalik progress grafiklari

**Ko'rsatiladigan statlar:**
- Completion rate (bajarilish foizi)
- Bajarilgan vazifalar
- Bajarilgan odatlar
- Maqsadlar o'rtacha

### `static/css/style.css` - Barcha Styling

**Vazifasi:** Barcha UI/UX dizayn, responsive design, animations.

**Asosiy qismlar:**

1. **CSS Variables:**
   - Dark mode colors
   - Accent colors
   - Spacing, borders, shadows

2. **Layout:**
   - Sidebar navigation
   - Topbar header
   - Widget grid system
   - Responsive breakpoints

3. **Components:**
   - Widget cards (draggable, resizable)
   - Todo items (completed state with line-through)
   - Goal progress bars
   - Habit checkboxes
   - Editable fields (with pencil icon)
   - Modals, toasts, emoji picker

4. **Animations:**
   - Fade in/out
   - Slide transitions
   - Hover effects
   - Loading states

### `static/js/app.js` - Frontend Logika

**Vazifasi:** Barcha interaktiv funksiyalar, data management, API calls.

**Asosiy funksiyalar:**

1. **Data Management:**
   - `loadData()` - localStorage'dan yuklash
   - `saveData()` - localStorage'ga saqlash
   - User-specific data (Bekzod/Shodiya)

2. **Widget System:**
   - `createWidgetElement()` - Widget HTML yaratish
   - `renderDashboard()` - Dashboard render qilish
   - `addWidget()` - Yangi widget qo'shish
   - `deleteWidget()` - Widget o'chirish
   - `toggleWidgetSize()` - Widget o'lchamini o'zgartirish

3. **Drag & Drop:**
   - Widget'larni tortib ko'chirish
   - Grid'ga joylashtirish

4. **Todo Management:**
   - `addTodoItem()` - Yangi vazifa
   - `toggleTodo()` - Vazifani bajarilgan qilish
   - `updateTodoText()` - Vazifa matnini yangilash
   - `updateTodoTime()` - Vazifa vaqtini yangilash
   - `deleteTodo()` - Vazifani o'chirish

5. **Goals Management:**
   - `addGoal()` - Yangi maqsad
   - `updateGoalProgress()` - Progress yangilash (slider)
   - `updateGoalName()` - Maqsad nomini yangilash

6. **Habits Management:**
   - `toggleHabitDay()` - Hafta kunini belgilash
   - `addHabit()` - Yangi odat
   - `updateHabitName()` - Odat nomini yangilash

7. **Editable Fields:**
   - `startEdit()` - Edit mode ochish (pencil icon bosilganda)
   - `finishEdit()` - Edit mode yopish va saqlash
   - Faqat pencil icon bosilganda tahrirlash mumkin

8. **Daily Stats:**
   - `calculateDailyStats()` - Kunlik statistika hisoblash
   - `saveDailyStats()` - Database'ga saqlash
   - `setupDailyStatsSaver()` - 23:59 da avtomatik saqlash

9. **Weather:**
   - `refreshWeatherWidgets()` - Barcha weather widget'larni yangilash
   - `refreshWeather()` - Open-Meteo API'dan ma'lumot olish

10. **User Management:**
    - `switchUser()` - Foydalanuvchi almashtirish (Bekzod/Shodiya)
    - `updateUserUI()` - UI yangilash
    - User-specific localStorage keys

11. **Charts:**
    - `renderCharts()` - Chart.js grafiklar yaratish
    - Weekly bar charts
    - Monthly doughnut charts

---

## 🔄 Ishlash prinsipi

### 1. Dastur ishga tushganda:

1. **Backend (`app.py`):**
   - Flask server ishga tushadi
   - Database connection ochiladi
   - Tables yaratiladi (agar yo'q bo'lsa)
   - Routes register qilinadi

2. **Frontend (`app.js`):**
   - `init()` funksiyasi chaqiriladi
   - `loadData()` - localStorage'dan data yuklanadi
   - `renderDashboard()` - Widgetlar render qilinadi
   - `setupEventListeners()` - Event listener'lar qo'shiladi
   - `startClock()` - Vaqt yangilanadi
   - `setupDailyStatsSaver()` - Stats saver ishga tushadi

### 2. Data Flow:

**LocalStorage Structure:**
```javascript
{
  pageIcon: '🌿',
  pageTitle: 'Personal Life Dashboard',
  pageDescription: '...',
  coverImage: '...',
  widgets: [
    {
      id: 'w1',
      type: 'todo',
      title: 'Vazifalar',
      data: {
        items: [
          { text: '...', completed: false, time: '10:00', createdAt: '...' }
        ]
      }
    },
    // ... boshqa widgetlar
  ]
}
```

**User-specific keys:**
- `lifeos_dashboard_1` - Bekzod uchun
- `lifeos_dashboard_2` - Shodiya uchun
- `currentUserId` - Hozirgi foydalanuvchi

### 3. Widget System:

**Widget yaratish:**
1. User "Widget qo'shish" tugmasini bosadi
2. Modal ochiladi, widget turi tanlanadi
3. `addWidget()` funksiyasi chaqiriladi
4. Widget `dashboardData.widgets` ga qo'shiladi
5. `saveData()` - localStorage'ga saqlanadi
6. `renderDashboard()` - Dashboard qayta render qilinadi

**Widget o'chirish:**
1. Widget header'dagi "✕" tugmasi bosiladi
2. `deleteWidget(index)` chaqiriladi
3. Widget array'dan olib tashlanadi
4. Data saqlanadi va dashboard yangilanadi

### 4. Drag & Drop:

**Prinsip:**
1. Widget `draggable="true"` attribute'ga ega
2. `dragstart` event - drag boshlanganda
3. `dragover` event - boshqa widget ustida
4. `drop` event - widget tushganda
5. Widget pozitsiyasi yangilanadi
6. Data saqlanadi

### 5. Editable Fields:

**Prinsip:**
1. Matn field'lar `editable-field` class'ga ega
2. Pencil icon (`✏️`) hover'da paydo bo'ladi
3. Pencil icon bosilganda `startEdit()` chaqiriladi
4. Field `editing` class oladi
5. Input `contenteditable` yoki `pointer-events: auto` bo'ladi
6. Enter yoki blur'da `finishEdit()` chaqiriladi
7. Data yangilanadi va saqlanadi

**Istisnolar (to'g'ridan-to'g'ri ishlaydi):**
- Checkbox'lar
- Emoji picker
- Slider (progress bar)
- Time input

### 6. Daily Stats System:

**Prinsip:**
1. Har daqiqada `setupDailyStatsSaver()` tekshiradi
2. 23:59 bo'lganda `saveDailyStats()` chaqiriladi
3. `calculateDailyStats()` - barcha widget'lardan hisoblaydi:
   - Todo completed/total (bugungi sana)
   - Goals progress average
   - Habits completed/total
   - Notes count
4. Backend API'ga POST request yuboriladi
5. Database'ga saqlanadi (`DailyStats` model)

**Kalendarda ko'rsatish:**
1. `loadDailyStats()` - oy uchun stats yuklanadi
2. Har kunda stats ko'rsatiladi:
   - Completion rate (foiz)
   - Habits completed/total
   - Rangli ko'rsatkichlar

### 7. User Switching:

**Prinsip:**
1. User switcher'da foydalanuvchi tanlanadi
2. `switchUser(userId)` chaqiriladi
3. Hozirgi user data saqlanadi
4. `currentUserId` yangilanadi
5. Yangi user data yuklanadi
6. Dashboard qayta render qilinadi
7. Backend session yangilanadi

**Data separation:**
- Har bir user uchun alohida localStorage key
- Backend'da `user_id` bilan filter qilinadi
- Database'da `user_id` foreign key

### 8. Competition Page:

**Prinsip:**
1. `loadCompetitionData()` - ikkala user stats yuklanadi
2. `calculateUserStats()` - har bir user uchun hisoblanadi:
   - Last 7 days stats
   - Completion rate
   - Total todos/habits
   - Goals average
3. `renderCompetition()` - yonma-yon ko'rsatiladi
4. G'olib yashil border bilan belgilanadi
5. Charts - haftalik progress grafiklari

---

## 🎨 Dizayn prinsiplari

### Color Scheme:
- **Dark mode** - asosiy tema
- **Accent colors** - gradientlar (green, purple, blue)
- **Muted colors** - secondary text, borders

### Layout:
- **Sidebar** - fixed, 280px width
- **Main content** - flexible, responsive
- **Widget grid** - CSS Grid, auto-fit
- **Mobile-first** - responsive breakpoints

### Animations:
- **Fade in** - sahifa yuklanganda
- **Hover effects** - interaktiv elementlar
- **Smooth transitions** - 0.2s-0.3s
- **Loading states** - skeleton screens

---

## 🔐 Xavfsizlik

### Frontend:
- **localStorage** - faqat client-side data
- **No sensitive data** - hech qanday parol yoki shaxsiy ma'lumot saqlanmaydi

### Backend:
- **Session management** - user_id session'da
- **CORS** - Flask-CORS enabled
- **Secret key** - environment variable'dan

---

## 📊 Database Schema

### Users Table:
- `id` - Primary key
- `username` - Foydalanuvchi nomi
- `email` - Email
- `password_hash` - Parol hash (kelajakda)
- `created_at` - Yaratilgan sana

### Todos Table:
- `id` - Primary key
- `user_id` - Foreign key (Users)
- `text` - Vazifa matni
- `completed` - Boolean
- `time` - Vaqt (string)
- `created_at` - Yaratilgan sana
- `completed_at` - Bajarilgan sana

### Goals Table:
- `id` - Primary key
- `user_id` - Foreign key
- `icon` - Emoji
- `name` - Maqsad nomi
- `progress` - Progress (0-100)
- `created_at` - Yaratilgan sana

### Habits Table:
- `id` - Primary key
- `user_id` - Foreign key
- `emoji` - Emoji
- `name` - Odat nomi
- `days` - JSON array (7 kun)
- `created_at` - Yaratilgan sana

### DailyStats Table:
- `id` - Primary key
- `user_id` - Foreign key
- `date` - Sana (unique per user)
- `todos_completed` - Bajarilgan vazifalar
- `todos_total` - Jami vazifalar
- `goals_progress_avg` - Maqsadlar o'rtacha
- `habits_completed` - Bajarilgan odatlar
- `habits_total` - Jami odatlar
- `notes_count` - Eslatmalar soni
- `created_at` - Yaratilgan sana

---

## 🚀 Production Deploy

### SQLite Variant (Oson):
1. GitHub'ga yuklash
2. Render.com'da Web Service yaratish
3. Environment variable: `SECRET_KEY`
4. Tayyor! (Database setup kerak emas)

### PostgreSQL Variant:
1. Render.com'da PostgreSQL database yaratish
2. `DATABASE_URL` environment variable qo'shish
3. Database tables yaratish

**Batafsil:** `DEPLOY_SIMPLE.md` va `DEPLOY.md` fayllarini ko'ring.

---

## 🔮 Kelajakdagi yangilanishlar

- [ ] Authentication system (login/register)
- [ ] Password hashing
- [ ] Email notifications
- [ ] Export data (PDF, Excel)
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] More widget types
- [ ] Themes (light mode)
- [ ] Multi-language support

---

## 📝 Eslatmalar

- **localStorage** - asosiy data storage (client-side)
- **Backend API** - ixtiyoriy (stats saqlash uchun)
- **SQLite** - default database (setup kerak emas)
- **User switching** - localStorage'da alohida saqlanadi
- **Daily stats** - 23:59 da avtomatik saqlanadi
- **Weather** - Open-Meteo API (tekin, no API key)

---

## 🎓 O'rganish uchun

Bu loyiha quyidagi konseptlarni ko'rsatadi:
- Flask backend development
- Vanilla JavaScript (framework'siz)
- LocalStorage data management
- Drag & drop implementation
- Chart.js integration
- Responsive design
- Multi-user system
- Daily statistics tracking

---

**Yaratilgan:** 2025  
**Texnologiyalar:** Python, Flask, JavaScript, SQLite  
**Maqsad:** Shaxsiy hayotni tartibga solish va intizomni shakllantirish


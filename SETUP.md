# Life OS - Loyihani ishga tushirish

## Tezkor boshlash

### 1. Dependencies o'rnatish
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# yoki
venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 2. PostgreSQL sozlash

**A) Lokal PostgreSQL:**
```bash
# PostgreSQL o'rnatilgan bo'lishi kerak
createdb lifeos_db
psql lifeos_db < schema.sql
```

**B) Render.com bepul PostgreSQL:**
1. Render.com'ga kiring
2. New → PostgreSQL yarating (Free tier)
3. Internal Database URL'ni nusxa oling
4. `.env` faylini yarating:
```bash
cp env.example .env
# .env ni tahrirlang:
DATABASE_URL=postgresql://...  # Render'dan olgan URL
SECRET_KEY=random-secure-key-here
```

### 3. Serverni ishga tushirish
```bash
python app.py
```

Brauzerda: http://localhost:5000

## Deploy (Render.com - BEPUL)

### 1. Render.com'da Web Service yaratish

1. GitHub'ga loyihangizni push qiling
2. Render.com'ga kiring → New → Web Service
3. Repository'ni ulang
4. Sozlamalar:
   - **Name:** life-os-app
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** Free

### 2. PostgreSQL ulash

Render dashboardda:
1. New → PostgreSQL (Free tier)
2. Database yaratilgandan keyin → Connect → Internal Database URL ni nusxa oling
3. Web Service'ga qayting → Environment
4. Quyidagi environment variables qo'shing:
   - `DATABASE_URL` = <Internal Database URL>
   - `SECRET_KEY` = <random secure key>

### 3. Database schema yaratish

Render Dashboard → PostgreSQL instance → Connect:
```bash
# PSQL Shell orqali:
psql -h <hostname> -U <username> -d <database>
# Parol so'raladi

# Schema.sql faylini copy-paste qiling yoki:
\i schema.sql
```

### 4. Deploy

Render avtomatik deploy qiladi. Bir necha daqiqada tayyor bo'ladi.
URL: https://your-app-name.onrender.com

## API hujjatlari

### Authentication
Hozircha demo foydalanuvchi (user_id=1). Keyingi versiyada to'liq auth.

### Endpoints

**Dashboard:**
- `GET /api/dashboard` - Widget ma'lumotlari
- `POST /api/dashboard` - Dashboard saqlash

**Todos:**
- `GET /api/todos` - Barcha vazifalar
- `POST /api/todos` - Yangi vazifa
- `PUT /api/todos/<id>` - Vazifani yangilash
- `DELETE /api/todos/<id>` - Vazifani o'chirish

**Goals:**
- `GET /api/goals` - Barcha maqsadlar
- `POST /api/goals` - Yangi maqsad
- `PUT /api/goals/<id>` - Maqsadni yangilash
- `DELETE /api/goals/<id>` - Maqsadni o'chirish

**Habits:**
- `GET /api/habits` - Barcha odatlar
- `POST /api/habits` - Yangi odat
- `PUT /api/habits/<id>` - Odatni yangilash
- `DELETE /api/habits/<id>` - Odatni o'chirish

**Stats:**
- `GET /api/stats/weekly` - Haftalik statistika
- `GET /api/stats/monthly` - Oylik statistika

## Troubleshooting

**Database connection error:**
- `.env` faylida `DATABASE_URL` to'g'ri yozilganini tekshiring
- PostgreSQL server ishga tushganini tekshiring: `pg_isready`

**Module not found:**
```bash
pip install -r requirements.txt
```

**Port already in use:**
```bash
# app.py'da portni o'zgartiring yoki:
lsof -ti:5000 | xargs kill
```

## Keyingi yangiliklar
- ✅ Flask backend
- ✅ PostgreSQL database
- ✅ Kalendar sahifasi
- ✅ Haftalik/oylik statistika
- ⏳ User authentication
- ⏳ Real-time collaboration
- ⏳ Mobile app (React Native)


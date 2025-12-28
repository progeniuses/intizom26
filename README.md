# Life OS - Personal Dashboard

Shaxsiy hayotingizni tartibga solish va maqsadlaringizga erishish uchun zamonaviy dashboard.

## Xususiyatlar

- 📋 **Vazifalar** - Kunlik vazifalarni vaqt bilan boshqarish
- 🎯 **Maqsadlar** - Progress bar bilan maqsadlarni kuzatish
- 💪 **Odatlar** - Haftalik odatlarni monitoring qilish
- 📊 **Statistika** - Haftalik va oylik natijalar grafiklari
- 🌤️ **Ob-havo** - Jonli ob-havo ma'lumotlari
- 📝 **Eslatmalar** - Tezkor yozuvlar
- 📅 **Kalendar** - To'liq kalendar ko'rinishi (kelayotgan yangilik)

## Texnologiyalar

**Backend:**
- Python 3.10+
- Flask
- PostgreSQL
- SQLAlchemy

**Frontend:**
- HTML5/CSS3
- Vanilla JavaScript
- Chart.js
- Open-Meteo API

## O'rnatish

### 1. Repository'ni clone qiling
```bash
git clone <repo-url>
cd intizomli26
```

### 2. Virtual environment yarating
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# yoki
venv\Scripts\activate  # Windows
```

### 3. Dependencies o'rnating
```bash
pip install -r requirements.txt
```

### 4. PostgreSQL database yarating
```bash
createdb lifeos_db
```

### 5. Environment variables sozlang
```bash
cp env.example .env
# .env faylini tahrirlang va o'z ma'lumotlaringizni kiriting
```

### 6. Database'ni initialize qiling
```bash
python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

### 7. Serverni ishga tushiring
```bash
python app.py
```

Brauzerda ochish: http://localhost:5000

## 🚀 Deploy (Tekin! PostgreSQL kerak emas!)

### ⚡ Eng Oson Variant: **SQLite + Render.com** (5 daqiqa!)

**Batafsil qo'llanma:** [DEPLOY_SIMPLE.md](DEPLOY_SIMPLE.md) - **PostgreSQL kerak emas!**

1. **GitHub'ga yuklang:**
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git push origin main
   ```

2. **Render.com'da:**
   - "New +" → "Web Service"
   - GitHub repo'ni ulang
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `gunicorn app:app`
   - **Plan:** Free

3. **Environment Variables (faqat 1 ta!):**
   ```
   SECRET_KEY=your-secret-key-here
   ```
   **⚠️ MUHIM:** `DATABASE_URL` ni **QO'SHMASLIK!** SQLite avtomatik ishlaydi!

**Tayyor! 🎉** URL: `https://your-app.onrender.com`

### 📚 Boshqa Tekin Variantlar (SQLite bilan):
- **Railway.app** ⭐ - Eng oson, auto-deploy
- **Fly.io** - CLI orqali deploy
- **PythonAnywhere** - Web interface
- **Replit** - Browser'da code

### 🗄️ PostgreSQL variant (ixtiyoriy):
Agar PostgreSQL ishlatmoqchi bo'lsangiz: [DEPLOY.md](DEPLOY.md) faylini ko'ring.

## API Endpoints

- `GET /api/dashboard` - Dashboard ma'lumotlarini olish
- `POST /api/dashboard` - Dashboard saqlash
- `GET /api/todos` - Barcha vazifalar
- `POST /api/todos` - Yangi vazifa yaratish
- `PUT /api/todos/<id>` - Vazifani yangilash
- `DELETE /api/todos/<id>` - Vazifani o'chirish
- `GET /api/goals` - Barcha maqsadlar
- `POST /api/goals` - Yangi maqsad yaratish
- `GET /api/habits` - Barcha odatlar
- `POST /api/habits` - Yangi odat yaratish
- `GET /api/stats/weekly` - Haftalik statistika
- `GET /api/stats/monthly` - Oylik statistika

## Loyiha strukturasi

```
intizomli26/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── Procfile              # Heroku deploy
├── templates/            # HTML templates
│   ├── index.html
│   ├── calendar.html
│   └── stats.html
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── README.md
```

## Hissa qo'shish

Pull request'lar qabul qilinadi! Katta o'zgarishlar uchun avval issue oching.

## Litsenziya

MIT


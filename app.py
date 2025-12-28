from flask import Flask, render_template, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
import json

app = Flask(__name__, 
            static_folder='static',
            static_url_path='/static',
            template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Database configuration: SQLite (default) or PostgreSQL
# SQLite ishlatish uchun DATABASE_URL ni o'rnatmaslik yoki 'sqlite:///lifeos.db' qo'yish kifoya
database_url = os.environ.get('DATABASE_URL', 'sqlite:///lifeos.db')

# PostgreSQL URL'ni to'g'rilash (agar mavjud bo'lsa)
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)

# Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    dashboards = db.relationship('Dashboard', backref='user', lazy=True)

class Dashboard(db.Model):
    __tablename__ = 'dashboards'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    data = db.Column(db.JSON, default=dict)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Todo(db.Model):
    __tablename__ = 'todos'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    time = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

class Goal(db.Model):
    __tablename__ = 'goals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    icon = db.Column(db.String(10), default='🎯')
    name = db.Column(db.String(255), nullable=False)
    progress = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Habit(db.Model):
    __tablename__ = 'habits'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    emoji = db.Column(db.String(10), default='✨')
    name = db.Column(db.String(255), nullable=False)
    days = db.Column(db.JSON, default=lambda: [False]*7)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DailyStats(db.Model):
    __tablename__ = 'daily_stats'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    todos_completed = db.Column(db.Integer, default=0)
    todos_total = db.Column(db.Integer, default=0)
    goals_progress_avg = db.Column(db.Float, default=0.0)
    habits_completed = db.Column(db.Integer, default=0)
    habits_total = db.Column(db.Integer, default=0)
    notes_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='unique_user_date'),)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/user/switch', methods=['POST'])
def switch_user():
    data = request.json
    user_id = data.get('user_id', 1)
    session['user_id'] = user_id
    return jsonify({'success': True, 'user_id': user_id})

@app.route('/calendar')
def calendar_page():
    return render_template('calendar.html')

@app.route('/competition')
def competition_page():
    return render_template('competition.html')

@app.route('/stats')
def stats_page():
    return render_template('stats.html')

# 404 Error Handler
@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

# Health check endpoint (Render uchun)
@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Life OS is running'}), 200

# API Routes
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    # For now, return demo user data (user_id = 1)
    user_id = session.get('user_id', 1)
    dashboard = Dashboard.query.filter_by(user_id=user_id).first()
    
    if not dashboard:
        dashboard = Dashboard(user_id=user_id, data={})
        db.session.add(dashboard)
        db.session.commit()
    
    return jsonify(dashboard.data)

@app.route('/api/dashboard', methods=['POST'])
def save_dashboard():
    user_id = session.get('user_id', 1)
    data = request.json
    
    dashboard = Dashboard.query.filter_by(user_id=user_id).first()
    if not dashboard:
        dashboard = Dashboard(user_id=user_id)
        db.session.add(dashboard)
    
    dashboard.data = data
    dashboard.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/api/todos', methods=['GET'])
def get_todos():
    user_id = session.get('user_id', 1)
    todos = Todo.query.filter_by(user_id=user_id).order_by(Todo.created_at.desc()).all()
    
    return jsonify([{
        'id': t.id,
        'text': t.text,
        'completed': t.completed,
        'time': t.time,
        'createdAt': t.created_at.isoformat() if t.created_at else None,
        'completedAt': t.completed_at.isoformat() if t.completed_at else None
    } for t in todos])

@app.route('/api/todos', methods=['POST'])
def create_todo():
    user_id = session.get('user_id', 1)
    data = request.json
    
    todo = Todo(
        user_id=user_id,
        text=data.get('text', ''),
        completed=data.get('completed', False),
        time=data.get('time', '')
    )
    db.session.add(todo)
    db.session.commit()
    
    return jsonify({'id': todo.id, 'success': True})

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    user_id = session.get('user_id', 1)
    todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
    
    if not todo:
        return jsonify({'error': 'Not found'}), 404
    
    data = request.json
    todo.text = data.get('text', todo.text)
    todo.time = data.get('time', todo.time)
    
    if 'completed' in data:
        todo.completed = data['completed']
        if todo.completed and not todo.completed_at:
            todo.completed_at = datetime.utcnow()
        elif not todo.completed:
            todo.completed_at = None
    
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    user_id = session.get('user_id', 1)
    todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
    
    if not todo:
        return jsonify({'error': 'Not found'}), 404
    
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/goals', methods=['GET'])
def get_goals():
    user_id = session.get('user_id', 1)
    goals = Goal.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': g.id,
        'icon': g.icon,
        'name': g.name,
        'progress': g.progress,
        'createdAt': g.created_at.isoformat() if g.created_at else None
    } for g in goals])

@app.route('/api/goals', methods=['POST'])
def create_goal():
    user_id = session.get('user_id', 1)
    data = request.json
    
    goal = Goal(
        user_id=user_id,
        icon=data.get('icon', '🎯'),
        name=data.get('name', ''),
        progress=data.get('progress', 0)
    )
    db.session.add(goal)
    db.session.commit()
    
    return jsonify({'id': goal.id, 'success': True})

@app.route('/api/goals/<int:goal_id>', methods=['PUT'])
def update_goal(goal_id):
    user_id = session.get('user_id', 1)
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Not found'}), 404
    
    data = request.json
    goal.icon = data.get('icon', goal.icon)
    goal.name = data.get('name', goal.name)
    goal.progress = data.get('progress', goal.progress)
    
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    user_id = session.get('user_id', 1)
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Not found'}), 404
    
    db.session.delete(goal)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/habits', methods=['GET'])
def get_habits():
    user_id = session.get('user_id', 1)
    habits = Habit.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': h.id,
        'emoji': h.emoji,
        'name': h.name,
        'days': h.days,
        'createdAt': h.created_at.isoformat() if h.created_at else None
    } for h in habits])

@app.route('/api/habits', methods=['POST'])
def create_habit():
    user_id = session.get('user_id', 1)
    data = request.json
    
    habit = Habit(
        user_id=user_id,
        emoji=data.get('emoji', '✨'),
        name=data.get('name', ''),
        days=data.get('days', [False]*7)
    )
    db.session.add(habit)
    db.session.commit()
    
    return jsonify({'id': habit.id, 'success': True})

@app.route('/api/habits/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    user_id = session.get('user_id', 1)
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    
    if not habit:
        return jsonify({'error': 'Not found'}), 404
    
    data = request.json
    habit.emoji = data.get('emoji', habit.emoji)
    habit.name = data.get('name', habit.name)
    habit.days = data.get('days', habit.days)
    
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    user_id = session.get('user_id', 1)
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    
    if not habit:
        return jsonify({'error': 'Not found'}), 404
    
    db.session.delete(habit)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/stats/weekly', methods=['GET'])
def get_weekly_stats():
    user_id = session.get('user_id', 1)
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    todos = Todo.query.filter(
        Todo.user_id == user_id,
        Todo.created_at >= week_ago
    ).all()
    
    completed = sum(1 for t in todos if t.completed)
    total = len(todos)
    rate = round((completed / total * 100) if total > 0 else 0, 1)
    
    return jsonify({
        'completed': completed,
        'total': total,
        'rate': rate,
        'period': 'weekly'
    })

@app.route('/api/stats/monthly', methods=['GET'])
def get_monthly_stats():
    user_id = session.get('user_id', 1)
    month_ago = datetime.utcnow() - timedelta(days=30)
    
    todos = Todo.query.filter(
        Todo.user_id == user_id,
        Todo.created_at >= month_ago
    ).all()
    
    completed = sum(1 for t in todos if t.completed)
    total = len(todos)
    rate = round((completed / total * 100) if total > 0 else 0, 1)
    
    goals = Goal.query.filter_by(user_id=user_id).all()
    goals_avg = round(sum(g.progress for g in goals) / len(goals)) if goals else 0
    
    return jsonify({
        'completed': completed,
        'total': total,
        'rate': rate,
        'goalsAvg': goals_avg,
        'period': 'monthly'
    })

@app.route('/api/daily-stats', methods=['POST'])
def save_daily_stats():
    # Get user_id from request body or session
    data = request.json
    user_id = data.get('user_id') or session.get('user_id', 1)
    user_id = int(user_id)
    
    today = datetime.utcnow().date()
    
    # Check if stats for today already exist
    stats = DailyStats.query.filter_by(user_id=user_id, date=today).first()
    
    if not stats:
        stats = DailyStats(user_id=user_id, date=today)
        db.session.add(stats)
    
    stats.todos_completed = data.get('todos_completed', 0)
    stats.todos_total = data.get('todos_total', 0)
    stats.goals_progress_avg = data.get('goals_progress_avg', 0.0)
    stats.habits_completed = data.get('habits_completed', 0)
    stats.habits_total = data.get('habits_total', 0)
    stats.notes_count = data.get('notes_count', 0)
    
    db.session.commit()
    return jsonify({'success': True, 'id': stats.id})

@app.route('/api/daily-stats', methods=['GET'])
def get_daily_stats():
    # Get user_id from query param or session
    user_id = request.args.get('user_id')
    if user_id:
        user_id = int(user_id)
    else:
        user_id = session.get('user_id', 1)
    
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = DailyStats.query.filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(DailyStats.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(DailyStats.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    stats = query.order_by(DailyStats.date.desc()).all()
    
    return jsonify([{
        'date': s.date.isoformat(),
        'todos_completed': s.todos_completed,
        'todos_total': s.todos_total,
        'goals_progress_avg': s.goals_progress_avg,
        'habits_completed': s.habits_completed,
        'habits_total': s.habits_total,
        'notes_count': s.notes_count,
        'completion_rate': round((s.todos_completed / s.todos_total * 100) if s.todos_total > 0 else 0, 1)
    } for s in stats])

@app.route('/api/daily-stats/calculate', methods=['POST'])
def calculate_daily_stats():
    """Calculate and save today's stats from current data"""
    user_id = session.get('user_id', 1)
    today = datetime.utcnow().date()
    
    # Calculate todos
    todos_today = Todo.query.filter(
        Todo.user_id == user_id,
        db.func.date(Todo.created_at) == today
    ).all()
    todos_completed = sum(1 for t in todos_today if t.completed)
    todos_total = len(todos_today)
    
    # Calculate goals average
    goals = Goal.query.filter_by(user_id=user_id).all()
    goals_avg = round(sum(g.progress for g in goals) / len(goals), 1) if goals else 0.0
    
    # Calculate habits
    habits = Habit.query.filter_by(user_id=user_id).all()
    habits_completed = sum(1 for h in habits if h.days and h.days[datetime.utcnow().weekday()])
    habits_total = len(habits)
    
    # Notes count (simplified - count from dashboard data)
    notes_count = 0  # Can be enhanced later
    
    # Save or update stats
    stats = DailyStats.query.filter_by(user_id=user_id, date=today).first()
    if not stats:
        stats = DailyStats(user_id=user_id, date=today)
        db.session.add(stats)
    
    stats.todos_completed = todos_completed
    stats.todos_total = todos_total
    stats.goals_progress_avg = goals_avg
    stats.habits_completed = habits_completed
    stats.habits_total = habits_total
    stats.notes_count = notes_count
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'stats': {
            'date': today.isoformat(),
            'todos_completed': todos_completed,
            'todos_total': todos_total,
            'goals_progress_avg': goals_avg,
            'habits_completed': habits_completed,
            'habits_total': habits_total,
            'completion_rate': round((todos_completed / todos_total * 100) if todos_total > 0 else 0, 1)
        }
    })

# Database initialization
with app.app_context():
    db.create_all()

# Production server (Gunicorn) uchun
if __name__ == '__main__':
    # Local development uchun
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
else:
    # Production uchun (Gunicorn)
    # Database tables yaratilganligini ta'minlash
    pass


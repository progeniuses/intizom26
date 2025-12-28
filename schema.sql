-- Life OS Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboards table (stores widget configurations)
CREATE TABLE IF NOT EXISTS dashboards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Todos table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    time VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    icon VARCHAR(10) DEFAULT '🎯',
    name VARCHAR(255) NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) DEFAULT '✨',
    name VARCHAR(255) NOT NULL,
    days JSONB DEFAULT '[false,false,false,false,false,false,false]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);

-- Insert demo user (password: demo123)
INSERT INTO users (id, username, email, password_hash) 
VALUES (1, 'demo', 'demo@lifeos.uz', 'demo_hash_placeholder')
ON CONFLICT (id) DO NOTHING;

-- Sample data for demo user
INSERT INTO todos (user_id, text, completed, time, created_at, completed_at)
VALUES 
    (1, 'Ertalabki mashq', true, '06:30', '2025-01-01', '2025-01-01'),
    (1, 'Kitob o''qish', true, '08:00', '2025-01-02', '2025-01-02'),
    (1, 'Do''stlar bilan uchrashish', false, '14:00', CURRENT_DATE, NULL),
    (1, 'Oila bilan kechki ovqat', false, '19:00', CURRENT_DATE, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO goals (user_id, icon, name, progress)
VALUES 
    (1, '📖', '12 ta kitob o''qish', 58),
    (1, '🏃', 'Marafon yugurish', 30),
    (1, '🌍', '3 ta yangi mamlakat', 33)
ON CONFLICT DO NOTHING;

INSERT INTO habits (user_id, emoji, name, days)
VALUES 
    (1, '💧', 'Suv ichish', '[true,true,true,true,true,false,false]'),
    (1, '🧘', 'Meditatsiya', '[true,true,false,true,true,false,false]'),
    (1, '📝', 'Kundalik yozish', '[true,true,true,true,true,false,false]')
ON CONFLICT DO NOTHING;


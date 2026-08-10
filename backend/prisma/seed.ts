const Database = require('better-sqlite3');
import * as path from 'path';
import * as fs from 'fs';

// Use simple ID generator
const generateId = () => Math.random().toString(36).slice(2, 11);

const DB_PATH = path.join(__dirname, '../dev.db');

// Initialize database with schema
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const schema = `
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  fullName TEXT NOT NULL,
  profilePhoto TEXT,
  height REAL,
  weight REAL,
  gender TEXT DEFAULT 'PREFER_NOT_TO_SAY',
  dateOfBirth DATETIME,
  unitSystem TEXT DEFAULT 'METRIC',
  theme TEXT DEFAULT 'SYSTEM',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "RefreshToken" (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  revoked INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Activity" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  distance REAL NOT NULL,
  duration INTEGER NOT NULL,
  calories REAL NOT NULL,
  averageSpeed REAL NOT NULL,
  maxSpeed REAL NOT NULL,
  averagePace REAL NOT NULL,
  steps INTEGER DEFAULT 0,
  startLocation TEXT,
  endLocation TEXT,
  polyline TEXT,
  notes TEXT,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "GpsPoint" (
  id TEXT PRIMARY KEY,
  activityId TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  altitude REAL DEFAULT 0.0,
  speed REAL DEFAULT 0.0,
  accuracy REAL DEFAULT 0.0,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (activityId) REFERENCES "Activity"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Goal" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  targetValue REAL NOT NULL,
  currentProgress REAL DEFAULT 0.0,
  startDate DATETIME NOT NULL,
  endDate DATETIME,
  completed INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Achievement" (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  metricThreshold REAL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "UserAchievement" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  achievementId TEXT NOT NULL,
  unlockedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, achievementId),
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY (achievementId) REFERENCES "Achievement"(id) ON DELETE CASCADE
);
`;

// Execute schema
const statements = schema.split(';').filter(s => s.trim());
for (const statement of statements) {
  if (statement.trim()) {
    db.exec(statement);
  }
}

console.log('✓ Database schema created');

// Seed initial data
const systemAchievements = [
  { code: 'FIRST_WALK', name: 'First Steps', description: 'Complete your first walk activity', icon: '👟', category: 'Activity' },
  { code: 'FIRST_RUN', name: 'Road Runner', description: 'Complete your first running activity', icon: '🏃', category: 'Activity' },
  { code: 'FIRST_CYCLE', name: 'Pedal Power', description: 'Complete your first cycling activity', icon: '🚴', category: 'Activity' },
  { code: 'FIRST_HIKE', name: 'Mountain Explorer', description: 'Complete your first hiking activity', icon: '🥾', category: 'Activity' },
  { code: 'DIST_10KM', name: 'Double Digits', description: 'Cover a cumulative distance of 10 km', icon: '🥉', category: 'Distance' },
  { code: 'DIST_50KM', name: 'Half-Century', description: 'Cover a cumulative distance of 50 km', icon: '🥈', category: 'Distance' },
  { code: 'DIST_100KM', name: 'Century Club', description: 'Cover a cumulative distance of 100 km', icon: '🥇', category: 'Distance' },
  { code: 'DIST_1000KM', name: 'Globe Trotter', description: 'Cover a cumulative distance of 1,000 km', icon: '🌍', category: 'Distance' },
  { code: 'STREAK_7', name: 'Week Warrior', description: 'Maintain a 7-day activity streak', icon: '🔥', category: 'Streak' },
  { code: 'STREAK_30', name: 'Monthly Master', description: 'Maintain a 30-day activity streak', icon: '⚡', category: 'Streak' },
  { code: 'ACT_100', name: 'Centurion', description: 'Complete 100 total workouts', icon: '💯', category: 'Milestone' },
  { code: 'MARATHON', name: 'Marathoner', description: 'Complete a single run/walk over 42.2 km', icon: '🏆', category: 'Milestone' },
];

// Insert achievements if not already present
const checkAch = db.prepare('SELECT COUNT(*) as count FROM "Achievement"');
const achCount = checkAch.get() as { count: number };

if (achCount.count === 0) {
  const insertAch = db.prepare(`
    INSERT INTO "Achievement" (id, code, name, description, icon, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const ach of systemAchievements) {
    insertAch.run(generateId(), ach.code, ach.name, ach.description, ach.icon, ach.category);
  }
  console.log(`✓ Seeded ${systemAchievements.length} achievements`);
} else {
  console.log('✓ Achievements already seeded');
}

console.log('✓ Database seeded successfully');
db.close();

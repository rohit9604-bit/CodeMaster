require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", async () => {
  console.log("✅ Connected to PostgreSQL");
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure points column exists for the leaderboard feature
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
    `);

    console.log("✅ Users table ensured");
  } catch (err) {
    console.error("❌ Error ensuring users table:", err);
  }
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
});

module.exports = pool;

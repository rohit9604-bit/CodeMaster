const express = require("express");
const router = express.Router();
const pool = require("../db");

// ==============================
// GET TOP 10 USERS BY POINTS
// ==============================
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT username, points 
      FROM users 
      ORDER BY points DESC, created_at ASC
      LIMIT 10
    `);

        res.json(result.rows);
    } catch (error) {
        console.error("LEADERBOARD ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;

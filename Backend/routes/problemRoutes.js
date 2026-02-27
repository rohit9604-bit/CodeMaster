const express = require("express");
const router = express.Router();
const pool = require("../db"); // adjust path if needed

// ==============================
// GET ALL VALIDATED PROBLEMS
// ==============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM validated_problems ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// GET RANDOM VALIDATED PROBLEM
// ==============================
router.get("/random/one", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM validated_problems ORDER BY RANDOM() LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No validated problems available."
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ==============================
// VALIDATED PROBLEMS INTEGRITY CHECK
// ==============================
router.get("/integrity/check", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.title,
        COUNT(DISTINCT t.id) AS test_case_count,
        COUNT(DISTINCT h.id) AS hint_count
      FROM problems p
      LEFT JOIN test_cases t ON p.id = t.problem_id
      LEFT JOIN hints h ON p.id = h.problem_id
      WHERE p.is_validated = true
      GROUP BY p.id
      ORDER BY p.id;
    `);

    const problems = result.rows;

    const incomplete = problems.filter(
      p => p.test_case_count == 0 || p.hint_count == 0
    );

    res.json({
      total_validated: problems.length,
      incomplete_problems: incomplete.length,
      details: incomplete
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ==============================
// DATASET HEALTH CHECK
// ==============================
router.get("/dataset/health", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE is_validated = true) AS validated,
        COUNT(*) FILTER (WHERE is_validated = false) AS unvalidated
      FROM problems;
    `);

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// GET SINGLE PROBLEM BY ID (must be last - after /random/one, /integrity/check, /dataset/health)
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM validated_problems WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Problem not found." });
    }

    const hintsResult = await pool.query(
      "SELECT hint_text FROM hints WHERE problem_id = $1 ORDER BY hint_order ASC",
      [id]
    );

    const examplesResult = await pool.query(
      "SELECT input, display_input, expected_output FROM test_cases WHERE problem_id = $1 AND is_hidden = false ORDER BY id ASC",
      [id]
    );

    const row = result.rows[0];
    // Normalize starter_code for frontend (snake_case from DB -> camelCase)
    const problem = {
      ...row,
      starterCode: row.starter_code || row.startercode,
      starter_code: row.starter_code || row.startercode,
      hints: hintsResult.rows.map(h => h.hint_text),
      examples: examplesResult.rows
    };
    res.json(problem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

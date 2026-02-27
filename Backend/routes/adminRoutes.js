const express = require("express");
const router = express.Router();
const pool = require("../db");

// ==============================
// ADD FULL PROBLEM (TRANSACTION SAFE)
// ==============================
router.post("/problem", async (req, res) => {
  const client = await pool.connect();

  try {
    const { problem, testCases, hints } = req.body;

    await client.query("BEGIN");

    const insertProblem = await client.query(
      `INSERT INTO problems
      (title, description, input_format, output_format, constraints, difficulty, tags, source, is_validated, reference_solution)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id`,
      [
        problem.title,
        problem.description,
        problem.input_format,
        problem.output_format,
        problem.constraints,
        problem.difficulty,
        problem.tags,
        problem.source,
        problem.is_validated,
        problem.reference_solution
      ]
    );

    const problemId = insertProblem.rows[0].id;

    if (testCases) {
      for (let test of testCases) {
        await client.query(
          "INSERT INTO test_cases (problem_id, input, expected_output, display_input) VALUES ($1,$2,$3,$4)",
          [problemId, test.input, test.expected_output, test.display_input]
        );
      }
    }

    if (hints) {
      for (let hint of hints) {
        await client.query(
          "INSERT INTO hints (problem_id, hint_order, hint_text) VALUES ($1,$2,$3)",
          [problemId, hint.hint_order, hint.hint_text]
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      message: "Problem added successfully",
      problemId
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({
      message: "Error adding problem",
      error: error.message
    });
  } finally {
    client.release();
  }
});

// ==============================
// DELETE FULL PROBLEM
// ==============================
router.delete("/problem/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // 1. Delete dependent data
    await client.query("DELETE FROM submissions WHERE problem_id = $1", [id]);
    await client.query("DELETE FROM test_cases WHERE problem_id = $1", [id]);
    await client.query("DELETE FROM hints WHERE problem_id = $1", [id]);
    await client.query("DELETE FROM solutions WHERE problem_id = $1", [id]);

    // 2. Delete the problem itself
    const result = await client.query(
      "DELETE FROM problems WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Problem not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "Problem and all associated data deleted successfully" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Error deleting problem", error: error.message });
  } finally {
    client.release();
  }
});

// ==============================
// ADD TEST CASE
// ==============================
router.post("/testcase", async (req, res) => {
  try {
    const { problemId, input, expected_output, display_input } = req.body;

    if (!problemId || input === undefined || expected_output === undefined) {
      return res.status(400).json({
        message: "problemId, input and expected_output are required"
      });
    }

    await pool.query(
      "INSERT INTO test_cases (problem_id, input, expected_output, display_input) VALUES ($1, $2, $3, $4)",
      [problemId, input, expected_output, display_input]
    );

    res.json({ message: "Test case added successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==============================
// ADD HINT
// ==============================
router.post("/hint", async (req, res) => {
  try {
    const { problemId, hint_text } = req.body;

    if (!problemId || !hint_text) {
      return res.status(400).json({
        message: "problemId and hint_text are required"
      });
    }

    const result = await pool.query(
      "SELECT COUNT(*) FROM hints WHERE problem_id = $1",
      [problemId]
    );

    const hintOrder = parseInt(result.rows[0].count) + 1;

    await pool.query(
      "INSERT INTO hints (problem_id, hint_order, hint_text) VALUES ($1, $2, $3)",
      [problemId, hintOrder, hint_text]
    );

    res.json({ message: "Hint added successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==============================
// DELETE TEST CASE
// ==============================
router.delete("/testcase/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM test_cases WHERE id = $1",
      [id]
    );

    res.json({ message: "Test case deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==============================
// DELETE HINT
// ==============================
router.delete("/hint/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM hints WHERE id = $1",
      [id]
    );

    res.json({ message: "Hint deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==============================
// GET FULL PROBLEM DATA (ADMIN VIEW)
// ==============================
router.get("/problem/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await pool.query(
      "SELECT * FROM problems WHERE id = $1",
      [id]
    );

    const testCases = await pool.query(
      "SELECT * FROM test_cases WHERE problem_id = $1 ORDER BY id",
      [id]
    );

    const hints = await pool.query(
      "SELECT * FROM hints WHERE problem_id = $1 ORDER BY hint_order",
      [id]
    );

    res.json({
      problem: problem.rows[0],
      testCases: testCases.rows,
      hints: hints.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// ==============================
// UPDATE PROBLEM
// ==============================
// ==============================
// UPDATE PROBLEM (Full Replace of details, test cases, hints)
// ==============================
router.put("/problem/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { problem, testCases, hints } = req.body;

    await client.query("BEGIN");

    // 1. Update main problem details
    await client.query(
      `UPDATE problems 
       SET title = $1, description = $2, input_format = $3, output_format = $4, 
           constraints = $5, difficulty = $6, tags = $7, source = $8, 
           is_validated = $9, reference_solution = $10
       WHERE id = $11`,
      [
        problem.title,
        problem.description,
        problem.input_format,
        problem.output_format,
        problem.constraints,
        problem.difficulty,
        problem.tags,
        problem.source,
        problem.is_validated,
        problem.reference_solution,
        id
      ]
    );

    // 2. Delete existing test cases
    await client.query("DELETE FROM test_cases WHERE problem_id = $1", [id]);

    // 3. Insert new test cases
    if (testCases && testCases.length > 0) {
      for (let test of testCases) {
        await client.query(
          "INSERT INTO test_cases (problem_id, input, expected_output, display_input) VALUES ($1,$2,$3,$4)",
          [id, test.input, test.expected_output, test.display_input]
        );
      }
    }

    // 4. Delete existing hints
    await client.query("DELETE FROM hints WHERE problem_id = $1", [id]);

    // 5. Insert new hints
    if (hints && hints.length > 0) {
      for (let hint of hints) {
        await client.query(
          "INSERT INTO hints (problem_id, hint_order, hint_text) VALUES ($1,$2,$3)",
          [id, hint.hint_order, hint.hint_text]
        );
      }
    }

    await client.query("COMMIT");

    res.json({ message: "Problem updated successfully" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error updating problem", error: error.message });
  } finally {
    client.release();
  }
});

// ==============================
// GET ADMIN SETTINGS (ADMIN VIEW)
// ==============================
router.get("/settings", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT value FROM app_settings WHERE key = 'admin_signup_code'"
    );
    const adminCode = result.rows.length > 0 ? result.rows[0].value : 'admin123';

    res.json({ adminCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==============================
// UPDATE ADMIN SETTINGS
// ==============================
router.put("/settings", async (req, res) => {
  try {
    const { adminCode } = req.body;

    if (!adminCode) {
      return res.status(400).json({ message: "adminCode is required" });
    }

    await pool.query(
      "INSERT INTO app_settings (key, value) VALUES ('admin_signup_code', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [adminCode]
    );

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating settings", error: error.message });
  }
});

module.exports = router;

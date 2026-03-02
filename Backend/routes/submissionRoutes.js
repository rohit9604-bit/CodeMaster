const express = require("express");
const router = express.Router();
const pool = require("../db");
const axios = require("axios");
const verifyToken = require("../middleware/authMiddleware");

const JUDGE0_URL = "https://ce.judge0.com/submissions";

// Normalize outputs for safe comparison
// Handles double-encoded JSON strings from DB (e.g. "\"4\"" vs raw stdout "4")
const normalize = (val) => {
  if (val === null || val === undefined) return "";
  let str = val.toString().trim();
  try {
    let parsed = JSON.parse(str);
    // If the parsed result is a string, try to unwrap one more layer
    // This handles cases where DB stores "\"4\"" (a JSON-encoded string "4")
    // while stdout gives raw "4"
    if (typeof parsed === 'string') {
      try {
        let inner = JSON.parse(parsed);
        return JSON.stringify(inner);
      } catch (e) {
        // It's genuinely a string value, return the raw string content
        return parsed.trim();
      }
    }
    return JSON.stringify(parsed);
  } catch (e) {
    return str.replace(/\s+/g, " ").replace(/^"|"$/g, "");
  }
};

router.get("/me/solved", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT DISTINCT problem_id FROM submissions WHERE user_id = $1 AND status = 'accepted'",
      [userId]
    );
    const solvedIds = result.rows.map(row => row.problem_id);
    return res.json(solvedIds);
  } catch (error) {
    console.error("GET SOLVED ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/me/problem/:problemId", verifyToken, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    // Get the latest submission regardless of status
    const result = await pool.query(
      "SELECT code, language FROM submissions WHERE user_id = $1 AND problem_id = $2 ORDER BY created_at DESC LIMIT 1",
      [userId, problemId]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("GET USER SUBMISSION ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/run", async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({
        message: "Missing problemId or code."
      });
    }

    const problem = await pool.query(
      "SELECT driver_code FROM problems WHERE id = $1",
      [problemId]
    );

    let finalCode = code;
    if (problem.rows.length > 0) {
      const driverCodeObj = problem.rows[0].driver_code;
      if (driverCodeObj && driverCodeObj[language?.toLowerCase()]) {
        finalCode = code + "\n" + driverCodeObj[language.toLowerCase()];
      }
    }

    // Language Mapping for Judge0
    const languageMap = {
      "python": 71,   // Python 3.8.1 (Judge0 ID)
      "javascript": 63, // Node.js 12.14.0
      "java": 62,     // OpenJDK 13.0.1
      "cpp": 54       // GCC 9.2.0
    };

    const languageId = languageMap[language?.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({
        message: `Unsupported language: ${language}`
      });
    }

    // Fetch test cases
    const tests = await pool.query(
      "SELECT input, display_input, expected_output FROM test_cases WHERE problem_id = $1",
      [problemId]
    );

    if (tests.rows.length === 0) {
      // If no test cases, maybe just run against a sample input if available, or error
      return res.status(400).json({
        message: "No test cases found."
      });
    }

    // Run against first test case only for "Run" functionality, or all? 
    // Usually "Run" runs against public test cases. Let's run against all for now but don't save submission.

    let finalStatus = "accepted";
    let firstFailedTest = null;
    let results = [];

    for (let i = 0; i < tests.rows.length; i++) {
      const test = tests.rows[i];
      const response = await axios.post(
        `${JUDGE0_URL}?base64_encoded=false&wait=true`,
        {
          source_code: finalCode,
          language_id: languageId,
          stdin: test.input
        }
      );

      const result = response.data;
      const output = normalize(result.stdout);
      const expected = normalize(test.expected_output);

      let status = "accepted";
      if (result.compile_output) status = "compilation_error";
      else if (result.stderr) status = "runtime_error";
      else if (output !== expected) status = "wrong_answer";

      results.push({
        input: test.input,
        display_input: test.display_input,
        expected: expected,
        output: output,
        status: status,
        error: result.stderr || result.compile_output
      });

      if (status !== "accepted") {
        finalStatus = status;
        if (!firstFailedTest) firstFailedTest = results[i];
      }
    }

    return res.json({
      status: finalStatus,
      results: results,
      message: finalStatus === "accepted" ? "All test cases passed!" : "Some test cases failed.",
      first_failed: firstFailedTest
    });

  } catch (error) {
    console.error("RUN ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// Existing submission route...
router.post("/", verifyToken, async (req, res) => {
  // ... existing implementation ...
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({
        message: "Missing problemId or code."
      });
    }

    // Language Mapping for Judge0
    const languageMap = {
      "python": 71,   // Python 3.8.1 (Judge0 ID)
      "javascript": 63, // Node.js 12.14.0
      "java": 62,     // OpenJDK 13.0.1
      "cpp": 54       // GCC 9.2.0
    };

    const languageId = languageMap[language?.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({
        message: `Unsupported language: ${language}`
      });
    }

    // Only allow validated problems
    const problem = await pool.query(
      "SELECT * FROM validated_problems WHERE id = $1",
      [problemId]
    );

    if (problem.rows.length === 0) {
      return res.status(404).json({
        message: "Problem not available or not validated yet."
      });
    }

    let finalCode = code;
    const driverCodeObj = problem.rows[0].driver_code;
    if (driverCodeObj && driverCodeObj[language?.toLowerCase()]) {
      finalCode = code + "\n" + driverCodeObj[language.toLowerCase()];
    }

    // Fetch test cases
    const tests = await pool.query(
      "SELECT input, display_input, expected_output FROM test_cases WHERE problem_id = $1",
      [problemId]
    );

    if (tests.rows.length === 0) {
      return res.status(400).json({
        message: "No test cases found."
      });
    }

    let finalStatus = "accepted";

    for (let test of tests.rows) {
      const response = await axios.post(
        `${JUDGE0_URL}?base64_encoded=false&wait=true`,
        {
          source_code: finalCode,
          language_id: languageId,
          stdin: test.input
        }
      );

      const result = response.data;

      // Compilation Error
      if (result.compile_output) {
        finalStatus = "compilation_error";
        break;
      }

      // Runtime Error
      if (result.stderr) {
        finalStatus = "runtime_error";
        break;
      }

      const output = normalize(result.stdout);
      const expected = normalize(test.expected_output);

      // Debug (optional)
      console.log("INPUT:", test.input);
      console.log("EXPECTED:", expected);
      console.log("OUTPUT:", output);
      console.log("------");

      if (output !== expected) {
        finalStatus = "wrong_answer";
        break;
      }
    }

    const difficultyMap = {
      Easy: 10,
      Medium: 20,
      Hard: 30
    };

    // Save submission and award points if accepted
    const difficulty = problem.rows[0].difficulty || "Easy";
    const pointsAwarded = difficultyMap[difficulty] || 10;

    // Check if the user has already solved this problem
    const previousSuccess = await pool.query(
      "SELECT id FROM submissions WHERE user_id = $1 AND problem_id = $2 AND status = 'accepted'",
      [req.user.id, problemId]
    );

    await pool.query(
      "INSERT INTO submissions(user_id, problem_id, code, language, status) VALUES ($1, $2, $3, $4, $5)",
      [req.user.id, problemId, code, language?.toLowerCase(), finalStatus]
    );

    if (finalStatus === "accepted" && previousSuccess.rows.length === 0) {
      await pool.query(
        "UPDATE users SET points = points + $1 WHERE id = $2",
        [pointsAwarded, req.user.id]
      );
    }

    // 1v1 Matchmaking check
    const { getActiveMatchByUserId, endMatch } = require("../matchmaking");
    const activeMatch = getActiveMatchByUserId(req.user.id);

    // Make sure we cast problemId to Number if needed, since db usually returns Number
    if (activeMatch && finalStatus === "accepted" && parseInt(problemId) === parseInt(activeMatch.problemId)) {
      const io = req.app.get('io');
      if (io) {
        io.to(activeMatch.id).emit("match_over", {
          winnerId: req.user.id,
          message: "Match Over! Winner determined."
        });
      }
      endMatch(activeMatch.id);
    }

    return res.json({
      status: finalStatus,
      points_awarded: (finalStatus === "accepted" && previousSuccess.rows.length === 0) ? pointsAwarded : 0
    });

  } catch (error) {
    console.error("SUBMISSION ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;

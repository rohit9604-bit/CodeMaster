require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        // Get all problems with starter/driver code
        const problems = await pool.query(`
      SELECT p.id, p.title, p.difficulty, p.starter_code, p.driver_code
      FROM problems p
      WHERE p.starter_code IS NOT NULL AND p.driver_code IS NOT NULL
      ORDER BY p.id
    `);

        // Get all test cases
        const testCases = await pool.query(`
      SELECT problem_id, input, display_input, expected_output
      FROM test_cases
      ORDER BY problem_id, id
      LIMIT 500
    `);

        // Group test cases by problem_id
        const tcByProblem = {};
        for (const tc of testCases.rows) {
            if (!tcByProblem[tc.problem_id]) tcByProblem[tc.problem_id] = [];
            tcByProblem[tc.problem_id].push(tc);
        }

        const output = [];
        for (const p of problems.rows) {
            const tcs = tcByProblem[p.id] || [];
            output.push({
                id: p.id,
                title: p.title,
                difficulty: p.difficulty,
                starter_python: p.starter_code?.python || null,
                driver_python: p.driver_code?.python || null,
                test_cases: tcs.slice(0, 3).map(t => ({
                    input: t.input,
                    display_input: t.display_input,
                    expected_output: t.expected_output
                }))
            });
        }

        fs.writeFileSync('problem_schemas.json', JSON.stringify(output, null, 2));
        console.log(`Wrote ${output.length} problems to problem_schemas.json`);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

main();

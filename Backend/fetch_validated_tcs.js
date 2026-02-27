const pool = require('./db');
const fs = require('fs');

async function check() {
    try {
        const probs = await pool.query(`SELECT id, title, is_validated, input_format, starter_code FROM problems WHERE is_validated = true`);
        const pIds = probs.rows.map(p => p.id);

        let testcases = [];
        if (pIds.length > 0) {
            const tcQuery = await pool.query(`SELECT * FROM test_cases WHERE problem_id = ANY($1)`, [pIds]);
            testcases = tcQuery.rows;
        }

        fs.writeFileSync('validated_testcases.json', JSON.stringify({
            problems: probs.rows,
            testcases: testcases
        }, null, 2));

        console.log("Wrote validated_testcases.json");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
check();

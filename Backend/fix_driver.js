require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        // 1. Fix driver code for problem 15 - remove duplicate Solution class with Python 3.9+ type hints
        const newDriver = `import sys, json

if __name__ == '__main__':
    args = json.loads(sys.stdin.read().strip())
    V = args[0]
    edges = args[1]
    res = Solution().shortestPathDAG(V, edges)
    print(json.dumps(res, separators=(',', ':')))`;

        const r1 = await pool.query(
            `UPDATE problems SET driver_code = jsonb_set(driver_code, '{python}', $1::jsonb) WHERE id = 15`,
            [JSON.stringify(newDriver)]
        );
        console.log('Fixed driver code, rows:', r1.rowCount);

        // 2. Fix starter code - remove Python 3.9+ type hints
        const newStarter = `class Solution:
    def shortestPathDAG(self, V, edges):
        # code here
        pass`;

        const r2 = await pool.query(
            `UPDATE problems SET starter_code = jsonb_set(starter_code, '{python}', $1::jsonb) WHERE id = 15`,
            [JSON.stringify(newStarter)]
        );
        console.log('Fixed starter code, rows:', r2.rowCount);

        // 3. Fix test case 2 - expected should be 5 (shortest to V-1=4), not 3
        const r3 = await pool.query(
            `UPDATE test_cases SET expected_output = $1 WHERE problem_id = 15 AND input = $2`,
            ['"5"', '[5, [[0, 1, 2], [0, 2, 4], [1, 3, 7], [2, 4, 1], [4, 3, -2]]]']
        );
        console.log('Fixed test case 2 expected output, rows:', r3.rowCount);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

main();

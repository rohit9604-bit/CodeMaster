const pool = require('./db');

function extractParams(jsCode) {
    if (!jsCode) return [];

    // Match var funcName = function(a, b)
    let match = jsCode.match(/function\s*\(([^)]*)\)/);
    if (!match) {
        // Match const/let/var funcName = (a, b) =>
        match = jsCode.match(/=\s*\(([^)]*)\)\s*=>/);
    }
    if (!match) {
        // Match function funcName(a, b)
        match = jsCode.match(/function\s+\w+\s*\(([^)]*)\)/);
    }

    if (match && match[1]) {
        return match[1].split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
}

function formatDisplayInput(tcInput, starterCode) {
    try {
        let parsed;
        try {
            parsed = JSON.parse(tcInput);
        } catch (e) {
            return tcInput;
        }

        const params = (starterCode && starterCode.javascript) ? extractParams(starterCode.javascript) : [];

        if (Array.isArray(parsed)) {
            if (params.length === parsed.length && params.length > 0) {
                let lines = [];
                for (let i = 0; i < params.length; i++) {
                    lines.push(`${params[i]} = ${JSON.stringify(parsed[i])}`);
                }
                return lines.join('\\n');
            } else if (parsed.length === 1 && params.length === 1) {
                return `${params[0]} = ${JSON.stringify(parsed[0])}`;
            } else if (parsed.length > 1) {
                let lines = [];
                for (let i = 0; i < parsed.length; i++) {
                    lines.push(`arg${i + 1} = ${JSON.stringify(parsed[i])}`);
                }
                return lines.join('\\n');
            } else if (parsed.length === 1) {
                return `input = ${JSON.stringify(parsed[0])}`;
            }
            return JSON.stringify(parsed);
        }

        if (typeof parsed === 'object') {
            return JSON.stringify(parsed, null, 2);
        }

        return String(parsed);
    } catch (e) {
        return tcInput;
    }
}

async function run() {
    try {
        const probs = await pool.query('SELECT id, starter_code FROM problems WHERE is_validated = true');
        const probMap = {};
        probs.rows.forEach(p => probMap[p.id] = p.starter_code);

        const tcs = await pool.query('SELECT id, problem_id, input FROM test_cases');

        let updated = 0;
        for (let tc of tcs.rows) {
            const sc = probMap[tc.problem_id];

            // If the problem is not validated, probMap[tc.problem_id] will be undefined, but we format it anyway
            const formatted = formatDisplayInput(tc.input, sc);

            await pool.query('UPDATE test_cases SET display_input = $1 WHERE id = $2', [formatted, tc.id]);
            updated++;
        }
        console.log(`Successfully updated ${updated} test cases with display_input`);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();

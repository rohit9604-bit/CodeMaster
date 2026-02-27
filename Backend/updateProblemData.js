const pool = require("./db");

const updates = {
    2: {
        constraints: "- -10^9 <= a, b <= 10^9",
        input_format: "Two integers a and b.",
        output_format: "An integer representing the sum of a and b."
    },
    12: {
        constraints: "- 1 <= V <= 10^4\n- 0 <= E <= 10^5",
        input_format: "First line: V (vertices) and E (edges).\nNext E lines: u v, representing an edge between u and v.",
        output_format: "True if cycle exists, False otherwise."
    },
    13: {
        constraints: "- 1 <= V <= 2000\n- 0 <= E <= 10000\n- 0 <= Weight <= 1000",
        input_format: "V E\nNext E lines: u v w",
        output_format: "Shortest distance from src to dest."
    },
    14: {
        constraints: "- 1 <= V <= 10^5\n- 0 <= E <= 10^5",
        input_format: "V E\nNext E lines: u v",
        output_format: "Number of connected components."
    },
    25: {
        constraints: "- 0 <= s.length <= 5 * 10^4",
        input_format: "A string s.",
        output_format: "An integer representing the length of the longest substring."
    },
    27: {
        constraints: "- 1 <= s.length <= 10^5\n- s consists of only lowercase English letters.",
        input_format: "A string s.",
        output_format: "The index of the first unique character, or -1."
    },
    48: {
        constraints: "- 1 <= nums.length <= 2 * 10^4\n- -1000 <= nums[i] <= 1000\n- -10^7 <= k <= 10^7",
        input_format: "An array of integers nums and an integer k.",
        output_format: "The count of subarrays summing to k."
    },
    49: {
        constraints: "- 1 <= s.length <= 10^5",
        input_format: "A string s.",
        output_format: "The reversed string."
    },
    51: {
        constraints: "- 1 <= s.length <= 2 * 10^5",
        input_format: "A string s.",
        output_format: "True if palindrome, False otherwise."
    },
    52: {
        constraints: "- 1 <= s.length, p.length <= 3 * 10^4",
        input_format: "Two strings s and p.",
        output_format: "An array of starting indices."
    },
    53: {
        constraints: "- 1 <= strs.length <= 10^4\n- 0 <= strs[i].length <= 100",
        input_format: "An array of strings strs.",
        output_format: "A list of lists of anagram groups."
    },
    56: {
        constraints: "- 1 <= nums.length <= 10^4\n- -10^4 <= nums[i], target <= 10^4",
        input_format: "Sorted array nums and integer target.",
        output_format: "Index of target or -1."
    },
    70: {
        constraints: "- -100.0 < x < 100.0\n- -2^31 <= n <= 2^31-1",
        input_format: "Float x and integer n.",
        output_format: "Result of x^n."
    },
    80: {
        constraints: "- 1 <= n <= 45",
        input_format: "Integer n.",
        output_format: "Number of ways to climb."
    },
    81: {
        constraints: "- 1 <= nums.length <= 100\n- 0 <= nums[i] <= 400",
        input_format: "Array of non-negative integers.",
        output_format: "Maximum money you can rob."
    },
    102: {
        constraints: "- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- 1 <= k <= nums.length",
        input_format: "Array nums and integer k.",
        output_format: "Array of max element in each window."
    },
    120: {
        constraints: "- 0 <= n <= 20",
        input_format: "Integer n.",
        output_format: "Factorial of n."
    }
};

const defaultUpdate = {
    constraints: "Time Limit: 1-2s\nMemory Limit: 256MB\nStandard input/output constraints apply based on complexity.",
    input_format: "See problem description for details.",
    output_format: "See problem description for details."
};

async function updateProblems() {
    const client = await pool.connect();
    try {
        const problemsRes = await client.query("SELECT id FROM problems");
        const problems = problemsRes.rows;

        console.log(`Found ${problems.length} problems.`);

        for (let prob of problems) {
            const id = prob.id;
            let data = updates[id] || defaultUpdate;

            // If specific update exists, use it. 
            // If not, check if we should apply default (only if current is null?)
            // The user asked to "add them", implying overwrite or fill missing. 
            // I'll overwrite if likely missing (which visual inspection confirmed for many).
            // However, to be safe, I will stick to my dictionary for detailed ones,
            // and for others, I will apply the default generic text if it's currently null.

            // Let's check current value first
            const currentRes = await client.query("SELECT constraints FROM problems WHERE id = $1", [id]);
            const current = currentRes.rows[0];

            if (updates[id]) {
                await client.query(
                    "UPDATE problems SET constraints = $1, input_format = $2, output_format = $3 WHERE id = $4",
                    [data.constraints, data.input_format, data.output_format, id]
                );
                console.log(`Updated Problem ${id} with specific data.`);
            } else if (!current.constraints) {
                await client.query(
                    "UPDATE problems SET constraints = $1, input_format = $2, output_format = $3 WHERE id = $4",
                    [defaultUpdate.constraints, defaultUpdate.input_format, defaultUpdate.output_format, id]
                );
                console.log(`Updated Problem ${id} with default data.`);
            }
        }
        console.log("Update complete.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        client.release();
    }
}

updateProblems();

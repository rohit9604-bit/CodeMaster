const pool = require('./db');

async function main() {
    const client = await pool.connect();
    try {
        console.log("Setting up app_settings table...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS app_settings (
                key VARCHAR(255) PRIMARY KEY,
                value TEXT NOT NULL
            );
        `);

        // Check if the admin passcode already exists
        const check = await client.query(`SELECT value FROM app_settings WHERE key = 'admin_signup_code'`);
        if (check.rows.length === 0) {
            console.log("Seeding default admin passcode...");
            await client.query(
                `INSERT INTO app_settings (key, value) VALUES ($1, $2)`,
                ['admin_signup_code', 'admin123']
            );
        } else {
            console.log("Admin passcode already seeded.");
        }

        console.log("Database update successful!");
    } catch (e) {
        console.error("Error setting up app_settings table:", e);
    } finally {
        client.release();
        process.exit(0);
    }
}
main();

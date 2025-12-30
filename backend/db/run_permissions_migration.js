const db = require('./index');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, 'add_tutorial_permissions.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await db.query(sql);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();

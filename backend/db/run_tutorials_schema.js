const db = require('./index');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function runTutorialsSchema() {
    try {
        const schemaPath = path.join(__dirname, 'schema_tutorials.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        logger.info('Running Tutorials Schema Migration...');
        await db.query(schemaSql);
        logger.success('Tutorials Schema Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        logger.error('Error running Tutorials Schema Migration:', error);
        process.exit(1);
    }
}

runTutorialsSchema();

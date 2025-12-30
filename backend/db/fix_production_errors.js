const db = require('./index');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function fixProductionErrors() {
    try {
        logger.info('Starting Production Database Fix...');

        // 1. Fix Tutorials Schema
        try {
            const tutorialsSchemaPath = path.join(__dirname, 'schema_tutorials.sql');
            if (fs.existsSync(tutorialsSchemaPath)) {
                logger.info('Running Tutorials Schema Migration...');
                const tutorialsSql = fs.readFileSync(tutorialsSchemaPath, 'utf8');
                await db.query(tutorialsSql);
                logger.success('Tutorials tables verified/created successfully.');
            } else {
                logger.error('schema_tutorials.sql not found!');
            }
        } catch (err) {
            logger.error('Error migrating public tutorials:', err);
        }

        // 2. Fix Analytics Schema
        try {
            const analyticsSchemaPath = path.join(__dirname, 'schema_analytics.sql');
            if (fs.existsSync(analyticsSchemaPath)) {
                logger.info('Running Analytics Schema Migration...');
                const analyticsSql = fs.readFileSync(analyticsSchemaPath, 'utf8');
                await db.query(analyticsSql);
                logger.success('Analytics tables verified/created successfully.');
            } else {
                logger.error('schema_analytics.sql not found!');
            }
        } catch (err) {
            logger.error('Error migrating analytics:', err);
        }

        logger.success('Fix script completed. Please restart the backend if necessary.');
        process.exit(0);
    } catch (error) {
        logger.error('Critical error in fix script:', error);
        process.exit(1);
    }
}

fixProductionErrors();

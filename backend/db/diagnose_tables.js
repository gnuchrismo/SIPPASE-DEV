const db = require('./index');

async function diagnose() {
    try {
        console.log('--- DIAGNOSIS START ---');
        
        // 1. Check current user
        try {
            const userRes = await db.query('SELECT current_user, current_database(), inet_server_addr()');
            console.log('Connected as:', JSON.stringify(userRes.rows[0]));
        } catch (e) {
            console.error('Error getting user info:', e.message);
        }

        const tablesToCheck = ['cms_tutorials', 'page_visits', 'visitor_sessions'];

        for (const tableName of tablesToCheck) {
            console.log(`\n--- Checking table: ${tableName} ---`);
            
            // 2. Check schema/columns
            try {
                const cols = await db.query(`
                    SELECT column_name, data_type, is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = $1
                    ORDER BY ordinal_position
                `, [tableName]);
                
                if (cols.rows.length === 0) {
                    console.error(`!! Table ${tableName} NOT FOUND in information_schema !!`);
                } else {
                    console.log(`Columns found (${cols.rows.length}):`);
                    cols.rows.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));
                }
            } catch (e) {
                console.error(`Error reading schema for ${tableName}:`, e.message);
            }

            // 3. Check SELECT permission
            try {
                const count = await db.query(`SELECT count(*) FROM ${tableName}`);
                console.log(`SELECT Check: SUCCESS. Row count: ${count.rows[0].count}`);
            } catch (e) {
                console.error(`SELECT Check: FAILED. Error: ${e.message}`);
            }
            
            // 4. Check Owner (if possible)
            try {
                const ownerRes = await db.query(`
                    SELECT tableowner 
                    FROM pg_tables 
                    WHERE tablename = $1
                `, [tableName]);
                if (ownerRes.rows.length > 0) {
                    console.log(`Table Owner: ${ownerRes.rows[0].tableowner}`);
                }
            } catch(e) {
                 console.log('Could not determine owner:', e.message);
            }
        }

        console.log('\n--- DIAGNOSIS END ---');
        process.exit(0);
    } catch (e) {
        console.error('CRITICAL DIAGNOSIS ERROR:', e);
        process.exit(1);
    }
}

diagnose();

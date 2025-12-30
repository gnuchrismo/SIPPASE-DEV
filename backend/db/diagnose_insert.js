const db = require('./index');

async function diagnoseInsert() {
    try {
        console.log('--- INSERT DIAGNOSIS START ---');
        
        const timestamp = new Date().toISOString();
        const testSessionId = 'test_diag_' + Date.now();

        console.log('Attempting INSERT into page_visits...');
        
        try {
            await db.query(`
                INSERT INTO page_visits 
                (url, page_title, session_id, visited_at, user_agent, ip_address)
                VALUES ($1, $2, $3, NOW(), 'Diagnostic Script', '127.0.0.1')
                RETURNING id
            `, ['/test-diagnosis', 'Diagnosis Test', testSessionId]);
            
            console.log('✅ INSERT page_visits: SUCCESS');
            
            // Cleanup
            await db.query(`DELETE FROM page_visits WHERE session_id = $1`, [testSessionId]);
            console.log('Cleanup successful.');

        } catch (err) {
            console.error('❌ INSERT page_visits FAILED!');
            console.error('Error Code:', err.code);
            console.error('Error Message:', err.message);
            if (err.detail) console.error('Error Detail:', err.detail);
            if (err.hint) console.error('Error Hint:', err.hint);
        }

        console.log('\n--- INSERT DIAGNOSIS END ---');
        process.exit(0);
    } catch (e) {
        console.error('CRITICAL ERROR:', e);
        process.exit(1);
    }
}

diagnoseInsert();

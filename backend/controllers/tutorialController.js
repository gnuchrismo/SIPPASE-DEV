const db = require('../db');
const logger = require('../utils/logger');

// Get all tutorials (with filters)
exports.getAllTutorials = async (req, res, next) => {
    try {
        const { status, category_id, search } = req.query;
        let query = `
            SELECT t.*, u.username as author_name 
            FROM cms_tutorials t
            LEFT JOIN users u ON t.created_by = u.id
            WHERE t.deleted_at IS NULL
        `;
        const params = [];
        let paramIndex = 1;

        if (status) {
            query += ` AND t.status = $${paramIndex++}`;
            params.push(status);
        }

        if (category_id) {
            query += ` AND t.category_id = $${paramIndex++}`;
            params.push(category_id);
        }

        if (search) {
            query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY t.created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Get single tutorial by ID or Slug (with modules and lessons)
exports.getTutorial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isNumeric = !isNaN(id);
        
        let query = `
            SELECT t.*, u.username as author_name 
            FROM cms_tutorials t
            LEFT JOIN users u ON t.created_by = u.id
            WHERE t.deleted_at IS NULL
        `;
        
        const params = [id];
        if (isNumeric) {
            query += ` AND t.id = $1`;
        } else {
            query += ` AND t.slug = $1`;
        }

        const tutorialResult = await db.query(query, params);
        const tutorial = tutorialResult.rows[0];

        if (!tutorial) {
            return res.status(404).json({ message: 'Tutorial not found' });
        }

        // Fetch modules and lessons
        const modulesResult = await db.query(`
            SELECT m.*, 
                (
                    SELECT json_agg(l ORDER BY l.order_index ASC)
                    FROM cms_tutorial_lessons l
                    WHERE l.module_id = m.id AND l.deleted_at IS NULL
                ) as lessons
            FROM cms_tutorial_modules m
            WHERE m.tutorial_id = $1 AND m.deleted_at IS NULL
            ORDER BY m.order_index ASC
        `, [tutorial.id]);

        tutorial.modules = modulesResult.rows;

        // Public Access Logic:
        // If tutorial is public, we allow access. If authentication is missing, we just return the public data.
        // If not public, and no user, we should probably return limited data or 403 (but frontend requested "viewable").
        // We will return data, and Frontend will handle the "Locked" UI overlay for non-public content if user not enrolled/logged in.
        
        // If user is authenticated, fetch progress
        if (req.user) {
            const enrollmentResult = await db.query(`
                SELECT * FROM cms_tutorial_enrollments 
                WHERE user_id = $1 AND tutorial_id = $2
            `, [req.user.id, tutorial.id]);
            
            tutorial.user_enrollment = enrollmentResult.rows[0] || null;

            // Fetch progress map
            if (tutorial.user_enrollment) {
                 const progressResult = await db.query(`
                    SELECT lesson_id, is_completed 
                    FROM cms_tutorial_progress 
                    WHERE enrollment_id = $1
                `, [tutorial.user_enrollment.id]);
                tutorial.user_progress = progressResult.rows;
            }
        }

        res.json(tutorial);
    } catch (error) {
        next(error);
    }
};

// Create Tutorial
exports.createTutorial = async (req, res, next) => {
    try {
        const { title, slug, description, category_id, status, cover_image, is_public } = req.body;
        
        const result = await db.query(`
            INSERT INTO cms_tutorials (title, slug, description, category_id, status, cover_image, is_public, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [title, slug, description, category_id || null, status || 'draft', cover_image, is_public || false, req.user.id]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Update Tutorial
exports.updateTutorial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, slug, description, category_id, status, cover_image, is_public } = req.body;

        const result = await db.query(`
            UPDATE cms_tutorials 
            SET title = $1, slug = $2, description = $3, category_id = $4, status = $5, cover_image = $6, is_public = $7, updated_at = CURRENT_TIMESTAMP
            WHERE id = $8 AND deleted_at IS NULL
            RETURNING *
        `, [title, slug, description, category_id, status, cover_image, is_public, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tutorial not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Delete Tutorial (Soft delete)
exports.deleteTutorial = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query(`
            UPDATE cms_tutorials SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1
        `, [req.params.id]);
        res.json({ message: 'Tutorial deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// --- Module Management ---

exports.createModule = async (req, res, next) => {
    try {
        const { tutorial_id, title, description, order_index } = req.body;
        const result = await db.query(`
            INSERT INTO cms_tutorial_modules (tutorial_id, title, description, order_index)
            VALUES ($1, $2, $3, $4) RETURNING *
        `, [tutorial_id, title, description, order_index]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

exports.updateModule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, order_index } = req.body;
        const result = await db.query(`
            UPDATE cms_tutorial_modules SET title = $1, description = $2, order_index = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 RETURNING *
        `, [title, description, order_index, id]);
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

exports.deleteModule = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query(`UPDATE cms_tutorial_modules SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
        res.json({ message: 'Module deleted' });
    } catch (error) {
        next(error);
    }
};

// --- Lesson Management ---

exports.createLesson = async (req, res, next) => {
    try {
        const { module_id, title, type, content, media_url, duration_seconds, order_index } = req.body;
        const result = await db.query(`
            INSERT INTO cms_tutorial_lessons (module_id, title, type, content, media_url, duration_seconds, order_index)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `, [module_id, title, type, content, media_url, duration_seconds, order_index]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

exports.updateLesson = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, type, content, media_url, duration_seconds, order_index } = req.body;
        const result = await db.query(`
            UPDATE cms_tutorial_lessons 
            SET title = $1, type = $2, content = $3, media_url = $4, duration_seconds = $5, order_index = $6, updated_at = CURRENT_TIMESTAMP
            WHERE id = $7 RETURNING *
        `, [title, type, content, media_url, duration_seconds, order_index, id]);
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

exports.deleteLesson = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query(`UPDATE cms_tutorial_lessons SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
        res.json({ message: 'Lesson deleted' });
    } catch (error) {
        next(error);
    }
};

// --- Progress Tracking ---

exports.updateProgress = async (req, res, next) => {
    try {
        // This endpoint updates progress for a specific lesson
        const { lesson_id, time_watched_seconds, is_completed } = req.body;
        const user_id = req.user.id;

        // 1. Get tutorial ID for this lesson
        const lessonRes = await db.query(`
            SELECT m.tutorial_id 
            FROM cms_tutorial_lessons l
            JOIN cms_tutorial_modules m ON l.module_id = m.id
            WHERE l.id = $1
        `, [lesson_id]);
        
        if (lessonRes.rows.length === 0) return res.status(404).json({message: 'Lesson not found'});
        const tutorial_id = lessonRes.rows[0].tutorial_id;

        // 2. Ensure enrollment exists
        let enrollmentRes = await db.query(`
            SELECT id FROM cms_tutorial_enrollments WHERE user_id = $1 AND tutorial_id = $2
        `, [user_id, tutorial_id]);

        let enrollment_id;
        if (enrollmentRes.rows.length === 0) {
            const newEnrollment = await db.query(`
                INSERT INTO cms_tutorial_enrollments (user_id, tutorial_id) VALUES ($1, $2) RETURNING id
            `, [user_id, tutorial_id]);
            enrollment_id = newEnrollment.rows[0].id;
        } else {
            enrollment_id = enrollmentRes.rows[0].id;
        }

        // 3. Upsert progress
        await db.query(`
            INSERT INTO cms_tutorial_progress (enrollment_id, lesson_id, time_spent_seconds, is_completed, completed_at, last_position_seconds)
            VALUES ($1, $2, $3, $4, CASE WHEN $4::boolean THEN CURRENT_TIMESTAMP ELSE NULL END, $3)
            ON CONFLICT (enrollment_id, lesson_id) 
            DO UPDATE SET 
                time_spent_seconds = EXCLUDED.time_spent_seconds,
                is_completed = EXCLUDED.is_completed,
                completed_at = CASE WHEN EXCLUDED.is_completed AND cms_tutorial_progress.completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE cms_tutorial_progress.completed_at END,
                last_position_seconds = EXCLUDED.last_position_seconds,
                updated_at = CURRENT_TIMESTAMP
        `, [enrollment_id, lesson_id, time_watched_seconds, is_completed]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

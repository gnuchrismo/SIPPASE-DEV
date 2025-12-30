const express = require('express');
const router = express.Router();
const tutorialController = require('../controllers/tutorialController');
const { authenticateToken: verifyToken, checkPermission } = require('../middleware/authMiddleware');

// Public/Semi-public routes (Reading)
router.get('/', tutorialController.getAllTutorials);
router.get('/:id', verifyToken, tutorialController.getTutorial); // Require login to see partial details/enrollment? Or maybe public? Let's keep it simple: Public listing, Login for details to track progress.

// Admin Routes (Management)
router.post('/', verifyToken, checkPermission('tutorial.create'), tutorialController.createTutorial);
router.put('/:id', verifyToken, checkPermission('tutorial.edit'), tutorialController.updateTutorial);
router.delete('/:id', verifyToken, checkPermission('tutorial.delete'), tutorialController.deleteTutorial);

// Module Management
router.post('/modules', verifyToken, checkPermission('tutorial.edit'), tutorialController.createModule);
router.put('/modules/:id', verifyToken, checkPermission('tutorial.edit'), tutorialController.updateModule);
router.delete('/modules/:id', verifyToken, checkPermission('tutorial.edit'), tutorialController.deleteModule);

// Lesson Management
router.post('/lessons', verifyToken, checkPermission('tutorial.edit'), tutorialController.createLesson);
router.put('/lessons/:id', verifyToken, checkPermission('tutorial.edit'), tutorialController.updateLesson);
router.delete('/lessons/:id', verifyToken, checkPermission('tutorial.edit'), tutorialController.deleteLesson);

// Progress Tracking (User)
router.post('/progress', verifyToken, tutorialController.updateProgress);

module.exports = router;

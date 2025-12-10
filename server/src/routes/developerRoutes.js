const express = require('express');
const router = express.Router();
// Assuming you already have the developerLogin logic here...
const { developerLogin } = require('../controllers/developerContentController'); // Example, adjust import if needed
const devController = require('../controllers/developerContentController');

// --- PUBLIC ROUTE (Login Check) ---
router.post('/login', devController.developerLogin); // Existing login route

// --- PROTECTED CRUD ROUTES ---

// All these routes should use the token verification middleware (ensureDevToken)
router.use(devController.ensureDevToken); 

// READ: Get all content for public display/editing
router.get('/content', devController.getDevContent); 


// WRITE: Update a specific section's entire content array (used by the dashboard editor's save function)
router.post('/content/update', devController.updateDevContent); 

// DELETE: Delete a single item by index from an array section
router.delete('/content/:section/:index', devController.deleteDevItem); 

module.exports = router;
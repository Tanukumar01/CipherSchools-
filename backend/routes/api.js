import express from 'express';
import { 
  listAssignments, 
  getAssignment, 
  executeQuery, 
  getAssignmentHint 
} from '../controllers/assignmentController.js';

const router = express.Router();

/**
 * API ROUTES
 * 
 * RESTful endpoints for the CipherSQLStudio platform
 */

// Assignment listing and details
router.get('/assignments', listAssignments);
router.get('/assignments/:id', getAssignment);

// Query execution (sandboxed)
router.post('/assignments/:id/execute', executeQuery);

// Hint generation (LLM-powered)
router.post('/assignments/:id/hint', getAssignmentHint);

export default router;

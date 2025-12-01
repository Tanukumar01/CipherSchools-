import Assignment from '../models/Assignment.js';
import { validateQuery } from '../services/queryValidator.js';
import { executeSandboxQuery } from '../services/dbService.js';
import { getHint, getFallbackHint } from '../services/llmService.js';

/**
 * ASSIGNMENT CONTROLLER
 * Handles all assignment-related endpoints
 */

/**
 * GET /api/assignments
 * List all available assignments
 */
export const listAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .select('_id title difficulty shortDescription')
      .sort({ difficulty: 1, title: 1 });

    res.json(assignments.map(a => ({
      id: a._id,
      title: a.title,
      difficulty: a.difficulty,
      shortDescription: a.shortDescription
    })));
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

/**
 * GET /api/assignments/:id
 * Get detailed assignment information including schema and sample data
 */
export const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      id: assignment._id,
      title: assignment.title,
      difficulty: assignment.difficulty,
      question: assignment.question,
      sampleSchemas: assignment.sampleSchemas
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment details' });
  }
};

/**
 * POST /api/assignments/:id/execute
 * Execute a SQL query against the sandbox database
 * 
 * Request body: { sql: string }
 * Response: { success: boolean, rows: [], fields: [], rowCount: number, error: string|null }
 */
export const executeQuery = async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql) {
      return res.status(400).json({ 
        success: false, 
        error: 'SQL query is required',
        rows: [],
        fields: []
      });
    }

    // Step 1: Validate the query (security checks)
    const validation = validateQuery(sql);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        rows: [],
        fields: []
      });
    }

    // Step 2: Execute the validated and sanitized query
    const result = await executeSandboxQuery(validation.sanitizedSql);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        rows: [],
        fields: []
      });
    }

    // Step 3: Return results
    res.json({
      success: true,
      rows: result.rows,
      fields: result.fields,
      rowCount: result.rowCount,
      error: null
    });

  } catch (error) {
    console.error('Execute query error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while executing your query',
      rows: [],
      fields: []
    });
  }
};

/**
 * POST /api/assignments/:id/hint
 * Get an AI-generated hint for the assignment
 * 
 * Request body: { sql: string|null, hintLevel: 'low'|'medium'|'high' }
 * Response: { hint: string, nextSteps: [], explainWhy: string, error: string|null }
 */
export const getAssignmentHint = async (req, res) => {
  try {
    const { sql, hintLevel } = req.body;
    const assignmentId = req.params.id;

    // Validate hint level
    const validLevels = ['low', 'medium', 'high'];
    const level = validLevels.includes(hintLevel) ? hintLevel : 'low';

    // Fetch assignment context
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ 
        error: 'Assignment not found',
        hint: null,
        nextSteps: [],
        explainWhy: null
      });
    }

    // Prepare assignment context for LLM
    const assignmentContext = {
      title: assignment.title,
      question: assignment.question,
      sampleSchemas: assignment.sampleSchemas
    };

    // Generate hint using LLM
    const hintResult = await getHint(assignmentContext, sql || '', level);

    if (hintResult.error) {
      // Fallback to generic hint if LLM fails
      const fallback = getFallbackHint(assignmentContext);
      return res.json(fallback);
    }

    res.json({
      hint: hintResult.hint,
      nextSteps: hintResult.nextSteps,
      explainWhy: hintResult.explainWhy,
      error: null
    });

  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({
      error: 'Failed to generate hint',
      hint: null,
      nextSteps: [],
      explainWhy: null
    });
  }
};

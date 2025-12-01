import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * LLM SERVICE FOR HINT GENERATION
 * 
 * CRITICAL REQUIREMENT: Never provide full SQL solutions
 * Always return hints, conceptual guidance, and non-runnable pseudo-code
 * 
 * Provider: OpenAI (configurable via LLM_PROVIDER env var)
 */

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY && LLM_PROVIDER === 'openai') {
  console.warn('Warning: OPENAI_API_KEY not set. Hint functionality will not work.');
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/**
 * System prompt that enforces hint-only responses
 * This is prepended to every LLM request
 */
const SYSTEM_PROMPT = `You are a hint-only assistant for a SQL learning platform. 

Your role is to provide high-level guidance, debugging tips, and conceptual hints to help students learn SQL. 

CRITICAL RULES:
1. NEVER provide full, runnable SQL queries
2. If the user asks for the full solution, politely refuse and offer step-by-step conceptual hints instead
3. Provide guidance using pseudo-code, English descriptions, or partial SQL patterns (not complete queries)
4. Focus on teaching concepts rather than giving answers

Always respond in valid JSON format:
{
  "hint": "<one paragraph high-level hint addressing the student's current approach>",
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"],
  "explainWhy": "<one sentence explaining the reasoning behind this advice>"
}

Do not include any text outside the JSON structure.`;

/**
 * Generate a hint for a SQL assignment
 * @param {Object} assignmentContext - Assignment metadata (title, schema, etc.)
 * @param {string} userQuery - The student's current SQL attempt (can be empty)
 * @param {string} hintLevel - 'low' | 'medium' | 'high' (how detailed the hint should be)
 * @returns {Promise<Object>} { hint, nextSteps, explainWhy } or error
 */
export const getHint = async (assignmentContext, userQuery, hintLevel = 'low') => {
  if (!openai) {
    return {
      error: 'LLM service is not configured. Please set OPENAI_API_KEY in your environment.',
      hint: null,
      nextSteps: [],
      explainWhy: null
    };
  }

  try {
    // Construct the user prompt with assignment context
    const userPrompt = JSON.stringify({
      assignmentTitle: assignmentContext.title,
      assignmentQuestion: assignmentContext.question,
      schema: assignmentContext.sampleSchemas.map(s => ({
        table: s.table,
        columns: s.columns
      })),
      userQuery: userQuery || '(student has not submitted a query yet)',
      hintLevel: hintLevel,
      instruction: hintLevel === 'low' 
        ? 'Provide a very high-level hint about the approach'
        : hintLevel === 'medium'
        ? 'Provide a medium-detail hint with conceptual guidance'
        : 'Provide a detailed hint with pseudocode, but still no runnable SQL'
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' } // Enforce JSON response
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Validate response structure
    if (!parsed.hint || !parsed.nextSteps || !parsed.explainWhy) {
      throw new Error('Invalid LLM response structure');
    }

    return {
      hint: parsed.hint,
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      explainWhy: parsed.explainWhy,
      error: null
    };

  } catch (error) {
    console.error('LLM hint generation error:', error);
    return {
      error: 'Failed to generate hint. Please try again.',
      hint: null,
      nextSteps: [],
      explainWhy: null
    };
  }
};

/**
 * Backup hint generator (if LLM is unavailable)
 * Returns generic helpful hints based on assignment metadata
 */
export const getFallbackHint = (assignmentContext) => {
  const tables = assignmentContext.sampleSchemas.map(s => s.table).join(', ');
  
  return {
    hint: `This assignment involves the following tables: ${tables}. Try to break down the problem into smaller steps.`,
    nextSteps: [
      'Review the table schemas carefully',
      'Identify which columns you need to SELECT',
      'Consider if you need to JOIN multiple tables',
      'Think about any filtering (WHERE) or grouping (GROUP BY) needed'
    ],
    explainWhy: 'These are general SQL query construction steps',
    error: null
  };
};

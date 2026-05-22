import express from 'express';
import { 
  generateResponse, 
  getAIProjectSummary, 
  getAIRiskAnalysis,
  handleAIChat,
  getSmartActions,
  testSummarizeProject,
  testGeminiAPI
} from '../controllers/aiController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/ai/test
 * @desc    Test connection with Gemini 2.5 Flash
 * @access  Public
 */
router.get('/test', testGeminiAPI);

// Secure subsequent AI generation routes
router.use(protect);

/**
 * @route   POST /api/ai/generate
 * @desc    Generate generic text output via Google Gemini
 * @access  Private
 */
router.post('/generate', generateResponse);

/**
 * @route   GET /api/ai/project-summary
 * @desc    Generate dynamic AI executive summaries of MongoDB portfolio statistics
 * @access  Private
 */
router.get('/project-summary', getAIProjectSummary);

/**
 * @route   GET /api/ai/risk-analysis
 * @desc    Generate deep database-backed risk reports via Google Gemini
 * @access  Private
 */
router.get('/risk-analysis', getAIRiskAnalysis);

/**
 * @route   GET /api/ai/smart-actions
 * @desc    Compile actionable database recommendations based on live metrics
 * @access  Private
 */
router.get('/smart-actions', getSmartActions);

/**
 * @route   POST /api/ai/chat
 * @desc    Context-aware interactive dialogue with active database records
 * @access  Private
 */
router.post('/chat', handleAIChat);

/**
 * @route   POST /api/ai/summarize-test
 * @desc    Sample test route: Summarize a preconfigured mock bid project proposal
 * @access  Private
 */
router.post('/summarize-test', testSummarizeProject);

export default router;

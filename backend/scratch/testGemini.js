import { generateAIResponse } from '../services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Waiting 50 seconds for Gemini API rate limits to reset...');
setTimeout(async () => {
  console.log('Initiating test prompt with gemini-2.5-flash...');
  try {
    const res = await generateAIResponse("Summarize an enterprise AI SaaS platform in one sentence.");
    console.log('SUCCESS!');
    console.log(res);
    process.exit(0);
  } catch (err) {
    console.error('ERROR!');
    console.error(err);
    process.exit(1);
  }
}, 50000);

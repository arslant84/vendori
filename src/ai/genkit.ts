
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Attempt to retrieve the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Conditionally configure the googleAI plugin with the API key if found,
// otherwise, initialize it without an explicit key (relying on ambient environment or default ADC).
const googleAIPlugin = apiKey ? googleAI({ apiKey }) : googleAI();

export const ai = genkit({
  plugins: [googleAIPlugin],
  model: 'googleai/gemini-2.0-flash', // Specify a default model
});

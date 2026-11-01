const express = require('express');
const router = express.Router();

// Supplementary Problem: Rate Limiting
// Prevents API abuse and token exhaustion by limiting requests per IP/session
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10000; // 10-second cooldown between requests

/**
 * Intelligent Rule-Based Fallback Generator
 * Ensures Graceful Degradation when third-party AI APIs (OpenAI/Gemini) fail,
 * timeout, or run out of quota, preventing app crashes.
 */
const generateSmartFallback = (title) => {
  const lower = title.toLowerCase();

  let priority = 'Medium';
  let deadline = 'Within 3 days';
  let description = '';

  if (lower.includes('urgent') || lower.includes('bug') || lower.includes('fix') || lower.includes('critical') || lower.includes('error')) {
    priority = 'High';
    deadline = 'Today / Urgent (Within 24 hours)';
    description = `Investigate root cause, replicate the issue in development, implement a robust fix, and verify with automated regression tests before deployment.`;
  } else if (lower.includes('test') || lower.includes('ci') || lower.includes('pipeline') || lower.includes('github') || lower.includes('workflow')) {
    priority = 'High';
    deadline = 'Within 2 days';
    description = `Define automated test suites, verify pass/fail reporting, ensure environment variables and secrets are configured, and confirm smooth pipeline execution.`;
  } else if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('css') || lower.includes('frontend')) {
    priority = 'Medium';
    deadline = 'Within 4 days';
    description = `Create polished and accessible responsive UI layouts with modern dark/light mode aesthetics, smooth animations, and interactive component states.`;
  } else if (lower.includes('deploy') || lower.includes('release') || lower.includes('docker') || lower.includes('production')) {
    priority = 'High';
    deadline = 'Within 48 hours';
    description = `Review build artifacts, verify environment variables, test health check endpoints, and safely publish release with zero-downtime rollback strategy.`;
  } else if (lower.includes('doc') || lower.includes('readme') || lower.includes('report') || lower.includes('write')) {
    priority = 'Low';
    deadline = 'Within 1 week';
    description = `Draft comprehensive technical documentation, update architectural diagrams, explain rationale, and format clearly with Markdown.`;
  } else if (lower.includes('meeting') || lower.includes('review') || lower.includes('call') || lower.includes('discuss')) {
    priority = 'Low';
    deadline = 'Scheduled date';
    description = `Prepare agenda points, review relevant codebase commits, take structured minutes, and identify actionable follow-up items.`;
  } else {
    description = `Plan and execute the key deliverables for "${title}". Track progress, validate requirements, and mark as completed upon verification.`;
  }

  return { description, priority, deadline };
};

/**
 * GET /api/ai/status
 * Health check & configuration status for the AI service
 */
router.get('/status', (req, res) => {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 5);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);

  res.status(200).json({
    status: 'ONLINE',
    service: 'AI-Powered Task Assistant Service',
    activeProvider: hasOpenAI ? 'OpenAI (gpt-4o-mini)' : hasGemini ? 'Google Gemini' : 'Graceful Degradation (Smart Fallback Mode)',
    gracefulDegradationEnabled: true,
    rateLimitWindowSeconds: RATE_LIMIT_WINDOW_MS / 1000
  });
});

/**
 * POST /api/ai/generate-description
 * Accepts { title: string }
 * Securely calls external OpenAI / Gemini API server-side
 * Features:
 *   - Server-side API key protection (.env)
 *   - Request validation
 *   - Rate limiting
 *   - Graceful degradation when external API fails or is not configured
 */
router.post('/generate-description', async (req, res) => {
  const { title } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      error: 'Task title is required to generate an AI description.',
      fallback: true
    });
  }

  const cleanTitle = title.trim();

  // Supplementary Problem: Rate Limiting
  const clientIdentifier = req.ip || req.headers['x-forwarded-for'] || 'client-default';
  const now = Date.now();
  const lastRequest = rateLimitMap.get(clientIdentifier);

  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW_MS) {
    const remainingSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRequest)) / 1000);
    return res.status(429).json({
      error: `Rate limit active: Please wait ${remainingSeconds}s before generating another AI description.`,
      retryAfterSeconds: remainingSeconds,
      rateLimited: true
    });
  }

  rateLimitMap.set(clientIdentifier, now);

  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Attempt 1: Call OpenAI API if key is present
  if (openAiKey && openAiKey.trim().length > 5) {
    try {
      const OpenAI = require('openai');
      const client = new OpenAI({ apiKey: openAiKey });

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an intelligent task management assistant. Given a task title, write a concise, professional, and actionable task description (1-2 sentences). Format as plain text without markdown quotes.'
          },
          {
            role: 'user',
            content: `Write a short task description for: ${cleanTitle}`
          }
        ],
        max_tokens: 120,
        temperature: 0.7
      });

      const aiText = completion.choices?.[0]?.message?.content?.trim();
      if (aiText) {
        const smartDetails = generateSmartFallback(cleanTitle);
        return res.status(200).json({
          description: aiText,
          suggestedPriority: smartDetails.priority,
          suggestedDeadline: smartDetails.deadline,
          provider: 'OpenAI (gpt-4o-mini)',
          fallback: false,
          disclaimer: 'AI-generated suggestion. Please review and modify before saving.'
        });
      }
    } catch (openAiError) {
      console.warn(`[AI Service ⚠️] OpenAI API call failed (${openAiError.message}). Initiating Graceful Degradation.`);
    }
  }

  // Attempt 2: Call Gemini API if key is present
  if (geminiKey && geminiKey.trim().length > 5) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Write a concise 1-2 sentence actionable task description for the task: "${cleanTitle}".` }]
          }]
        })
      });

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (geminiText) {
          const smartDetails = generateSmartFallback(cleanTitle);
          return res.status(200).json({
            description: geminiText,
            suggestedPriority: smartDetails.priority,
            suggestedDeadline: smartDetails.deadline,
            provider: 'Google Gemini (gemini-1.5-flash)',
            fallback: false,
            disclaimer: 'AI-generated suggestion. Please review and modify before saving.'
          });
        }
      }
    } catch (geminiError) {
      console.warn(`[AI Service ⚠️] Gemini API call failed (${geminiError.message}). Initiating Graceful Degradation.`);
    }
  }

  // Step 6 / Lab Manual Graceful Degradation Requirement:
  // When external AI API fails or is unconfigured, return a smart suggestion with fallback: true
  // The app NEVER crashes and core task management remains 100% operational.
  const fallbackResult = generateSmartFallback(cleanTitle);
  return res.status(200).json({
    description: fallbackResult.description,
    suggestedPriority: fallbackResult.priority,
    suggestedDeadline: fallbackResult.deadline,
    provider: 'Smart Fallback Engine (Graceful Degradation)',
    fallback: true,
    message: 'Third-party AI service unavailable or offline. Generated intelligent fallback template.',
    disclaimer: 'AI-generated suggestion. Please review and modify before saving.'
  });
});

module.exports = router;

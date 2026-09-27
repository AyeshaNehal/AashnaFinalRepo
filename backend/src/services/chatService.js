// Provider facade for the Roleplay chatbot.
//
// Groq is the preferred provider (fast and currently the most reliable);
// OpenRouter is tried next, and the Gemini client remains fully wired as
// the last resort, so a failure in one still serves the user. All services
// speak the same { systemPrompt, contents } contract (Gemini's contents
// format), so the controller never has to care which provider answered.
//
// Set CHAT_PROVIDER=groq|openrouter|gemini in backend/.env to pin a single
// provider; leave it unset for "prefer Groq, then OpenRouter, then Gemini".

import { generateChatReply as generateGeminiReply } from "./geminiService.js";
import { generateChatReplyGroq } from "./groqService.js";
import { generateChatReplyOpenRouter } from "./openrouterService.js";

const providers = {
  groq: {
    label: "groq",
    fn: generateChatReplyGroq,
    isConfigured: () => Boolean(process.env.GROQ_API_KEY),
  },
  openrouter: {
    label: "openrouter",
    fn: generateChatReplyOpenRouter,
    isConfigured: () => Boolean(process.env.OPENROUTER_API_KEY),
  },
  gemini: {
    label: "gemini",
    fn: generateGeminiReply,
    isConfigured: () => Boolean(process.env.GOOGLE_CLOUD_API_KEY),
  },
};

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Resolve which providers to try, in order.
 * A pinned provider is used alone (even unconfigured — its service then
 * reports the proper 503). In auto mode only configured providers are used,
 * Groq first, so a missing key simply skips that provider.
 */
function selectedProviders() {
  const pinned = (process.env.CHAT_PROVIDER || "").trim().toLowerCase();
  if (pinned) {
    const provider = providers[pinned];
    if (!provider) {
      throw httpError(500, `CHAT_PROVIDER must be one of: groq, openrouter, gemini (got "${pinned}")`);
    }
    return [provider];
  }
  return ["groq", "openrouter", "gemini"]
    .map((label) => providers[label])
    .filter((provider) => provider.isConfigured());
}

/**
 * Generate a chat reply, trying the available providers in order.
 *
 * @param {object} params Same contract as geminiService/groqService:
 * @param {string} params.systemPrompt
 * @param {Array<{role: "user"|"model", parts: [{text: string}]}>} params.contents
 * @returns {Promise<string>} The bot's reply text.
 */
export async function generateChatReply(params) {
  const attempts = selectedProviders();

  if (attempts.length === 0) {
    throw httpError(503, "Chat service is not configured (no provider API key on the server)");
  }

  const errors = [];
  for (const provider of attempts) {
    try {
      return await provider.fn(params);
    } catch (e) {
      errors.push(e);
      console.warn(`[chat] ${provider.label} failed: ${e.message}`);
    }
  }

  // Every provider failed — surface the primary provider's error, since it is
  // the preferred one and its message is the most relevant for the user.
  throw errors[0];
}

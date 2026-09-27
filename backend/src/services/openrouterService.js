// OpenRouter API client for the Roleplay chatbot.
// The API key lives ONLY in backend/.env (server-side) — it is never sent to,
// embedded in, or referenced by any frontend file. The frontend talks to our
// own /api/chat endpoint, and this service talks to OpenRouter.
//
// OpenRouter is an OpenAI-compatible aggregator, so the request shape is the
// same as Groq's: messages are { role, content } strings and the system
// prompt is an ordinary first message instead of a dedicated field. It is
// tried after Groq — same underlying model, different host — and before
// Gemini, which has been flaky.

const API_BASE = "https://openrouter.ai/api/v1";

// "openai/gpt-oss-120b" matches the model Groq serves as primary, so the
// fallback behaves near-identically to the preferred provider.
// Override per environment via OPENROUTER_MODEL in backend/.env.
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const TIMEOUT_MS = 30_000;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Map Gemini's contents format (role "model" = the bot) onto the OpenAI-style
 * messages OpenRouter expects.
 */
function toOpenRouterMessages(systemPrompt, contents) {
  const messages = [{ role: "system", content: systemPrompt }];
  for (const turn of contents) {
    const text = (turn?.parts ?? [])
      .map((part) => part.text || "")
      .join("")
      .trim();
    if (text) {
      messages.push({ role: turn.role === "model" ? "assistant" : "user", content: text });
    }
  }
  return messages;
}

/**
 * Call the OpenRouter chat completions endpoint.
 *
 * @param {object} params
 * @param {string} params.systemPrompt  Behavior instructions for the bot.
 * @param {Array<{role: "user"|"model", parts: [{text: string}]}>} params.contents
 *        Conversation turns in Gemini's format, oldest first, ending with the
 *        user's new message.
 * @returns {Promise<string>} The bot's reply text.
 */
export async function generateChatReplyOpenRouter({ systemPrompt, contents }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw httpError(503, "Chat service is not configured (missing OpenRouter API key on the server)");
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = {
      model,
      messages: toOpenRouterMessages(systemPrompt, contents),
      temperature: 0.8,
      max_tokens: 500,
    };
    // GPT-OSS models spend output tokens on internal reasoning; "low" keeps
    // replies snappy. Other models reject the parameter, so only send it then.
    if (model.includes("gpt-oss")) {
      body.reasoning_effort = "low";
    }

    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // Optional attribution headers OpenRouter shows in its dashboard.
        "X-Title": "Sign Language Bridge",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 429) {
        throw httpError(429, "The chatbot is receiving too many requests — please wait a moment and try again");
      }
      throw httpError(502, "The chatbot service failed to generate a reply");
    }

    const text = json?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw httpError(502, "The chatbot could not generate a reply for that message");
    }

    return text;
  } catch (e) {
    if (e.name === "AbortError") {
      throw httpError(504, "The chatbot took too long to reply — please try again");
    }
    throw e; // already-shaped HTTP errors pass straight through to the error handler
  } finally {
    clearTimeout(timer);
  }
}

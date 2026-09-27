// Groq API client for the Roleplay chatbot.
// The API key lives ONLY in backend/.env (server-side) — it is never sent to,
// embedded in, or referenced by any frontend file. The frontend talks to our
// own /api/chat endpoint, and this service talks to Groq.
//
// Groq exposes an OpenAI-compatible endpoint, so the request shape differs
// from Gemini's: messages are { role, content } strings and the system prompt
// is an ordinary first message instead of a dedicated field.

const API_BASE = "https://api.groq.com/openai/v1";

// "openai/gpt-oss-120b" is Groq's flagship production model — strong
// conversational quality with ~500 tokens/sec, ideal for short chat replies.
// Override per environment via GROQ_MODEL in backend/.env.
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const TIMEOUT_MS = 30_000;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Map Gemini's contents format (role "model" = the bot) onto the OpenAI-style
 * messages Groq expects.
 */
function toGroqMessages(systemPrompt, contents) {
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
 * Call the Groq chat completions endpoint.
 *
 * @param {object} params
 * @param {string} params.systemPrompt  Behavior instructions for the bot.
 * @param {Array<{role: "user"|"model", parts: [{text: string}]}>} params.contents
 *        Conversation turns in Gemini's format, oldest first, ending with the
 *        user's new message.
 * @returns {Promise<string>} The bot's reply text.
 */
export async function generateChatReplyGroq({ systemPrompt, contents }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw httpError(503, "Chat service is not configured (missing Groq API key on the server)");
  }

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = {
      model,
      messages: toGroqMessages(systemPrompt, contents),
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

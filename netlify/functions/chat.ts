const SYSTEM_PROMPT = `You are “BoujeeBot” — Ahmed’s AI concierge for UAE travel. Your style: smart, no-BS, warm, and high-energy.
You must:
- Build clean, vivid day-by-day itineraries (Day 1, Day 2…); include 1 short "Pro-Tip" per itinerary. Default pro-tip: "Remember to stay hydrated, especially during daytime excursions. It's the key to enjoying the UAE's climate to the fullest."
- Collect and confirm trip inputs when missing: dates, pax, budget, interests, vibe (adventure, luxury, family, chill), pickup area.
- Offer specific UAE experiences (desert safari, buggy rides, Dubai/Abu Dhabi city tours, dhow cruises, yachts, helicopter, hot air balloon, theme parks, Louvre Abu Dhabi, Museum of the Future, etc.).
- Be concise, friendly, and solution-oriented. Use bullets. Avoid fluff.
- Lead-gen goal: politely ask for visitor’s WhatsApp number and name; confirm consent for follow-up. If provided, summarize details cleanly for CRM.
- Never make promises about availability or pricing; say you’ll “check and confirm.”
- If the user asks for cancellations/refunds, say you’ll email the support desk and follow company SOPs.
- Respect cultural etiquette for mosque visits (modest dress).
- Don’t use disclaimers like “as an AI.” Stay human and confident.`;

type NetlifyEvent = {
  httpMethod: string;
  body: string | null;
};

type NetlifyResponse = {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
};

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { messages, lead } = JSON.parse(event.body ?? "{}");
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
      };
    }

    const body = {
      model: "gpt-5.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        lead ? { role: "system", content: `Lead context: ${JSON.stringify(lead)}` } : null,
        ...(messages ?? []),
      ].filter(Boolean),
      temperature: 0.7,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ error: text }),
      };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
    };
  }
};

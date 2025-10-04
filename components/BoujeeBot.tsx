"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

type Lead = {
  name?: string;
  whatsapp?: string;
  email?: string;
  trip?: {
    dates?: string;
    pax?: string;
    budget?: string;
    interests?: string[];
    vibe?: string;
    pickupArea?: string;
  };
  consent?: boolean;
};

export default function BoujeeBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey, I’m BoujeeBot — Ahmed’s AI concierge. Want me to sketch a UAE itinerary or swap WhatsApp so Ahmed can tailor everything for you?",
    },
  ]);
  const [lead, setLead] = useState<Lead>({ trip: {} });
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const whatsappBusiness = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || "";
  const chatEndpoint =
    process.env.NEXT_PUBLIC_CHAT_ENDPOINT || "/.netlify/functions/chat";
  const leadEndpoint =
    process.env.NEXT_PUBLIC_LEAD_ENDPOINT || "/.netlify/functions/lead";

  const waLink = useMemo(() => {
    if (!lead.whatsapp) return null;

    const pre = encodeURIComponent(
      `Hi Ahmed, I shared my details with BoujeeBot. Name: ${lead.name || ""}, Dates: ${lead.trip?.dates || ""}, Pax: ${lead.trip?.pax || ""}, Interests: ${(lead.trip?.interests || []).join(", ")}`
    );

    return `https://wa.me/${whatsappBusiness}?text=${pre}`;
  }, [lead.whatsapp, lead.name, lead.trip, whatsappBusiness]);

  async function sendMessage(text: string) {
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const r = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], lead }),
      });
      if (!r.ok) {
        throw new Error("Chat request failed");
      }
      const data = await r.json();
      const reply: ChatMessage = {
        role: "assistant",
        content: data.reply || "(no reply)",
      };
      setMessages((m) => [...m, reply]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Hmm… had a hiccup. Try again in a sec." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submitLead() {
    try {
      const payload = { ...lead, collectedAt: new Date().toISOString() };
      const r = await fetch(leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        throw new Error("Lead request failed");
      }

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Got it — I’ll share this with Ahmed. Want me to draft a 1-day sample itinerary now?",
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Couldn’t save lead just now, but I kept it in our chat. Try again soon.",
        },
      ]);
    }
  }

  const quickActions = [
    { label: "Plan my UAE trip", value: "Plan my trip" },
    { label: "Share WhatsApp", value: "Here’s my WhatsApp number" },
    { label: "Best desert safari combo", value: "Recommend a desert safari combo" },
  ];

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-full shadow-lg px-4 py-3 text-white bg-black/90 hover:bg-black"
        >
          {open ? "Close BoujeeBot" : "Chat with BoujeeBot"}
        </button>
      </div>

      {open && (
        <div className="fixed bottom-20 right-5 w-96 max-w-[95vw] h-[560px] bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-r from-black to-stone-800 text-white">
            <div className="font-semibold">BoujeeBot — Ahmed’s AI concierge</div>
            <div className="text-xs opacity-80">Itineraries • WhatsApp leads • Zero fluff</div>
          </div>

          <div className="p-3 grid grid-cols-2 gap-2 text-xs border-b">
            <input
              placeholder="Your name"
              className="border rounded-lg px-2 py-2"
              value={lead.name || ""}
              onChange={(e) => setLead((s) => ({ ...s, name: e.target.value }))}
            />
            <input
              placeholder="WhatsApp (e.g., 9715XXXXXXX)"
              className="border rounded-lg px-2 py-2"
              value={lead.whatsapp || ""}
              onChange={(e) =>
                setLead((s) => ({ ...s, whatsapp: e.target.value }))
              }
            />
            <input
              placeholder="Dates (e.g., 20–24 Nov)"
              className="border rounded-lg px-2 py-2 col-span-2"
              value={lead.trip?.dates || ""}
              onChange={(e) =>
                setLead((s) => ({ ...s, trip: { ...s.trip, dates: e.target.value } }))
              }
            />
            <div className="grid grid-cols-3 gap-2 col-span-2">
              <input
                placeholder="Pax"
                className="border rounded-lg px-2 py-2"
                value={lead.trip?.pax || ""}
                onChange={(e) =>
                  setLead((s) => ({ ...s, trip: { ...s.trip, pax: e.target.value } }))
                }
              />
              <input
                placeholder="Budget (AED)"
                className="border rounded-lg px-2 py-2"
                value={lead.trip?.budget || ""}
                onChange={(e) =>
                  setLead((s) => ({ ...s, trip: { ...s.trip, budget: e.target.value } }))
                }
              />
              <input
                placeholder="Vibe (luxury/adventure…)"
                className="border rounded-lg px-2 py-2"
                value={lead.trip?.vibe || ""}
                onChange={(e) =>
                  setLead((s) => ({ ...s, trip: { ...s.trip, vibe: e.target.value } }))
                }
              />
            </div>
            <input
              placeholder="Interests (comma-separated)"
              className="border rounded-lg px-2 py-2 col-span-2"
              value={(lead.trip?.interests || []).join(", ")}
              onChange={(e) =>
                setLead((s) => ({
                  ...s,
                  trip: {
                    ...s.trip,
                    interests: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  },
                }))
              }
            />
            <div className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                id="consent"
                checked={!!lead.consent}
                onChange={(e) =>
                  setLead((s) => ({ ...s, consent: e.target.checked }))
                }
              />
              <label htmlFor="consent">I agree to be contacted on WhatsApp</label>
              <button
                onClick={submitLead}
                className="ml-auto text-xs px-3 py-2 border rounded-lg hover:bg-black hover:text-white"
              >
                Save
              </button>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  className="text-xs px-3 py-2 border rounded-lg hover:bg-black hover:text-white"
                >
                  Open WhatsApp
                </a>
              )}
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "assistant"
                    ? "text-sm bg-stone-100 p-2 rounded-xl"
                    : "text-sm bg-black text-white p-2 rounded-xl ml-auto w-fit"
                }
              >
                {m.content}
              </div>
            ))}
          </div>

          <div className="px-3 pb-2 flex gap-2 flex-wrap border-t">
            {quickActions.map((qa) => (
              <button
                key={qa.label}
                onClick={() => sendMessage(qa.value)}
                className="text-xs px-3 py-2 border rounded-full hover:bg-stone-100"
              >
                {qa.label}
              </button>
            ))}
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded-xl px-3 py-2"
              placeholder="Tell me dates, pax, vibe…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  sendMessage(input.trim());
                }
              }}
            />
            <button
              disabled={loading || !input.trim()}
              onClick={() => sendMessage(input.trim())}
              className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-30"
            >
              {loading ? "…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

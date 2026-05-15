// Lovable AI helper — content/script/caption ideas + match scoring
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { kind, payload } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompts: Record<string, { system: string; user: string }> = {
      content_ideas: {
        system: "You are a viral Indian short-form creator. Generate 3 distinct CONTENT HOOK ideas for a brand campaign. Each hook = 1 line, scroll-stopping, Hinglish ok. Return JSON {ideas:[{title,hook,format}]} where format ∈ ['Reel','Story','YT Short'].",
        user: `Brand: ${payload.brand}\nProduct: ${payload.title}\nBrief: ${payload.brief}`,
      },
      script_ideas: {
        system: "You write 30s Reels scripts. Generate 2 distinct script options for a brand campaign. Each: HOOK (1 line), BODY (3-4 lines), CTA (1 line). Hinglish allowed. Return JSON {scripts:[{label,hook,body,cta}]}.",
        user: `Brand: ${payload.brand}\nProduct: ${payload.title}\nBrief: ${payload.brief}\nDeliverables: ${(payload.deliverables||[]).join(', ')}`,
      },
      caption_ideas: {
        system: "Write 3 short Instagram captions in Hinglish for the brand campaign. Punchy, native, emoji-friendly, ≤180 chars each. Include 4-6 niche hashtags per caption. Return JSON {captions:[{text,hashtags:[..]}]}.",
        user: `Brand: ${payload.brand}\nProduct: ${payload.title}\nBrief: ${payload.brief}`,
      },
      // legacy aliases
      caption: {
        system: "Write 3 short Instagram captions in Hinglish for the brand campaign. Return JSON {captions:[string,string,string]}.",
        user: `Brand: ${payload.brand}\nProduct: ${payload.title}\nBrief: ${payload.brief}`,
      },
      script: {
        system: "Write a 30s Reels script (HOOK/BODY/CTA) in Hinglish. Return JSON {hook,body,cta}.",
        user: `Brand: ${payload.brand}\nProduct: ${payload.title}\nBrief: ${payload.brief}\nDeliverables: ${(payload.deliverables||[]).join(', ')}`,
      },
      match: {
        system: "Match creator to campaign. Return JSON {score:0-100, reason:string}.",
        user: `Creator: ${JSON.stringify(payload.creator)}\nCampaign: ${JSON.stringify(payload.campaign)}`,
      },
    };
    const p = prompts[kind];
    if (!p) throw new Error("Unknown kind: " + kind);

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: p.system },
          { role: "user", content: p.user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit, try again in a moment" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) throw new Error(`AI error: ${r.status}`);
    const data = await r.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    return new Response(content, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

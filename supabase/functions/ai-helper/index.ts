// Lovable AI helper edge function — caption/script generation + campaign matching
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { kind, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let system = "";
    let user = "";
    if (kind === "caption") {
      system = "You are a viral Indian creator. Write 3 short Instagram captions in Hinglish for the given brand campaign. Punchy, emoji-friendly, native voice. Return JSON {captions:[string,string,string]}.";
      user = `Brand: ${payload.brand}\nProduct: ${payload.title}\nBrief: ${payload.brief}`;
    } else if (kind === "script") {
      system = "You are a Reels script writer. Output a 30-second Reels script with HOOK/BODY/CTA sections in Hinglish. Return JSON {hook,body,cta}.";
      user = `Brand: ${payload.brand}\nProduct: ${payload.title}\nBrief: ${payload.brief}\nDeliverables: ${(payload.deliverables||[]).join(', ')}`;
    } else if (kind === "match") {
      system = "You match creators to campaigns. Return JSON {score:0-100, reason:string} given creator profile and campaign.";
      user = `Creator: ${JSON.stringify(payload.creator)}\nCampaign: ${JSON.stringify(payload.campaign)}`;
    } else {
      throw new Error("Unknown kind");
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
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
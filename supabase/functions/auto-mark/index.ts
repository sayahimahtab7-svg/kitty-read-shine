import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { original_text, student_text } = await req.json();
    
    if (!original_text || !student_text) {
      return new Response(JSON.stringify({ error: "Missing original_text or student_text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a reading fluency evaluator for children. Compare the student's reading attempt against the original text. Be encouraging and kid-friendly.`
          },
          {
            role: "user",
            content: `Original text: "${original_text}"

Student's reading: "${student_text}"

Evaluate the student's reading accuracy.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate_reading",
              description: "Evaluate student reading accuracy",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Accuracy score 0-100"
                  },
                  corrections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        word: { type: "string", description: "What the student said" },
                        correct: { type: "string", description: "What the correct word was" },
                        position: { type: "number", description: "Word index in original text (0-based)" }
                      },
                      required: ["word", "correct", "position"],
                      additionalProperties: false
                    }
                  },
                  feedback: {
                    type: "string",
                    description: "Encouraging kid-friendly feedback message"
                  }
                },
                required: ["score", "corrections", "feedback"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "evaluate_reading" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-mark error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

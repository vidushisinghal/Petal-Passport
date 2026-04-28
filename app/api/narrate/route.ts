import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Hard kill switch. Set DISABLE_LIVE_NARRATION=true in Vercel env to ensure
  // public visitors can NEVER trigger an ElevenLabs charge — even if the static
  // MP3 is somehow missing, the route returns 404 instead of generating live.
  if (process.env.DISABLE_LIVE_NARRATION === "true") {
    return NextResponse.json(
      { error: "Live narration disabled. Pre-generated audio only." },
      { status: 404 }
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set" },
      { status: 501 }
    );
  }

  let body: { text?: string; bloomId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  // optimize_streaming_latency=2 trades a tiny bit of audio quality for ~2-3x faster TTFB
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=2`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: body.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        // PVC-tuned: lower similarity_boost than Instant Clone
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok || !res.body) {
    const msg = await res.text().catch(() => "ElevenLabs request failed");
    return NextResponse.json({ error: msg }, { status: res.status || 502 });
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}

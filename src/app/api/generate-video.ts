import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration, resolution } = await request.json();

    const API_KEY = process.env.MINIMAX_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    const minimaxRes = await fetch('https://api.minimax.io/v1/video_generation', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Hailuo-02',
        prompt,
        duration,
        resolution,
      }),
    });

    const data = await minimaxRes.json();
    
    if (!minimaxRes.ok) {
      return NextResponse.json(data, { status: minimaxRes.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as any).message || 'Unknown error' },
      { status: 500 }
    );
  }
}

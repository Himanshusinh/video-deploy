import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration, resolution } = await request.json();

    // Validate input
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!duration || ![6, 10].includes(duration)) {
      return NextResponse.json({ error: 'Duration must be 6 or 10 seconds' }, { status: 400 });
    }

    if (!resolution || !['1080P', '768P'].includes(resolution)) {
      return NextResponse.json({ error: 'Resolution must be 1080P or 768P' }, { status: 400 });
    }

    const API_KEY = process.env.MINIMAX_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    console.log(`🚀 Submitting video generation request:`, { prompt, duration, resolution });

    // Use the correct MiniMax API endpoint from official docs
    const minimaxRes = await fetch('https://api.minimax.io/v1/video_generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        model: 'MiniMax-Hailuo-02',
        duration,
        resolution,
      }),
    });

    const data = await minimaxRes.json();
    console.log(`📊 MiniMax API response:`, JSON.stringify(data, null, 2));
    
    if (!minimaxRes.ok) {
      console.log(`❌ MiniMax API error:`, data);
      return NextResponse.json(
        { 
          error: data.error || data.message || 'Failed to generate video',
          details: data 
        }, 
        { status: minimaxRes.status }
      );
    }

    // Transform the response to include additional metadata
    const transformedData = {
      task_id: data.task_id,
      status: 'submitted',
      prompt,
      duration,
      resolution,
      base_resp: data.base_resp,
      result: data.result,
      submitted_at: new Date().toISOString(),
      ...data
    };

    console.log(`✅ Video generation submitted successfully:`, transformedData.task_id);

    return NextResponse.json(transformedData);
  } catch (err) {
    console.error('💥 Video generation error:', err);
    return NextResponse.json(
      { error: (err as any).message || 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    
    console.log(`🔍 Status check for task ID: ${taskId}`);
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    } 

    const API_KEY = process.env.MINIMAX_API_KEY;
    if (!API_KEY) {
      console.log('❌ API Key missing');
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    console.log(`🌐 Making real API call to MiniMax for task: ${taskId}`);
    
    // Use the correct MiniMax API endpoint from official docs
    const statusUrl = `https://api.minimax.io/v1/query/video_generation?task_id=${taskId}`;
    
    const startTime = Date.now();
    const minimaxRes = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    const responseTime = Date.now() - startTime;
    
    console.log(`⏱️ API response time: ${responseTime}ms`);
    console.log(`📡 API response status: ${minimaxRes.status} ${minimaxRes.statusText}`);

    if (!minimaxRes.ok) {
      const errorText = await minimaxRes.text();
      console.log(`❌ API error response:`, errorText);
      
      return NextResponse.json(
        { 
          error: `MiniMax API error: ${minimaxRes.status} ${minimaxRes.statusText}`,
          details: errorText
        }, 
        { status: minimaxRes.status }
      );
    }

    const data = await minimaxRes.json();
    console.log(`📊 API response data:`, JSON.stringify(data, null, 2));
    
    // Transform the response to match our expected format based on official docs
    const transformedData = {
      task_id: taskId,
      status: data.status || 'unknown',
      file_id: data.file_id,
      base_resp: data.base_resp,
      result: data.result,
      ...data
    };

    console.log(`✅ Final transformed response:`, {
      task_id: transformedData.task_id,
      status: transformedData.status,
      has_file_id: !!transformedData.file_id
    });

    return NextResponse.json(transformedData);
  } catch (err) {
    console.error('💥 Status endpoint error:', err);
    return NextResponse.json(
      { error: (err as any).message || 'Unknown error' },
      { status: 500 }
    );
  }
} 
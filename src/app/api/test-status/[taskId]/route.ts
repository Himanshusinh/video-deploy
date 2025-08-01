import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'processing';
    
    console.log(`🧪 Test status endpoint: ${taskId} -> ${status}`);
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    let responseData;
    
    switch (status) {
      case 'completed':
        responseData = {
          task_id: taskId,
          status: 'completed',
          video_url: 'https://example.com/test-video.mp4',
          base_resp: { status_code: 0, status_msg: 'success' },
          result: { video_url: 'https://example.com/test-video.mp4' }
        };
        break;
      case 'failed':
        responseData = {
          task_id: taskId,
          status: 'failed',
          base_resp: { status_code: 1, status_msg: 'failed' },
          error: 'Video generation failed'
        };
        break;
      case 'processing':
      default:
        responseData = {
          task_id: taskId,
          status: 'processing',
          base_resp: { status_code: 1, status_msg: 'processing' }
        };
        break;
    }

    console.log(`✅ Test response:`, responseData);
    return NextResponse.json(responseData);
  } catch (err) {
    console.error('💥 Test status endpoint error:', err);
    return NextResponse.json(
      { error: (err as any).message || 'Unknown error' },
      { status: 500 }
    );
  }
} 
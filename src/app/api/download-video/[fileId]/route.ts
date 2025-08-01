import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    console.log(`📥 Download request for file ID: ${fileId}`);
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    } 

    const API_KEY = process.env.MINIMAX_API_KEY;
    if (!API_KEY) {
      console.log('❌ API Key missing');
      return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
    }

    console.log(`🌐 Making file retrieve API call to MiniMax for file: ${fileId}`);
    
    // Use the correct MiniMax API endpoint from official docs
    const fileUrl = `https://api.minimax.io/v1/files/retrieve?file_id=${fileId}`;
    
    const startTime = Date.now();
    const minimaxRes = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    const responseTime = Date.now() - startTime;
    
    console.log(`⏱️ File API response time: ${responseTime}ms`);
    console.log(`📡 File API response status: ${minimaxRes.status} ${minimaxRes.statusText}`);

    if (!minimaxRes.ok) {
      const errorText = await minimaxRes.text();
      console.log(`❌ File API error response:`, errorText);
      
      return NextResponse.json(
        { 
          error: `MiniMax File API error: ${minimaxRes.status} ${minimaxRes.statusText}`,
          details: errorText
        }, 
        { status: minimaxRes.status }
      );
    }

    const data = await minimaxRes.json();
    console.log(`📊 File API response data:`, JSON.stringify(data, null, 2));
    
    // Return the file information including download URL
    const transformedData = {
      file_id: fileId,
      download_url: data.file?.download_url,
      file_info: data.file,
      ...data
    };

    console.log(`✅ File download info:`, {
      file_id: transformedData.file_id,
      has_download_url: !!transformedData.download_url
    });

    return NextResponse.json(transformedData);
  } catch (err) {
    console.error('💥 File download endpoint error:', err);
    return NextResponse.json(
      { error: (err as any).message || 'Unknown error' },
      { status: 500 }
    );
  }
} 
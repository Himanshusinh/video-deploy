import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verification request
    const challenge = body?.challenge;
    if (challenge) {
      return NextResponse.json({ challenge });
    }
    
    // Else, handle task status updates (success, failed, etc)
    // You can log, store, etc as needed here
    // For now, just return success
    return NextResponse.json({ status: "success" });
  } catch (err) {
    return NextResponse.json(
      { error: (err as any).message || 'Unknown error' },
      { status: 500 }
    );
  }
}

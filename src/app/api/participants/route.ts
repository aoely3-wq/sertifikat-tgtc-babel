import { NextRequest, NextResponse } from 'next/server';
import { getParticipants, findParticipantByEmailOrPhone, deleteParticipant, clearAllParticipants, resetCertificateNumber, getNextCertificateNumber } from '@/lib/participants';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search');
  if (search) {
    const found = findParticipantByEmailOrPhone(search);
    return NextResponse.json({ participant: found || null });
  }

  const all = getParticipants();
  const nextNumber = getNextCertificateNumber();
  return NextResponse.json({ participants: all, nextCertificateNumber: nextNumber });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'reset-number') {
      const startNum = body.startNumber ? Number(body.startNumber) : 72;
      resetCertificateNumber(startNum);
      const nextNumber = getNextCertificateNumber();
      return NextResponse.json({ success: true, nextCertificateNumber: nextNumber });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.clearAll) {
      clearAllParticipants();
      if (body.resetNumber) {
        resetCertificateNumber(body.startNumber ? Number(body.startNumber) : 72);
      }
      return NextResponse.json({ success: true, cleared: true });
    }

    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const success = deleteParticipant(id);
    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

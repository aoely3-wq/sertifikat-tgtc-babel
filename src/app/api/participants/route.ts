import { NextRequest, NextResponse } from 'next/server';
import { getParticipants, findParticipantByEmailOrPhone, deleteParticipant, clearAllParticipants, resetCertificateNumber, getNextCertificateNumber } from '@/lib/participants';
import { fetchParticipantsFromGoogleSheet } from '@/lib/googleSheet';
import { Participant } from '@/lib/types';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search');
  if (search) {
    const found = findParticipantByEmailOrPhone(search);
    return NextResponse.json({ participant: found || null });
  }

  const localList = getParticipants();
  let mergedList = localList;

  try {
    const sheetList = await fetchParticipantsFromGoogleSheet();
    if (sheetList && sheetList.length > 0) {
      const map = new Map<string, Participant>();
      localList.forEach((p) => map.set(p.id, p));
      sheetList.forEach((p) => map.set(p.id, { ...(map.get(p.id) || {}), ...p }));
      mergedList = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (e) {
    console.error('Failed to merge Google Sheet participants:', e);
  }

  const nextNumber = getNextCertificateNumber();
  return NextResponse.json({ participants: mergedList, nextCertificateNumber: nextNumber });
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

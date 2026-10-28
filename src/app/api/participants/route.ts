import { NextRequest, NextResponse } from 'next/server';
import {
  getParticipants,
  findParticipantByEmailOrPhone,
  deleteParticipant,
  clearAllParticipants,
  resetCertificateNumber,
  getNextCertificateNumber,
  isDummyParticipant,
  getSettings,
} from '@/lib/participants';
import { fetchParticipantsFromGoogleSheet, syncParticipantToGoogleSheet } from '@/lib/googleSheet';
import { Participant } from '@/lib/types';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search');
  if (search) {
    const found = findParticipantByEmailOrPhone(search);
    if (found && !isDummyParticipant(found)) {
      return NextResponse.json({ participant: found });
    }
    return NextResponse.json({ participant: null });
  }

  const localList = getParticipants().filter((p) => !isDummyParticipant(p));
  let mergedList = localList;

  try {
    const sheetList = await fetchParticipantsFromGoogleSheet();
    if (sheetList && sheetList.length > 0) {
      const sheetMap = new Map<string, Participant>();
      sheetList.forEach((p) => {
        if (p.id && !isDummyParticipant(p)) {
          sheetMap.set(p.id, p);
        }
      });
      // Hanya update metadata emailSent & whatsappSent dari Google Sheet untuk data resmi lokal
      mergedList = localList.map((localP) => {
        const fromSheet = sheetMap.get(localP.id);
        if (!fromSheet) return localP;
        return {
          ...localP,
          emailSent: localP.emailSent || fromSheet.emailSent,
          whatsappSent: localP.whatsappSent || fromSheet.whatsappSent,
        };
      });
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

    if (body.action === 'sync-all-to-sheet') {
      const participants = getParticipants().filter((p) => !isDummyParticipant(p));
      const settings = getSettings();
      let successCount = 0;
      let failCount = 0;

      for (const p of participants) {
        const res = await syncParticipantToGoogleSheet(p, p.certUrl || '', settings);
        if (res.success) successCount++;
        else failCount++;
      }

      return NextResponse.json({
        success: true,
        total: participants.length,
        synced: successCount,
        failed: failCount,
      });
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

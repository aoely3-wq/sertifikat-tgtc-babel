import { NextRequest, NextResponse } from 'next/server';
import { getParticipantById, getSettings, updateParticipant } from '@/lib/participants';
import { generateCertificatePdf } from '@/lib/certificate';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const participant = getParticipantById(id);

    if (!participant) {
      return new NextResponse('Sertifikat tidak ditemukan', { status: 404 });
    }

    const settings = getSettings();
    const origin = req.nextUrl.origin || 'http://localhost:3000';

    const pdfBytes = await generateCertificatePdf(participant, settings, origin);

    // Update count unduhan
    updateParticipant(id, {
      downloadCount: (participant.downloadCount || 0) + 1,
    });

    const safeName = participant.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Sertifikat-TGTC-${safeName}.pdf`;
    const isAttachment = req.nextUrl.searchParams.get('download') === '1';

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${isAttachment ? 'attachment' : 'inline'}; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('PDF generation error:', err);
    return new NextResponse('Gagal membuat file PDF sertifikat', { status: 500 });
  }
}

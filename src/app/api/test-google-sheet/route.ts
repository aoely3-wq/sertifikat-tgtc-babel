import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !url.trim().startsWith('http')) {
      return NextResponse.json({
        success: false,
        error: 'URL Google Apps Script tidak valid. Pastikan dimulai dengan https://script.google.com/...',
      });
    }

    const testPayload = {
      action: 'ping',
      participant: {
        id: 'tgtc-test-connection',
        certNumber: 'TEST-000',
        name: 'Tes Koneksi Sistem TGTC',
        institution: 'Kanwil DJPb Babel',
        email: 'test@kemenkeu.go.id',
        phone: '08123456789',
        createdAt: new Date().toISOString(),
        certUrl: 'http://localhost:3000',
        emailSent: true,
        whatsappSent: true,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(testPayload),
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    let isSuccess = res.ok;
    try {
      const data = JSON.parse(text);
      if (data.status === 'error') {
        return NextResponse.json({ success: false, error: data.message });
      }
      isSuccess = data.status === 'success' || !!data.success || isSuccess;
    } catch {
      // jika text bukan JSON tapi HTTP 200
      isSuccess = res.ok;
    }

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Koneksi ke Google Sheet berhasil! Baris data uji coba telah terkirim.',
      });
    }

    return NextResponse.json({
      success: false,
      error: `Gagal menghubungkan (Status ${res.status}): ${text.substring(0, 200)}`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Koneksi gagal: ${err.message}. Pastikan Web App disetel 'Anyone' (Siapa saja).`,
    });
  }
}


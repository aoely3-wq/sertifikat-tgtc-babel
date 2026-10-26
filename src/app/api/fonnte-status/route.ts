import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/participants';

export async function GET() {
  try {
    const settings = getSettings();
    const token = settings.waGatewayToken || process.env.WA_GATEWAY_TOKEN;

    if (!token) {
      return NextResponse.json({ configured: false });
    }

    const res = await fetch('https://api.fonnte.com/device', {
      method: 'POST',
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json({
      configured: true,
      connected: data.device_status === 'connect',
      deviceStatus: data.device_status || 'unknown',
      device: data.device || null,
      name: data.name || null,
      quota: data.quota || null,
      package: data.package || null,
      expired: data.expired || null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

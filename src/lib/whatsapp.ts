import { CertificateSettings } from './types';

export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function generateWhatsAppMessage(params: {
  name: string;
  certNumber: string;
  certUrl: string;
  eventTitle: string;
  organizer: string;
}): string {
  const { name, certNumber, certUrl, eventTitle, organizer } = params;

  return `Halo *${name}*,

Terima kasih atas partisipasi aktif Anda dalam kegiatan:
🎓 *${eventTitle}*
🏛️ *${organizer}*

Berikut adalah e-Sertifikat resmi penghargaan Anda:
📜 *Nomor Sertifikat:* ${certNumber}
🔗 *Akses e-Sertifikat Resmi Anda:* 
${certUrl}

Dokumen e-Sertifikat berformat PDF juga telah dikirimkan secara otomatis ke alamat email yang Anda daftarkan.

Salam Perbendaharaan,
*Panitia Penyelenggara TGTC DJPb Babel*`.trim();
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

export interface SendWhatsAppResult {
  success: boolean;
  simulated?: boolean;
  directUrl: string;
  provider?: string;
  error?: string;
}

/**
 * Mengirim pesan WhatsApp secara otomatis melalui WhatsApp Gateway API (jika token diisi di Admin)
 * atau menyiapkan Direct WA Link untuk interaksi langsung.
 */
export async function sendAutomaticWhatsApp(params: {
  phone: string;
  message: string;
  settings: CertificateSettings;
}): Promise<SendWhatsAppResult> {
  const { phone, message, settings } = params;
  const formattedPhone = formatPhoneNumber(phone);
  const directUrl = generateWhatsAppLink(phone, message);

  const token = settings.waGatewayToken || process.env.WA_GATEWAY_TOKEN;
  const endpoint = settings.waGatewayEndpoint || 'https://api.fonnte.com/send';

  // Jika token Gateway WA belum diisi, gunakan mode link / simulasi
  if (!token) {
    console.log(`[WHATSAPP LINK SIAP] Ke nomor: ${formattedPhone}`);
    return {
      success: true,
      simulated: true,
      directUrl,
    };
  }

  // Pengiriman otomatis melalui WhatsApp Gateway API (Fonnte / Webhook)
  try {
    const formData = new URLSearchParams();
    formData.append('target', formattedPhone);
    formData.append('message', message);
    formData.append('countryCode', '62');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.status !== false) {
      return {
        success: true,
        simulated: false,
        provider: 'fonnte',
        directUrl,
      };
    } else {
      return {
        success: false,
        error: data.reason || data.message || `Gagal mengirim WA via Fonnte (HTTP ${res.status})`,
        directUrl,
      };
    }
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      error: error.message || 'Gagal menghubungi server WhatsApp Gateway',
      directUrl,
    };
  }
}

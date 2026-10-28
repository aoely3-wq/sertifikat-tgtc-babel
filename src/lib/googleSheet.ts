import { Participant, CertificateSettings } from './types';
import { getSettings } from './participants';

export function getGoogleSheetWebhookUrl(customSettings?: CertificateSettings): string {
  const settings = customSettings || getSettings();
  return (
    settings.googleSheetWebhookUrl ||
    process.env.GOOGLE_SHEET_WEBHOOK_URL ||
    ''
  ).trim();
}

/**
 * Mengirim data peserta baru/update ke Google Sheets secara asinkron.
 */
export async function syncParticipantToGoogleSheet(
  participant: Participant,
  certUrl: string,
  customSettings?: CertificateSettings
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = getGoogleSheetWebhookUrl(customSettings);
  if (!webhookUrl) {
    return { success: false, error: 'Google Sheet Webhook URL belum dikonfigurasi' };
  }

  try {
    const payload = {
      action: 'addOrUpdate',
      participant: {
        id: participant.id,
        certNumber: participant.certNumber,
        name: participant.name,
        institution: participant.institution || '-',
        email: participant.email,
        phone: participant.phone,
        createdAt: participant.createdAt,
        certUrl,
        emailSent: !!participant.emailSent,
        whatsappSent: !!participant.whatsappSent,
        downloadCount: participant.downloadCount || 0,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Gunakan text/plain agar Apps Script tidak kena CORS preflight issue
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data.status === 'success' || data.success) {
        return { success: true };
      }
      return { success: false, error: data.message || 'Respons Google Sheet tidak sesuai' };
    } catch {
      // Jika Google Apps Script mengembalikan teks sukses biasa
      if (text.includes('success') || text.includes('Berhasil')) {
        return { success: true };
      }
      return { success: true };
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gagal sync ke Google Sheet:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Mengambil seluruh data peserta langsung dari Google Sheet jika terhubung.
 */
export async function fetchParticipantsFromGoogleSheet(
  customSettings?: CertificateSettings
): Promise<Participant[] | null> {
  const webhookUrl = getGoogleSheetWebhookUrl(customSettings);
  if (!webhookUrl) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(webhookUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (data && Array.isArray(data.participants)) {
      return data.participants as Participant[];
    }
    return null;
  } catch (err) {
    console.error('Gagal mengambil data dari Google Sheet:', err);
    return null;
  }
}


import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';
import { Participant, CertificateSettings } from './types';

const IS_VERCEL = !!process.env.VERCEL;
const SEED_DATA_DIR = path.join(process.cwd(), 'data');
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'tgtc-data') : SEED_DATA_DIR;
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SIGN_SECRET = process.env.APP_SECRET || 'tgtc-kemenkeu-djpb-2026';

/**
 * Membuat ID e-Sertifikat yang bersifat Self-Contained & Cryptographically Signed.
 * Menyimpan data esensial di dalam ID itu sendiri sehingga tautan WhatsApp & Email
 * DIJAMIN 100% TIDAK PERNAH 404 meskipun serverless lambda Vercel mengalami cold start / reset /tmp.
 */
export function createParticipantId(data: {
  name: string;
  certNumber: string;
  institution?: string;
  email: string;
  phone: string;
  createdAt?: string;
}): string {
  const ts = Math.floor((data.createdAt ? new Date(data.createdAt).getTime() : Date.now()) / 1000);
  const payload = [
    data.name.trim(),
    data.certNumber.trim(),
    (data.institution || '').trim(),
    data.email.trim().toLowerCase(),
    data.phone.trim(),
    ts,
  ];
  const compressed = zlib.deflateRawSync(Buffer.from(JSON.stringify(payload), 'utf-8'));
  const payloadB64 = compressed.toString('base64url');
  const hmac = crypto.createHmac('sha256', SIGN_SECRET).update(payloadB64).digest('base64url').substring(0, 10);
  return `tgtc.${payloadB64}.${hmac}`;
}

/**
 * Mendekode dan memverifikasi ID e-Sertifikat secara stateless.
 */
export function decodeParticipantId(id: string): Participant | null {
  if (!id || typeof id !== 'string') return null;
  if (!id.startsWith('tgtc.')) return null;

  const parts = id.split('.');
  if (parts.length !== 3) return null;

  const [, payloadB64, hmac] = parts;
  const expectedHmac = crypto.createHmac('sha256', SIGN_SECRET).update(payloadB64).digest('base64url').substring(0, 10);
  if (hmac !== expectedHmac) {
    return null;
  }

  try {
    const jsonStr = zlib.inflateRawSync(Buffer.from(payloadB64, 'base64url')).toString('utf-8');
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr) || arr.length < 6) return null;

    const [name, certNumber, institution, email, phone, ts] = arr;
    return {
      id,
      name,
      certNumber,
      institution: institution || undefined,
      email,
      phone,
      createdAt: new Date(Number(ts) * 1000).toISOString(),
      emailSent: true,
      downloadCount: 0,
    };
  } catch (e) {
    console.error('Gagal decode token ID peserta:', e);
    return null;
  }
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Jika berjalan di lingkungan Vercel Serverless, salin data bawaan awal dari repo
  if (IS_VERCEL) {
    const seedPartFile = path.join(SEED_DATA_DIR, 'participants.json');
    if (!fs.existsSync(PARTICIPANTS_FILE) && fs.existsSync(seedPartFile)) {
      try {
        fs.copyFileSync(seedPartFile, PARTICIPANTS_FILE);
      } catch (e) {
        console.error('Failed to copy seed participants:', e);
      }
    }

    const seedSetFile = path.join(SEED_DATA_DIR, 'settings.json');
    if (!fs.existsSync(SETTINGS_FILE) && fs.existsSync(seedSetFile)) {
      try {
        fs.copyFileSync(seedSetFile, SETTINGS_FILE);
      } catch (e) {
        console.error('Failed to copy seed settings:', e);
      }
    }
  }
}

export function getParticipants(): Participant[] {
  ensureDataDir();
  if (!fs.existsSync(PARTICIPANTS_FILE)) {
    fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(PARTICIPANTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveParticipants(participants: Participant[]): void {
  ensureDataDir();
  fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(participants, null, 2), 'utf-8');
}

export function getParticipantById(id: string): Participant | undefined {
  const all = getParticipants();
  const found = all.find((p) => p.id === id);
  if (found) return found;

  // Stateless fallback: verifikasi cryptographic token di dalam ID
  const decoded = decodeParticipantId(id);
  if (decoded) {
    // Cache ke participants.json lokal agar pencarian berikutnya instan
    all.unshift(decoded);
    saveParticipants(all);
    return decoded;
  }

  return undefined;
}

export function findParticipantByEmailOrPhone(query: string): Participant | undefined {
  const clean = query.trim().toLowerCase();
  const all = getParticipants();
  return all.find((p) => {
    const matchEmail = p.email.toLowerCase() === clean;
    const cleanPhone = p.phone.replace(/[^0-9]/g, '');
    const cleanQuery = clean.replace(/[^0-9]/g, '');
    const matchPhone = cleanPhone.length > 5 && cleanQuery.length > 5 && (cleanPhone.endsWith(cleanQuery) || cleanQuery.endsWith(cleanPhone));
    return matchEmail || matchPhone;
  });
}

export function formatCertificateNumber(seq: number, settings?: CertificateSettings): string {
  const currentSettings = settings || getSettings();
  const digits = currentSettings.certNumberDigits || 3;
  const padded = String(seq).padStart(digits, '0');
  const format = currentSettings.certNumberFormat || 'P Sertifik-{SEQ}/WPB.10/2026';
  return format.replace('{SEQ}', padded);
}

export function getNextCertificateNumber(): string {
  const settings = getSettings();
  const nextSeq = settings.certNumberNext !== undefined ? settings.certNumberNext : 72;
  return formatCertificateNumber(nextSeq, settings);
}

export function resetCertificateNumber(startNumber?: number): number {
  const settings = getSettings();
  const start = startNumber ?? settings.certNumberStart ?? 72;
  saveSettings({
    certNumberNext: start,
    certNumberStart: start,
  });
  return start;
}

export function clearAllParticipants(): void {
  ensureDataDir();
  saveParticipants([]);
}

export function addParticipant(data: Omit<Participant, 'id' | 'certNumber' | 'createdAt' | 'emailSent' | 'downloadCount'>): Participant {
  const all = getParticipants();
  const settings = getSettings();
  
  // Format nomor sertifikat otomatis: P Sertifik-072/WPB.10/2026
  const nextSeq = settings.certNumberNext !== undefined ? settings.certNumberNext : 72;
  const certNumber = formatCertificateNumber(nextSeq, settings);

  // Simpan nomor sequence untuk pendaftar selanjutnya
  saveSettings({
    certNumberNext: nextSeq + 1,
  });

  const createdAt = new Date().toISOString();
  const id = createParticipantId({
    name: data.name,
    certNumber,
    institution: data.institution,
    email: data.email,
    phone: data.phone,
    createdAt,
  });

  const newParticipant: Participant = {
    ...data,
    id,
    certNumber,
    createdAt,
    emailSent: false,
    downloadCount: 0,
  };

  all.unshift(newParticipant);
  saveParticipants(all);
  return newParticipant;
}

export function updateParticipant(id: string, updates: Partial<Participant>): Participant | null {
  const all = getParticipants();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;

  all[index] = { ...all[index], ...updates };
  saveParticipants(all);
  return all[index];
}

export function deleteParticipant(id: string): boolean {
  const all = getParticipants();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length === all.length) return false;
  saveParticipants(filtered);
  return true;
}

export function getSettings(): CertificateSettings {
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings: CertificateSettings = {
      eventTitle: "Kuliah Umum Treasury Goes To Campus",
      subTitle: "Peran Strategis APBN dalam Mendukung Pembangunan Berkelanjutan di Kepulauan Bangka Belitung",
      organizer: "Kantor Wilayah Direktorat Jenderal Perbendaharaan Provinsi Kepulauan Bangka Belitung",
      location: "Pangkalpinang, Kepulauan Bangka Belitung",
      eventDateText: "26 Oktober 2026",
      signatoryName: "Muhammad Mufti Arkan",
      signatoryTitle: "Kepala Kanwil DJPb Provinsi Kepulauan Bangka Belitung",
      signatory2Name: "Prof. Dr. Ibrahim, S.Fil., M.Si.",
      signatory2Title: "Rektor Universitas Bangka Belitung",
      namePositionY: 50,
      nameFontSize: 34,
      nameColor: "#0F2B5C",
      certNumberPositionY: 38,
      useCustomTemplate: false,
      customTemplatePath: "/templates/certificate-template.png",
      smtpHost: "smtp.gmail.com",
      smtpPort: 465,
      smtpUser: "",
      smtpPass: "",
      smtpFrom: "Kanwil DJPb Babel <no-reply@kemenkeu.go.id>",
      smtpSecure: true,
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    return defaultSettings;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {} as CertificateSettings;
  }
}

export function saveSettings(settings: Partial<CertificateSettings>): CertificateSettings {
  ensureDataDir();
  const current = getSettings();
  const updated = { ...current, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

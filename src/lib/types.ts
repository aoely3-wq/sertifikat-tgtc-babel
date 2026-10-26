export interface Participant {
  id: string; // unik, misal: tgtc-2026-xxxx
  certNumber: string; // misal: P Sertifik-072/WPB.10/2026
  name: string;
  email: string;
  phone: string;
  institution?: string;
  createdAt: string;
  emailSent: boolean;
  emailSentAt?: string;
  emailError?: string;
  whatsappSent?: boolean;
  whatsappSentAt?: string;
  whatsappError?: string;
  whatsappUrl?: string;
  downloadCount: number;
}

export interface CertificateSettings {
  eventTitle: string;
  subTitle: string;
  organizer: string;
  location: string;
  eventDateText: string;
  signatoryName: string;
  signatoryTitle: string;
  // Tanda Tangan Bersama: Penandatangan Kiri (Rektor Universitas Bangka Belitung)
  signatory2Name?: string;
  signatory2Title?: string;
  // Posisi teks nama pada template (dalam persentase % dari lebar/tinggi atau poin)
  namePositionY: number; // Persentase dari atas (default: 50%)
  nameFontSize: number; // Ukuran font nama (default: 34)
  nameColor: string; // Hex color, default: #0F2B5C (Navy DJPb)
  certNumberPositionY: number; // Persentase dari atas (default: 38%)
  useCustomTemplate: boolean;
  customTemplatePath: string; // misal: /templates/certificate-template.png
  // Penomoran Sertifikat
  certNumberFormat?: string; // misal: 'P Sertifik-{SEQ}/WPB.10/2026'
  certNumberNext?: number; // nomor urut lanjutan berikutnya, default: 72
  certNumberStart?: number; // nomor urut awal/reset, default: 72
  certNumberDigits?: number; // jumlah digit padding, default: 3
  // SMTP settings
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  smtpSecure?: boolean;
  // WhatsApp Gateway settings (Opsional untuk pengiriman otomatis via server)
  waGatewayToken?: string;
  waGatewayProvider?: 'fonnte' | 'wablas' | 'custom';
  waGatewayEndpoint?: string;
}

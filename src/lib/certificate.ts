import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { Participant, CertificateSettings } from './types';

// Convert hex color string to RGB 0..1
function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return rgb(isNaN(r) ? 0.05 : r, isNaN(g) ? 0.17 : g, isNaN(b) ? 0.36 : b);
}

export async function generateCertificatePdf(
  participant: Participant,
  settings: CertificateSettings,
  baseUrl: string = 'http://localhost:3000'
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // A4 Landscape: 841.89 pt x 595.28 pt
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Embed standard fonts
  const fontTitle = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontName = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSans = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // Check custom template existence (sanitize leading slashes for cross-platform Windows compatibility)
  const cleanTemplatePath = (settings.customTemplatePath || 'templates/certificate-template.jpeg').replace(/^[/\\]+/, '');
  const templatePath = path.join(process.cwd(), 'public', cleanTemplatePath);
  const hasCustomTemplate = (settings.useCustomTemplate ?? true) && fs.existsSync(templatePath);

  // Generate QR Code data URL
  const verifyUrl = `${baseUrl}/verify/${participant.id}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 200,
    color: {
      dark: '#0F2B5C',
      light: '#FFFFFF',
    },
  });
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  if (hasCustomTemplate) {
    // 1. Gambar Template Kustom dari Pengguna
    const templateBytes = fs.readFileSync(templatePath);
    const isPng = templatePath.toLowerCase().endsWith('.png');
    const bgImage = isPng
      ? await pdfDoc.embedPng(templateBytes)
      : await pdfDoc.embedJpg(templateBytes);

    page.drawImage(bgImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    // Nomor Sertifikat (Ditempatkan presisi di atas garis "NO: ____________", ukuran disetarakan dengan teks "NO :")
    const certNumSize = 17.5;
    const certNumY = pageHeight * (1 - (settings.certNumberPositionY || 35.4) / 100);
    // Jika format nomor sudah ada kata "Nomor:", bersihkan agar tidak dobel dengan "NO:" pada template
    const rawCertNum = participant.certNumber || '';
    const cleanCertNum = rawCertNum.replace(/^Nomor:\s*/i, '');
    const certNumWidth = fontSansBold.widthOfTextAtSize(cleanCertNum, certNumSize);
    // Garis nomor berada di sekitar 52.3% dari lebar lembar
    const certNumX = (pageWidth * 0.523) - (certNumWidth / 2);
    page.drawText(cleanCertNum, {
      x: Math.max(20, certNumX),
      y: certNumY,
      size: certNumSize,
      font: fontSansBold,
      color: rgb(0.08, 0.12, 0.2),
    });

    // Nama Peserta (Ditempatkan di atas garis biru tengah)
    const nameSize = settings.nameFontSize || 26;
    const nameY = pageHeight * (1 - (settings.namePositionY || 45.8) / 100);
    const nameWidth = fontSansBold.widthOfTextAtSize(participant.name, nameSize);
    const nameColor = hexToRgb(settings.nameColor || '#0F2B5C');

    page.drawText(participant.name, {
      x: (pageWidth - nameWidth) / 2,
      y: nameY,
      size: nameSize,
      font: fontSansBold,
      color: nameColor,
    });

    // Instansi / Kampus (Ditempatkan di atas garis kedua)
    if (participant.institution) {
      const instText = participant.institution;
      const instSize = 13;
      const instWidth = fontSans.widthOfTextAtSize(instText, instSize);
      const instY = pageHeight * (1 - 0.512);
      page.drawText(instText, {
        x: (pageWidth - instWidth) / 2,
        y: instY,
        size: instSize,
        font: fontSans,
        color: rgb(0.2, 0.25, 0.35),
      });
    }

    // Catatan: Tanda tangan, nama penandatangan (Rektor UBB & Kepala Kanwil DJPb),
    // serta cap kedinasan sudah melekat permanen pada file template (certificate-template.jpeg).
    // Sehingga tidak perlu dicetak ulang agar tanda tangan dan cap scan asli tetap jernih dan otentik.

    // Embed QR Code verifikasi di tengah bawah secara elegan (di antara kedua penandatangan)
    const qrSize = 50;
    page.drawImage(qrImage, {
      x: (pageWidth - qrSize) / 2,
      y: 52,
      width: qrSize,
      height: qrSize,
    });

    const scanText = 'Scan Keabsahan Digital';
    const scanWidth = fontSans.widthOfTextAtSize(scanText, 7);
    page.drawText(scanText, {
      x: (pageWidth - scanWidth) / 2,
      y: 42,
      size: 7,
      font: fontSans,
      color: rgb(0.3, 0.35, 0.45),
    });

  } else {
    // 2. Default Standalone Vector Design (Resmi Kemenkeu DJPb Babel)
    // Latar belakang cream mewah
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(0.99, 0.99, 0.98),
    });

    // Border Luar: Biru Tua Kemenkeu (#0F2B5C)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: pageWidth - 40,
      height: pageHeight - 40,
      borderColor: rgb(0.06, 0.17, 0.36),
      borderWidth: 4,
    });

    // Border Dalam: Emas Kehormatan (#D4AF37)
    page.drawRectangle({
      x: 28,
      y: 28,
      width: pageWidth - 56,
      height: pageHeight - 56,
      borderColor: rgb(0.83, 0.69, 0.22),
      borderWidth: 1.5,
    });

    // Header Kemenkeu & DJPb
    const headerLine1 = "KEMENTERIAN KEUANGAN REPUBLIK INDONESIA";
    const headerLine2 = "DIREKTORAT JENDERAL PERBENDAHARAAN";
    const headerLine3 = "KANTOR WILAYAH PROVINSI KEPULAUAN BANGKA BELITUNG";

    const w1 = fontSansBold.widthOfTextAtSize(headerLine1, 10);
    const w2 = fontSansBold.widthOfTextAtSize(headerLine2, 12);
    const w3 = fontSans.widthOfTextAtSize(headerLine3, 10);

    page.drawText(headerLine1, {
      x: (pageWidth - w1) / 2,
      y: pageHeight - 55,
      size: 10,
      font: fontSansBold,
      color: rgb(0.2, 0.25, 0.35),
    });

    page.drawText(headerLine2, {
      x: (pageWidth - w2) / 2,
      y: pageHeight - 72,
      size: 12,
      font: fontSansBold,
      color: rgb(0.06, 0.17, 0.36),
    });

    page.drawText(headerLine3, {
      x: (pageWidth - w3) / 2,
      y: pageHeight - 88,
      size: 10,
      font: fontSans,
      color: rgb(0.3, 0.35, 0.45),
    });

    // Garis hiasan emas di bawah header
    page.drawLine({
      start: { x: (pageWidth - 300) / 2, y: pageHeight - 98 },
      end: { x: (pageWidth + 300) / 2, y: pageHeight - 98 },
      thickness: 1.5,
      color: rgb(0.83, 0.69, 0.22),
    });

    // Judul Sertifikat
    const certTitle = "SERTIFIKAT";
    const wCert = fontTitle.widthOfTextAtSize(certTitle, 36);
    page.drawText(certTitle, {
      x: (pageWidth - wCert) / 2,
      y: pageHeight - 145,
      size: 36,
      font: fontTitle,
      color: rgb(0.06, 0.17, 0.36),
    });

    // Nomor Sertifikat
    const certNum = `Nomor: ${participant.certNumber}`;
    const wNum = fontSans.widthOfTextAtSize(certNum, 11);
    page.drawText(certNum, {
      x: (pageWidth - wNum) / 2,
      y: pageHeight - 165,
      size: 11,
      font: fontSans,
      color: rgb(0.4, 0.45, 0.55),
    });

    // Teks Pembuka
    const givenText = "Diberikan dengan penghargaan kepada:";
    const wGiven = fontItalic.widthOfTextAtSize(givenText, 14);
    page.drawText(givenText, {
      x: (pageWidth - wGiven) / 2,
      y: pageHeight - 200,
      size: 14,
      font: fontItalic,
      color: rgb(0.25, 0.3, 0.4),
    });

    // NAMA PESERTA (Hero element)
    const nameText = participant.name;
    const nameSize = 32;
    const wName = fontName.widthOfTextAtSize(nameText, nameSize);
    page.drawText(nameText, {
      x: (pageWidth - wName) / 2,
      y: pageHeight - 250,
      size: nameSize,
      font: fontName,
      color: rgb(0.06, 0.17, 0.36),
    });

    // Garis ornamen bawah nama
    const lineHalfWidth = Math.max(wName / 2 + 30, 160);
    page.drawLine({
      start: { x: pageWidth / 2 - lineHalfWidth, y: pageHeight - 260 },
      end: { x: pageWidth / 2 + lineHalfWidth, y: pageHeight - 260 },
      thickness: 1,
      color: rgb(0.83, 0.69, 0.22),
    });

    // Instansi / Asal Kampus jika ada
    if (participant.institution) {
      const instText = participant.institution;
      const wInst = fontSansBold.widthOfTextAtSize(instText, 13);
      page.drawText(instText, {
        x: (pageWidth - wInst) / 2,
        y: pageHeight - 280,
        size: 13,
        font: fontSansBold,
        color: rgb(0.3, 0.35, 0.45),
      });
    }

    // Keterangan Peserta Acara
    const asParticipant = "Atas partisipasi aktifnya sebagai:";
    const wPart = fontSans.widthOfTextAtSize(asParticipant, 12);
    page.drawText(asParticipant, {
      x: (pageWidth - wPart) / 2,
      y: pageHeight - 310,
      size: 12,
      font: fontSans,
      color: rgb(0.3, 0.35, 0.45),
    });

    const roleBadge = "PESERTA";
    const wRole = fontSansBold.widthOfTextAtSize(roleBadge, 18);
    page.drawText(roleBadge, {
      x: (pageWidth - wRole) / 2,
      y: pageHeight - 338,
      size: 18,
      font: fontSansBold,
      color: rgb(0.83, 0.69, 0.22),
    });

    const eventName = `Dalam Acara ${settings.eventTitle}`;
    const wEvent = fontSansBold.widthOfTextAtSize(eventName, 15);
    page.drawText(eventName, {
      x: (pageWidth - wEvent) / 2,
      y: pageHeight - 370,
      size: 15,
      font: fontSansBold,
      color: rgb(0.06, 0.17, 0.36),
    });

    if (settings.subTitle) {
      const sub = `Tema: "${settings.subTitle}"`;
      const wSub = fontItalic.widthOfTextAtSize(sub, 11);
      page.drawText(sub, {
        x: (pageWidth - wSub) / 2,
        y: pageHeight - 390,
        size: 11,
        font: fontItalic,
        color: rgb(0.35, 0.4, 0.5),
      });
    }

    // Bagian Bawah: Tanda Tangan Bersama & QR Code di Tengah
    // 1. Tanda Tangan Kiri: Rektor Universitas Bangka Belitung
    const leftAlignX = 185;
    const sign2Title = settings.signatory2Title || "Rektor Universitas Bangka Belitung";
    const sign2Name = settings.signatory2Name || "Prof. Dr. Ibrahim, S.Fil., M.Si.";

    const wSign2Title = fontSans.widthOfTextAtSize(sign2Title, 10);
    const wSign2Name = fontSansBold.widthOfTextAtSize(sign2Name, 12);

    page.drawText(sign2Title, {
      x: leftAlignX - wSign2Title / 2,
      y: 115,
      size: 10,
      font: fontSans,
      color: rgb(0.2, 0.25, 0.35),
    });

    // Garis tanda tangan Rektor (Space Tanda Tangan Kiri)
    page.drawLine({
      start: { x: leftAlignX - 85, y: 65 },
      end: { x: leftAlignX + 85, y: 65 },
      thickness: 1,
      color: rgb(0.2, 0.25, 0.35),
    });

    page.drawText(sign2Name, {
      x: leftAlignX - wSign2Name / 2,
      y: 50,
      size: 12,
      font: fontSansBold,
      color: rgb(0.06, 0.17, 0.36),
    });

    // 2. QR Code Keabsahan: Di Tengah-Tengah (Center)
    const centerX = pageWidth / 2;
    const qrSize = 65;
    page.drawImage(qrImage, {
      x: centerX - qrSize / 2,
      y: 60,
      width: qrSize,
      height: qrSize,
    });

    const qrLabel = 'Scan Keaslian Sertifikat';
    const wQrLabel = fontSans.widthOfTextAtSize(qrLabel, 8);
    page.drawText(qrLabel, {
      x: centerX - wQrLabel / 2,
      y: 48,
      size: 8,
      font: fontSans,
      color: rgb(0.35, 0.4, 0.5),
    });

    const idLabel = `ID: ${participant.id}`;
    const wIdLabel = fontSans.widthOfTextAtSize(idLabel, 7);
    page.drawText(idLabel, {
      x: centerX - wIdLabel / 2,
      y: 38,
      size: 7,
      font: fontSans,
      color: rgb(0.5, 0.55, 0.65),
    });

    // 3. Tanda Tangan Kanan: Kepala Kanwil DJPb Prov Babel (Posisi Tidak Berubah)
    const rightAlignX = 650;
    const signLoc = `${settings.location || 'Pangkalpinang'}, ${settings.eventDateText || '28 Oktober 2026'}`;
    const signTitle = settings.signatoryTitle || "Kepala Kanwil DJPb Provinsi Kepulauan Bangka Belitung";
    const signName = settings.signatoryName || "Muhammad Mufti Arkan";

    const wSignLoc = fontSans.widthOfTextAtSize(signLoc, 10);
    const wSignTitle = fontSans.widthOfTextAtSize(signTitle, 10);
    const wSignName = fontSansBold.widthOfTextAtSize(signName, 12);

    page.drawText(signLoc, {
      x: rightAlignX - wSignLoc / 2,
      y: 130,
      size: 10,
      font: fontSans,
      color: rgb(0.2, 0.25, 0.35),
    });

    page.drawText(signTitle, {
      x: rightAlignX - wSignTitle / 2,
      y: 115,
      size: 10,
      font: fontSans,
      color: rgb(0.2, 0.25, 0.35),
    });

    // Garis tanda tangan Kepala Kanwil (Space Tanda Tangan Kanan)
    page.drawLine({
      start: { x: rightAlignX - 85, y: 65 },
      end: { x: rightAlignX + 85, y: 65 },
      thickness: 1,
      color: rgb(0.2, 0.25, 0.35),
    });

    page.drawText(signName, {
      x: rightAlignX - wSignName / 2,
      y: 50,
      size: 12,
      font: fontSansBold,
      color: rgb(0.06, 0.17, 0.36),
    });
  }

  return await pdfDoc.save();
}

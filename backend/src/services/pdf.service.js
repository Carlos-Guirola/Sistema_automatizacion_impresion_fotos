import sharp from 'sharp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { AppError } from '../utils/AppError.js';
import {
  DPI,
  buildFullPhotoLayout,
  buildPolaroidLayout,
  getPaperSize,
} from './paper.service.js';

const POINTS_PER_INCH = 72;
const POINTS_PER_MM = POINTS_PER_INCH / 25.4;
const colorPalette = {
  blanco: '#ffffff',
  negro: '#111111',
  rosado: '#f9a8d4',
  beige: '#f2e3c6',
  rojo: '#e11d48',
  lavanda: '#e9d5ff',
  cielo: '#bfdbfe',
  menta: '#bbf7d0',
  durazno: '#fed7aa',
  amarillo: '#fef3c7',
  lila: '#f5d0fe',
  azul: '#1d4ed8',
  verde: '#15803d',
  morado: '#7e22ce',
  naranja: '#c2410c',
  fucsia: '#be185d',
};

const iconCharacters = {
  corazon: '\u2665',
  estrella: '\u2605',
  brillo: '\u2726',
  flor: '\u273f',
};

const fontMap = {
  helvetica: StandardFonts.HelveticaBold,
  clasica: StandardFonts.TimesRomanBold,
  moderna: StandardFonts.CourierBold,
};

function toPixels(points) {
  return Math.round((points / POINTS_PER_INCH) * DPI);
}

function parseColor(value, fallback = '#ffffff') {
  const normalizedValue = String(value || '').trim().toLowerCase();
  const hex = colorPalette[normalizedValue] || normalizedValue || fallback;
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);

  if (!match) {
    return parseColor(fallback, '#ffffff');
  }

  const color = match[1];
  const red = parseInt(color.slice(0, 2), 16) / 255;
  const green = parseInt(color.slice(2, 4), 16) / 255;
  const blue = parseInt(color.slice(4, 6), 16) / 255;

  return rgb(red, green, blue);
}

async function prepareImage(buffer, frame) {
  return sharp(buffer)
    .rotate()
    .resize(toPixels(frame.width), toPixels(frame.height), {
      fit: 'cover',
      position: 'centre',
      kernel: sharp.kernel.lanczos3,
    })
    .jpeg({
      quality: 95,
      mozjpeg: true,
      chromaSubsampling: '4:4:4',
    })
    .toBuffer();
}

function yFromTop(pageHeight, y, height) {
  return pageHeight - y - height;
}

function drawCaptionIcon(page, icon, x, y, size, color, iconFont) {
  const character = iconCharacters[icon];

  if (!character) return;

  page.drawText(character, {
    x,
    y,
    size,
    font: iconFont,
    color,
  });
}

function drawPolaroidCaption(page, slot, pageHeight, customization, font, iconFont) {
  const captionText = String(customization.captionText || '').trim();
  const icon = customization.captionIcon || 'ninguno';

  if (!captionText && icon === 'ninguno') return;

  const textColor = parseColor(customization.textColor, '#111111');
  const captionY = yFromTop(pageHeight, slot.caption.y, slot.caption.height);
  const fontSize = Math.max(7, Math.min(12, slot.caption.height * 0.24));
  const iconSize = fontSize + 2;
  const gap = captionText && icon !== 'ninguno' ? 5 * POINTS_PER_MM : 0;
  const textWidth = captionText ? font.widthOfTextAtSize(captionText, fontSize) : 0;
  const iconCharacter = iconCharacters[icon];
  const iconWidth = iconCharacter ? iconFont.widthOfTextAtSize(iconCharacter, iconSize) : 0;
  const contentWidth = textWidth + gap + iconWidth;
  const startX = slot.caption.x + Math.max(0, (slot.caption.width - contentWidth) / 2);
  const baselineY = captionY + slot.caption.height * 0.42;
  const iconY = baselineY - (iconSize - fontSize) * 0.08;

  if (captionText) {
    page.drawText(captionText, {
      x: startX,
      y: baselineY,
      size: fontSize,
      font,
      color: textColor,
    });
  }

  if (iconCharacter) {
    drawCaptionIcon(page, icon, startX + textWidth + gap, iconY, iconSize, textColor, iconFont);
  }
}

function drawPolaroidGuides(page, slots, pageHeight) {
  const guideColor = rgb(0.78, 0.78, 0.74);

  for (const slot of slots) {
    page.drawRectangle({
      x: slot.x,
      y: yFromTop(pageHeight, slot.y, slot.height),
      width: slot.width,
      height: slot.height,
      borderColor: guideColor,
      borderWidth: 0.5,
    });
  }
}

async function drawPolaroid(page, pdfDoc, file, slot, pageHeight, customization, font, iconFont) {
  const processedImage = await prepareImage(file.buffer, slot.photo);
  const embeddedImage = await pdfDoc.embedJpg(processedImage);
  const polaroidY = yFromTop(pageHeight, slot.y, slot.height);
  const imageY = yFromTop(pageHeight, slot.photo.y, slot.photo.height);
  const frameColor = parseColor(customization.frameColor, '#ffffff');

  page.drawRectangle({
    x: slot.x,
    y: polaroidY,
    width: slot.width,
    height: slot.height,
    color: frameColor,
  });

  page.drawImage(embeddedImage, {
    x: slot.photo.x,
    y: imageY,
    width: slot.photo.width,
    height: slot.photo.height,
  });

  drawPolaroidCaption(page, slot, pageHeight, customization, font, iconFont);
}

async function drawFullPhoto(page, pdfDoc, file, paper) {
  const frame = {
    x: 0,
    y: 0,
    width: paper.width,
    height: paper.height,
  };
  const processedImage = await prepareImage(file.buffer, frame);
  const embeddedImage = await pdfDoc.embedJpg(processedImage);

  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: paper.width,
    height: paper.height,
  });
}

export async function generatePolaroidPdf({
  files,
  paperId = 'carta',
  mode = 'polaroid',
  customization = {},
}) {
  const paper = getPaperSize(paperId);
  const isFullPhoto = mode === 'foto-completa';
  const layout = isFullPhoto ? buildFullPhotoLayout(paperId) : buildPolaroidLayout(paperId);

  if (!paper || !layout) {
    throw new AppError('Tamano de papel no soportado');
  }

  if (!files?.length) {
    throw new AppError('Debes enviar al menos una imagen');
  }

  const pdfDoc = await PDFDocument.create();
  const fontKey = String(customization.fontFamily || 'helvetica').toLowerCase();
  const captionFont = await pdfDoc.embedFont(fontMap[fontKey] || StandardFonts.HelveticaBold);
  const iconFont = await pdfDoc.embedFont(StandardFonts.ZapfDingbats);
  const { slots } = layout;

  if (isFullPhoto) {
    for (const file of files) {
      const page = pdfDoc.addPage([paper.width, paper.height]);
      await drawFullPhoto(page, pdfDoc, file, paper);
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

    return {
      buffer: Buffer.from(pdfBytes),
      layout,
      pages: files.length,
    };
  }

  for (let index = 0; index < files.length; index += slots.length) {
    const pageFiles = files.slice(index, index + slots.length);
    const page = pdfDoc.addPage([paper.width, paper.height]);

    page.drawRectangle({
      x: 0,
      y: 0,
      width: paper.width,
      height: paper.height,
      color: rgb(1, 1, 1),
    });

    for (let photoIndex = 0; photoIndex < pageFiles.length; photoIndex += 1) {
      await drawPolaroid(
        page,
        pdfDoc,
        pageFiles[photoIndex],
        slots[photoIndex],
        paper.height,
        customization,
        captionFont,
        iconFont
      );
    }

    drawPolaroidGuides(page, slots.slice(0, pageFiles.length), paper.height);
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

  return {
    buffer: Buffer.from(pdfBytes),
    layout,
    pages: Math.ceil(files.length / slots.length),
  };
}

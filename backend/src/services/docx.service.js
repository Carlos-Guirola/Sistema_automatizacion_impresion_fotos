import sharp from 'sharp';
import { AppError } from '../utils/AppError.js';
import {
  DPI,
  buildFullPhotoLayout,
  buildPolaroidLayout,
  getPaperSize,
} from './paper.service.js';

const POINTS_PER_INCH = 72;
const POINTS_TO_EMU = 12700;
const POINTS_TO_TWIPS = 20;
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

const fontFamilies = {
  helvetica: 'Arial, Helvetica, sans-serif',
  clasica: 'Georgia, Times New Roman, serif',
  moderna: 'Courier New, monospace',
  redonda: 'Trebuchet MS, Arial, sans-serif',
};

function toPixels(points) {
  return Math.round((points / POINTS_PER_INCH) * DPI);
}

function toEmu(points) {
  return Math.round(points * POINTS_TO_EMU);
}

function toTwips(points) {
  return Math.round(points * POINTS_TO_TWIPS);
}

function normalizeColor(value, fallback = '#ffffff') {
  const normalizedValue = String(value || '').trim().toLowerCase();
  const hex = colorPalette[normalizedValue] || normalizedValue || fallback;
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);

  if (!match) {
    return normalizeColor(fallback, '#ffffff');
  }

  return `#${match[1]}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
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

function buildCaptionSvg(slot, customization) {
  const captionText = String(customization.captionText || '').trim();
  const icon = customization.captionIcon || 'ninguno';
  const iconCharacter = iconCharacters[icon];

  if (!captionText && !iconCharacter) return '';

  const textColor = normalizeColor(customization.textColor, '#111111');
  const fontFamily =
    fontFamilies[String(customization.fontFamily || 'helvetica').toLowerCase()] ||
    fontFamilies.helvetica;
  const fontSize = Math.round(Math.max(24, Math.min(42, toPixels(slot.caption.height) * 0.24)));
  const gap = toPixels(5 * POINTS_PER_MM);
  const captionX = toPixels(slot.caption.x + slot.caption.width / 2);
  const captionY = toPixels(slot.caption.y + slot.caption.height * 0.58);

  if (captionText && iconCharacter) {
    return `
      <text x="${captionX}" y="${captionY}" text-anchor="middle"
        font-family="${fontFamily}" font-size="${fontSize}" font-weight="700"
        fill="${textColor}">
        <tspan>${escapeXml(captionText)}</tspan><tspan dx="${gap}">${iconCharacter}</tspan>
      </text>`;
  }

  return `
    <text x="${captionX}" y="${captionY}" text-anchor="middle"
      font-family="${fontFamily}" font-size="${fontSize}" font-weight="700"
      fill="${textColor}">
      ${escapeXml(captionText || iconCharacter)}
    </text>`;
}

function buildPolaroidGuidesSvg(paper, slots) {
  const pageWidth = toPixels(paper.width);
  const pageHeight = toPixels(paper.height);
  const guides = slots.map(
    (slot) => `<rect x="${toPixels(slot.x)}" y="${toPixels(slot.y)}"
      width="${toPixels(slot.width)}" height="${toPixels(slot.height)}" />`
  );

  if (!guides.length) return null;

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}">
      <g stroke="#c7c7bd" stroke-width="2" fill="none">${guides.join('')}</g>
    </svg>`);
}

async function renderFullPhotoPage(file, paper) {
  const pageWidth = toPixels(paper.width);
  const pageHeight = toPixels(paper.height);
  const image = await prepareImage(file.buffer, {
    width: paper.width,
    height: paper.height,
  });

  return sharp({
    create: {
      width: pageWidth,
      height: pageHeight,
      channels: 3,
      background: '#ffffff',
    },
  })
    .composite([{ input: image, left: 0, top: 0 }])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();
}

async function renderPolaroidPage(files, paper, layout, customization) {
  const pageWidth = toPixels(paper.width);
  const pageHeight = toPixels(paper.height);
  const frameColor = normalizeColor(customization.frameColor, '#ffffff');
  const composites = [];
  const captionParts = [];

  for (let index = 0; index < files.length; index += 1) {
    const slot = layout.slots[index];
    const frameSvg = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}">
        <rect x="${toPixels(slot.x)}" y="${toPixels(slot.y)}"
          width="${toPixels(slot.width)}" height="${toPixels(slot.height)}"
          fill="${frameColor}" />
      </svg>`);
    const photo = await prepareImage(files[index].buffer, slot.photo);

    composites.push({ input: frameSvg, left: 0, top: 0 });
    composites.push({
      input: photo,
      left: toPixels(slot.photo.x),
      top: toPixels(slot.photo.y),
    });

    captionParts.push(buildCaptionSvg(slot, customization));
  }

  const captionsSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}">
      ${captionParts.join('')}
    </svg>`);
  const guidesSvg = buildPolaroidGuidesSvg(paper, layout.slots.slice(0, files.length));

  composites.push({ input: captionsSvg, left: 0, top: 0 });

  if (guidesSvg) {
    composites.push({ input: guidesSvg, left: 0, top: 0 });
  }

  return sharp({
    create: {
      width: pageWidth,
      height: pageHeight,
      channels: 3,
      background: '#ffffff',
    },
  })
    .composite(composites)
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();
}

function createStoredZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name);
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data);
    const crc = crc32(data);
    const localHeader = Buffer.alloc(30);

    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, name, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);

  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function buildDocumentXml(paper, images) {
  const widthTwips = toTwips(paper.width);
  const heightTwips = toTwips(paper.height);
  const widthEmu = toEmu(paper.width);
  const heightEmu = toEmu(paper.height);
  const orientation = paper.width > paper.height ? ' w:orient="landscape"' : '';
  const paragraphs = images
    .map((_, index) => {
      const relId = `rId${index + 1}`;
      const pageBreak = index < images.length - 1 ? '<w:br w:type="page"/>' : '';

      return `
        <w:p>
          <w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>
          <w:r>
            <w:drawing>
              <wp:inline distT="0" distB="0" distL="0" distR="0">
                <wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
                <wp:effectExtent l="0" t="0" r="0" b="0"/>
                <wp:docPr id="${index + 1}" name="ToolsPrint ${index + 1}"/>
                <wp:cNvGraphicFramePr>
                  <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                </wp:cNvGraphicFramePr>
                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                      <pic:nvPicPr>
                        <pic:cNvPr id="${index + 1}" name="page-${index + 1}.jpg"/>
                        <pic:cNvPicPr/>
                      </pic:nvPicPr>
                      <pic:blipFill>
                        <a:blip r:embed="${relId}"/>
                        <a:stretch><a:fillRect/></a:stretch>
                      </pic:blipFill>
                      <pic:spPr>
                        <a:xfrm>
                          <a:off x="0" y="0"/>
                          <a:ext cx="${widthEmu}" cy="${heightEmu}"/>
                        </a:xfrm>
                        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                      </pic:spPr>
                    </pic:pic>
                  </a:graphicData>
                </a:graphic>
              </wp:inline>
            </w:drawing>${pageBreak}
          </w:r>
        </w:p>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
      xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
      xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
      xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
      xmlns:w10="urn:schemas-microsoft-com:office:word"
      xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
      xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
      xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
      xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
      xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
      xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
      mc:Ignorable="w14 wp14">
      <w:body>
        ${paragraphs}
        <w:sectPr>
          <w:pgSz w:w="${widthTwips}" w:h="${heightTwips}"${orientation}/>
          <w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/>
          <w:cols w:space="0"/>
          <w:docGrid w:linePitch="360"/>
        </w:sectPr>
      </w:body>
    </w:document>`;
}

function buildDocumentRels(images) {
  const rels = images
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/page-${index + 1}.jpg"/>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      ${rels}
    </Relationships>`;
}

function buildContentTypes(images) {
  const imageOverrides = images
    .map(
      (_, index) =>
        `<Override PartName="/word/media/page-${index + 1}.jpg" ContentType="image/jpeg"/>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Default Extension="jpg" ContentType="image/jpeg"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      ${imageOverrides}
    </Types>`;
}

function buildRootRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>`;
}

function buildDocxBuffer(paper, images) {
  const files = [
    { name: '[Content_Types].xml', data: buildContentTypes(images) },
    { name: '_rels/.rels', data: buildRootRels() },
    { name: 'word/document.xml', data: buildDocumentXml(paper, images) },
    { name: 'word/_rels/document.xml.rels', data: buildDocumentRels(images) },
    ...images.map((image, index) => ({
      name: `word/media/page-${index + 1}.jpg`,
      data: image,
    })),
  ];

  return createStoredZip(files);
}

export async function generatePolaroidDocx({
  files,
  paperId = '4x6-horizontal',
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

  const pageImages = [];

  if (isFullPhoto) {
    for (const file of files) {
      pageImages.push(await renderFullPhotoPage(file, paper));
    }
  } else {
    const { slots } = layout;

    for (let index = 0; index < files.length; index += slots.length) {
      const pageFiles = files.slice(index, index + slots.length);
      pageImages.push(await renderPolaroidPage(pageFiles, paper, layout, customization));
    }
  }

  return {
    buffer: buildDocxBuffer(paper, pageImages),
    layout,
    pages: pageImages.length,
  };
}

import {
  buildFullPhotoLayout,
  buildPolaroidLayout,
  listPaperSizes,
} from '../services/paper.service.js';
import { generatePolaroidPdf } from '../services/pdf.service.js';
import { AppError } from '../utils/AppError.js';

function getPaperFromRequest(req) {
  return (
    req.body?.paperSize ||
    req.body?.papel ||
    req.query.paperSize ||
    req.query.papel ||
    '10x15-horizontal'
  );
}

function getModeFromRequest(req) {
  return req.body?.mode || req.body?.modo || req.query.mode || req.query.modo || 'polaroid';
}

function getCustomizationFromRequest(req) {
  return {
    frameColor: req.body?.frameColor || req.query.frameColor || 'blanco',
    captionText: req.body?.captionText || req.query.captionText || '',
    captionIcon: req.body?.captionIcon || req.query.captionIcon || 'ninguno',
    textColor: req.body?.textColor || req.query.textColor || 'negro',
  };
}

export function listarPapeles(req, res) {
  res.json({
    ok: true,
    data: listPaperSizes(),
  });
}

export function obtenerLayout(req, res) {
  const paperId = req.params.paperSize || getPaperFromRequest(req);
  const mode = getModeFromRequest(req);

  const layout =
    mode === 'foto-completa'
      ? buildFullPhotoLayout(paperId)
      : buildPolaroidLayout(paperId);

  if (!layout) {
    throw new AppError('Tamano de papel no soportado', 404);
  }

  res.json({
    ok: true,
    data: layout,
  });
}

export async function generarVistaPrevia(req, res) {
  const { buffer, layout, pages } = await generatePolaroidPdf({
    files: req.files,
    paperId: getPaperFromRequest(req),
    mode: getModeFromRequest(req),
    customization: getCustomizationFromRequest(req),
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="vista-previa-toolsprint.pdf"');
  res.setHeader('X-ToolsPrint-Pages', String(pages));
  res.setHeader('X-ToolsPrint-Photos-Per-Page', String(layout.grid.photosPerPage));
  res.send(buffer);
}

export async function generarPdf(req, res) {
  const mode = getModeFromRequest(req);

  const { buffer, layout, pages } = await generatePolaroidPdf({
    files: req.files,
    paperId: getPaperFromRequest(req),
    mode,
    customization: getCustomizationFromRequest(req),
  });

  res.setHeader('Content-Type', 'application/pdf');

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="toolsprint-${mode === 'foto-completa' ? 'fotos' : 'polaroid'}.pdf"`
  );

  res.setHeader('X-ToolsPrint-Pages', String(pages));
  res.setHeader('X-ToolsPrint-Photos-Per-Page', String(layout.grid.photosPerPage));

  res.send(buffer);
}
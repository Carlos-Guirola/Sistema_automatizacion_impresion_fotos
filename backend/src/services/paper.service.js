const POINTS_PER_INCH = 72;
const CM_TO_POINTS = POINTS_PER_INCH / 2.54;

export const DPI = 300;

const BASE_HORIZONTAL_POLAROID = {
  width: 3 * POINTS_PER_INCH,
  height: 4 * POINTS_PER_INCH,
};

export const paperSizes = {
  "carta-vertical": {
    id: "carta-vertical",
    label: "Carta vertical",
    width: 8.5 * POINTS_PER_INCH,
    height: 11 * POINTS_PER_INCH,
  },

  "carta-horizontal": {
    id: "carta-horizontal",
    label: "Carta horizontal",
    width: 11 * POINTS_PER_INCH,
    height: 8.5 * POINTS_PER_INCH,
  },

  "a4-vertical": {
    id: "a4-vertical",
    label: "A4 vertical",
    width: 8.27 * POINTS_PER_INCH,
    height: 11.69 * POINTS_PER_INCH,
  },

  "a4-horizontal": {
    id: "a4-horizontal",
    label: "A4 horizontal",
    width: 11.69 * POINTS_PER_INCH,
    height: 8.27 * POINTS_PER_INCH,
  },

  "4x6-vertical": {
    id: "4x6-vertical",
    label: "4 x 6 pulgadas vertical",
    width: 4 * POINTS_PER_INCH,
    height: 6 * POINTS_PER_INCH,
    forcedGrid: { columns: 1, rows: 2 },
  },

  "4x6-horizontal": {
    id: "4x6-horizontal",
    label: "4 x 6 pulgadas horizontal",
    width: 6 * POINTS_PER_INCH,
    height: 4 * POINTS_PER_INCH,
    forcedGrid: { columns: 2, rows: 1 },
  },

  "10x15-vertical": {
    id: "10x15-vertical",
    label: "10 x 15 cm vertical",
    width: 10 * CM_TO_POINTS,
    height: 15 * CM_TO_POINTS,
    forcedGrid: { columns: 1, rows: 2 },
  },

  "10x15-horizontal": {
    id: "10x15-horizontal",
    label: "10 x 15 cm horizontal",
    width: 15 * CM_TO_POINTS,
    height: 10 * CM_TO_POINTS,
    forcedGrid: { columns: 2, rows: 1 },
  },
};

const paperAliases = {
  carta: "carta-vertical",
  a4: "a4-vertical",
  "4x6": "10x15-horizontal",
  "10x15": "10x15-horizontal",
};

export function getPaperSize(paperId = "10x15-horizontal") {
  const normalizedPaperId = String(paperId).toLowerCase();

  return (
    paperSizes[normalizedPaperId] ||
    paperSizes[paperAliases[normalizedPaperId]]
  );
}

export function listPaperSizes() {
  return Object.values(paperSizes).map((paper) => ({
    id: paper.id,
    label: paper.label,
    widthPoints: Number(paper.width.toFixed(2)),
    heightPoints: Number(paper.height.toFixed(2)),
    widthInches: Number((paper.width / POINTS_PER_INCH).toFixed(2)),
    heightInches: Number((paper.height / POINTS_PER_INCH).toFixed(2)),
    widthCm: Number((paper.width / CM_TO_POINTS).toFixed(2)),
    heightCm: Number((paper.height / CM_TO_POINTS).toFixed(2)),
  }));
}

function buildPhotoFrame({ x, y, width, height }) {
  const sideMargin = width * 0.05;
  const topMargin = width * 0.05;
  const bottomMargin = height * 0.12;

  const availableWidth = width - sideMargin * 2;
  const availableHeight = height - topMargin - bottomMargin;

  const photoX = x + sideMargin;
  const photoY = y + topMargin;

  return {
    x: Math.round(photoX),
    y: Math.round(photoY),
    width: Math.round(availableWidth),
    height: Math.round(availableHeight),
  };
}

function buildCaptionFrame(slot, photo) {
  const sideMargin = slot.width * 0.05;
  const captionY = photo.y + photo.height;
  const captionBottom = slot.y + slot.height;

  return {
    x: Math.round(slot.x + sideMargin),
    y: Math.round(captionY),
    width: Math.round(slot.width - sideMargin * 2),
    height: Math.round(captionBottom - captionY),
  };
}

function buildFrame({ width, height }) {
  return {
    side: Math.round(width * 0.05),
    top: Math.round(width * 0.05),
    bottom: Math.round(height * 0.12),
  };
}

export function buildPolaroidLayout(paperId = "10x15-horizontal") {
  const paper = getPaperSize(paperId);

  if (!paper) {
    return null;
  }

  const columns =
    paper.forcedGrid?.columns ||
    Math.max(1, Math.floor(paper.width / BASE_HORIZONTAL_POLAROID.width));

  const rows =
    paper.forcedGrid?.rows ||
    Math.max(1, Math.floor(paper.height / BASE_HORIZONTAL_POLAROID.height));

  const slotWidth = paper.width / columns;
  const slotHeight = paper.height / rows;

  const slots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * slotWidth;
      const y = row * slotHeight;

      const slot = {
        x,
        y,
        width: slotWidth,
        height: slotHeight,
      };

      const photo = buildPhotoFrame(slot);

      slots.push({
        index: slots.length + 1,
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(slotWidth),
        height: Math.round(slotHeight),
        frame: buildFrame(slot),
        photo,
        caption: buildCaptionFrame(slot, photo),
      });
    }
  }

  return {
    paper: {
      id: paper.id,
      label: paper.label,
      width: Number(paper.width.toFixed(2)),
      height: Number(paper.height.toFixed(2)),
      widthCm: Number((paper.width / CM_TO_POINTS).toFixed(2)),
      heightCm: Number((paper.height / CM_TO_POINTS).toFixed(2)),
    },

    grid: {
      columns,
      rows,
      photosPerPage: columns * rows,
    },

    slots,
  };
}

export function buildFullPhotoLayout(paperId = "10x15-horizontal") {
  const paper = getPaperSize(paperId);

  if (!paper) {
    return null;
  }

  return {
    paper: {
      id: paper.id,
      label: paper.label,
      width: Number(paper.width.toFixed(2)),
      height: Number(paper.height.toFixed(2)),
      widthCm: Number((paper.width / CM_TO_POINTS).toFixed(2)),
      heightCm: Number((paper.height / CM_TO_POINTS).toFixed(2)),
    },

    grid: {
      columns: 1,
      rows: 1,
      photosPerPage: 1,
    },

    slots: [
      {
        index: 1,
        x: 0,
        y: 0,
        width: Math.round(paper.width),
        height: Math.round(paper.height),
        photo: {
          x: 0,
          y: 0,
          width: Math.round(paper.width),
          height: Math.round(paper.height),
        },
      },
    ],
  };
}
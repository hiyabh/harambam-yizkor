// Builds the RTL Word document (David 12pt, black and white, centered headings, page numbers).
const FONT = "David";
const BODY_HALF_POINTS = 24;
const H1_HALF_POINTS = 36;
const H2_HALF_POINTS = 32;
const LANG = "he-IL";
const A4_WIDTH_TWIPS = 11906;
const A4_HEIGHT_TWIPS = 16838;
const MARGIN_TWIPS = 1134;
const LINE_SPACING_TWIPS = 300;
const HEADING_SPACE_BEFORE = 360;
const HEADING_SPACE_AFTER = 200;

function run(docx, text, { bold = false, size = BODY_HALF_POINTS } = {}) {
  return new docx.TextRun({
    text,
    bold,
    size,
    font: { name: FONT, hint: "cs" },
    rightToLeft: true,
    language: { value: LANG, bidirectional: LANG },
  });
}

function heading(docx, text, size) {
  return new docx.Paragraph({
    bidirectional: true,
    alignment: docx.AlignmentType.CENTER,
    spacing: { before: HEADING_SPACE_BEFORE, after: HEADING_SPACE_AFTER },
    keepNext: true,
    children: [run(docx, text, { bold: true, size })],
  });
}

function nameLine(docx, text) {
  return new docx.Paragraph({
    bidirectional: true,
    spacing: { line: LINE_SPACING_TWIPS },
    children: [run(docx, text)],
  });
}

function footer(docx) {
  return new docx.Footer({
    children: [
      new docx.Paragraph({
        bidirectional: true,
        alignment: docx.AlignmentType.CENTER,
        children: [new docx.TextRun({ children: [docx.PageNumber.CURRENT], font: { name: FONT }, size: BODY_HALF_POINTS })],
      }),
    ],
  });
}

function section(docx, children) {
  return {
    properties: {
      page: {
        size: { width: A4_WIDTH_TWIPS, height: A4_HEIGHT_TWIPS },
        margin: { top: MARGIN_TWIPS, bottom: MARGIN_TWIPS, left: MARGIN_TWIPS, right: MARGIN_TWIPS },
      },
      rtlGutter: true,
      bidi: true,
    },
    footers: { default: footer(docx) },
    children,
  };
}

export async function buildDocx(docx, lists, config) {
  const children = [
    heading(docx, `שמות לאזכרה לנפטרים ליום כיפור ${config.yearLabel}`, H1_HALF_POINTS),
    heading(docx, config.communityName, BODY_HALF_POINTS),
    heading(docx, 'לע"נ - גברים', H2_HALF_POINTS),
    ...lists.men.map((e) => nameLine(docx, e.name)),
    new docx.Paragraph({ children: [], pageBreakBefore: true }),
    heading(docx, 'לע"נ - נשים', H2_HALF_POINTS),
    ...lists.women.map((e) => nameLine(docx, e.name)),
  ];
  const doc = new docx.Document({
    creator: config.rabbiName,
    title: `שמות לאזכרה לנפטרים ליום כיפור ${config.yearLabel}`,
    styles: {
      default: {
        document: {
          run: { font: FONT, size: BODY_HALF_POINTS, language: { value: LANG, bidirectional: LANG } },
        },
      },
    },
    sections: [section(docx, children)],
  });
  return docx.Packer.toBlob(doc);
}

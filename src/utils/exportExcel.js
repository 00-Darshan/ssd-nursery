import ExcelJS from "exceljs";

const HEADER_COLUMNS = [
  "#",
  "Image",
  "Plant Name",
  "Kannada Name",
  "Scientific Name",
  "Category",
  "Placement",
  "Origin",
  "Benefits",
  "Quantity",
];

const COL_COUNT = HEADER_COLUMNS.length;

// ARGB colors (ExcelJS requires FF alpha prefix)
const C_GREEN_BRAND = "FF16A34A";
const C_GREEN_BADGE = "FF4ADE80";
const C_GREEN_PALE  = "FFF0FDF4";
const C_GREEN_DEEP  = "FF14532D";
const C_GRAY        = "FFF3F4F6";
const C_YELLOW      = "FFFEF9C3";
const C_WHITE       = "FFFFFFFF";
const C_LOAM        = "FF4B4036";
const C_DARK        = "FF241F1A";
const C_BORDER      = "FFD9EAD3";

const BORDER = {
  top:    { style: "thin", color: { argb: C_BORDER } },
  right:  { style: "thin", color: { argb: C_BORDER } },
  bottom: { style: "thin", color: { argb: C_BORDER } },
  left:   { style: "thin", color: { argb: C_BORDER } },
};

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const pad = (v) => String(v).padStart(2, "0");

const formatDateForFilename = (d) =>
  `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;

const formatDateLong = (d) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(d);

const formatPlacement = (p) =>
  p === "both" ? "Both" : p === "sun" ? "Sun" : p === "shade" ? "Shade" : p || "";

const getImageExtension = (url) => {
  const path = (url || "").split("?")[0].toLowerCase();
  if (path.endsWith(".png")) return "png";
  if (path.endsWith(".gif")) return "gif";
  return "jpeg";
};

const fetchImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result !== "string") { resolve(null); return; }
        resolve(result.split(",")[1] || null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const styleRow = (row, style) =>
  row.eachCell({ includeEmpty: true }, (cell) => Object.assign(cell, style));

// â”€â”€â”€ Sheet builders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const buildPlantRows = (cartItems, plants) => {
  const lookup = new Map(plants.map((p) => [String(p.id), p]));
  return cartItems.map((item, index) => {
    const plant = lookup.get(String(item.plantId)) || {};
    const categories = plant.categories || plant.category || [];
    return {
      plant,
      values: [
        index + 1,
        "",                                                               // Image (embedded separately)
        plant.name || "Unknown plant",
        plant.kannada_name || "",
        plant.scientific_name || "",
        Array.isArray(categories) ? categories.join(", ") : "",
        formatPlacement(plant.placement),
        plant.origin || "",
        Array.isArray(plant.benefits) ? plant.benefits.join(", ") : "",
        Number(item.quantity) || 0,
      ],
    };
  });
};

const addPlantListSheet = async (workbook, { generatedDate, plantRows, totalQuantity }) => {
  const ws = workbook.addWorksheet("Plant List");

  ws.columns = [
    { width: 5  },   // #
    { width: 13 },   // Image
    { width: 22 },   // Plant Name
    { width: 18 },   // Kannada Name
    { width: 22 },   // Scientific Name
    { width: 20 },   // Category
    { width: 12 },   // Placement
    { width: 18 },   // Origin
    { width: 40 },   // Benefits
    { width: 10 },   // Quantity
  ];

  // Row 1 â€” Title
  ws.addRow(["Sri Sai Darshan Nursery \u2014 Plant Procurement List"]);
  ws.mergeCells(1, 1, 1, COL_COUNT);
  ws.getRow(1).height = 30;
  styleRow(ws.getRow(1), {
    font:      { bold: true, color: { argb: C_WHITE }, size: 16 },
    fill:      { type: "pattern", pattern: "solid", fgColor: { argb: C_GREEN_BRAND } },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border:    BORDER,
  });

  // Row 2 â€” Date
  ws.addRow([`Generated on: ${generatedDate}`]);
  ws.mergeCells(2, 1, 2, COL_COUNT);
  ws.getRow(2).height = 24;
  styleRow(ws.getRow(2), {
    font:      { italic: true, color: { argb: C_LOAM } },
    fill:      { type: "pattern", pattern: "solid", fgColor: { argb: C_GRAY } },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border:    BORDER,
  });

  // Row 3 â€” Headers
  ws.addRow(HEADER_COLUMNS);
  ws.getRow(3).height = 26;
  styleRow(ws.getRow(3), {
    font:      { bold: true, color: { argb: C_GREEN_DEEP }, size: 11 },
    fill:      { type: "pattern", pattern: "solid", fgColor: { argb: C_GREEN_BADGE } },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border:    BORDER,
  });

  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: COL_COUNT } };

  // Data rows
  const DATA_START = 4;
  for (let i = 0; i < plantRows.length; i++) {
    const rowNum = DATA_START + i;
    const bg = rowNum % 2 === 0 ? C_GREEN_PALE : C_WHITE;
    ws.addRow(plantRows[i].values);
    ws.getRow(rowNum).height = 65;
    ws.getRow(rowNum).eachCell({ includeEmpty: true }, (cell, col) => {
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.border    = BORDER;
      cell.alignment =
        col === 1 || col === COL_COUNT
          ? { horizontal: "center", vertical: "middle", wrapText: true }
          : { vertical: "top", wrapText: true };
    });
  }

  // Total row
  const totalRowNum = DATA_START + plantRows.length;
  ws.addRow(["Total Plants Selected:", ...Array(COL_COUNT - 2).fill(""), totalQuantity]);
  ws.getRow(totalRowNum).height = 24;
  styleRow(ws.getRow(totalRowNum), {
    font:      { bold: true, color: { argb: C_DARK } },
    fill:      { type: "pattern", pattern: "solid", fgColor: { argb: C_YELLOW } },
    alignment: { vertical: "middle", wrapText: true },
    border:    BORDER,
  });

  // Embed plant images into column B (0-based index 1)
  for (let i = 0; i < plantRows.length; i++) {
    const { plant } = plantRows[i];
    const imageUrl = plant.image || plant.image_url;
    if (!imageUrl) continue;

    const base64 = await fetchImageAsBase64(imageUrl);
    if (!base64) continue;

    try {
      const imageId = workbook.addImage({ base64, extension: getImageExtension(imageUrl) });
      ws.addImage(imageId, {
        tl:  { col: 1, row: DATA_START + i - 1 }, // 0-indexed: col B, correct data row
        ext: { width: 80, height: 80 },
      });
    } catch {
      // skip if embedding fails for this image
    }
  }
};

const addSummarySheet = (workbook, { generatedDate, plantRows, totalQuantity }) => {
  const ws = workbook.addWorksheet("Summary");
  ws.columns = [{ width: 28 }, { width: 52 }, { width: 16 }, { width: 16 }];

  const categories = Array.from(
    new Set(
      plantRows
        .flatMap(({ values }) => String(values[5] || "").split(","))
        .map((c) => c.trim())
        .filter(Boolean),
    ),
  );

  const rows = [
    ["Sri Sai Darshan Nursery"],
    ["Generated on", generatedDate],
    ["Total plant types selected", plantRows.length],
    ["Total quantity", totalQuantity],
    ["Categories present", categories.join(", ") || "None"],
  ];

  rows.forEach((rowData, idx) => {
    ws.addRow(rowData);
    const row = ws.getRow(idx + 1);
    row.height = 24;
    if (idx === 0) {
      ws.mergeCells(1, 1, 1, 4);
      styleRow(row, {
        font:      { bold: true, color: { argb: C_WHITE }, size: 16 },
        fill:      { type: "pattern", pattern: "solid", fgColor: { argb: C_GREEN_BRAND } },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        border:    BORDER,
      });
    } else {
      styleRow(row, {
        font:      { bold: idx === 1 || idx === 2 },
        fill:      { type: "pattern", pattern: "solid", fgColor: { argb: idx % 2 === 0 ? C_GREEN_PALE : C_WHITE } },
        alignment: { vertical: "middle", wrapText: true },
        border:    BORDER,
      });
    }
  });
};

// â”€â”€â”€ Public export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function exportToExcel(cartItems, plants) {
  if (!cartItems?.length) return;

  const now = new Date();
  const generatedDate = formatDateLong(now);
  const plantRows = buildPlantRows(cartItems, plants);
  const totalQuantity = plantRows.reduce((sum, { values }) => sum + (Number(values[9]) || 0), 0);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "GreenPick";
  workbook.created = now;

  await addPlantListSheet(workbook, { generatedDate, plantRows, totalQuantity });
  addSummarySheet(workbook, { generatedDate, plantRows, totalQuantity });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `SSD_Nursery_Plant_List_${formatDateForFilename(now)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

import * as XLSX from "xlsx";

const HEADER_COLUMNS = [
  "#",
  "Plant Name",
  "Kannada Name",
  "Scientific Name",
  "Category",
  "Placement",
  "Origin",
  "Benefits",
  "Quantity",
];

const border = {
  top: { style: "thin", color: { rgb: "D9EAD3" } },
  right: { style: "thin", color: { rgb: "D9EAD3" } },
  bottom: { style: "thin", color: { rgb: "D9EAD3" } },
  left: { style: "thin", color: { rgb: "D9EAD3" } },
};

const alignmentCenter = {
  horizontal: "center",
  vertical: "center",
  wrapText: true,
};

const pad = (value) => String(value).padStart(2, "0");

const formatDateForFilename = (date) =>
  `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

const formatDateLong = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

const formatPlacement = (placement) => {
  if (placement === "both") return "Both";
  if (placement === "sun") return "Sun";
  if (placement === "shade") return "Shade";
  return placement || "";
};

const setCellStyle = (worksheet, row, col, style) => {
  const address = XLSX.utils.encode_cell({ r: row, c: col });
  if (!worksheet[address]) return;
  worksheet[address].s = style;
};

const setRowStyle = (worksheet, row, colCount, style) => {
  for (let col = 0; col < colCount; col += 1) {
    setCellStyle(worksheet, row, col, style);
  }
};

const calculateColumnWidths = (rows) =>
  HEADER_COLUMNS.map((_, colIndex) => {
    const maxLength = rows.reduce((largest, row) => {
      const value = row[colIndex] == null ? "" : String(row[colIndex]);
      return Math.max(largest, value.length);
    }, HEADER_COLUMNS[colIndex].length);

    const cappedWidth = Math.min(Math.max(maxLength + 2, 10), colIndex === 7 ? 48 : 30);
    return { wch: cappedWidth };
  });

const buildPlantRows = (cartItems, plants) => {
  const plantLookup = new Map(plants.map((plant) => [String(plant.id), plant]));

  return cartItems.map((cartItem, index) => {
    const plant = plantLookup.get(String(cartItem.plantId)) || {};

    return [
      index + 1,
      plant.name || "Unknown plant",
      plant.kannada_name || "",
      plant.scientific_name || "",
      Array.isArray(plant.category) ? plant.category.join(", ") : "",
      formatPlacement(plant.placement),
      plant.origin || "",
      Array.isArray(plant.benefits) ? plant.benefits.join(", ") : "",
      Number(cartItem.quantity) || 0,
    ];
  });
};

const applyPlantListStyles = (worksheet, rowCount, totalRowIndex) => {
  const colCount = HEADER_COLUMNS.length;

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
  ];

  worksheet["!rows"] = [
    { hpt: 30 },
    { hpt: 24 },
    { hpt: 26 },
    ...Array.from({ length: Math.max(rowCount - 4, 0) }, () => ({ hpt: 24 })),
  ];

  setRowStyle(worksheet, 0, colCount, {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16 },
    fill: { patternType: "solid", fgColor: { rgb: "16A34A" } },
    alignment: alignmentCenter,
    border,
  });

  setRowStyle(worksheet, 1, colCount, {
    font: { italic: true, color: { rgb: "4B4036" } },
    fill: { patternType: "solid", fgColor: { rgb: "F3F4F6" } },
    alignment: alignmentCenter,
    border,
  });

  setRowStyle(worksheet, 2, colCount, {
    font: { bold: true, color: { rgb: "14532D" } },
    fill: { patternType: "solid", fgColor: { rgb: "4ADE80" } },
    alignment: alignmentCenter,
    border,
  });

  for (let row = 3; row < totalRowIndex; row += 1) {
    setRowStyle(worksheet, row, colCount, {
      fill: {
        patternType: "solid",
        fgColor: { rgb: row % 2 === 0 ? "F0FDF4" : "FFFFFF" },
      },
      alignment: { vertical: "top", wrapText: true },
      border,
    });

    setCellStyle(worksheet, row, 0, {
      fill: {
        patternType: "solid",
        fgColor: { rgb: row % 2 === 0 ? "F0FDF4" : "FFFFFF" },
      },
      alignment: alignmentCenter,
      border,
    });
    setCellStyle(worksheet, row, 8, {
      fill: {
        patternType: "solid",
        fgColor: { rgb: row % 2 === 0 ? "F0FDF4" : "FFFFFF" },
      },
      alignment: alignmentCenter,
      border,
    });
  }

  setRowStyle(worksheet, totalRowIndex, colCount, {
    font: { bold: true, color: { rgb: "241F1A" } },
    fill: { patternType: "solid", fgColor: { rgb: "FEF9C3" } },
    alignment: { vertical: "center", wrapText: true },
    border,
  });
};

const buildSummarySheet = ({ generatedDate, plantRows, totalQuantity }) => {
  const categories = Array.from(
    new Set(
      plantRows
        .flatMap((row) => String(row[4] || "").split(","))
        .map((category) => category.trim())
        .filter(Boolean),
    ),
  );

  const data = [
    ["Sri Sai Darshan Nursery"],
    ["Generated on", generatedDate],
    ["Total plant types selected", plantRows.length],
    ["Total quantity", totalQuantity],
    ["Categories present", categories.join(", ") || "None"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
  worksheet["!cols"] = [{ wch: 28 }, { wch: 52 }, { wch: 16 }, { wch: 16 }];

  setRowStyle(worksheet, 0, 4, {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16 },
    fill: { patternType: "solid", fgColor: { rgb: "16A34A" } },
    alignment: alignmentCenter,
    border,
  });

  for (let row = 1; row < data.length; row += 1) {
    setRowStyle(worksheet, row, 4, {
      font: { bold: row === 2 || row === 3 },
      fill: {
        patternType: "solid",
        fgColor: { rgb: row % 2 === 0 ? "F0FDF4" : "FFFFFF" },
      },
      alignment: { vertical: "center", wrapText: true },
      border,
    });
  }

  return worksheet;
};

export function exportToExcel(cartItems, plants) {
  if (!cartItems?.length) return;

  const now = new Date();
  const generatedDate = formatDateLong(now);
  const plantRows = buildPlantRows(cartItems, plants);
  const totalQuantity = plantRows.reduce((total, row) => total + (Number(row[8]) || 0), 0);
  const totalRow = [
    "Total Plants Selected:",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    totalQuantity,
  ];

  const worksheetRows = [
    ["Sri Sai Darshan Nursery — Plant Procurement List", "", "", "", "", "", "", "", ""],
    [`Generated on: ${generatedDate}`, "", "", "", "", "", "", "", ""],
    HEADER_COLUMNS,
    ...plantRows,
    totalRow,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows);
  const totalRowIndex = worksheetRows.length - 1;
  worksheet["!cols"] = calculateColumnWidths(worksheetRows);
  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 2, c: 0 },
      e: { r: Math.max(totalRowIndex - 1, 2), c: HEADER_COLUMNS.length - 1 },
    }),
  };
  applyPlantListStyles(worksheet, worksheetRows.length, totalRowIndex);

  const summarySheet = buildSummarySheet({
    generatedDate,
    plantRows,
    totalQuantity,
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Plant List");
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  XLSX.writeFile(workbook, `SSD_Nursery_Plant_List_${formatDateForFilename(now)}.xlsx`, {
    cellStyles: true,
  });
}

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const pdfWidthPx = 794;

const formatDate = () =>
  new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

const setStyles = (element, styles) => {
  Object.assign(element.style, styles);
  return element;
};

const createText = (tag, text, styles = {}) => {
  const element = document.createElement(tag);
  element.textContent = text;
  return setStyles(element, styles);
};

const createPdfShell = (title) => {
  const shell = setStyles(document.createElement("div"), {
    width: `${pdfWidthPx}px`,
    padding: "42px",
    background: "#ffffff",
    color: "#241f1a",
    fontFamily: '"Plus Jakarta Sans", Arial, sans-serif',
    position: "fixed",
    left: "-10000px",
    top: "0",
    zIndex: "-1",
  });

  shell.appendChild(
    createText("h1", title, {
      margin: "0 0 8px",
      fontSize: "26px",
      lineHeight: "1.2",
      color: "#14532d",
    }),
  );
  shell.appendChild(
    createText("p", `Date generated: ${formatDate()}`, {
      margin: "0 0 28px",
      fontSize: "13px",
      color: "#5f554c",
    }),
  );

  return shell;
};

const waitForImages = async (element) => {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.onload = resolve;
          image.onerror = resolve;
        }),
    ),
  );
};

const renderElementToPdf = async (element, filename) => {
  document.body.appendChild(element);
  await waitForImages(element);

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;
  const imageData = canvas.toDataURL("image/jpeg", 0.98);

  let remainingHeight = imageHeight;
  let position = 0;

  pdf.addImage(imageData, "JPEG", 0, position, pageWidth, imageHeight);
  remainingHeight -= pageHeight;

  while (remainingHeight > 0) {
    position = remainingHeight - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, "JPEG", 0, position, pageWidth, imageHeight);
    remainingHeight -= pageHeight;
  }

  pdf.save(filename);
  element.remove();
};

export const exportSimplePDF = async (items) => {
  if (!items.length) return;

  const shell = createPdfShell("Plant Procurement List");
  const table = setStyles(document.createElement("table"), {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
  });

  const headerRow = document.createElement("tr");
  ["#", "Plant Name", "Kannada Name", "Scientific Name", "Quantity"].forEach((label) => {
    const header = createText("th", label, {
      padding: "10px 8px",
      border: "1px solid #d8e7d6",
      background: "#dcfce7",
      color: "#14532d",
      textAlign: label === "Quantity" ? "center" : "left",
    });
    headerRow.appendChild(header);
  });
  table.appendChild(headerRow);

  items.forEach((item, index) => {
    const row = document.createElement("tr");
    [
      index + 1,
      item.plant.name,
      item.plant.kannada_name,
      item.plant.scientific_name,
      item.quantity,
    ].forEach((value, valueIndex) => {
      const cell = createText("td", String(value), {
        padding: "10px 8px",
        border: "1px solid #e7ede5",
        verticalAlign: "top",
        textAlign: valueIndex === 4 ? "center" : "left",
      });
      row.appendChild(cell);
    });
    table.appendChild(row);
  });

  shell.appendChild(table);
  await renderElementToPdf(shell, "greenpick-plant-procurement-list.pdf");
};

export const exportDetailedPDF = async (items) => {
  if (!items.length) return;

  const shell = createPdfShell("Plant Procurement List — Detailed");
  const list = setStyles(document.createElement("div"), {
    display: "grid",
    gap: "16px",
  });

  items.forEach((item, index) => {
    const card = setStyles(document.createElement("article"), {
      display: "grid",
      gridTemplateColumns: "112px 1fr",
      gap: "16px",
      padding: "14px",
      border: "1px solid #d8e7d6",
      borderRadius: "14px",
      breakInside: "avoid",
      background: "#fbfdf8",
    });

    const image = setStyles(document.createElement("img"), {
      width: "112px",
      height: "112px",
      objectFit: "cover",
      borderRadius: "12px",
      background: "#dcfce7",
    });
    image.alt = item.plant.name;
    image.crossOrigin = "anonymous";
    image.src = item.plant.image;

    const content = document.createElement("div");
    content.appendChild(
      createText("p", `${index + 1}. ${item.plant.name}`, {
        margin: "0 0 4px",
        fontSize: "17px",
        fontWeight: "800",
        color: "#14532d",
      }),
    );
    content.appendChild(
      createText("p", item.plant.kannada_name, {
        margin: "0 0 3px",
        fontSize: "13px",
        fontWeight: "700",
      }),
    );
    content.appendChild(
      createText("p", item.plant.scientific_name, {
        margin: "0 0 10px",
        fontSize: "12px",
        fontStyle: "italic",
        color: "#5f554c",
      }),
    );
    content.appendChild(
      createText(
        "p",
        `Placement: ${item.plant.placement}  |  Quantity: ${item.quantity}`,
        {
          margin: "0 0 8px",
          fontSize: "12px",
          fontWeight: "700",
          color: "#241f1a",
          textTransform: "capitalize",
        },
      ),
    );
    content.appendChild(
      createText("p", `Benefits: ${item.plant.benefits.join(", ")}`, {
        margin: "0",
        fontSize: "12px",
        lineHeight: "1.55",
        color: "#4b4036",
      }),
    );

    card.appendChild(image);
    card.appendChild(content);
    list.appendChild(card);
  });

  shell.appendChild(list);
  await renderElementToPdf(shell, "greenpick-plant-procurement-list-detailed.pdf");
};

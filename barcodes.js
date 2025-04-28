const csvContentExample = `Kod_produktu;EAN;Pocet_kusu
112-192;;10,00
624-298;;5,00
624-094;;5,00
624-171;;5,00
732-107;5999082000075;1,00
732-106;5999082000051;1,00`;

const fileInput = document.getElementById("csvFile");
const showEanCheckbox = document.getElementById("showEan");
const submitButton = document.getElementById("processCsv");
const barcodeContainer = document.getElementById("barcodeContainer");

document.body.onload = function () {
  // Load the CSV and showEan state from localStorage on page load
  const savedCsv = localStorage.getItem("savedCsv");
  const savedShowEan = localStorage.getItem("savedShowEan") === "true";
  if (savedCsv) {
    showEanCheckbox.checked = savedShowEan;
    generateBarcodes(savedCsv, savedShowEan);
    //   } else {
    //     generateBarcodes(csvContentExample, true);
  }
};

document.getElementById("processCsv").addEventListener("click", function () {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a CSV file.");
    return;
  }
  const showEan = showEanCheckbox.checked;

  const reader = new FileReader();
  reader.onload = function (event) {
    const csvContent = event.target.result;
    generateBarcodes(csvContent, showEan);
    saveCsvToLocalStorage(csvContent, showEan);
  };
  reader.readAsText(file);
});

function generateBarcodes(csvContent, showEan) {
  barcodeContainer.innerHTML = ""; // Clear previous barcodes

  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");

  lines.forEach((line, index) => {
    if (index === 0) return; // Skip header line
    const [productCode, ean, itemsCount] = line.split(";");
    if(!productCode || !itemsCount) return; // Skip if product code or items count is missing

    const barcodeDiv = document.createElement("div");
    barcodeDiv.classList.add("item");

    // Product code barcode
    barcodeDiv.appendChild(
      createBarcode(productCode.trim(), "CODE128", "productCode")
    );

    // Items count
    const itemsCountInt = parseInt(itemsCount.replace(",", "."), 10);
    barcodeDiv.appendChild(createCounter(itemsCountInt, "itemsCount"));

    // EAN barcode
    if (showEan && (ean || "").trim()) {
      barcodeDiv.appendChild(createBarcode(ean.trim(), "EAN13", "ean"));
    }

    // Append the barcodeDiv to the container
    barcodeContainer.appendChild(barcodeDiv);
  });
}

function createBarcode(value, format, className, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.classList.add(className);
  canvas.classList.add("barcode");
  JsBarcode(canvas, value, {
    format: format,
    height: 50,
    ...options,
  });
  return canvas;
}

function createCounter(value, className) {
  const container = document.createElement("div");
  container.classList.add("counter");
  container.classList.add(className);

  const counter = document.createElement("input");
  counter.type = "number";
  counter.value = value;

  const plusBtn = document.createElement("button");
  plusBtn.innerHTML = "+";
  plusBtn.classList.add("plusBtn");
  plusBtn.addEventListener("click", () => {
    counter.value = parseInt(counter.value) + 1;
  });

  const minusBtn = document.createElement("button");
  minusBtn.innerHTML = "–";
  plusBtn.classList.add("plusBtn");
  minusBtn.addEventListener("click", () => {
    if (parseInt(counter.value) > 0) {
      counter.value = parseInt(counter.value) - 1;
    }
  });

  container.appendChild(plusBtn);
  container.appendChild(counter);
  container.appendChild(minusBtn);

  return container;
}

// Save the loaded CSV and showEan state to localStorage
function saveCsvToLocalStorage(csvContent, showEan) {
  localStorage.setItem("savedCsv", csvContent);
  localStorage.setItem("savedShowEan", showEan);
}

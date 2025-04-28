/**
 * TODO:
 * - Add a button to clear all the items
 * - Add a button to remove a single item
 * - Add a button to download the barcodes as an image/PDF/HTML
 * - Add a button to print the barcodes
 * - Add a form to add a new item manually
 * 
 */



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

// Load state on page load
document.body.onload = function () {
  loadStateFromLocalStorage();
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
    const items = parseItemsFromCsv(csvContent);
    generateBarcodes(items, showEan);
    saveStateToLocalStorage(!!showEan);
  };
  reader.readAsText(file);
});

function parseItemsFromCsv(csvContent) {
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "");

  return lines
    .filter((_, index) => index !== 0)
    .map((line) => {
      const [productCode, ean, itemsCount] = line.split(";");
      return { productCode, ean, itemsCount };
    })
    .filter(({ productCode, itemsCount }) => productCode && itemsCount);
}

function generateBarcodes(items, showEan) {
  barcodeContainer.innerHTML = ""; // Clear previous barcodes

  items.forEach(({ productCode, ean, itemsCount }) => {
    if(!productCode || !itemsCount) return; // Skip if productCode or itemsCount is missing

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
  canvas.setAttribute("data-value", value);
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

// Save the updated state to localStorage
function saveStateToLocalStorage(showEan) {
  const savedState = localStorage.getItem("savedState");
  const state = {
    showEan: true,
    ...(savedState ? JSON.parse(savedState) : {}),
    items: [],
  };
  state.showEan = showEan !== undefined ? showEan : state.showEan;

  const items = barcodeContainer.querySelectorAll(".item");
  items.forEach((item) => {
    const productCode = item
      .querySelector(".productCode")
      .getAttribute("data-value");
    const ean = item.querySelector(".ean")?.getAttribute("data-value") || "";
    const itemsCount = item.querySelector(".itemsCount input").value;

    state.items.push({ productCode, ean, itemsCount });
  });

  localStorage.setItem("savedState", JSON.stringify(state));
}

// Load the state from localStorage
function loadStateFromLocalStorage() {
  const savedState = localStorage.getItem("savedState");
  if (savedState) {
    const state = JSON.parse(savedState);
    generateBarcodes(state.items, state.showEan);
    showEanCheckbox.checked = state.showEan;
  }
}

// Attach event listener to save state on count updates
barcodeContainer.addEventListener("input", (event) => {
  if (event.target.tagName === "INPUT" && event.target.parentElement.classList.contains("itemsCount")) {
    saveStateToLocalStorage();
  }
});
barcodeContainer.addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON" && event.target.parentElement.classList.contains("itemsCount")) {
    saveStateToLocalStorage();
  }
});

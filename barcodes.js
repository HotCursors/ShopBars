/**
 * TODO:
 * - Add a button to clear all the items
 * - Add a button to remove a single item
 * - Add a button to download the barcodes as an image/PDF/HTML
 * - Add a button to print the barcodes
 * - Add a form to add a new item manually
 * - Add a button to share the barcodes via email or social media
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
const generateBarsButton = document.getElementById("generateBarsBtn");
const shareLinkButton = document.getElementById("shareLinkBtn");
const barcodeContainer = document.getElementById("barcodeContainer");

// Load state on page load
document.body.onload = function () {
  loadStateFromLocalStorage();
  parseAndApplyCompressedState();
};

generateBarsButton.addEventListener("click", function () {
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
    if (!productCode || !itemsCount) return; // Skip if productCode or itemsCount is missing

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
  if (
    event.target.tagName === "INPUT" &&
    event.target.parentElement.classList.contains("itemsCount")
  ) {
    saveStateToLocalStorage();
  }
});
barcodeContainer.addEventListener("click", (event) => {
  if (
    event.target.tagName === "BUTTON" &&
    event.target.parentElement.classList.contains("itemsCount")
  ) {
    saveStateToLocalStorage();
  }
});

// Sharing functionality
shareLinkButton.addEventListener("click", shareLink);

async function shareLink() {
  if (!localStorage.getItem("savedState")) {
    saveStateToLocalStorage();
  }
  const savedState = localStorage.getItem("savedState");
  if (!savedState) {
    alert("No state to share.");
    return;
  }

  try {
    const compressedState = await compress(savedState);
    const compressedBase64 = uint8ArrayToBase64Url(compressedState);
    const shareUrl = `${window.location.origin}${window.location.pathname}?s=${compressedBase64}`;
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?s=${compressedBase64}`
    );
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Shareable link copied to clipboard!");
    });
  } catch (error) {
    console.error("Error creating shareable link:", error);
    alert("Failed to create shareable link.");
  }
}

async function parseAndApplyCompressedState() {
  const urlParams = new URLSearchParams(window.location.search);
  const compressedState = urlParams.get("s");

  if (!compressedState) return; // No state to parse

  try {
    // Decode and decompress the state
    const stateBytes = base64UrlToUint8Array(compressedState);
    const stateString = await decompress(stateBytes);
    const state = JSON.parse(stateString);

    // Validate the state structure
    if (!Array.isArray(state.items) || typeof state.showEan !== "boolean") {
      throw new Error("Invalid state structure");
    }

    // Apply the state
    generateBarcodes(state.items, state.showEan);
    showEanCheckbox.checked = state.showEan;
  } catch (error) {
    console.error("Error decoding or decompressing state:", error);
    alert("Invalid or corrupted shared state.");
  }
}

/**
 * Convert a string to its UTF-8 bytes and compress it.
 *
 * @param {string} str
 * @returns {Promise<Uint8Array>}
 */
async function compress(str) {
  // Convert the string to a byte stream.
  const stream = new Blob([str]).stream();

  // Create a compressed stream.
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));

  // Read all the bytes from this stream.
  const chunks = [];
  for await (const chunk of compressedStream) {
    chunks.push(chunk);
  }
  return await concatUint8Arrays(chunks);
}

/**
 * Decompress bytes into a UTF-8 string.
 *
 * @param {Uint8Array} compressedBytes
 * @returns {Promise<string>}
 */
async function decompress(compressedBytes) {
  // Convert the bytes to a stream.
  const stream = new Blob([compressedBytes]).stream();

  // Create a decompressed stream.
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream("gzip")
  );

  // Read all the bytes from this stream.
  const chunks = [];
  for await (const chunk of decompressedStream) {
    chunks.push(chunk);
  }
  const stringBytes = await concatUint8Arrays(chunks);

  // Convert the bytes to a string.
  return new TextDecoder().decode(stringBytes);
}

/**
 * Combine multiple Uint8Arrays into one.
 *
 * @param {ReadonlyArray<Uint8Array>} uint8arrays
 * @returns {Promise<Uint8Array>}
 */
async function concatUint8Arrays(uint8arrays) {
  const blob = new Blob(uint8arrays);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

function uint8ArrayToBase64Url(uint8Array) {
  // Convert Uint8Array to a binary string
  const binaryString = String.fromCharCode(...uint8Array);

  // Encode the binary string to Base64
  const base64 = btoa(binaryString);

  // Convert Base64 to Base64URL by replacing characters
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8Array(base64Url) {
  // Convert Base64URL to Base64 by replacing characters
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  // Decode the Base64 string to a binary string
  const binaryString = atob(base64);

  // Convert the binary string to a Uint8Array
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return uint8Array;
}

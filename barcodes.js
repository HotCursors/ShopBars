
const fileInput = document.getElementById('csvFile');
const barcodeContainer = document.getElementById('barcodeContainer');
barcodeContainer.innerHTML = ''; // Clear previous barcodes

const csvContent = `Kod_produktu;EAN;Pocet_kusu
112-192;;10,00
624-298;;5,00
624-094;;5,00
624-171;;5,00
732-107;;1,00
732-106;;1,00`;

    const lines = csvContent.split('\n').filter(line => line.trim() !== '');

    lines.forEach((line, index) => {
        if (index === 0) return; // Skip header line
        const [kodProduktu, ean, pocetKusu] = line.split(';');

        const barcodeDiv = document.createElement('div');
        barcodeDiv.style.marginBottom = '20px';
        // barcodeDiv.style.marginRight = '90px';

        // Generate barcode for Kod_produktu
        const kodProduktuCanvas = document.createElement('canvas');
        kodProduktuCanvas.style.marginRight = '90px';
        JsBarcode(kodProduktuCanvas, kodProduktu.trim(), {
            format: "CODE128",
            text: kodProduktu.trim(),
            fontOptions: "bold",
            textMargin: 0
        });
        barcodeDiv.appendChild(kodProduktuCanvas);
        
        const pocetCanvas = document.createElement('canvas');
        pocetCanvas.style.marginRight = '90px';
        const pocetKusuInt = parseInt(pocetKusu.replace(',', '.'), 10);
        JsBarcode(pocetCanvas, pocetKusuInt.toString(), {
            format: "CODE128",
            text: pocetKusuInt.toString(),
            fontOptions: "bold",
            textMargin: 0
        });
        barcodeDiv.appendChild(pocetCanvas);

        // Generate barcode for EAN if it exists
        if ((ean || "").trim()) {
            const eanCanvas = document.createElement('canvas');
            JsBarcode(eanCanvas, ean.trim(), {
                format: "EAN13",
                text: ean.trim(),
                fontOptions: "bold",
                textMargin: 0
            });
            barcodeDiv.appendChild(eanCanvas);
        }

        // Append the barcodeDiv to the container
        barcodeContainer.appendChild(barcodeDiv);
    });

// let uniqueIdCounter = 0;

// function generateUniqueId(prefix) {
//     uniqueIdCounter++;
//     return `${prefix}_${uniqueIdCounter}`;
// }

// const file = fileInput.files[0];
// const reader = new FileReader();

// reader.onload = function(event) {
//     const csvContent = event.target.result;
//     const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    

//     lines.forEach((line, index) => {
//         if (index === 0) return; // Skip header line
//         const [kodProduktu, ean, pocetKusu] = line.split(';');

//         const barcodeDiv = document.createElement('div');
//         barcodeDiv.style.marginBottom = '20px';

//         // Generate barcode for Kod_produktu
//         const kodProduktuSvg = document.createElement('svg');
//         kodProduktuSvg.classList.add('barcode');
//         kodProduktuSvg.setAttribute('jsbarcode-format', 'code128');
//         kodProduktuSvg.setAttribute('jsbarcode-value', kodProduktu.trim());
//         kodProduktuSvg.setAttribute('jsbarcode-textmargin', '0');
//         kodProduktuSvg.setAttribute('jsbarcode-fontoptions', 'bold');
//         barcodeDiv.appendChild(kodProduktuSvg);

//         // Initialize JsBarcode for the generated SVG
//         JsBarcode(kodProduktuSvg).init();


        // return
        // barcodeDiv.style.height = '64px';

        // const commonOptions = {
        //     format: 'CODE128',
        //     lineColor: "#0aa",
        //     height: 64,
        //     lineColor: "#0aa",
        //     width: 4,
        //     height: 40,
        // }

        // // Generate barcode for Kod_produktu
        // const kodProduktuId = generateUniqueId('kodProduktu');
        // const kodProduktuSvg = document.createElement('svg');
        // kodProduktuSvg.id = kodProduktuId;
        // barcodeDiv.appendChild(kodProduktuSvg);
        // requestAnimationFrame(() => {
        //     JsBarcode(`#${kodProduktuId}`, kodProduktu.trim(), {...commonOptions });
        // });

        // // Generate barcode for EAN if it exists
        // if ((ean || "").trim()) {
        //     const eanId = generateUniqueId('ean');
        //     const eanSvg = document.createElement('svg');
        //     eanSvg.id = eanId;
        //     barcodeDiv.appendChild(eanSvg);
        //     requestAnimationFrame(() => {
        //         JsBarcode(`#${eanId}`, ean.trim(), {...commonOptions, format: 'EAN13', text: ean.trim() });
        //     });
        // }

        // // Generate barcode for Pocet_kusu
        // if ((pocetKusu || "").trim()) {
        //     const pocetKusuId = generateUniqueId('pocetKusu');
        //     const pocetKusuSvg = document.createElement('svg');
        //     pocetKusuSvg.id = pocetKusuId;
        //     barcodeDiv.appendChild(pocetKusuSvg);
        //     const pocetKusuInt = parseInt(pocetKusu.replace(',', '.'), 10);
        //     requestAnimationFrame(() => {
        //         JsBarcode(`#${pocetKusuId}`, pocetKusuInt.toString(), {...commonOptions, text: pocetKusuInt.toString() });
        //     });
        // }

        // barcodeContainer.appendChild(barcodeDiv);
//     });
// };

// reader.readAsText(file);
// });

// JsBarcode("#barcode", "1234", {
//     format: "pharmacode",
//     lineColor: "#0aa",
//     width: 4,
//     height: 40,
//     displayValue: false
// });
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.5.141/pdf.worker.min.js';

// 画質スライダーの値を表示する
document.getElementById('quality').addEventListener('input', (event) => {
    document.getElementById('qualityValue').textContent = event.target.value;
});

document.getElementById('compressButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('pdfUpload');
    const widthSelect = document.getElementById('widthSelect');
    const selectedWidth = widthSelect.value;
    const jpgConversion = document.getElementById('jpgConversion').checked;
    const quality = document.getElementById('quality').value / 100;

    if (fileInput.files.length === 0) {
        alert('PDFファイルを選択してください。');
        return;
    }

    const file = fileInput.files[0];
    if (file.size === 0) {
        alert('PDFファイルが空です。');
        return;
    }

    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const originalSizeKB = (file.size / 1024).toFixed(2);
    document.getElementById('originalSize').textContent = `${originalSizeMB}MB (${originalSizeKB}KB)`;

    try {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        const numPages = pdf.numPages;
        console.log(`Total pages: ${numPages}`);

        const pdfDoc = await PDFLib.PDFDocument.create();
        const aspectRatioErrors = [];

        let baseAspectRatio;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.0 });
            const originalWidth = viewport.width;
            const originalHeight = viewport.height;

            let canvasWidth = originalWidth;
            let canvasHeight = originalHeight;

            if (selectedWidth !== 'original') {
                canvasWidth = parseInt(selectedWidth);
                const aspectRatio = originalHeight / originalWidth;
                canvasHeight = canvasWidth * aspectRatio;
            }

            if (pageNum === 2) {
                baseAspectRatio = originalHeight / originalWidth;
            }

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            const scale = canvasWidth / originalWidth;
            await page.render({
                canvasContext: context,
                viewport: page.getViewport({ scale: scale })
            }).promise;

            let imageBlob = await new Promise((resolve) => {
                canvas.toBlob(resolve, jpgConversion ? 'image/jpeg' : 'image/png', quality);
            });

            const imageArrayBuffer = await imageBlob.arrayBuffer();
            const image = jpgConversion
                ? await pdfDoc.embedJpg(imageArrayBuffer)
                : await pdfDoc.embedPng(imageArrayBuffer);

            const newPage = pdfDoc.addPage([canvasWidth, canvasHeight]);
            newPage.drawImage(image, { x: 0, y: 0, width: canvasWidth, height: canvasHeight });

            if (baseAspectRatio && pageNum !== 2) {
                const currentAspectRatio = originalHeight / originalWidth;
                if (Math.abs(currentAspectRatio - baseAspectRatio) > 0.01) {
                    aspectRatioErrors.push(pageNum);
                }
            }
        }

        const pdfBytes = await pdfDoc.save();
        const compressedFileSize = pdfBytes.byteLength;
        const compressedSizeMB = (compressedFileSize / (1024 * 1024)).toFixed(2);
        const compressedSizeKB = (compressedFileSize / 1024).toFixed(2);
        document.getElementById('compressedSize').textContent = `${compressedSizeMB}MB (${compressedSizeKB}KB)`;

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const saveButton = document.getElementById('saveButton');
        const shareButton = document.getElementById('shareButton');

        saveButton.classList.add('active');
        saveButton.disabled = false;
        saveButton.addEventListener('click', () => {
            saveAs(blob, 'compressed.pdf');
        });

        shareButton.classList.add('active');
        shareButton.disabled = false;
        shareButton.addEventListener('click', async () => {
            const url = URL.createObjectURL(blob);
            try {
                await navigator.share({
                    title: 'Compressed PDF',
                    text: 'Here is the compressed PDF file.',
                    url: url
                });
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Sharing failed:', error);
                // Fallback if sharing fails
                const a = document.createElement('a');
                a.href = url;
                a.download = 'compressed.pdf';
                a.click();
                URL.revokeObjectURL(url);
            }
        });

        const aspectRatioWarning = document.getElementById('aspectRatioWarning');
        if (aspectRatioErrors.length > 0) {
            aspectRatioWarning.textContent = `サイズが統一されていません。 (${aspectRatioErrors.join(', ')})`;
        } else {
            aspectRatioWarning.textContent = '';
        }

    } catch (error) {
        console.error("Error processing PDF:", error);
        alert('PDF処理中にエラーが発生しました。');
    }
});


async function extractTextFromPdf(pdfFile) {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
        fileReader.onload = async (event) => {
            try {
                const typedarray = new Uint8Array(event.target.result);

                // Loading the PDF file
                const pdf = await pdfjsLib.getDocument({data: typedarray}).promise;

                let text = '';
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    text += textContent.items.map(item => item.str).join(' ');
                }
                resolve(text); // Resolve the promise with the extracted text
            } catch (error) {
                reject(error); // Reject the promise if there's an error
            }
        };

        fileReader.onerror = (error) => {
            reject(error);
        };

        fileReader.readAsArrayBuffer(pdfFile);
    });
}


module.exports = extractTextFromPdf;
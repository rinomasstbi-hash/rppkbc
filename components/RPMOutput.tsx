import React, { useCallback } from 'react';

interface RPMOutputProps {
  htmlContent: string;
}

export const RPMOutput: React.FC<RPMOutputProps> = ({ htmlContent }) => {
  const getStyledContent = () => {
    const outputElement = document.getElementById('rpm-output-content');
    if (!outputElement) return '';
    
    let content = outputElement.innerHTML;
    // Replace light borders and backgrounds with darker versions for better document/print visibility
    content = content.replace(/border: 1px solid #ddd/g, 'border: 1px solid #000');
    content = content.replace(/background-color: #f2f2f2/g, 'background-color: #e0e0e0');
    return content;
  };

  const handleCopyToGoogleDocs = useCallback(() => {
    const styledContent = getStyledContent();
    if (!styledContent) return;

    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000 !important; }
              table { border-collapse: collapse; width: 100%; }
              td, th { vertical-align: top; padding: 8px; }
              div[style*="page-break-before: always;"] { page-break-before: always; }
          </style>
        </head>
        <body>${styledContent}</body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });

    navigator.clipboard.write([clipboardItem]).then(() => {
      alert('Konten berhasil disalin! Buka Google Dokumen dan tempel (Ctrl+V/Cmd+V).');
      window.open('https://docs.google.com/document/create', '_blank');
    }).catch(err => {
      console.error('Gagal menyalin konten HTML: ', err);
      alert('Gagal menyalin konten. Silakan coba salin manual.');
    });
  }, [htmlContent]);

  const handlePrint = useCallback(() => {
    const styledContent = getStyledContent();
    if (!styledContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak RPM</title>
            <style>
                body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; margin: 0; }
                table { border-collapse: collapse; width: 100%; }
                td, th { vertical-align: top; padding: 8px; border: 1px solid #000; }
                div[style*="page-break-before: always;"] { page-break-before: always; }
                @media print {
                  @page {
                    size: A4;
                    margin: 20mm;
                  }
                }
            </style>
          </head>
          <body>${styledContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      // Use a timeout to ensure content is fully rendered before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }, [htmlContent]);


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleCopyToGoogleDocs}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
          </svg>
          Salin & Buka Google Docs
        </button>
         <button
          onClick={handlePrint}
          className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Cetak RPM
        </button>
      </div>
      <div 
        id="rpm-output-content"
        className="border border-gray-300 rounded-md p-4 bg-white overflow-auto h-[calc(70vh-50px)] text-gray-900"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};
import type { EstimatorState, PriceRange } from "./types";

interface PDFData {
  state: EstimatorState;
  calculation: {
    singleLine: PriceRange;
    bedrooms: PriceRange;
    living: PriceRange;
    pooja: PriceRange;
    kitchen: PriceRange;
    addons: PriceRange;
    grandTotal: PriceRange;
  };
}

export async function generatePDF(data: PDFData): Promise<Blob> {
  // In a real implementation, this would use @react-pdf/renderer or a server endpoint
  // For now, we'll create a simple HTML-based PDF using the browser's print functionality

  const { state, calculation } = data;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Interior Cost Estimate - ${state.basics.bhk.toUpperCase()} ${
    state.basics.pkg
  }</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #000;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #f59e0b;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #000;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 10px 0 0 0;
        }
        .project-details {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .project-details h2 {
          margin-top: 0;
          color: #000;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .detail-item {
          text-align: center;
        }
        .detail-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .detail-value {
          font-size: 18px;
          font-weight: bold;
          color: #000;
        }
        .cost-breakdown {
          margin-bottom: 30px;
        }
        .cost-breakdown h2 {
          color: #000;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .cost-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }
        .cost-item:last-child {
          border-bottom: none;
        }
        .cost-label {
          font-weight: 500;
          color: #000;
        }
        .cost-value {
          font-weight: 500;
          color: #000;
        }
        .grand-total {
          background: #f59e0b;
          color: #000;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 14px;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Interior Cost Estimate</h1>
        <p>Generated on ${new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
      </div>

      <div class="project-details">
        <h2>Project Details</h2>
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Carpet Area</div>
            <div class="detail-value">${state.basics.carpetAreaSqft} sq ft</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Configuration</div>
            <div class="detail-value">${state.basics.bhk.toUpperCase()}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Package</div>
            <div class="detail-value">${state.basics.pkg}</div>
          </div>
        </div>
      </div>

      <div class="cost-breakdown">
        <h2>Cost Breakdown</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">All amounts are approximate ranges</p>
        
        ${[
          {
            key: "singleLine",
            label: "Single Line Items",
            range: calculation.singleLine,
          },
          { key: "bedrooms", label: "Bedrooms", range: calculation.bedrooms },
          { key: "living", label: "Living Room", range: calculation.living },
          { key: "kitchen", label: "Kitchen", range: calculation.kitchen },
          { key: "pooja", label: "Pooja Room", range: calculation.pooja },
          { key: "addons", label: "Add-ons", range: calculation.addons },
        ]
          .map(
            ({ label, range }) => `
          <div class="cost-item">
            <span class="cost-label">${label}</span>
            <span class="cost-value">
              ${
                range.low === 0 && range.high === 0
                  ? "Not included"
                  : `≈ ${formatPrice(range.low)} - ${formatPrice(range.high)}`
              }
            </span>
          </div>
        `
          )
          .join("")}

        <div class="grand-total">
          <span>Grand Total</span>
          <span>≈ ${formatPrice(calculation.grandTotal.low)} - ${formatPrice(
    calculation.grandTotal.high
  )}</span>
        </div>
      </div>

      <div class="footer">
        <p>This is an approximate estimate. Final costs may vary based on specific requirements, material choices, and market conditions.</p>
        <p>Generated by Interior Cost Estimator</p>
      </div>
    </body>
    </html>
  `;

  // Create a blob with the HTML content
  const blob = new Blob([htmlContent], { type: "text/html" });
  return blob;
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Alternative: Open PDF in new window for printing
export function openPDFForPrint(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

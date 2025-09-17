import type { EstimatorState, ExactBreakdown } from "./types";

export async function generatePDFExact(params: {
  state: EstimatorState;
  exact: ExactBreakdown;
}): Promise<Blob> {
  const { state, exact } = params;

  const money = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const byCat = (cat: keyof typeof exact.totalsByCategory) =>
    exact.lines.filter((l) => l.category === cat);

  const renderSection = (
    title: string,
    cat: keyof typeof exact.totalsByCategory
  ) => {
    const rows = byCat(cat);
    if (!rows.length) return "";
    return `
      <h3>${title}</h3>
      <table class="t">
        <thead><tr><th>Item</th><th>Package</th><th>Details</th><th class="r">Amount</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>${r.item}</td>
              <td>${r.pkg}</td>
              <td>${r.details ?? ""}</td>
              <td class="r">${money(r.amount)}</td>
            </tr>
          `
            )
            .join("")}
          <tr class="sub">
            <td colspan="3" class="r"><strong>Subtotal</strong></td>
            <td class="r"><strong>${money(
              exact.totalsByCategory[cat]
            )}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  };

  const html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Interior Estimate (${state.basics.bhk.toUpperCase()} • ${
    state.basics.pkg
  })</title>
      <style>
        body{font-family: ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto; color:#111; margin:0; padding:32px;}
        h1{font-size:24px; margin:0 0 4px 0}
        h2{font-size:18px; margin:24px 0 8px}
        h3{font-size:16px; margin:18px 0 6px; border-bottom:1px solid #e5e5e5; padding-bottom:4px;}
        .muted{color:#6b7280}
        .grid{display:grid; grid-template-columns:repeat(3,1fr); gap:12px; background:#fafafa; padding:12px; border-radius:8px}
        .box{padding:8px}
        .k{font-size:12px; color:#6b7280}
        .v{font-weight:600}
        table.t{width:100%; border-collapse:collapse; margin:8px 0 16px}
        .t th,.t td{border-bottom:1px solid #f0f0f0; padding:8px 6px; font-size:12px}
        .t .r{text-align:right}
        .t .sub td{border-top:1px solid #e5e5e5; background:#fafafa}
        .gt{margin-top:16px; background:#f59e0b; padding:12px; border-radius:8px; display:flex; justify-content:space-between; font-weight:800}
        .note{font-size:12px; color:#6b7280; margin-top:12px}
      </style>
    </head>
    <body>
      <h1>Interior Cost Estimate</h1>
      <div class="muted">Generated on ${new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</div>

      <h2>Project</h2>
      <div class="grid">
        <div class="box"><div class="k">Carpet Area</div><div class="v">${
          state.basics.carpetAreaSqft
        } sq ft</div></div>
        <div class="box"><div class="k">Configuration</div><div class="v">${state.basics.bhk.toUpperCase()}</div></div>
        <div class="box"><div class="k">Global Package</div><div class="v">${
          state.basics.pkg
        }</div></div>
      </div>

      <h2>Breakdown (Exact)</h2>
      ${renderSection("Single Line Items", "Single Line Items")}
      ${renderSection("Bedrooms", "Bedrooms")}
      ${renderSection("Living Room", "Living Room")}
      ${renderSection("Kitchen", "Kitchen")}
      ${renderSection("Pooja Room", "Pooja Room")}
      ${renderSection("Add-ons", "Add-ons")}

      <div class="gt"><span>Grand Total</span><span>₹${new Intl.NumberFormat(
        "en-IN",
        { maximumFractionDigits: 0 }
      ).format(exact.grandTotal)}</span></div>
      <div class="note">This document shows item-wise exact calculations for the selected configuration. Market fluctuations and scope changes may alter final price.</div>
    </body>
    </html>
  `;

  return new Blob([html], { type: "text/html" });
}

// helpers from your previous file can stay the same:
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

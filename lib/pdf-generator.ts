import type { EstimatorState, PriceRange } from "./types";
import { computeExactBreakdown } from "./calc-exact";

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

// remove any explicit prices/rates from the details column
function sanitizeDetails(input?: string): string {
  if (!input) return "";
  let s = input;

  // remove currency snippets like "₹12,345" or "₹2050"
  s = s.replace(/₹\s*[0-9,]+(?:\.\d+)?/g, "");

  // remove "× ..." fragments (e.g., "120 sqft × ..." -> "120 sqft")
  s = s.replace(/\s*×\s*[^•]+/g, "");

  // collapse extra spaces and tidy separators
  s = s
    .replace(/\s{2,}/g, " ")
    .replace(/\s*•\s*/g, " • ")
    .trim();

  // remove dangling "•" at ends
  s = s.replace(/^•\s*/, "").replace(/\s*•\s*$/, "");

  return s;
}

export async function generatePDF(data: PDFData): Promise<Blob> {
  const { state } = data;
  const exact = computeExactBreakdown(state);

  const money = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const cat = (
    name:
      | "Single Line Items"
      | "Bedrooms"
      | "Living Room"
      | "Kitchen"
      | "Pooja Room"
      | "Add-ons"
  ) => exact.lines.filter((l) => l.category === name);

  const section = (
    title: string,
    key:
      | "Single Line Items"
      | "Bedrooms"
      | "Living Room"
      | "Kitchen"
      | "Pooja Room"
      | "Add-ons"
  ) => {
    const rows = cat(key);
    if (!rows.length) return "";
    return `
      <h3>${title}</h3>
      <table class="t">
        <thead>
          <tr>
            <th>Item</th>
            <th>Package</th>
            <th>Specs</th>
            <th class="r">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>${r.item}</td>
              <td>${r.pkg}</td>
              <td>${sanitizeDetails(r.details)}</td>
              <td class="r">${money(r.amount)}</td>
            </tr>`
            )
            .join("")}
          <tr class="sub">
            <td colspan="3" class="r"><strong>Subtotal</strong></td>
            <td class="r"><strong>${money(
              exact.totalsByCategory[key]
            )}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  };

  const html = `
  <!doctype html><html><head><meta charset="utf-8"/>
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
    .t th,.t td{border-bottom:1px solid #f0f0f0; padding:8px 6px; font-size:12px; vertical-align:top}
    .t .r{text-align:right}
    .t .sub td{border-top:1px solid #e5e5e5; background:#fafafa}
    .gt{margin-top:16px; background:#f59e0b; padding:12px; border-radius:8px; display:flex; justify-content:space-between; font-weight:800}
    .note{font-size:12px; color:#6b7280; margin-top:12px}
    @media print { body{padding:24px} }
  </style>
  </head><body>
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

    <h2>Breakdown (Exact totals — component rates hidden)</h2>
    ${section("Single Line Items", "Single Line Items")}
    ${section("Bedrooms", "Bedrooms")}
    ${section("Living Room", "Living Room")}
    ${section("Kitchen", "Kitchen")}
    ${section("Pooja Room", "Pooja Room")}
    ${section("Add-ons", "Add-ons")}

    <div class="gt"><span>Grand Total</span><span>${money(
      exact.grandTotal
    )}</span></div>
    <div class="note">This document presents exact item totals and category subtotals. Component unit rates are intentionally not disclosed.</div>
  </body></html>
  `;

  return new Blob([html], { type: "text/html" });
}

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

export function openPDFForPrint(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) w.onload = () => w.print();
}

// lib/pdf-generator.ts
import type { EstimatorState, PriceRange } from "./types";
import { computeExactBreakdown } from "./calc-exact";

/** Shape passed in by your caller (kept same as earlier) */
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

/** Remove explicit prices/rates etc. from the details column */
function sanitizeDetails(input?: string): string {
  if (!input) return "";
  let s = input;

  // Remove "₹12,345.00" / "₹2050"
  s = s.replace(/₹\s*[0-9,]+(?:\.\d+)?/g, "");

  // Remove "× ..." fragments (e.g., "120 sqft × ..." -> "120 sqft")
  s = s.replace(/\s*×\s*[^•]+/g, "");

  // Tidy bullets/spaces
  s = s
    .replace(/\s{2,}/g, " ")
    .replace(/\s*•\s*/g, " • ")
    .trim();

  // Remove dangling bullets
  s = s.replace(/^•\s*/, "").replace(/\s*•\s*$/, "");

  return s;
}

/** Create the PDF as an HTML blob */
export async function generatePDF(data: PDFData): Promise<Blob> {
  const { state } = data;
  const exact = computeExactBreakdown(state);

  type CatKey =
    | "Single Line Items"
    | "Bedrooms"
    | "Living Room"
    | "Kitchen"
    | "Pooja Room"
    | "Add-ons";

  type Row = (typeof exact.lines)[number];

  const money = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const cat = (name: CatKey) => exact.lines.filter((l) => l.category === name);

  // -----------------------------
  // Bedrooms: group by room name
  // -----------------------------
  // Expected labels like:
  //  - "Master Bedroom TV Unit"
  //  - "Children Bedroom Wardrobe"
  //  - "Bedroom 2 Study Table"
  // We split into { room: "Master Bedroom", unit: "TV Unit" }
  const parseBedroomItem = (item: string) => {
    const s = item.replace(/\s+/g, " ").trim();

    // "<something> bedroom <rest>"
    const m = s.match(/^(.*?\bbedroom)\s+(.*)$/i);
    if (m) {
      const room = m[1]
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/\s+/g, " ")
        .trim();
      const unit = m[2].trim();
      return { room, unit };
    }

    // "bedroom <n> <rest>"
    const m2 = s.match(/^(bedroom\s*\d+)\s+(.*)$/i);
    if (m2) {
      const room = m2[1].toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      const unit = m2[2].trim();
      return { room, unit };
    }

    // Fallback
    return { room: "Bedroom", unit: s };
  };

  const bedroomRows = cat("Bedrooms");
  const bedroomsByRoom = bedroomRows.reduce<Record<string, Row[]>>(
    (acc, row) => {
      const { room, unit } = parseBedroomItem(row.item);
      const cloned: Row = { ...row, item: unit };
      (acc[room] ??= []).push(cloned);
      return acc;
    },
    {}
  );

  // -----------------------------
  // Summary counters
  // -----------------------------
  const allRows = exact.lines;
  const bedroomsCount = Object.keys(bedroomsByRoom).length;
  const wardrobesCount = allRows.filter((r) => /wardrobe/i.test(r.item)).length;
  const addonsCount = cat("Add-ons").length;
  const totalUnitsCount = allRows.length;

  // -----------------------------
  // Helpers: render tables
  // -----------------------------
  const sectionTable = (title: string, rows: Row[]) => {
    if (!rows.length) return "";
    const subtotal = rows.reduce((s, r) => s + r.amount, 0);
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
            <td class="r"><strong>${money(subtotal)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  };

  const bedroomsSection = () => {
    if (!bedroomRows.length) return "";
    const roomsHtml = Object.entries(bedroomsByRoom)
      .map(([room, rows]) => sectionTable(room, rows))
      .join("");
    const subtotal = bedroomRows.reduce((s, r) => s + r.amount, 0);
    return `
      <h3>Bedrooms</h3>
      ${roomsHtml}
      <table class="t">
        <tbody>
          <tr class="sub">
            <td colspan="3" class="r"><strong>Bedrooms Subtotal</strong></td>
            <td class="r"><strong>${money(subtotal)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  };

  // Other categories (unchanged behavior)
  const singleLineItems = sectionTable(
    "Single Line Items",
    cat("Single Line Items")
  );
  const livingSection = sectionTable("Living Room", cat("Living Room"));
  const kitchenSection = sectionTable("Kitchen", cat("Kitchen"));
  const poojaSection = sectionTable("Pooja Room", cat("Pooja Room"));
  const addonsSection = sectionTable("Add-ons", cat("Add-ons"));

  // -----------------------------
  // HTML document
  // -----------------------------
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
    .summary{display:grid; grid-template-columns:repeat(4,1fr); gap:12px; background:#f8fafc; padding:12px; border-radius:8px; margin-top:8px}
    .pill{background:#fff; border:1px solid #e5e7eb; padding:10px; border-radius:10px}
    .pill .label{font-size:12px; color:#6b7280}
    .pill .value{font-weight:700; font-size:16px; margin-top:2px}
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

    <!-- Summary FIRST -->
    <h2>Summary</h2>
    <div class="summary">
      <div class="pill"><div class="label">Bedrooms</div><div class="value">${bedroomsCount}</div></div>
      <div class="pill"><div class="label">Wardrobes</div><div class="value">${wardrobesCount}</div></div>
      <div class="pill"><div class="label">Total Units</div><div class="value">${totalUnitsCount}</div></div>
      <div class="pill"><div class="label">Add-ons</div><div class="value">${addonsCount}</div></div>
    </div>

    <h2>Breakdown (Exact totals — component rates hidden)</h2>
    ${singleLineItems}
    ${bedroomsSection()}
    ${livingSection}
    ${kitchenSection}
    ${poojaSection}
    ${addonsSection}

    <div class="gt"><span>Grand Total</span><span>${money(
      exact.grandTotal
    )}</span></div>
    <div class="note">This document presents exact item totals and category subtotals. Component unit rates are intentionally not disclosed.</div>
  </body></html>
  `;

  return new Blob([html], { type: "text/html" });
}

/** Download helper */
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

/** Open in a new tab and trigger print */
export function openPDFForPrint(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) w.onload = () => w.print();
}

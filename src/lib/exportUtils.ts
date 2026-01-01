import { format } from "date-fns";

interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
}

export const exportToCSV = (data: ExportData, filename: string) => {
  const csvContent = [
    data.headers.join(","),
    ...data.rows.map((row) =>
      row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (data: ExportData, filename: string) => {
  // Create a printable HTML document
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1 {
            color: #1a1a1a;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .meta {
            color: #666;
            margin-bottom: 20px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        <div class="meta">
          Generated on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
        </div>
        <table>
          <thead>
            <tr>
              ${data.headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
        <div class="footer">
          WhatNext Investment Management System - Analytics Report
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load then trigger print
  printWindow.onload = () => {
    printWindow.print();
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyShort = (value: number): string => {
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `₦${(value / 1000).toFixed(0)}K`;
  }
  return `₦${value}`;
};

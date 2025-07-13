import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor() {}

  exportToJSON(data: any, filename: string = 'export.json'): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadBlob(blob, filename);
  }

  exportToCSV(data: any[], filename: string = 'export.csv'): void {
    if (!data || !data.length) return;
    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    this.downloadBlob(blob, filename);
  }

  private convertToCSV(data: any[]): string {
    const replacer = (key: string, value: any) => value === null || value === undefined ? '' : value;
    const header = Object.keys(data[0]);
    const csv = [
      header.join(','),
      ...data.map(row =>
        header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
      )
    ].join('\r\n');
    return csv;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

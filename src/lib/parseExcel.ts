import * as XLSX from "xlsx";

export async function readExcel(file: File) {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data);

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
  });

  console.log("ROWS:", rows);

  return rows;
}
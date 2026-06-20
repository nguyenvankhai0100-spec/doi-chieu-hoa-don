export function detectGovType(rows: any[][]) {
  const text = JSON.stringify(rows).toLowerCase();

  if (text.includes("máy tính tiền")) {
    return "MAY_TINH_TIEN";
  }

  if (text.includes("đã cấp mã hóa đơn")) {
    return "CAP_MA";
  }

  return "KHONG_CAP_MA";
}
export function parseGovFile(rows: any[][]) {
  // Header thực tế của file GOV nằm ở dòng 4 (index = 3)
  const headerRow = rows[3];

  // Dữ liệu bắt đầu từ dòng 5
  const dataRows = rows.slice(4);

  const getColumnIndex = (columnName: string) => {
    return headerRow.findIndex(
      (col) =>
        String(col || "").trim() === columnName
    );
  };

  const colMstNguoiBan = getColumnIndex(
    "MST người bán/MST người xuất hàng"
  );

  const colMstNguoiMua = getColumnIndex(
    "MST người mua/MST người nhận hàng"
  );

  const colKyHieu = getColumnIndex(
    "Ký hiệu hóa đơn"
  );

  const colSoHoaDon = getColumnIndex(
    "Số hóa đơn"
  );

  const colNgayLap = getColumnIndex(
    "Ngày lập"
  );

  const colTienTruocThue = getColumnIndex(
    "Tổng tiền chưa thuế"
  );

  const colTienThue = getColumnIndex(
    "Tổng tiền thuế"
  );

  const colTongTien = getColumnIndex(
    "Tổng tiền thanh toán"
  );

  const colTrangThai = getColumnIndex(
    "Trạng thái hóa đơn"
  );

  const colKetQua = getColumnIndex(
    "Kết quả kiểm tra hóa đơn"
  );

  return dataRows
    .filter((row) => row.length > 0)
    .map((row) => ({
      mstNguoiBan: String(
        row[colMstNguoiBan] || ""
      ).trim(),

      mstNguoiMua: String(
        row[colMstNguoiMua] || ""
      ).trim(),

      kyHieu: String(
        row[colKyHieu] || ""
      ).trim(),

      soHoaDon: String(
        row[colSoHoaDon] || ""
      ).trim(),

      ngayHoaDon: String(
        row[colNgayLap] || ""
      ).trim(),

      tienTruocThue: Number(
        row[colTienTruocThue] || 0
      ),

      tienThue: Number(
        row[colTienThue] || 0
      ),

      tongTien: Number(
        row[colTongTien] || 0
      ),

      trangThaiHoaDon: String(
        row[colTrangThai] || ""
      ).trim(),

      ketQuaKiemTra: String(
        row[colKetQua] || ""
      ).trim(),
    }));
}
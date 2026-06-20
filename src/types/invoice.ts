export interface GovInvoice {
  mst: string;
  kyHieu: string;
  soHoaDon: string;
  ngayHoaDon: string;

  tienTruocThue: number;
  tienThue: number;
  tongTien: number;

  trangThaiHoaDon: string;
  ketQuaKiemTra?: string;

  loaiHoaDon:
    | "CAP_MA"
    | "KHONG_CAP_MA"
    | "MAY_TINH_TIEN";
}

export interface MisaInvoice {
  mst: string;
  kyHieu: string;
  soHoaDon: string;
  ngayHoaDon: string;

  tienTruocThue: number;
  tienThue: number;
  tongTien: number;
}
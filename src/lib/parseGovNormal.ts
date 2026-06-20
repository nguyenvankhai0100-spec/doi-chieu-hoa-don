import { createInvoiceKey } from "./createInvoiceKey";


export function parseGovNormal(rows:any[][]){


  // ======================
  // TÌM HEADER GOV
  // ======================


  let headerIndex = -1;


  for(let i=0;i<rows.length;i++){


    const row = rows[i];


    const hasSoHoaDon =
      row.some(col =>
        String(col||"")
        .trim()
        .toLowerCase()
        .includes("số hóa đơn")
      );


    if(hasSoHoaDon){

      headerIndex=i;
      break;

    }

  }




  if(headerIndex===-1){

    console.log(
      "KHÔNG TÌM THẤY HEADER GOV"
    );

    return [];

  }




  const headerRow =
    rows[headerIndex];



  console.log(
    "HEADER GOV:",
    headerIndex,
    headerRow
  );







  const getColumnIndex=(name:string)=>{


    return headerRow.findIndex(col=>

      String(col||"")
      .trim()
      .toLowerCase()
      .includes(
        name.toLowerCase()
      )

    );


  };





  const colMstNguoiBan =
    getColumnIndex(
      "mst người bán"
    );


  const colMstNguoiMua =
    getColumnIndex(
      "mst người mua"
    );
const colTenNguoiBan =
  getColumnIndex(
    "tên người bán"
  );

const colTenNguoiMua =
  getColumnIndex(
    "tên người mua"
  );

  const colKyHieu =
    getColumnIndex(
      "ký hiệu hóa đơn"
    );


  const colSoHoaDon =
    getColumnIndex(
      "số hóa đơn"
    );


  const colNgay =
    getColumnIndex(
      "ngày lập"
    );


  const colTienTruocThue =
    getColumnIndex(
      "tổng tiền chưa thuế"
    );


  const colTienThue =
    getColumnIndex(
      "tổng tiền thuế"
    );


  const colTongTien =
    getColumnIndex(
      "tổng tiền thanh toán"
    );


  const colTrangThai =
    getColumnIndex(
      "trạng thái hóa đơn"
    );


  const colKetQua =
    getColumnIndex(
      "kết quả kiểm tra"
    );





  const dataRows =
    rows.slice(headerIndex+1);






  return dataRows


  .filter(row=>{


    if(!row)
      return false;


    const so =
      row[colSoHoaDon];


    return (
      String(so||"")
      .trim() !== ""
    );


  })



  .map(row=>{


    const invoice:any={



      loaiNguon:
      "GOV_NORMAL",



      mstNguoiBan:
      String(
        row[colMstNguoiBan]||""
      ).trim(),



      mstNguoiMua:
      String(
        row[colMstNguoiMua]||""
      ).trim(),
tenNguoiBan:
String(
  row[colTenNguoiBan]||""
).trim(),

tenNguoiMua:
String(
  row[colTenNguoiMua]||""
).trim(),


      kyHieu:
      String(
        row[colKyHieu]||""
      ).trim(),



      soHoaDon:
      String(
        row[colSoHoaDon]||""
      ).trim(),



      ngayHoaDon:
      String(
        row[colNgay]||""
      ).trim(),



      tienTruocThue:
      Number(
        row[colTienTruocThue]||0
      ),



      tienThue:
      Number(
        row[colTienThue]||0
      ),



      tongTien:
      Number(
        row[colTongTien]||0
      ),



      trangThaiHoaDon:
      String(
        row[colTrangThai]||""
      ).trim(),



      ketQuaKiemTra:
      String(
        row[colKetQua]||""
      ).trim()

    };





    const result={

  ...invoice,

  key:""

};console.log(
  "GOV NAME",
  {
    tenNguoiBan:
      result.tenNguoiBan,
    tenNguoiMua:
      result.tenNguoiMua
  }
);
console.log(
  "GOV CHECK",
  {
    mstNguoiBan: result.mstNguoiBan,
    mstNguoiMua: result.mstNguoiMua,
    tenNguoiBan: result.tenNguoiBan,
    tenNguoiMua: result.tenNguoiMua,
    soHoaDon: result.soHoaDon
  }
);


    console.log(
      "CREATE KEY GOV:",
      result.key
    );



    return result;


  });


}
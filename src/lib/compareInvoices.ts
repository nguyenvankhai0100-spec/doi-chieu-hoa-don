import { compareMoney } from "./compareMoney";


function normalizeDate(value:any){

  if(!value) return "";

  if(value instanceof Date){

    return (
      value.getFullYear()
      +
      String(value.getMonth()+1).padStart(2,"0")
      +
      String(value.getDate()).padStart(2,"0")
    );

  }


  const text =
    String(value).trim();


  if(text.includes("/")){

    const a=text.split("/");

    if(a.length===3){

      return (
        a[2]
        +
        a[1].padStart(2,"0")
        +
        a[0].padStart(2,"0")
      );

    }
  }


  return text.replaceAll("-","");

}





function getKey(
  item:any,
  type:string
){

  const soHoaDon =
    String(item.soHoaDon || "")
    .replace(/^0+/,"")
    .trim();

  const ngayHoaDon =
    normalizeDate(
      item.ngayHoaDon
    );

  // =====================
  // BÁN RA
  // =====================

  if(type==="BAN_RA"){

    return (
      soHoaDon
      +
      "_"
      +
      ngayHoaDon
    );

  }

  // =====================
  // MUA VÀO
  // =====================

  const mst =
    String(
      item.mstNguoiBan || ""
    ).trim();

  return (

    mst
    +
    "_"
    +
    soHoaDon
    +
    "_"
    +
    ngayHoaDon

  );

}







function getStatus(x:any){

 return (

  (
   x.trangThaiHoaDon||""
  )
  +
  " "
  +
  (
   x.ketQuaKiemTra||""
  )

 )
 .toLowerCase();

}







export function compareInvoices(
 govInvoices:any[],
 misaInvoices:any[],
 invoiceType="MUA_VAO",
 onProgress?:(percent:number)=>void
){

 console.log("COMPARE VERSION 999");
 const results:any[]=[];



 const misaMap =
 new Map<string,any[]>();



 misaInvoices
 .filter(x=>x.soHoaDon)
 .forEach(m=>{

   const key =
    getKey(
     m,
     invoiceType
    );
console.log(
 "MISA KEY",
 key
);

   if(!misaMap.has(key))
    misaMap.set(key,[]);


   misaMap.get(key)!.push(m);

 });





 const usedMisa =
 new Set<any>();









 for(let i = 0; i < govInvoices.length; i++){

 const gov = govInvoices[i];
if(onProgress){

  const percent = Math.round(
    ((i + 1) / govInvoices.length) * 100
  );

  if(percent % 2 === 0){
    onProgress(percent);
  }

}

  if(!gov.soHoaDon)
    continue;



  const key =
   getKey(
    gov,
    invoiceType
   );
 console.log(
    "COMPARE KEY",
    invoiceType,
    key
  );


  const misaList =
   misaMap.get(key)||[];




  const base={

    mst:
invoiceType==="MUA_VAO"
?
gov.mstNguoiBan
:
"",


    soHoaDon:
    gov.soHoaDon,


    ngayHoaDon:
    gov.ngayHoaDon

  };





  const status =
   getStatus(gov);





  // =========================
  // HỦY
  // =========================


  if(
    status.includes("hủy")
    ||
    status.includes("huy")
  ){


    if(misaList.length){


      misaList.forEach(x=>
        usedMisa.add(x)
      );


      results.push({

        ...base,
gov,
misa: misaList[0] || null,
        status:
        "HÓA ĐƠN HỦY NHƯNG VẪN NHẬP"

      });

    }


    continue;

  }









  // =========================
  // BỊ THAY THẾ
  // =========================


  if(
  status.includes("bị thay thế")
  ||
  status.includes("bi thay the")
){


    if(misaList.length){


      misaList.forEach(x=>
        usedMisa.add(x)
      );


      results.push({

        ...base,
gov,
  misa: misaList[0] || null,
        status:
        "HÓA ĐƠN BỊ THAY THẾ NHƯNG VẪN NHẬP"

      });

    }


    continue;

  }










  // =========================
  // ĐIỀU CHỈNH
  // =========================


  if(
  (
    status.includes("điều chỉnh")
    ||
    status.includes("dieu chinh")
  )
  &&
  !status.includes("bị điều chỉnh")
  &&
  !status.includes("bi dieu chinh")
){

  results.push({

    ...base,
    gov,
    misa: misaList[0] || null,

    status:
    "HÓA ĐƠN ĐIỀU CHỈNH - CẢNH BÁO"

  });

  continue;

}










  // =========================
  // TÌM ĐÚNG KHÓA
  // =========================


  if(misaList.length){


    misaList.forEach(x=>
      usedMisa.add(x)
    );




    // TRÙNG

   let misaTongTien =
  Number(misaList[0]?.tongTien || 0);

let misaTienThue =
  Number(misaList[0]?.tienThue || 0);

let misaTienTruocThue =
  Number(misaList[0]?.tienTruocThue || 0);

if (misaList.length >= 2) {

  misaTongTien = misaList.reduce(
    (s, x) => s + Number(x.tongTien || 0),
    0
  );

  misaTienThue = misaList.reduce(
    (s, x) => s + Number(x.tienThue || 0),
    0
  );

  misaTienTruocThue = misaList.reduce(
    (s, x) => s + Number(x.tienTruocThue || 0),
    0
  );

  const ratio =
    gov.tongTien > 0
      ? misaTongTien / Number(gov.tongTien)
      : 0;

  if (
    Number.isInteger(ratio) &&
    ratio >= 2
  ) {

    results.push({
      ...base,
      gov,
      misa: misaList[0],
      status: `TRÙNG HÓA ĐƠN (${ratio} lần)`
    });

    continue;
  }
}






   const misa =
  misaList[0];
if(
  status.includes("bị điều chỉnh")
  ||
  status.includes("bi dieu chinh")
){

  results.push({

    ...base,

    gov,
    misa,

    status:
    "HÓA ĐƠN BỊ ĐIỀU CHỈNH"

  });

  continue;

}
const tongTienMisa =
  misaTongTien;

const tienThueMisa =
  misaTienThue;

const tienTruocThueMisa =
  misaTienTruocThue;
const misaDetail = {

  ...misa,

  tongTien:
    tongTienMisa,

  tienThue:
    tienThueMisa,

  tienTruocThue:
    tienTruocThueMisa,

  soLuongHoaDon:
    misaList.length,

  danhSachHoaDon:
    misaList

};




    if(
      !compareMoney(
 gov.tienThue,
 tienThueMisa
)
    ){

      results.push({

        ...base,
gov,
misa: misaDetail,

        status:
        "SAI TIỀN THUẾ"

      });


      continue;

    }







    if(
      !compareMoney(
 gov.tongTien,
 tongTienMisa
)
    ){

      results.push({

        ...base,
gov,
misa: misaDetail,
        status:
        "SAI TỔNG TIỀN"

      });


      continue;

    }







    if(
      !compareMoney(
 gov.tienTruocThue,
 tienTruocThueMisa
)
    ){


      results.push({

        ...base,
gov,
misa: misaDetail,
        status:
        "CẢNH BÁO SAI TIỀN TRƯỚC THUẾ"

      });


      continue;

    }







    results.push({

      ...base,

      gov,
misa: misaDetail,

status:"KHỚP"

    });


    continue;


  }









  // =========================
  // SAI NGÀY
  // =========================


  const wrongDate =
  misaInvoices.find(m=>


    String(
     invoiceType==="MUA_VAO"
     ?
     m.mstNguoiBan
     :
     m.mstNguoiMua
    )
    ===
    String(
     invoiceType==="MUA_VAO"
     ?
     gov.mstNguoiBan
     :
     gov.mstNguoiMua
    )

    &&


    String(m.soHoaDon)
    ===
    String(gov.soHoaDon)


    &&


    compareMoney(
     m.tongTien,
     gov.tongTien
    )

  );




  if(wrongDate){


    usedMisa.add(wrongDate);


    results.push({

      ...base,
gov,
misa: wrongDate,
      status:
      "SAI NGÀY HÓA ĐƠN"

    });


    continue;

  }









 

  // =========================
// KIỂM TRA MST
// =========================

const wrongMst =
misaInvoices.find(m =>

  String(m.soHoaDon)
  ===
  String(gov.soHoaDon)

  &&

  normalizeDate(m.ngayHoaDon)
  ===
  normalizeDate(gov.ngayHoaDon)

  &&

  compareMoney(
    m.tongTien,
    gov.tongTien
  )

);

if(wrongMst){

  usedMisa.add(wrongMst);

  const govMst =
    String(gov.mstNguoiBan || "").trim();

  const misaMst =
    String(wrongMst.mstNguoiBan || "").trim();

  // MISA không có MST
  if(
    govMst !== ""
    &&
    misaMst === ""
  ){

    results.push({

      ...base,
      gov,
      misa: wrongMst,

      status:
      "CHƯA NHẬP MST"

    });

  }

  // Có MST nhưng khác nhau
  else if(
    govMst !== ""
    &&
    misaMst !== ""
    &&
    govMst !== misaMst
  ){

    results.push({

      ...base,
      gov,
      misa: wrongMst,

      status:
      "SAI MST"

    });

  }

  continue;

}









const fallbackMatch =
  misaInvoices.find(m =>

    String(m.soHoaDon || "")
      .replace(/^0+/,"")
      .trim()

    ===

    String(gov.soHoaDon || "")
      .replace(/^0+/,"")
      .trim()

    &&

    normalizeDate(m.ngayHoaDon)
    ===
    normalizeDate(gov.ngayHoaDon)

    &&

    compareMoney(
      m.tongTien,
      gov.tongTien
    )

  );

if(fallbackMatch){

  usedMisa.add(fallbackMatch);

  results.push({

    ...base,

    gov,
    misa: fallbackMatch,

    status:
    "KHỚP (THIẾU MST)"

  });

  continue;

}
  // =========================
  // THIẾU THẬT
  // =========================


  results.push({

    ...base,
gov,
misa:null,
    status:
    "CHƯA HẠCH TOÁN"

  });



 }









 // ==========================
 // MISA DƯ
 // ==========================


 for(const m of misaInvoices){


  if(
    !m.soHoaDon
    ||
    usedMisa.has(m)
  )
   continue;




  results.push({

    mst:
    invoiceType==="MUA_VAO"
    ?
    m.mstNguoiBan
    :
    m.mstNguoiMua,


    soHoaDon:
    m.soHoaDon,


    ngayHoaDon:
    m.ngayHoaDon,

gov:null,
misa:m,
    status:
    "MISA CÓ - GOV KHÔNG CÓ"

  });


 }




 return results;

}
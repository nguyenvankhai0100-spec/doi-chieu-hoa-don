



function normalizeDate(value:any){

  if(!value) return "";

  if(value instanceof Date){

    const y = value.getFullYear();

    const m =
      String(value.getMonth()+1)
      .padStart(2,"0");

    const d =
      String(value.getDate())
      .padStart(2,"0");

    return `${y}${m}${d}`;

  }

  const text =
    String(value).trim();

  // Excel serial date

  if(!isNaN(Number(text))){

    const excel =
      Number(text);

    if(
      excel > 30000
      &&
      excel < 60000
    ){

      const date =
        new Date(
          (excel - 25569)
          *
          86400
          *
          1000
        );

      const y =
        date.getFullYear();

      const m =
        String(date.getMonth()+1)
        .padStart(2,"0");

      const d =
        String(date.getDate())
        .padStart(2,"0");

      return `${y}${m}${d}`;

    }

  }

  if(text.includes("/")){

    const arr =
      text.split("/");

    if(arr.length===3){

      return (
        arr[2]
        +
        arr[1].padStart(2,"0")
        +
        arr[0].padStart(2,"0")
      );

    }

  }

  if(text.includes("-")){

    const arr =
      text.split("-");

    if(arr.length===3){

      if(arr[0].length===4){

        return (
          arr[0]
          +
          arr[1].padStart(2,"0")
          +
          arr[2].padStart(2,"0")
        );

      }

      return (
        arr[2]
        +
        arr[1].padStart(2,"0")
        +
        arr[0].padStart(2,"0")
      );

    }

  }

  return text;

}




function toNumber(value:any){

  if(value===undefined || value===null)
    return 0;


  if(typeof value==="number")
    return value;


  return Number(
    String(value)
    .replaceAll(",","")
    .replaceAll(".","")
  ) || 0;

}







export function parseMisaFile(
 rows:any[][],
 type="MUA_VAO"
){



// =====================
// TÌM HEADER
// =====================


let headerIndex=-1;



for(let i=0;i<rows.length;i++){


 const row=rows[i];


 const text =
 row.join(" ").toLowerCase();



 if(
   text.includes("số hóa đơn")
   &&
   (
    text.includes("ngày hóa đơn")
    ||
    text.includes("ngày")
   )
 ){

   headerIndex=i;
   break;

 }


}




if(headerIndex===-1){

 console.log(
  "Không tìm thấy header MISA"
 );

 return [];

}




const headerRow =
 rows[headerIndex];





function col(name:string){

 return headerRow.findIndex(x=>

   String(x||"")
   .trim()
   .toLowerCase()
   .includes(
     name.toLowerCase()
   )

 );

}






let colSoHoaDon =
 col("số hóa đơn");



let colNgay =
 col("ngày hóa đơn");



if(colNgay===-1){

 colNgay =
 col("ngày");

}




let colMst;



// mua vào

if(type==="MUA_VAO"){


 colMst =
 col("mã số thuế người bán");


}


// bán ra

else {


 colMst =
 col("mã số thuế người mua");


}







let colTienTruocThue;



let colTienThue;



let colTongTien;





if(type==="MUA_VAO"){


 colTienTruocThue =
 col(
 "giá trị hhdv mua vào chưa có thuế"
 );


 colTienThue =
 col("thuế gtgt");


}
else{

  colTienTruocThue =
    col("doanh số bán chưa có thuế");

  colTienThue =
    headerRow.findIndex(x => {

      const text =
        String(x || "")
        .trim()
        .toLowerCase();

      return (
        text.includes("thuế gtgt")
        &&
        !text.includes("chưa")
        &&
        !text.includes("trước")
      );

    });



  colTongTien =
    col("tổng tiền thanh toán");

  console.log({
    colTienTruocThue,
    colTienThue,
    colTongTien
  });






}








colTongTien =
 col(
  "tổng tiền thanh toán"
);








const result:any[]=[];



const data =
 rows.slice(headerIndex+1);







for(const row of data){



 if(!row)
  continue;




 const soHoaDon =
 String(
  row[colSoHoaDon] || ""
 )
 .trim();





 // chỉ lấy dòng có số hóa đơn

 if(
  soHoaDon===""

 )
 continue;





 // loại dòng chữ rác

 if(
  isNaN(Number(soHoaDon))
 )

 continue;






console.log({
  soHoaDon,
  doanhSoRaw: row[colTienTruocThue],
  thueRaw: row[colTienThue],
  colTienTruocThue,
  colTienThue
});
 const tienTruocThue =
 toNumber(
  row[colTienTruocThue]
 );



 const tienThue =
 toNumber(
  row[colTienThue]
 );




 let tongTien;



 if(colTongTien!==-1){


   tongTien =
    toNumber(
     row[colTongTien]
    );


 }
 else{


   tongTien =
   tienTruocThue
   +
   tienThue;


 }







 const invoice:any={

  loaiNguon:
  "MISA",

  loaiHoaDon:
  type,

  kyHieu:
  "",

  mstNguoiBan:
  type==="MUA_VAO"
  ?
  String(
   row[colMst]||""
  ).trim()
  :
  "",

  mstNguoiMua:
  type==="BAN_RA"
  ?
  String(
   row[colMst]||""
  ).trim()
  :
  "",

  soHoaDon,

  ngayHoaDon:
  normalizeDate(
   row[colNgay]
  ),

  tienTruocThue,

  tienThue,

  tongTien

};

result.push({

  ...invoice

});


}






console.log(
 "MISA PARSE:",
 result.length
);



return result;


}
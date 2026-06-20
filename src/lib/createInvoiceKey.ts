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

  let text =
    String(value).trim();

  // Excel serial date

  if(!isNaN(Number(text))){

    const excel =
      Number(text);

    if(excel > 30000 && excel < 60000){

      const date =
        new Date(
          Math.round(
            (excel - 25569)
            *
            86400
            *
            1000
          )
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

  // dd/mm/yyyy

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

  // yyyy-mm-dd

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

export function createInvoiceKey(
  invoice:any,
  invoiceType="MUA_VAO"
){

  let mst = "";

  if(invoiceType==="MUA_VAO"){

    mst =
      String(
        invoice.mstNguoiBan || ""
      ).trim();

  }else{

    mst =
      String(
        invoice.mstNguoiMua || ""
      ).trim();

  }

  const soHoaDon =
    String(
      invoice.soHoaDon || ""
    )
    .replace(/^0+/,"")
    .trim();

  const ngayHoaDon =
    normalizeDate(
      invoice.ngayHoaDon
    );

  // BÁN RA KHÔNG CÓ MST NGƯỜI MUA

  if(
    invoiceType==="BAN_RA"
    &&
    !mst
  ){

    const key =
      soHoaDon
      +
      "_"
      +
      ngayHoaDon;

    console.log(
      "CREATE KEY:",
      invoice.loaiNguon,
      key
    );

    return key;

  }

  const key =
    mst
    +
    "_"
    +
    soHoaDon
    +
    "_"
    +
    ngayHoaDon;

  console.log(
    "CREATE KEY:",
    invoice.loaiNguon,
    key
  );

  return key;

}
"use client";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import { useState } from "react";
import { readExcel } from "../lib/parseExcel";
import { parseGovNormal } from "../lib/parseGovNormal";
import { parseGovMayTinhTien } from "../lib/parseGovMayTinhTien";
import { detectGovType } from "../lib/detectGovType";
import { parseMisaFile } from "../lib/parseMisaFile";
import { compareInvoices } from "../lib/compareInvoices";

export default function Home() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [govInvoices, setGovInvoices] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
const [govFilePage, setGovFilePage] = useState(1);

const GOV_FILES_PER_PAGE = 5;
  const [govCapMa, setGovCapMa] = useState<any[]>([]);
  const [govKhongCapMa, setGovKhongCapMa] = useState<any[]>([]);
  const [govMayTinhTien, setGovMayTinhTien] = useState<any[]>([]);
  const [misaInvoices, setMisaInvoices] = useState<any[]>([]);
  const [compareResults, setCompareResults] = useState<any[]>([]);
const [progress, setProgress] = useState(0);
const [isComparing, setIsComparing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [invoiceType, setInvoiceType] = useState("MUA_VAO");
const [filterStatus, setFilterStatus] = useState("ALL");
const [govPage, setGovPage] = useState(1);
const [keyword, setKeyword] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [selectedRow, setSelectedRow] =
  useState<number | null>(null);
const ITEMS_PER_PAGE = 30;
  const handleLogin = () => {
    if (password === "123456") {
      setLoggedIn(true);
    } else {
      alert("Sai mật khẩu!");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      let allInvoices: any[] = [];
      let capMaInvoices: any[] = [];
      let khongCapMaInvoices: any[] = [];
      let mayTinhTienInvoices: any[] = [];

      const fileInfos: any[] = [];

      for (const file of Array.from(files)) {
        const rows = await readExcel(file);

        const fileType = detectGovType(rows as any[][]);

        let invoices: any[] = [];

        if (fileType === "MAY_TINH_TIEN") {
          invoices = parseGovMayTinhTien(rows as any[][]);
          mayTinhTienInvoices.push(...invoices);
        } else if (fileType === "CAP_MA") {
          invoices = parseGovNormal(rows as any[][]);
          capMaInvoices.push(...invoices);
        } else {
          invoices = parseGovNormal(rows as any[][]);
          khongCapMaInvoices.push(...invoices);
        }

        allInvoices.push(...invoices);

        fileInfos.push({
          fileName: file.name,
          fileType,
          count: invoices.length,
        });
      }

      setGovInvoices(allInvoices);
      setGovCapMa(capMaInvoices);
      setGovKhongCapMa(khongCapMaInvoices);
      setGovMayTinhTien(mayTinhTienInvoices);
      setUploadedFiles(fileInfos);
setFilePage(1);

      alert(
        `Đọc được ${allInvoices.length} hóa đơn từ ${files.length} file`
      );
    } catch (error) {
      console.error(error);
      alert("Lỗi đọc file Excel");
    }
  };

  const handleMisaFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const rows = await readExcel(file);

      const invoices = parseMisaFile(rows as any[][], invoiceType);

      setMisaInvoices(invoices);

      console.log("MISA INVOICES:", invoices);

      alert(`Đọc được ${invoices.length} hóa đơn MISA`);
    } catch (error) {
      console.error(error);

      alert("Lỗi đọc file MISA");
    }
  };
const filteredResults = compareResults.filter((item) => {
  const matchStatus =
    filterStatus === "ALL" ||
    item.status === filterStatus;

  const matchKeyword =
    keyword === "" ||
    item.soHoaDon
      ?.toString()
      .toLowerCase()
      .includes(keyword.toLowerCase());

  return matchStatus && matchKeyword;
});

const totalPages = Math.ceil(
  filteredResults.length / ITEMS_PER_PAGE
);
const FILES_PER_PAGE = 5;

const [filePage, setFilePage] =
  useState(1);

const totalFilePages = Math.ceil(
  uploadedFiles.length / FILES_PER_PAGE
);

const paginatedFiles =
  uploadedFiles.slice(
    (filePage - 1) * FILES_PER_PAGE,
    filePage * FILES_PER_PAGE
  );
const govValidInvoices =
  govInvoices.filter(item => {

    const status =
      (
        item.trangThaiHoaDon || ""
      )
      .toLowerCase();

    return (
      !status.includes("hủy")
      &&
      !status.includes("huy")
      &&
      !status.includes("bị thay")
      &&
      !status.includes("bi thay")
    );

  });
const totalGovBeforeTax = govValidInvoices.reduce(
  (sum, item) =>
    sum + Number(item.tienTruocThue || 0),
  0
);

const totalGovTax = govValidInvoices.reduce(
  (sum, item) =>
    sum + Number(item.tienThue || 0),
  0
);

const totalGovAmount = govValidInvoices.reduce(
  (sum, item) =>
    sum + Number(item.tongTien || 0),
  0
);

const totalMisaBeforeTax = misaInvoices.reduce(
  (sum, item) =>
    sum + Number(item.tienTruocThue || 0),
  0
);

const totalMisaTax = misaInvoices.reduce(
  (sum, item) =>
    sum + Number(item.tienThue || 0),
  0
);

const totalMisaAmount = misaInvoices.reduce(
  (sum, item) =>
    sum + Number(item.tongTien || 0),
  0
);
const errorStats = compareResults.reduce(
  (acc: Record<string, number>, item) => {
    acc[item.status] =
      (acc[item.status] || 0) + 1;

    return acc;
  },
  {} as Record<string, number>
);
const paginatedResults = filteredResults.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);
const govItemsPerPage = 50;

const govTotalPages = Math.ceil(
  govInvoices.length / govItemsPerPage
);

const govPaginatedInvoices =
  govInvoices.slice(
    (govPage - 1) * govItemsPerPage,
    govPage * govItemsPerPage
  );
const statusOptions = [
  ...new Set(
    compareResults.map(
      (item) => item.status
    )
  ),
];
const exportCompareResult = () => {

  // ===================
  // SHEET KẾT QUẢ
  // ===================

  const resultData = compareResults.map((item) => ({
    "Số hóa đơn": item.soHoaDon,
    "Ngày hóa đơn": item.gov?.ngayHoaDon || "",
    "Trạng thái": item.status,

    "MST GOV":
      item.gov?.mstNguoiBan || "",

    "MST MISA":
      item.misa?.mstNguoiBan || "",

    "Tiền trước thuế GOV":
      item.gov?.tienTruocThue || 0,

    "Tiền trước thuế MISA":
      item.misa?.tienTruocThue || 0,

    "Thuế GOV":
      item.gov?.tienThue || 0,

    "Thuế MISA":
      item.misa?.tienThue || 0,

    "Tổng GOV":
      item.gov?.tongTien || 0,

    "Tổng MISA":
      item.misa?.tongTien || 0,
  }));


  // ===================
  // SHEET THỐNG KÊ
  // ===================

  const govBeforeTax = govInvoices.reduce(
    (sum, x) => sum + (x.tienTruocThue || 0),
    0
  );

  const misaBeforeTax = misaInvoices.reduce(
    (sum, x) => sum + (x.tienTruocThue || 0),
    0
  );

  const govTax = govInvoices.reduce(
    (sum, x) => sum + (x.tienThue || 0),
    0
  );

  const misaTax = misaInvoices.reduce(
    (sum, x) => sum + (x.tienThue || 0),
    0
  );

  const govTotal = govInvoices.reduce(
    (sum, x) => sum + (x.tongTien || 0),
    0
  );

  const misaTotal = misaInvoices.reduce(
    (sum, x) => sum + (x.tongTien || 0),
    0
  );

  const summaryData = [
    {
      "Chỉ tiêu": "Tổng tiền trước thuế",
      GOV: govBeforeTax,
      MISA: misaBeforeTax,
    },
    {
      "Chỉ tiêu": "Tổng tiền thuế",
      GOV: govTax,
      MISA: misaTax,
    },
    {
      "Chỉ tiêu": "Tổng thanh toán",
      GOV: govTotal,
      MISA: misaTotal,
    },
  ];


  // ===================
  // SHEET THEO THÁNG
  // ===================

  const monthMap: any = {};

  compareResults.forEach((item) => {

    const date =
      item.gov?.ngayHoaDon || "";

    if (!date) return;

    const month =
      date.slice(3, 10);

    if (!monthMap[month]) {
      monthMap[month] = {
        month,

        govBeforeTax: 0,
        misaBeforeTax: 0,

        govTax: 0,
        misaTax: 0,

        govTotal: 0,
        misaTotal: 0,
      };
    }

    monthMap[month].govBeforeTax +=
      item.gov?.tienTruocThue || 0;

    monthMap[month].misaBeforeTax +=
      item.misa?.tienTruocThue || 0;

    monthMap[month].govTax +=
      item.gov?.tienThue || 0;

    monthMap[month].misaTax +=
      item.misa?.tienThue || 0;

    monthMap[month].govTotal +=
      item.gov?.tongTien || 0;

    monthMap[month].misaTotal +=
      item.misa?.tongTien || 0;
  });

  const monthlyData = Object.values(
    monthMap
  ).map((x: any) => ({
    Tháng: x.month,

    "Trước thuế GOV":
      x.govBeforeTax,

    "Trước thuế MISA":
      x.misaBeforeTax,

    "Thuế GOV":
      x.govTax,

    "Thuế MISA":
      x.misaTax,

    "Tổng GOV":
      x.govTotal,

    "Tổng MISA":
      x.misaTotal,
  }));


  // ===================
  // SHEET THỐNG KÊ LỖI
  // ===================

  const errorMap: any = {};

  compareResults.forEach((item) => {
    errorMap[item.status] =
      (errorMap[item.status] || 0) + 1;
  });

  const errorData =
    Object.entries(errorMap).map(
      ([status, count]) => ({
        "Loại lỗi": status,
        "Số lượng": count,
      })
    );


  // ===================
  // TẠO FILE
  // ===================

  const wb = XLSX.utils.book_new();
const wsResult =
  XLSX.utils.json_to_sheet(resultData);
const range = XLSX.utils.decode_range(
  wsResult["!ref"] || "A1"
);

for (let row = 1; row <= range.e.r; row++) {

  const statusCell =
    wsResult[`C${row + 1}`];

  if (!statusCell) continue;

  const status =
    String(statusCell.v || "")
      .toUpperCase();

  let fillColor = "";

  if (status.includes("KHỚP")) {
    fillColor = "C6EFCE";
  }
  else if (
    status.includes("ĐIỀU CHỈNH") ||
    status.includes("THAY THẾ") ||
    status.includes("CẢNH BÁO")
  ) {
    fillColor = "FFEB9C";
  }
  else {
    fillColor = "FFC7CE";
  }

  for (
    let col = range.s.c;
    col <= range.e.c;
    col++
  ) {
    const cellRef =
      XLSX.utils.encode_cell({
        r: row,
        c: col,
      });

    if (!wsResult[cellRef]) continue;

    wsResult[cellRef].s = {
      fill: {
        fgColor: {
          rgb: fillColor,
        },
      },
    };
  }
}

  XLSX.utils.book_append_sheet(
  wb,
  wsResult,
  "KET_QUA_DOI_CHIEU"
);

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      summaryData
    ),
    "THONG_KE"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      monthlyData
    ),
    "THEO_THANG"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      errorData
    ),
    "THONG_KE_LOI"
  );

  const excelBuffer =
    XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

  saveAs(
    new Blob([excelBuffer]),
    `DoiChieuHoaDon_${
      new Date()
        .toISOString()
        .slice(0,10)
    }.xlsx`
  );
};
  if (loggedIn) {
    return (
      <>
        <div className="min-h-screen bg-white p-8">
     <div className="bg-gradient-to-r from-sky-50 to-white border border-sky-200 rounded-2xl shadow-md p-8 mb-8">

  <h1 className="text-center text-4xl font-bold text-sky-700">
    HỆ THỐNG ĐỐI CHIẾU HÓA ĐƠN
  </h1>

  <p className="text-center text-slate-500 mt-2">
    Đối chiếu hóa đơn điện tử giữa GOV và MISA
  </p>

</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            <button
              onClick={() => {
                setInvoiceType("MUA_VAO");
                setCompareResults([]);
              }}
              className={
               invoiceType === "MUA_VAO"
  ? "bg-blue-500 text-white p-8 rounded-xl text-xl font-bold"
  : "bg-blue-100 text-blue-700 p-8 rounded-xl text-xl font-bold hover:bg-blue-200"
              }
            >
              MUA VÀO
            </button>

            <button
              onClick={() => {
                setInvoiceType("BAN_RA");
                setCompareResults([]);
              }}
              className={
                invoiceType === "BAN_RA"
  ? "bg-cyan-500 text-white p-8 rounded-xl text-xl font-bold"
  : "bg-cyan-100 text-cyan-700 p-8 rounded-xl text-xl font-bold hover:bg-cyan-200"
              }
            >
              BÁN RA
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-blue-200 rounded-xl shadow p-6 w-full">
            <h2 className="text-xl font-bold text-sky-700 mb-4 text-center">
              UPLOAD FILE HÓA ĐƠN ĐIỆN TỬ
            </h2>

            <input
              type="file"
              accept=".xlsx,.xls"
              multiple
              onChange={handleFileChange}
              className="w-full border border-gray-400 rounded p-3 text-black"
            />

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold text-black mb-3">
                  File đã nhận diện
                </h3>

                {paginatedFiles.map((file, index) => (
                  <div key={index} className="border rounded p-3 mb-2 bg-gray-50">
                    <div className="font-semibold text-black">
                      {file.fileName}
                    </div>

                    <div className="text-black">
                      Loại:{" "}
                      {file.fileType === "CAP_MA"
                        ? "Đã cấp mã"
                        : file.fileType === "MAY_TINH_TIEN"
                        ? "Máy tính tiền"
                        : "Không cấp mã"}
                    </div>

                    <div className="text-black">
                      Số hóa đơn: {file.count}
                    </div>
                  </div>
                ))}
{totalFilePages > 1 && (
  <div className="flex justify-center gap-2 mt-3">

    <button
      disabled={filePage === 1}
      onClick={() =>
        setFilePage(filePage - 1)
      }
       className="px-3 py-1 border rounded bg-sky-100 hover:bg-sky-200 text-sky-800 disabled:bg-gray-200"
    >
      ◀
    </button>

    <span className="text-black px-2">
      {filePage}/{totalFilePages}
    </span>

    <button
      disabled={
        filePage === totalFilePages
      }
      onClick={() =>
        setFilePage(filePage + 1)
      }
      className="px-3 py-1 border rounded bg-sky-100 hover:bg-sky-200 text-sky-800 disabled:bg-gray-200"
    >
      ▶
    </button>

  </div>
)}
                <div className="mt-4 p-3 rounded bg-blue-50 border">
                  <div className="text-black">
                    Đã cấp mã: {govCapMa.length}
                  </div>

                  <div className="text-black">
                    Không cấp mã: {govKhongCapMa.length}
                  </div>

                  <div className="text-black">
                    Máy tính tiền: {govMayTinhTien.length}
                  </div>

                  <div className="font-bold text-black mt-2">
                    Tổng cộng: {govInvoices.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-blue-200 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-sky-700 text-center mb-4">
              UPLOAD FILE MISA
            </h2>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleMisaFileChange}
              className="w-full border border-gray-400 rounded p-3 text-black"
            />

            {misaInvoices.length > 0 && (
              <>
                <div className="mt-4 text-black font-bold">
                  MISA: {misaInvoices.length} hóa đơn
                </div>

                <button
 onClick={async () => {

  setIsComparing(true);
  setProgress(0);

  await new Promise(r => setTimeout(r, 100));

  const result = compareInvoices(
    govInvoices,
    misaInvoices,
    invoiceType,
    (percent:number) => {
      setProgress(percent);
    }
  );

  setCompareResults(result);

  setCurrentPage(1);
  setFilterStatus("ALL");
  setKeyword("");

  setProgress(100);

  await new Promise(r => setTimeout(r, 500));

  setIsComparing(false);

}}
  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
>
  Bắt đầu đối chiếu
</button>
{isComparing && (
  <div className="mt-4 flex justify-center">
    <div className="w-full max-w-md">

      <div className="flex justify-between mb-2">
        <span className="font-semibold text-black">
          Đang đối chiếu...
        </span>

        <span className="font-bold text-blue-600">
          {progress}%
        </span>
      </div>

      <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">

        <div
          className="h-5 bg-blue-500 transition-all duration-300"
          style={{
            width: `${progress}%`
          }}
        />

      </div>

    </div>
  </div>
)}
              </>
            )}
          </div>
</div>

          {compareResults.length > 0 && (
  <div className="mt-8 flex gap-4 text-center">
{/* THỐNG KÊ */}
<div className="w-1/3 bg-blue-50 border border-blue-200 rounded-xl shadow p-4">

  <h2 className="font-bold text-xl text-sky-700 mb-4">
    Thống kê
  </h2>

  <table className="w-full border text-sm text-black">
    <thead>
      <tr className="bg-blue-200">
        <th className="border p-2">
          Chỉ tiêu
        </th>

        <th className="border p-2">
          GOV
        </th>

        <th className="border p-2">
          MISA
        </th>
      </tr>
    </thead>

    <tbody>

      <tr>
        <td className="border p-2">
          Tiền trước thuế
        </td>

        <td className="border p-2 text-right">
          {totalGovBeforeTax.toLocaleString()}
        </td>

        <td className="border p-2 text-right">
          {totalMisaBeforeTax.toLocaleString()}
        </td>
      </tr>

      <tr>
        <td className="border p-2">
          Thuế GTGT
        </td>

        <td className="border p-2 text-right">
          {totalGovTax.toLocaleString()}
        </td>

        <td className="border p-2 text-right">
          {totalMisaTax.toLocaleString()}
        </td>
      </tr>

      <tr>
        <td className="border p-2 font-bold">
          Tổng tiền
        </td>

        <td className="border p-2 text-right font-bold">
          {totalGovAmount.toLocaleString()}
        </td>

        <td className="border p-2 text-right font-bold">
          {totalMisaAmount.toLocaleString()}
        </td>
      </tr>

    </tbody>
  </table>

  <div className="mt-6">
    <h3 className="font-bold text-xl text-sky-700 mb-3 mt-6">
  Thống kê lỗi
</h3>

    {Object.entries(errorStats).map(
  ([status, count]) => (
    <div
      key={String(status)}
      className="flex justify-between border-b py-1 text-black"
    >
      <span>{String(status)}</span>
      <span>{Number(count)}</span>
    </div>
  )
)}
  </div>

</div>
<div className="w-2/3 bg-white border border-blue-200 rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">

  <h2 className="font-bold text-2xl text-sky-700 text-center">
    Kết quả đối chiếu
  </h2>

  <button
    onClick={exportCompareResult}
    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
  >
    Xuất Excel
  </button>

</div>
<div className="flex gap-3 mb-4 flex-wrap">

  <input
    type="text"
    placeholder="Tìm số hóa đơn..."
    value={keyword}
    onChange={(e) => {
      setKeyword(e.target.value);
      setCurrentPage(1);
    }}
    className="border px-3 py-2 rounded text-black"
  />

  <select
  value={filterStatus}
  onChange={(e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  }}
  className="border px-3 py-2 rounded text-black"
>
  <option value="ALL">
    Tất cả
  </option>

  {statusOptions.map((status) => (
    <option
      key={status}
      value={status}
    >
      {status}
    </option>
  ))}
</select>

  <div className="flex items-center text-black font-semibold">
    Tổng: {filteredResults.length}
  </div>

</div>
             <div className="overflow-auto">

<table className="w-full border border-gray-400 text-sm text-black">

<thead>
<tr className="bg-blue-100 text-blue-800 font-bold">

<th className="border p-2 w-16">
STT
</th>

<th className="border p-2">
Số hóa đơn
</th>

<th className="border p-2">
Ngày hóa đơn
</th>

<th className="border p-2">
{invoiceType === "MUA_VAO"
  ? "MST người bán"
  : "MST người mua"}
</th>

<th className="border p-2">
Ghi chú
</th>

<th className="border p-2 w-32">
Chi tiết
</th>

</tr>
</thead>

<tbody>

{paginatedResults.map((item, index) => (

<tr
  key={index}
  onClick={() =>
    setSelectedRow(
      (currentPage - 1) * ITEMS_PER_PAGE + index
    )
  }  onDoubleClick={() => {
    setSelectedRow(
      (currentPage - 1) * ITEMS_PER_PAGE + index
    );
    setSelectedResult(item);
  }}
  className={`
    cursor-pointer
    transition-all duration-150

    ${
      item.status === "KHỚP"
        ? selectedRow ===
          (currentPage - 1) * ITEMS_PER_PAGE + index
          ? "bg-green-200 font-bold shadow-md"
          : "bg-green-50 hover:bg-green-100 hover:shadow-md"

        : item.status
            ?.toUpperCase()
            .includes("CẢNH BÁO")

        ? selectedRow ===
          (currentPage - 1) * ITEMS_PER_PAGE + index
          ? "bg-yellow-300 font-bold shadow-md"
          : "bg-yellow-50 hover:bg-yellow-100 hover:shadow-md"

        : selectedRow ===
          (currentPage - 1) * ITEMS_PER_PAGE + index
        ? "bg-red-300 font-bold shadow-md"
        : "bg-red-50 hover:bg-red-100 hover:shadow-md"
    }
  `}
>
<td className="border p-2 text-center">

{(currentPage - 1) *
  ITEMS_PER_PAGE +
  index +
  1}

</td>

<td className="border p-2 text-center">
{item.soHoaDon}
</td>

<td className="border p-2 text-center">
{item.gov?.ngayHoaDon}
</td>

<td className="border p-2 text-center">

{invoiceType === "MUA_VAO"
  ? item.gov?.mstNguoiBan
  : item.gov?.mstNguoiMua}

</td>

<td
  className={
    item.status === "KHỚP"
      ? "border p-2 font-bold text-green-700"
      : item.status
          ?.toUpperCase()
          .includes("CẢNH BÁO")
      ? "border p-2 font-bold text-yellow-700"
      : "border p-2 font-bold text-red-700"
  }
>
  {item.status}
</td>

<td className="border p-2 text-center">

<button
  onClick={(e) => {

    e.stopPropagation();

    setSelectedRow(
      (currentPage - 1) * ITEMS_PER_PAGE + index
    );

    setSelectedResult(item);

  }}
  className="
    px-3 py-1
    rounded
    border
    border-blue-500
    text-blue-600
    bg-white
    hover:bg-blue-500
    hover:text-white
    transition-all
  "
>
  Xem
</button>
</td>

</tr>

))}

</tbody>

</table>

</div>
<div className="flex justify-center items-center gap-3 mt-6 flex-wrap">

  <button
    disabled={currentPage === 1}
    onClick={() =>
      setCurrentPage(currentPage - 1)
    }
    className="px-4 py-2 rounded bg-gray-300 disabled:opacity-50"
  >
    ← Trước
  </button>

  <span className="font-bold text-black">
    Trang {currentPage} / {totalPages || 1}
  </span>

  <input
    type="number"
    min={1}
    max={totalPages}
    placeholder="Trang"
    className="w-20 border rounded px-2 py-1 text-center text-black"
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        const page = Number(
          (e.target as HTMLInputElement).value
        );

        if (
          page >= 1 &&
          page <= totalPages
        ) {
          setCurrentPage(page);
        }
      }
    }}
  />

  <button
    disabled={
      currentPage === totalPages ||
      totalPages === 0
    }
    onClick={() =>
      setCurrentPage(currentPage + 1)
    }
    className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
  >
    Sau →
  </button>

</div></div>
</div>
)}

          {govInvoices.length > 0 && (
            <div className="mt-8 bg-white border border-blue-200 rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-sky-700 text-center mb-4">
                Dữ liệu trang Hóa đơn điện tử ({govInvoices.length} hóa đơn)
              </h2>

              <div className="overflow-auto">
               <table className="w-full table-fixed border border-slate-400 text-sm text-black">
                  <thead>
                   <tr className="bg-blue-100 text-blue-800 font-bold">
                      <th className="border border-gray-400 p-2">MST Người Bán</th>
                      <th className="border border-gray-400 p-2">Ký Hiệu</th>
                      <th className="border border-gray-400 p-2">Số Hóa Đơn</th>
                      <th className="border border-gray-400 p-2">Ngày Hóa Đơn</th>
                      <th className="border border-gray-400 p-2">Tiền Trước Thuế</th>
                      <th className="border border-gray-400 p-2">Tiền Thuế</th>
                      <th className="border border-gray-400 p-2">Tổng Tiền</th>
                      <th className="border border-gray-400 p-2">Trạng Thái</th>
                      <th className="border border-gray-400 p-2">Kết Quả Kiểm Tra</th>
                    </tr>
                  </thead>

                  <tbody className="text-black font-normal">
                  {govPaginatedInvoices.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="border border-gray-400 p-2 text-right text-black">
                          {item.mstNguoiBan}
                        </td>
                        <td className="border border-gray-400 p-2 text-right text-black">
                          {item.kyHieu}
                        </td>
                        <td className="border border-gray-400 p-2 text-right text-black">
                          {item.soHoaDon}
                        </td>
                        <td className="border border-gray-400 p-2 text-right text-black">
                          {item.ngayHoaDon}
                        </td>
                        <td className="border border-gray-400 p-2 text-right text-black">
                          {item.tienTruocThue?.toLocaleString()}
                        </td>
                        <td className="border border-gray-400 p-2 text-right text-black">
                          {item.tienThue?.toLocaleString()}
                        </td>
                        <td className="border border-gray-400 p-2 text-right text-black">
                          {item.tongTien?.toLocaleString()}
                        </td>
                        <td className="border border-gray-400 p-2 text-right text-black">
                          {item.trangThaiHoaDon}
                        </td>
                        <td className="border border-gray-400 p-2 text-right text-black">
                          {item.ketQuaKiemTra}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
<div className="flex justify-between items-center mt-4">

  <div className="text-black">
    Tổng số hóa đơn: {govInvoices.length}
  </div>

  <div className="flex items-center gap-3">

    <button
      disabled={govPage === 1}
      onClick={() => setGovPage(govPage - 1)}
      className="px-3 py-2 rounded bg-gray-300 disabled:opacity-50"
    >
      ← Trước
    </button>

    <select
      value={govPage}
      onChange={(e) =>
        setGovPage(Number(e.target.value))
      }
      className="border rounded px-3 py-2 text-black"
    >
      {Array.from(
        { length: govTotalPages },
        (_, i) => (
          <option
            key={i + 1}
            value={i + 1}
          >
            Trang {i + 1}
          </option>
        )
      )}
    </select>

    <span className="font-bold text-black">
      / {govTotalPages || 1}
    </span>

    <button
      disabled={
        govPage === govTotalPages ||
        govTotalPages === 0
      }
      onClick={() => setGovPage(govPage + 1)}
      className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
    >
      Sau →
    </button>

  </div>

</div>
            </div>
          )}
        </div>

        {/* MODAL */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[1200px] max-h-[90vh] overflow-auto p-6 rounded-xl shadow-2xl">
              <h2 className="text-xl font-bold text-black mb-4">
  Hóa đơn {selectedResult.soHoaDon} - {selectedResult.status}
</h2>

              <div className="space-y-5">

  <div className="flex items-center justify-between">

    <div>
    <div className="text-lg font-bold text-black">
  Chi tiết hóa đơn
</div>

     <div className="text-lg font-bold text-black">
  Số hóa đơn: {selectedResult?.soHoaDon}
</div>
    </div>

    <span className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold">
      {selectedResult?.status}
    </span>

  </div>

 <table className="w-full table-fixed border border-blue-200 text-sm text-black">

<thead>
  <tr className="bg-slate-300 text-black font-bold">
   <th className="border p-2 text-center w-1/4">
  Chỉ tiêu
</th>

<th className="border p-2 text-center w-[37.5%]">
  GOV
</th>

<th className="border p-2 text-center w-[37.5%]">
  MISA
</th>
  </tr>
</thead>

    <tbody className="text-black font-semibold">

      <tr>
        <td className="border p-2 font-medium">
          MST người bán
        </td>

       <td className="border p-2 text-black text-right">
  {selectedResult?.gov?.mstNguoiBan}
</td>

<td className="border p-2 text-right">
  {selectedResult?.misa?.mstNguoiBan}
</td>
      </tr>

      <tr>
        <td className="border p-2 font-medium">
          Tên người bán
        </td>

        <td className="border p-2 text-right">
          {selectedResult?.gov?.tenNguoiBan}
        </td>

        <td className="border p-2 text-right">
          {selectedResult?.misa?.tenNguoiBan}
        </td>
      </tr>

      <tr>
        <td className="border p-2 font-medium">
          MST người mua
        </td>

        <td className="border p-2 text-right">
          {selectedResult?.gov?.mstNguoiMua}
        </td>

        <td className="border p-2 text-right">
          {selectedResult?.misa?.mstNguoiMua}
        </td>
      </tr>

      <tr>
        <td className="border p-2 font-medium">
          Tên người mua
        </td>

        <td className="border p-2 text-right">
          {selectedResult?.gov?.tenNguoiMua}
        </td>

        <td className="border p-2 text-right">
          {selectedResult?.misa?.tenNguoiMua}
        </td>
      </tr>

      <tr>
        <td className="border p-2 font-medium">
          Ngày hóa đơn
        </td>

        <td className="border p-2 text-right">
          {selectedResult?.gov?.ngayHoaDon}
        </td>

        <td className="border p-2 text-right">
          {
  selectedResult?.misa?.ngayHoaDon
    ? `${selectedResult.misa.ngayHoaDon.slice(6,8)}/${
        selectedResult.misa.ngayHoaDon.slice(4,6)
      }/${selectedResult.misa.ngayHoaDon.slice(0,4)}`
    : ""
}
        </td>
      </tr>

      <tr>
        <td className="border p-2 font-medium">
          Tiền trước thuế
        </td>

        <td className="border p-2 text-right">
          {Number(
            selectedResult?.gov?.tienTruocThue || 0
          ).toLocaleString()}
        </td>

        <td className="border p-2 text-right">
          {Number(
            selectedResult?.misa?.tienTruocThue || 0
          ).toLocaleString()}
        </td>
      </tr>

      <tr>
        <td className="border p-2 font-medium">
          Thuế GTGT
        </td>

        <td className="border p-2 text-right">
          {Number(
            selectedResult?.gov?.tienThue || 0
          ).toLocaleString()}
        </td>

        <td className="border p-2 text-right">
          {Number(
            selectedResult?.misa?.tienThue || 0
          ).toLocaleString()}
        </td>
      </tr>

      <tr className="bg-gray-50 font-medium">

        <td className="border p-2">
          Tổng tiền
        </td>

        <td className="border p-2 text-right font-bold">
          {Number(
            selectedResult?.gov?.tongTien || 0
          ).toLocaleString()}
        </td>

        <td className="border p-2 text-right">
          {Number(
            selectedResult?.misa?.tongTien || 0
          ).toLocaleString()}
        </td>

      </tr>
<tr>
  <td className="border p-2 font-medium">
    Loại hóa đơn
  </td>

  <td className="border p-2 text-right">
    {selectedResult?.gov?.ketQuaKiemTra}
  </td>

  <td className="border p-2 text-right">
    -
  </td>
</tr>

<tr>
  <td className="border p-2 font-medium">
    Trạng thái hóa đơn
  </td>

  <td className="border p-2 text-right">
    {selectedResult?.gov?.trangThaiHoaDon}
  </td>

  <td className="border p-2 text-right">
    -
  </td>
</tr>

    </tbody>

  </table>

</div>

              <button
                onClick={() => setSelectedResult(null)}
                className="mt-5 bg-red-500 text-white px-4 py-2 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="bg-gradient-to-r from-sky-50 to-white border border-sky-200 rounded-2xl shadow-md p-8 mb-8">

  <h1 className="text-center text-4xl font-bold text-sky-700">
    HỆ THỐNG ĐỐI CHIẾU HÓA ĐƠN
  </h1>

  <p className="text-center text-slate-500 mt-2">
    Đối chiếu hóa đơn điện tử giữa GOV và MISA
  </p>

</div>

        <p className="text-center text-gray-500 mb-6">
          Phiên bản Beta 
        </p>

        <input
          type="password"
          placeholder="Nhập mật khẩu truy cập"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 mb-4 text-gray-500 mb-6"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
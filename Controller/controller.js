const excelJs = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const user = require("../Model/user");
const axios = require("axios");

//Uploading Excel file
const readExcelFile = async (req, res) => {
  const data = [];
  const errMsg = [];
  console.log("Path", req.file.path);
  
  // Read excel file
  const wb = new excelJs.Workbook();
  await wb.xlsx.readFile(req.file.path);
  fs.unlinkSync(req.file.path)
  const sheetCount = wb.worksheets.length;

  // Check empty sheets
  if (sheetCount === 0) {
    errMsg.push({ message: "Workbook empty." });
  } else {
    for (let i = 0; i < sheetCount; i++) {
      let sheet = wb.worksheets[i];
      sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber === 1) {
          // Checking if Header exists
          if (!row.hasValues) {
            errMsg.push({ status: "Error", message: "Empty Headers" });
          } else if (row.values[1] !== "Name" || row.values[2] !== "Age") {
            errMsg.push({
              location: "Row " + rowNumber,
              message: "Incorrect Headers",
            });
          }
        }
        // Checking only those rows which have a value
        else if (row.hasValues) {
          const alphabetRegex = new RegExp(/[a-zA-Z]+/);
          const numberRegex = new RegExp(/[0-9]+/);
          if (
            row.cellCount === 2 &&
            row.values[1] !== undefined &&
            row.values[2] !== undefined &&
            alphabetRegex.test(row.values[1]) &&
            numberRegex.test(row.values[2])
          ) {
            data.push({ Name: row.values[1], Age: row.values[2] });
          } else {
            errMsg.push({
              location: "Row " + rowNumber,
              message: "Incorrect or missing values.",
            });
          }
        }
      });
    }
  }

  console.log("errMsg: ", errMsg);
  console.log("data: ", data);
  let resp;
  if (errMsg.length > 0) {
    throw "Unable to Upload Excel file";
  } else {
    resp = await user.bulkCreate(data);
  }

  if (resp.length > 0) {
    await axios.get("http://localhost:5051/get");
  }
};

//Downloading File

const downloadPdf = async (req, res) => {
  try {
    //Getting from db
    const resp = await user.findAll({
      where: {},
      attributes: {
        exclude: ["Name", "createdAt", "updatedAt", "id"],
      },
    });
    //console.log(resp);

    let sum = 0;
    let count = 0;
    let arr = [];
    for (let index = 0; index < resp.length; index++) {
      arr.push(parseInt(resp[index].Age));
      count++;
    }
    //Array iteration
    arr.map((res) => {
      sum += res;
    });

    console.log("Sum of age:", sum);
    console.log("Count :", count);

    // Create a document
    const doc = new PDFDocument();

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(fs.createWriteStream("./Upload/output.pdf"));

    // Embed a font, set the font size, and render some text
    doc
      .fontSize(25)
      .text(
        `totalNumber of Record's:${count} || averageAge:${sum / count}`,
        100,
        100
      );
    doc.end();
    //res.send("Pdf created successfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  downloadPdf,
  readExcelFile,
};

const excelJs = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const user = require("../Model/user");

//Reading Excel File
const readFile = async (req, res) => {
  try {
    let data = [];
    const workbook = new excelJs.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    fs.unlinkSync(req.file.path);

    workbook.eachSheet(function (workSheet) {
      workSheet.eachRow(function (row) {
        if (onlyLetters(row.values[1]) && containsOnlyNumbers(row.values[2])) {
          let data1 = {
            Name: row.values[1],
            Age: row.values[2],
          };
          console.log("data:", data1);
          data.push(data1);
        }
      });
    });
    console.log(data);
    //Db Insertion
    const resp = await user.bulkCreate(data);
    res.send(resp);
  } catch (error) {
    res.send(error);
    console.log(error);
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
    res.send("Pdf created successfully");
  } catch (error) {
    console.log(error);
  }
};

//Validation function
function onlyLetters(str) {
  return /^[a-zA-Z]+$/.test(str);
}

function containsOnlyNumbers(str) {
  return /^[0-9]+$/.test(str);
}

module.exports = {
  readFile,
  downloadPdf,
};

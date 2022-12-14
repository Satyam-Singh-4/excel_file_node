const excelJs = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const user = require("../Model/user");
const axios = require("axios");

//Reading Excel File
const readFile = async (req, res) => {
  try {
    let resp1 = [];
    let errMsg = [];
    const workbook = new excelJs.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    fs.unlinkSync(req.file.path);

    //let workSheet = workbook.getWorksheet[0];
    const actualCount = workbook.worksheets[0].actualRowCount;
    const rCount = workbook.worksheets[0].rowCount;
    console.log(rCount);

    //Check data availability in sheet
    if (actualCount > 1) {
      let resp = validateHeaders(workbook.worksheets[0].getRow(1).values);
      //header validation
      if (resp.status === "ERROR") {
        msg.push({ location: resp.location, message: resp.message });
      } else {
        for (let index = 2; index <= rCount; index++) {
          let resp = fieldValidation(
            workbook.worksheets[0].getRow(index).values
          );
          console.log(resp);
          if (resp.status === "Success") {
            resp1.push(resp.data);
          } else {
            for (const msg of resp.message) {
              errMsg.push({
                location: "Row" + index,
                message: msg.message,
              });
            }
          }
        }
      }
    } else {
      msg.push("Data is not available in sheet ");
    }
    console.log(resp1);

    console.log(errMsg);

    // //Db Insertion
    let resp;
    if (errMsg.length > 0) {
      throw "Insertion failed";
    } else {
      resp = await user.bulkCreate(resp1);
      // res.send(resp);
      //console.log(resp)
    }
    if (resp.length > 0) {
      await axios.get("http://localhost:5051/get");
    }
    l;
    //res.send(resp);
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
    //res.send("Pdf created successfully");
  } catch (error) {
    console.log(error);
  }
};

//Validate name
function onlyLetters(str) {
  return /^[a-zA-Z]+$/.test(str);
}
//Validate Age
function containsOnlyNumbers(str) {
  return /^[0-9]+$/.test(str);
}

//Header validation function
function validateHeaders(headerRow) {
  // console.log(headerRow);

  if (headerRow[1] !== "Name" || headerRow[2] !== "Age") {
    return { status: "ERROR", location: "ROW 1", message: "Incorrect Header." };
  } else {
    return { status: "SUCCESS" };
  }
}

//Field validation

function fieldValidation(row) {
  //console.log("row:", row);
  let errArray = [];
  if (!onlyLetters(row[1])) {
    errArray.push({
      status: "Error",
      message: "Name is not valid",
    });
  }

  if (!containsOnlyNumbers(row[2])) {
    errArray.push({
      status: "Error",
      message: "Age are not valid",
    });
  }

  if (errArray.length === 0) {
    return {
      status: "Success",
      data: {
        Name: row[1],
        Age: row[2],
      },
    };
  } else {
    return { status: "Error", message: errArray };
  }
}
module.exports = {
  readFile,
  downloadPdf,
};

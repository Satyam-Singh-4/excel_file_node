const excelJs = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const user = require("../Model/user");

//Reading Excel File
const readFile = async (req, res) => {
  try {
    let resp1;
    let msg = [];
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
        //Field validation
        resp1 = fieldValidation(rCount, workbook);
        if (resp1.status === "ERROR") {
          msg.push(resp1);
        } else {
          console.log("Response:", resp1);
        }
      }
    } else {
      msg.push("Data is not available in sheet ");
    }
    //console.log(msg);

    console.log(msg);

    // //Db Insertion
    if (msg.length > 0) {
      throw "Insertion failed";
    } else {
      const resp = await user.bulkCreate(resp1);
      res.send(resp);
      //console.log(resp)
    }
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
    Nam;
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

function fieldValidation(rCount, workbook) {
  let array = [];

  for (let index = 2; index <= rCount; index++) {
    if (
      workbook.worksheets[0].getRow(index).values[1] == null ||
      workbook.worksheets[0].getRow(index).values[2] == null
    ) {
      return {
        status: "Error",
        Message: "Field must not be empty",
        location: "Row" + index,
      };
    } else {
      if (
        onlyLetters(workbook.worksheets[0].getRow(index).values[1]) &&
        containsOnlyNumbers(workbook.worksheets[0].getRow(index).values[2])
      ) {
        let data1 = {
          Name: element[1],
          Age: element[2],
        };
        array.push(data1);
      } else {
        return {
          status: "ERROR",
          error_Name: workbook.worksheets[0].getRow(index).values[1],
          errors_Age: workbook.worksheets[0].getRow(index).values[2],
        };
      }
    }
  }
  return array;
}
module.exports = {
  readFile,
  downloadPdf,
};

const excel = require('excel4node');
const fs = require('fs/promises')
const path = require('path')

function getWorksheet(elements) {
    return new Promise((resolve)=>{
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet('Gustos');

        worksheet.cell(1,1).string('id');
        worksheet.cell(1,2).string('Me Gusta');
        worksheet.cell(1,3).string('No Gusta');
        
        for (let i=2, index=0;i<elements.length+2;i++, index++) {
            worksheet.cell(i,1).number(elements[index].id);
            worksheet.cell(i,2).string(elements[index].meGusta);
            worksheet.cell(i,3).string(elements[index].noGusta);

        }

        const filename = 'gustos'+ Date.now() +'.xls'
        workbook.write(filename, (err, stats)=> {
            if (err) {
              resolve(err);
            } else {
              resolve(filename); 
            }
        });
    });
}

function deleteWorksheets (fileList) {
    return new Promise ((resolve) => {
        fileList.forEach((filename)=>{
            fs.unlink(filename, (error)=>{
                if (error) {
                    resolve(error);
                }
            });
        });
        resolve('Se eliminaron los archivos enviados.');
    });
}

function findByExtension (dir, ext) {
    const matchedFiles = [];
    return new Promise ((result) => {
        fs.readdir(dir).then((resolve)=>{
            resolve.forEach(element => {
                if (path.extname(element)===ext) {
                    matchedFiles.push(element);
                }
            });
            result(matchedFiles);
        });
    });
};

module.exports= {
    getWorksheet,
    deleteWorksheets,
    findByExtension
}
import * as Excel from "exceljs";
import {saveAs} from "file-saver";

export const estimateXlsxReader = async () => {
    const xlsx = await fetch('estimateTemplate/sample.xlsx')
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(await xlsx.arrayBuffer())
    const worksheet = workbook.getWorksheet(1)
    const mergedCells = worksheet._merges
    const rowsData = []
    worksheet.eachRow({includeEmpty: true}, (row, rowNumber) => {
        const rowData = {rowInfo: {height: row.height}, cellsData: []}
        row.eachCell({includeEmpty: true}, (cell, colNumber) => {
            rowData.cellsData.push({value: cell.value, style: cell.style})
        })
        rowsData.push(rowData)
    })
    return {rowsData, mergedCells}
}

export const estimateXlsxWriter = async (data, mergedCells) => {
    const newWorkbook = new Excel.Workbook();
    const newWorksheet = newWorkbook.addWorksheet('견적', {views: [{showGridLines: false}]})
    const colWidth = [1.5, 1.5, 18, 18, 12, 7, 12, 25, 1.5]
    data.forEach((rowData) => {
        const newRow = newWorksheet.addRow(rowData.cellsData.map((cellData) => {
            if (!cellData.value) {
                if (Object.keys(cellData.style.border || {}).length || cellData.style.fill?.bgColor) return ''
            } else {
                return cellData.value
            }
        }));
        newRow.height = rowData.rowInfo.height;
        newRow.eachCell((cell, colNumber) => {
            const cellData = rowData.cellsData[colNumber - 1];
            if (cellData.style) {
                cell.style = cellData.style;
            }
        });
    });
    for (const cellAddress in mergedCells) {
        const cellInfo = mergedCells[cellAddress].model;
        const {top, left, bottom, right} = cellInfo;
        newWorksheet.mergeCells(top, left, bottom, right);
    }
    for (let i = 1; i <= newWorksheet.columns.length; i++) {
        newWorksheet.getColumn(i).width = colWidth[i - 1]
    }

    const logoImageBuffer = await (await fetch('estimateTemplate/logo.png')).arrayBuffer()

    const image = newWorkbook.addImage({extension: 'png', buffer: new Uint8Array(logoImageBuffer)})
    newWorksheet.addImage(image, {tl: {col: 2, row: 2.6}, ext: {width: 360, height: 88}})

    saveAs(new Blob([await newWorkbook.xlsx.writeBuffer()], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "견적서.xlsx")
}

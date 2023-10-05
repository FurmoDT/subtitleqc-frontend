import * as Excel from "exceljs";
import {saveAs} from "file-saver";
import {formatTimestamp} from "./functions";

// export const estimateXlsxReader = async () => {
//     const xlsx = await fetch('estimateTemplate/sample.xlsx')
//     const workbook = new Excel.Workbook();
//     await workbook.xlsx.load(await xlsx.arrayBuffer())
//     const worksheet = workbook.getWorksheet(1)
//     const mergedCells = worksheet._merges
//     const rowsData = []
//     worksheet.eachRow({includeEmpty: true}, (row, rowNumber) => {
//         const rowData = {rowInfo: {height: row.height}, cellsData: []}
//         row.eachCell({includeEmpty: true}, (cell, colNumber) => {
//             if (colNumber < 10) rowData.cellsData.push({value: cell.value, style: cell.style})
//         })
//         rowsData.push(rowData)
//     })
//     console.log(rowsData.slice(0, 45))
//     return {rowsData, mergedCells}
// }

export const estimateXlsxWriter = async (projectInfo, estimateItems, vatChecked) => {
    const newWorkbook = new Excel.Workbook();
    const newWorksheet = newWorkbook.addWorksheet('견적', {views: [{showGridLines: false}]})
    const colWidth = [1.5, 1.5, 18, 18, 12, 7, 12, 25, 1.5]
    const itemCounter = Math.max(estimateItems.length - 3, 0) // default item list size 3
    const rowsData = await (await fetch('estimateTemplate/rowsData.json')).json()

    if (itemCounter) for (let i = 0; i < itemCounter; i++) rowsData.splice(29, 0, JSON.parse(JSON.stringify(rowsData[29])))

    rowsData.forEach((rowData, index) => {
        if (index === 10) rowData.cellsData[7].value = formatTimestamp(Date.now()).replaceAll('-', '.').slice(0, 10)
        else if (index === 11) rowData.cellsData[7].value = projectInfo.client?.label
        else if (index === 12) rowData.cellsData[7].value = '클라이언트담당자명'
        else if (index === 13) rowData.cellsData[7].value = '클라이언트담당자전화번호'
        else if (index === 14) {
            rowData.cellsData[3].value = projectInfo.pm?.email
            rowData.cellsData[7].value = '클라이언트담당자이메일'
        } else if (index === 15) rowData.cellsData[3].value = projectInfo.pm?.label
        else if (index === 19) rowData.cellsData[3].value = projectInfo.projectName
        else if (28 <= index && index <= 30 + itemCounter) {
            const price = estimateItems[index - 28]?.price, count = estimateItems[index - 28]?.count
            rowData.cellsData[2].value = estimateItems[index - 28]?.name
            rowData.cellsData[4].value = parseInt(price)
            rowData.cellsData[5].value = parseInt(count)
            rowData.cellsData[6].value = (price && count && {"formula": `E${index + 1}*F${index + 1}`}) || null
            rowData.cellsData[7].value = estimateItems[index - 28]?.memo
        } else if (index === 31 + itemCounter) rowData.cellsData[6].value = {"formula": `SUM(G29:G${31 + itemCounter})`}
        else if (index === 33 + itemCounter) rowData.cellsData[6].value = {"formula": `G${32 + itemCounter}*${vatChecked ? 0.1 : 0}`}
        else if (index === 34 + itemCounter) rowData.cellsData[6].value = {"formula": `G${32 + itemCounter}+G${34 + itemCounter}`}

        const newRow = newWorksheet.addRow(rowData.cellsData.map((cellData) => {
            if (!cellData.value) {
                if (Object.keys(cellData.style.border || {}).length || cellData.style.fill?.bgColor) return ''
                return null
            } else {
                return cellData.value
            }
        }));
        newRow.height = rowData.rowInfo.height;
        newRow.eachCell((cell, colNumber) => {
            const cellData = rowData.cellsData[colNumber - 1];
            if (cellData.style) cell.style = cellData.style;
        });
    });

    newWorksheet.mergeCells(5, 7, 7, 8)
    newWorksheet.mergeCells(26, 3, 26, 8)
    for (let i = 0; i <= itemCounter + 3; i++) newWorksheet.mergeCells(28 + i, 3, 28 + i, 4)
    newWorksheet.mergeCells(32 + itemCounter, 3, 32 + itemCounter, 6)
    newWorksheet.mergeCells(34 + itemCounter, 3, 34 + itemCounter, 6)
    newWorksheet.mergeCells(35 + itemCounter, 3, 35 + itemCounter, 6)
    newWorksheet.mergeCells(41 + itemCounter, 3, 41 + itemCounter, 8)

    for (let i = 1; i <= newWorksheet.columns.length; i++) newWorksheet.getColumn(i).width = colWidth[i - 1]

    const logoImageBuffer = await (await fetch('estimateTemplate/logo.png')).arrayBuffer()
    const image = newWorkbook.addImage({extension: 'png', buffer: new Uint8Array(logoImageBuffer)})
    newWorksheet.addImage(image, {tl: {col: 2, row: 2.6}, ext: {width: 360, height: 88}})

    saveAs(new Blob([await newWorkbook.xlsx.writeBuffer()], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "견적서.xlsx")
}

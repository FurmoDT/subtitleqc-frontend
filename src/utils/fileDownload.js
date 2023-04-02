export const downloadSrt = (fileData) => {
    const blob = new Blob(['\ufeff',fileData.subtitle], {type: "text/plain"})
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `${fileData.name}.srt`
    link.href = url;
    link.click();
}

export const downloadFspx = (fileData) => {
    const blob = new Blob([JSON.stringify(fileData, null, 2)], {type: 'application/json;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `${fileData.projectDetail.name || '-'}.fspx`
    link.href = url;
    link.click();
}

export const downloadCsv = (fileData) => {
    const csvData = `번호,TC IN,TC OUT,${fileData.language}\n`
    const blob = new Blob(['\ufeff' + csvData + fileData.subtitle], {type: 'text/csv;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `${fileData.name}.csv`
    link.href = url;
    link.click();
}

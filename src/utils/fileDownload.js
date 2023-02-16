export const downloadSrt = (fileData) => {
    const blob = new Blob([fileData.subtitle], {type: "text/plain"})
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `${fileData.name}.srt`
    link.href = url;
    link.click();
}

export const downloadFspx = (fileData) => {
    const blob = new Blob([JSON.stringify(fileData)], {type: 'application/json;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `${fileData.name}.fspx`
    link.href = url;
    link.click();
}

import type AttachmentModel from "../../utools/keepass/Attachment";


export function getFileType(file: AttachmentModel) {
  return (file.mimeType || '').split('/')[0]
}

/**
* 计算 文件大小
* @param byteLen {number} byte length
*/
export function getFileSize(byteLen: number) {
  console.log(byteLen)
  const { v, u } = byteLen >= 1024 ? { v: byteLen / 1024, u: "KB" } : { v: byteLen, u: "B" }
  return v.toFixed(2) + " " + u
}

/**
*  load attachment file to view
*/
export function readFileAsync(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => {
      resolve(fileReader.result as string);
    });

    fileReader.addEventListener('error', () => {
      reject(fileReader.error);
    });

    // 根据文件类型调用相关方法
    if (file.type.includes('text')) {
      fileReader.readAsText(file);
    } else {
      fileReader.readAsArrayBuffer(file);
    }
  });
}

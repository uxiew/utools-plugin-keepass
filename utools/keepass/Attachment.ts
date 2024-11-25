import { KdbxBinaryRefWithValue, ProtectedValue } from "kdbxweb"
import type { BinariesType } from "./Entry"

export interface AttachmentType {
  title: string
  data: BinariesType
  icon?: string
  mimeType?: string
  ext?: string
}

export default class AttachmentModel {

  title!: AttachmentType['title']
  data!: AttachmentType['data']
  icon: AttachmentType['icon']
  mimeType: AttachmentType['mimeType']
  ext: AttachmentType['ext']

  constructor(data: AttachmentType) {
    Object.assign(this, data)
  }

  getBinary() {
    let data = this.data;
    if ((data as KdbxBinaryRefWithValue)?.value) data = (data as KdbxBinaryRefWithValue).value;
    if ((data as ProtectedValue).getBinary) data = (data as ProtectedValue).getBinary();
    if (data instanceof ArrayBuffer && data.byteLength) {
      data = new Uint8Array(data);
    }
    if (data instanceof Uint8Array) {
      return data;
    }
    return new Uint8Array()
  }

  static fromAttachment(att: AttachmentType) {
    const ext = getExtension(att.title);
    return new AttachmentModel({
      title: att.title,
      data: att.data,
      ext,
      icon: getIcon(ext),
      mimeType: getMimeType(ext)
    });
  }
}

function getExtension(fileName: string) {
  const ext = fileName ? fileName.split('.').pop() : undefined;
  return ext ? ext.toLowerCase() : undefined;
}

function getIcon(ext?: string) {
  switch (ext) {
    case 'txt':
    case 'log':
    case 'rtf':
    case 'pem':
      return 'file-alt';
    case 'html':
    case 'htm':
    case 'js':
    case 'css':
    case 'xml':
    case 'config':
    case 'json':
    case 'yaml':
    case 'cpp':
    case 'c':
    case 'h':
    case 'cc':
    case 'hpp':
    case 'mm':
    case 'cs':
    case 'php':
    case 'sh':
    case 'py':
    case 'java':
    case 'rb':
    case 'cfg':
    case 'properties':
    case 'yml':
    case 'asm':
    case 'bat':
      return 'file-code';
    case 'pdf':
      return 'file-pdf';
    case 'zip':
    case 'rar':
    case 'bz':
    case 'bz2':
    case '7z':
    case 'gzip':
    case 'gz':
    case 'tar':
    case 'cab':
    case 'ace':
    case 'dmg':
    case 'jar':
      return 'file-archive';
    case 'doc':
    case 'docx':
      return 'file-word';
    case 'xls':
    case 'xlsx':
      return 'file-excel';
    case 'ppt':
    case 'pptx':
      return 'file-powerpoint';
    case 'jpeg':
    case 'jpg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'tiff':
    case 'svg':
    case 'ico':
    case 'psd':
      return 'file-image';
    case 'avi':
    case 'mp4':
    case '3gp':
    case 'm4v':
    case 'mov':
    case 'mpeg':
    case 'mpg':
    case 'mpe':
      return 'file-video';
    case 'mp3':
    case 'wav':
    case 'flac':
      return 'file-audio';
  }
  return 'file';
}

function getMimeType(ext?: string) {
  switch (ext) {
    case 'txt':
    case 'log':
    case 'html':
    case 'htm':
    case 'js':
    case 'css':
    case 'xml':
    case 'config':
    case 'json':
    case 'yaml':
    case 'cpp':
    case 'c':
    case 'h':
    case 'cc':
    case 'hpp':
    case 'mm':
    case 'cs':
    case 'php':
    case 'sh':
    case 'py':
    case 'java':
    case 'rb':
    case 'cfg':
    case 'properties':
    case 'yml':
    case 'asm':
    case 'pem':
      return 'text/plain';
    case 'pdf':
      return 'application/pdf';
    case 'jpeg':
    case 'jpg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'tiff':
    case 'svg':
      return 'image/' + ext;
  }
}

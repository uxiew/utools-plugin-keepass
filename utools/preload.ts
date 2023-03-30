import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { kdbxDB as keepass, IconMap } from './keepass';

export const getKeyIv = (passphrase: string) => {
  const hash1 = crypto.createHash('md5').update(passphrase).digest('hex');
  const hash2 = crypto
    .createHash('md5')
    .update(hash1 + passphrase)
    .digest('hex');
  const hash3 = crypto
    .createHash('md5')
    .update(hash2 + passphrase)
    .digest('hex');
  return { key: hash2, iv: hash3.slice(16) };
};

export function encryptValue(keyiv: {
  key: string;
  iv: string;
}, data: string) {
  if (!data) return '';
  const cipher = crypto.createCipheriv('aes-256-cbc', keyiv.key, keyiv.iv);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

export function decryptValue(keyiv: {
  key: string;
  iv: string;
}, data: string) {
  if (!data) return '';
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    keyiv.key,
    keyiv.iv
  );
  return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
}

export function exportFile(content: string, ext = '.txt') {
  const saveFile = path.join(
    window.utools.getPath('downloads'),
    'uTools-密码管理器-' + Date.now() + ext
  );
  fs.writeFileSync(saveFile, content, 'utf-8');
  window.utools.shellShowItemInFolder(saveFile);
}

export const readBuffer = (filepath: string) => fs.readFileSync(filepath).buffer

export function selectFile2Import() {
  const [file = ''] =
    window.utools.showOpenDialog({
      title: '选择文件',
      // filters: {
      //   extensions: ['kdbx']
      // },
      properties: ['openFile', 'dontAddToRecent']
    }) || [];
  return {
    filepath: file,
    filename: path.basename(file),
    buffer: readBuffer(file)
  };
}

export { keepass, IconMap };

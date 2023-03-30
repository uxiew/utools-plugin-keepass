import fs from "node:fs";



export async function openKdbx(password?: string, kdbxFilePath?: string, kdbxKeyPath?: string, kdbxFileData?: ArrayBuffer,
  kdbxKeyData?: ArrayBuffer) {
  const kdbxDB = window.utools.dbStorage.getItem('kdbx');
  if (kdbxDB) {
    password = password ?? window.services.decryptValue(kdbxDB.keyIV, kdbxDB.password)
    kdbxKeyPath = kdbxDB.kdbxKeyPath
    kdbxFilePath = kdbxDB.kdbxFilePath
    kdbxFileData = window.services.readBuffer(kdbxFilePath!)
    kdbxKeyData = window.services.readBuffer(kdbxKeyPath!)
  }

  const kdbx = new window.services.keepass();
  const passwordVal = window.services.keepass.generatPassword(password!);
  const status = await kdbx.open(
    passwordVal,
    kdbxFileData!,
    kdbxKeyData
  );
  if (!status) return;
  const keyIV = window.services.getKeyIv(password!);
  utools.dbStorage.setItem('kdbx', {
    keyIV,
    password: window.services.encryptValue(keyIV, password!),
    kdbxFilePath,
    kdbxKeyPath
  });

  return kdbx
}
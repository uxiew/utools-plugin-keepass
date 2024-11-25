/**
* @description 打开kdbx密码
*/
export async function openKdbx(password?: string,
  kdbxFilePath?: string, kdbxKeyPath?: string,
  kdbxFileData?: ArrayBuffer, kdbxKeyData?: ArrayBuffer) {
  const { encryptValue, decryptValue, getKeyIv, keepass, readBuffer } = window.services
  password = import.meta.env.VITE_TEST_PASSWORD || password

  const kdbxDB = window.utools.dbStorage.getItem('kdbx');
  if (kdbxDB) {
    password = password ?? decryptValue(kdbxDB.authKV, kdbxDB.password)
    kdbxKeyPath = kdbxDB.kdbxKeyPath
    kdbxFilePath = kdbxDB.kdbxFilePath
    kdbxFileData = readBuffer(kdbxFilePath!)
    kdbxKeyData = readBuffer(kdbxKeyPath!)
  }

  const kdbx = new keepass();
  const passwordVal = keepass.generatPassword(password!);
  const status = await kdbx.open(
    passwordVal,
    kdbxFileData!,
    kdbxKeyData
  );
  if (!status || !password) return;
  const authKV = getKeyIv(password);
  utools.dbStorage.setItem('kdbx', {
    authKV,
    password: encryptValue(authKV, password!),
    kdbxFilePath,
    kdbxKeyPath
  });

  return kdbx
}

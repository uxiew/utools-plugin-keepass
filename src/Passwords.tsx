import { useState } from 'react';
import Door from './Door';
import Start from './start';
import Home from './Home';
import type { kdbxDB } from '../utools/keepass';
import { useDataStore } from './store';
import { openKdbx } from './utils/keepass';

export default function Passwords() {
  // const { hadKdbx, setHadKdbx } = useStartStore();
  const initState = useDataStore((state) => state.initState);

  const { authKV } = window.utools.dbStorage.getItem('kdbx') ?? {};
  const [hadKdbx, setHadKdbx] = useState(false);

  /**
   * @description 打开过数据库之后，再次进入，需要设置
   * @param {String} passText
   * @param {Function} errorCallback
   */
  const handleVerify = async (
    passText: string = '',
    errorCallback: Function
  ) => {
    const db = await openKdbx(passText);
    if (db) return handleKdbx(db);
    errorCallback();
  };

  const handleOut = () => {
    if (authKV) {
      setHadKdbx(false);
      window.utools.removeSubInput();
    }
  };

  // kdbx 新建时，插入默认数据
  /* handleSetBcryptPass = (passText: string) => {
    const isOk = window.services.setBcryptPass(passText);

    if (!isOk) return;
    // 插入基本数据
    const newGroup = window.utools.db.put({
      _id: 'group/' + Date.now(),
      name: '默认分组',
      parentId: ''
    });

    if (newGroup.ok) {
      const keyiv = window.services.verifyPassword(passText);
      const newAccount = {
        _id: 'account/' + Date.now(),
        title: window.services.encryptValue(keyiv, '默认标题'),
        username: window.services.encryptValue(keyiv, '默认用户名'),
        groupId: newGroup.id,
        createAt: Date.now(),
        sort: 0
      };
      window.utools.db.put(newAccount);
    }
    this.setState({ hadKdbx: true, keyIV: '' });
  }; */

  // 打开密码
  const handleKdbx = (keedb: kdbxDB) => {
    setHadKdbx(true);
    if (keedb.groups.length > 0) {
      initState(keedb.groups);
    }
  };

  function initDB() {
    // 初始化 settings db 设置
  }

  if (!hadKdbx && !authKV) return <Start onEnter={handleKdbx} />;
  if (!hadKdbx && authKV) return <Door onVerify={handleVerify} />;
  return <Home onOut={handleOut} />;
}

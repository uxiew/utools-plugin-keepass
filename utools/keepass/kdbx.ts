import * as kdbxweb from 'kdbxweb';
import { Logger } from './util/logger';
import type { ArrayBufferOrArray, Filter, KeeKdfId, KeeKeyFile } from './types';
import { Group } from './Group';
import { Entry } from './Entry';
import { IconUrlFormat } from './util/icon-url-format';
import type { T_Entry, T_Group } from '../../src/typings/data';

const logger = new Logger('kdbx');

interface State {
  defaultId: T_Group['id'],
  groups: T_Group[],
  g2eMap: Record<string, T_Entry[]>
}

// source from https://github.com/keeweb/keeweb/blob/master/app/scripts/models/file-model.js
export class kdbxDB {
  // 名称
  name = ''
  id = ''
  uuid = ''
  db!: kdbxweb.Kdbx

  // for state
  _state: State = {
    defaultId: '',
    groups: [],
    g2eMap: {}
  }

  entryMap: Record<string, Entry> = {}
  groupMap: Record<string, Group> = {}

  groups: Group[] = []

  keyFileName = ''
  keyFilePath = ''
  chalResp = null
  path = ''
  opts = null
  storage = null
  modified = false
  dirty = false
  active = false
  created = false
  passwordLength = 0
  oldPasswordLength = 0
  oldKeyFileName = ''
  passwordChanged = false
  keyFileChanged = false
  keyChangeForce = -1
  syncing = false
  syncError = null
  syncDate = null
  backup = null
  formatVersion = 0
  defaultUser = ''
  recycleBinEnabled = false

  historyMaxSize = 0
  keyEncryptionRounds = 0
  kdfName = ''
  kdfParameters: any
  fingerprint = null // obsolete

  oldPasswordHash: kdbxweb.ProtectedValue | undefined
  oldKeyFileHash: kdbxweb.ProtectedValue | undefined
  oldKeyChangeDate: Date | undefined
  encryptedPassword = null
  encryptedPasswordDate = null
  supportsTags = true
  supportsColors = true
  supportsIcons = true
  supportsExpiration = true
  defaultGroupHash = ''

  historyMaxItems = 0

  static generatPassword(password: string) {
    return kdbxweb.ProtectedValue.fromString(password)
  }

  constructor() {
  }

  async open(password: kdbxweb.ProtectedValue, fileData: ArrayBuffer, keyFileData?: KeeKeyFile) {
    try {
      const credentials = new kdbxweb.Credentials(password, keyFileData);
      const ts = logger.ts();

      return kdbxweb.Kdbx.load(fileData, credentials)
        .then((db) => {
          this.db = db;

          window.kdbx = this;
          this.readModel();
          // @ts-ignore
          this.setOpenFile({ passwordLength: password ? password.textLength : 0 });
          if (keyFileData) {
            kdbxweb.ByteUtils.zeroBuffer(keyFileData);
          }
          logger.info(
            'Opened file ' +
            this.name +
            '=' +
            logger.ts(ts) +
            ', ' +
            this.kdfArgsToString(this.db.header) +
            ', ' +
            Math.round(fileData.byteLength / 1024) +
            ' kB'
          );
          return 'ok'
        })
        .catch((err) => {
          if (
            err.code === kdbxweb.Consts.ErrorCodes.InvalidKey &&
            password &&
            !password.byteLength
          ) {
            logger.info(
              'Error opening file with empty password, try to open with null password'
            );
          }
          logger.error('Error opening file', err.code, err.message, err);
        });
    } catch (e: any) {
      logger.error('Error opening file', e, e.code, e.message, e);
      return Promise.reject(e)
    }
  }

  kdfArgsToString(header: kdbxweb.KdbxHeader) {
    if (header.kdfParameters) {
      return header.kdfParameters
        .keys()
        .map((key) => {
          const val = header.kdfParameters?.get(key);
          if (val instanceof ArrayBuffer) {
            return undefined;
          }
          return key + '=' + val;
        })
        .filter((p) => p)
        .join('&');
    } else if (header.keyEncryptionRounds) {
      return header.keyEncryptionRounds + ' rounds';
    } else {
      return '?';
    }
  }

  create(name: string, callback: Function) {
    const password = kdbxweb.ProtectedValue.fromString('');
    const credentials = new kdbxweb.Credentials(password);
    this.db = kdbxweb.Kdbx.create(credentials, name);
    this.name = name;
    this.readModel();

    this.active = true
    this.created = true
    this.name = name
    callback();
  }

  // importWithXml(fileXml=string, callback=Function) {
  //     try {
  //         const ts = logger.ts();
  //         const password = kdbxweb.ProtectedValue.fromString('');
  //         const credentials = new kdbxweb.Credentials(password);
  //         kdbxweb.Kdbx.loadXml(fileXml, credentials)
  //             .then((db) => {
  //                 this.db = db;
  //             })
  //             .then(() => {
  //                 this.readModel();
  //                 // this.set({ active=true, created=true });
  //                 logger.info('Imported file ' + this.name + '=' + logger.ts(ts));
  //                 callback();
  //             })
  //             .catch((err) => {
  //                 logger.error('Error importing file', err.code, err.message, err);
  //                 callback(err);
  //             });
  //     } catch (e) {
  //         logger.error('Error importing file', e, e.code, e.message, e);
  //         callback(e);
  //     }
  // }

  // autoOpen(callback: Function) {
  //     const password = kdbxweb.ProtectedValue.fromString('demo');
  //     const credentials = new kdbxweb.Credentials(password);
  //     const demoFile = kdbxweb.ByteUtils.arrayToBuffer(
  //         kdbxweb.ByteUtils.base64ToBytes(demoFileData)
  //     );
  //     kdbxweb.Kdbx.load(demoFile, credentials)
  //         .then((db) => {
  //             this.db = db;
  //         })
  //         .then(() => {
  //             this.name = 'Demo';
  //             this.readModel();
  //             this.setOpenFile({ passwordLength: 4, demo: true });
  //             callback();
  //         });
  // }

  setOpenFile(props: { passwordLength: number }) {
    this.passwordLength = props.passwordLength
    this.active = true
    this.oldKeyFileName = this.keyFileName
    this.oldPasswordLength = props.passwordLength
    this.passwordChanged = false
    this.keyFileChanged = false
    this.oldPasswordHash = this.db.credentials.passwordHash;
    this.oldKeyFileHash = this.db.credentials.keyFileHash;
    this.oldKeyChangeDate = this.db.meta.keyChanged;
  }

  readModel() {
    this.uuid = this.db.getDefaultGroup().uuid.toString()
    this.formatVersion = this.db.header.versionMajor
    this.defaultUser = this.db.meta.defaultUser!
    this.recycleBinEnabled = this.db.meta.recycleBinEnabled!
    this.historyMaxItems = this.db.meta.historyMaxItems!
    this.historyMaxSize = this.db.meta.historyMaxSize!
    this.keyEncryptionRounds = this.db.header.keyEncryptionRounds!
    this.keyChangeForce = this.db.meta.keyChangeForce!
    this.kdfName = this.readKdfName()
    this.kdfParameters = this.readKdfParams()

    const group = this.db.getDefaultGroup()
    // this.db.getDefaultGroup().groups.forEach((group) => {
    let groupModel = this.getGroup(this.subId(group.uuid.id));
    if (groupModel) {
      groupModel.setGroup(group, this);
    } else {
      groupModel = Group.fromGroup(group, this);
    }
    this._state['defaultId'] = groupModel.id;
    this._state['groups'].push(groupModel.geState())
    this.groups.push(groupModel);
    // });
    this.buildObjectMap();
    this.resolveFieldReferences();
  }

  buildObjectMap() {
    const entryMap: Record<string, Entry> = {}
    const groupMap: Record<string, Group> = {}
    const { g2eMap } = this._state
    this.forEachGroup(
      (group) => {
        groupMap[group.id] = group;
        // gMap[group.id] = this.geGroupState(group)
        g2eMap[group.id] = []
        group.forEachOwnEntry(null, (entry) => {
          entryMap[entry.id] = entry;
          g2eMap[group.id].push(entry.geState())
        });
      },
      { includeDisabled: true }
    );

    this.entryMap = entryMap;
    this.groupMap = groupMap;
  }

  forEachGroup(callback: (group: Group) => void | boolean, filter: Filter) {
    this.groups.forEach((group) => {
      if (callback(group) !== false) {
        group.forEachGroup(callback, filter);
      }
    });
  }

  resolveFieldReferences() {
    // Object.keys(this.entryMap).forEach((id) => {
    //     this.entryMap[id].resolveFieldReferences();
    // });
  }

  reload() {
    this.buildObjectMap();
    this.readModel();
    // this.emit('reload', this);
  }

  readKdfName() {
    if (this.db.header.versionMajor === 4 && this.db.header.kdfParameters) {
      const kdfParameters = this.db.header.kdfParameters;
      let uuid = kdfParameters.get('$UUID');
      if (uuid) {
        uuid = kdbxweb.ByteUtils.bytesToBase64(uuid as any);
        switch (uuid) {
          case kdbxweb.Consts.KdfId.Argon2d:
            return 'Argon2d';
          case kdbxweb.Consts.KdfId.Argon2id:
            return 'Argon2id';
          case kdbxweb.Consts.KdfId.Aes:
            return 'Aes';
        }
      }
      return 'Unknown';
    } else {
      return 'Aes';
    }
  }

  readKdfParams() {
    const kdfParameters = this.db.header.kdfParameters;
    if (!kdfParameters) {
      return undefined;
    }
    let uuid = kdfParameters.get('$UUID');
    if (!uuid) {
      return undefined;
    }
    uuid = kdbxweb.ByteUtils.bytesToBase64(uuid as ArrayBuffer);
    switch (uuid) {
      case kdbxweb.Consts.KdfId.Argon2d:
      case kdbxweb.Consts.KdfId.Argon2id:
        return {
          parallelism: kdfParameters.get('P')?.valueOf(),
          iterations: kdfParameters.get('I')?.valueOf(),
          memory: kdfParameters.get('M')?.valueOf()
        };
      case kdbxweb.Consts.KdfId.Aes:
        return {
          rounds: kdfParameters.get('R')?.valueOf()
        };
      default:
        return undefined;
    }
  }

  subId(id?: string) {
    return id || '';
  }

  // mergeOrUpdate(fileData, remoteKey, callback) {
  //     let credentials;
  //     let credentialsPromise = Promise.resolve();
  //     if (remoteKey) {
  //         credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(''));
  //         credentialsPromise = credentials.ready.then(() => {
  //             const promises = [];
  //             if (remoteKey.password) {
  //                 promises.push(credentials.setPassword(remoteKey.password));
  //             } else {
  //                 credentials.passwordHash = this.db.credentials.passwordHash;
  //             }
  //             if (remoteKey.keyFileName) {
  //                 if (remoteKey.keyFileData) {
  //                     promises.push(credentials.setKeyFile(remoteKey.keyFileData));
  //                 } else {
  //                     credentials.keyFileHash = this.db.credentials.keyFileHash;
  //                 }
  //             }
  //             return Promise.all(promises);
  //         });
  //     } else {
  //         credentials = this.db.credentials;
  //     }
  //     credentialsPromise.then(() => {
  //         kdbxweb.Kdbx.load(fileData, credentials)
  //             .then((remoteDb) => {
  //                 if (this.modified) {
  //                     try {
  //                         if (remoteKey && remoteDb.meta.keyChanged > this.db.meta.keyChanged) {
  //                             this.db.credentials = remoteDb.credentials;
  //                             this.keyFileName = remoteKey.keyFileName || '';
  //                             if (remoteKey.password) {
  //                                 this.passwordLength = remoteKey.password.textLength;
  //                             }
  //                         }
  //                         this.db.merge(remoteDb);
  //                     } catch (e) {
  //                         logger.error('File merge error', e);
  //                         return callback(e);
  //                     }
  //                 } else {
  //                     this.db = remoteDb;
  //                 }
  //                 this.dirty = true;
  //                 this.reload();
  //                 callback();
  //             })
  //             .catch((err) => {
  //                 logger.error('Error opening file to merge', err.code, err.message, err);
  //                 callback(err);
  //             });
  //     });
  // }

  getLocalEditState() {
    return this.db.getLocalEditState();
  }

  setLocalEditState(editState: kdbxweb.KdbxEditState) {
    this.db.setLocalEditState(editState);
  }

  // close() {
  //     this.set({
  //         keyFileName='',
  //         passwordLength=0,
  //         modified=false,
  //         dirty=false,
  //         active=false,
  //         created=false,
  //         groups=null,
  //         passwordChanged=false,
  //         keyFileChanged=false,
  //         syncing=false
  //     });
  //     if (this.chalResp && !AppSettingsModel.yubiKeyRememberChalResp) {
  //         ChalRespCalculator.clearCache(this.chalResp);
  //     }
  // }

  getEntry(id: string) {
    return this.entryMap[id];
  }

  getGroup(id: string) {
    return this.groupMap[id];
  }

  // forEachEntry(filter: { trash: boolean, group: '', subGroups: boolean }, callback) {
  //     let top = this;
  //     if (filter.trash) {
  //         top = this.getGroup(
  //             this.db.meta.recycleBinUuid ? this.subId(this.db.meta.recycleBinUuid.id) : ''
  //         )
  //     } else if (filter.group) {
  //         top = this.getGroup(filter.group);
  //     }
  //     if (top) {
  //         if (top.forEachOwnEntry) {
  //             top.forEachOwnEntry(filter, callback);
  //         }
  //         if (!filter.group || filter.subGroups) {
  //             top.forEachGroup((group) => {
  //                 group.forEachOwnEntry(filter, callback);
  //             }, filter);
  //         }
  //     }
  // }

  getTrashGroup() {
    return this.db.meta.recycleBinEnabled
      ? this.getGroup(this.subId(this.db.meta.recycleBinUuid?.id))
      : null;
  }

  getEntryTemplatesGroup() {
    return this.db.meta.entryTemplatesGroup
      ? this.getGroup(this.subId(this.db.meta.entryTemplatesGroup?.id))
      : null;
  }

  // createEntryTemplatesGroup() {
  //     const rootGroup = this.groups[0];
  //     const templatesGroup = GroupModel.newGroup(rootGroup, this);
  //     templatesGroup.setName("模版");
  //     this.db.meta.entryTemplatesGroup = templatesGroup.group.uuid;
  //     this.reload();
  //     return templatesGroup;
  // }

  setModified() {
    this.modified = true
    this.dirty = true
  }

  async saveDB() {
    this.db.cleanup({
      historyRules: true,
      customIcons: true,
      binaries: true
    });
    return this.db
      .save()
      .catch((err) => {
        logger.error('Error saving file', this.name, err);
      });
  }

  getXml() {
    return this.db.saveXml(true)
  }

  getHtml() {
    // return KdbxToHtml.convert(this.db, {
    //     name: this.name
    // })
  }

  // forEachEntryTemplate(callback) {
  //     if (!this.db.meta.entryTemplatesGroup) {
  //         return;
  //     }
  //     const group = this.getGroup(this.subId(this.db.meta.entryTemplatesGroup.id));
  //     if (!group) {
  //         return;
  //     }
  //     group.forEachOwnEntry({}, callback);
  // }

  setSyncProgress() {
    this.syncing = true
  }

  // setSyncComplete(path, storage, error) {
  //     if (!error) {
  //         this.db.removeLocalEditState();
  //     }
  //     const modified = this.modified && !!error;
  //     this.set({
  //         created=false,
  //         path=path || this.path,
  //         storage=storage || this.storage,
  //         modified,
  //         dirty=error ? this.dirty =false,
  //         syncing=false,
  //         syncError=error
  //     });

  //     if (!error && this.passwordChanged && this.encryptedPassword) {
  //         this.set({
  //             encryptedPassword=null,
  //             encryptedPasswordDate=null
  //         });
  //     }

  //     if (!this.open) {
  //         return;
  //     }
  //     this.setOpenFile({ passwordLength=this.passwordLength });
  //     this.forEachEntry({ includeDisabled=true }, (entry) => entry.setSaved());
  // }



  // /* setChallengeResponse(chalResp) {
  //     if (this.chalResp && !AppSettingsModel.yubiKeyRememberChalResp) {
  //         ChalRespCalculator.clearCache(this.chalResp);
  //     }
  //     this.db.credentials.setChallengeResponse(ChalRespCalculator.build(chalResp));
  //     this.db.meta.keyChanged = new Date();
  //     this.chalResp = chalResp;
  //     this.setModified();
  // } */

  setKeyChange(force: boolean, days: number) {
    if (isNaN(days) || !days || days < 0) {
      days = -1;
    }
    const prop = force ? 'keyChangeForce' : 'keyChangeRec';
    this.db.meta[prop] = days;
    // @ts-ignore
    this[prop] = days;
    this.setModified();
  }

  setName(name: string) {
    this.db.meta.name = name;
    this.db.meta.nameChanged = new Date();
    this.name = name;
    this.groups[0].setName(name);
    this.setModified();
    this.reload();
  }

  setDefaultUser(defaultUser: string) {
    this.db.meta.defaultUser = defaultUser;
    this.db.meta.defaultUserChanged = new Date();
    this.defaultUser = defaultUser;
    this.setModified();
  }

  setRecycleBinEnabled(enabled: boolean) {
    enabled = !!enabled;
    this.db.meta.recycleBinEnabled = enabled;
    if (enabled) {
      this.db.createRecycleBin();
    }
    this.recycleBinEnabled = enabled;
    this.setModified();
  }

  setHistoryMaxItems(count: number) {
    this.db.meta.historyMaxItems = count;
    this.historyMaxItems = count;
    this.setModified();
  }

  setHistoryMaxSize(size: number) {
    this.db.meta.historyMaxSize = size;
    this.historyMaxSize = size;
    this.setModified();
  }

  setKeyEncryptionRounds(rounds: number) {
    this.db.header.keyEncryptionRounds = rounds;
    this.keyEncryptionRounds = rounds;
    this.setModified();
  }

  setKdfParameter(field: string, value: number) {
    const ValueType = kdbxweb.VarDictionary.ValueType;
    switch (field) {
      case 'memory':
        this.db.header.kdfParameters?.set('M', ValueType.UInt64, kdbxweb.Int64.from(value));
        break;
      case 'iterations':
        this.db.header.kdfParameters?.set('I', ValueType.UInt64, kdbxweb.Int64.from(value));
        break;
      case 'parallelism':
        this.db.header.kdfParameters?.set('P', ValueType.UInt32, value);
        break;
      case 'rounds':
        this.db.header.kdfParameters?.set('R', ValueType.UInt32, value);
        break;
      default:
        return;
    }
    this.kdfParameters = this.readKdfParams();
    this.setModified();
  }

  /**@description 清空回收站 */
  emptyTrash() {
    const trashGroup = this.getTrashGroup();
    if (trashGroup) {
      let modified = false;
      trashGroup
        .getOwnSubGroups()
        .slice()
        .forEach((group: kdbxweb.KdbxGroup) => {
          this.db.move(group, null);
          modified = true;
        });
      trashGroup._group.entries.slice().forEach((entry: kdbxweb.KdbxEntry) => {
        this.db.move(entry, null);
        modified = true;
      });
      trashGroup.items.length = 0;
      trashGroup.entries.length = 0;
      if (modified) this.setModified();
    }
  }

  getCustomIcons() {
    const customIcons: Record<string, string> = {};
    for (const [id, icon] of this.db.meta.customIcons) {
      customIcons[id] = IconUrlFormat.toDataUrl(icon.data) as string;
    }
    return customIcons;
  }

  addCustomIcon(iconData: string) {
    const uuid = kdbxweb.KdbxUuid.random();
    this.db.meta.customIcons.set(uuid.id, {
      data: kdbxweb.ByteUtils.arrayToBuffer(kdbxweb.ByteUtils.base64ToBytes(iconData)),
      lastModified: new Date()
    });
    return uuid.toString();
  }

  getKeyFileHash() {
    const hash = this.db.credentials.keyFileHash;
    return hash ? kdbxweb.ByteUtils.bytesToBase64(hash.getBinary()) : null;
  }


  // renameTag(from, to) {
  //     this.forEachEntry({}, (entry) => entry.renameTag(from, to));
  // }


  // forEachEntry(filter: Filter, callback: () => void | boolean) {
  //     let top = this;
  //     if (filter!.trash) {
  //         top = this.getGroup(
  //             this.db.meta.recycleBinUuid ? this.subId(this.db.meta.recycleBinUuid.id) : null
  //         );
  //     } else if (filter.group) {
  //         top = this.getGroup(filter.group);
  //     }
  //     if (top) {
  //         if (top.forEachOwnEntry) {
  //             top.forEachOwnEntry(filter, callback);
  //         }
  //         if (!filter.group || filter.subGroups) {
  //             top.forEachGroup((group) => {
  //                 group.forEachOwnEntry(filter, callback);
  //             }, filter);
  //         }
  //     }
  // }


  setFormatVersion(version: 3 | 4) {
    this.db.setVersion(version);
    this.setModified();
    this.readModel();
  }



  setPassword(password: kdbxweb.ProtectedValue) {
    this.db.credentials.setPassword(password);
    this.db.meta.keyChanged = new Date();
    this.passwordLength = password.textLength
    this.passwordChanged = true
    this.setModified();
  }

  resetPassword() {
    this.db.credentials.passwordHash = this.oldPasswordHash;
    if (this.db.credentials.keyFileHash === this.oldKeyFileHash) {
      this.db.meta.keyChanged = this.oldKeyChangeDate;
    }

    this.passwordLength = this.oldPasswordLength
    this.passwordChanged = false
  }

  setKeyFile(keyFile: KeeKeyFile, keyFileName: string) {
    this.db.credentials.setKeyFile(keyFile);
    this.db.meta.keyChanged = new Date();
    this.keyFileName = keyFileName
    this.keyFileChanged = true
    this.setModified();
  }

  async generateAndSetKeyFile() {
    return kdbxweb.Credentials.createRandomKeyFile().then((keyFile) => {
      const keyFileName = 'Generated';
      this.setKeyFile(keyFile, keyFileName);
      return keyFile;
    });
  }

  resetKeyFile() {
    this.db.credentials.keyFileHash = this.oldKeyFileHash;
    if (this.db.credentials.passwordHash === this.oldPasswordHash) {
      this.db.meta.keyChanged = this.oldKeyChangeDate;
    }

    this.keyFileName = this.oldKeyFileName
    this.keyFileChanged = false
  }

  removeKeyFile() {
    this.db.credentials.keyFileHash = undefined;
    const changed = !!this.oldKeyFileHash;
    if (!changed && this.db.credentials.passwordHash === this.oldPasswordHash) {
      this.db.meta.keyChanged = this.oldKeyChangeDate;
    }
    this.keyFileName = '';
    this.keyFilePath = ''
    this.keyFileChanged = changed
    // Events.emit('unset-keyfile', this.id);
    this.setModified();
  }

  isKeyChangePending(force: boolean) {
    if (!this.db.meta.keyChanged) {
      return false;
    }
    const expiryDays = force ? this.db.meta.keyChangeForce : this.db.meta.keyChangeRec;
    if (!expiryDays || expiryDays < 0 || isNaN(expiryDays)) {
      return false;
    }
    const daysDiff = (Date.now() - this.db.meta.keyChanged) / 1000 / 3600 / 24;
    return daysDiff > expiryDays;
  }


  setKdf(kdfName: KeeKdfId) {
    const kdfParameters = this.db.header.kdfParameters;
    if (!kdfParameters) {
      throw new Error('Cannot set KDF on this version');
    }
    switch (kdfName) {
      case 'Aes':
        this.db.setKdf(kdbxweb.Consts.KdfId.Aes);
        break;
      case 'Argon2d':
        this.db.setKdf(kdbxweb.Consts.KdfId.Argon2d);
        break;
      case 'Argon2id':
        this.db.setKdf(kdbxweb.Consts.KdfId.Argon2id);
        break;
      default:
        throw new Error('Bad KDF name');
    }
    this.setModified();
    this.readModel();
  }

  static createKeyFileWithHash(hash: string) {
    const hashData = kdbxweb.ByteUtils.base64ToBytes(hash);
    const hexHash = kdbxweb.ByteUtils.bytesToHex(hashData);
    return kdbxweb.ByteUtils.stringToBytes(hexHash);
  }
}

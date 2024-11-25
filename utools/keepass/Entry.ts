import * as kdbxweb from 'kdbxweb';
import type { ProtectedValue, KdbxBinaryWithHash, KdbxBinary, KdbxBinaryRefWithValue } from 'kdbxweb';
import { DefaultSettings } from "./const/settings";
import { Group } from "./Group";
import type { kdbxDB } from "./kdbx";
import type { KdbxEntry, KdbxGroup } from "kdbxweb";
import { IconUrlFormat } from './util/icon-url-format';
import { IconMap } from './const/iconMap';
import { BuiltInFields } from './const/entryFields';
import { omit } from './util/fn';
import type { T_Entry } from '../../src/typings/data';
import AttachmentModel from './Attachment';

const UrlRegex = /^https?:\/\//i;
const FieldRefRegex = /^\{REF:([TNPAU])@I:(\w{32})}$/;
const FieldRefFields = ['title', 'password', 'user', 'url', 'notes'];
const FieldRefIds = { T: 'Title', U: 'UserName', P: 'Password', A: 'URL', N: 'Notes' };
const ExtraUrlFieldName = 'KP2A_URL';

export type BinariesType = Uint8Array | KdbxBinary | KdbxBinaryWithHash | KdbxBinaryRefWithValue

export class Entry {

  _entry!: KdbxEntry
  group!: Group
  file!: kdbxDB

  displayUrl: string = ''
  title: string = ''
  notes: string = ''
  url: string = ''
  username: string = ''
  password!: ProtectedValue

  attachments: any[] = []
  tags: string[] = []

  icon: string | null = null;
  customIcon: string | null = null;
  customIconId: string | null = null;

  color: string = ''
  fields: Record<string, string> = {}

  searchTags: string[] = []
  searchText: string = ''

  unsaved: boolean = false
  isJustCreated: boolean = false
  canBeDeleted: boolean = false

  // get auto info together
  get autoType() {
    const { _entry } = this
    return {
      enabled: _entry.autoType.enabled,
      obfuscation: _entry.autoType.obfuscation ===
        kdbxweb.Consts.AutoTypeObfuscationOptions.UseClipboard,
      sequence: _entry.autoType.defaultSequence,
      windows: _entry.autoType.items.map(this._convertAutoTypeItem)
    }
  }

  get id() {
    return this.file.subId(this._entry.uuid.id)
  }
  get uuid() {
    return this._entry.uuid.id
  }
  get fileName() {
    return this.file.name;
  }
  get groupName() {
    return this.group.title;
  }

  get iconId() {
    return this._entry.icon;
  }
  get created() {
    return this._entry.times.creationTime!;
  }

  get updated() {
    return this._entry.times.lastModTime || '';
  }
  get expires() {
    return this._entry.times.expires ? this._entry.times.expiryTime : undefined;
  }
  get expired() {
    return this._entry.times.expires && (this._entry.times.expiryTime && this._entry.times.expiryTime <= new Date())
  }
  get historyLength() {
    return this._entry.history.length;
  }
  get titleUserLower() {
    return `${this.title}:${this.username}`.toLowerCase();
  }

  /*
  {
  "groupId": "group/1678450079439",
  "createAt": 1678450166283,
  "sort": 0,
  "title": "0a28e60db36b57d519ddd7a76281e8dd",
  "username": "a758b97b1b23c5985405a5558eff0712",
  "password": "d988ac065f9e3aac0555f74e747f4ce2",
  "link": "e8d2e387e37983ad145d4a6144c1aa27",
  "remark": "de4f001fffd7cf749f38aebd655535fd54ffa3706112cc123ed7ba3c9e5a04a7",
  "_id": "account/1678450166283",
  "_rev": "18-ad3fc20412bbd66ae4d6a8898dcf9f52"
  }
  */
  setEntry(entry: KdbxEntry, group: Group, file: kdbxDB) {
    this._entry = entry;
    this.group = group;
    this.file = file;
    if (this.id === entry.uuid.id) {
      this._checkUpdatedEntry();
    }
    this._fillByEntry();
  }

  geState(): T_Entry {
    const e = this;
    return ({
      id: e.id,
      groupId: e.group.id,
      tags: e.tags,
      created: e.created,
      iconId: e.iconId,
      icon: e.icon,
      customIcon: e.customIcon,
      customIconId: e.customIconId,
      fields: {
        title: e.title,
        username: e.username,
        password: e.password.getText(),
        notes: e.notes,
        url: e.url,
      },
      extraFields: e.fields,
      attachments: e.attachments
    })
  }


  private _fillByEntry() {
    const entry = this._entry;

    this.title = this._getFieldString('Title');
    this.password = this._getPassword();
    this.notes = this._getFieldString('Notes');
    this.url = this._getFieldString('URL');
    this.displayUrl = this._getDisplayUrl(this._getFieldString('URL'));
    this.username = this._getFieldString('UserName');

    this.icon = this._iconFromId(entry.icon);
    this.tags = entry.tags;
    // this.color = this._colorToModel(entry.bgColor) || this._colorToModel(entry.fgColor);
    this.fields = this._fieldsToModel();
    this.attachments = this._attachmentsToModel(entry.binaries);

    this._buildCustomIcon();
    this._buildSearchText();
    this._buildSearchTags();
    // this._buildSearchColor();
    // if (this.hasFieldRefs) {
    //     this.resolveFieldReferences();
    // }
  }

  matches(filter: any) {
    // return this._search.matches(filter);
    return true;
  }

  _getPassword() {
    const password = this._entry.fields.get('Password') || kdbxweb.ProtectedValue.fromString('');
    if (typeof password === 'string') {
      return kdbxweb.ProtectedValue.fromString(password);
    }
    return password;
  }

  _getFieldString(field: string) {
    const val = this._entry.fields.get(field);
    if (!val) {
      return '';
    }
    if (typeof val !== 'string') {
      return val.getText();
    }
    return val.toString();
  }

  _checkUpdatedEntry() {
    if (this.isJustCreated) {
      this.isJustCreated = false;
    }
    if (this.canBeDeleted) {
      this.canBeDeleted = false;
    }
    if (this.unsaved && +this.updated !== +(this._entry.times.lastModTime || '')) {
      this.unsaved = false;
    }
  }

  _buildSearchText() {
    let text = '';
    for (const value of this._entry.fields.values()) {
      if (typeof value === 'string') {
        text += value.toLowerCase() + '\n';
      }
    }
    this._entry.tags.forEach((tag) => {
      text += tag.toLowerCase() + '\n';
    });
    this.attachments.forEach((att) => {
      text += att.title.toLowerCase() + '\n';
    });
    this.searchText = text;
  }

  _buildCustomIcon() {
    if (this._entry.customIcon) {
      this.customIcon = IconUrlFormat.toDataUrl(
        this.file.db.meta.customIcons.get(this._entry.customIcon.id)?.data
      );
      this.customIconId = this._entry.customIcon.toString();
    }
  }

  _buildSearchTags() {
    this.searchTags = this._entry.tags.map((tag) => tag.toLowerCase());
  }

  /*   _buildSearchColor() {
     this.searchColor = this.color;
  } */

  _convertAutoTypeItem(item: kdbxweb.KdbxAutoTypeItem) {
    return { window: item.window, sequence: item.keystrokeSequence };
  }

  _iconFromId(id: number = -1) {
    return IconMap[id];
  }

  _getDisplayUrl(url: string) {
    if (!url) {
      return '';
    }
    return url.replace(UrlRegex, '');
  }

  // _colorToModel(color?: string) {
  //     return color ? Color.getNearest(color) : null;
  // }

  _fieldsToModel() {
    return omit(this.getAllFields(), BuiltInFields);
  }

  _attachmentsToModel(binaries: Map<string, BinariesType>) {
    const att = [];
    for (let [title, data] of binaries) {
      if ((data as KdbxBinaryRefWithValue).ref) {
        data = (data as KdbxBinaryRefWithValue).value;
      }
      if (data) {
        att.push(AttachmentModel.fromAttachment({ data, title }));
      }
    }
    return att;
  }


  _entryModified() {
    if (!this.unsaved) {
      this.unsaved = true;
      if (this.file.historyMaxItems !== 0) {
        this._entry.pushHistory();
      }
      this.file.setModified();
    }
    if (this.isJustCreated) {
      this.isJustCreated = false;
      this.file.reload();
    }
    this._entry.times.update();
  }

  setSaved() {
    if (this.unsaved) {
      this.unsaved = false;
    }
    if (this.canBeDeleted) {
      this.canBeDeleted = false;
    }
  }


  /* matches(filter) {
      return this._search.matches(filter);
  } */


  getHistoryEntriesForSearch() {
    return this._entry.history;
  }


  getAllFields() {
    const fields: Record<string, kdbxweb.KdbxEntryField> = {};
    for (const [key, value] of this._entry.fields) {
      fields[key] = value;
    }
    return fields;
  }

  setField(field: string, val: kdbxweb.KdbxEntryField, allowEmpty?: boolean) {
    const hasValue = val && (typeof val === 'string' || (val.byteLength));
    if (hasValue || allowEmpty || BuiltInFields.indexOf(field) >= 0) {
      this._entryModified();
      val = this.sanitizeFieldValue(val);
      this._entry.fields.set(field, val);
    } else if (this._entry.fields.has(field)) {
      this._entryModified();
      this._entry.fields.delete(field);
    }
    this._fillByEntry();
  }


  sanitizeFieldValue(val: kdbxweb.KdbxEntryField) {
    if (typeof val === 'string') {
      // https://github.com/keeweb/keeweb/issues/910
      // eslint-disable-next-line no-control-regex
      val = val.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\uFFF0-\uFFFF]/g, '');
    }
    return val;
  }

  hasField(field: string) {
    return this._entry.fields.has(field);
  }

  addAttachment(name: string, data: kdbxweb.KdbxBinary) {
    this._entryModified();
    return this.file.db.createBinary(data).then((binaryRef) => {
      this._entry.binaries.set(name, binaryRef);
      this._fillByEntry();
    });
  }

  removeAttachment(name: string) {
    this._entryModified();
    this._entry.binaries.delete(name);
    this._fillByEntry();
  }

  getHistory() {
    const history = this._entry.history.map((rec) => {
      return Entry.fromEntry(rec, this.group, this.file);
    });
    history.push(this);
    history.sort((x, y) => x.updated - y.updated);
    return history;
  }

  deleteHistory(historyEntry: kdbxweb.KdbxEntr) {
    const ix = this._entry.history.indexOf(historyEntry);
    if (ix >= 0) {
      this._entry.removeHistory(ix);
      this.file.setModified();
    }
    this._fillByEntry();
  }

  revertToHistoryState(historyEntry: kdbxweb.KdbxEntry) {
    const { _entry } = this
    const ix = _entry.history.indexOf(historyEntry);
    if (ix < 0) {
      return;
    }
    _entry.pushHistory();
    this.unsaved = true;
    this.file.setModified();
    _entry.fields = new Map();
    _entry.binaries = new Map();
    _entry.copyFrom(historyEntry);
    this._entryModified();
    this._fillByEntry();
  }

  discardUnsaved() {
    const { _entry } = this
    if (this.unsaved && _entry.history.length) {
      this.unsaved = false;
      const historyEntry = _entry.history[_entry.history.length - 1];
      _entry.removeHistory(_entry.history.length - 1);
      _entry.fields = new Map();
      _entry.binaries = new Map();
      _entry.copyFrom(historyEntry);
      this._fillByEntry();
    }
  }

  moveToTrash() {
    this.file.setModified();
    if (this.isJustCreated) {
      this.isJustCreated = false;
    }
    this.file.db.remove(this._entry);
    this.file.reload();
  }

  deleteFromTrash() {
    this.file.setModified();
    this.file.db.move(this._entry, null);
    this.file.reload();
  }

  removeWithoutHistory() {
    if (this.canBeDeleted) {
      const ix = this.group._group.entries.indexOf(this._entry);
      if (ix >= 0) {
        this.group._group.entries.splice(ix, 1);
      }
      this.file.reload();
    }
  }

  detach() {
    this.file.setModified();
    this.file.db.move(this._entry, null);
    this.file.reload();
    return this._entry;
  }

  moveToFile(file: kdbxDB) {
    if (this.canBeDeleted) {
      this.removeWithoutHistory();
      this.group = file.groups[0];
      this.file = file;
      this._fillByEntry();
      this._entry.times.update();
      this.group._group.entries.push(this._entry);
      this.group.addEntry(this);
      this.isJustCreated = true;
      this.unsaved = true;
      this.file.setModified();
    }
  }

  static fromEntry(entry: KdbxEntry, group: Group, file: kdbxDB) {
    const entryModel = new Entry();
    entryModel.setEntry(entry, group, file);
    return entryModel;
  }

  static newEntry(group: Group, file: kdbxDB, opts?: any) {
    const model = new Entry();
    const entry = file.db.createEntry(group._group);
    if (DefaultSettings.useGroupIconForEntries && group.icon && group.iconId) {
      entry.icon = group.iconId;
    }
    if (opts && opts.tag) {
      entry.tags = [opts.tag];
    }
    model.setEntry(entry, group, file);
    model._entry.times.update();
    model.unsaved = true;
    model.isJustCreated = true;
    model.canBeDeleted = true;
    group.addEntry(model);
    file.setModified();
    return model;
  }

  static newEntryWithFields(group: Group, fields: Record<string, string>) {
    const entry = Entry.newEntry(group, group.file);
    for (const [field, value] of Object.entries(fields)) {
      entry.setField(field, value);
    }
    return entry;
  }
}

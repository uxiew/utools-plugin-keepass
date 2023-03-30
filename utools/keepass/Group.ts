import { KdbxGroup, KdbxUuid, Consts } from "kdbxweb";
import { IconMap } from "./const/iconMap";
import { Entry } from "./Entry";
import type { kdbxDB } from "./kdbx";
import type { Filter } from "./types";


const KdbxIcons = Consts.Icons;

const DefaultAutoTypeSequence = '{USERNAME}{TAB}{PASSWORD}{ENTER}';

export class Group {

    _group!: KdbxGroup
    parentGroup: Group | undefined
    id: string = ''
    title: string = ''
    file!: kdbxDB

    entries: Entry[] = []

    // icon 
    icon: string | undefined
    iconId: number = 0
    // 子group
    items: Group[] = []

    filterValue: string = ''
    enableSearching: boolean | null | undefined
    enableAutoType: boolean | null | undefined
    uuid: string = ''
    expanded: boolean = false
    visible: boolean = false


    autoTypeSeq: string | undefined = ''
    top: boolean = false
    drag: boolean = false
    collapsible: boolean = false


    isJustCreated: boolean = false

    setGroup(group: KdbxGroup, file: kdbxDB, parentGroup?: Group) {
        const isRecycleBin = group.uuid.equals(file.db.meta.recycleBinUuid);
        this.id = file.subId(group.uuid.id);
        this.uuid = group.uuid.id
        this.expanded = group.expanded!
        this.visible = !isRecycleBin
        this.entries = []
        this.filterValue = this.id
        this.enableSearching = group.enableSearching
        this.enableAutoType = group.enableAutoType
        this.autoTypeSeq = group.defaultAutoTypeSeq!;
        this.top = !parentGroup;
        this.drag = !!parentGroup;
        this.collapsible = !!parentGroup;

        this._group = group;
        this.parentGroup = parentGroup;
        this.file = file;
        this._fillByGroup();
        const items = this.items;
        const entries = this.entries;

        const itemsArray = group.groups.map((subGroup) => {
            let g = file.getGroup(file.subId(subGroup.uuid.id));
            if (g) {
                g.setGroup(subGroup, file, this);
            } else {
                g = Group.fromGroup(subGroup, file, this);
            }
            return g;
        });

        items.push(...itemsArray);

        const entriesArray = group.entries.map((entry) => {
            let e = file.getEntry(file.subId(entry.uuid.id));
            if (e) {
                e.setEntry(entry, this, file);
            } else {
                e = Entry.fromEntry(entry, this, file);
            }
            return e;
        });
        entries.push(...entriesArray);
    }


    _iconFromId(id: number = -1) {
        if (id === KdbxIcons.Folder || id === KdbxIcons.FolderOpen) {
            return undefined;
        }
        return IconMap[id];
    }

    _groupModified() {
        if (this.isJustCreated) {
            this.isJustCreated = false;
        }
        this.file.setModified();
        this._group.times.update();
    }

    _fillByGroup() {
        this.title = this._group.name || this.file.name
        this.iconId = this._group.icon!
        this.icon = this._iconFromId(this._group.icon)
        //             customIcon: this._buildCustomIcon(),
        //             customIconId: this.group.customIcon ? this.group.customIcon.toString() : null,
        //             expanded: this.group.expanded !== false
    }


    forEachGroup(callback: (g: Group) => void | boolean, filter: Filter) {
        let result = true;
        this.items.forEach((group) => {
            if (group.matches(filter)) {
                result =
                    callback(group) !== false && group.forEachGroup(callback, filter) !== false;
            }
        });
        return result;
    }

    forEachOwnEntry(filter: Filter, callback: (e: Entry, g: Group) => void) {
        this.entries.forEach((entry) => {
            if (entry.matches(filter)) {
                callback(entry, this);
            }
        });
    }

    matches(filter: Filter) {
        return (
            ((filter && filter.includeDisabled) ||
                (this._group.enableSearching !== false &&
                    !this._group.uuid.equals(this.file.db.meta.entryTemplatesGroup))) &&
            (!filter || !filter.autoType || this._group.enableAutoType !== false)
        );
    }

    getOwnSubGroups() {
        return this._group.groups;
    }

    addEntry(entry: Entry) {
        this.entries.push(entry);
    }

    addGroup(group: Group) {
        this.items.push(group);
    }

    setName(name: string) {
        this._groupModified();
        this._group.name = name;
        this._fillByGroup();
    }

    setIcon(iconId: number) {
        this._groupModified();
        this._group.icon = iconId;
        this._group.customIcon = undefined;
        this._fillByGroup();
    }

    setCustomIcon(customIconId: string) {
        this._groupModified();
        this._group.customIcon = new KdbxUuid(customIconId);
        this._fillByGroup();
    }

    setExpanded(expanded: boolean) {
        // this._groupModified(); // it's not good to mark the file as modified when a group is collapsed
        this._group.expanded = expanded;
        this.expanded = expanded;
    }

    setEnableSearching(enabled: boolean | null) {
        this._groupModified();
        let parentEnableSearching = true;
        let parentGroup = this.parentGroup;
        while (parentGroup) {
            if (typeof parentGroup.enableSearching === 'boolean') {
                parentEnableSearching = parentGroup.enableSearching;
                break;
            }
            parentGroup = parentGroup.parentGroup;
        }
        if (enabled === parentEnableSearching) {
            enabled = null;
        }
        this._group.enableSearching = enabled;
        this.enableSearching = this._group.enableSearching;
    }

    getEffectiveEnableSearching() {
        let grp: Group | undefined = this;
        while (grp) {
            if (typeof grp.enableSearching === 'boolean') {
                return grp.enableSearching;
            }
            grp = grp.parentGroup;
        }
        return true;
    }

    setEnableAutoType(enabled: boolean | null) {
        this._groupModified();
        let parentEnableAutoType = true;
        let parentGroup = this.parentGroup;
        while (parentGroup) {
            if (typeof parentGroup.enableAutoType === 'boolean') {
                parentEnableAutoType = parentGroup.enableAutoType;
                break;
            }
            parentGroup = parentGroup.parentGroup;
        }
        if (enabled === parentEnableAutoType) {
            enabled = null;
        }
        this._group.enableAutoType = enabled;
        this.enableAutoType = this._group.enableAutoType;
    }

    setAutoTypeSeq(seq: string) {
        this._groupModified();
        this._group.defaultAutoTypeSeq = seq || undefined;
        this.autoTypeSeq = this._group.defaultAutoTypeSeq;
    }

    getEffectiveEnableAutoType() {
        let grp: Group | undefined = this;
        while (grp) {
            if (typeof grp.enableAutoType === 'boolean') return grp.enableAutoType;
            grp = grp.parentGroup
        }
        return true;
    }


    getEffectiveAutoTypeSeq() {
        let grp: Group | undefined = this;
        while (grp) {
            if (grp.autoTypeSeq) return grp.autoTypeSeq;
            grp = grp.parentGroup;
        }
        return DefaultAutoTypeSequence;
    }


    getParentEffectiveAutoTypeSeq() {
        return this.parentGroup
            ? this.parentGroup.getEffectiveAutoTypeSeq()
            : DefaultAutoTypeSequence;
    }

    /**@description 是否是空Entry模版组 */
    isEntryTemplatesGroup() {
        return this._group.uuid.equals(this.file.db.meta.entryTemplatesGroup);
    }

    moveToTrash() {
        this.file.setModified();
        this.file.db.remove(this._group);
        if (this._group.uuid.equals(this.file.db.meta.entryTemplatesGroup)) {
            this.file.db.meta.entryTemplatesGroup = undefined;
        }
        this.file.reload();
    }

    deleteFromTrash() {
        this.file.db.move(this._group, null);
        this.file.reload();
    }

    removeWithoutHistory() {
        const ix = this.parentGroup?._group.groups.indexOf(this._group) ?? -1;
        if (ix >= 0) {
            this.parentGroup?._group.groups.splice(ix, 1);
        }
        this.file.reload();
    }

    static fromGroup(group: KdbxGroup, file: kdbxDB, parentGroup?: Group) {
        const model = new Group();
        model.setGroup(group, file, parentGroup);
        return model;
    }
}
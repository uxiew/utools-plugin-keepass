import * as kdbxweb from 'kdbxweb';
import type { Kdbx, KdbxGroup, KdbxEntry } from 'kdbxweb';
import { DateFormat } from '../util/date-format';
import { StringFormat } from '../util/string-format';


interface convertOptions {
    name: string
}

const FieldMapping = [
    { name: 'UserName', locStr: '用户名' },
    { name: 'Password', locStr: '密码', protect: true },
    { name: 'URL', locStr: '网站' },
    { name: 'Notes', locStr: '备注' }
];

const KnownFields: Record<string, boolean> = { 'Title': true };

function walkEntry(db: Kdbx, entry: KdbxEntry, parents: KdbxGroup[]) {
    const path = parents.map((group) => group.name).join(' / ');
    const fields = [];
    for (const field of FieldMapping) {
        const value = entryField(entry, field.name);
        if (value) {
            fields.push({
                title: field.locStr,
                value,
                protect: field.protect
            });
        }
    }
    for (const [fieldName, fieldValue] of entry.fields) {
        if (!KnownFields[fieldName]) {
            const value = entryField(entry, fieldName);
            if (value) {
                fields.push({
                    title: fieldName,
                    value,
                    protect: fieldValue.isProtected
                });
            }
        }
    }
    const title = entryField(entry, 'Title');
    let expires;
    if (entry.times.expires && entry.times.expiryTime) {
        expires = DateFormat.dtStr(entry.times.expiryTime);
    }

    const attachments = [...entry.binaries]
        .map(([name, data]) => {
            if (data && data.ref) {
                data = data.value;
            }
            if (data) {
                const base64 = kdbxweb.ByteUtils.bytesToBase64(data);
                data = 'data:application/octet-stream;base64,' + base64;
            }
            return { name, data };
        })
        .filter((att) => att.name && att.data);

    return Templates.entry({
        path,
        title,
        fields,
        tags: entry.tags.join(', '),
        created: DateFormat.dtStr(entry.times.creationTime),
        modified: DateFormat.dtStr(entry.times.lastModTime),
        expires,
        attachments
    });
}

function entryField(entry: KdbxEntry, fieldName: string) {
    const value = entry.fields.get(fieldName);
    return (value && value.isProtected && value.getText()) || value || '';
}

function walkGroup(db: Kdbx, group: KdbxGroup, parents: KdbxGroup[]): string {
    parents = [...parents, group];
    if (
        group.uuid.equals(db.meta.recycleBinUuid) ||
        group.uuid.equals(db.meta.entryTemplatesGroup)
    ) {
        return '';
    }
    const self = group.entries.map((entry) => walkEntry(db, entry, parents)).join('\n');
    const children = group.groups
        .map((childGroup) => walkGroup(db, childGroup, parents))
        .join('\n');
    return self + children;
}



export const KdbxToHtml = {
    convert(db: Kdbx, options: convertOptions) {
        const content = db.groups.map((group) => walkGroup(db, group, [])).join('\n');
        return Templates.db({
            name: options.name,
            date: DateFormat.dtStr(Date.now()),
            appLink: Links.Homepage,
            appVersion: RuntimeInfo.version,
            contentHtml: content
        });
    },

    entryToHtml(db: Kdbx, entry: KdbxEntry) {
        return walkEntry(db, entry, []);
    }
};

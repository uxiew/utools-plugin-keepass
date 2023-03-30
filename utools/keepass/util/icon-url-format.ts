import * as kdbxweb from 'kdbxweb';
import type { ArrayBufferOrArray } from '../types';

const IconUrlFormat = {

    // toDataUrl(): null;
    // toDataUrl(iconData: ArrayBufferOrArray): string;
    toDataUrl(iconData?: ArrayBufferOrArray): string | null {
        return iconData
            ? 'data:image/png;base64,' + kdbxweb.ByteUtils.bytesToBase64(iconData)
            : null;
    }
};


export { IconUrlFormat };
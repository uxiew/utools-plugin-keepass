export const StringFormat = {
    camelCaseRegex: /-./g,

    capFirst(str: string) {
        if (!str) {
            return '';
        }
        return str[0].toUpperCase() + str.substr(1);
    },

    pad(num: number, digits: number) {
        let str = num.toString();
        while (str.length < digits) {
            str = '0' + str;
        }
        return str;
    },

    padStr(str: string, len: number) {
        while (str.length < len) {
            str += ' ';
        }
        return str;
    },

    camelCase(str: string) {
        return str.replace(this.camelCaseRegex, (match) => match[1].toUpperCase());
    },

    pascalCase(str: string) {
        return this.capFirst(str.replace(this.camelCaseRegex, (match) => match[1].toUpperCase()));
    },

    replaceVersion(str: string, replacement: string) {
        return str.replace(/\d+\.\d+\.\d+/g, replacement);
    }
};

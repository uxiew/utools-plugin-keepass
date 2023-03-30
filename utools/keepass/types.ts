export type KeeKeyFile = ArrayBuffer | Uint8Array | null | undefined
export type KeeKdfId = 'Argon2' | 'Argon2d' | 'Argon2id' | 'Aes'
export type ArrayBufferOrArray = ArrayBuffer | Uint8Array;

export type Filter = { includeDisabled?: boolean, autoType?: boolean } | null


// export type BuiltInField = 'Title' | 'Password' | 'UserName' | 'URL' | 'Notes' | 'TOTP Seed' | 'TOTP Settings' | '_etm_template_uuid'
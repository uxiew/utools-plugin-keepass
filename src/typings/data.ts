import type { ProtectedValue } from "kdbxweb";
import type AttachmentModel from "../../utools/keepass/Attachment";

export type { Entry } from '../../utools/keepass/Entry';
export type { Group } from '../../utools/keepass/Group';


export interface T_Group {
  id: string,
  title: string,
  /** 图标 Id */
  iconId: number | undefined
  icon: string | null
  customIcon: string | null
  customIconId: string | null
  notes: string,
  /** 子组列表 */
  items: T_Group[],
  /** 父组的 Id */
  parentId: string | undefined,
  /** 是否展开了 */
  expanded: boolean,
}

/** 每个账户条目的字段 */
export interface Fields {
  /** 标题 */
  title: string
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** URL */
  url: string
  /** 备注 */
  notes: string
  /** 标签 */
  tags: string[]
  /** 过期时间 */
  expiryTime: number
}


// type extraFieldsAttr = 'TimeOtp-Algorithm' | 'TimeOtp-Secret-Base32' | 'otp'
export interface T_Entry {
  id: string
  groupId: string
  tags: string[]
  iconId: number | undefined
  icon: string | null
  customIcon: string | null
  customIconId: string | null
  fields: Partial<Fields>
  extraFields: Record<string, string> & {
    otp: ProtectedValue | string,
  }
  attachments: AttachmentModel[]
  created: Date
  // _rev?: string
  sort?: number
};

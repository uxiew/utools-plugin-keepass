import EntryExtraFields from './ExtraFields';
import Attachments from "./Attachment";
import type AttachmentModel from '../../../utools/keepass/Attachment';
import { T_Entry } from '../../typings/data';

interface Props {
  attachments: AttachmentModel[]
  fields: T_Entry['extraFields']
}

export default function Advanced(props: Props) {

  const { attachments, fields } = props

  return <div className="entry-form-advanced">
    {/* 附件 */}
    <Attachments attachments={attachments} />
    {/* 附加属性 */}
    <EntryExtraFields fields={fields} />
  </div >
}

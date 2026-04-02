import {useRef} from "react";
import GroupIcon from "../../../../groupIcon";
import Description from "./description";
import ActionButton from "../../../../actionButton";
import {setGroupDescription, setGroupIcon, setGroupName} from "../../../../../services/groups";
import groupAdminStore from "../../../stores/groupAdminStore";

const GroupInfo = props => {
  const store = groupAdminStore.useContainer();
  const name = useRef(props.info.name);
  const description = useRef(props.info.description);
  const fileRef = useRef(null);

  return <div className='row mt-4'>
    <div className='col-12'>
      <h3>Group Information</h3>
    </div>
    <div className='col-4'>
      <GroupIcon id={props.groupId} />
      <div className='mt-4'>
        <input type='file' ref={fileRef} />
      </div>
    </div>
    <div className='col-8'>
      <p className='fw-bold mb-1'>Group Name</p>
      <input
        type='text'
        className='w-100 ps-2 pe-2 pt-1 pb-1 mb-2'
        defaultValue={props.info.name}
        maxLength={50}
        onChange={e => {
          name.current = e.currentTarget.value;
        }}
      />
      <p className='text-danger fw-bold mb-3'>Changing the group name costs 100 Robux.</p>
      <p className='fw-bold mb-1'>Group Description</p>
      <Description setDescription={(v) => {
        description.current = v;
      }} description={description} />
    </div>
    <div className='col-12 mt-4'>
      <ActionButton label='Save' onClick={() => {
        let promises = [];
        if (fileRef.current && fileRef.current.files && fileRef.current.files.length) {
          promises.push(setGroupIcon({
            groupId: props.groupId,
            icon: fileRef.current.files[0],
          }));
        }
        if (name.current !== props.info.name) {
          promises.push(setGroupName({
            groupId: props.groupId,
            name: name.current,
          }));
        }
        if (description.current !== props.info.description) {
          promises.push(setGroupDescription({
            groupId: props.groupId,
            description: description.current,
          }));
        }

        if (!promises.length) {
          store.setFeedback('There are no changes to save.');
          return;
        }

        Promise.all(promises).then(() => {
          window.location.reload();
        }).catch(e => {
          store.setFeedback('Error saving changes: ' + e.message);
        })
      }} />
    </div>
  </div>
}

export default GroupInfo;

import { request } from 'umi';
import sdk from './sdk';

async function sendFileMsg({ data, rid }) {
  return request(`${RC_URL}/api/v1/rooms.upload/${rid}`, {
    method: 'POST',
    data,
  });
}

const getDirectFiles = (roomId: string, search: string) =>
  sdk.get('im.files', {
    roomId,
    query: { name: { $regex: search, $options: 'i' } },
  });

const getGroupFiles = (roomId: string, search: string) =>
  sdk.get('groups.files', {
    roomId,
    query: { name: { $regex: search, $options: 'i' } },
  });

export { getDirectFiles, getGroupFiles, sendFileMsg };

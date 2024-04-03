import { request } from 'umi';
import sdk from './sdk';

const createDirect = (username?: string) => sdk.post('im.create', { username });

async function createDirects({ data }) {
  return request(`${RC_URL}/api/v1/im.create`, {
    method: 'POST',
    data,
  });
}

const deleteDirect = (username?: string) => sdk.post('im.delete', { username });

const getDirectHistory = (params) => sdk.get('im.history', params);

const closeDirect = (roomId?: string) => sdk.post('im.close', { roomId });

const openDirect = (roomId?: string) => sdk.post('im.open', { roomId });

export {
  closeDirect,
  createDirect,
  createDirects,
  deleteDirect,
  getDirectHistory,
  openDirect,
};

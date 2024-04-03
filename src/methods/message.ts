import { random } from '@/utils';
import { request } from 'umi';
import sdk from './sdk';

const updateMessage = (roomId: string, msgId: string, text: string) =>
  sdk.post('chat.update', { msgId, roomId, text });

const deleteMessage = (roomId: string, msgId: string) =>
  sdk.post('chat.delete', { msgId, roomId });

const readMessage = (rid: string) => sdk.post('subscriptions.read', { rid });

const sendMessage = (rid: string, msg: string, _id: string = random(17)) =>
  sdk.post('chat.sendMessage', { message: { _id, rid, msg } });

async function sendMessages({ data }) {
  return request(`${RC_URL}/api/v1/chat.sendMessage`, {
    method: 'POST',
    data,
  });
}

export { deleteMessage, readMessage, sendMessage, sendMessages, updateMessage };

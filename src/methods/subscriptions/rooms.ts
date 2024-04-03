import { getDvaApp } from 'umi';
import sdk from '../sdk';

const removeListener = (listener: { stop: () => void }) => listener.stop();

let streamListener: Promise<any> | false;
let subServer: string;
let subTimer: ReturnType<typeof setTimeout> | null | false = null;
export let roomsSubscription: { stop: () => void } | null = null;

// let queue: { [key: string]: any | any } = {};
// const WINDOW_TIME = 500;
// const createOrUpdateSubscription = async (subscription: any, room: any) => {
//     try {
//         if (!subscription) {
//         }
//         if (!room && subscription) {
//         }
//     } catch (e) {
//         console.log(e);
//     }
// };
// const getSubQueueId = (rid: string) => `SUB-${rid}`;
// const getRoomQueueId = (rid: string) => `ROOM-${rid}`;

const debouncedUpdateSub = (subscription: any) => {
  console.log('debouncedUpdateSub', subscription);
  const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
  const target = subscriptions?.findIndex((i) => i._id === subscription._id);
  if (target === -1) {
    subscriptions.push(subscription);
  } else {
    subscriptions[target] = Object.assign(subscriptions[target], subscription);
  }
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  getDvaApp()._store.dispatch({
    type: 'room/saveRooms',
    payload: subscriptions,
  });
};

const debouncedUpdateMsg = (msg: any) => {
  console.log('debouncedUpdateMsg', msg);
  const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
  const target = subscriptions?.findIndex((i) => i.rid === msg._id);
  subscriptions[target] = {
    ...subscriptions[target],
    lastMessage: msg.lastMessage,
  };
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  getDvaApp()._store.dispatch({
    type: 'room/saveRooms',
    payload: subscriptions,
  });
  // 切换房间
};

export default function subscribeRooms() {
  const handleStreamMessageReceived = async (ddpMessage: any) => {
    if (sdk && sdk.current.client && sdk.current.client.host !== subServer) {
      return;
    }
    if (ddpMessage.msg === 'added') {
      return;
    }
    const [type, data] = ddpMessage.fields.args;
    const [, ev] = ddpMessage.fields.eventName.split('/');
    console.log('subscribeRooms', ev, type, data);
    if (/userData/.test(ev)) {
      const [{ diff, unset }] = ddpMessage.fields.args;
      if (diff?.statusLivechat) {
      }
      if ((['settings.preferences.showMessageInMainThread'] as any) in diff) {
      }
      if ((['settings.preferences.alsoSendThreadToChannel'] as any) in diff) {
      }
      if (diff?.avatarETag) {
      }
      if (unset?.avatarETag) {
      }
    }
    if (/subscriptions/.test(ev)) {
      if (type === 'removed') {
      } else {
        debouncedUpdateSub(data);
      }
    }
    if (/rooms/.test(ev)) {
      if (type === 'updated' || type === 'inserted') {
        debouncedUpdateMsg(data);
      }
    }
    if (/message/.test(ev)) {
    }
    if (/notification/.test(ev)) {
    }
    if (/uiInteraction/.test(ev)) {
    }
  };

  const stop = () => {
    if (streamListener) {
      streamListener.then(removeListener);
      streamListener = false;
    }
    queue = {};
    if (subTimer) {
      clearTimeout(subTimer);
      subTimer = false;
    }
    roomsSubscription = null;
  };

  streamListener = sdk.onStreamData(
    'stream-notify-user',
    handleStreamMessageReceived,
  );

  try {
    subServer = sdk.current.client.host;
    sdk.current.subscribeNotifyUser().catch((e: unknown) => console.log(e));
    roomsSubscription = { stop: () => stop() };
    return null;
  } catch (e) {
    console.log(e);
    return Promise.reject();
  }
}

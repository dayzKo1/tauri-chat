import { debounce } from '@/utils';
import { getDvaApp } from 'umi';
import { readMessage } from '../message';
import sdk from '../sdk';

// const WINDOW_TIME = 1000;

export default class RoomSubscription {
  private rid: string;
  private isAlive: boolean;
  private timer: ReturnType<typeof setTimeout> | null;
  // private queue: { [key: string]: any };
  // private messagesBatch: {};
  // private threadsBatch: {};
  // private threadMessageBatch: {};
  // private _messagesBatch: { [key: string]: any };
  // private _threadsBatch: { [key: string]: any };
  // private _threadMessageBatch: { [key: string]: any };
  private promises?: Promise<any[]>;
  private connectedListener?: Promise<any>;
  private disconnectedListener?: Promise<any>;
  private notifyRoomListener?: Promise<any>;
  private messageReceivedListener?: Promise<any>;
  // private lastOpen?: Date;

  constructor(rid: string) {
    this.rid = rid;
    this.isAlive = true;
    this.timer = null;
    this.queue = {};
    this.messagesBatch = {};
    this.threadsBatch = {};
    this.threadMessageBatch = {};
    this._messagesBatch = {};
    this._threadsBatch = {};
    this._threadMessageBatch = {};
  }

  subscribe = async () => {
    if (this.promises) {
      await this.unsubscribe();
    }
    this.promises = sdk.subscribeRoom(this.rid);
    this.connectedListener = sdk.onStreamData(
      'connected',
      this.handleConnection,
    );
    this.disconnectedListener = sdk.onStreamData(
      'close',
      this.handleConnection,
    );
    this.notifyRoomListener = sdk.onStreamData(
      'stream-notify-room',
      this.handleNotifyRoomReceived,
    );
    this.messageReceivedListener = sdk.onStreamData(
      'stream-room-messages',
      this.handleMessageReceived,
    );
    if (!this.isAlive) {
      await this.unsubscribe();
    }
  };

  unsubscribe = async () => {
    console.log(`Unsubscribing from room ${this.rid}`);
    this.isAlive = false;
    if (this.promises) {
      try {
        const subscriptions = (await this.promises) || [];
        subscriptions.forEach((sub) =>
          sub.unsubscribe().catch(() => console.log('unsubscribeRoom')),
        );
      } catch (e) {
        //
      }
    }
    this.removeListener(this.connectedListener);
    this.removeListener(this.disconnectedListener);
    this.removeListener(this.notifyRoomListener);
    this.removeListener(this.messageReceivedListener);
    if (this.timer) {
      clearTimeout(this.timer);
    }
  };

  removeListener = async (promise?: Promise<any>): Promise<void> => {
    if (promise) {
      try {
        const listener = await promise;
        listener.stop();
      } catch (e) {
        // do nothing
      }
    }
  };

  handleConnection = async () => {
    console.log('One Connection');
    try {
      const _lastOpen = new Date();
      this.read(_lastOpen);
      this.lastOpen = _lastOpen;
    } catch (e) {
      console.log(e);
    }
  };

  handleNotifyRoomReceived = (ddpMessage: any) => {
    const [_rid, ev] = ddpMessage.fields.eventName.split('/');
    console.log('One NotifyRoomReceived', _rid, ev);
    if (this.rid !== _rid) {
      return;
    }
    if (ev === 'typing') {
    } else if (ev === 'user-activity') {
    } else if (ev === 'deleteMessage') {
    }
  };

  read = debounce((lastOpen: Date) => {
    readMessage(this.rid, lastOpen);
  }, 300);

  updateMessage = (message: any): Promise<void> =>
    new Promise((resolve) => {
      if (this.rid !== message.rid) {
        resolve();
      }
      resolve();
    });

  handleMessageReceived = async (ddpMessage: any) => {
    const msg = ddpMessage.fields.args[0];
    if (msg.hasOwnProperty('pinned')) {
      return;
    }
    const reload = debounce(() => {
      // getDvaApp()._store.dispatch({ type: 'room/loadHistory' })
      getDvaApp()._store.dispatch({ type: 'room/addToRoom', payload: msg });
    }, 500);
    reload();
    // const roomId = msg.rid
    // const former = JSON.parse(localStorage.getItem('room_history')) ?? {}
    // former[roomId] = [msg, ...former?.[roomId] ?? []]
    // localStorage.setItem('room_history', JSON.stringify(former))
    // if (!this.timer) {
    //     this.timer = setTimeout(async () => {
    //         const _lastOpen = this.lastOpen;
    //         const _queue = Object.keys(this.queue).map(key => this.queue[key]);
    //         this._messagesBatch = this.messagesBatch;
    //         this._threadsBatch = this.threadsBatch;
    //         this._threadMessageBatch = this.threadMessageBatch;
    //         this.queue = {};
    //         this.messagesBatch = {};
    //         this.threadsBatch = {};
    //         this.threadMessageBatch = {};
    //         this.timer = null;
    //         for (let i = 0; i < _queue.length; i += 1) {
    //             try {
    //                 await this.updateMessage(_queue[i]);
    //             } catch (e) {
    //                 console.log(e);
    //             }
    //         }

    //         try {
    //             this.read(_lastOpen);
    //         } catch (e) {
    //             console.log(e);
    //         }
    //         // Clean local variables
    //         this._messagesBatch = {};
    //         this._threadsBatch = {};
    //         this._threadMessageBatch = {};
    //     }, WINDOW_TIME);
    // }
    // this.lastOpen = new Date();
    // const message = buildMessage(EJSON.fromJSONValue(ddpMessage.fields.args[0]));
    // const message = {
    //     _id: "(&$%^&^",
    //     msg: ddpMessage.fields.args[0].msg
    // }
    // this.queue[message._id] = message;
  };
}

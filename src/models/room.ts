import {
  closeDirect,
  closeGroup,
  createDirect,
  deleteMessage,
  getDirectFiles,
  getDirectHistory,
  getGroupFiles,
  getGroupInfo,
  getGroupMember,
  getGroupMessages,
  getPinMessage,
  getRooms,
  getSubscriptions,
  getUserInfo,
  openDirect,
  openGroup,
  pinMessage,
  readMessage,
  searchMessage,
  sendMessage,
  unPinMessage,
  updateMessage,
} from "@/methods";
import RoomSubscription from "@/methods/subscriptions/room";

export default {
  state: {
    pins: [],
    room: [],
    rooms: [],
    current: {
      type: "",
      roomId: "",
      roomName: "",
      uid: "",
      rcUserId: "",
    },
    searchRes: [],
    userInfo: {},
    groupInfo: {},
    hasMore: true,
    groupMember: [],
    files: [],
  },

  effects: {
    // 获取消息列表
    *getRooms(_: any, { put }: any) {
      let lastUpdateAt = "2023-01-01T00:00:00.000Z"; // ?account create
      if (!localStorage.getItem("last_updateAt")) {
        // first
        const { update: rooms } = yield getRooms(lastUpdateAt);
        localStorage.setItem("rooms", JSON.stringify(rooms));
        const { update: subscriptions } = yield getSubscriptions(lastUpdateAt);
        subscriptions?.forEach((item: any, index: number) => {
          const target = rooms?.findIndex((i: any) => i._id === item.rid);
          subscriptions[index] = {
            ...subscriptions[index],
            lastMessage: rooms[target].lastMessage,
          };
        });
        localStorage.setItem("last_updateAt", new Date().toISOString());
        localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
        yield put({
          type: "saveRooms",
          payload: subscriptions,
        });
      } else {
        // next
        yield put({
          type: "saveRooms",
          payload: JSON.parse(localStorage.getItem("subscriptions") || ""),
        });
      }
      // last
      // const lastOpen = JSON.parse(localStorage.getItem('last_open'))
      // yield put({ type: 'subscribeRoom', payload: lastOpen });
    },
    // 订阅房间
    *subscribeRoom({ payload }: any, { put }: any) {
      try {
        yield put({ type: "saveRoom", payload: [] });
        const subscription = new RoomSubscription(payload.roomId);
        subscription.subscribe();
        yield put({ type: "saveCurrent", payload });
        yield put({ type: "loadHistory" });
        yield put({ type: "saveHasMore", payload: true });
      } catch {
        //
      }
      // 记录上次打开
      // localStorage.setItem('last_open', JSON.stringify(payload))
    },
    // 获取历史信息 未做缓存 待优化
    *loadHistory(_: any, { select, put }: any) {
      // const { type, roomId } = yield select(({ room }) => room.current);
      // const former = JSON.parse(localStorage.getItem('room_history')) ?? {}
      // const params = {
      //   roomId,
      //   offset: payload?.offset ? former?.[roomId]?.length ?? 0 : 0,
      // }
      // let history;
      // if (type === 'direct') {
      //   history = yield getDirectHistory(params);
      // }
      // if (type === 'group') {
      //   history = yield getGroupMessages(params);
      // }
      // former[roomId] = [...former?.[roomId] ?? [], ...history?.messages]
      // localStorage.setItem('room_history', JSON.stringify(former))
      // yield put({ type: 'saveRoom', payload: [...former?.[roomId] ?? [], ...history?.messages] });
      const { type, roomId } = yield select(({ room }: any) => room.current);
      const former = yield select(({ room }: any) => room.room);
      let history;
      const params = {
        roomId,
        offset: former?.length,
      };
      if (type === "direct") {
        history = yield getDirectHistory(params);
      }
      if (type === "group") {
        history = yield getGroupMessages(params);
      }
      // state
      if (history?.messages?.length > 0) {
        yield put({
          type: "saveRoom",
          payload: [...history?.messages, ...former],
        });
      } else {
        yield put({ type: "saveHasMore", payload: false });
      }
    },
    // 发送信息
    *sendMessage({ payload }: any) {
      const { rid, msg } = payload;
      yield sendMessage(rid, msg);
    },
    // 删除信息
    *deleteMessage({ payload }: any, { put, select }: any) {
      const { roomId, msgId } = payload;
      yield deleteMessage(roomId, msgId);
      // state
      const former = yield select(({ room }: any) => room.room);
      former.splice(
        former.findIndex((item: any) => item._id === msgId),
        1,
      );
      yield put({
        type: "saveRoom",
        payload: former,
      });
    },
    // 更新信息
    *updateMessage({ payload }: any) {
      const { roomId, msgId, text } = payload;
      yield updateMessage(roomId, msgId, text);
    },
    // 已读信息
    *readRoom({ payload }: any) {
      yield readMessage(payload);
    },
    *openRoom({ payload }: any) {
      const { type, roomId } = payload;
      if (type === "direct") {
        yield openDirect(roomId);
      }
      if (type === "group") {
        yield openGroup(roomId);
      }
    },
    *closeRoom({ payload }: any, { select, put }: any) {
      const { type, roomId } = payload;
      const { roomId: focusId } = yield select(({ room }: any) => room.current);
      if (type === "direct") {
        yield closeDirect(roomId);
      }
      if (type === "group") {
        yield closeGroup(roomId);
      }
      if (roomId === focusId) {
        yield put({ type: "saveCurrent", payload: {} });
        yield put({ type: "saveRoom", payload: [] });
      }
    },
    *pin({ payload }: any, { select, put }: any) {
      yield pinMessage(payload);
      // state
      const former = yield select(({ room }: any) => room.room);
      const target = former.findIndex((i: any) => i._id === payload);
      former[target] = {
        ...former[target],
        pinned: true,
      };
      yield put({ type: "saveRoom", payload: former });
    },
    *unPin({ payload }: any, { select, put }: any) {
      yield unPinMessage(payload);
      // 若打开已固定信息 则更新
      const pins = yield select(({ room }: any) => room.pins);
      if (pins.length) {
        yield put({ type: "getPins" });
      }
      // state
      const former = yield select(({ room }: any) => room.room);
      const target = former.findIndex((i: any) => i._id === payload);
      former[target] = {
        ...former[target],
        pinned: false,
      };
      yield put({ type: "saveRoom", payload: former });
    },
    *getPins(_: any, { select, put }: any) {
      const { roomId } = yield select(({ room }: any) => room.current);
      const res = yield getPinMessage(roomId);
      yield put({ type: "savePins", payload: res.messages });
    },
    *goToRoom({ payload }: any, { put }: any) {
      try {
        const { username, nickName } = payload;
        const { room } = yield createDirect(username);
        yield put({
          type: "subscribeRoom",
          payload: {
            type: "direct",
            roomId: room._id,
            roomName: nickName || username,
            uid: room?.rid?.replace(room?.u?._id, ""),
          },
        });
      } catch {
        //
      }
    },
    *getUserInfo({ payload }: any, { put }: any) {
      const { userId } = payload;
      const res = yield getUserInfo(userId);
      yield put({ type: "saveUserInfo", payload: res.user });
      return res.user;
    },
    *getGroupInfo(_: any, { select, put }: any) {
      const { roomId } = yield select(({ room }: any) => room.current);
      const res = yield getGroupInfo(roomId);
      yield put({ type: "saveGroupInfo", payload: res.group });
    },
    *getGroupMember(_: any, { select, put }: any) {
      const { roomId } = yield select(({ room }: any) => room.current);
      const res = yield getGroupMember(roomId);
      yield put({ type: "saveGroupMember", payload: res.members });
    },
    *searchMessage({ payload }: any, { select, put }: any) {
      const { searchText } = payload;
      const { roomId } = yield select(({ room }: any) => room.current);
      const res = yield searchMessage(roomId, searchText);
      yield put({ type: "saveSearchRes", payload: res.messages });
    },
    *getFiles({ payload }: any, { select, put }: any) {
      const { search = "" } = payload;
      const { type, roomId } = yield select(({ room }: any) => room.current);
      let res;
      if (type === "direct") {
        res = yield getDirectFiles(roomId, search);
      }
      if (type === "group") {
        res = yield getGroupFiles(roomId, search);
      }
      let newArr: any = [];
      res.files.forEach((item: any) => {
        let index = -1;
        let isExist = newArr.some((newItem: any, j: number) => {
          if (
            item?.uploadedAt?.split("T")[0] ===
            newItem?.uploadedAt?.split("T")[0]
          ) {
            index = j;
            return true;
          }
          return false;
        });
        if (!isExist) {
          newArr.push({
            uploadedAt: item.uploadedAt.split("T")[0],
            subList: [item],
          });
        } else {
          newArr[index].subList.push(item);
        }
      });
      yield put({
        type: "saveFiles",
        payload: newArr.sort((a: any, b: any) =>
          a.uploadedAt > b.uploadedAt ? -1 : 1,
        ),
      });
    },
  },

  reducers: {
    saveRoom(state: any, { payload }: any) {
      return {
        ...state,
        room: payload,
      };
    },
    addToRoom(state: any, { payload }: any) {
      if (
        state.room.some((item: any) => item._id === payload._id) ||
        state.current.roomId !== payload.rid
      ) {
        return {
          ...state,
        };
      }
      return {
        ...state,
        room: [...state.room, payload],
      };
    },
    saveRooms(state: any, { payload }: any) {
      return {
        ...state,
        rooms: payload,
      };
    },
    saveCurrent(state: any, { payload }: any) {
      return {
        ...state,
        current: payload,
      };
    },
    savePins(state: any, { payload }: any) {
      return {
        ...state,
        pins: payload,
      };
    },
    saveSearchRes(state: any, { payload }: any) {
      return {
        ...state,
        searchRes: payload,
      };
    },
    saveUserInfo(state: any, { payload }: any) {
      return {
        ...state,
        userInfo: payload,
      };
    },
    saveGroupInfo(state: any, { payload }: any) {
      return {
        ...state,
        groupInfo: payload,
      };
    },
    saveHasMore(state: any, { payload }: any) {
      return {
        ...state,
        hasMore: payload,
      };
    },
    saveGroupMember(state: any, { payload }: any) {
      return {
        ...state,
        groupMember: payload,
      };
    },
    saveFiles(state: any, { payload }: any) {
      return {
        ...state,
        files: payload,
      };
    },
  },
};

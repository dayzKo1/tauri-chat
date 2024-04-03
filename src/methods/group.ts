import sdk from './sdk';

// 获取(当前用户)所有群组
const getGroups = (all: boolean = false) =>
  sdk.get(all ? 'groups.listAll' : 'groups.list');

// 获取群组成员 id/name
const getGroupMember = (roomId: string) =>
  sdk.get('groups.members', { roomId });

// 获取群组详情
const getGroupInfo = (roomId: string) => sdk.get('groups.info', { roomId });

// 获取群组信息
const getGroupMessages = (params) => sdk.get('groups.messages', params);

// 获取群组历史信息
const getGroupHistory = (roomId: string, count: number, latest?: string) =>
  sdk.get('groups.history', { roomId, count, latest });

// 获取群组计数
const getGroupCounter = (roomId: string, roomName: string, userId?: string) =>
  sdk.get('groups.counters', { roomId, roomName, userId });

const openGroup = (roomId?: string) => sdk.post('groups.open', { roomId });

const closeGroup = (roomId?: string) => sdk.post('groups.close', { roomId });

export {
  getGroupInfo,
  getGroups,
  getGroupMember,
  getGroupMessages,
  getGroupHistory,
  getGroupCounter,
  openGroup,
  closeGroup,
};

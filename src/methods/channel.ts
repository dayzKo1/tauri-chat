import sdk from './sdk';

const queryChannelHistory = (roomId: string) =>
  sdk.get('channels.messages', { roomId });

export { queryChannelHistory };

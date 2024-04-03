import sdk from './sdk';

const getPinMessage = (roomId: string) =>
  sdk.get('chat.getPinnedMessages', { roomId });

const pinMessage = (messageId: string) =>
  sdk.post('chat.pinMessage', { messageId });

const unPinMessage = (messageId: string) =>
  sdk.post('chat.unPinMessage', { messageId });

export { getPinMessage, pinMessage, unPinMessage };

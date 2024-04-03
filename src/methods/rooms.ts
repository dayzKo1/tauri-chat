import sdk from './sdk';

const getRooms = (updatedSince?: Date) =>
  sdk.get('rooms.get', {
    updatedSince,
  });

const cleanHistory = (latest, oldest) =>
  sdk.post('rooms.cleanHistory', { latest, oldest });

export { cleanHistory, getRooms };

import sdk from './sdk';

const searchMessage = (roomId: string, searchText: string) =>
  sdk.get('chat.search', { roomId, searchText });

//  It will only return rooms that user didn't join yet.
const searchRooms = (query: string) => sdk.get('spotlight', { query });

export { searchMessage, searchRooms };

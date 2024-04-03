import subscribeRoomsTmp, { roomsSubscription } from './subscriptions/rooms';

export async function subscribeRooms(): Promise<void> {
	if (!roomsSubscription?.stop) {
		try {
			await subscribeRoomsTmp();
		} catch (e) {
			console.log(e);
		}
	}
}

export function unsubscribeRooms(): void {
	if (roomsSubscription?.stop) {
		roomsSubscription.stop();
	}
}

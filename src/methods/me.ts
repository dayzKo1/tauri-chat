import sdk from './sdk';

const getMe = () => sdk.get('me');

const getUserInfo = (userId: string) => sdk.get('users.info', { userId });

export { getMe, getUserInfo };

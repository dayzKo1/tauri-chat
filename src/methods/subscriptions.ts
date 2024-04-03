import sdk from './sdk';

const getSubscriptions = (updatedSince?: Date) =>
  sdk.get('subscriptions.get', {
    // updatedSince: updatedSince?.toISOString()
    updatedSince,
  });

export { getSubscriptions };

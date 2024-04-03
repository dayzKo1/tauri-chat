import sdk from './sdk';
const abort = () => sdk.current && sdk.current.abort();

const checkAndReopen = () => sdk.current.checkAndReopen();

const disconnect = () => sdk.disconnect();

const connect = (server: string) =>
  new Promise<void>((resolve) => {
    if (sdk.current?.client?.host === server) {
      resolve();
    }
    sdk.initialize(server);
    sdk.current
      .connect()
      .then(() => {
        console.log('connected');
      })
      .catch((err: any) => {
        console.log('connected error', err);
      });
    resolve();
  });

const login = (credentials: any) => sdk.current.login(credentials);

export { login, abort, connect, disconnect, checkAndReopen };

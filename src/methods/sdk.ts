import { Rocketchat } from '@rocket.chat/sdk';

class Sdk {
  private sdk: typeof Rocketchat;

  private initializeSdk(server: string): typeof Rocketchat {
    return new Rocketchat({
      host: server,
      protocol: 'ddp',
      useSsl: false,
      reopen: 20000,
    });
  }

  initialize(server: any) {
    this.sdk = this.initializeSdk(server);
    return this.sdk;
  }

  get current() {
    return this.sdk;
  }

  disconnect() {
    if (this.sdk) {
      this.sdk.disconnect();
      this.sdk = null;
    }
    return null;
  }

  get(endpoint: any, params?: any) {
    console.log(`get.${endpoint}`, params);
    return this.current.get(endpoint, params);
  }

  post(endpoint: any, params: any) {
    return new Promise(async (resolve, reject) => {
      console.log(`post.${endpoint}`, params);
      const isMethodCall = endpoint?.startsWith('method.call/');
      try {
        const result = await this.current.post(endpoint, params);
        if (isMethodCall) {
          const response = JSON.parse(result.message);
          if (response?.error) {
            throw response.error;
          }
          return resolve(response.result);
        }
        return resolve(result);
      } catch (e: any) {
        const errorType = isMethodCall ? e?.error : e?.data?.errorType;
        const totpInvalid = 'totp-invalid';
        const totpRequired = 'totp-required';
        if ([totpInvalid, totpRequired].includes(errorType)) {
          const { details } = isMethodCall ? e : e?.data;
          try {
            // await twoFactor({
            //   method: details?.method,
            //   invalid: errorType === totpInvalid,
            // });
            return resolve(this.post(endpoint, params));
          } catch {
            return resolve({} as any);
          }
        } else {
          reject(e);
        }
      }
    });
  }

  subscribe(...args: any[]) {
    return this.current.subscribe(...args);
  }

  subscribeRoom(...args: any[]) {
    const topic = 'stream-notify-room';
    let eventUserTyping;
    eventUserTyping = this.subscribe(topic, `${args[0]}/user-activity`, ...args);
    // eventUserTyping = this.subscribe(topic, `${args[0]}/typing`, ...args);
    return Promise.all([
      this.subscribe('stream-room-messages', args[0], ...args),
      eventUserTyping,
      this.subscribe(topic, `${args[0]}/deleteMessage`, ...args)
    ]);
  }

  unsubscribe(subscription: any[]) {
    return this.current.unsubscribe(subscription);
  }

  onStreamData(...args: any[]) {
    return this.current.onStreamData(...args);
  }
}

const sdk = new Sdk();

export default sdk;

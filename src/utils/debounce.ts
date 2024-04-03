import { useDebouncedCallback } from 'use-debounce';

const random = (length = 10) => {
  let text = '';
  const possible =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const debounce = (func: any, wait?: number, immediate?: boolean) => {
  let timeout: ReturnType<typeof setTimeout> | null;
  function _debounce(...args: any[]) {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    const later = function __debounce() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout!);
    // @ts-ignore
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  }
  _debounce.stop = () => clearTimeout(timeout!);
  return _debounce;
};

const useDebounce = (func: (...args: any) => any, wait?: number) =>
  useDebouncedCallback(func, wait || 1000);

export { random, debounce, useDebounce };

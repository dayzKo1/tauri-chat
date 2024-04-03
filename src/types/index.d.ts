import { w } from "@tauri-apps/api/event-41a9edf5";

export {};

declare global {
  interface Window {
    __TAURI__: { window: w };
  }
}

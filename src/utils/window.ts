import { WebviewWindow } from "@tauri-apps/api/window";

const windowConfig = {
  label: null, // 窗口唯一label
  title: "", // 窗口标题
  url: "", // 路由地址url
  width: 900, // 窗口宽度
  height: 640, // 窗口高度
  minWidth: null, // 窗口最小宽度
  minHeight: null, // 窗口最小高度
  x: null, // 窗口相对于屏幕左侧坐标
  y: null, // 窗口相对于屏幕顶端坐标
  center: true, // 窗口居中显示
  resizable: true, // 是否支持缩放
  maximized: false, // 最大化窗口
  decorations: true, // 窗口是否无边框及导航条
  alwaysOnTop: false, // 置顶窗口
  fileDropEnabled: false, // 禁止系统拖放
  visible: true, // 隐藏窗口
};

// 创建新窗口
const createWin = (options: any) => {
  const args = Object.assign({}, windowConfig, options);
  const win = new WebviewWindow(args.label, args);
  win.once("tauri://created", async () => {
    win?.show();
  });
  win.once("tauri://error", async (e: any) => {
    if (e.payload.includes("already exists")) {
      console.log("error", e.payload);
      win?.hide();
      win?.show();
    }
  });
};

const closeWin = (label: any) => {
  const win = WebviewWindow.getByLabel(label);
  win?.close();
};

const showWin = (label: any) => {
  const win = WebviewWindow.getByLabel(label);
  win?.show();
};

const hideWin = (label: any) => {
  const win = WebviewWindow.getByLabel(label);
  win?.hide();
};

export { closeWin, createWin, hideWin, showWin };

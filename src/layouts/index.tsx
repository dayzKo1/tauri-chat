import { Outlet } from 'umi';

export default function Layout() {
  return (
    <>
      {/* <div
        data-tauri-drag-region
        style={{
          textAlign: "right",
          padding: 6,
        }}
      >
        <Space size={20}>
          <img
            src="https://api.iconify.design/mdi:window-minimize.svg"
            alt="minimize"
            onClick={() => appWindow.minimize()}
          />
          <img
            src="https://api.iconify.design/mdi:window-maximize.svg"
            alt="maximize"
            onClick={() => appWindow.toggleMaximize()}
          />
          <img
            src="https://api.iconify.design/mdi:close.svg"
            alt="close"
            onClick={() => appWindow.close()}
          />
        </Space>
      </div> */}
      <Outlet />
    </>
  );
}

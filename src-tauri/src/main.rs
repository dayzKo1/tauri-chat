// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};
// use window_vibrancy::apply_blur;

use crate::utils::set_window_shadow;
mod utils;

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    let show = CustomMenuItem::new("show".to_string(), "显示窗口");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let tray = SystemTray::new().with_menu(tray_menu);
    tauri::Builder::default()
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .setup(|app: &mut tauri::App| {
            set_window_shadow(app);
            let login = app.get_window("login").unwrap();
            // #[cfg(target_os = "windows")]
            // apply_blur(&login, Some((18, 18, 18, 125)))     
            //     .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
            let splashscreen_window = app.get_window("intro").unwrap();
            tauri::async_runtime::spawn(async move {
                println!("加载...");
                std::thread::sleep(std::time::Duration::from_secs(3));
                println!("加载完成");
                splashscreen_window.close().unwrap();
                login.show().unwrap();
            });
            Ok(())
        })
        .system_tray(tray) // 系统托盘 2.0.0 alpha10 getCurrentWindow
        .on_system_tray_event(|app, event| menu_handle(app, event))
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });

    fn menu_handle(app_handle: &tauri::AppHandle, event: SystemTrayEvent) {
        match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                app_handle.get_window("room").map_or((), |w| {
                    w.show().unwrap();
                });
                app_handle.get_window("login").map_or((), |w| {
                    w.show().unwrap();
                });
                println!("鼠标-左击");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                // let item_handle = app_handle.tray_handle().get_item(&id);
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show" => {
                        app_handle.get_window("login").map_or((), |w| {
                            w.show().unwrap();
                        });
                        app_handle.get_window("room").map_or((), |w| {
                            w.show().unwrap();
                        });
                    }
                    _ => {}
                }
            }
            _ => {}
        }
    }
}

import { getDvaApp } from 'umi';
import { connect, login, subscribeRooms } from '.';

const start = async () => {
  // 连接服务器
  await connect(RC_URL);
  if (JSON.parse(localStorage.getItem('userInfo'))) {
    const { userName, password } = JSON.parse(localStorage.getItem('userInfo'));
    // 登录
    const user = await login({
      user: userName,
      password: password,
    });
    localStorage.setItem('user', JSON.stringify(user));
  }
  // 获取消息列表
  getDvaApp()._store.dispatch({ type: 'room/getRooms' });
  // 订阅全局
  subscribeRooms();
};

export { start };

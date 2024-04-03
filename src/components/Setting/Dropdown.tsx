import { checkAuthentication } from "@/services/Company";
import { closeWin, createWin } from "@/utils";
import { MenuOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { Dropdown } from "antd";

const Drop = () => {
  // 判断用户是否认证接口
  const { data } = useQuery(checkAuthentication, {
    fetchPolicy: "no-cache",
  });
  const authentication = data?.users.checkAuthentication;

  const items = [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            createWin({
              title: "编辑个人信息",
              label: "basic",
              url: "/login/basic",
              // width: 350,
              // height: 500,
              width: 560,
              height: 600,
            });
          }}
        >
          个人信息
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          onClick={() => {
            createWin({
              title: "编辑企业信息",
              label: "enterpriseCertification",
              url: `/enterpriseCertification?authentication=${authentication}`,
              width: 870,
              height: 690,
            });
          }}
        >
          企业信息（{authentication ? "已认证" : "未认证"}）
        </div>
      ),
    },
    {
      key: "3",
      label: <div>通用设置</div>,
    },
    {
      key: "4",
      label: (
        <div
          onClick={() => {
            const win = window.__TAURI__.window;
            win.getAll().map((item) => closeWin(item.label));
            createWin({
              label: "login",
              width: 300,
              height: 440,
              decorations: false,
            });
            // showWin("login")
          }}
        >
          退出登录
        </div>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="topRight">
      <MenuOutlined />
    </Dropdown>
  );
};

export default Drop;

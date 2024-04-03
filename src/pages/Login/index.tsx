import noAuthentication from "@/assets/common/authenticationPrompt.png";
import logo from "@/assets/common/logo.png";
import { checkIsRegister, getCode, login, register } from "@/services";
import { closeWin, createWin } from "@/utils";
import { appWindow } from "@tauri-apps/api/window";
import { useRequest } from "ahooks";
import { Button, Checkbox, Form, Input, Modal, Space, message } from "antd";
import { useState } from "react";
import { history, styled } from "umi";

const LoginBox = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
  flex-direction: column;

  .ant-form-item {
    width: 250px;

    .ant-input {
      height: 40px;
      border: none;
      background: #f7f7f7;

      &::placeholder {
        font-size: 14px;
        color: #bbbbbb;
      }
    }

    .ant-input-affix-wrapper {
      border: none;
      background: #f7f7f7;
    }
  }
`;

const App = () => {
  const [form] = Form.useForm();
  // 授权条款协议
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 去认证模态框
  const [isAuthentication, setIsAuthentication] = useState(false);
  const [getCodeIsdisabled, setGetCodeIsdisabled] = useState(false);
  const [getCodeText, setGetCodeText] = useState("获取");
  const [isRegister, setIsRegister] = useState(false);

  const { runAsync: isregisterRunAsync } = useRequest(checkIsRegister, {
    manual: true,
    onSuccess: () => {
      setIsRegister(false);
    },
    onError: () => {
      setIsRegister(true);
    },
  });

  const { runAsync: runLogin } = useRequest(login, {
    manual: true,
    onSuccess: ({ data }: any) => {
      localStorage.clear();
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...data,
          password: form.getFieldValue("password"),
        }),
      );
      console.log("登录接口", data, process.env.NODE_ENV);
      if (process.env.NODE_ENV === "development" || data?.signature) {
        // if (data?.signature) {
        closeWin("login");
        createWin({
          title: "",
          label: "room",
          width: 1400,
          height: 768,
          center: true,
          url: "/room",
        });
      } else {
        // 未实名认证
        setIsAuthentication(true);
      }
    },
    onError: (e: any) => {
      message.error(e.response?.data?.errors);
    },
  });

  const { runAsync: getCodeRunAsync } = useRequest(getCode, {
    manual: true,
    onSuccess: ({ success }: any) => {
      if (success) {
        message.success("验证码已发送，15min内有效");
      }
    },
  });

  const { runAsync: registerApiAsync } = useRequest(register, {
    manual: true,
    onSuccess: ({ success, message: msg }: any) => {
      if (success) {
        runLogin({
          userName: form.getFieldValue("userName"),
          password: form.getFieldValue("password"),
        });
      } else {
        message.error(msg);
      }
    },
  });

  return (
    <LoginBox data-tauri-drag-region>
      <Space
        style={{
          position: "absolute",
          right: 0,
          cursor: "pointer",
          padding: 5,
        }}
      >
        <img
          src="https://api.iconify.design/mdi:window-minimize.svg"
          alt="minimize"
          onClick={() => appWindow.minimize()}
        />
        <img
          src="https://api.iconify.design/mdi:close.svg"
          alt="close"
          onClick={() => appWindow.hide()}
        />
      </Space>
      <img src={logo} style={{ width: 64, margin: "25px 30px" }} />
      <Form
        form={form}
        onFinish={(values) => {
          if (!values.check) {
            setIsModalOpen(true);
            return;
          }
          if (isRegister) {
            registerApiAsync({
              userName: values.userName,
              password: values.password,
              code: values.code,
            });
          } else {
            runLogin({
              userName: values.userName,
              password: values.password,
            });
          }
        }}
      >
        <Form.Item
          name="userName"
          rules={[
            {
              required: true,
              pattern: new RegExp(/^1[3-9][0-9]{9}$/),
              message: "请输入正确的手机号",
            },
          ]}
          initialValue="13559440844"
        >
          <Input
            id="username"
            placeholder="请输入采控网账号/注册手机号"
            onBlur={(e) => {
              isregisterRunAsync({ userName: e.target.value });
            }}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              pattern: new RegExp(/^[a-zA-Z0-9]{6,12}$/),
              message: "密码只能由6-12位数字和字母组成",
            },
          ]}
          initialValue="a123456"
        >
          <Input.Password
            placeholder={
              isRegister ? "新用户直接设置密码注册登录" : "请输入密码"
            }
          />
        </Form.Item>
        {isRegister && (
          <Form.Item
            name="code"
            rules={[{ required: true, message: "请输入6位数的验证码" }]}
          >
            <div>
              <Input placeholder="请输入验证码" />
              <div
                style={{
                  color: "#4E83FD",
                  position: "absolute",
                  width: 28,
                  right: 10,
                  top: 10,
                }}
                onClick={() => {
                  if (getCodeIsdisabled === false) {
                    let date = 60;
                    setGetCodeIsdisabled(true);
                    setGetCodeText(date + "s");
                    getCodeRunAsync({
                      mobile: form.getFieldValue("userName"),
                    });
                    const timer = setInterval(() => {
                      setGetCodeText(date + "s");
                      if (date <= 0) {
                        clearInterval(timer);
                        setGetCodeText("获取");
                        setGetCodeIsdisabled(false);
                      } else {
                        setGetCodeIsdisabled(true);
                        date--;
                      }
                    }, 1000);
                  }
                }}
              >
                {getCodeText}
              </div>
            </div>
          </Form.Item>
        )}
        <Form.Item>
          <Form.Item
            noStyle
            name="check"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>已阅读并同意</Checkbox>
          </Form.Item>
          <Button
            type="link"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            授权条款协议
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              height: 40,
              width: "100%",
            }}
          >
            {isRegister ? "注册" : "登录"}
          </Button>
        </Form.Item>
        {!isRegister && (
          <Button type="link" href="/login/reset">
            忘记密码
          </Button>
        )}
      </Form>
      <Modal
        title="授权条款"
        open={isModalOpen}
        onOk={() => {
          setIsModalOpen(false);
        }}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        okText="确认"
        cancelButtonProps={{ style: { display: "none" } }}
      >
        授权条款
      </Modal>
      <Modal
        wrapClassName="mymodal"
        title=""
        closable={false}
        centered
        open={isAuthentication}
        onCancel={() => {
          setIsAuthentication(false);
        }}
        footer={null}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 15,
          }}
        >
          <img
            src={noAuthentication}
            alt=""
            style={{ width: "100%", height: "40%" }}
          />
          <div
            style={{
              fontSize: "18px",
              color: "#3B86F6",
              fontWeight: 500,
              marginTop: "10px",
            }}
          >
            实名认证
          </div>
          <div
            style={{
              padding: "10px 20px 0 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#484C52",
              }}
            >
              您还未实名认证，为方便和享受更多权益服务，请前去认证身份完善资料吧～
            </div>
            <Button
              type="primary"
              style={{
                height: 40,
                width: "100%",
                marginTop: "15px",
              }}
              onClick={() => {
                history.push("/login/realNameAuthentication");
              }}
            >
              立即认证
            </Button>
            <Button
              type="link"
              style={{
                width: "30%",
                color: "#B5B5B5",
                marginTop: "10px",
                marginBottom: "20px",
              }}
              onClick={() => {
                setIsAuthentication(false);
                closeWin("login");
                createWin({
                  title: "",
                  label: "room",
                  width: 1400,
                  height: 768,
                  center: true,
                  url: "/room",
                });
              }}
            >
              跳过
            </Button>
          </div>
        </div>
      </Modal>
    </LoginBox>
  );
};
export default App;

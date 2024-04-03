import { getCode, resetPassword } from "@/services";
import { useRequest } from "ahooks";
import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { styled } from "umi";

import Header from "@/components/Header";

const LoginBox = styled.div`
   display: flex;
   text-align: center;
   align-items: center;
   flex-direction: column;
   .ant-form-item {
     width: 250px;
     height：400px;
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

const Reset = () => {
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(false);
  const [codeText, setCodeText] = useState("获取");

  // 验证码 15min有效
  const { runAsync: getC } = useRequest(getCode, {
    // manual: true,
    onSuccess: () => {
      message.success("验证码已发送，15min内有效");
    },
  });

  // 修改密码
  const { runAsync: reset } = useRequest(resetPassword, {
    manual: true,
    onSuccess: () => {
      message.success("修改成功");
    },
    onError: (e) => {
      message.error(e.response.data.errors);
    },
  });

  return (
    <>
      <Header title={"忘记密码"} />
      <LoginBox data-tauri-drag-region>
        <Form
          form={form}
          onFinish={(values) =>
            reset({
              userName: values.userName,
              password: values.password,
              code: values.code,
            })
          }
          style={{ marginTop: 30 }}
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
          >
            <Input placeholder="请输入采控网账号/注册手机号" />
          </Form.Item>
          <Form.Item
            name="code"
            rules={[{ required: true, message: "验证码不能为空" }]}
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
                  if (disabled === false) {
                    let date = 60;
                    setDisabled(true);
                    setCodeText(date + "s");
                    getC({
                      mobile: form.getFieldValue("userName"),
                    });
                    const timer = setInterval(() => {
                      setCodeText(date + "s");
                      if (date <= 0) {
                        clearInterval(timer);
                        setCodeText("获取");
                        setDisabled(false);
                      } else {
                        setDisabled(true);
                        date--;
                      }
                    }, 1000);
                  }
                }}
              >
                {codeText}
              </div>
            </div>
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "密码不能为空" }]}
          >
            <Input.Password placeholder="请设置密码" />
          </Form.Item>
          <Form.Item
            name="passwordConfirm"
            rules={[
              { required: true, message: "密码不能为空" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
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
              确认
            </Button>
          </Form.Item>
        </Form>
      </LoginBox>
    </>
  );
};

export default Reset;

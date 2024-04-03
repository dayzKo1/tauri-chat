import { closeWin, createWin } from "@/utils";
import { useMutation } from "@apollo/client";
import { useRequest } from "ahooks";
import { Button, Form, Input, Modal, message } from "antd";
import { useState } from "react";
import { history, styled, useLocation } from "umi";

import Header from "@/components/Header";

import {
  getRealNameCode,
  realNameAuthentication,
  updateUserInfo,
} from "@/services";

import hasAuthentication from "@/assets/common/authenticationSuccessful.png";

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

const RealNameAuthentication = ({}) => {
  const [form] = Form.useForm();
  const [disabled, setDisabled] = useState(false);
  const [codeText, setCodeText] = useState("获取验证码");
  // 用户信息
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  // 实名认证加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 认证成功模态框
  const [isAuthentication, setIsAuthentication] = useState(false);
  const { userName } = JSON.parse(localStorage.getItem("userInfo") ?? "");
  const location: any = useLocation();

  // 身份证隐私显示格式
  const identityCardFormat = (idNumber: string) => {
    let firstChar = idNumber?.charAt(0);
    let lastChar = idNumber?.charAt(idNumber?.length - 1);
    let middleChars = "*".repeat(idNumber?.length - 2);
    let replacedStr = firstChar + middleChars + lastChar;
    return replacedStr;
  };

  // 姓名隐私显示格式
  const userNameFormat = (name: string) => {
    let lastChar = name?.charAt(name?.length - 1);
    let replacedStr = "*".repeat(name?.length - 1) + lastChar;
    return replacedStr;
  };

  // 验证码 15min有效
  const { runAsync: getC } = useRequest(getRealNameCode, {
    manual: true,
    onSuccess: () => {
      message.success("验证码已发送，15min内有效");
    },
    onError(error: any) {
      if (error.response.data?.errors) {
        message.info(error.response.data?.errors);
      } else {
        message.error("服务器繁忙，请稍后再试！");
      }
    },
  });

  // 修改添加用户基本信息
  const [updateMyInfos] = useMutation(updateUserInfo, {
    onCompleted: () => {
      // message.success("信息修改成功");
      console.log("基本信息添加成功");
    },
    onError: (error: any) => {
      if (error.response.data?.errors) {
        message.info(error.response.data?.errors);
      } else {
        message.error("服务器繁忙，请稍后再试！");
      }
    },
  });

  // 实名认证接口
  const { runAsync: authentication } = useRequest(realNameAuthentication, {
    manual: true,
    onSuccess: () => {
      setIsAuthentication(true);
      setLoading(false);
      updateMyInfos({
        variables: {
          gender: 1,
          nickName: name,
        },
      });
    },
    onError: (error: any) => {
      if (error.response.data?.errors) {
        message.info(error.response.data?.errors);
      } else {
        message.error("服务器繁忙，请稍后再试！");
      }
      setLoading(false);
    },
  });

  const onFinish = (values: any) => {
    setName(values.name);
    setIdNumber(values.idNumber);
    setLoading(true);
    authentication({
      userName: values.name,
      idNumber: values.idNumber,
      code: values.code,
    });
  };

  return (
    <>
      <Header title={"实名认证"} />
      <LoginBox data-tauri-drag-region>
        <Form
          form={form}
          onFinish={(values) => onFinish(values)}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: "请输入姓名",
              },
            ]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item
            name="idNumber"
            rules={[
              {
                required: true,
                pattern: new RegExp(
                  /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/,
                ),
                message: "请输入正确的身份证号",
              },
            ]}
          >
            <Input placeholder="请输入18位身份证号" />
          </Form.Item>
          <Form.Item>
            <Input
              disabled
              defaultValue={`手机号：${userName}`}
              style={{ color: "#333" }}
            />
          </Form.Item>
          <Form.Item
            name="code"
            extra={
              <div
                style={{
                  fontSize: 12,
                  color: "#B5B5B5",
                  fontWeight: "400",
                }}
              >
                点击获取验证码后，您将收到
                [天威诚信]实名认证验证短信，请注意查收。
              </div>
            }
            rules={[{ required: true, message: "验证码不能为空" }]}
          >
            <div>
              <Input placeholder="请输入验证码" style={{ paddingRight: 90 }} />
              <div
                style={{
                  color: "#4E83FD",
                  position: "absolute",
                  width: 70,
                  right: 10,
                  top: 10,
                }}
                onClick={() => {
                  if (disabled === false) {
                    let date = 60;
                    setDisabled(true);
                    setCodeText(date + "s");
                    const formData = new FormData();
                    formData.append("name", form.getFieldValue("name"));
                    getC(formData);
                    const timer = setInterval(() => {
                      setCodeText(date + "s");
                      if (date <= 0) {
                        clearInterval(timer);
                        setCodeText("获取验证码");
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
          <Form.Item>
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              style={{
                height: 40,
                width: "100%",
              }}
            >
              立即认证
            </Button>
          </Form.Item>
        </Form>
      </LoginBox>
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
            src={hasAuthentication}
            alt=""
            style={{ width: "100%", height: "40%" }}
          />
          <div
            style={{
              fontSize: "18px",
              color: "#1D1F24",
              fontWeight: 500,
              marginTop: "10px",
            }}
          >
            恭喜您！认证成功
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "10px 20px 0 20px",
              fontSize: 14,
              fontWeight: "400",
              color: "#484C52",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>姓名</div>
              <div>{isAuthentication && name && userNameFormat(name)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>身份证</div>
              <div>
                {isAuthentication && idNumber && identityCardFormat(idNumber)}
              </div>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              padding: "10px 20px 0 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {location.state?.isLogin ? (
              <Button
                type="primary"
                style={{
                  height: 40,
                  width: "100%",
                  marginTop: "15px",
                }}
                onClick={() => {
                  setIsAuthentication(false);
                  history.back();
                }}
              >
                确定
              </Button>
            ) : (
              <></>
            )}
            {!location.state?.isLogin ? (
              <Button
                type="primary"
                style={{
                  height: 40,
                  width: "100%",
                  marginTop: "15px",
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
                立即进入
              </Button>
            ) : (
              <></>
            )}
            {!location.state?.isLogin ? (
              <Button
                type="link"
                style={{
                  color: "#B5B5B5",
                  marginTop: "10px",
                  marginBottom: "20px",
                }}
                onClick={() => {
                  history.push("/login/loginInfo", { nickName: name });
                  setIsAuthentication(false);
                }}
              >
                完善信息
              </Button>
            ) : (
              <></>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RealNameAuthentication;

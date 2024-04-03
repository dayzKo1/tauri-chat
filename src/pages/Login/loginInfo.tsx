import { ManOutlined, WomanOutlined } from "@ant-design/icons";
import { Button, Form, Input, Radio, Upload, message } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { useEffect, useState } from "react";

import { modifyAvatar, updateUserInfo } from "@/services";
import { closeWin, createWin } from "@/utils";
import { useMutation } from "@apollo/client";
import { useRequest } from "ahooks";
import { styled, useLocation } from "umi";

import camera from "@/assets/common/camera.png";
import defaultAvatar from "@/assets/common/default_customer.png";

const LoginBox = styled.div`
   display: flex;
   text-align: center;
   align-items: center;
   flex-direction: column;
   padding-top: 25px;
   .ant-upload-wrapper.ant-upload-picture-card-wrapper .ant-upload.ant-upload-select {
    width: 64px;
    height: 64px;
    border: none;
    margin-inline-end: 0;
    margin-bottom: 25px;
   }
   .ant-radio-group {
    width:100%;
    .ant-radio-button-wrapper{
      width:50%;
    }
   }
   .ant-form-item {
     width: 240px;
     height：400px;
     margin-bottom: 15px;
     .ant-input {
       height: 40px;
       border: none;
       background: #f7f7f7; 
       text-align: center;
       &::placeholder {
         font-size: 14px;
         color: #bbbbbb;
       }
     }
     .ant-input-affix-wrapper {
       border: none;
       background: #f7f7f7;
     }
     .ant-radio-group {
      padding: 5px;
      background-color: #f7f7f7;
     }
     .ant-radio-button-wrapper:not(:first-child)::before {
      width: 0;
     }
     .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
      border-raduis: 4px;
     }
     .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):first-child {
      border-raduis: 4px;
      border-inline-start: none;
     }
     .ant-radio-button-wrapper {
      border: none;
      background: none;
     }
     .genderSelectBg {
      background: #ffffff;
     }
   }
   .cameraBox {
    position: absolute;
    height: 24px;
    width: 24px;
    border-radius: 45px;
    background-color: #fff;
    top: 76px;
    left: 168px;
    align-items: center;
    justify-content: center;
    box-shadow: 1px 1px 15px rgba(0, 0, 0, 0.2);
  }
`;

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

// 限制图片
const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";

  if (!isJpgOrPng) {
    message.error("请上传 JPG/PNG 文件!");
  }

  const isLt200KB = file.size / 1024 / 1024 / 1024 < 2;

  if (!isLt200KB) {
    message.error("请上传大小为200KB以内的图片!");
  }

  return isJpgOrPng && isLt200KB;
};

const LoginInfo = ({}) => {
  const location: any = useLocation();
  const [form] = Form.useForm();
  const [genderSelect, setGenderSelect] = useState<number>(1);
  // 上传图片加载状态
  const [loading, setLoading] = useState(false);
  console.log(loading); // 后期添加加载组件
  // 登录loading
  const [loginLoading, setLoginLoading] = useState(false);
  // 上传图片地址
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageName, setImageName] = useState("");
  const [imageType, setImageType] = useState<string | undefined>("");

  // 修改用户信息
  const [updateMyInfos] = useMutation(updateUserInfo, {
    onCompleted: () => {
      message.success("基本信息修改成功");
    },
    onError: () => {
      message.error("基本信息修改失败");
    },
  });
  // 修改用户头像
  const { runAsync: modifyAva } = useRequest(modifyAvatar, {
    manual: true,
    onSuccess: () => {
      message.success("头像修改成功");
    },
    onError: () => {
      message.error("头像修改失败");
    },
  });

  const base64ToBlob = (url: any, imageType: string | undefined) => {
    const arr = url.split(",");
    // const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: imageType });
  };

  useEffect(() => {
    form.setFieldsValue({
      nickName: location.state?.nickName,
    });
  }, [location.state?.nickName]);

  // 点击上传图片，修改头像的上传图片状态
  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>,
  ) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    // 图片上传完成
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setImageUrl(url);
        setImageName(info.file.name);
        setImageType(info.file.type);
      });
    }
  };

  // 提交修改信息
  const onFinish = async (values: any) => {
    setLoginLoading(true);
    const { nickName, email, enterprise } = values;
    // 个人信息修改接口
    if (
      nickName !== location.state?.nickName ||
      !genderSelect ||
      email ||
      enterprise
    ) {
      await updateMyInfos({
        variables: {
          nickName,
          gender: genderSelect ? 1 : 0,
          email,
          companyName: enterprise,
        },
      });
    }

    // 头像修改接口
    if (imageUrl) {
      await modifyAva({
        zone: "avatar",
        file: new File([base64ToBlob(imageUrl, imageType)], imageName, {
          type: imageType,
          lastModified: Date.now(),
        }),
      });
    }
    setLoginLoading(false);
    closeWin("login");
    createWin({
      title: "",
      label: "room",
      width: 1400,
      height: 768,
      center: true,
      url: "/room",
    });
  };

  return (
    <LoginBox data-tauri-drag-region>
      <div data-tauri-drag-region>
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          // action="/upload.do"
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          {
            imageUrl ? (
              <img
                src={imageUrl}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                }}
              />
            ) : (
              <img
                src={defaultAvatar}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                }}
              />
            )
            // (
            //   uploadButton
            // )
          }
          <div className="cameraBox">
            <img
              src={camera}
              alt="camera"
              style={{
                width: "14px",
                height: "13px",
              }}
            />
          </div>
        </Upload>
      </div>
      <Form
        data-tauri-drag-region
        form={form}
        initialValues={{}}
        onFinish={onFinish}
      >
        <Form.Item name="nickName">
          <Input placeholder="昵称" />
        </Form.Item>
        <Form.Item name="gender">
          <Radio.Group>
            <Radio.Button
              onClick={() => setGenderSelect(1)}
              value="man"
              className={genderSelect === 1 ? "genderSelectBg" : ""}
            >
              <ManOutlined /> 男
            </Radio.Button>
            <Radio.Button
              onClick={() => setGenderSelect(0)}
              value="woman"
              className={genderSelect === 0 ? "genderSelectBg" : ""}
            >
              <WomanOutlined /> 女
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            {
              // required: true,
              type: "email",
              pattern: new RegExp(
                /^([a-zA-Z\d][\w-]{2,})@(\w{2,})\.([a-z]{2,})(\.[a-z]{2,})?$/,
              ),
              message: "请输入正确的邮箱",
            },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item name="enterprise">
          <Input placeholder="请输入企业名称" />
        </Form.Item>

        <Form.Item>
          <Button
            loading={loginLoading}
            type="primary"
            htmlType="submit"
            className="login-form-button"
            style={{ width: 240, height: 40 }}
          >
            登录
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="link"
            style={{
              width: "30%",
              color: "#B5B5B5",
            }}
            onClick={() => {
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
        </Form.Item>
      </Form>
    </LoginBox>
  );
};

export default LoginInfo;

import cameraSelect from "@/assets/common/cameraSelect.png";
import defaultAvatar from "@/assets/common/default_customer.png";
import {
  getUserInfo,
  modifyAvatar,
  realNameInfoApi,
  updateUserInfo,
} from "@/services";
import { closeWin, random } from "@/utils";
import { useMutation, useQuery } from "@apollo/client";
import { useRequest } from "ahooks";
import { Avatar, Button, Form, Input, Select, Upload, message } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import { styled } from "umi";
const { Option } = Select;

const LoginBox = styled.div`
  height: 100vh;
  padding: 40px 30px 30px;
  display: flex;
  text-align: center;
  align-items: center;
  flex-direction: column;
  background: #f2f2f2;
  padding-bottom: 45px;
  .ant-upload-wrapper.ant-upload-picture-card-wrapper
    .ant-upload.ant-upload-select {
    width: 64px;
    height: 64px;
    border: none;
    margin-inline-end: 0;
  }
  .ant-form-item {
    text-align: start;
    .ant-input {
      height: 40px;
      border: none;
      background: #fff;
      padding-left: 100px;
      &::placeholder {
        font-size: 14px;
        color: #bbbbbb;
      }
    }
    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
      border: none;
      padding-left: 100px;
      padding-top: 5px;
      height: 40px;
    }
    .ant-btn-primary {
      box-shadow: none;
    }
  }
  .ant-avatar > img {
    border-radius: 50%;
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
    message.error("You can only upload JPG/PNG file!");
  }

  const isLt200KB = file.size / 1024 / 1024 / 1024 < 2;

  if (!isLt200KB) {
    message.error("请上传大小为200KB以内的图片!");
  }

  return isJpgOrPng && isLt200KB;
};

const Basic = ({}) => {
  const [form] = Form.useForm();
  const rcUserId = JSON.parse(localStorage.getItem("userInfo") ?? "")?.rcUserId;
  const baseUrl = `${OSS_URL}/ckmro/apps/avatar/`;
  // 初始图片地址
  const initialImageUrl = `${baseUrl}${rcUserId}`;
  // 上传图片加载状态
  const [loading, setLoading] = useState(false);
  console.log("loading", loading);

  // 修改头像loading
  const [avatarLoading, setAvatarLoading] = useState(false);
  // 上传图片地址
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [imageName, setImageName] = useState("");
  const [imageType, setImageType] = useState<string | undefined>("");
  // 个人信息
  const [myInfo, setMyInfo] = useState<any>({});
  // 是否认证
  const [isAuthentication, setIsAuthentication] = useState(false);
  // 标题样式
  const titleStyle: any = {
    position: "absolute",
    top: 152,
    left: 45,
    fontSize: "14px",
    letterSpacing: "1px",
  };

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

  // 获取用户信息
  const {} = useQuery(getUserInfo, {
    variables: {
      rcUserId,
    },
    onCompleted: (res) => {
      let { nickName, gender, email, userName } = res?.users?.getRcUser ?? "";
      setMyInfo(res?.users?.getRcUser);
      form.setFieldsValue({
        nickName,
        gender: gender === 0 ? "woman" : gender === 1 ? "man" : "",
        email,
        phone: userName,
      });
    },
  });
  // 修改用户信息
  const [updateMyInfos, { loading: infoLoading }] = useMutation(
    updateUserInfo,
    {
      onCompleted: () => {
        message.success("信息修改成功");
      },
      onError: (error: any) => {
        if (error.response?.data?.errors) {
          message.info(error.response?.data?.errors);
        } else {
          message.error("服务器繁忙，请稍后再试！");
        }
      },
    },
  );
  // 修改用户头像
  const { runAsync: modifyAva } = useRequest(modifyAvatar, {
    manual: true,
    onSuccess: () => {
      setAvatarLoading(false);
      message.success("头像修改成功");
    },
    onError: (error: any) => {
      setAvatarLoading(false);
      if (error.response?.data?.errors) {
        message.info(error.response?.data?.errors);
      } else {
        message.error("头像修改失败,请稍后再试");
      }
    },
  });
  // 获取实名认证信息接口
  const { runAsync: realNameInfo } = useRequest(realNameInfoApi, {
    manual: true,
    onSuccess: (res) => {
      setIsAuthentication(res?.data?.userName ? true : false);
      form.setFieldsValue({
        idCard: res?.data?.userName
          ? `${userNameFormat(res?.data?.userName)}  ${identityCardFormat(
              res?.data?.idNumber,
            )}`
          : "无",
      });
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        message.info(error.response?.data?.errors);
      } else {
        message.error("服务器繁忙，请稍后再试！");
      }
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
    realNameInfo();
  }, []);

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

  const onGenderChange = (value: string) => {
    switch (value) {
      case "male":
        form.setFieldsValue({ note: "Hi, man!" });
        break;
      case "female":
        form.setFieldsValue({ note: "Hi, lady!" });
        break;
      default:
    }
  };

  // 提交修改信息
  const onFinish = async (values: any) => {
    const { nickName, gender, email } = values;
    if (
      !(
        myInfo?.nickName === nickName &&
        myInfo?.gender === (gender === "woman" ? 0 : 1) &&
        myInfo?.email === email
      )
    ) {
      const genderValue = gender === "man" ? 1 : gender === "woman" ? 0 : "";
      // 个人信息修改接口
      await updateMyInfos({
        variables: {
          params: {
            nickName: nickName,
            gender: genderValue,
            email: email,
          },
        },
      });
    }
    if (!(imageUrl === initialImageUrl || imageUrl === defaultAvatar)) {
      setAvatarLoading(true);
      const formData: any = new FormData();
      formData.append("zone", "avatar");
      formData.append(
        "file",
        base64ToBlob(imageUrl, imageType),
        imageName + Date.now() + "." + imageType,
      );
      // 头像修改接口
      modifyAva(formData);
      // modifyAva({
      //   zone: "avatar",
      //   file: new File([base64ToBlob(imageUrl, imageType)], imageName, {
      //     type: imageType,
      //     lastModified: Date.now(),
      //   }),
      // });
      setTimeout(() => closeWin("basic"), 1000);
    }
  };

  return (
    <LoginBox>
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        // action="/upload.do"
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        <Avatar
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            background: "#f2f2f2",
          }}
          key={random(5)}
          size={36}
          src={imageUrl}
          shape="square"
          onError={(): any => {
            setImageUrl(defaultAvatar);
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 41,
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: "rgba(0,0,0,.2)",
          }}
        ></div>
        <img
          src={cameraSelect}
          alt=""
          style={{ position: "absolute", top: 65 }}
        />
      </Upload>
      <Form
        form={form}
        initialValues={{}}
        onFinish={onFinish}
        style={{
          width: "100%",
          paddingTop: "30px",
        }}
      >
        <Form.Item
          name="nickName"
          rules={[{ required: true, message: "姓名不能为空" }]}
        >
          <Input placeholder="昵称" />
        </Form.Item>
        <div style={titleStyle}>姓名</div>
        <Form.Item
          name="gender"
          rules={[{ required: true, message: "性别不能为空" }]}
        >
          <Select placeholder="性别" onChange={onGenderChange} allowClear>
            <Option value="man">男</Option>
            <Option value="woman">女</Option>
          </Select>
        </Form.Item>
        <div style={{ ...titleStyle, top: 215 }}>性别</div>
        <Form.Item name="idCard">
          <Input placeholder="身份信息" disabled style={{ color: "#333" }} />
        </Form.Item>
        <div style={{ ...titleStyle, top: 280 }}>身份信息</div>
        <div
          style={{
            position: "absolute",
            top: 280,
            right: 40,
            fontSize: "14px",
            letterSpacing: "1px",
            color: isAuthentication ? "#27C840" : "#EA3222",
          }}
        >
          {isAuthentication ? "已认证" : "未认证"}
        </div>
        <Form.Item name="phone">
          <Input placeholder="手机号" disabled />
        </Form.Item>
        <div style={{ ...titleStyle, top: 344 }}>手机号</div>
        <Form.Item
          name="email"
          rules={[
            {
              type: "email",
              message: "请输入正确的邮箱",
            },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <div style={{ ...titleStyle, top: 408 }}>邮箱</div>

        <Form.Item
          style={{ display: "flex", justifyContent: "center", marginTop: 40 }}
        >
          <Button
            type="primary"
            className="login-form-button"
            style={{
              width: 100,
              height: 38,
              background: "#fff",
              color: "#4E83FD",
              marginRight: 15,
            }}
            onClick={() => closeWin("basic")}
          >
            取消
          </Button>
          <Button
            loading={infoLoading || avatarLoading}
            type="primary"
            htmlType="submit"
            className="login-form-button"
            style={{ width: 100, height: 38 }}
          >
            保存
          </Button>
        </Form.Item>
      </Form>
    </LoginBox>
  );
};

export default Basic;

import { request } from "umi";

const { token } = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
// 登录
export function login(data: any) {
  return request("/api/auth/login", {
    method: "POST",
    data,
  });
}

// 注册
export function register(data: any) {
  return request("/api/account/register", {
    method: "POST",
    data,
  });
}

// 检查账号是否注册
export function checkIsRegister(params: any) {
  return request(`/api/account`, {
    method: "GET",
    params,
  });
}

// 获取验证码
export function getCode(params: any) {
  return request("/api/account/vcode", {
    method: "GET",
    params,
  });
}

// 获取实名认证短信验证码
export function getRealNameCode(data: any) {
  return request(`/api/v1/account/sendSmsCode`, {
    method: "POST",
    "Content-Type": "application/x-www-form-urlencoded",
    data,
  });
}

// 获取实名认证信息
export function realNameInfoApi() {
  return request(`/api/v1/account/cert`, {
    method: "GET",
    "Content-Type": "application/x-www-form-urlencoded",
  });
}

// 实名认证校验
export function realNameAuthentication(data: any) {
  return request(`/api/v1/account/createCertProfile`, {
    method: "POST",
    "Content-Type": "multipart/form-data",
    data,
  });
}

// 解析excel文件
export function parseFile({ type, data }: any) {
  let currentType = "";
  if (typeof data === "string") {
    currentType = "text";
  } else {
    switch (type.split("/")[1]) {
      case "pdf":
        currentType = "pdf";
        break;
      case "png":
        currentType = "image";
        break;
      case "jpeg":
        currentType = "image";
        break;
      default:
        currentType = "excel";
    }
  }
  return request(`/api/parse/${currentType}`, {
    method: "POST",
    "Content-Type": type,
    data: data,
  });
}

// 重置密码
export function resetPassword(data: any) {
  return request(`/api/account/forget`, {
    method: "POST",
    data,
  });
}

// 下载报价单
export function downloadFile({ type, data }: any) {
  return request(`/api/download/exportInquiry/${type}`, {
    method: "POST",
    responseType: "blob",
    data,
    headers: { Authorization: `Bearer ${token}` },
  });
}

// 修改头像
export function modifyAvatar(data: any) {
  return request(`/api/upload`, {
    method: "POST",
    "Content-Type": "multipart/form-data",
    data,
  });
}

// 预览报价单
export function previewOffer({ id }: any) {
  return request(`/api/preview/exportInquiry/${id}`, {
    method: "GET",
    responseType: "blob",
  });
}

// 企业认证——上传营业执照文件
export function uploadFs(data: any) {
  return request("/api/upload/fs", {
    method: "POST",
    "Content-Type": "multipart/form-data",
    data,
  });
}

// 预览企业认证图片
export function previewCompanyFs({ id }: any) {
  return request(`/api/download/fs/${id}`, {
    method: "GET",
    responseType: "blob",
  });
}

// 获取快递公司
export function getExpress(params: any) {
  return request(`/api/v1/common/express/1`, {
    method: "GET",
    params,
  });
}

// 获取物流公司
export function getLogistics(params: any) {
  return request(`/api/v1/common/express/2`, {
    method: "GET",
    params,
  });
}

// 获取物流公司
export function getLogisticsCompanyList(name: any) {
  return request(`/api/v1/common/express/1?name=${name}`, {
    method: "GET",
  });
}

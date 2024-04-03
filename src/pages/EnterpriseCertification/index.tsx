import uploadIcon from "@/assets/common/upload.png";
import Loading from "@/components/Loading";
import { previewCompanyFs, uploadFs } from "@/services";
import {
  addOrUpdateAuthentication,
  getBankList,
  getCityList,
  getCompanies,
} from "@/services/Company";
import { closeWin } from "@/utils";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { styled } from "@umijs/max";
import { useRequest } from "ahooks";
import type { RadioChangeEvent } from "antd";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Upload,
  message,
} from "antd";
import type { SearchProps } from "antd/es/input/Search";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import { useSearchParams } from "umi";

const { Search } = Input;

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

// 限制图片
const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("请上传JPG/PNG图片!");
  }
  const isLt6MB = file.size / 1024 / 1024 < 6;
  if (!isLt6MB) {
    message.error("请上传大小为6MB以内的图片!");
  }
  return isJpgOrPng && isLt6MB;
};

const EnterpriseBox = styled.div`
  height: 100vh;
  padding: 40px 30px 30px;
  background: #f2f2f2;
  .spaceBox {
    width: 100%;
    position: relative;
  }
  .ant-form-item {
    text-align: start;
    .ant-form-item-label > label::after {
      content: none;
    }
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
    .ant-upload-wrapper.ant-upload-picture-card-wrapper
      .ant-upload.ant-upload-select,
    .ant-upload-wrapper.ant-upload-picture-circle-wrapper
      .ant-upload.ant-upload-select {
      width: 400px;
      height: 180px;
    }
    .ant-upload-wrapper.ant-upload-picture-card-wrapper
      .ant-upload.ant-upload-select,
    .ant-upload-wrapper.ant-upload-picture-circle-wrapper
      .ant-upload.ant-upload-select {
      background-color: #ffffff;
      border: 1px solid #4e83fd;
    }
    .ant-checkbox + span {
      padding-inline-end: 0;
    }
    .ant-upload-wrapper.ant-upload-picture-card-wrapper
      .ant-upload-list.ant-upload-list-picture-card
      .ant-upload-list-item-container {
      width: 400px;
      height: 180px;
    }
    .ant-upload-wrapper
      .ant-upload-list.ant-upload-list-picture
      .ant-upload-list-item,
    .ant-upload-wrapper
      .ant-upload-list.ant-upload-list-picture-card
      .ant-upload-list-item,
    .ant-upload-wrapper
      .ant-upload-list.ant-upload-list-picture-circle
      .ant-upload-list-item {
      padding: 0;
    }
    .ant-upload-wrapper.ant-upload-picture-card-wrapper
      .ant-upload-list.ant-upload-list-picture-card
      .ant-upload-list-item::before {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
  }
`;

const TitleBox = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 50px;
`;

const ValueBox = styled.div`
  color: #262626;
  font-size: 14px;
  font-weight: 400;
`;

export default function EnterpriseCertificationView() {
  const [search] = useSearchParams();
  // 是否认证
  const authentication = search.get("authentication");
  // 初始营业执照文件名
  const [initLicenseFiles, setInitLicenseFiles] = useState<string[]>([]);
  const [form] = Form.useForm();
  // 上传图片加载状态
  const [UploadImgLoading, setUploadImgLoading] = useState(false);
  console.log("loading", UploadImgLoading);

  // 上传图片地址
  const [imageUrl, setImageUrl] = useState<string>("");
  // 预览
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [archivesId, setArchivesId] = useState(""); // archives ID
  const [companyId, setCompanyId] = useState(""); // 企业ID
  const [licenseId, setLicenseId] = useState(""); // 企业认证文件ID
  const [licenseFiles, setLicenseFiles] = useState<{
    files: string[];
    filesContentType: string[];
  }>({
    files: [],
    filesContentType: [],
  }); // 文件id or 文件名 和 文件扩展名
  // 地址全部数据
  const [addressList, setAddressList] = useState([]);
  // 省数据
  const [provinceOptions, setProvinceOptions] = useState<any[]>([]);
  // 市数据
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  // 区（县）数据
  const [areaOptions, setAreaOptions] = useState<any[]>([]);
  // 银行model
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 选择热门银行
  const [selectHotBank, setSelecHotBank] = useState("");
  // 开户银行id
  const [bankId, setBankId] = useState("");
  // 热门银行数据
  const [hotBank, setHotBank] = useState<any[]>([]);
  // 搜索银行数据
  const [searchBankList, setSearchBankList] = useState<any[]>([]);
  // 认证规则model
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  // 审核未通过Modal
  const [isNoPassModal, setIsNoPassModal] = useState(false);

  // 标题样式
  const titleStyle: any = {
    position: "absolute",
    top: 254,
    left: 45,
    fontSize: "14px",
    letterSpacing: "1px",
  };

  // 预览企业认证图片
  const { runAsync: preview } = useRequest(previewCompanyFs, {
    manual: true,
    onSuccess: (res: any) => {
      // 图片地址：
      setImageUrl(window.URL.createObjectURL(res));
      setFileList([
        {
          uid: "",
          name: "",
          url: window.URL.createObjectURL(res),
        },
      ]);
    },
    onError: () => {
      message.error("数据异常");
    },
  });

  // 上传营业执照文件
  const { runAsync: uploadFile } = useRequest(uploadFs, {
    manual: true,
    onError: () => {
      message.error("图片上传失败，请稍后再试");
    },
  });

  // 获取企业认证信息接口
  const { data, loading: queryLoading } = useQuery(getCompanies, {
    fetchPolicy: "no-cache",
    onCompleted: async (res: any) => {
      // 预览企业认证图片接口
      await preview({ id: res?.users?.companies?.license?.files[0] });
      form.setFieldsValue({
        companyName: res.users?.companies?.company?.name || "",
        province:
          res?.users?.companies?.archives?.viewProvinceRegister.code || "",
        city: res?.users?.companies?.archives?.viewCityRegister.code || "",
        area: res?.users?.companies?.archives?.viewAreaRegister.code || "",
        detailedAddress: res?.users?.companies?.archives?.address || "",
        licenseNo: res?.users?.companies?.company?.licenseNo,
        bankName:
          res?.users?.companies?.archives?.bankContents?.[0]?.viewBank?.name ||
          "",
        bankBranch:
          res?.users?.companies?.archives?.bankContents?.[0]?.bankBranch || "",
        bankAccount:
          res?.users?.companies?.archives?.bankContents?.[0]?.bankAccount || "",
      });
      // 用户地址信息
      const cityArr: { label: string; value: string }[] = [];
      const areaArr: { label: string; value: string }[] = [];
      addressList.forEach((item: any) => {
        if (
          item.value ===
          res?.users?.companies?.archives?.viewProvinceRegister.code
        ) {
          item?.children?.forEach((item1: any) => {
            let cityObj = {
              label: item1.label,
              value: item1.value,
              children: item1.children,
            };
            cityArr.push(cityObj);
            if (
              item1.value ===
              res?.users?.companies?.archives?.viewCityRegister.code
            ) {
              item1?.children?.forEach((item2: any) => {
                let areaObj = {
                  label: item2.label,
                  value: item2.value,
                  children: item2.children,
                };
                areaArr.push(areaObj);
              });
            }
          });
        }
      });
      setCityOptions(cityArr);
      setAreaOptions(areaArr);
      // 已认证初始银行单选数据
      setSelecHotBank(
        res?.users?.companies?.archives?.bankContents?.[0]?.viewBank?.code +
          res?.users?.companies?.archives?.bankContents?.[0]?.viewBank?.name,
      );
      setArchivesId(res?.users?.companies?.archives?.id);
      setCompanyId(res?.users?.companies?.company?.id);
      setLicenseId(res?.users?.companies?.license?.id);
      setLicenseFiles({
        files: res?.users?.companies?.license?.files,
        filesContentType: [],
      });
      setInitLicenseFiles(res?.users?.companies?.license?.files);
      setBankId(
        res?.users?.companies?.archives?.bankContents?.[0]?.viewBank?.code,
      );
    },
    onError: (err: any) => {
      const errInfo = JSON.parse(JSON.stringify(err));
      if (errInfo?.graphQLErrors?.[0]?.extensions?.isThrow) {
        message.error(errInfo.message);
      } else {
        message.error("企业认证信息获取失败,请稍后重试");
      }
    },
  });

  // 获取城市列表数据接口
  useQuery(getCityList, {
    onCompleted: (res) => {
      const provinceArr: { label: string; value: string }[] = [];
      setAddressList(res?.miscellaneous?.treeCity);
      res?.miscellaneous?.treeCity?.forEach((item: any) => {
        let provinceObj = {
          label: item.label,
          value: item.value,
          children: item.children,
        };
        provinceArr.push(provinceObj);
      });
      setProvinceOptions(provinceArr);
    },
  });

  // 添加或者更新认证信息接口
  const [addOrUpdate, { loading: authenticationLoading }] = useMutation(
    addOrUpdateAuthentication,
  );
  // 第一次认证审核状态：CREATED("新建"),WAIT("待审核"),NOPASS("审核未通过"),NORMAL("正常")
  let auditStatus = data?.users?.companies?.status;

  useEffect(() => {
    if (auditStatus === "NOPASS") {
      setIsNoPassModal(true);
    }
  }, [auditStatus]);

  // 获取银行列表数据接口
  const [getBankListFun, { loading: bankListLoading }] =
    useLazyQuery(getBankList);

  // 搜索银行列表数据接口
  const [searchBankListFun, { loading: searchBankListLoading }] =
    useLazyQuery(getBankList);

  // 省选择
  const provinceChange = (value: string) => {
    const cityArr: { label: string; value: string }[] = [];
    const areaArr: { label: string; value: string }[] = [];
    provinceOptions.forEach((item: any) => {
      if (item.value === value) {
        item?.children?.forEach((item1: any) => {
          let cityObj = {
            label: item1.label,
            value: item1.value,
            children: item1.children,
          };
          cityArr.push(cityObj);
          if (item1.value === cityArr?.[0]?.value) {
            item1?.children?.forEach((item1: any) => {
              let areaObj = { label: item1.label, value: item1.value };
              areaArr.push(areaObj);
            });
          }
        });
      }
    });
    form.setFieldsValue({
      city: cityArr?.[0]?.value,
      area: areaArr[0]?.value,
    });
    setCityOptions(cityArr);
    setAreaOptions(areaArr);
  };
  // 市选择
  const cityChange = (value: string) => {
    const areaArr: { label: string; value: string }[] = [];
    cityOptions.forEach((item: any) => {
      if (item.value === value) {
        item?.children?.forEach((item1: any) => {
          let areaObj = { label: item1.label, value: item1.value };
          areaArr.push(areaObj);
        });
      }
    });
    form.setFieldsValue({
      area: areaArr[0].value,
    });
    setAreaOptions(areaArr);
  };

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

  // 点击上传图片，修改头像的上传图片状态
  const handleChange: UploadProps["onChange"] = async (
    info: UploadChangeParam<UploadFile>,
  ) => {
    if (info.file.originFileObj) {
      setFileList(info.fileList);
      getBase64(info.file.originFileObj as RcFile, async (url) => {
        setUploadImgLoading(false);
        setImageUrl(url);
        const formData = new FormData();
        formData.append(
          "file",
          base64ToBlob(url, info.file.type),
          "企业认证-" + Date.now() + "." + info.file.type?.split("/")[1],
        );
        // 上传营业执照接口
        const uploadFileData = await uploadFile(formData);
        if (uploadFileData.success === false) {
          message.error("请重新上传");
        } else {
          setLicenseFiles({
            files: [uploadFileData?.data?.files],
            filesContentType: [uploadFileData?.data?.filesContentType],
          });
        }
      });
    }
  };

  // 热门银行列表数据
  const showModal = async () => {
    getBankListFun({
      onCompleted: (res: any) => {
        let hotBankArr: any[] = [];
        res?.miscellaneous?.listBank?.hot.forEach((item: any) => {
          let obj = { label: item.name, value: item.code + item.name };
          hotBankArr.push(obj);
        });
        setHotBank(hotBankArr);
      },
    });
    setIsModalOpen(true);
  };

  // 银行选择
  const onChangeBank = (e: RadioChangeEvent) => {
    const regex1 = /\d+/g;
    const numbers = e.target.value.match(regex1)[0];
    setBankId(numbers);
    const regex2 = /[^\d]+/g;
    const nonNumbers = e.target.value.match(regex2)[0];
    setSelecHotBank(e.target.value);
    form.setFieldsValue({
      bankName: nonNumbers || "",
    });
    setIsModalOpen(false);
  };

  // 银行搜索
  const onSearch: SearchProps["onSearch"] = (value) => {
    let word = value.replace(/\s/g, "");
    if (word) {
      searchBankListFun({
        variables: { word: word },
        onCompleted: (res) => {
          let searchBankArr: any[] = [];
          res?.miscellaneous?.listBank?.banks.forEach((item: any) => {
            let obj = { label: item.name, value: item.code + item.name };
            searchBankArr.push(obj);
          });
          setSearchBankList(searchBankArr);
        },
      });
    } else {
      setSearchBankList([]);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <div style={{ cursor: "pointer" }}>
        <img
          src={uploadIcon}
          style={{ width: "42px", height: "38px" }}
          alt=""
        />
        <div
          style={{
            marginTop: 8,
            fontSize: "16px",
            fontWeight: "400",
            color: "#4E83FD",
          }}
        >
          上传营业执照
        </div>
      </div>
    </button>
  );

  const handlePreview = async (file: any) => {
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1),
    );
  };

  const btns: any = {
    CREATED: "提交审核",
    NOPASS: "提交审核",
    WAIT: "审核中，重新提交",
    NORMAL: "保存",
  };

  const onFinish = (values: any) => {
    if (!authentication && !imageUrl) {
      message.error("请上传营业执照");
      return;
    } else {
      let files: any =
        initLicenseFiles?.[0] === licenseFiles.files?.[0]
          ? null
          : licenseFiles.files;
      let filesContentType: any =
        initLicenseFiles?.[0] === licenseFiles.files?.[0]
          ? null
          : licenseFiles.filesContentType;
      let id =
        initLicenseFiles?.[0] === licenseFiles.files?.[0] ? null : licenseId;

      let authenticationList = {
        archives: {
          address: values.detailedAddress,
          area: values.area,
          bankContents: {
            bankAccount: values.bankAccount,
            bankBranch: values.bankBranch,
            bankId: bankId || null,
          },
          city: values.city,
          id: archivesId || null,
          province: values.province,
        },
        company: {
          id: companyId || null,
          licenseNo: values.licenseNo,
          name: values.companyName,
        },
        license: files
          ? {
              filesContentType,
              files,
              id: id || null,
            }
          : null,
      };
      // console.log("authenticationList", authenticationList);
      // 提交认证信息提示标识：
      let tipType = "";
      if (initLicenseFiles?.[0] === licenseFiles.files?.[0]) {
        tipType = "企业信息更新成功！";
      } else if (
        authentication &&
        initLicenseFiles?.[0] !== licenseFiles.files?.[0]
      ) {
        tipType = "营业执照更新成功，待采控网审核！";
      } else if (!authentication) {
        tipType = "信息提交成功，待采控网审核！";
      }
      addOrUpdate({
        variables: {
          params: authenticationList,
        },
        onCompleted: (res) => {
          if (res.rcUser.updatePropsByCompany === "OK") {
            message.success(tipType);
          }
        },
        onError: () => {
          message.error("提交失败,请稍后重试");
        },
      });
    }
  };

  return (
    <EnterpriseBox>
      {queryLoading ? (
        <Loading size={"large"} />
      ) : (
        <Form
          form={form}
          // initialValues={{ province: [{ label: "北京", value: "110000" }] }}
          onFinish={onFinish}
          style={{
            width: "100%",
          }}
        >
          <Form.Item name="licenseFiles" style={{ marginLeft: "100px" }}>
            <Upload
              action="/upload.do"
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onRemove={() => {
                setFileList([]);
                setImageUrl("");
              }}
              onChange={handleChange}
              beforeUpload={beforeUpload}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>
          <Modal
            open={previewOpen}
            title={previewTitle}
            footer={null}
            onCancel={() => setPreviewOpen(false)}
          >
            <img alt="example" style={{ width: "100%" }} src={imageUrl} />
          </Modal>
          <div style={{ ...titleStyle, top: 36, left: 30 }}>营业执照</div>
          <Space.Compact className="spaceBox">
            <Form.Item
              name="companyName"
              rules={[{ required: true, message: "企业名称不能为空" }]}
              style={{ width: "100%" }}
            >
              <Input
                placeholder="企业名称"
                disabled={auditStatus === "NORMAL"}
              />
            </Form.Item>
            <div style={{ ...titleStyle, top: 10, left: 15, zIndex: 2 }}>
              企业名称
            </div>
          </Space.Compact>
          <Space.Compact className="spaceBox">
            <Form.Item
              style={{ width: "32%", marginRight: "2%" }}
              name="province"
              rules={[{ required: true, message: "省级不能为空" }]}
            >
              <Select
                placeholder="省"
                options={provinceOptions}
                onChange={provinceChange}
              ></Select>
            </Form.Item>
            <div style={{ ...titleStyle, top: 9, left: 15, zIndex: 2 }}>
              省份
            </div>
            <Form.Item
              style={{ width: "32%", marginRight: "2%" }}
              name="city"
              rules={[{ required: true, message: "市级不能为空" }]}
            >
              <Select
                placeholder="市"
                options={cityOptions}
                onChange={cityChange}
              ></Select>
            </Form.Item>
            <div style={{ ...titleStyle, top: 9, left: "36.5%", zIndex: 2 }}>
              市
            </div>
            <Form.Item
              style={{ width: "32%" }}
              name="area"
              rules={[{ required: true, message: "区（县）级不能为空" }]}
            >
              <Select placeholder="区（县）" options={areaOptions}></Select>
            </Form.Item>
            <div style={{ ...titleStyle, top: 9, left: "70.5%", zIndex: 2 }}>
              区（县）
            </div>
          </Space.Compact>
          <Space.Compact className="spaceBox">
            <Form.Item
              name="detailedAddress"
              rules={[{ required: true, message: "详细地址不能为空" }]}
              style={{ width: "100%" }}
            >
              <Input placeholder="详细地址" style={{ color: "#333" }} />
            </Form.Item>
            <div style={{ ...titleStyle, top: 10, left: 15, zIndex: 2 }}>
              详细地址
            </div>
          </Space.Compact>
          <Space.Compact className="spaceBox">
            <Form.Item
              name="licenseNo"
              rules={[
                { required: true, message: "企业税号不能为空" },
                { pattern: /^[a-zA-Z0-9]+$/, message: "手企业税号格式不正确" },
              ]}
              style={{ width: "100%" }}
            >
              <Input
                placeholder="企业税号"
                disabled={auditStatus === "NORMAL"}
              />
            </Form.Item>
            <div style={{ ...titleStyle, top: 10, left: 15, zIndex: 2 }}>
              企业税号
            </div>
          </Space.Compact>
          <Space.Compact className="spaceBox">
            <Form.Item
              style={{ width: "32%", marginRight: "2%" }}
              name="bankName"
              rules={[{ required: true, message: "银行不能为空" }]}
            >
              <Input placeholder="银行" onClick={() => showModal()} />
            </Form.Item>
            <div style={{ ...titleStyle, top: 9, left: 15, zIndex: 2 }}>
              银行信息
            </div>
            <Form.Item
              style={{ width: "32%", marginRight: "2%" }}
              name="bankBranch"
              rules={[{ required: true, message: "支行不能为空" }]}
            >
              <Input placeholder="支行" />
            </Form.Item>
            <div style={{ ...titleStyle, top: 10, left: "36.5%", zIndex: 2 }}>
              支行
            </div>
            <Form.Item
              style={{ width: "32%" }}
              name="bankAccount"
              rules={[
                { required: true, message: "银行卡号不能为空" },
                { pattern: /^[1-9]\d{12,19}$/, message: "银行卡号格式不正确" },
              ]}
            >
              <Input placeholder="银行卡号" />
            </Form.Item>
            <div style={{ ...titleStyle, top: 10, left: "70.5%", zIndex: 2 }}>
              银行卡号
            </div>
          </Space.Compact>
          <Form.Item
            name="agree"
            valuePropName="checked"
            style={{ textAlign: "center" }}
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error("请阅读并同意采控网认证规则")),
              },
            ]}
          >
            <Checkbox style={{ lineHeight: "32px" }}>
              已阅读并同意
              <span
                style={{
                  color: "#4E83FD",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setRuleModalOpen(true);
                }}
              >
                采控网认证规则
              </span>
            </Checkbox>
          </Form.Item>
          <Form.Item
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
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
              onClick={() => closeWin("enterpriseCertification")}
            >
              取消
            </Button>
            <Button
              loading={authenticationLoading}
              type="primary"
              htmlType="submit"
              className="login-form-button"
              style={{ width: 100, height: 38 }}
            >
              {btns[auditStatus] || btns["NORMAL"]}
            </Button>
          </Form.Item>
        </Form>
      )}
      <Modal
        wrapClassName="bank-modal"
        title="选择开户银行"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "400",
            color: "#4E83FD",
          }}
        >
          热门银行：
        </div>
        <Loading spinning={bankListLoading && !hotBank.length} />
        {!bankListLoading || hotBank.length ? (
          <Radio.Group
            style={{ marginTop: 10, marginBottom: 10 }}
            onChange={onChangeBank}
            value={selectHotBank}
            options={hotBank}
          ></Radio.Group>
        ) : (
          <></>
        )}
        <Space.Compact>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "400",
              color: "#4E83FD",
            }}
          >
            关键字搜索：
          </div>
          <Search
            style={{ width: "70%" }}
            placeholder="请输入关键词搜索"
            allowClear
            enterButton="搜索"
            onSearch={onSearch}
          />
        </Space.Compact>
        <Loading spinning={searchBankListLoading} />
        <Radio.Group
          style={{ marginTop: 10, marginBottom: 10 }}
          onChange={onChangeBank}
          value={selectHotBank}
          options={searchBankList}
        ></Radio.Group>
      </Modal>
      <Modal
        open={isNoPassModal}
        centered
        width={300}
        title={"系统提示"}
        cancelText="取消"
        okText="确定"
        onCancel={() => setIsNoPassModal(false)}
        onOk={() => setIsNoPassModal(false)}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "400",
            color: "#4E83FD",
          }}
        >
          企业认证审核未通过，请重新提交!
        </div>
      </Modal>
      <Modal
        wrapClassName="rule-modal"
        open={ruleModalOpen}
        centered
        cancelText="取消"
        okText="确定"
        onOk={() => {
          setRuleModalOpen(false);
          form.setFieldsValue({
            agree: true,
          });
        }}
        onCancel={() => setRuleModalOpen(false)}
      >
        <div style={{ height: 500 }}>
          <TitleBox style={{ textAlign: "center" }}>
            采控网账户认证规则
          </TitleBox>
          <div style={{ height: "90%", overflow: "scroll", padding: "0 10px" }}>
            <TitleBox>一、 概述</TitleBox>
            <ValueBox>
              在本规则中，“您”指依据本规则的采控网注册用户；
              “服务”指本网站依照本规则提供的所有相关服务；“本公司”指福建采控网络科技有限公司。
            </ValueBox>
            <ValueBox>
              您确认，在您注册成为采控网用户并接受本公司的服务，或您以其他本公司允许的方式实际使用本公司服务前，您已充分阅读、理解并接受本规则的全部内容，一旦您使用采控网服务，即表示您同意遵循本规则之所有约定。
            </ValueBox>
            <ValueBox>
              <span style={{ fontWeight: "600" }}>
                采控网提醒您认真阅读、充分理解本规则各条款，特别是以粗体标注部分。
              </span>
              如您不同意接受本规则的任意内容，或者无法准确理解相关条款含义的，请不要进行后续操作。如果您对本规则的条款有疑问的，请通过本公司客服渠道进行询问，本公司将向您解释条款内容。
            </ValueBox>

            <TitleBox>二、 关于认证服务的理解与认同</TitleBox>
            <ValueBox>
              1、在您申请认证前，您必须先注册成为采控网用户。采控网有权采取各种必要手段（包括但不限于向第三方确认）对您的身份进行识别。但在目前的技术水平下采控网所能采取的方法有限，且在网络上进行用户身份识别存在一定的困难，因此，采控网对完成认证的用户身份的准确性和绝对真实性不做任何保证。
            </ValueBox>
            <ValueBox>
              2、您同意，采控网有权记录并保存您在认证中提供的信息和采控网向其他合作方获取的信息，亦有权根据本规则的约定向您或第三方提供您是否通过认证以及您的认证信息。
            </ValueBox>
            <ValueBox>
              3、您同意，您有义务按照采控网的要求提供本人的真实个人资料与所任职的企业资料进行注册及认证，并保证诸如电子邮件地址、联系电话、联系地址、邮政编码、企业营业执照、品牌代理/经销证书等信息的有效性，同时也有义务在相关资料发生变更时及时通知采控网进行更新。若您提供任何错误、不实、过时或不完整资料，或采控网有合理理由怀疑该资料为错误、不实、过时或不完整的，采控网有权暂停或终止对您提供服务，或限制您采控网账户的部分或全部功能，采控网对此不承担任何责任
            </ValueBox>
            <ValueBox>
              4、除非本规则另有约定，一旦您的采控网账户完成了认证，相关身份信息和认证结果将不能由您本人进行任何修改；如果在完成认证后，您的身份信息发生了变更，您应按采控网要求提供资料并由本公司审核后进行更新。
            </ValueBox>
            <ValueBox>
              5、若您以不当方式注册为本公司用户或通过本公司认证的，则因此产生的一切法律责任应由您承担；因此给本公司造成损失的，该用户应向本公司进行赔偿。同时本公司有权随时注销该采控网账户或释放该采控网账户的相关身份信息或停止为其提供服务。
            </ValueBox>

            <TitleBox>三、银行账户识别</TitleBox>
            <ValueBox>
              1、采控网用户填写的银行账户开户名必须与营业执照、组织机构代码证中的名称完全一致，并将成为认证资料。
            </ValueBox>
            <ValueBox>
              2、本公司有权根据实际情况而要求您补充或提供其他类型的银行账户信息的相关凭证。
            </ValueBox>

            <TitleBox>四、不得为非法或禁止的使用</TitleBox>
            <ValueBox>
              接受本规则全部的说明、条款、条件是您申请认证的先决条件。您声明并保证，您不得以任何非法或为本规则、条件及须知所禁止之目的进行认证申请。您不得以任何可能损害、使瘫痪、使过度负荷或损害其他网站或其他网站的服务或本公司或干扰他人对于采控网认证申请的使用等方式使用认证服务。您不得未经本公司许可以任何方式取得或试图取得本网站资料或信息。
            </ValueBox>

            <TitleBox>五、免责条款</TitleBox>
            <ValueBox>您同意，在下列情形下采控网无需承担任何责任：</ValueBox>
            <ValueBox>
              1、由于您将采控网账户及密码告知他人或未保管好自己的账户、密码或与他人共享采控网账户或任何其他非本公司的过错，导致您的个人资料泄露，被篡改，或发生异常交易。
            </ValueBox>
            <ValueBox>
              2、任何由于黑客攻击、计算机病毒侵入或发作、电信部门技术调整导致之影响、因政府管制而造成的暂时性关闭、由于第三方原因(包括不可抗力，例如国际出口的主干线路及国际出口电信提供商一方出现故障、火灾、水灾、雷击、地震、洪水、台风、龙卷风、火山爆发、瘟疫和传染病流行、罢工、战争或暴力行为或类似事件等)及其他非因本公司过错而造成的认证信息泄露、丢失、被盗用或被篡改等。
            </ValueBox>
            <ValueBox>
              3、由于与本公司链接或合作的其它网站（如网上银行等）所造成的银行账户信息、身份信息泄露及由此而导致的任何法律争议和后果。
            </ValueBox>
            <ValueBox>
              4、任何采控网用户向本公司提供错误、不完整、不实信息等造成不能通过认证或遭受任何其他损失，概与采控网无关。
            </ValueBox>

            <TitleBox>六、其他条款</TitleBox>
            <ValueBox>
              您同意，本公司有权随时对本规则内容进行单方面的变更，并提前7天在“采控网”网站公示，公示后变更条款自动生效，无需另行单独通知您；若您在本规则内容变更后继续使用本服务的，表示您已充分阅读、理解并接受变更修改后的规则内容，也将遵循变更修改后的规则内容使用本服务；若您不同意变更修改后的规则内容，您应立即停止使用本服务。
            </ValueBox>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                marginTop: 30,
              }}
            >
              <TitleBox>福建采控网络科技有限公司</TitleBox>
              <TitleBox>二〇二三年十月三十一日</TitleBox>
            </div>
          </div>
        </div>
      </Modal>
    </EnterpriseBox>
  );
}

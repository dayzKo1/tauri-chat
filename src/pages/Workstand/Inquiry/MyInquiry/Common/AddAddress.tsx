import {
  addOrUpdateAddress,
  getExpress,
  getLogistics,
  setDefaultCollectTicketsAddress,
  setDefaultReceiptAddress,
} from "@/services";
import { getCityList } from "@/services/Company";
import { useMutation, useQuery } from "@apollo/client";
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
  message,
} from "antd";
import { useEffect, useState } from "react";

const AddAddress = ({
  addressModalOpen,
  setAddressModalOpen,
  itemAddressInfo,
  addressType, // 收货、收票标识：goods、bill
}: any) => {
  // 地址全部数据
  const [addressList, setAddressList] = useState([]);
  // 省数据
  const [provinceOptions, setProvinceOptions] = useState<any[]>([]);
  // 市数据
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  // 区（县）数据
  const [areaOptions, setAreaOptions] = useState<any[]>([]);
  // 快递公司Options
  const [expressOptions, setExpressOptions] = useState<any[]>([]);
  // 快递公司所有数据
  const [courierIdsList, setCourierIdsList] = useState<any[]>([]);
  // 物流公司Options
  const [logisticsOptions, setLogisticsOptions] = useState<any[]>([]);
  // 物流公司所有数据
  const [logisticsList, setLogisticsList] = useState<any[]>([]);
  // 收件方式
  const [wayValue, setWayValue] = useState("按供方选择方式");

  const [form] = Form.useForm();

  // 获取快递公司
  const { runAsync: getExpressFun } = useRequest(getExpress, {
    manual: true,
    onSuccess: (res: any) => {
      setCourierIdsList(res?.data);
      const expressArr: { label: string; value: string }[] = [];
      res?.data.forEach((item: any) => {
        let expressObj = {
          label: item.name,
          value: item.name,
        };
        expressArr.push(expressObj);
      });
      setExpressOptions(expressArr);
    },
    onError(error: any) {
      if (error.response.data?.errors) {
        message.info(error.response.data?.errors);
      } else {
        message.error("服务器繁忙，请稍后再试！");
      }
    },
  });
  // 获取物流公司
  const { runAsync: getLogisticsFun } = useRequest(getLogistics, {
    manual: true,
    onSuccess: (res: any) => {
      setLogisticsList(res?.data);
      const logisticsArr: { label: string; value: string }[] = [];
      res?.data.forEach((item: any) => {
        let expressObj = {
          label: item.name,
          value: item.name,
        };
        logisticsArr.push(expressObj);
      });
      setLogisticsOptions(logisticsArr);
    },
    onError(error: any) {
      if (error.response.data?.errors) {
        message.info(error.response.data?.errors);
      } else {
        message.error("服务器繁忙，请稍后再试！");
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

  // 渲染时公司编号数组转换名称数组
  const idConvertName = (arr: string[], list: any[]) => {
    const nameArr: string[] = [];
    const codeSet = new Set(arr);
    const expressDict: { [code: string]: any } = {};
    list.forEach((item: any) => {
      expressDict[item.code] = item;
    });

    codeSet.forEach((code) => {
      const item = expressDict[code];
      if (item) {
        nameArr.push(item.name);
      }
    });

    return nameArr;
  };

  // 提交时公司名称数组转换编号数组
  const nameConvertId = (arr: string[], list: any[]) => {
    const idArr: string[] = [];
    const nameSet = new Set(arr);

    const expressDict: { [name: string]: any } = {};
    list.forEach((item: any) => {
      expressDict[item.name] = item;
    });

    nameSet.forEach((name) => {
      const item = expressDict[name];
      if (item) {
        idArr.push(item.code);
      }
    });

    return idArr;
  };

  // 添加、修改 收货/收票 地址
  const [addOrUpdateAddressFun, { loading: addAddressLoading }] =
    useMutation(addOrUpdateAddress);

  // 设置默认收货地址
  const [
    setDefaultReceiptAddressFun,
    { loading: defaultReceiptAddressLoading },
  ] = useMutation(setDefaultReceiptAddress, {
    variables: {
      id: itemAddressInfo?.id,
    },
  });

  // 设置默认收票地址
  const [
    setDefaultCollectTicketsAddressFun,
    { loading: defaultReceiptTicketsLoading },
  ] = useMutation(setDefaultCollectTicketsAddress, {
    variables: {
      id: itemAddressInfo?.id,
    },
  });

  useEffect(() => {
    getExpressFun({ name: null });
    getLogisticsFun({ name: null });
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      name: itemAddressInfo?.name || "",
      mobile: itemAddressInfo?.mobile || "",
      province: itemAddressInfo?.viewProvince?.code || "",
      city: itemAddressInfo?.viewCity?.code || "",
      area: itemAddressInfo?.viewArea?.code || "",
      detailAddr: itemAddressInfo?.detailAddr || "",
      postCode: itemAddressInfo?.postCode || "",
      deliveryMethod: itemAddressInfo?.sendWay?.courierIds
        ? "自定义"
        : "按供方选择方式",
      weight: itemAddressInfo?.sendWay?.weight || "",
      // courierIds: true ? idConvertName(["AASHSM", "AJ"],courierIdsList) : null,
      courierIds: itemAddressInfo?.sendWay?.courierIds
        ? idConvertName(itemAddressInfo?.sendWay?.courierIds, courierIdsList)
        : [],
      greaterWeight: itemAddressInfo?.sendWay?.greaterWeight || "",
      logisticsIds: itemAddressInfo?.sendWay?.logisticsIds
        ? idConvertName(itemAddressInfo?.sendWay?.logisticsIds, logisticsList)
        : [],
      defaultSetting: [
        itemAddressInfo?.addFirst && "addFirst",
        itemAddressInfo?.billFirst && "billFirst",
      ],
    });
    // 用户地址信息
    const cityArr: { label: string; value: string }[] = [];
    const areaArr: { label: string; value: string }[] = [];
    addressList.forEach((item: any) => {
      if (item.value === itemAddressInfo?.viewProvince?.code) {
        item?.children?.forEach((item1: any) => {
          let cityObj = {
            label: item1.label,
            value: item1.value,
            children: item1.children,
          };
          cityArr.push(cityObj);
          if (item1.value === itemAddressInfo?.viewCity?.code) {
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
  }, [itemAddressInfo]);

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
      area: areaArr?.[0]?.value,
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
      area: areaArr?.[0]?.value,
    });
    setAreaOptions(areaArr);
  };

  const onWayChange = (e: RadioChangeEvent) => {
    setWayValue(e.target.value);
  };

  const onFinish = (values: any) => {
    let sendWayObj = {
      weight: values.weight,
      courierIds: nameConvertId(values?.courierIds, courierIdsList),
      greaterWeight: values.greaterWeight,
      logisticsIds: nameConvertId(values?.logisticsIds, logisticsList),
    };

    // console.log(
    //   "增加地址数据",
    //   values,
    //   "itemAddressInfo",
    //   itemAddressInfo,
    //   "---",
    //   values.defaultSetting.includes("addFirst"),
    //   values.defaultSetting.includes("billFirst"),
    //   "sendWay",
    //   sendWayObj,
    //   nameConvertId(values?.courierIds, courierIdsList),
    //   nameConvertId(values?.logisticsIds, logisticsList),
    // );

    if (
      addressType === "goods" &&
      itemAddressInfo?.name &&
      values.defaultSetting.includes("addFirst")
    ) {
      setDefaultReceiptAddressFun();
    }
    if (
      addressType === "bill" &&
      itemAddressInfo?.name &&
      values.defaultSetting.includes("billFirst")
    ) {
      setDefaultCollectTicketsAddressFun();
    }

    addOrUpdateAddressFun({
      variables: {
        params: {
          area: values.area,
          city: values.city,
          detailAddr: values.detailAddr,
          addFirst: values.defaultSetting.includes("addFirst"),
          billFirst: values.defaultSetting.includes("billFirst"),
          id: itemAddressInfo?.id || null,
          province: values.province,
          mobile: values.mobile,
          name: values.name,
          postCode: values.postCode,
          type: addressType === "goods" ? 0 : 1,
          sendWay: sendWayObj.weight ? sendWayObj : null,
        },
      },
      onCompleted: (res) => {
        message.success(itemAddressInfo?.name ? "修改成功" : "添加成功");
        setAddressModalOpen(false);
      },
      onError: () => {
        message.error(itemAddressInfo?.name ? "修改失败" : "添加失败");
      },
    });
  };

  return (
    <>
      <Modal
        width={750}
        title={
          <div style={{ textAlign: "center" }}>
            {itemAddressInfo?.name ? "修改地址" : "新增地址"}
          </div>
        }
        open={addressModalOpen}
        // onOk={handleOk}
        onCancel={() => setAddressModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={onFinish}
          style={{
            width: "100%",
            paddingTop: "20px",
          }}
        >
          <Space.Compact
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Form.Item
              label={<div>收&nbsp;&nbsp;件&nbsp;&nbsp;人</div>}
              name="name"
              rules={[{ required: true, message: "请输入收件人姓名" }]}
              style={{ width: "40%" }}
            >
              <Input placeholder="请输入收件人姓名" />
            </Form.Item>
            <Form.Item
              label="收件联系方式"
              name="mobile"
              rules={[
                { required: true, message: "请输入联系号码" },
                { pattern: /^1[3-9]\d{9}$/, message: "手机号码格式不正确" },
              ]}
              style={{ width: "50%" }}
            >
              <Input placeholder="请输入联系号码" />
            </Form.Item>
          </Space.Compact>
          <Space.Compact
            style={{
              width: "100%",
            }}
          >
            <Form.Item
              label="所在地区"
              style={{ width: "32%", marginRight: "2%" }}
              name="province"
              rules={[{ required: true, message: "省级不能为空" }]}
            >
              <Select
                placeholder="请选择省"
                options={provinceOptions}
                onChange={provinceChange}
              ></Select>
            </Form.Item>
            <Form.Item
              style={{ width: "32%", marginRight: "2%" }}
              name="city"
              rules={[{ required: true, message: "市级不能为空" }]}
            >
              <Select
                placeholder="请选择市"
                options={cityOptions}
                onChange={cityChange}
              ></Select>
            </Form.Item>
            <Form.Item
              style={{ width: "32%" }}
              name="area"
              rules={[{ required: true, message: "区（县）级不能为空" }]}
            >
              <Select placeholder="请选择区县" options={areaOptions}></Select>
            </Form.Item>
          </Space.Compact>
          <Space.Compact
            style={{
              width: "100%",
            }}
          >
            <Form.Item
              label="详细地址"
              name="detailAddr"
              rules={[{ required: true, message: "详细地址不能为空" }]}
              style={{ width: "100%" }}
            >
              <Input placeholder="详细地址" style={{ color: "#333" }} />
            </Form.Item>
          </Space.Compact>
          <Space.Compact
            style={{
              width: "100%",
            }}
          >
            <Form.Item
              label={<div>&nbsp;&nbsp;&nbsp;邮政编码</div>}
              name="postCode"
              rules={[
                { pattern: /^[1-9]\d{5}$/, message: "邮政编码格式不正确" },
              ]}
              // 邮政编码正则
              style={{ width: "100%" }}
            >
              <Input placeholder="邮政编码" style={{ color: "#333" }} />
            </Form.Item>
          </Space.Compact>
          <Space.Compact
            style={{
              width: "100%",
            }}
          >
            <Form.Item
              label={<div>&nbsp;&nbsp;&nbsp;收件方式</div>}
              name="deliveryMethod"
              style={{ width: "100%" }}
            >
              <Radio.Group onChange={onWayChange}>
                <Space direction="vertical" style={{ marginTop: "6px" }}>
                  <Radio value="按供方选择方式">按供方选择方式</Radio>
                  <Radio value="自定义">自定义</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Space.Compact>
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item
              label="重量小于"
              name="weight"
              rules={[
                {
                  required:
                    form.getFieldValue("deliveryMethod") === "自定义" && true,
                  message: "请输入重量",
                },
              ]}
              style={{ width: "70%", marginLeft: "12%", marginRight: "2%" }}
            >
              <Input
                type="number"
                min={1}
                addonAfter="公斤"
                disabled={wayValue === "按供方选择方式"}
                placeholder="请输入重量"
              />
            </Form.Item>
            <Form.Item
              label="使用快递"
              name="courierIds"
              style={{ width: "100%" }}
              rules={[
                {
                  required:
                    form.getFieldValue("deliveryMethod") === "自定义" && true,
                  message: "请选择快递",
                  type: "array",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="请选择快递"
                disabled={wayValue === "按供方选择方式"}
                options={expressOptions}
              ></Select>
            </Form.Item>
          </Space.Compact>
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item
              label="重量大于"
              name="greaterWeight"
              rules={[
                {
                  required:
                    form.getFieldValue("deliveryMethod") === "自定义" && true,
                  message: "请输入重量",
                },
              ]}
              style={{ width: "70%", marginLeft: "12%", marginRight: "2%" }}
            >
              <Input
                type="number"
                min={1}
                addonAfter="公斤"
                disabled={wayValue === "按供方选择方式"}
                placeholder="请输入重量"
              />
            </Form.Item>
            <Form.Item
              label="使用物流"
              name="logisticsIds"
              style={{ width: "100%" }}
              rules={[
                {
                  required:
                    form.getFieldValue("deliveryMethod") === "自定义" && true,
                  message: "请选择物流",
                  type: "array",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="请选择物流"
                disabled={wayValue === "按供方选择方式"}
                options={logisticsOptions}
              ></Select>
            </Form.Item>
          </Space.Compact>
          <Space.Compact
            style={{
              width: "100%",
            }}
          >
            <Form.Item
              label={<div>&nbsp;&nbsp;&nbsp;默认设置</div>}
              name="defaultSetting"
              style={{ width: "100%" }}
            >
              <Checkbox.Group style={{ flexDirection: "column" }}>
                <Checkbox value="addFirst" style={{ lineHeight: "32px" }}>
                  设置默认收货地址
                </Checkbox>
                <Checkbox value="billFirst" style={{ lineHeight: "32px" }}>
                  设置默认收票地址
                </Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Space.Compact>
          <Form.Item style={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="primary"
              className="login-form-button"
              style={{
                width: 100,
                height: 38,
                background: "#fff",
                color: "#4E83FD",
                marginRight: 15,
                border: "1px solid #0052D9",
              }}
              onClick={() => setAddressModalOpen(false)}
            >
              取消
            </Button>
            <Button
              loading={
                addAddressLoading ||
                defaultReceiptAddressLoading ||
                defaultReceiptTicketsLoading
              }
              type="primary"
              htmlType="submit"
              className="login-form-button"
              style={{ width: 100, height: 38 }}
            >
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddAddress;

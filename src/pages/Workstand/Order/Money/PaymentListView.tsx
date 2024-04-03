import CustomPagination from "@/components/Workstand/CustomPagination";
import Preview from "@/components/Workstand/Preview";
import {
  getPaymentDetail,
  getPaymentInfo,
  getSupplierList,
  payment,
  uploadFs,
} from "@/services";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import {
  EditableProTable,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useSearchParams } from "@umijs/max";
import { useRequest } from "ahooks";
import type {
  DescriptionsProps,
  MenuProps,
  PaginationProps,
  UploadProps,
} from "antd";
import {
  Button,
  Descriptions,
  Dropdown,
  Modal,
  Select,
  Space,
  Upload,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { useRef, useState } from "react";
import { styled } from "umi";

dayjs.locale("zh-cn");
dayjs.extend(weekday);
dayjs.extend(localeData);

const ProTable: any = styled(EditableProTable)`
  .ant-pro-table-list-toolbar-left-has-tabs {
    max-width: 100%;
    border-bottom: 0.0625rem solid #efefef;
  }
  .ant-pro-table-list-toolbar-container {
    padding-block: 0;
    display: block;
  }
  .ant-pro-table-list-toolbar-right {
    padding-top: 1.25rem;
    height: 3.125rem;
    justify-content: flex-start;
    button {
      margin-left: 0.625rem;
    }
  }
  .ant-pro-table-alert {
    margin-block-end: 0;
  }
  .ant-table-wrapper {
    margin-block-start: ${({ open }: any) => (open ? 0 : "1.25rem")};
  }
  .ant-form {
    display: flex;
  }
`;

const Content: any = styled(Modal)`
  .ant-modal-content {
    border-radius: 0rem;
    padding: 0rem;
  }
`;

const itemsList = [
  { label: "未付款", key: "BE_PAYING" },
  { label: "已付款", key: "PAID" },
];

const DescriptionsCard = ({ item }: any) => {
  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "付款银行",
      children: item.payingBank + " " + item.payingNumber,
    },
    {
      key: "2",
      label: "收款单位",
      children: item.receivingName,
    },
    {
      key: "3",
      label: "流水号/凭证",
      children:
        item?.billIds ||
        item?.attachment?.map((item1: any, index: number) => (
          <Preview
            key={index}
            item={item1}
            index={index}
            types={item.attachmentContentType}
          />
        )),
    },
    {
      key: "4",
      label: "收款银行",
      children: item.receivingBank + " " + item.receivingNumber,
    },
    {
      key: "5",
      label: "付款时间",
      children: timeStampToNormalTime(item.payDate, "-"),
    },
    {
      key: "6",
      label: "收款状态",
      children: item.receipts ? (
        <span style={{ color: "#22CD27" }}>已收款</span>
      ) : (
        <span style={{ color: "#FD6E4E" }}>未收款</span>
      ),
    },
  ];
  return <Descriptions column={2} items={items} />;
};

function PaymentListView() {
  const ref: any = useRef(null);
  const searchRef: any = useRef(null);
  const deliveryRef: any = useRef(null);
  const [search] = useSearchParams();
  const rcUserId = search.get("rcUserId");
  const [messageApi, contextHolder] = message.useMessage();
  const [activeKey, setActiveKey] = useState("PAYING");
  const [activeItem, setActieItem]: any = useState({});
  const [paymentDetail, setPaymentDetail]: any = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows]: any = useState([]);
  const [currentCompany, setCurrentCompany] = useState("");
  const [filesList, setFilesList]: any = useState([]);
  const [comfirmOpen, setComfirmOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 0,
    pageSize: 10,
    total: 0,
  });
  // request
  const [getPaymentList] = useLazyQuery(getPaymentInfo);
  const [getSupplierData] = useLazyQuery(getSupplierList);
  const [getPaymentDetailInfo] = useLazyQuery(getPaymentDetail);
  const [confirmPayment, { loading }] = useMutation(payment);
  const { runAsync } = useRequest(uploadFs, {
    manual: true,
    onError: (err: any) => {
      messageApi.error(
        err.response.data.errors || "上传失败,请检查文件模板或格式。",
      );
    },
  });
  // 分页
  const onShowSizeChange: PaginationProps["onShowSizeChange"] = (
    current,
    pageSize,
  ) => {
    setPagination({
      ...pagination,
      currentPage: current,
      pageSize: pageSize,
    });
    ref.current?.reload();
  };
  // 表单格式
  const columns =
    activeKey === "PAID"
      ? [
          {
            title: "序",
            dataIndex: "index",
            valueType: "index",
            align: "center",
            editable: false,
            width: "3.5%",
          },
          {
            title: "收款单位",
            editable: false,
            width: "15%",
            render: (_: any, record: any) => record?.offer?.name,
          },
          {
            title: "收款银行及账号",
            render: (_: any, record: any) =>
              record?.receivingBank + " " + record?.receivingNumber,
            editable: false,
          },
          {
            title: "转账流水号",
            editable: false,
            width: "17.5%",
            render: (_: any, record: any) => record?.billIds || "-",
          },
          {
            title: "转账凭证",
            editable: false,
            width: "12%",
            align: "center",
            render: (_: any, record: any) => {
              if (record?.attachment?.length > 0) {
                return record?.attachment?.map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Preview
                      item={item}
                      index={index}
                      types={record?.attachmentContentType}
                    />
                  </div>
                ));
              } else {
                return "暂无";
              }
            },
          },
          {
            title: "付款总金额（元）",
            render: (_: any, record: any) => (
              <span style={{ color: "#F29D39" }}>
                {Number(record?.countPaymentAmount).toFixed(2)}
              </span>
            ),
            editable: false,
            width: "12%",
          },
          {
            title: "付款时间",
            render: (_: any, record: any) =>
              record?.orderItems?.[0]?.amount * 100 + "%",
            editable: false,
            width: "7%",
          },
          {
            title: "收款状态",
            render: (_: any, record: any) => (
              <span style={{ color: "#F29D39" }}>
                {Number(record?.orderItems?.[0]?.paymentAmount).toFixed(2)}
              </span>
            ),
            editable: false,
            width: "8%",
          },
          {
            title: "操作",
            editable: false,
            width: "7%",
            render: (_: any, record: any) => (
              <Button
                onClick={() => {
                  getPaymentDetailInfo({
                    variables: {
                      paymentId: record.paymentId,
                    },
                    fetchPolicy: "no-cache",
                    onCompleted: (res) => {
                      setPaymentDetail(res.paymentItem.paymentDetails);
                    },
                  });
                  setActieItem(record);
                  setDetailOpen(true);
                }}
                type="link"
              >
                查看
              </Button>
            ),
          },
        ]
      : [
          {
            title: "序",
            dataIndex: "index",
            valueType: "index",
            align: "center",
            editable: false,
            width: "3.5%",
          },
          {
            title: "订单号",
            editable: false,
            dataIndex: "orderId",
            width: "13%",
          },
          {
            title: "品牌",
            dataIndex: "brandName",
            editable: false,
            width: "8%",
          },
          {
            title: "询价内容",
            editable: false,
            render: (_: any, record: any) =>
              record.itemName +
              " " +
              record.model +
              " " +
              record.quantity +
              " " +
              record.unit,
          },
          {
            title: "供应商",
            editable: false,
            dataIndex: "offerCompanyName",
            width: "12%",
          },
          {
            title: "总金额（元）",
            dataIndex: "totalAmount",
            render: (v: any) => (
              <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
            ),
            editable: false,
            width: "9%",
          },
          {
            title: "应付比例",
            dataIndex: "amount",
            render: (v: any) => v * 100 + "%",
            editable: false,
            width: "7%",
          },
          {
            title: "应付金额（元）",
            dataIndex: "paymentAmount",
            render: (v: any) => (
              <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
            ),
            editable: false,
            width: "11%",
          },
          {
            title: "应付时间",
            editable: false,
            dataIndex: "shouldPayDate",
            width: "8%",
            render: (v: any) => timeStampToNormalTime(v, "-"),
          },
        ];
  const comfirmColumns = [
    {
      title: "序",
      dataIndex: "index",
      valueType: "index",
      editable: false,
      width: "4%",
    },
    {
      title: "订单号",
      dataIndex: "orderId",
      editable: false,
      width: "11%",
    },
    {
      title: "品牌",
      dataIndex: "brandName",
      editable: false,
      width: "6%",
    },
    {
      title: "询价内容",
      dataIndex: "model",
      editable: false,
      width: "20%",
    },
    {
      title: "数量",
      align: "center",
      dataIndex: "quantity",
      editable: false,
      width: "6%",
    },
    {
      title: "单位",
      align: "center",
      dataIndex: "unit",
      editable: false,
      width: "6%",
    },
    {
      title: "单价（元）",
      dataIndex: "price",
      width: "6%",
      render: (v: any) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: "总金额（元）",
      dataIndex: "totalAmount",
      width: "6%",
      render: (v: any) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: "付款比例",
      align: "center",
      dataIndex: "amount",
      editable: false,
      width: "6%",
      render: (v: any) => v * 100 + "%",
    },
    {
      title: "应付款金额（元）",
      dataIndex: "paymentAmount",
      editable: false,
      width: "6%",
      render: (v: any) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
  ];
  // 文件上传
  const type: any = useRef(null);
  const base64: any = useRef(null);
  const base64ToBlob = (url: any) => {
    const arr = url?.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    type.current = mime;
    return new Blob([u8arr], { type: mime });
  };
  const props: UploadProps = {
    onChange({ file, fileList }: any) {
      if (file.status === "done") {
        if (file.szie > 6 * 1024 * 1024) {
          messageApi.warning("图片大小不能超过6M!");
        } else {
          runAsync({
            type: type.current,
            data: base64ToBlob(base64.current),
          })
            .then((res: any) => {
              setFilesList([
                ...filesList,
                {
                  ...res.data,
                  ...file,
                },
              ]);
            })
            .catch(() => {
              fileList.pop();
            });
          type.current = null;
        }
      }
    },
    multiple: true,
    maxCount: 6,
    showUploadList: false,
  };
  // 已上传凭证展示
  const items: MenuProps["items"] = filesList.map(
    (item: any, index: number) => ({
      key: index,
      label: (
        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{item.name}</span>
          <CloseOutlined
            onClick={() => {
              setFilesList(
                filesList.filter((item1: any) => item1.files !== item.files),
              );
            }}
            style={{ color: "#ddd", fontSize: 12 }}
          />
        </Space>
      ),
    }),
  );
  // 计算选中总数
  const totalAmount = () => {
    let count = 0;
    selectedRows.forEach((item: any) => {
      count += item.paymentAmount;
    });
    return Number(count);
  };
  // 确认付款
  const confirmPaymentMethod = () => {
    const { logisticsTrackingNumber } = deliveryRef.current.getFieldsValue();
    if (logisticsTrackingNumber || filesList.length > 0) {
      const attachment: Array<any> = [];
      const attachmentContentType: Array<any> = [];
      filesList.forEach((item: any) => {
        attachment.push(item.files);
        attachmentContentType.push(item.filesContentType);
      });
      const orderIds: Set<any> = new Set();
      const shouldPayIds: Array<any> = [];
      selectedRows.forEach((item: any) => {
        orderIds.add(item.orderId);
        shouldPayIds.push({
          id: item.shouldPayId,
        });
      });
      confirmPayment({
        variables: {
          params: {
            attachment: attachment,
            attachmentContentType: attachmentContentType,
            orderId: [...orderIds],
            receiptsAccountId: selectedRows[0].offerAccountId,
            shouldPay: shouldPayIds,
            // aftermarket: null, 是否售后
          },
        },
        onCompleted: () => {
          messageApi.success("付款成功！");
          setSelectedRowKeys([]);
          setSelectedRows([]);
          setComfirmOpen(false);
          setFilesList([]);
          ref.current.reload();
        },
        onError: (err) => {
          const errInfo = JSON.parse(JSON.stringify(err));
          messageApi.error(
            errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
              ? errInfo.message
              : "付款失败，请稍后重试",
          );
        },
      });
    } else {
      messageApi.warning("请上传付款凭证或转账流水号！");
    }
  };
  // 付款
  return (
    <>
      {contextHolder}
      <ProTable
        actionRef={ref}
        tableAlertRender={false}
        alwaysShowAlert
        bordered
        rowKey={activeKey === "PAID" ? "id" : "orderItemId"}
        dateFormatter="string"
        recordCreatorProps={false}
        search={false}
        scroll={{
          y: "60vh",
        }}
        columns={columns}
        rowSelection={
          ["PAID"].includes(activeKey)
            ? false
            : {
                selectedRowKeys,
                onChange: (newSelectedRowKeys: any, selectedRows: any) => {
                  if (selectedRows.length === 1) {
                    setCurrentCompany(selectedRows[0].offerCompanyId);
                  }
                  if (selectedRows.length > 1) {
                    if (
                      currentCompany ===
                      selectedRows[selectedRows.length - 1].offerCompanyId
                    ) {
                      setSelectedRows(selectedRows);
                      setSelectedRowKeys(newSelectedRowKeys);
                    } else {
                      messageApi.warning("请选择同一公司下的明细！");
                    }
                  } else {
                    setSelectedRows(selectedRows);
                    setSelectedRowKeys(newSelectedRowKeys);
                  }
                },
              }
        }
        params={{ activeKey }}
        request={async () => {
          const {
            timeRange = [],
            companyId,
            orderId,
          } = searchRef.current.getFieldsValue();
          const [start, end] = timeRange ?? [];
          const params = {
            start: timeRange?.length
              ? new Date(
                  new Date(dayjs(start?.["$d"]).valueOf()).setHours(0, 0, 0, 0),
                ).toISOString()
              : undefined,
            end: timeRange?.length
              ? new Date(
                  new Date(dayjs(end?.["$d"]).valueOf()).setHours(
                    23,
                    59,
                    59,
                    59,
                  ),
                ).toISOString()
              : undefined,
            targetRcUserId: rcUserId || null,
            companyId: companyId,
            status: activeKey,
            orderId: orderId || null,
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
          };
          const { data } = await getPaymentList({
            variables: {
              params,
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { data, __typename, ...newObj } =
                res.paymentItem.pageInquiry;
              setPagination(newObj);
            },
          });
          return Promise.resolve({
            data:
              activeKey === "PAID"
                ? data?.paymentItem.pageInquiry.data
                : data?.paymentItem.pageInquiry.desktopData,
            success: true,
          });
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeKey,
            items: itemsList,
            onChange: (key: any) => {
              setSelectedRowKeys([]);
              setPagination({ ...pagination, currentPage: 1 });
              setSelectedRows([]);
              setActiveKey(key);
            },
          },
          filter: (
            <ProForm
              formRef={searchRef}
              submitter={{
                render: () => {
                  return [
                    <Button
                      type="primary"
                      key="submit"
                      onClick={() => {
                        ref.current.reload();
                        setSelectedRowKeys([]);
                        setSelectedRows([]);
                      }}
                    >
                      搜索
                    </Button>,
                  ];
                },
              }}
            >
              <Space
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                {!["PAID"].includes(activeKey) && (
                  <Select
                    defaultValue="应付款"
                    onChange={(e) => {
                      setActiveKey(e);
                      ref.current.reload();
                    }}
                    options={[
                      { label: "未付款", value: "BE_PAYING" },
                      { label: "应付款", value: "PAYING" },
                    ]}
                  />
                )}

                <ProFormDateRangePicker
                  name="timeRange"
                  placeholder={["开始时间", "结束时间"]}
                  fieldProps={{
                    presets: [
                      {
                        label: "今天",
                        value: [dayjs(), dayjs()],
                      },
                      {
                        label: "近三天",
                        value: [dayjs().subtract(2, "day"), dayjs()],
                      },
                      {
                        label: "本周",
                        value: [dayjs().startOf("week"), dayjs().endOf("week")],
                      },
                      {
                        label: "本月",
                        value: [
                          dayjs().startOf("month"),
                          dayjs().endOf("month"),
                        ],
                      },
                    ],
                  }}
                />
                <ProFormSelect
                  name={"companyId"}
                  showSearch
                  placeholder="请选择交易方"
                  request={async () => {
                    const { data } = await getSupplierData();
                    const items = data?.order.inquiryMyCompanies;
                    return items.map((item: any) => ({
                      label: item.label,
                      value: item.value,
                    }));
                  }}
                />
                <ProFormText name="orderId" placeholder="请输入订单号" />
              </Space>
            </ProForm>
          ),
        }}
      />
      {/* 分页器 */}
      <CustomPagination
        pagination={pagination}
        onShowSizeChange={onShowSizeChange}
      />
      {/* 按钮 */}
      {!["PAID"].includes(activeKey) && (
        <Space
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            display: "flex",
            backgroundColor: "#fff",
            justifyContent: "space-between",
            marginTop: 20,
            padding: 20,
            boxShadow: "0rem -0.3125rem .3125rem 0rem rgba(0, 0, 0, 0.2)",
          }}
        >
          <Space
            style={{
              color: "#333",
              display: "flex",
              alignItems: "flex-end",
              fontSize: 12,
            }}
          >
            选中<span style={{ color: "#F29D39" }}>{selectedRows.length}</span>
            条
            <span style={{ marginLeft: 10, lineHeight: 1 }}>
              选中总金额：
              <span style={{ fontSize: 24, color: "#F44436", fontWeight: 500 }}>
                ￥{totalAmount().toFixed(2)}
              </span>
            </span>
          </Space>
          <Button
            style={{
              height: 40,
              paddingLeft: 20,
              paddingRight: 20,
              borderRadius: 2,
            }}
            type="primary"
            onClick={() => {
              if (selectedRows.length > 0) {
                setComfirmOpen(true);
              } else {
                messageApi.warning("请选择需要付款的明细！");
              }
            }}
          >
            批量付款
          </Button>
        </Space>
      )}
      {/* 确认付款Modal */}
      <Content
        open={comfirmOpen}
        centered
        modalProps={{
          destroyOnClose: true,
        }}
        footer={null}
        width={1200}
        onCancel={() => {
          setFilesList([]);
          setComfirmOpen(false);
        }}
      >
        <span style={{ height: 540 }}>
          <Space
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              height: 56,
              backgroundColor: "#F3F3F3",
              borderBottom: ".0625rem solid #E7E7E7",
              paddingLeft: 30,
              paddingRight: 30,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600 }}>确认付款</span>
          </Space>
          <div
            style={{
              height: 600,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Space
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                paddingLeft: 30,
                paddingRight: 30,
                height: 35,
              }}
            >
              <span
                style={{
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  fontSize: 16,
                }}
              >
                收款单位：
                {selectedRows?.[0]?.offerCompanyName}
              </span>
              <ProForm formRef={deliveryRef} submitter={false}>
                <Space style={{ display: "flex", alignItems: "flex-start" }}>
                  <ProFormText
                    name="logisticsTrackingNumber"
                    placeholder="请输入转账流水号"
                  />
                  <Space
                    style={{
                      color: "#000",
                      marginTop: 5,
                      fontSize: 16,
                    }}
                  >
                    或者
                  </Space>
                  <Upload
                    beforeUpload={(file) => {
                      type.current = file.type;
                      let reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = (e) => {
                        base64.current = e.target?.result;
                      };
                    }}
                    {...props}
                  >
                    <Button
                      style={{ color: "#ddd", margin: 0 }}
                      icon={<UploadOutlined />}
                    >
                      上传凭证
                    </Button>
                  </Upload>
                  {filesList.length > 0 && (
                    <Dropdown menu={{ items }}>
                      <span style={{ color: "#4E83FD", lineHeight: 2.5 }}>
                        凭证({filesList.length})
                      </span>
                    </Dropdown>
                  )}
                </Space>
              </ProForm>
            </Space>
            <ProTable
              alwaysShowAlert
              bordered
              rowKey="orderItemId"
              dateFormatter="string"
              recordCreatorProps={false}
              value={selectedRows}
              search={false}
              scroll={{
                y: "45vh",
              }}
              columns={comfirmColumns}
            />
            <Space
              style={{
                width: "95%",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                position: "absolute",
                bottom: 30,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: "#000" }}>
                应付总金额:
                <span
                  style={{ fontSize: 24, fontWeight: 600, color: "#FF0C0C" }}
                >
                  ￥{totalAmount().toFixed(2)}
                </span>
              </span>
              <Button
                style={{
                  height: 40,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 2,
                  zIndex: 999,
                  marginLeft: 20,
                }}
                onClick={confirmPaymentMethod}
                type="primary"
                loading={loading}
              >
                确认付款
              </Button>
            </Space>
          </div>
        </span>
      </Content>
      {/* 付款详情Modal */}
      <Content
        open={detailOpen}
        centered
        modalProps={{
          destroyOnClose: true,
        }}
        footer={null}
        width={1200}
        onCancel={() => {
          setDetailOpen(false);
        }}
      >
        <span style={{ height: 540 }}>
          <Space
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              height: 56,
              backgroundColor: "#F3F3F3",
              borderBottom: ".0625rem solid #E7E7E7",
              paddingLeft: 30,
              paddingRight: 30,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {"已付款详情"}
            </span>
          </Space>
          <div
            style={{
              height: 600,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ marginLeft: 20 }}>
              <DescriptionsCard item={paymentDetail} />
            </div>
            <ProTable
              alwaysShowAlert
              bordered
              rowKey="orderItemId"
              dateFormatter="string"
              recordCreatorProps={false}
              value={activeItem?.orderItems}
              search={false}
              scroll={{
                y: "45vh",
              }}
              columns={comfirmColumns}
            />
            <Space
              style={{
                width: "95%",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                position: "absolute",
                bottom: 30,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: "#000" }}>
                应付总金额:
                <span
                  style={{ fontSize: 24, fontWeight: 600, color: "#FF0C0C" }}
                >
                  ￥{paymentDetail?.countPaymentAmount?.toFixed(2)}
                </span>
              </span>
            </Space>
          </div>
        </span>
      </Content>
    </>
  );
}

export default PaymentListView;

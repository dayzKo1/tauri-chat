import CustomPagination from "@/components/Workstand/CustomPagination";
import DeliveryInput from "@/components/Workstand/DeliveryInput";
import Preview from "@/components/Workstand/Preview";
import {
  confirmDelivery,
  createOutDelivery,
  getAfterShipment,
  getBeforeShipment,
  getBuyerList,
  getLogisticsCompanyList,
  getStockTableDetail,
  notifyPayment,
  uploadFs,
} from "@/services";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import {
  CheckCircleOutlined,
  CloseOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  EditableProTable,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useSearchParams } from "@umijs/max";
import { useRequest } from "ahooks";
import type { MenuProps, PaginationProps, UploadProps } from "antd";
import {
  Button,
  Dropdown,
  Modal,
  Popconfirm,
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
    border-bottom: 1px solid #efefef;
  }
  .ant-pro-table-list-toolbar-container {
    padding-block: 0;
    display: block;
  }
  .ant-pro-table-list-toolbar-right {
    padding-top: 20px;
    height: 50px;
    justify-content: flex-start;
    button {
      margin-left: 10px;
    }
  }
  .ant-pro-table-alert {
    margin-block-end: 0;
  }
  .ant-table-wrapper {
    margin-block-start: ${({ open }: any) => (open ? 0 : "20px")};
  }
  .ant-form {
    display: flex;
  }
`;

const Content: any = styled(Modal)`
  .ant-modal-content {
    border-radius: 0px;
    padding: 0px;
  }
`;

const itemsList = [
  { label: "未备货", key: "NOT_STOCK" },
  { label: "未发货", key: "UNSHIPPED" },
  { label: "出库单", key: "SHIPPED_VERIFY" },
  { label: "已发货", key: "SHIPPED" },
];

const SendGoodsListView = () => {
  const ref: any = useRef(null);
  const formRef: any = useRef(null);
  const searchRef: any = useRef(null);
  const deliveryRef: any = useRef(null);
  const [search] = useSearchParams();
  const rcUserId = search.get("rcUserId");
  const [messageApi, contextHolder] = message.useMessage();
  const [activeKey, setActiveKey] = useState("NOT_STOCK");
  const [editableKeys, setEditableRowKeys]: Array<any> = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [stockTableId, setStockTableId] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [filesList, setFilesList]: any = useState([]);
  const [open, setOpen] = useState(false);
  const [okOpen, setOkOpen] = useState(false);
  const [comfirmOpen, setComfirmOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 0,
    pageSize: 10,
    total: 0,
  });
  // request
  const [getUnshippedGoodsList] = useLazyQuery(getBeforeShipment);
  const [getShippedGoodsList] = useLazyQuery(getAfterShipment);
  const [getBuyerData] = useLazyQuery(getBuyerList);
  const [createOutboundOrder, { loading: createLoading }] =
    useMutation(createOutDelivery);
  const { data: deliveryInfo } = useQuery(getStockTableDetail, {
    variables: {
      stockTableId,
    },
    skip: !stockTableId,
    fetchPolicy: "no-cache",
  });
  const [confirmDeliveryFn, { loading: deliveryLoading }] =
    useMutation(confirmDelivery);
  const [notifyPaymentFn, { loading: notifyLoading }] =
    useMutation(notifyPayment);
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
  const columns = [
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
      dataIndex: "orderId",
      editable: false,
      width: "15%",
      hideInTable: ["SHIPPED_VERIFY", "SHIPPED"].includes(activeKey),
    },
    {
      title: "出库单号",
      dataIndex: "stockTableId",
      editable: false,
      width: "10%",
      hideInTable: ["NOT_STOCK", "NOT_STOCK_PAY", "UNSHIPPED"].includes(
        activeKey,
      ),
    },
    {
      title: "采购商",
      width: "17%",
      dataIndex: "companyName",
      editable: false,
    },
    {
      title: "物流公司",
      width: "8%",
      dataIndex: "shipperName",
      editable: false,
      hideInTable: [
        "NOT_STOCK",
        "NOT_STOCK_PAY",
        "UNSHIPPED",
        "SHIPPED_VERIFY",
      ].includes(activeKey),
    },
    {
      title: "物流单号",
      width: "15%",
      dataIndex: "logisticCode",
      editable: false,
      hideInTable: [
        "NOT_STOCK",
        "NOT_STOCK_PAY",
        "UNSHIPPED",
        "SHIPPED_VERIFY",
      ].includes(activeKey),
    },
    {
      title: "物流凭证",
      width: "10%",
      editable: false,
      hideInTable: [
        "NOT_STOCK",
        "NOT_STOCK_PAY",
        "UNSHIPPED",
        "SHIPPED_VERIFY",
      ].includes(activeKey),
      render: (v: any) => {
        return (
          <span>
            {v.attachment?.length
              ? v.attachment?.map((item: any, index: number) => (
                  <Preview
                    key={index}
                    item={item}
                    index={index}
                    types={v.attachmentContentType}
                  />
                ))
              : "暂无"}
          </span>
        );
      },
    },
    {
      title: "品牌",
      dataIndex: "brandName",
      editable: false,
      width: "6%",
      hideInTable: ["SHIPPED_VERIFY", "SHIPPED"].includes(activeKey),
    },
    {
      title: "询价内容",
      dataIndex: "content",
      editable: false,
      width: "22%",
      hideInTable: ["SHIPPED_VERIFY", "SHIPPED"].includes(activeKey),
    },
    {
      title: "单位",
      align: "center",
      dataIndex: "unit",
      editable: false,
      width: "4%",
      hideInTable: ["SHIPPED_VERIFY", "SHIPPED"].includes(activeKey),
    },
    {
      title: "交易数量",
      align: "center",
      dataIndex: "tradeNum",
      editable: false,
      width: "6%",
      hideInTable: ["SHIPPED_VERIFY", "SHIPPED"].includes(activeKey),
    },
    {
      title: "已发货数量",
      dataIndex: "shippedNum",
      align: "center",
      editable: false,
      width: "6%",
      hideInTable: ["SHIPPED_VERIFY", "SHIPPED"].includes(activeKey),
    },
    {
      title: "库存数量",
      dataIndex: "stockNum",
      align: "center",
      editable: false,
      width: "5%",
      hideInTable: ["SHIPPED_VERIFY", "SHIPPED"].includes(activeKey),
    },
    {
      title: "发货明细数",
      dataIndex: "stockItemNum",
      align: "center",
      editable: false,
      width: "6%",
      hideInTable: ["NOT_STOCK", "NOT_STOCK_PAY", "UNSHIPPED"].includes(
        activeKey,
      ),
    },
    {
      title: "应到货日期",
      dataIndex: "arrivalDate",
      align: "center",
      editable: false,
      width: "10%",
      hideInTable: ["SHIPPED_VERIFY", "SHIPPED"].includes(activeKey),
      render: (v: Date) => timeStampToNormalTime(v, "-"),
    },
    {
      title: "生成出库单日期",
      dataIndex: "createAt",
      align: "center",
      editable: false,
      width: "10%",
      hideInTable: !["SHIPPED_VERIFY"].includes(activeKey),
      render: (v: Date) => timeStampToNormalTime(v, "-"),
    },
    {
      title: "操作",
      editable: false,
      align: "center",
      width: "8%",
      hideInTable: ["NOT_STOCK", "NOT_STOCK_PAY", "UNSHIPPED"].includes(
        activeKey,
      ),
      render: (v: any) =>
        "SHIPPED" === activeKey ? (
          <Button
            type="link"
            onClick={() => {
              setStockTableId(v.stockTableId);
              setComfirmOpen(true);
            }}
          >
            查看
          </Button>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setStockTableId(v.stockTableId);
              setComfirmOpen(true);
            }}
          >
            发货
          </Button>
        ),
    },
  ];
  const editColumns = [
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
      title: "采购商",
      width: "15%",
      dataIndex: "companyName",
      editable: false,
    },
    {
      title: "品牌",
      dataIndex: "brandName",
      editable: false,
      width: "6%",
    },
    {
      title: "询价内容",
      dataIndex: "content",
      editable: false,
      width: "20%",
    },
    {
      title: "单位",
      align: "center",
      dataIndex: "unit",
      editable: false,
      width: "6%",
    },
    {
      title: "交易数量",
      align: "center",
      dataIndex: "tradeNum",
      editable: false,
      width: "6%",
    },
    {
      title: "已发货数量",
      dataIndex: "shippedNum",
      align: "center",
      editable: false,
      width: "6%",
    },
    {
      title: "本次入库数量",
      dataIndex: activeKey === "UNSHIPPED" ? "stockNum" : "unStockNum",
      align: "center",
      valueType: "digit",
      width: "6%",
      renderFormItem: (v: any) => (
        <DeliveryInput
          maxNum={
            activeKey === "UNSHIPPED" ? v.entry.stockNum : v.entry.unStockNum
          }
        />
      ),
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
      title: "采购商",
      width: "15%",
      dataIndex: "companyName",
      editable: false,
    },
    {
      title: "品牌",
      dataIndex: "brandName",
      editable: false,
      width: "6%",
    },
    {
      title: "询价内容",
      dataIndex: "content",
      editable: false,
      width: "20%",
    },
    {
      title: "单位",
      align: "center",
      dataIndex: "unit",
      editable: false,
      width: "6%",
    },
    {
      title: "本次发货数量",
      dataIndex: "shippedQuantity",
      align: "center",
      valueType: "digit",
      width: "6%",
    },
    {
      title: "货期",
      align: "center",
      dataIndex: "deliveryDate",
      editable: false,
      width: "6%",
    },
  ];
  // 凭证上传
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
  // 生成出库单
  const createMethod = () => {
    const formData = formRef.current.getFieldValue();
    const arr = Object.entries(formData).map(([key, value]) => ({
      key,
      value,
    }));
    const newForm = arr.map((item: any) => {
      return {
        prepareItemId: item.key,
        quantity: item.value.unStockNum,
      };
    });
    createOutboundOrder({
      variables: {
        stockStatus: activeKey,
        params: newForm,
      },
      onCompleted: (res) => {
        setStockTableId(res.stock.supplierCreateStockTable);
        ref.current.reload();
        setOpen(false);
        setOkOpen(true);
      },
      onError: (err) => {
        const errInfo = JSON.parse(JSON.stringify(err));
        messageApi.error(
          errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
            ? errInfo.message
            : "生成出库单失败，请稍后重试",
        );
      },
    });
  };
  // 通知付款
  const noticeMethod = () => {
    const newForm = selectedRows.map((item: any) => {
      return {
        prepareItemId: item.prepareItemId,
        quantity: item.unStockNum,
      };
    });
    notifyPaymentFn({
      variables: {
        params: newForm,
      },
      onCompleted: () => {
        messageApi.success("通知付款成功");
        ref.current.reload();
      },
      onError: (err) => {
        const errInfo = JSON.parse(JSON.stringify(err));
        messageApi.error(
          errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
            ? errInfo.message
            : "生成出库单失败，请稍后重试",
        );
      },
    });
  };
  // 确认发货
  const confirmMethod = () => {
    const { logisticsTrackingNumber, logisticsCompany } =
      deliveryRef.current.getFieldsValue();
    const shipperCode = logisticsCompany?.split("-")[0];
    const shipperName = logisticsCompany?.split("-")[1];
    if ((logisticsCompany && logisticsTrackingNumber) || filesList.length) {
      const attachment: Array<any> = [];
      const attachmentContentType: Array<any> = [];
      filesList.forEach((item: any) => {
        attachment.push(item.files);
        attachmentContentType.push(item.filesContentType);
      });
      confirmDeliveryFn({
        variables: {
          stockTableId: deliveryInfo?.stock.stockDetails.stockTableId,
          attachment: attachment,
          attachmentContentType: attachmentContentType,
          logisticCode: logisticsTrackingNumber,
          shipperCode: shipperCode,
          shipperName: shipperName,
        },
        onCompleted: () => {
          messageApi.success("发货成功！");
          ref.current.reload();
          setComfirmOpen(false);
        },
        onError: (err) => {
          const errInfo = JSON.parse(JSON.stringify(err));
          messageApi.error(
            errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
              ? errInfo.message
              : "发货失败，请稍后重试",
          );
        },
      });
    } else {
      messageApi.warning("请完善物流信息或上传物流凭证！");
    }
  };
  return (
    <>
      {contextHolder}
      <ProTable
        actionRef={ref}
        editableFormRef={formRef}
        tableAlertRender={false}
        alwaysShowAlert
        bordered
        rowKey={
          ["NOT_STOCK", "NOT_STOCK_PAY", "UNSHIPPED"].includes(activeKey)
            ? "prepareItemId"
            : "stockTableId"
        }
        dateFormatter="string"
        recordCreatorProps={false}
        search={false}
        scroll={{
          y: "55vh",
        }}
        columns={columns}
        rowSelection={
          ["NOT_STOCK", "NOT_STOCK_PAY", "UNSHIPPED"].includes(activeKey)
            ? {
                selectedRowKeys,
                hideSelectAll: true,
                onChange: (newSelectedRowKeys: any, selectedRows: any) => {
                  if (selectedRows.length === 1) {
                    setCurrentCompany(selectedRows[0].companyId);
                  }
                  if (selectedRows.length > 1) {
                    if (
                      currentCompany ===
                      selectedRows[selectedRows.length - 1].companyId
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
            : false
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
            stockStatus: activeKey,
            orderId: orderId,
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
          };
          const { data } = await ([
            "NOT_STOCK",
            "NOT_STOCK_PAY",
            "UNSHIPPED",
          ].includes(activeKey)
            ? getUnshippedGoodsList({
                variables: {
                  params,
                },
                fetchPolicy: "no-cache",
                onCompleted: (res) => {
                  const { stockList, __typename, ...newObj } =
                    res.stock.listPrepareItem;
                  setPagination(newObj);
                },
              })
            : getShippedGoodsList({
                variables: {
                  params,
                },
                fetchPolicy: "no-cache",
                onCompleted: (res) => {
                  const { stockList, __typename, ...newObj } =
                    res.stock.listStockTable;
                  setPagination(newObj);
                },
              }));
          if (["NOT_STOCK", "NOT_STOCK_PAY", "UNSHIPPED"].includes(activeKey)) {
            setEditableRowKeys(
              data?.stock.listPrepareItem.stockList.map(
                (item: any) => item.orderItemId,
              ),
            );
          }
          return Promise.resolve({
            data: ["NOT_STOCK", "NOT_STOCK_PAY", "UNSHIPPED"].includes(
              activeKey,
            )
              ? data?.stock.listPrepareItem.stockList
              : data?.stock.listStockTable.stockList,
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
                {["NOT_STOCK", "NOT_STOCK_PAY"].includes(activeKey) && (
                  <Select
                    defaultValue="生成出库单"
                    onChange={(e) => {
                      setActiveKey(e);
                      ref.current.reload();
                    }}
                    options={[
                      { label: "生成出库单", value: "NOT_STOCK" },
                      { label: "通知付款", value: "NOT_STOCK_PAY" },
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
                  placeholder="请选择交易商"
                  request={async () => {
                    const { data } = await getBuyerData();
                    const items = data?.order.offerMyCompanies;
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
      {["NOT_STOCK", "NOT_STOCK_PAY", "UNSHIPPED"].includes(activeKey) && (
        <Space
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            display: "flex",
            backgroundColor: "#fff",
            justifyContent: "center",
            marginTop: 20,
            padding: 20,
            boxShadow: "0px -5px 5px 0px rgba(0, 0, 0, 0.2)",
          }}
        >
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
                const newList: Array<any> = selectedRows.map(
                  (item: any) => item.prepareItemId,
                );
                setEditableRowKeys(newList);
                setOpen(true);
              } else {
                messageApi.warning("请选择需要操作的明细！");
              }
            }}
          >
            生成出库单
          </Button>
          {activeKey === "NOT_STOCK_PAY" && (
            <Button
              loading={notifyLoading}
              style={{
                borderWidth: 1,
                borderColor: "#4E83FD",
                color: "#4E83FD",
                height: 40,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 2,
                marginLeft: 20,
              }}
              onClick={() => {
                if (selectedRows.length > 0) {
                  noticeMethod();
                } else {
                  messageApi.warning("请选择需要通知的对象！");
                }
              }}
            >
              通知付款
            </Button>
          )}
        </Space>
      )}
      {/* 生成出库单Modal */}
      <Content
        open={open}
        centered
        modalProps={{
          destroyOnClose: true,
        }}
        onCancel={() => {
          setOpen(false);
        }}
        footer={null}
        width={1200}
      >
        <span style={{ height: 540 }}>
          <Space
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              height: 56,
              backgroundColor: "#F3F3F3",
              borderBottom: "1px solid #E7E7E7",
              paddingLeft: 30,
              paddingRight: 30,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600 }}>生成出库单</span>
          </Space>
          <div
            style={{
              height: 600,
              padding: 30,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ProTable
              editableFormRef={formRef}
              alwaysShowAlert
              bordered
              rowKey="prepareItemId"
              dateFormatter="string"
              recordCreatorProps={false}
              open={open}
              value={selectedRows}
              search={false}
              scroll={{
                y: "50vh",
              }}
              columns={editColumns}
              editable={{
                editableKeys,
                type: "multiple",
                onChange: setEditableRowKeys,
              }}
            />
            <Button
              style={{
                position: "absolute",
                bottom: 30,
                height: 40,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 2,
                zIndex: 999,
              }}
              type="primary"
              loading={createLoading}
              onClick={() => {
                createMethod();
              }}
            >
              确认生成
            </Button>
          </div>
        </span>
      </Content>
      {/* 生成出库单成功Modal */}
      <Content
        open={okOpen}
        centered
        closable={false}
        footer={null}
        width={400}
      >
        <Space
          style={{
            width: 400,
            display: "flex",
            justifyContent: "center",
            border: "1px solid #E9E9E9",
            borderWidth: 0,
            borderBottomWidth: 1,
            padding: 10,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600 }}>提示</span>
        </Space>
        <Space
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 30,
          }}
        >
          <CheckCircleOutlined style={{ fontSize: 30, color: "#22CD27" }} />
          <div style={{ fontSize: 16 }}>已生成出库单，</div>
          <div style={{ fontSize: 16 }}>完善物流信息即可完成发货操作！</div>
        </Space>
        <span
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 30,
          }}
        >
          <Button
            onClick={() => {
              setStockTableId("");
              setOkOpen(false);
            }}
            style={{
              backgroundColor: "#F0F2F5",
              color: "#4E83FD",
              borderWidth: 0,
            }}
          >
            稍后完善
          </Button>
          <Button
            onClick={() => {
              setComfirmOpen(true);
            }}
            type="primary"
            style={{ marginLeft: 30, backgroundColor: "#4E83FD" }}
          >
            立刻完善
          </Button>
        </span>
      </Content>
      {/* 确认发货Modal */}
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
              borderBottom: "1px solid #E7E7E7",
              paddingLeft: 30,
              paddingRight: 30,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {"SHIPPED" === activeKey ? "详情" : "确认发货"}
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
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                收货单位：
                {deliveryInfo?.stock.stockDetails.inquiryCompanyName}
                <Popconfirm
                  title={
                    <Space
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        paddingTop: 15,
                      }}
                    >
                      <p>
                        收货人：
                        {deliveryInfo?.stock.stockDetails.receiveName || "-"}
                      </p>
                      <p>
                        收货人电话：
                        {deliveryInfo?.stock.stockDetails.receiveMobile || "-"}
                      </p>
                      <p>
                        收货地址：
                        {deliveryInfo?.stock.stockDetails.receiveAddress || "-"}
                      </p>
                    </Space>
                  }
                  showCancel={false}
                  icon={null}
                  okButtonProps={{ style: { display: "none" } }}
                >
                  <Button type="link">地址</Button>
                </Popconfirm>
              </span>
              {"SHIPPED" === activeKey ? (
                <Space style={{ color: "#000", fontSize: 16 }}>
                  物流凭证：
                  {deliveryInfo?.stock.stockDetails.attachment.length ? (
                    deliveryInfo?.stock.stockDetails.attachment.map(
                      (item: any, index: number) => (
                        <Preview
                          key={index}
                          item={item}
                          index={index}
                          types={
                            deliveryInfo?.stock.stockDetails
                              .attachmentContentType
                          }
                        />
                      ),
                    )
                  ) : (
                    <span style={{ color: "#ddd" }}>暂无</span>
                  )}
                </Space>
              ) : (
                <ProForm formRef={deliveryRef} submitter={false}>
                  <Space style={{ display: "flex", alignItems: "flex-start" }}>
                    <ProFormSelect
                      name={"logisticsCompany"}
                      showSearch
                      placeholder="请选择物流公司"
                      request={async (v) => {
                        const { data } = await getLogisticsCompanyList(
                          v.keyWords || null,
                        );
                        return data.map((item: any) => ({
                          label: item.name,
                          value: item.name + "-" + item.code,
                        }));
                      }}
                    />
                    <ProFormText
                      name="logisticsTrackingNumber"
                      placeholder="请输入物流号"
                    />
                    <Space
                      style={{
                        color: "#929497",
                        fontWeight: 600,
                        marginTop: 5,
                      }}
                    >
                      或
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
              )}
            </Space>
            <ProTable
              alwaysShowAlert
              bordered
              rowKey="stockItemId"
              dateFormatter="string"
              recordCreatorProps={false}
              value={deliveryInfo?.stock.stockDetails.itemList.map(
                (item: any) => ({
                  ...item,
                  companyName:
                    deliveryInfo?.stock.stockDetails.inquiryCompanyName,
                }),
              )}
              search={false}
              scroll={{
                y: "50vh",
              }}
              columns={comfirmColumns}
              editable={{
                editableKeys,
                type: "multiple",
                onChange: setEditableRowKeys,
              }}
            />
            {activeKey === "SHIPPED_VERIFY" && (
              <Button
                style={{
                  position: "absolute",
                  bottom: 30,
                  height: 40,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 2,
                  zIndex: 999,
                }}
                type="primary"
                loading={deliveryLoading}
                onClick={confirmMethod}
              >
                确认发货
              </Button>
            )}
          </div>
        </span>
      </Content>
    </>
  );
};

export default SendGoodsListView;

import RealNameModal from "@/components/RealName";
import RelatedOrderCard from "@/components/Workstand/RelatedOrderCard";
import SignContractModal from "@/components/Workstand/SignContractModal";
import {
  changeDeliveryType,
  closeOrder,
  confirmOrder,
  getOrderDetail,
  getRelevancyOrder,
  getTransctionInfo,
  quiryOrderDoc,
} from "@/services";
import { closeWin } from "@/utils";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import { EditOutlined } from "@ant-design/icons";
import { EditableProTable } from "@ant-design/pro-components";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { styled, useSearchParams } from "@umijs/max";
import type { DescriptionsProps } from "antd";
import {
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Popconfirm,
  Popover,
  Space,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { useEffect, useRef, useState } from "react";

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
    margin-block-start: "10px";
  }
  .ant-form {
    display: flex;
  }
`;

const CardContainer: any = styled(Card)`
  .ant-card-body {
    padding: 10px 0px;
  }
`;

const { TextArea } = Input;

const types: any = {
  CREATE: "新建",
  ONGOING: "进行中",
  DONE: "完成",
  CLOSE: "关闭",
};

const orderTypes: any = {
  NORMAL: "普通订单",
  PROTOCOL: "协议订单",
  REBATE: "报价订单",
  ADVANCE: "垫资订单",
  STORE_SPECIAL: "特价商城订单",
  OPERATION: "手动创建订单",
  BIDDING: "特价招标订单",
  APP_OPERATION: "app订单",
};

export default function OrderDetailView() {
  const [search] = useSearchParams();
  const orderId = search.get("orderId");
  const type = search.get("type");
  const ref: any = useRef(null);
  const formRef: any = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [closeOrderVisible, setCloseOrderVisible] = useState(false);
  const [signContractVisible, setSignContractVisible] = useState(false);
  const [value, setValue] = useState("");
  const [orderInfo, setOrderInfo]: any = useState({
    orderId: `${orderId}(${types["CREATE"]})`,
    createAt: new Date(),
    tradeTime: new Date(),
    orderType: "-",
    tradingPartner: "-",
    payMethod: "-",
    delivery: false,
    mobileNo: "-",
    status: "",
    amount: "-",
    orderShow: "",
    contractMergeStatus: "",
    id: "",
    orderShowText: "-",
    items: [],
    accountId: "",
    relatedOrderInfo: "",
    stockAddressInfo: {},
    billAddressInfo: {},
    tax: 0,
  });
  // 是否实名认证
  const [isRealName, setIsRealName] = useState(false);
  const { authority } = JSON.parse(localStorage.getItem("userInfo") || "{}");
  // request
  const [getOrderInfo, { refetch }] = useLazyQuery(getOrderDetail);
  const [getTransctionList] = useLazyQuery(getTransctionInfo);
  const [getOrderDocInfo, { data: docInfo, loading: signLoading }] =
    useLazyQuery(quiryOrderDoc);
  const { data: relatedOrder } = useQuery(getRelevancyOrder, {
    variables: {
      orderItemId: orderInfo.items.map((item: any) => item.id),
    },
    fetchPolicy: "no-cache",
    skip: !authority.includes(1) || orderInfo.items.length < 0,
  });
  const [closeOrderFn, { loading }] = useMutation(closeOrder);
  const [confirmOrderFn, { loading: confirmLoading }] =
    useMutation(confirmOrder);
  const [changeType] = useMutation(changeDeliveryType);
  const columns = [
    {
      title: "序",
      dataIndex: "index",
      valueType: "index",
      editable: false,
      width: "4%",
    },
    {
      title: "品牌",
      dataIndex: "brandName",
      editable: false,
      width: "6%",
    },
    {
      title: "品名/型号",
      dataIndex: "model",
      editable: false,
      width: "18%",
    },
    {
      title: "单位",
      dataIndex: "unit",
      editable: false,
      width: "8%",
    },
    {
      title: "数量",
      dataIndex: "quantity",
      editable: false,
      width: "7%",
    },
    {
      title: "单价（元）",
      dataIndex: "price",
      align: "center",
      editable: false,
      width: "8%",
      render: (v: string) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: "金额（元）",
      dataIndex: "totalAmount",
      align: "center",
      editable: false,
      width: "8%",
      render: (v: string) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: "货期（天）",
      dataIndex: "deliveryDate",
      editable: false,
      width: "8%",
    },
    {
      title: "款项状态",
      editable: false,
      hideInTable: orderInfo.status === "CREATE",
      render: (_: any, record: any) => (
        <span
          style={{
            color: record.percentagePaid !== 0 ? "#159952" : "#666",
          }}
        >
          {record.percentagePaid === 0
            ? "未付款"
            : "已付款(" + (record.percentagePaid * 100).toFixed(0) + "%" + ")"}
          /
          {record.percentageCollection === 0
            ? "未收款"
            : "已收款(" +
              (record.percentageCollection * 100).toFixed(0) +
              "%" +
              ")"}
        </span>
      ),
    },
    {
      title: "货物状态",
      editable: false,
      hideInTable: orderInfo.status === "CREATE",
      render: (_: any, record: any) => (
        <span
          style={{ color: record.percentageShipped !== 0 ? "#159952" : "#666" }}
        >
          {record.percentageShipped === 0
            ? "未付款"
            : `已付款(${(record.percentageShipped * 100).toFixed(0) + "%"})`}
          /
          {record.percentageReceived === 0
            ? "未收款"
            : `已收款(${(record.percentageReceived * 100).toFixed(0) + "%"})`}
        </span>
      ),
    },
    {
      title: "票据状态",
      editable: false,
      hideInTable: orderInfo.status === "CREATE",
      render: (_: any, record: any) => (
        <span
          style={{
            color: record.percentageInvoiced !== 0 ? "#159952" : "#666",
          }}
        >
          {record.percentageInvoiced === 0
            ? "未付款"
            : `已付款(${(record.percentageInvoiced * 100).toFixed(0) + "%"})`}
          /
          {record.percentageTickets === 0
            ? "未收款"
            : `已收款(${(record.percentageTickets * 100).toFixed(0) + "%"})`}
        </span>
      ),
    },
  ];
  useEffect(() => {
    if (orderInfo.id) {
      getTransctionList({
        variables: {
          classify:
            authority.includes(1) || type === "supply"
              ? "SUPPELIER"
              : "PURCHASE",
          orderId: orderInfo.id,
          accountId: orderInfo.accountId,
        },
        fetchPolicy: "no-cache",
        onCompleted: (res) => {
          const data = res.order.transactionInfo;
          setOrderInfo({
            ...orderInfo,
            payMethod: `现货（${
              data?.moneyBillPayment.actualsDebt === 1 ? "款到发货" : "货到付款"
            }）/ 期货（${
              data?.moneyBillPayment.futuresDebt === 1 ? "款到发货" : "货到付款"
            }）`,
            delivery: data.directDelivery,
            mobileNo: `${data?.shippingAddress?.[0].name} 
            （${data?.shippingAddress?.[0].mobile}）`,
            relatedOrderInfo: `${data.originOrderInfo.orderId}    ${data.originOrderInfo.offerNikeName}`,
            tradeTime: data.orderInfo.tradeTime,
            stockAddressInfo: data.billingAddress[0],
            billAddressInfo: data.shippingAddress[0],
          });
        },
      });
    }
  }, [orderInfo.id]);
  // 关闭订单
  const closeOrderMethod = () => {
    if (value.trim() === "") {
      messageApi.error("备注文字不能为空");
    } else {
      closeOrderFn({
        variables: {
          params: {
            comment: value,
            orderId: orderInfo?.id,
          },
        },
        onCompleted: () => {
          messageApi.success("关闭订单成功").then(() => {
            closeWin(`合同详情-${orderId}`);
          });
        },
        onError: (err) => {
          const errInfo = JSON.parse(JSON.stringify(err));
          messageApi.error(
            errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
              ? errInfo.message
              : "关闭失败，请稍后重试！",
          );
        },
      });
    }
  };
  // 确定订单
  const confirmOrderMethod = () => {
    // 是否实名认证
    let signature = JSON.parse(
      localStorage.getItem("userInfo") ?? "{}",
    )?.signature;
    if (signature) {
      confirmOrderFn({
        variables: {
          params: {
            items: [],
            orderId: orderInfo.id,
          },
        },
        onCompleted: () => {
          messageApi.success("确认订单成功");
          refetch();
        },
        onError: (err) => {
          const errInfo = JSON.parse(JSON.stringify(err));
          messageApi.error(
            errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
              ? errInfo.message
              : "确认失败，请稍后重试！",
          );
        },
      });
    } else {
      setIsRealName(true);
    }
  };
  // 签署合同
  const signContractMethod = () => {
    getOrderDocInfo({
      fetchPolicy: "no-cache",
      variables: {
        orderId: orderId,
      },
      onCompleted: () => {
        setSignContractVisible(true);
      },
    });
  };
  const formatDate = (date: Date) => {
    const newDate = `${new Date(date).toLocaleDateString().replaceAll("/", "-")}
    ${new Date(date).toLocaleTimeString()}`;
    return date ? newDate : "";
  };
  const items: DescriptionsProps["items"] = authority.includes(0)
    ? [
        {
          key: "1",
          label: "订单号",
          children: orderInfo.orderId,
        },
        {
          key: "2",
          label: "创建时间",
          children: formatDate(orderInfo.createAt),
        },
        {
          key: "3",
          label: "收货地址",
          children: (
            <span>
              {orderInfo.stockAddressInfo.name +
                " " +
                orderInfo.stockAddressInfo.mobile}
              <Popover
                placement="bottom"
                content={
                  <div>
                    <div>
                      {orderInfo.stockAddressInfo?.name +
                        " " +
                        orderInfo.stockAddressInfo?.mobile}
                    </div>
                    <div>
                      {orderInfo.stockAddressInfo?.viewArea?.name +
                        orderInfo.stockAddressInfo?.viewCity?.name +
                        orderInfo.stockAddressInfo?.viewProvince?.name +
                        orderInfo.stockAddressInfo.detailAddr}
                    </div>
                  </div>
                }
              >
                <span
                  style={{
                    color: "#4E83FD",
                    marginLeft: 10,
                    cursor: "pointer",
                  }}
                >
                  更多
                </span>
              </Popover>
            </span>
          ),
        },
        {
          key: "4",
          label: authority.includes(1) ? "采购商" : "供应商",
          children: orderInfo.tradingPartner,
        },
        {
          key: "5",
          label: "付款方式",
          children: (
            <span style={{ color: "#4E83FD" }}>{orderInfo.payMethod}</span>
          ),
        },
        {
          key: "6",
          label: "收票地址",
          children: (
            <span>
              {orderInfo.billAddressInfo?.name +
                " " +
                orderInfo.billAddressInfo?.mobile}
              <Popover
                placement="bottom"
                content={
                  <div>
                    <div>
                      {orderInfo.billAddressInfo?.name +
                        " " +
                        orderInfo.billAddressInfo?.mobile}
                    </div>
                    <div>
                      {orderInfo.billAddressInfo.viewArea?.name +
                        orderInfo.billAddressInfo.viewCity?.name +
                        orderInfo.billAddressInfo.viewProvince?.name +
                        orderInfo.billAddressInfo.detailAddr}
                    </div>
                  </div>
                }
              >
                <span
                  style={{
                    color: "#4E83FD",
                    marginLeft: 10,
                    cursor: "pointer",
                  }}
                >
                  更多
                </span>
              </Popover>
            </span>
          ),
        },
        {
          key: "7",
          label: "联系人",
          children: orderInfo.mobileNo,
        },
        {
          key: "8",
          label: "税率",
          children: orderInfo.tax * 100 + "%" + "（增值发票）",
        },
        {
          key: "9",
          label: "合同状态",
          children: (
            <span style={{ color: "#F29D39" }}>{orderInfo.orderShowText}</span>
          ),
        },
      ]
    : authority.includes(1)
    ? [
        {
          key: "1",
          label: "订单号",
          children: orderInfo.orderId,
        },
        {
          key: "2",
          label: "创建时间",
          children: timeStampToNormalTime(orderInfo.createAt),
        },
        {
          key: "3",
          label: "订单类型",
          children: orderTypes[orderInfo.orderType],
        },
        {
          key: "4",
          label: authority.includes(1) ? "采购商" : "供应商",
          children: orderInfo.tradingPartner,
        },
        {
          key: "5",
          label: "付款方式",
          children: (
            <span style={{ color: "#4E83FD" }}>{orderInfo.payMethod}</span>
          ),
        },
        {
          key: "6",
          label: "发货方式",
          children: (
            <span>
              {orderInfo.delivery ? "货物直发" : "平台中转"}
              {!orderInfo.delivery && (
                <Popconfirm
                  placement="bottomRight"
                  title={"请确认是否修改为货物直发，一经修改不可回退！"}
                  onConfirm={() => {
                    changeType({
                      variables: {
                        orderId: orderId,
                      },
                      onCompleted: () => {
                        messageApi.success("修改成功！");
                        setOrderInfo({
                          ...orderInfo,
                          delivery: true,
                        });
                      },
                      onError: () => {
                        messageApi.error("修改失败，请稍后重试！");
                      },
                    });
                  }}
                  okText="是"
                  cancelText="否"
                >
                  <EditOutlined
                    style={{
                      marginLeft: 10,
                      color: "#4E83FD",
                    }}
                  />
                </Popconfirm>
              )}
            </span>
          ),
        },
        {
          key: "7",
          label: "联系人",
          children: orderInfo.mobileNo,
        },
        {
          key: "8",
          label: "总金额（元）",
          children: Number(orderInfo.amount).toFixed(2),
        },
        {
          key: "9",
          label: "合同状态",
          children: (
            <span style={{ color: "#F29D39" }}>{orderInfo.orderShowText}</span>
          ),
        },
      ]
    : [
        {
          key: "1",
          label: "订单号",
          children: orderInfo.orderId,
        },
        {
          key: "2",
          label: "创建时间",
          children: formatDate(orderInfo.createAt),
        },
        {
          key: "3",
          label: "订单类型",
          children: orderTypes[orderInfo.orderType],
        },

        {
          key: "4",
          label: authority.includes(1) ? "采购商" : "供应商",
          children: orderInfo.tradingPartner,
        },
        {
          key: "5",
          label: "交易时间",
          children: formatDate(orderInfo.tradeTime),
        },
        {
          key: "6",
          label: "关联供应订单",
          children: orderInfo.relatedOrderInfo,
        },
        {
          key: "7",
          label: "联系人",
          children: orderInfo.mobileNo,
        },
        {
          key: "8",
          label: "付款方式",
          children: (
            <span style={{ color: "#4E83FD" }}>{orderInfo.payMethod}</span>
          ),
        },
        {
          key: "9",
          label: "合同状态",
          children: (
            <span style={{ color: "#F29D39" }}>{orderInfo.orderShowText}</span>
          ),
        },
      ];
  return (
    <div
      style={{
        height: window.innerHeight,
        padding: 20,
      }}
    >
      {contextHolder}
      <RealNameModal isRealName={isRealName} setIsRealName={setIsRealName} />
      <CardContainer style={{ paddingLeft: 20, paddingRight: 20 }}>
        <Descriptions items={items} style={{ marginTop: 10 }} />
      </CardContainer>
      <CardContainer
        style={{
          marginTop: 20,
          height: orderInfo.status === "CREATE" ? innerHeight * 0.75 : "auto",
        }}
      >
        <div
          style={{
            marginLeft: 20,
            fontSize: 14,
            color: "#000",
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          销售清单（{orderInfo.items.length}）
        </div>
        <ProTable
          actionRef={ref}
          editableFormRef={formRef}
          alwaysShowAlert
          bordered
          rowKey={"id"}
          dateFormatter="string"
          recordCreatorProps={false}
          search={false}
          scroll={{
            y: "55vh",
          }}
          columns={columns}
          request={async () => {
            const { data } = await getOrderInfo({
              variables: {
                orderId: orderId,
              },
              fetchPolicy: "no-cache",
              onCompleted: (res) => {
                const data = res.order.orderInfo;
                setOrderInfo({
                  ...orderInfo,
                  orderId: `${orderId}（${types[data.status]}）`,
                  createAt: data.createAt,
                  orderType: data.orderType,
                  tradingPartner: authority.includes(1)
                    ? data.inquiry.legalPerson
                    : data.offer.legalPerson,
                  amount: data.amount,
                  status: data.status,
                  orderShow: data.orderShow,
                  orderShowText: data.orderShowText,
                  contractMergeStatus: data.contractMergeStatus,
                  id: data.id,
                  items: data.items,
                  accountId: authority.includes(1)
                    ? data?.inquiryAccountId
                    : data?.offerAccountId,
                  tax: data?.tax,
                });
              },
            });
            return Promise.resolve({
              data: data?.order.orderInfo.items,
              success: true,
            });
          }}
        />
        <Space
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: 30,
          }}
        >
          <span style={{ fontSize: 16, color: "#000", fontWeight: 600 }}>
            总金额：
            <span style={{ color: "#FF0C0C" }}>
              ￥{Number(orderInfo.amount).toFixed(2)}
            </span>
          </span>
        </Space>
        {["CREATE", "ONGOING"].includes(orderInfo?.contractMergeStatus) && (
          <Space
            style={{
              position: orderInfo.status === "CREATE" ? "absolute" : "relative",
              bottom: 20,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            {(authority.includes(1) || type === "supply") &&
              orderInfo?.status === "CREATE" &&
              ((["NOT_SUPPLIER_CONFIRMED"].includes(orderInfo?.orderShow) && (
                <Button
                  loading={confirmLoading}
                  style={{
                    height: 40,
                    marginLeft: 20,
                    paddingLeft: 20,
                    paddingRight: 20,
                    borderRadius: 2,
                  }}
                  type="primary"
                  onClick={confirmOrderMethod}
                >
                  确认订单
                </Button>
              )) ||
                ([
                  "NOT_GENERATED",
                  "NOT_DOC_CONFIRMED",
                  "NOT_UPLOADED",
                ].includes(orderInfo?.orderShow) && (
                  <Button
                    disabled={
                      ["NOT_SUPPLIER_CONFIRMED"].includes(
                        orderInfo?.orderShow,
                      ) ||
                      (["NOT_CONFIRMED"].includes(orderInfo?.orderShow) &&
                        authority.includes(1))
                    }
                    style={{
                      height: 40,
                      marginLeft: 20,
                      paddingLeft: 20,
                      paddingRight: 20,
                      borderRadius: 2,
                    }}
                    type="primary"
                    onClick={signContractMethod}
                  >
                    签署合同
                  </Button>
                )))}
            {(authority.includes(6) || type === "purchase") &&
              ["CREATE"].includes(orderInfo?.status) &&
              (["NOT_CONFIRMED"].includes(orderInfo?.orderShow) ? (
                // orderInfo?.orderType !== "OPERATION" ? (
                <Button
                  loading={confirmLoading}
                  style={{
                    height: 40,
                    marginLeft: 20,
                    paddingLeft: 20,
                    paddingRight: 20,
                    borderRadius: 2,
                  }}
                  type="primary"
                  onClick={confirmOrderMethod}
                >
                  确认订单
                </Button>
              ) : (
                // ) : (
                //   <Button
                //     loading={confirmLoading}
                //     style={{
                //       height: 40,
                //       marginLeft: 20,
                //       paddingLeft: 20,
                //       paddingRight: 20,
                //       borderRadius: 2,
                //     }}
                //     type="primary"
                //   >
                //     选择供应商
                //   </Button>
                // )
                <Button
                  disabled={
                    ["NOT_SUPPLIER_CONFIRMED"].includes(orderInfo?.orderShow) ||
                    (["NOT_CONFIRMED"].includes(orderInfo?.orderShow) &&
                      authority.includes(1))
                  }
                  style={{
                    height: 40,
                    marginLeft: 20,
                    paddingLeft: 20,
                    paddingRight: 20,
                    borderRadius: 2,
                  }}
                  type="primary"
                  onClick={signContractMethod}
                >
                  签署合同
                </Button>
              ))}
          </Space>
        )}
      </CardContainer>
      {orderInfo.status !== "CREATE" && authority.includes(1) && (
        <CardContainer style={{ marginTop: 20 }}>
          <div
            style={{
              marginLeft: 20,
              fontSize: 14,
              color: "#000",
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            关联采购订单
          </div>
          <RelatedOrderCard info={relatedOrder?.order.relevancyOrder} />
        </CardContainer>
      )}
      {/* 关闭订单 */}
      <Modal
        open={closeOrderVisible}
        centered
        closable={false}
        confirmLoading={loading}
        onCancel={() => {
          setValue("");
          setCloseOrderVisible(false);
        }}
        onOk={closeOrderMethod}
      >
        <span style={{ color: "red", fontSize: 12 }}>
          注意：订单被关闭后,将无法继续交易！
        </span>
        <TextArea
          value={value}
          style={{ marginTop: 30, marginBottom: 20 }}
          onChange={(e) => setValue(e.target.value)}
          placeholder="请输入备注说明文字（50字以内）"
          maxLength={50}
          autoSize={{ minRows: 1, maxRows: 2 }}
          showCount
        />
      </Modal>
      {/* 签署合同 */}
      <SignContractModal
        open={signContractVisible}
        setOpen={setSignContractVisible}
        docInfo={docInfo?.order.orderInfo.doc}
      />
    </div>
  );
}

import RealNameModal from "@/components/RealName";
import TransctionMenuItem from "@/components/Workstand/TransctionMenuItem";
import {
  closeOrder,
  confirmOrder,
  getOrderDetail,
  getTransctionInfo,
  quiryOrderDoc,
} from "@/services";
import { EditableProTable } from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import type { MenuProps } from "antd";
import { Button, Dropdown, Input, Modal, Space, message } from "antd";
import { useRef, useState } from "react";
import { styled, useSearchParams } from "umi";

import Address from "@/assets/order/address.png";
import Bank from "@/assets/order/bank.png";
import Pay from "@/assets/order/pay.png";
import { closeWin } from "@/utils";

import SignContractModal from "@/components/Workstand/SignContractModal";

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
    margin-block-start: 25px;
  }
  .ant-form {
    display: flex;
  }
`;

const { TextArea } = Input;

export default function ContractDetailView() {
  const [search] = useSearchParams();
  const orderId = search.get("orderId");
  const type = search.get("type");
  const ref: any = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [closeOrderVisible, setCloseOrderVisible] = useState(false);
  const [signContractVisible, setSignContractVisible] = useState(false);
  const [value, setValue] = useState("");
  const [orderInfo, setOrderInfo] = useState({
    name: "-",
    status: "-",
    amount: "-",
    orderShow: "-",
    contractMergeStatus: "-",
    id: "",
  });
  // 是否实名认证
  const [isRealName, setIsRealName] = useState(false);
  const [getOrderInfo] = useLazyQuery(getOrderDetail);
  const [getTransctionList, { data: transctionInfo }] =
    useLazyQuery(getTransctionInfo);
  const [getOrderDocInfo, { data: docInfo, loading: signLoading }] =
    useLazyQuery(quiryOrderDoc);
  const [closeOrderFn, { loading }] = useMutation(closeOrder);
  const [confirmOrderFn, { loading: confirmLoading }] =
    useMutation(confirmOrder);
  const transctionData = transctionInfo?.order.transactionInfo;
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
      width: "8%",
    },
    {
      title: "询价内容",
      dataIndex: "model",
      editable: false,
    },
    {
      title: "单位",
      dataIndex: "unit",
      editable: false,
      width: "4%",
    },
    {
      title: "数量",
      dataIndex: "quantity",
      editable: false,
      width: "4%",
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
      render: (v: string) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: "货期（天）",
      dataIndex: "deliveryDate",
      align: "center",
      editable: false,
      width: "8%",
    },
    {
      title: "款项状态",
      editable: false,
      render: (_: any, record: any) =>
        ` ${
          record.percentagePaid === 0
            ? "未付款"
            : `已付款(${(record.percentagePaid * 100).toFixed(0) + "%"})`
        } / ${
          record.percentageCollection === 0
            ? "未收款"
            : `已收款(${(record.percentageCollection * 100).toFixed(0) + "%"})`
        }`,
    },
    {
      title: "货物状态",
      editable: false,
      render: (_: any, record: any) =>
        ` ${
          record.percentageShipped === 0
            ? "未付款"
            : `已付款(${(record.percentageShipped * 100).toFixed(0) + "%"})`
        } / ${
          record.percentageReceived === 0
            ? "未收款"
            : `已收款(${(record.percentageReceived * 100).toFixed(0) + "%"})`
        }`,
    },
    {
      title: "票据状态",
      editable: false,
      render: (_: any, record: any) =>
        ` ${
          record.percentageInvoiced === 0
            ? "未付款"
            : `已付款(${(record.percentageInvoiced * 100).toFixed(0) + "%"})`
        } / ${
          record.percentageTickets === 0
            ? "未收款"
            : `已收款(${(record.percentageTickets * 100).toFixed(0) + "%"})`
        }`,
    },
  ];
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <TransctionMenuItem
          icon={Address}
          title={"收货地址"}
          topText={
            transctionData?.shippingAddress?.[0].viewProvince.name +
            transctionData?.shippingAddress?.[0].viewCity.name +
            transctionData?.shippingAddress?.[0].viewArea.name +
            transctionData?.shippingAddress?.[0].detailAddr
          }
          bottomText={`${transctionData?.shippingAddress?.[0].name} 
          ${transctionData?.shippingAddress?.[0].mobile}`}
        />
      ),
    },
    {
      key: "2",
      label: (
        <TransctionMenuItem
          icon={Address}
          title={"收票地址"}
          topText={
            transctionData?.billingAddress?.[0].viewProvince.name +
            transctionData?.billingAddress?.[0].detailAddr
          }
          bottomText={`${transctionData?.billingAddress?.[0].name} 
          ${transctionData?.billingAddress?.[0].mobile}`}
        />
      ),
    },
    {
      key: "3",
      label: (
        <TransctionMenuItem
          icon={Bank}
          title={"收款信息"}
          topText={transctionData?.bankContents?.[0].viewBank.name}
          bottomText={
            transctionData?.bankContents?.[0].bankBranch +
            "  " +
            transctionData?.bankContents?.[0].bankAccount
          }
        />
      ),
    },
    {
      key: "4",
      label: (
        <TransctionMenuItem
          icon={Pay}
          title={"付款方式"}
          topText={`现货（${
            transctionData?.moneyBillPayment.actualsDebt === 1
              ? "款到发货"
              : "货到付款"
          }）/ 期货（${
            transctionData?.moneyBillPayment.futuresDebt === 1
              ? "款到发货"
              : "货到付款"
          }）`}
        />
      ),
    },
  ];
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
            orderId: orderInfo?.id,
          },
        },
        onCompleted: () => {
          messageApi.success("确认订单成功");
          ref.current.reload();
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
  return (
    <div
      style={{
        height: window.innerHeight,
        position: "relative",
      }}
    >
      {contextHolder}
      <RealNameModal isRealName={isRealName} setIsRealName={setIsRealName} />
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 20,
          paddingRight: 25,
          paddingLeft: 25,
        }}
      >
        <div>
          <span style={{ color: "#000", fontWeight: 500 }}>
            {type === "purchase" ? "供应商" : "采购商"}：{orderInfo.name}
          </span>
          <Dropdown menu={{ items }} placement="bottomLeft">
            <Button type="link">交易信息详情</Button>
          </Dropdown>
        </div>
        <span style={{ color: "#F29D39" }}>状态：{orderInfo.status}</span>
      </div>
      <ProTable
        alwaysShowAlert
        borderedstatus
        actionRef={ref}
        dateFormatter="string"
        request={async () => {
          const { data } = await getOrderInfo({
            variables: {
              orderId: orderId,
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const data = res.order.orderInfo;
              setOrderInfo({
                name: type === "purchase" ? data.offer.name : data.inquiry.name,
                status: data.orderShowText,
                amount: data.amount,
                orderShow: data.orderShow,
                contractMergeStatus: data.contractMergeStatus,
                id: data.id,
              });
              getTransctionList({
                variables: {
                  classify: type === "supply" ? "SUPPELIER" : "PURCHASE",
                  orderId: data?.id,
                  accountId:
                    type === "supply"
                      ? data?.inquiryAccountId
                      : data?.offerAccountId,
                },
              });
            },
          });
          return Promise.resolve({
            data: data.order.orderInfo.items,
            success: true,
          });
        }}
        recordCreatorProps={false}
        search={false}
        rowKey="id"
        scroll={{
          y: "55vh",
        }}
        columns={columns}
      />
      <Space
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: 20,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        总金额:
        <span style={{ color: "#FF0C0C" }}>
          ￥{Number(orderInfo?.amount).toFixed(2)}
        </span>
      </Space>
      {["CREATE", "ONGOING"].includes(orderInfo?.contractMergeStatus) && (
        <Space
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: 20,
            padding: 20,
            boxShadow: "0px -5px 5px 0px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Button
            style={{
              borderWidth: 1,
              borderColor: "#4E83FD",
              color: "#4E83FD",
              height: 40,
              paddingLeft: 20,
              paddingRight: 20,
              borderRadius: 2,
            }}
            onClick={() => {
              setCloseOrderVisible(true);
            }}
          >
            关闭订单
          </Button>
          {(type === "purchase" &&
            ["NOT_CONFIRMED"].includes(orderInfo?.orderShow)) ||
          (type === "supply" &&
            ["NOT_SUPPLIER_CONFIRMED"].includes(orderInfo?.orderShow)) ? (
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
            <Button
              disabled={
                ["NOT_SUPPLIER_CONFIRMED"].includes(orderInfo?.orderShow) ||
                (["NOT_CONFIRMED"].includes(orderInfo?.orderShow) &&
                  type === "supply")
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
          )}
        </Space>
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

import Address from "@/assets/order/address.png";
import Bank from "@/assets/order/bank.png";
import Pay from "@/assets/order/pay.png";
import Loading from "@/components/Loading";
import RealNameModal from "@/components/RealName";
import VerifyInput from "@/components/Workstand/VerifyInput";
import { createDirects, sendMessages } from "@/methods";
import {
  beforeGenerateOrder,
  createOrder,
  deleteAddress,
  getTransctionInfo,
} from "@/services";
import { createWin, formatAmount, random } from "@/utils";
import { EditOutlined } from "@ant-design/icons";
import { EditableProTable, ModalForm } from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useRequest } from "ahooks";
import type { RadioChangeEvent } from "antd";
import {
  Button,
  Card,
  Dropdown,
  Modal,
  Popconfirm,
  Radio,
  Space,
  message,
} from "antd";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { styled } from "umi";
import AddAddress from "./AddAddress";

const ProTable = styled(EditableProTable)`
  .ant-pro-card-body {
    padding-inline: 0;
  }
`;

const ItemBox = styled.div`
  padding: 20px 20px 0;
  margin-bottom: 25px;
  border: 1px solid #e7e7e7;
  border-radius: 10px;
  .titleBox {
    display: flex;
    // justify-content: space-between;
    padding-bottom: 10px;
    font-size: 16px;
    .titleItem {
      color: #4e83fd;
      cursor: pointer;
    }
  }
  :where(.css-dev-only-do-not-override-19gw05y).ant-radio-group {
    width: 100%;
  }
`;

const OrderItem = memo(
  ({
    item,
    handleOrderList,
    index,
    goodsOpen,
    setGoodsOpen,
    setBillOpen,
    billOpen,
    setReceptionOpen,
    receptionOpen,
    deliveryAddressId, // 已确定收货地址
    setDeliveryAddressId, // 设置已确定收货地址
    ticketAddressId, // 已确定收票地址
    setTicketAddressId, // 设置已确定收票地址
    confirmSelectShippingAddressId,
    setConfirmSelectShippingAddressId,
    confirmSelectBillingAddressId,
    setConfirmSelectBillingAddressId,
    bankContent,
    setBankContent,
    selectBlank,
    setSelectBlank,
  }: any) => {
    // 修改增加地址收货、收票区分
    const [addressType, setAddressType] = useState<string>();
    const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false); // 修改增加地址modal
    // 初始收货地址id
    const [initDeliveryAddressId, setInitDeliveryAddressId] = useState();
    // 初始收票地址id
    const [initTicketAddressId, setInitTicketAddressId] = useState();
    // 收货地址数据
    const [shippingAddress, setshippingAddress] = useState<any[]>([]);
    // 收票地址数据
    const [billingAddress, setBillingAddress] = useState<any[]>([]);
    // 收货收票地址单条数据
    const [itemAddressInfo, setItemAddressInfo] = useState<any[]>([]);

    const payNode: any = {
      PREPARE_GOODS: "发货前",
      CONSTRACT: "合同签订后",
      RECEIVING: "签收后",
    };

    // 获取交易信息
    const [
      getTransctionInfoFun,
      { data: getSendWay, loading: transctionInfoLoading },
    ] = useLazyQuery(getTransctionInfo);

    const getTransctionInfos = (id: string) => {
      getTransctionInfoFun({
        variables: {
          classify: "PURCHASE",
          accountId: id,
        },
        fetchPolicy: "no-cache",
        onCompleted: (res) => {
          // 收款信息单选
          if (
            res?.order?.transactionInfo?.bankContents?.[0]?.bankId !==
              selectBlank[index]?.bankId &&
            // selectBlank[index] &&
            selectBlank[index]
          ) {
            setSelectBlank([...selectBlank]);
          } else {
            selectBlank[index] = res?.order?.transactionInfo?.bankContents?.[0];
            setSelectBlank([...selectBlank]);
          }
          // 收货地址单选
          let defaultGoodAddress =
            res.order?.transactionInfo?.shippingAddress.filter(
              (item: any) => item.addFirst,
            );
          setInitDeliveryAddressId(defaultGoodAddress?.[0]?.id);
          if (initDeliveryAddressId !== deliveryAddressId) {
            setDeliveryAddressId(deliveryAddressId);
          } else {
            setDeliveryAddressId(defaultGoodAddress?.[0]?.id);
            setConfirmSelectShippingAddressId(defaultGoodAddress?.[0]?.id);
          }
          // 收票地址单选
          let defaultBillAddress =
            res.order?.transactionInfo?.billingAddress.filter(
              (item: any) => item.billFirst,
            );
          setInitTicketAddressId(defaultBillAddress?.[0]?.id);
          if (initTicketAddressId !== ticketAddressId) {
            setTicketAddressId(ticketAddressId);
          } else {
            setTicketAddressId(defaultBillAddress?.[0]?.id);
            setConfirmSelectBillingAddressId(defaultBillAddress?.[0]?.id);
          }
          setshippingAddress(res.order?.transactionInfo?.shippingAddress);
          setBillingAddress(res.order?.transactionInfo?.billingAddress);
        },
      });
    };

    // 付款方式数据
    let sendWayInfo = getSendWay?.order?.transactionInfo?.moneyBillPayment;

    // 收款信息数据
    let bankContents = getSendWay?.order?.transactionInfo?.bankContents;

    // 删除收货发货收票地址
    const [deleteAddressFun] = useMutation(deleteAddress);

    const deleteAddressHandle = (id: string, type: string) => {
      deleteAddressFun({
        variables: {
          id,
        },
        onCompleted: () => {
          let newAddressArr = shippingAddress.filter(
            (item: any) => item.id !== id,
          );
          if (confirmSelectShippingAddressId === id && type === "goods") {
            setConfirmSelectShippingAddressId("");
          } else if (confirmSelectBillingAddressId === id && type === "bill") {
            setConfirmSelectBillingAddressId("");
          }
          setshippingAddress(newAddressArr);
          message.success("删除成功");
        },
        onError: (err) => {
          const errInfo = JSON.parse(JSON.stringify(err));
          message.error(
            errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
              ? errInfo.message
              : "删除失败,请稍后重试！",
          );
        },
      });
    };

    const onRadioChange = (e: RadioChangeEvent, type: string) => {
      switch (type) {
        case "goods":
          setDeliveryAddressId(e.target.value);
          break;
        case "bill":
          setTicketAddressId(e.target.value);
          break;
        case "bank":
          selectBlank[index] = e.target.value;
          setSelectBlank([...selectBlank]);
          break;
        default:
          break;
      }
    };

    let total = 0;
    item?.orderList?.forEach((item: any) => {
      if (item.total) {
        total += Number(item.total);
      } else {
        let num = 0;
        item.orderList.forEach((i: any) => {
          num += Number(i.total);
        });
        total += num;
      }
    });

    return (
      <ItemBox>
        <AddAddress
          setGoodsOpen={setGoodsOpen}
          addressModalOpen={addressModalOpen}
          setAddressModalOpen={setAddressModalOpen}
          itemAddressInfo={itemAddressInfo}
          addressType={addressType}
        />
        <div className="titleBox">
          <div style={{ width: "40%", color: "#000", marginRight: "1%" }}>
            供应商：{item?.offerCompanyName}
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            {/* 收货地址 */}
            <Dropdown
              arrow
              trigger={["click"]}
              open={goodsOpen?.[index]}
              dropdownRender={() => (
                <Card
                  style={{
                    width: 508,
                    boxShadow: "rgb(97, 95, 95) 0px 0px 5px",
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={Address}
                          style={{
                            width: 18,
                            height: 18,
                            marginRight: 10,
                          }}
                        />
                        <span>收货地址</span>
                      </div>
                      <Button
                        onClick={() => {
                          setAddressType("goods");
                          setItemAddressInfo([]); // modal缓存bug
                          goodsOpen[index] = false;
                          setGoodsOpen([...goodsOpen]);
                          setAddressModalOpen(true);
                        }}
                        type="primary"
                      >
                        新增地址
                      </Button>
                    </div>
                  }
                >
                  {!transctionInfoLoading ? (
                    <>
                      {shippingAddress.length ? (
                        <Radio.Group
                          onChange={(e) => onRadioChange(e, "goods")}
                          value={deliveryAddressId}
                        >
                          {/* 地址数据列表：shippingAddress */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {shippingAddress?.map((item: any) => (
                              <Radio
                                key={item.id}
                                value={item.id}
                                style={{
                                  width: "100%",
                                  paddingBottom: "10px",
                                  marginBottom: "10px",
                                  borderBottom: "0.5px solid #DDDDDD",
                                }}
                              >
                                <div
                                  style={{
                                    width: "435px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "80%",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                      }}
                                    >
                                      <div
                                        style={{
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {(item?.viewProvince?.name || "") +
                                          (item?.viewCity?.name || "") +
                                          (item?.viewArea?.name || "") +
                                          (item?.detailAddr || "")}
                                      </div>
                                      {item.addFirst ? (
                                        <div
                                          style={{
                                            marginLeft: "10px",
                                            padding: "0 5px",
                                            border: "1px solid #F29D39",
                                            borderRadius: "3px",
                                            color: "#F29D39",
                                          }}
                                        >
                                          默认
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                    <div>
                                      {item?.name || ""} {item?.mobile || ""}
                                    </div>
                                  </div>
                                  <Popconfirm
                                    title="确认删除此地址吗？"
                                    okText="确定"
                                    cancelText="取消"
                                    onConfirm={() =>
                                      deleteAddressHandle(item.id, "goods")
                                    }
                                  >
                                    <div
                                      style={{
                                        color: "#999999",
                                        marginLeft: "20px",
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                      }}
                                    >
                                      删除
                                    </div>
                                  </Popconfirm>

                                  <EditOutlined
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setAddressType("goods");
                                      setItemAddressInfo(item);
                                      goodsOpen[index] = false;
                                      setGoodsOpen([...goodsOpen]);
                                      setAddressModalOpen(true);
                                    }}
                                    size={13}
                                    style={{
                                      color: "#4E83FD",
                                      marginLeft: "20px",
                                    }}
                                  />
                                </div>
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      ) : (
                        <div
                          style={{
                            color: "#999",
                            textAlign: "center",
                            marginBottom: "20px",
                          }}
                        >
                          暂无地址数据
                        </div>
                      )}
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <Button
                          onClick={() => {
                            // 取消则把此次选择的取消，赋值成上次选择的
                            setDeliveryAddressId(
                              confirmSelectShippingAddressId,
                            );
                            goodsOpen[index] = false;
                            setGoodsOpen([...goodsOpen]);
                          }}
                          style={{ marginRight: "10%" }}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={() => {
                            setConfirmSelectShippingAddressId(
                              deliveryAddressId,
                            );
                            setDeliveryAddressId(deliveryAddressId);
                            goodsOpen[index] = false;
                            setGoodsOpen([...goodsOpen]);
                          }}
                          type="primary"
                        >
                          确定
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Loading />
                  )}
                </Card>
              )}
            >
              <a
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <Space>
                  <div
                    onClick={() => {
                      if (!goodsOpen?.[index]) {
                        getTransctionInfos(
                          item.orderList[0]?.offer?.offerAcctId,
                        );
                      }
                      let newArr = [];
                      for (let i = 0; i < goodsOpen.length; i++) {
                        newArr.push(false);
                      }
                      let newGoodsArr = [...newArr];
                      newGoodsArr[index] = !goodsOpen?.[index];
                      setGoodsOpen(newGoodsArr);
                      setBillOpen(newArr);
                      setReceptionOpen(newArr);
                    }}
                    className="titleItem"
                  >
                    收货地址
                  </div>
                </Space>
              </a>
            </Dropdown>
            {/* 收票地址 */}
            <Dropdown
              arrow
              open={billOpen?.[index]}
              trigger={["click"]}
              dropdownRender={() => (
                <Card
                  style={{
                    width: 508,
                    boxShadow: "rgb(97, 95, 95) 0px 0px 5px",
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={Address}
                          style={{
                            width: 18,
                            height: 18,
                            marginRight: 10,
                          }}
                        />
                        <span>收票地址</span>
                      </div>
                      <Button
                        onClick={() => {
                          setAddressType("bill");
                          setItemAddressInfo([]);
                          billOpen[index] = false;
                          setBillOpen([...billOpen]);
                          setAddressModalOpen(true);
                        }}
                        type="primary"
                      >
                        新增地址
                      </Button>
                    </div>
                  }
                >
                  {!transctionInfoLoading ? (
                    <>
                      {shippingAddress.length ? (
                        <Radio.Group
                          onChange={(e) => onRadioChange(e, "bill")}
                          value={ticketAddressId}
                        >
                          {/* 收票地址数据列表：billingAddress */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {billingAddress?.map((item: any) => (
                              <Radio
                                key={item.id}
                                value={item.id}
                                style={{
                                  width: "100%",
                                  paddingBottom: "10px",
                                  marginBottom: "10px",
                                  borderBottom: "0.5px solid #DDDDDD",
                                }}
                              >
                                <div
                                  style={{
                                    width: "435px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "80%",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                      }}
                                    >
                                      <div
                                        style={{
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {(item?.viewProvince?.name || "") +
                                          (item?.viewCity?.name || "") +
                                          (item?.viewArea?.name || "") +
                                          (item?.detailAddr || "")}
                                      </div>
                                      {item.billFirst ? (
                                        <div
                                          style={{
                                            marginLeft: "10px",
                                            padding: "0 5px",
                                            border: "1px solid #F29D39",
                                            borderRadius: "3px",
                                            color: "#F29D39",
                                          }}
                                        >
                                          默认
                                        </div>
                                      ) : (
                                        <></>
                                      )}
                                    </div>
                                    <div>
                                      {item?.name || ""} {item?.mobile || ""}
                                    </div>
                                  </div>
                                  <Popconfirm
                                    title="确认删除此地址吗？"
                                    okText="确定"
                                    cancelText="取消"
                                    onConfirm={() =>
                                      deleteAddressHandle(item.id, "bill")
                                    }
                                  >
                                    <div
                                      style={{
                                        color: "#999999",
                                        marginLeft: "20px",
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                      }}
                                    >
                                      删除
                                    </div>
                                  </Popconfirm>
                                  <EditOutlined
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setAddressType("bill");
                                      setItemAddressInfo(item);
                                      billOpen[index] = false;
                                      setBillOpen([...billOpen]);
                                      setAddressModalOpen(true);
                                    }}
                                    size={13}
                                    style={{
                                      color: "#4E83FD",
                                      marginLeft: "20px",
                                    }}
                                  />
                                </div>
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      ) : (
                        <div
                          style={{
                            color: "#999",
                            textAlign: "center",
                            marginBottom: "20px",
                          }}
                        >
                          暂无地址数据
                        </div>
                      )}
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <Button
                          onClick={() => {
                            // 取消则把此次选择的取消，赋值成上次选择的
                            setTicketAddressId(confirmSelectBillingAddressId);
                            billOpen[index] = false;
                            setBillOpen([...billOpen]);
                          }}
                          style={{ marginRight: "10%" }}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={() => {
                            setConfirmSelectBillingAddressId(ticketAddressId);
                            setDeliveryAddressId(deliveryAddressId);
                            billOpen[index] = false;
                            setBillOpen([...billOpen]);
                          }}
                          type="primary"
                        >
                          确定
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Loading />
                  )}
                </Card>
              )}
            >
              <a
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <Space>
                  <div
                    onClick={() => {
                      if (!billOpen?.[index]) {
                        getTransctionInfos(
                          item.orderList[0]?.offer?.offerAcctId,
                        );
                      }
                      let newArr = [];
                      for (let i = 0; i < goodsOpen.length; i++) {
                        newArr.push(false);
                      }
                      let newBillArr = [...newArr];
                      newBillArr[index] = !billOpen?.[index];
                      setBillOpen(newBillArr);
                      setGoodsOpen(newArr);
                      setReceptionOpen(newArr);
                    }}
                    className="titleItem"
                  >
                    收票地址
                  </div>
                </Space>
              </a>
            </Dropdown>
            {/* 付款方式 */}
            <Dropdown
              arrow
              placement="bottomRight"
              trigger={["click"]}
              dropdownRender={() => (
                <Card
                  style={{
                    width: 508,
                    boxShadow: "rgb(97, 95, 95) 0px 0px 5px",
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={Pay}
                        style={{
                          width: 18,
                          height: 18,
                          marginRight: 10,
                        }}
                      />
                      <span>付款方式</span>
                    </div>
                  }
                >
                  {!transctionInfoLoading ? (
                    <>
                      <div style={{ padding: "10px", background: "#EDF3FF" }}>
                        交易金额小于
                        <span style={{ color: "#93C4F6" }}>
                          {sendWayInfo?.price}
                        </span>
                        元为不欠款交易
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          marginTop: "10px",
                          paddingLeft: "10px",
                          borderLeft: "2px solid #88B7E0",
                        }}
                      >
                        现货
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          marginTop: "10px",
                          color: "#8C8C8C",
                          background: "#F6F6F6",
                          padding: "10px 20px",
                        }}
                      >
                        <div style={{ width: "50%" }}>
                          时间设定：
                          <span style={{ color: "#333333" }}>
                            小于等于{sendWayInfo?.actualsDay}天
                          </span>
                        </div>
                        <div style={{ width: "50%" }}>
                          支付形式：
                          <span style={{ color: "#333333" }}>
                            {sendWayInfo?.actualsPay === 1 ? "电汇" : "承兑"}
                          </span>
                        </div>
                        <div style={{ width: "50%", marginTop: "5px" }}>
                          付款方式：
                          <span style={{ color: "#333333" }}>
                            {sendWayInfo?.actualsDebt === 1
                              ? "款到发货"
                              : "货到付款"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            width: "50%",
                            marginTop: "5px",
                            wordBreak: "break-all",
                          }}
                        >
                          <div style={{ width: "71px" }}>票据节点：</div>
                          <div style={{ color: "#333333" }}>
                            {sendWayInfo?.actualsBillType === 1
                              ? "发货前开票"
                              : "发货后开票"}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            marginTop: "5px",
                            wordBreak: "break-all",
                          }}
                        >
                          <div style={{ width: "71px" }}> 付款节点：</div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              color: "#333333",
                            }}
                          >
                            {sendWayInfo?.actualsPayList?.map(
                              (item: any, index: number) => (
                                <div key={item.payNode + index}>
                                  {payNode[item.payNode]}
                                  {item.num}天内，付款比例
                                  {(item.amount * 100).toFixed(0) + "%"}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          marginTop: "10px",
                          paddingLeft: "10px",
                          borderLeft: "2px solid #88B7E0",
                        }}
                      >
                        期货
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          marginTop: "10px",
                          color: "#8C8C8C",
                          background: "#F6F6F6",
                          padding: "10px 20px",
                        }}
                      >
                        <div style={{ width: "50%" }}>
                          时间设定：
                          <span style={{ color: "#333333" }}>
                            大于{sendWayInfo?.futuresDay}天
                          </span>
                        </div>
                        <div style={{ width: "50%" }}>
                          支付形式：
                          <span style={{ color: "#333333" }}>
                            {sendWayInfo?.futuresPay === 1 ? "电汇" : "承兑"}
                          </span>
                        </div>
                        <div style={{ width: "50%", marginTop: "5px" }}>
                          付款方式：
                          <span style={{ color: "#333333" }}>
                            {sendWayInfo?.futuresDebt === 1
                              ? "款到发货"
                              : "货到付款"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            width: "50%",
                            marginTop: "5px",
                            wordBreak: "break-all",
                          }}
                        >
                          <div style={{ width: "71px" }}>票据节点：</div>
                          <div style={{ color: "#333333" }}>
                            {sendWayInfo?.futuresBillType === 1
                              ? "发货前开票"
                              : "发货后开票"}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            marginTop: "5px",
                            wordBreak: "break-all",
                          }}
                        >
                          <div style={{ width: "71px" }}> 付款节点：</div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              color: "#333333",
                            }}
                          >
                            {sendWayInfo?.futuresPayList?.map(
                              (item: any, index: number) => (
                                <div key={item.payNode + index}>
                                  {payNode[item.payNode]}
                                  {item.num}天内，付款比例
                                  {(item.amount * 100).toFixed(0) + "%"}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Loading />
                  )}
                </Card>
              )}
            >
              <a
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <span style={{ color: "#000000" }}>付款方式：</span>
                <span
                  onClick={() => {
                    getTransctionInfos(item.orderList[0]?.offer?.offerAcctId);
                    let newArr = [];
                    for (let i = 0; i < goodsOpen.length; i++) {
                      newArr.push(false);
                    }
                    setReceptionOpen(newArr);
                    setGoodsOpen(newArr);
                    setBillOpen(newArr);
                  }}
                  className="titleItem"
                >
                  {" "}
                  现货(款到发货) / 期货(款到发货)
                </span>
              </a>
            </Dropdown>
            {/* 收款信息 */}
            <Dropdown
              arrow
              placement="bottomLeft"
              open={receptionOpen?.[index]}
              trigger={["click"]}
              dropdownRender={() => (
                <Card
                  style={{
                    width: 508,
                    boxShadow: "rgb(97, 95, 95) 0px 0px 5px",
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={Bank}
                        style={{
                          width: 18,
                          height: 18,
                          marginRight: 10,
                        }}
                      />
                      <span>收款信息</span>
                    </div>
                  }
                >
                  <Radio.Group
                    onChange={(e) => onRadioChange(e, "bank")}
                    value={selectBlank[index]}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {bankContents?.map((item: any) => (
                        <Radio
                          key={item.bankId}
                          value={item}
                          // value={item?.bankId}
                          style={{
                            width: "100%",
                            paddingBottom: "10px",
                            marginBottom: "10px",
                            borderBottom: "0.5px solid #DDDDDD",
                          }}
                        >
                          <div
                            style={{
                              width: "435px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "80%",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                }}
                              >
                                <div
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {item?.viewBank?.name || ""}
                                </div>
                              </div>
                              <div style={{ color: "#999999" }}>
                                {item?.bankBranch || ""}{" "}
                                {item?.bankAccount || ""}
                              </div>
                            </div>
                          </div>
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      onClick={() => {
                        setSelectBlank(bankContent);
                        receptionOpen[index] = false;
                        setReceptionOpen([...receptionOpen]);
                      }}
                      style={{ marginRight: "10%" }}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={() => {
                        bankContent[index] = selectBlank[index];
                        setBankContent([...bankContent]);
                        receptionOpen[index] = false;
                        setReceptionOpen([...receptionOpen]);
                      }}
                      type="primary"
                    >
                      确定
                    </Button>
                  </div>
                </Card>
              )}
            >
              <a
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <span
                  onClick={() => {
                    if (!receptionOpen?.[index]) {
                      getTransctionInfos(item.orderList[0]?.offer?.offerAcctId);
                    }
                    let newArr = [];
                    for (let i = 0; i < goodsOpen.length; i++) {
                      newArr.push(false);
                    }
                    let newReceptionArr = [...newArr];
                    newReceptionArr[index] = !receptionOpen?.[index];
                    setReceptionOpen(newReceptionArr);
                    setGoodsOpen(newArr);
                    setBillOpen(newArr);
                  }}
                  className="titleItem"
                >
                  收款信息
                </span>
              </a>
            </Dropdown>
          </div>
        </div>
        <ProTable
          bordered
          rowKey="inquiryItemId"
          editable={{
            editableKeys: item?.orderList?.map(
              (item: any) => item?.inquiryItemId,
            ),
            type: "multiple",
          }}
          request={async () => ({
            data: item?.orderList,
            success: true,
          })}
          search={false}
          options={false}
          recordCreatorProps={false}
          columns={[
            {
              title: "序",
              width: "5%",
              align: "center",
              dataIndex: "index",
              valueType: "index",
              editable: false,
            },
            {
              title: "品牌",
              width: "15%",
              dataIndex: "brandName",
              editable: false,
            },
            {
              title: "询价内容",
              dataIndex: "content",
              editable: false,
            },
            {
              title: "货期(天)",
              width: "10%",
              dataIndex: ["offer", "delivery"],
              editable: false,
            },
            {
              title: "单价(元)",
              width: "10%",
              dataIndex: ["offer", "price"],
              editable: false,
            },
            {
              title: (
                <div>
                  <span style={{ color: "red" }}>*</span>下单数量
                </div>
              ),
              width: "12%",
              dataIndex: ["quantity"],
              valueType: "digit",
              renderFormItem: (item1: any, text: any) => {
                return (
                  <VerifyInput
                    value={text}
                    type={"quantity"}
                    index={index}
                    index1={Number(item1?.index)}
                    handleOrderList={handleOrderList}
                  />
                );
              },
            },
            {
              title: (
                <div>
                  <span style={{ color: "red" }}>*</span>单位
                </div>
              ),
              width: "10%",
              dataIndex: ["unit"],
              valueType: "digit",
              renderFormItem: (item1: any, text: any) => {
                return (
                  <VerifyInput
                    value={text}
                    type={"unit"}
                    index={index}
                    index1={Number(item1?.index)}
                    handleOrderList={handleOrderList}
                  />
                );
              },
            },
            {
              title: "金额(元)",
              width: "10%",
              dataIndex: ["total"],
              editable: false,
              render: (v: any) => <div style={{ color: "#F29D39" }}>{v}</div>,
            },
          ]}
        />
        <div style={{ textAlign: "end", paddingBottom: "10px" }}>
          总金额：
          <span style={{ fontSize: "14px", color: "#FF0C0C" }}>
            ¥
            {item.total
              ? formatAmount(Math.round(item.total * 100) / 100)
              : formatAmount(total)
              ? formatAmount(Math.round(total * 100) / 100)
              : 0}
          </span>
        </div>
      </ItemBox>
    );
  },
);

const CreateOrder = ({ data, reload, type }: any) => {
  // modal显隐
  const [modalVisit, setModalVisit] = useState(false);
  // 生成订单数据
  const [orderList, setOrderList] = useState([]);
  // 确定选择收货地址id
  const [confirmSelectShippingAddressId, setConfirmSelectShippingAddressId] =
    useState();
  // 确定选择收票地址id
  const [confirmSelectBillingAddressId, setConfirmSelectBillingAddressId] =
    useState();
  // 收货地址选择
  const [deliveryAddressId, setDeliveryAddressId] = useState();
  // 收票地址选择
  const [ticketAddressId, setTicketAddressId] = useState();
  // 收款信息确认选择数组
  const [bankContent, setBankContent] = useState<any[]>([]);
  // 选择收款信息p——银行
  const [selectBlank, setSelectBlank] = useState<any[]>([]);
  // 是否企业认证
  const [isAuthentication, setIsAuthentication] = useState(false);
  // 是否实名认证
  const [isRealName, setIsRealName] = useState(false);
  const [goodsOpen, setGoodsOpen] = useState<any[]>([]); // 收货地址modal
  const [billOpen, setBillOpen] = useState<any[]>([]); // 收票地址modal
  const [receptionOpen, setReceptionOpen] = useState<any[]>([]); // 收款信息modal
  const formRef: any = useRef();

  // 生成采购订单数据的前置校验方法
  const [beforeGenerateOrderFun, { loading: generateLoading }] =
    useLazyQuery(beforeGenerateOrder);

  // 采购商向平台/好友下单（创建供应订订单）
  const [createOrderFun, { loading: orderLoading }] = useMutation(createOrder);

  const { runAsync: create } = useRequest(createDirects, {
    manual: true,
  });
  const { runAsync: send } = useRequest(sendMessages, {
    manual: true,
    onSuccess: () => {
      message.success("发送成功");
    },
  });

  const sumTotal: any = useMemo(() => {
    let count = 0;
    if (orderList) {
      orderList?.forEach((item: any) => {
        item?.orderList?.forEach((item1: any) => {
          count += Number(item1?.total);
        });
      });
    }
    return count.toFixed(2);
  }, [orderList]);

  const handleOrderList = useCallback(
    (index: number, index1: number, itemName: string, val: any) => {
      const newData: any = [...orderList];
      newData[index].orderList[index1][itemName] = val;
      if (itemName === "quantity") {
        let total = 0;
        newData[index].orderList.forEach((item: any) => {
          item.total = (item.offer.price * (item.quantity || 0)).toFixed(2);
          total += item.offer.price * (item.quantity || 0);
        });
        newData[index].total = total;
      }
      setOrderList(newData);
    },
    [orderList],
  );

  return (
    <>
      <RealNameModal isRealName={isRealName} setIsRealName={setIsRealName} />
      <Space>
        {type ? (
          <Button
            type="primary"
            disabled={data?.length === 0}
            loading={generateLoading}
            onClick={() => {
              let orderArr = data?.reduce((acc: any, item: any) => {
                const offerCompanyName = item.offer?.offerCompanyName;
                const existingCompany = acc.find(
                  (obj: any) => obj.offerCompanyName === offerCompanyName,
                );
                if (existingCompany) {
                  existingCompany.orderList.push({
                    ...item,
                    total: item.quantity
                      ? (item.offer.price * item.quantity).toFixed(2)
                      : 0.0,
                  });
                } else {
                  acc.push({
                    offerCompanyName,
                    orderList: [
                      {
                        ...item,
                        total: item.quantity
                          ? (item.offer.price * item.quantity).toFixed(2)
                          : 0.0,
                      },
                    ],
                  });
                }
                return acc;
              }, []);
              let modalOpenList = [];
              let bankContentList = [];
              for (let i = 0; i < orderArr.length; i++) {
                modalOpenList.push(false);
                bankContentList.push(null);
              }
              setGoodsOpen(modalOpenList);
              setBillOpen(modalOpenList);
              setReceptionOpen(modalOpenList);
              setBankContent(bankContentList);
              setSelectBlank(bankContentList);
              setOrderList(orderArr);
              setModalVisit(true);
            }}
          >
            下单
          </Button>
        ) : (
          <Button
            type="primary"
            disabled={data?.length === 0}
            loading={generateLoading}
            onClick={() => {
              // 所有生成订单数据报价ID
              let offerItemIdList: number[] = [];
              data?.forEach((item: any) => {
                offerItemIdList.push(item?.offer?.offerItemId);
              });
              beforeGenerateOrderFun({
                variables: {
                  offerItemIdList: offerItemIdList,
                },
                onCompleted: (res) => {
                  // 是否实名认证
                  let signature = JSON.parse(
                    localStorage.getItem("userInfo") ?? "{}",
                  )?.signature;
                  if (res?.order?.beforeGenerateOrder === "OK" && signature) {
                    let orderArr = data?.reduce((acc: any, item: any) => {
                      const offerCompanyName = item.offer?.offerCompanyName;
                      const existingCompany = acc.find(
                        (obj: any) => obj.offerCompanyName === offerCompanyName,
                      );
                      if (existingCompany) {
                        existingCompany.orderList.push({
                          ...item,
                          total: item.quantity
                            ? (item.offer.price * item.quantity).toFixed(2)
                            : 0.0,
                        });
                      } else {
                        acc.push({
                          offerCompanyName,
                          orderList: [
                            {
                              ...item,
                              total: item.quantity
                                ? (item.offer.price * item.quantity).toFixed(2)
                                : 0.0,
                            },
                          ],
                        });
                      }
                      return acc;
                    }, []);
                    let modalOpenList = [];
                    let bankContentList = [];
                    for (let i = 0; i < orderArr.length; i++) {
                      modalOpenList.push(false);
                      bankContentList.push(null);
                    }
                    setGoodsOpen(modalOpenList);
                    setBillOpen(modalOpenList);
                    setReceptionOpen(modalOpenList);
                    setBankContent(bankContentList);
                    setSelectBlank(bankContentList);
                    setOrderList(orderArr);
                    setModalVisit(true);
                  } else if (!signature) {
                    setIsRealName(true);
                  }
                },
                onError: () => {
                  setIsAuthentication(true);
                },
              });
            }}
          >
            生成订单
          </Button>
        )}
      </Space>
      <ModalForm
        modalProps={{
          destroyOnClose: true,
        }}
        open={modalVisit}
        formRef={formRef}
        title={<div style={{ textAlign: "center" }}>生成订单</div>}
        width={2000}
        layout="horizontal"
        onOpenChange={setModalVisit}
        submitter={false}
      >
        <div
          style={{ height: "63vh", overflow: "scroll", paddingRight: "15px" }}
        >
          {orderList?.map((item: any, index: number) => (
            <OrderItem
              key={item?.offerCompanyName}
              item={item}
              index={index}
              handleOrderList={handleOrderList}
              goodsOpen={goodsOpen}
              setGoodsOpen={setGoodsOpen}
              setBillOpen={setBillOpen}
              billOpen={billOpen}
              setReceptionOpen={setReceptionOpen}
              receptionOpen={receptionOpen}
              deliveryAddressId={deliveryAddressId}
              setDeliveryAddressId={setDeliveryAddressId}
              ticketAddressId={ticketAddressId}
              setTicketAddressId={setTicketAddressId}
              confirmSelectShippingAddressId={confirmSelectShippingAddressId}
              setConfirmSelectShippingAddressId={
                setConfirmSelectShippingAddressId
              }
              setConfirmSelectBillingAddressId={
                setConfirmSelectBillingAddressId
              }
              confirmSelectBillingAddressId={confirmSelectBillingAddressId}
              setBankContent={setBankContent}
              bankContent={bankContent}
              selectBlank={selectBlank}
              setSelectBlank={setSelectBlank}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginRight: "25px",
            }}
          >
            合计金额：
            <span style={{ fontSize: "14px", color: "#FF0C0C " }}>¥</span>
            <span style={{ fontSize: "24px", color: "#FF0C0C " }}>
              {formatAmount(sumTotal)}
            </span>
          </div>
          <Button
            type="primary"
            loading={orderLoading}
            onClick={() => {
              // 判断订单每项的数量和单位是否投填写
              let isTrueLength = 0;
              orderList.forEach((item: any) => {
                let isTrue = item?.orderList?.every((item1: any) => {
                  return item1.quantity && item1.unit;
                });
                if (!isTrue) {
                  isTrueLength++;
                }
              });
              // 生成订单
              if (isTrueLength === 0) {
                let createOrders: any[] = [];
                orderList.forEach((item: any, index: number) => {
                  let itemList: any[] = [];
                  let offerAccountId = "";
                  let offerCompanyId = "";
                  let bankContentObj = {
                    bankAccount: bankContent?.[index]?.bankAccount,
                    bankBranch: bankContent?.[index]?.bankBranch,
                    bankId: bankContent?.[index]?.bankId,
                  };
                  item.orderList.forEach((item1: any) => {
                    let totalAmount = item1.offer.price * item1.quantity;
                    offerAccountId = item1.offer.offerAcctId;
                    offerCompanyId = item1.offer.offerCompanyId;
                    let itemObj = {
                      brandId: item1.brandId,
                      brandName: item1.brandName,
                      deliveryDate: item1.offer.delivery,
                      model: item1.model,
                      itemName: item1.name,
                      price: item1.offer.price,
                      quantity: item1.quantity,
                      totalAmount: totalAmount,
                      unit: item1.unit,
                      inquiryItemId: item1.inquiryItemId,
                      offerItemId: item1.offer.offerItemId,
                      origItemId: item1.offer.origItemId,
                      ckmroItemId: item1.offer.ckmroItemId,
                      ckmroOfferId: item1.offer.ckmroOfferId,
                      ckmroInquiryId: item1.offer.ckmroInquiryId,
                    };
                    itemList.push(itemObj);
                  });
                  let createOrderParams = {
                    items: itemList,
                    offerAccountId,
                    offerCompanyId,
                    bankContent: bankContentObj?.bankAccount
                      ? bankContentObj
                      : null,
                  };
                  createOrders.push(createOrderParams);
                });
                // 生成订单接口
                createOrderFun({
                  variables: {
                    deliveryAddressId: confirmSelectShippingAddressId || null,
                    ticketAddressId: confirmSelectBillingAddressId || null,
                    orders: createOrders,
                  },
                  onCompleted: (res) => {
                    setModalVisit(false);
                    reload();
                    createWin({
                      title: "采购合同",
                      label: "采购合同",
                      width: 1200,
                      height: 800,
                      url: `/workstand/ContractList/?type=purchase&reload=${true}`,
                    });

                    res.order.operationCreate?.map(
                      async (item: any, index: number) => {
                        const { room } = await create({
                          data: { username: item?.senderUserName },
                        });
                        send({
                          data: {
                            message: {
                              msg: "[订单信息]",
                              message: item,
                              rid: room?.rid,
                              _id: random(17),
                            },
                          },
                        });
                        if (res.order.operationCreate?.length === index + 1) {
                          message.success("生成订单成功");
                        }
                      },
                    );
                  },
                  onError: (err: any) => {
                    const errInfo = JSON.parse(JSON.stringify(err));
                    if (errInfo?.graphQLErrors?.[0]?.extensions?.isThrow) {
                      message.error(errInfo.message);
                    } else {
                      message.error("确认订单失败,请稍后重试");
                    }
                  },
                });
              } else {
                message.error("请填写完整的订单信息");
              }
            }}
          >
            确认订单
          </Button>
        </div>
      </ModalForm>
      <Modal
        title={<div style={{ textAlign: "center" }}>系统提示</div>}
        closable={false}
        width={350}
        centered
        okText="前往认证"
        open={isAuthentication}
        onCancel={() => {
          setIsAuthentication(false);
        }}
        onOk={() => {
          setIsAuthentication(false);
          createWin({
            title: "编辑企业信息",
            label: "enterpriseCertification",
            url: `/enterpriseCertification?authentication=${false}`,
            width: 870,
            height: 690,
          });
        }}
      >
        <p style={{ fontSize: "16px", textAlign: "center" }}>
          您的账户尚未认证，无法下单！
        </p>
      </Modal>
    </>
  );
};

export default CreateOrder;

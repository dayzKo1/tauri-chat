import { getAppList, getAppTab, getUnOfferd } from "@/services";
import { createWin } from "@/utils";
import { useQuery } from "@apollo/client";
import { Avatar, Badge, Card, Col, Row, Space, Tabs } from "antd";
import { useState } from "react";

const Workstand = () => {
  const pathMap: any = {
    编辑询价: "InquiryEdit",
    我的询价: "InquiryMy",
    客户询价: "InquiryCustomer",
    我要报价: "OfferGo",
    分享的报价: "OfferShare",
    报价管理: "OfferMananger",
    采购合同: "ContractList",
    供应合同: "ContractList",
    付款: "PaymentList",
    收货: "ReceiveGoodsList",
    收票: "InvoiceList",
    收款: "CollectionList",
    发货: "SendGoodsList",
    开票: "InvoicingList",
    新建: "OrderManageList",
    进行中: "OrderManageList",
    完成: "OrderManageList",
    关闭: "OrderManageList",
  };

  const [key, setKey] = useState([]);
  const { data: tabs } = useQuery(getAppTab, {
    fetchPolicy: "no-cache",
    onCompleted: ({ workbench }) => {
      setKey(workbench.listGroup[0].key);
    },
  });
  const { data: list } = useQuery(getAppList, {
    variables: {
      groupList: key,
    },
    skip: !key.length,
  });
  const { authority } = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const { data: num } = useQuery(getUnOfferd);

  const Item = ({ item }: any) => (
    <Col xs={24} sm={12} md={12} lg={8} xl={6}>
      <Card
        hoverable
        bordered={false}
        style={{
          padding: 6,
          borderRadius: 4,
          boxShadow: "0px 0px 16px rgba(0, 0, 0, 0.08)",
        }}
        bodyStyle={{ padding: "10px 20px" }}
        onClick={() => {
          createWin({
            title: item.name,
            label: item.name,
            width: 1200,
            height: 800,
            url: authority.includes(0)
              ? `/workstand/${pathMap[item.name]}?type=${
                  ["付款", "采购合同", "收货", "收票"].includes(item.name)
                    ? "purchase"
                    : "supply"
                }`
              : `/workstand/${pathMap[item.name]}?itemName=${item.name}`,
          });
        }}
      >
        <Space size={16}>
          {item.name === "我要报价" ? (
            <Badge
              count={num.offers.countUnOfferedByCustomer}
              color="Red"
              style={{ marginTop: 5 }}
            >
              <Avatar size={40} src={`${OSS_URL}/${item?.icon}`} />
            </Badge>
          ) : (
            <Avatar size={40} src={`${OSS_URL}/${item?.icon}`} />
          )}
          <Space direction="vertical">
            <div style={{ fontSize: 16, fontWeight: 600 }}>{item?.name}</div>
            <div>{item?.description}</div>
          </Space>
        </Space>
      </Card>
    </Col>
  );

  return (
    <div
      style={{
        width: "calc(100vw - 70px)",
        height: "100vh",
        padding: "10px 15px",
        background: "white",
        whiteSpace: "nowrap",
      }}
    >
      <Tabs
        activeKey={key.join("-")}
        onChange={(v: any) => {
          setKey(v.split("-"));
        }}
        items={tabs?.workbench?.listGroup?.map((item: any) => {
          return {
            key: item.key.join("-"),
            label: item.name,
            children: (
              <Row gutter={[20, 30]}>
                {list?.workbench?.listRouter?.map((item: any) => (
                  <Item key={item.name} item={item} />
                ))}
              </Row>
            ),
          };
        })}
      />
    </div>
  );
};

export default Workstand;

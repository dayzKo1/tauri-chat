import { EditableProTable } from "@ant-design/pro-components";
import { styled } from "@umijs/max";
import type { TabsProps } from "antd";
import { Space, Tabs } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { useState } from "react";

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
  .ant-pro-card-body {
    padding-inline: 0px;
  }
`;

function RelatedOrderCard({ info }: any) {
  const [activeKey, setActiveKey] = useState(0);
  const formattedData = info?.reduce((acc: any, item: any) => {
    const existingOrder = acc.find(
      (order: any) => order.orderId === item.orderId,
    );

    if (existingOrder) {
      existingOrder.items.push(...item.items);
    } else {
      acc.push(item);
    }

    return acc;
  }, []);
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
    {
      title: "说明",
      editable: false,
      width: "4%",
      render: () => <span>说明</span>,
    },
  ];
  const formatDate = (date: Date) => {
    const newDate = `${new Date(date).toLocaleDateString().replaceAll("/", "-")}
    ${new Date(date).toLocaleTimeString()}`;
    return date ? newDate : "";
  };
  const items: TabsProps["items"] = formattedData?.map(
    (item: any, index: number) => ({
      key: index,
      label: item.inquiryName,
      children: (
        <Space
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: 20,
            color: "#999",
          }}
        >
          <div
            style={{
              width: 500,
              marginRight: 100,
            }}
          >
            <div>
              采购单号：<span style={{ color: "#000" }}>{item.orderId}</span>
            </div>
            <div style={{ marginTop: 20 }}>
              付款方式：<span style={{ color: "#4E83FD" }}>{item.payment}</span>
            </div>
          </div>
          <div
            style={{
              marginRight: 100,
            }}
          >
            <div>
              下单时间：
              <span style={{ color: "#000" }}>
                {formatDate(item.createdAt)}
              </span>
            </div>
            <div style={{ marginTop: 20 }}>
              联系人：
              <span style={{ color: "#000" }}>
                {item.inquiryName + "(" + "2131231" + ")"}
              </span>
            </div>
          </div>
        </Space>
      ),
    }),
  );
  const onChange = (key: any) => {
    setActiveKey(key);
  };
  return (
    <div style={{ paddingLeft: 20, paddingRight: 20 }}>
      <Tabs
        defaultActiveKey="1"
        items={items}
        type="card"
        onChange={onChange}
      />
      <ProTable
        alwaysShowAlert
        bordered
        rowKey={(v: any) => v.model + new Date()}
        dateFormatter="string"
        recordCreatorProps={false}
        value={formattedData?.[activeKey]?.items || []}
        search={false}
        scroll={{
          y: "55vh",
        }}
        columns={columns}
      />
    </div>
  );
}

export default RelatedOrderCard;

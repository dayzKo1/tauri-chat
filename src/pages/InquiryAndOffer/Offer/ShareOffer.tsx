import { getOfferShared } from "@/services";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import { EditableProTable } from "@ant-design/pro-components";
import { useQuery } from "@apollo/client";
import { Card, Descriptions } from "antd";
import { useRef } from "react";
import { styled } from "umi";

const ProTable = styled(EditableProTable)`
  .ant-pro-table-list-toolbar-right {
    justify-content: flex-start;
  }
  .ant-pro-table-list-toolbar-container {
    padding: 0;
    display: block;
  }
  .ant-pro-card .ant-pro-card-body {
    padding: 0;
  }
`;

const Detail = ({ id }: any) => {
  const ref: any = useRef(null);
  const { data } = useQuery(getOfferShared, {
    variables: {
      id,
    },
    onCompleted: () => ref.current.reload(),
  });
  const info = data?.exportInquiry?.info;
  const items = data?.exportInquiry?.info?.items;
  const columns = [
    {
      title: "品牌",
      dataIndex: "brandName",
    },
    {
      title: "询价内容",
      dataIndex: "content",
    },
    {
      title: "单价(元)",
      dataIndex: "price",
    },
    {
      title: "货期(天)",
      dataIndex: "delivery",
    },
  ];

  return (
    <Card style={{ margin: 24, textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 600 }}>
        <div>{info?.title}</div>
      </div>
      <Descriptions
        style={{
          border: "1px solid #efefef",
          padding: "16px 6px 0px 12px",
          borderRadius: 6,
          margin: "16px 0",
        }}
        items={[
          {
            label: "报价人",
            children: info?.fromCusName,
          },
          {
            label: "手机号",
            children: info?.fromCusPhone,
          },
          {
            label: "日期",
            children: timeStampToNormalTime(info?.created),
          },
          {
            label: "采购商",
            children: info?.toCusName,
          },
          {
            label: "手机号",
            children: info?.toCusPhone,
          },
          {
            label: "地址",
            children: info?.toCusAddr,
          },
        ]}
      />
      <ProTable
        bordered
        actionRef={ref}
        request={() => {
          return {
            data: items,
            success: true,
          };
        }}
        rowKey="id"
        dateFormatter="string"
        columns={columns}
        recordCreatorProps={false}
        scroll={{
          y: "60vh",
        }}
      />
    </Card>
  );
};

export default Detail;

import {
  EditableProTable,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Space } from "antd";
import { useState } from "react";
import { styled, useAccess } from "umi";

import CreateOffer from "@/components/Actions/CreateOffer";

import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";

import { getMyInquiryInfo } from "@/services";
import { useQuery } from "@apollo/client";

dayjs.locale("zh-cn");
dayjs.extend(weekday);
dayjs.extend(localeData);

const columns = [
  {
    title: "询价信息",
    children: [
      {
        title: "品牌",
        dataIndex: "pp",
        editable: false,
      },
      {
        title: "询价内容",
        width: 500,
        dataIndex: "xh",
        editable: false,
      },
      {
        title: "询价日期",
        dataIndex: "rq",
        editable: false,
      },
    ],
  },
  {
    title: "单价最低",
    children: [
      {
        title: "单价(元)",
        dataIndex: "yua1n",
      },
      {
        title: "货期(天)",
        dataIndex: "tian1",
      },
    ],
  },
  {
    title: "货期最短",
    children: [
      {
        title: "单价(元)",
        dataIndex: "yuan2",
      },
      {
        title: "货期(天)",
        dataIndex: "tian2",
      },
    ],
  },
];

const defaultData = new Array(50).fill(1).map((_, index) => {
  return {
    id: (Date.now() + index).toString(),
    pp: `活动名称${index}`,
    rq: "这个活动真好玩",
    xh: "这个活动真好玩",
  };
});

const ProTable = styled(EditableProTable)`
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
      margin-top: -25px;
    }
  }
  .ant-pro-table-alert {
    margin-block-end: 0;
  }
  .ant-table-wrapper {
    margin-block-start: ${({ selectedRowKeys }: any) =>
      selectedRowKeys.length > 0 ? 0 : "46px"};
  }
`;

const Detail = () => {
  const { label } = window.__TAURI__.window.getCurrent();
  const isInquiry = label.split("_")[0] === "inquiryDetail";
  const id = label.split("_")[1];
  useQuery(getMyInquiryInfo, {
    variables: {
      params: {
        inquiryId: id,
      },
    },
  });

  const [activeKey, setActiveKey] = useState("tab1");
  const [editableKeys, setEditableRowKeys] = useState(() =>
    defaultData.map((item) => item.id),
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { authority } = useAccess();

  const Buttons: any = {
    关闭明细: <Button type="primary">关闭明细</Button>,
    发送报价: <Button type="primary">发送报价</Button>,
    生成报价: <CreateOffer data={defaultData} />,
    向好友询价: <Button type="primary">向好友询价</Button>,
    // 向好友询价: <Forward />,
  };

  const items: any = {
    0: {
      tabs: isInquiry
        ? [
            { label: "未报价", key: "未报价" },
            { label: "未订货", key: "未订货" },
            { label: "已订货", key: "已订货" },
            { label: "关闭", key: "关闭" },
          ]
        : [
            {
              label: "未报价",
              key: "未报价",
            },
            { label: "已报价", key: "已报价" },
            { label: "已处理", key: "已处理" },
          ],
      button: isInquiry ? ["关闭明细", "向好友询价", "生成报价"] : ["发送报价"],
    },
    1: {
      tabs: [
        { label: "未报价", key: "未报价" },
        { label: "未订货", key: "未订货" },
        { label: "已订货", key: "已订货" },
      ],
      button: [],
    },
  };

  const item = items[authority];

  return (
    <>
      <ProTable
        selectedRowKeys={selectedRowKeys}
        alwaysShowAlert
        bordered
        rowKey="id"
        dateFormatter="string"
        recordCreatorProps={false}
        search={false}
        scroll={{
          y: "42vh",
        }}
        columns={columns}
        editable={{
          editableKeys,
          type: "multiple",
          // actionRender: (row, config, defaultDoms) => {
          //   return [defaultDoms.delete];
          // },
          // onValuesChange: (record, recordList) => {},
          onChange: setEditableRowKeys,
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: (newSelectedRowKeys: any) => {
            console.log("selectedRowKeys changed: ", newSelectedRowKeys);
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
        request={(params: any, sorter: any, filter: any) => {
          console.log(params, sorter, filter);
          return Promise.resolve({
            data: defaultData,
            success: true,
          });
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeKey,
            items: item.tabs,
            onChange: (key: any) => {
              setActiveKey(key as string);
            },
          },
          filter: (
            <Space size={20}>
              {[1].includes(authority) && (
                <ProFormSelect placeholder="采购商-XXX" disabled />
              )}

              {[0].includes(authority) && !isInquiry && (
                <ProFormSelect placeholder="采购商-周杰伦" />
              )}
              {[0].includes(authority) && (
                <ProFormSelect
                  options={[
                    { label: "单价最低", value: "单价最低" },
                    { label: "货期最短", value: "货期最短" },
                  ]}
                  allowClear={false}
                  fieldProps={{
                    defaultValue: "单价最低",
                  }}
                />
              )}
              <ProFormDateRangePicker
                name="timeRange"
                placeholder={["开始时间", "结束时间"]}
                fieldProps={{
                  presets: [
                    {
                      label: "今天",
                      value: [dayjs().startOf("day"), dayjs().endOf("day")],
                    },
                    {
                      label: "近三天",
                      value: [
                        dayjs().subtract(2, "day").startOf("day"),
                        dayjs().endOf("day"),
                      ],
                    },
                    {
                      label: "本周",
                      value: [dayjs().startOf("week"), dayjs().endOf("week")],
                    },
                    {
                      label: "本月",
                      value: [dayjs().startOf("month"), dayjs().endOf("month")],
                    },
                  ],
                  onChange: (e: any) =>
                    console.log(
                      dayjs(e[0]["$d"]).format("YYYY-MM-DD 00:00:00"),
                      dayjs(e[1]["$d"]).format("YYYY-MM-DD 23:59:59"),
                    ),
                }}
              />
              <ProFormSelect
                placeholder="请选择品牌"
                request={async () => {
                  return [
                    { label: "111", value: "111" },
                    { label: "222", value: "222" },
                  ];
                }}
              />
              <ProFormText placeholder="请输入品名、询价内容" />
            </Space>
          ),
          actions: [
            <Button key="primary" type="primary">
              搜索
            </Button>,
          ],
        }}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
        }}
      />
      <Space
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {item?.button?.map((item: any) => Buttons[item])}
      </Space>
    </>
  );
};

export default Detail;

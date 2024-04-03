import CustomPagination from "@/components/Workstand/CustomPagination";
import {
  getBuyerList,
  getPurchaseContact,
  getSupplierList,
  getSupplyContract,
} from "@/services";
import { createWin } from "@/utils";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import {
  EditableProTable,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useLazyQuery } from "@apollo/client";
import type { PaginationProps } from "antd";
import { Button, Space } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { useRef, useState } from "react";
import { styled, useSearchParams } from "umi";

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
    margin-block-start: 25px;
  }
  .ant-form {
    display: flex;
  }
`;

const items = [
  {
    label: "未完成",
    key: JSON.stringify({
      contractMergeStatus: ["CREATE", "ONGOING"],
      status: ["CREATE"],
    }),
  },
  {
    label: "已完成",
    key: JSON.stringify({
      contractMergeStatus: ["CREATE", "ONGOING", "DONE", "CLOSE"],
      status: ["ONGOING", "DONE", "CLOSE"],
    }),
  },
];

const ContractListView = () => {
  const ref: any = useRef(null);
  const searchRef: any = useRef(null);
  const [activeKey, setActiveKey] = useState(
    JSON.stringify({
      contractMergeStatus: ["CREATE", "ONGOING"],
      status: ["CREATE"],
    }),
  );
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 0,
    pageSize: 10,
    total: 0,
  });
  const [search] = useSearchParams();
  const type = search.get("type");
  const rcUserId = search.get("rcUserId");
  const [getContractList] = useLazyQuery(
    type === "purchase" ? getPurchaseContact : getSupplyContract,
  );
  const [getBuyerData] = useLazyQuery(getBuyerList);
  const [getSupplierData] = useLazyQuery(getSupplierList);
  const columns = [
    {
      title: "序",
      dataIndex: "index",
      valueType: "index",
      editable: false,
      width: "4%",
    },
    {
      title: "订单号",
      dataIndex: "id",
      width: "16%",
      editable: false,
      render: (v: string) => (
        <Button
          onClick={() => {
            createWin({
              title: `合同详情-${v}`,
              label: `合同详情-${v}`,
              width: 1200,
              height: 800,
              url: `/workstand/ContractDetail?orderId=${v}&type=${type}`,
            });
          }}
          type="link"
        >
          {v}
        </Button>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createAt",
      editable: false,
      render: (v: Date) => timeStampToNormalTime(v),
    },
    {
      title: type === "purchase" ? "供应商" : "采购商",
      dataIndex: type === "purchase" ? ["offer", "name"] : ["inquiry", "name"],
      width: "20%",
      editable: false,
    },
    {
      title: "采购明细数",
      dataIndex: "orderItemSize",
      editable: false,
      width: "10%",
    },
    {
      title: "采购总金额（元）",
      dataIndex: "amount",
      align: "center",
      editable: false,
      render: (v: string) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: "当前状态",
      dataIndex: "orderShowText",
      editable: false,
      width: "20%",
      render: (v: string) => <span style={{ color: "#F29D39" }}>{v}</span>,
    },
  ];
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

  return (
    <>
      <ProTable
        actionRef={ref}
        alwaysShowAlert
        bordered
        dateFormatter="string"
        recordCreatorProps={false}
        search={false}
        rowKey="id"
        scroll={{
          y: "65vh",
        }}
        columns={columns}
        params={{ activeKey }}
        request={async () => {
          const {
            timeRange = [],
            offerCompanyId,
            inquiryCompanyId,
            orderId,
          } = searchRef.current.getFieldsValue();
          const [start, end] = timeRange ?? [];
          const types: any = {
            purchase: { offerCompanyId: offerCompanyId },
            supply: { inquiryCompanyId: inquiryCompanyId },
          };
          const { data } = await getContractList({
            variables: {
              params: {
                start: timeRange?.length
                  ? new Date(
                      new Date(dayjs(start?.["$d"]).valueOf()).setHours(
                        0,
                        0,
                        0,
                        0,
                      ),
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
                ...JSON.parse(activeKey),
                ...types[`${type}`],
                orderId: orderId || null,
                targetRcUserId: rcUserId || null,
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
              },
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { data, __typename, ...newObj } =
                res.contract.inquiryPage || res.contract.offerPage;
              setPagination(newObj);
            },
          });
          const items =
            type === "purchase"
              ? data?.contract?.inquiryPage?.data
              : data?.contract?.offerPage?.data;
          return Promise.resolve({
            data: items,
            success: true,
          });
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeKey,
            items,
            onChange: (key: any) => {
              setPagination({ ...pagination, currentPage: 1 });
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
                      }}
                    >
                      搜索
                    </Button>,
                  ];
                },
              }}
            >
              <Space>
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
                  name={
                    type === "purchase" ? "offerCompanyId" : "inquiryCompanyId"
                  }
                  showSearch
                  placeholder="请选择交易商"
                  request={async () => {
                    const { data } = await (type === "purchase"
                      ? getSupplierData()
                      : getBuyerData());
                    const items =
                      type === "purchase"
                        ? data?.order.inquiryMyCompanies
                        : data?.order.offerMyCompanies;
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
      <CustomPagination
        pagination={pagination}
        onShowSizeChange={onShowSizeChange}
      />
    </>
  );
};

export default ContractListView;

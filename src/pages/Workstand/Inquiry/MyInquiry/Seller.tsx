import CustomPagination from "@/components/Workstand/CustomPagination";
import { closeDetails, getAllBrands, getSellerAllInquiry } from "@/services";
import {
  EditableProTable,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import type { PaginationProps } from "antd";
import { Button, Modal, Space, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { useRef, useState } from "react";
import { styled } from "umi";
import CreateOffer from "./Common/CreateOffer";

dayjs.locale("zh-cn");
dayjs.extend(weekday);
dayjs.extend(localeData);

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
      margin-left: 10px;
    }
  }
  .ant-pro-table-alert {
    margin-block-end: 0;
  }
  .ant-table-wrapper {
    margin-block-start: ${({ selectedRowKeys }: any) =>
      selectedRowKeys.length > 0 ? 0 : "46px"};
  }
  .ant-form {
    display: flex;
  }
`;

const timeStampToNormalTime = (timeStamp: any) => {
  const date = new Date(timeStamp).toLocaleDateString();
  const dateString = date.replace(new RegExp("/", "g"), ".");
  return dateString;
};

const columns = [
  {
    title: "询价信息",
    children: [
      {
        title: "品牌",
        dataIndex: "brandName",
        editable: false,
      },
      {
        title: "询价内容",
        dataIndex: "content",
        editable: false,
      },
      {
        title: "备注",
        dataIndex: "memo",
        editable: false,
      },
      {
        title: "询价日期",
        dataIndex: "date",
        editable: false,
        render: (v: Date) => timeStampToNormalTime(v),
      },
    ],
  },
  {
    title: "单价最低",
    children: [
      {
        title: "单价(元)",
        dataIndex: ["offer", "price"],
        editable: false,
      },
      {
        title: "货期(天)",
        dataIndex: ["offer", "delivery"],
        editable: false,
      },
    ],
  },
  {
    title: "货期最短",
    children: [
      {
        title: "单价(元)",
        dataIndex: ["offer", "price"],
        editable: false,
      },
      {
        title: "货期(天)",
        dataIndex: ["offer", "delivery"],
        editable: false,
      },
    ],
  },
];

const items = [
  { label: "未报价", key: "CREATED" },
  { label: "未订货", key: "OFFERED" },
  { label: "关闭", key: "CLOSE" },
];

const Mine = () => {
  const ref: any = useRef(null);
  const formRef: any = useRef(null);
  const searchRef: any = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [activeKey, setActiveKey] = useState("CREATED");
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 0,
    pageSize: 10,
    total: 0,
  });
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
  const [closeDetail] = useMutation(closeDetails, {
    onCompleted: () => {
      messageApi.success("关闭成功");
    },
  });
  const [getBrands] = useLazyQuery(getAllBrands);
  const [getInquiry, { refetch }] = useLazyQuery(getSellerAllInquiry);

  return (
    <>
      {contextHolder}
      <ProTable
        actionRef={ref}
        editableFormRef={formRef}
        selectedRowKeys={selectedRowKeys}
        alwaysShowAlert
        bordered
        rowKey="inquiryItemId"
        dateFormatter="string"
        recordCreatorProps={false}
        search={false}
        scroll={{
          y: "55vh",
        }}
        columns={columns}
        editable={{
          editableKeys,
          type: "multiple",
          onChange: setEditableRowKeys,
        }}
        rowSelection={
          activeKey === "CLOSE"
            ? false
            : {
                selectedRowKeys,
                onChange: (newSelectedRowKeys: any, selectedRows: any) => {
                  setSelectedRows(selectedRows);
                  setSelectedRowKeys(newSelectedRowKeys);
                },
              }
        }
        params={{ activeKey }}
        request={async () => {
          const {
            timeRange = [],
            brandId,
            keyword,
            memo,
          } = searchRef.current.getFieldsValue();
          const [start, end] = timeRange ?? [];
          const { data } = await getInquiry({
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
                brandId,
                keyword,
                memo,
                status: activeKey,
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
              },
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { inquiryItemList, __typename, ...newObj } =
                res.inquiry?.listInquiryBySeller4Mine;
              setPagination(newObj);
            },
          });
          setEditableRowKeys(
            data?.inquiry?.listInquiryBySeller4Mine?.inquiryItemList?.map(
              (item: any) => item.inquiryItemId,
            ),
          );
          return Promise.resolve({
            data: data?.inquiry?.listInquiryBySeller4Mine?.inquiryItemList,
            success: true,
          });
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeKey,
            items,
            onChange: (key: any) => {
              setSelectedRowKeys([]);
              setSelectedRows([]);
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
              <Space>
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
                        value: [
                          dayjs().startOf("month"),
                          dayjs().endOf("month"),
                        ],
                      },
                    ],
                  }}
                />
                <ProFormSelect
                  name="brandId"
                  showSearch
                  placeholder="请选择品牌"
                  request={async () => {
                    const { data } = await getBrands();
                    return data?.inquiry?.getAllBrands?.map((item: any) => ({
                      label: item.name,
                      value: item.id,
                    }));
                  }}
                />
                <ProFormText name="keyword" placeholder="请输入品名、型号" />
                <ProFormText name="memo" placeholder="请输入备注内容" />
              </Space>
            </ProForm>
          ),
        }}
      />
      <CustomPagination
        pagination={pagination}
        onShowSizeChange={onShowSizeChange}
      />
      <Space
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {["CREATED", "OFFERED"].includes(activeKey) && (
          <Button
            disabled={!selectedRowKeys.length}
            type="primary"
            onClick={() => {
              Modal.confirm({
                title: "提示",
                content: "明细被关闭后,无法进行还原，需要重新进行询价!",
                centered: true,
                onOk: () => {
                  closeDetail({
                    variables: {
                      inquiryItemIdList: selectedRowKeys,
                    },
                    onCompleted: () => {
                      messageApi.success("关闭成功！");
                      setSelectedRows([]);
                      setSelectedRowKeys([]);
                      refetch();
                    },
                    onError: () => {
                      messageApi.error("关闭失败，请稍后重试！");
                    },
                  });
                  ref.current.reload();
                },
              });
            }}
          >
            关闭明细
          </Button>
        )}
        {["OFFERED"].includes(activeKey) && <CreateOffer data={selectedRows} />}
      </Space>
    </>
  );
};

export default Mine;

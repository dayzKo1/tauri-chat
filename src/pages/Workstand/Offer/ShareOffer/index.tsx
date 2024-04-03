import CustomPagination from "@/components/Workstand/CustomPagination";
import { getSharedOffers, previewOffer } from "@/services";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import {
  ProForm,
  ProFormDateRangePicker,
  ProTable,
} from "@ant-design/pro-components";
import { useLazyQuery } from "@apollo/client";
import { useRequest } from "ahooks";
import type { PaginationProps } from "antd";
import { Button, Image, Modal, Space, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { useRef, useState } from "react";
import { styled } from "umi";

dayjs.locale("zh-cn");
dayjs.extend(weekday);
dayjs.extend(localeData);

const Table = styled(ProTable)`
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

const Mine = () => {
  const ref: any = useRef(null);
  const formRef: any = useRef(null);
  const searchRef: any = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [open, setOpen] = useState(false);
  const [preImage, setPreImage] = useState("");
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
  const { runAsync: preview } = useRequest(previewOffer, {
    manual: true,
    onSuccess: (res) => {
      setPreImage(window.URL.createObjectURL(res));
      setOpen(true);
    },
    onError: () => {
      messageApi.error("数据异常");
    },
  });

  const [getShareOffer] = useLazyQuery(getSharedOffers);
  const columns = [
    {
      title: "日期",
      dataIndex: "created",
      render: (v: Date) => timeStampToNormalTime(v),
    },
    {
      title: "采购商",
      dataIndex: "toCusName",
    },
    {
      title: "明细数",
      dataIndex: "items",
      render: (v: any) => v?.length,
    },
    {
      title: "操作",
      dataIndex: "id",
      render: (v: any, r: any) => {
        return (
          <Button
            disabled={r?.items?.length === 0}
            type="link"
            onClick={() => {
              preview({
                id: v,
              });
            }}
          >
            查看详情
          </Button>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <Table
        actionRef={ref}
        editableFormRef={formRef}
        selectedRowKeys={selectedRowKeys}
        alwaysShowAlert
        bordered
        rowKey="id"
        dateFormatter="string"
        recordCreatorProps={false}
        search={false}
        scroll={{
          y: "60vh",
        }}
        columns={columns}
        request={async () => {
          const { timeRange = [] } = searchRef.current.getFieldsValue();
          const [start, end] = timeRange ?? [];
          const { data } = await getShareOffer({
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
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
              },
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { items, __typename, ...newObj } =
                res.exportInquiry.myShare;
              setPagination(newObj);
            },
          });
          return Promise.resolve({
            data: data?.exportInquiry?.myShare?.items,
            success: true,
          });
        }}
        toolbar={{
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
              </Space>
            </ProForm>
          ),
        }}
        options={false}
        pagination={false}
      />
      <CustomPagination
        pagination={pagination}
        onShowSizeChange={onShowSizeChange}
      />
      <Modal
        title="报价详情"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <div
          style={{
            overflow: "scroll",
            height: 400,
          }}
        >
          <Image src={preImage} alt="" />
        </div>
      </Modal>
    </>
  );
};

export default Mine;

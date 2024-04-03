import CustomPagination from "@/components/Workstand/CustomPagination";
import {
  getAllBrands,
  getOfferBuyer,
  getOfferInfo,
  remindOffer,
} from "@/services";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
  ProTable,
} from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import type { PaginationProps } from "antd";
import { Button, Card, Modal, Select, Space, Tag, message } from "antd";
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
      selectedRowKeys.length > 0 ? 0 : "30px"};
  }
  .ant-form {
    display: flex;
  }
`;

const items = [
  { label: "未报价", key: "CREATED" },
  { label: "已报价", key: "OFFERED" },
  { label: "已处理", key: "DEALT" },
];

const Mine = () => {
  const [current, setCurrent] = useState("");
  const ref: any = useRef(null);
  const formRef = useRef(null);
  const searchRef: any = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [activeKey, setActiveKey] = useState("CREATED");
  const [open, setOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 0,
    pageSize: 10,
    total: 0,
  });
  const [getBrands] = useLazyQuery(getAllBrands);
  const [remind, { loading }] = useMutation(remindOffer, {
    onCompleted: () => {
      messageApi.success("提醒成功");
    },
  });
  const [getInquiryOffer, { data: inquiryOffer }] = useLazyQuery(getOfferInfo);

  const [getOffers] = useLazyQuery(getOfferBuyer);
  const columns: Array<any> = [
    {
      title: "品牌",
      dataIndex: "brandName",
    },
    {
      title: "询价内容",
      dataIndex: "content",
    },
    {
      title: "询价日期",
      dataIndex: "date",
      render: (v: Date) => timeStampToNormalTime(v),
    },
    {
      title: "操作",
      width: "10%",
      dataIndex: "inquiryItemId",
      render: (v: any, r: any) => {
        return (
          <Button
            disabled={r?.itemList?.length === 0}
            type="link"
            onClick={() => {
              getInquiryOffer({
                variables: {
                  params: {
                    sort: "PRICE",
                    inquiryItemId: v,
                  },
                },
                fetchPolicy: "no-cache",
                onCompleted: () => {
                  setCurrent(v);
                  setOpen(true);
                },
              });
            }}
          >
            查看详情
          </Button>
        );
      },
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
          y: "65vh",
        }}
        columns={columns}
        params={{ activeKey }}
        request={async () => {
          const {
            timeRange = [],
            keyword,
            brandId,
          } = searchRef.current.getFieldsValue();
          const [start, end] = timeRange ?? [];
          const { data } = await getOffers({
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
                status: activeKey,
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
                keyword,
                brandId,
              },
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { offerList, __typename, ...newObj } =
                res.offers.listOfferByBuyer;
              setPagination(newObj);
            },
          });
          return Promise.resolve({
            data: data?.offers?.listOfferByBuyer?.offerList,
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
              setActiveKey(key);
              setPagination({ ...pagination, currentPage: 1 });
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
              </Space>
            </ProForm>
          ),
        }}
        pagination={false}
        options={false}
      />
      <CustomPagination
        pagination={pagination}
        onShowSizeChange={onShowSizeChange}
      />
      <Modal
        title="全部报价"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <div>
          <Space
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <div>
              询价日期：
              {timeStampToNormalTime(
                inquiryOffer?.offers?.findOfferDetails?.date,
              )}
            </div>
            <Select
              defaultValue="PRICE"
              style={{ width: 100, marginBottom: 20 }}
              onChange={(v: string) => {
                getInquiryOffer({
                  variables: {
                    params: {
                      sort: v,
                      inquiryItemId: current,
                    },
                  },
                });
              }}
              options={[
                { label: "单价最低", value: "PRICE" },
                { label: "货期最短", value: "DELIVERY" },
              ]}
            />
          </Space>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Card>
              <Tag color="blue" bordered={false}>
                {inquiryOffer?.offers?.findOfferDetails?.brandName}
              </Tag>
              {inquiryOffer?.offers?.findOfferDetails?.content}
            </Card>
            {inquiryOffer?.offers?.findOfferDetails?.inquiryItemOfferVoList?.map(
              (item: any) => (
                <Card key={item?.id}>
                  <Space
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <strong>{item?.companyName}</strong>
                    {item?.offerStatus === "OFFERED" ? (
                      <Space>
                        货期
                        <div style={{ color: "#f2b06a" }}>
                          {item?.delivery}天
                        </div>
                        单价
                        <div style={{ color: "#f2b06a" }}>￥{item?.price}</div>
                      </Space>
                    ) : (
                      <Button
                        loading={loading}
                        onClick={() => {
                          remind({
                            variables: {
                              inquiryItemId:
                                inquiryOffer?.offers?.findOfferDetails
                                  ?.inquiryItemId,
                              userName: item.userName,
                            },
                          });
                        }}
                      >
                        提醒报价
                      </Button>
                    )}
                  </Space>
                </Card>
              ),
            )}
          </Space>
        </div>
      </Modal>
    </>
  );
};

export default Mine;

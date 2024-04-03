import {
  closeDetails,
  getAllBrands,
  getCustomerAllInquiry,
  getInquiryOffers,
} from "@/services";
import {
  EditableProTable,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, Card, Modal, Space, Tag, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { useRef, useState } from "react";
import { styled, useSearchParams } from "umi";
// import Append from "./Common/Append";
import CustomPagination from "@/components/Workstand/CustomPagination";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import type { PaginationProps } from "antd";
import CreateOffer from "./Common/CreateOffer";
import CreateOrder from "./Common/CreateOrder";

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
    margin-block-start: ${({ selectedRowKeys }: any) =>
      selectedRowKeys.length > 0 ? 0 : "35px"};
  }
  .ant-form {
    display: flex;
  }
`;

const items = [
  { label: "未报价", key: "CREATED" },
  { label: "未订货", key: "OFFERED" },
  { label: "已订货", key: "ORDERED" },
  { label: "关闭", key: "CLOSE" },
];

const Mine = () => {
  const ref: any = useRef(null);
  const formRef = useRef(null);
  const searchRef: any = useRef(null);
  const [activeKey, setActiveKey] = useState("CREATED");
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [current, setCurrent] = useState();
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedRows, setSelectedRows] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 0,
    pageSize: 10,
    total: 0,
  });
  const [search] = useSearchParams();
  const rcUserId = search.get("rcUserId");
  const [getInquiryOffer, { data: inquiryOffer, refetch }] =
    useLazyQuery(getInquiryOffers);
  const [closeDetail] = useMutation(closeDetails, {
    onCompleted: () => {
      messageApi.success("关闭成功");
    },
  });
  const [getBrands] = useLazyQuery(getAllBrands);
  const [getInquiry] = useLazyQuery(getCustomerAllInquiry, {
    fetchPolicy: "no-cache",
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
  const columns = [
    {
      title: "品牌",
      dataIndex: "brandName",
      editable: false,
    },
    {
      title: "型号",
      width: "20%",
      dataIndex: "content",
      editable: false,
    },
    {
      title: "询价日期",
      dataIndex: "date",
      editable: false,
      render: (v: Date) => timeStampToNormalTime(v),
    },
    {
      title: "中标供应商",
      dataIndex: ["offer", "companyName"],
      editable: false,
    },
    {
      title: "单价(元)",
      align: "center",
      dataIndex: ["offer", "price"],
      editable: false,
    },
    {
      title: "货期(天)",
      align: "center",
      dataIndex: ["offer", "delivery"],
      editable: false,
    },
    {
      title: "操作",
      dataIndex: "inquiryItemId",
      align: "center",
      render: (v: any, r: any) => {
        if (activeKey === "CREATED") {
          return (
            <Button
              disabled={r.offerCount === 0}
              type="link"
              onClick={() => {
                getInquiryOffer({
                  variables: {
                    params: {
                      sort: "PRICE",
                      inquiryItemId: v,
                    },
                  },
                });
                setCurrent(v);
                setOpen(true);
              }}
            >
              询价好友数({r.offerCount})
            </Button>
          );
        }
        if (activeKey === "OFFERED") {
          return (
            <Button
              type="link"
              onClick={() => {
                getInquiryOffer({
                  variables: {
                    params: {
                      sort: "PRICE",
                      inquiryItemId: v,
                    },
                  },
                });
                setCurrent(v);
                setOpen(true);
              }}
            >
              查看全部报价
            </Button>
          );
        }
      },
      editable: false,
    },
  ];
  const CloseBtn = () => (
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
  );
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
                onChange: (newSelectedRowKeys: any, newSelectedRows: any) => {
                  setSelectedRows(newSelectedRows);
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
                companyRcUserId: rcUserId || null,
                memo,
                status: activeKey,
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
              },
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { inquiryItemList, __typename, ...newObj } =
                res.inquiry.listInquiryByCustomer;
              setPagination(newObj);
            },
          });
          setEditableRowKeys(
            data?.inquiry?.listInquiryByCustomer?.inquiryItemList?.map(
              (item: any) => item.inquiryItemId,
            ),
          );
          return Promise.resolve({
            data: data?.inquiry?.listInquiryByCustomer?.inquiryItemList,
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
              setPagination({ ...pagination, currentPage: 1 });
              setSelectedRows([]);
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
        {["OFFERED"].includes(activeKey) && (
          <>
            {/* <Append
              type="link"
              data={selectedRows}
              reload={() => ref.current.reload()}
            /> */}
            <CloseBtn />
            <CreateOffer
              data={selectedRows}
              selectedRowKeys={selectedRowKeys}
            />
            <CreateOrder
              data={selectedRows}
              reload={() => ref.current.reload()}
            />
          </>
        )}
        {["ORDERED"].includes(activeKey) && (
          <>
            <CreateOrder
              data={selectedRows}
              type={"isAuthentication"}
              reload={() => ref.current.reload()}
            />
          </>
        )}
        {["CREATED"].includes(activeKey) && (
          <>
            {/* <Append
              type="link"
              data={selectedRows}
              reload={() => ref.current.reload()}
            /> */}
            <CloseBtn />
          </>
        )}
      </Space>
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
            <ProFormSelect
              options={[
                { label: "单价最低", value: "PRICE" },
                { label: "货期最短", value: "DELIVERY" },
              ]}
              allowClear={false}
              fieldProps={{
                defaultValue: "PRICE",
                onChange: (v) => {
                  getInquiryOffer({
                    variables: {
                      params: {
                        sort: v,
                        inquiryItemId: current,
                      },
                    },
                  });
                },
              }}
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
                    <Space>
                      货期
                      <div style={{ color: "#f2b06a" }}>{item?.delivery}天</div>
                      单价
                      <div style={{ color: "#f2b06a" }}>￥{item?.price}</div>
                    </Space>
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

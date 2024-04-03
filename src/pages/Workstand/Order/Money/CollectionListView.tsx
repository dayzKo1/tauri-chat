import CustomPagination from "@/components/Workstand/CustomPagination";
import Preview from "@/components/Workstand/Preview";
import {
  collection,
  collectionInfo,
  getBuyerList,
  paymentInfo,
} from "@/services";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import {
  EditableProTable,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useSearchParams } from "@umijs/max";
import type { DescriptionsProps, PaginationProps } from "antd";
import { Button, Descriptions, Modal, Space, Spin, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { useRef, useState } from "react";
import { styled } from "umi";

dayjs.locale("zh-cn");
dayjs.extend(weekday);
dayjs.extend(localeData);

const ProTable: any = styled(EditableProTable)`
  .ant-pro-table-list-toolbar-left-has-tabs {
    max-width: 100%;
    border-bottom: 0.0625rem solid #efefef;
  }
  .ant-pro-table-list-toolbar-container {
    padding-block: 0;
    display: block;
  }
  .ant-pro-table-list-toolbar-right {
    padding-top: 1.25rem;
    height: 3.125rem;
    justify-content: flex-start;
    button {
      margin-left: 0.625rem;
    }
  }
  .ant-pro-table-alert {
    margin-block-end: 0;
  }
  .ant-table-wrapper {
    margin-block-start: ${({ open }: any) => (open ? 0 : "20px")};
  }
  .ant-form {
    display: flex;
  }
`;

const Content: any = styled(Modal)`
  .ant-modal-content {
    border-radius: 0rem;
    padding: 0rem;
  }
`;

const itemsList = [
  { label: "未收款", key: "false" },
  { label: "已收款", key: "true" },
];

const DescriptionsCard = ({ item }: any) => {
  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "付款银行",
      children: item.payingBank + " " + item.payingNumber,
    },
    {
      key: "2",
      label: "收款单位",
      children: item?.receiptsCompany?.name,
    },
    {
      key: "3",
      label: "流水号/凭证",
      children:
        item?.billIds ||
        item?.attachment?.map((item1: any, index: number) => (
          <Preview
            key={index}
            item={item1}
            index={index}
            types={item.attachmentContentType}
          />
        )),
    },
    {
      key: "4",
      label: "收款银行",
      children: item.receivingBank + " " + item.receivingNumber,
    },
    {
      key: "5",
      label: "付款时间",
      children: timeStampToNormalTime(item.payDate, "-"),
    },
  ];
  return <Descriptions column={2} items={items} />;
};

function CollectionListView() {
  const ref: any = useRef(null);
  const searchRef: any = useRef(null);
  const [search] = useSearchParams();
  const rcUserId = search.get("rcUserId");
  const [messageApi, contextHolder] = message.useMessage();
  const [activeKey, setActiveKey] = useState("false");
  const [detailOpen, setDetailOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 0,
    pageSize: 10,
    total: 0,
  });
  // request
  const [getCollectionList] = useLazyQuery(collectionInfo);
  const [getBuyerData] = useLazyQuery(getBuyerList);
  const [getPaymentInfo, { data: detailInfo, loading: detailLoading }] =
    useLazyQuery(paymentInfo);
  const collectionDetail = detailInfo?.paymentItem.info;
  const [confirmCollection, { loading }] = useMutation(collection);

  // 分页
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
  // 表单格式
  const columns = [
    {
      title: "序",
      dataIndex: "index",
      valueType: "index",
      align: "center",
      editable: false,
      width: "3.5%",
    },
    {
      title: "付款单位",
      editable: false,
      dataIndex: ["payCompany", "name"],
      width: "15%",
    },
    {
      title: "付款时间",
      editable: false,
      dataIndex: "payDate",
      width: "15%",
      render: (v: Date) => timeStampToNormalTime(v, "-"),
    },
    {
      title: "付款银行及账号",
      render: (_: any, record: any) =>
        record?.receivingBank + " " + record?.receivingNumber,
      editable: false,
    },
    {
      title: "转账流水号",
      editable: false,
      width: "17.5%",
      render: (_: any, record: any) => record?.billIds || "-",
    },
    {
      title: "票据凭证",
      editable: false,
      width: "12%",
      align: "center",
      render: (_: any, record: any) => {
        if (record?.attachment?.length > 0) {
          return record?.attachment?.map((item: any, index: number) => (
            <div
              key={index}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Preview
                item={item}
                index={index}
                types={record?.attachmentContentType}
              />
            </div>
          ));
        } else {
          return "暂无";
        }
      },
    },
    {
      title: "明细数",
      editable: false,
      dataIndex: "count",
      width: "6%",
    },
    {
      title: "付款总金额（元）",
      render: (_: any, record: any) => (
        <span style={{ color: "#F29D39" }}>
          {Number(record?.countPaymentAmount).toFixed(2)}
        </span>
      ),
      editable: false,
      width: "12%",
    },
    {
      title: "操作",
      editable: false,
      width: "7%",
      render: (_: any, record: any) => (
        <Button
          onClick={() => {
            getPaymentInfo({
              variables: {
                id: record.id,
              },
              fetchPolicy: "no-cache",
            });
            setDetailOpen(true);
          }}
          type="link"
        >
          {activeKey === "true" ? "查看" : "收款"}
        </Button>
      ),
    },
  ];
  const comfirmColumns = [
    {
      title: "序",
      dataIndex: "index",
      valueType: "index",
      editable: false,
      width: "4%",
    },
    {
      title: "订单号",
      dataIndex: "orderId",
      editable: false,
      width: "11%",
    },
    {
      title: "品牌",
      dataIndex: "brandName",
      editable: false,
      width: "6%",
    },
    {
      title: "询价内容",
      dataIndex: "model",
      editable: false,
      width: "20%",
    },
    {
      title: "数量",
      align: "center",
      dataIndex: "quantity",
      editable: false,
      width: "6%",
    },
    {
      title: "单位",
      align: "center",
      dataIndex: "unit",
      editable: false,
      width: "6%",
    },
    {
      title: "单价（元）",
      dataIndex: "price",
      width: "6%",
      render: (v: any) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: "总金额（元）",
      dataIndex: "totalAmount",
      width: "6%",
      render: (v: any) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: "付款比例",
      align: "center",
      dataIndex: "amount",
      editable: false,
      width: "6%",
      render: (v: any) => v * 100 + "%",
    },
    {
      title: "应付款金额（元）",
      dataIndex: "paymentAmount",
      editable: false,
      width: "6%",
      render: (v: any) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
  ];

  const confirmCollectionFn = () => {
    confirmCollection({
      variables: {
        paymentItemId: collectionDetail.id,
      },
      onCompleted: () => {
        messageApi.success("收款成功!");
        ref.current.reload();
        setDetailOpen(false);
      },
      onError: (err) => {
        const errInfo = JSON.parse(JSON.stringify(err));
        messageApi.error(
          errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
            ? errInfo.message
            : "收款失败，请稍后重试",
        );
      },
    });
  };
  return (
    <>
      {contextHolder}
      <ProTable
        actionRef={ref}
        tableAlertRender={false}
        alwaysShowAlert
        bordered
        rowKey={"id"}
        dateFormatter="string"
        recordCreatorProps={false}
        search={false}
        scroll={{
          y: "60vh",
        }}
        columns={columns}
        rowSelection={false}
        params={{ activeKey }}
        request={async () => {
          const {
            timeRange = [],
            companyId,
            transferSerialNo,
          } = searchRef.current.getFieldsValue();
          const [start, end] = timeRange ?? [];
          const params = {
            start: timeRange?.length
              ? new Date(
                  new Date(dayjs(start?.["$d"]).valueOf()).setHours(0, 0, 0, 0),
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
            targetRcUserId: rcUserId || null,
            companyId: companyId,
            receipts: activeKey === "true",
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
          };
          const { data } = await getCollectionList({
            variables: {
              params,
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { data, __typename, ...newObj } = res.paymentItem.page;
              setPagination(newObj);
            },
          });
          return Promise.resolve({
            data: data?.paymentItem.page.data,
            success: true,
          });
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeKey,
            items: itemsList,
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
              <Space
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
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
                  name={"companyId"}
                  showSearch
                  placeholder="请选择交易方"
                  request={async () => {
                    const { data } = await getBuyerData();
                    const items = data?.order.offerMyCompanies;
                    return items.map((item: any) => ({
                      label: item.label,
                      value: item.value,
                    }));
                  }}
                />
                <ProFormText
                  name="transferSerialNo"
                  placeholder="请输入转账流水号"
                />
              </Space>
            </ProForm>
          ),
        }}
      />
      {/* 分页器 */}
      <CustomPagination
        pagination={pagination}
        onShowSizeChange={onShowSizeChange}
      />
      {/* 详情Modal */}
      <Content
        open={detailOpen}
        centered
        modalProps={{
          destroyOnClose: true,
        }}
        footer={null}
        width={1200}
        onCancel={() => {
          setDetailOpen(false);
        }}
      >
        <Spin tip="努力加载中..." spinning={detailLoading}>
          <span style={{ height: 540 }}>
            <Space
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                height: 56,
                backgroundColor: "#F3F3F3",
                borderBottom: ".0625rem solid #E7E7E7",
                paddingLeft: 30,
                paddingRight: 30,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                {activeKey === "true" ? "收款详情" : "确认收款"}
              </span>
            </Space>
            <div
              style={{
                height: 600,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {activeKey === "true" ? (
                <div style={{ marginLeft: 20 }}>
                  <DescriptionsCard item={collectionDetail || {}} />
                </div>
              ) : (
                <Space
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    paddingLeft: 30,
                    paddingRight: 30,
                    height: 35,
                  }}
                >
                  <span
                    style={{
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 16,
                    }}
                  >
                    付款单位：{collectionDetail?.payCompany.name}
                  </span>
                  <span
                    style={{
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 16,
                    }}
                  >
                    <span>转账流水号：{collectionDetail?.billIds || "-"}</span>
                    <span style={{ marginLeft: 30 }}>
                      票据凭证：
                      {collectionDetail?.attachment.length > 0
                        ? collectionDetail?.attachment.map(
                            (item: any, index: number) => (
                              <Preview
                                key={index}
                                item={item}
                                index={index}
                                types={collectionDetail?.attachmentContentType}
                              />
                            ),
                          )
                        : "暂无"}
                    </span>
                  </span>
                </Space>
              )}
              <ProTable
                alwaysShowAlert
                bordered
                rowKey="orderItemId"
                dateFormatter="string"
                open={true}
                recordCreatorProps={false}
                value={collectionDetail?.shouldPays || []}
                search={false}
                scroll={{
                  y: "30vh",
                }}
                columns={comfirmColumns}
              />
              <Space
                style={{
                  width: "95%",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  position: "absolute",
                  bottom: 30,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: "#000" }}>
                  应付总金额:
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      color: "#FF0C0C",
                      marginLeft: 5,
                    }}
                  >
                    ￥ {Number(collectionDetail?.totalAmount).toFixed(2)}
                  </span>
                </span>
                {activeKey !== "true" && (
                  <Button
                    style={{
                      height: 40,
                      paddingLeft: 20,
                      paddingRight: 20,
                      borderRadius: 2,
                      zIndex: 999,
                      marginLeft: 20,
                    }}
                    loading={loading}
                    onClick={confirmCollectionFn}
                    type="primary"
                  >
                    确认付款
                  </Button>
                )}
              </Space>
            </div>
          </span>
        </Spin>
      </Content>
    </>
  );
}

export default CollectionListView;

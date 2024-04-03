import CustomPagination from "@/components/Workstand/CustomPagination";
import DeliveryInput from "@/components/Workstand/DeliveryInput";
import Preview from "@/components/Workstand/Preview";
import {
  confirmReceipt,
  getAfterShipment,
  getStockTableDetail,
  getSupplierList,
} from "@/services";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import {
  EditableProTable,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useSearchParams } from "@umijs/max";
import type { MenuProps, PaginationProps } from "antd";
import { Button, Dropdown, Modal, Space, message } from "antd";
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
    margin-block-start: ${({ open }: any) => (open ? 0 : "20px")};
  }
  .ant-form {
    display: flex;
  }
`;

const Content: any = styled(Modal)`
  .ant-modal-content {
    border-radius: 0px;
    padding: 0px;
  }
`;

const itemsList = [
  { label: "未收货", key: "NOT_RECEIVE" },
  { label: "已收货", key: "RECEIVED" },
];

const ReceiveGoodsListView = () => {
  const ref: any = useRef(null);
  const searchRef: any = useRef(null);
  const editRef: any = useRef(null);
  const [search] = useSearchParams();
  const rcUserId = search.get("rcUserId");
  const [messageApi, contextHolder] = message.useMessage();
  const [activeKey, setActiveKey] = useState("NOT_RECEIVE");
  const [editableKeys, setEditableRowKeys]: Array<any> = useState([]);
  const [stockTableId, setStockTableId] = useState("");
  const [comfirmOpen, setComfirmOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageCount: 0,
    pageSize: 10,
    total: 0,
  });
  // request
  const [getShippedGoodsList] = useLazyQuery(getAfterShipment);
  const [getSupplierData] = useLazyQuery(getSupplierList);
  const { data: deliveryInfo } = useQuery(getStockTableDetail, {
    variables: {
      stockTableId,
    },
    skip: !stockTableId,
    fetchPolicy: "no-cache",
    onCompleted: (res) => {
      setEditableRowKeys(
        res?.stock.stockDetails.itemList.map((item: any) => item.stockItemId),
      );
    },
  });
  const stockDetail = deliveryInfo?.stock.stockDetails;
  const [confirm, { loading }] = useMutation(confirmReceipt);
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
      title: "出库单号",
      dataIndex: "stockTableId",
      editable: false,
      width: "10%",
    },
    {
      title: "供应商",
      width: "17%",
      dataIndex: "companyName",
      editable: false,
    },

    {
      title: "物流公司",
      width: "15%",
      editable: false,
      render: (v: any) => <span>{v.shipperName + " " + v.logisticCode}</span>,
    },
    {
      title: "物流凭证",
      width: "10%",
      editable: false,
      render: (v: any) => {
        if (v.attachment?.length > 0) {
          return v.attachment.map((item: any, index: number) => (
            <Preview
              key={index}
              item={item}
              types={v.attachmentContentType}
              index={index}
            />
          ));
        } else {
          return <div>-</div>;
        }
      },
    },
    {
      title: "发货明细数",
      dataIndex: "stockItemNum",
      align: "center",
      editable: false,
      width: "6%",
    },
    {
      title: "发货日期",
      dataIndex: "operatorAt",
      align: "center",
      editable: false,
      width: "10%",
      render: (v: Date) => timeStampToNormalTime(v, "-"),
    },
    {
      title: "操作",
      editable: false,
      align: "center",
      width: "8%",
      render: (v: any) =>
        "RECEIVED" === activeKey ? (
          <Button
            type="link"
            onClick={() => {
              setStockTableId(v.stockTableId);
              setComfirmOpen(true);
            }}
          >
            查看
          </Button>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setStockTableId(v.stockTableId);
              setComfirmOpen(true);
            }}
          >
            收货
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
      width: "2%",
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
      dataIndex: "content",
      editable: false,
      width: "20%",
    },
    {
      title: "单位",
      align: "center",
      dataIndex: "unit",
      editable: false,
      width: "4%",
    },
    {
      title: "单价（元）",
      align: "center",
      dataIndex: "deliveryDate",
      editable: false,
      width: "6%",
      render: (v: any) => (
        <span style={{ color: "#F29D39" }}>{Number(v).toFixed(2)}</span>
      ),
    },
    {
      title: "货期（天）",
      align: "center",
      dataIndex: "deliveryDate",
      editable: false,
      width: "6%",
    },
    {
      title: "发货数量",
      dataIndex: "shippedQuantity",
      align: "center",
      valueType: "digit",
      width: "6%",
      editable: false,
    },
    {
      title: "签收数量",
      align: "center",
      dataIndex: "receivedQuantity",
      valueType: "digit",
      width: "6%",
      editable: activeKey === "NOT_RECEIVE",
      renderFormItem: (v: any) => {
        return <DeliveryInput maxNum={v.entry.receivedQuantity} />;
      },
    },
  ];
  const items: MenuProps["items"] = stockDetail?.attachment.map(
    (item: any, index: number) => ({
      key: index,
      label: (
        <Preview
          item={item}
          index={index}
          types={stockDetail?.attachmentContentType}
        />
      ),
    }),
  );
  // 确认收货
  const confirmFn = () => {
    const editForm = editRef.current.getFieldValue();
    const arr = Object.keys(editForm);
    const newList = stockDetail?.itemList;
    const newArr = newList.map((item: any) => {
      return {
        stockItemId: item.stockItemId,
        quantity: arr.includes(item.stockItemId)
          ? editForm[item.stockItemId].receivedQuantity
          : item.receivedQuantity,
      };
    });
    confirm({
      variables: {
        stockTableId: stockDetail?.stockTableId,
        params: newArr,
      },
      onCompleted: () => {
        messageApi.success("确认收货成功！");
        ref.current.reload();
        setComfirmOpen(false);
      },
      onError: (err) => {
        const errInfo = JSON.parse(JSON.stringify(err));
        messageApi.error(
          errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
            ? errInfo.message
            : "确认收货失败，请稍后重试！",
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
        rowKey={"stockTableId"}
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
            stockTableId,
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
            stockStatus: activeKey,
            stockTableId: stockTableId,
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
          };
          const { data } = await getShippedGoodsList({
            variables: {
              params,
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { stockList, __typename, ...newObj } =
                res.stock.listStockTable;
              setPagination(newObj);
            },
          });

          return Promise.resolve({
            data: data?.stock.listStockTable.stockList,
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
                  placeholder="请选择交易商"
                  request={async () => {
                    const { data } = await getSupplierData();
                    const items = data?.order.inquiryMyCompanies;
                    return items.map((item: any) => ({
                      label: item.label,
                      value: item.value,
                    }));
                  }}
                />
                <ProFormText name="stockTableId" placeholder="请输入出库单号" />
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
      {/* 确认收货Modal */}
      <Content
        open={comfirmOpen}
        centered
        modalProps={{
          destroyOnClose: true,
        }}
        footer={null}
        width={1200}
        onCancel={() => {
          setComfirmOpen(false);
        }}
      >
        <span style={{ height: 540 }}>
          <Space
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              height: 56,
              backgroundColor: "#F3F3F3",
              borderBottom: "1px solid #E7E7E7",
              paddingLeft: 30,
              paddingRight: 30,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {"RECEIVED" === activeKey ? "详情" : "确认收货"}
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
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                发货单位：
                {stockDetail?.offerCompanyName}
              </span>
              <span>
                <Space
                  style={{ color: "#8c8c8c", fontSize: 16, marginRight: 20 }}
                >
                  物流公司：
                  <span style={{ color: "#000" }}>
                    {stockDetail?.shipperName + " " + stockDetail?.logisticCode}
                  </span>
                </Space>
                <Space style={{ color: "#8c8c8c", fontSize: 16 }}>
                  物流凭证：
                  {stockDetail?.attachment.length ? (
                    stockDetail?.attachment.length > 1 ? (
                      <Dropdown menu={{ items }}>
                        <span style={{ color: "#4E83FD", lineHeight: 2.5 }}>
                          凭证(
                          {stockDetail?.attachment.length})
                        </span>
                      </Dropdown>
                    ) : (
                      <Preview
                        item={stockDetail?.attachment[0]}
                        index={0}
                        types={stockDetail?.attachmentContentType}
                      />
                    )
                  ) : (
                    <span style={{ color: "#ddd" }}>暂无</span>
                  )}
                </Space>
              </span>
            </Space>
            <ProTable
              alwaysShowAlert
              bordered
              editableFormRef={editRef}
              rowKey="stockItemId"
              dateFormatter="string"
              recordCreatorProps={false}
              value={stockDetail?.itemList.map((item: any) => ({
                ...item,
                companyName: stockDetail?.inquiryCompanyName,
              }))}
              search={false}
              editable={{
                editableKeys,
                type: "multiple",
                onChange: setEditableRowKeys,
              }}
              scroll={{
                y: "50vh",
              }}
              columns={comfirmColumns}
            />
            {activeKey === "NOT_RECEIVE" && (
              <Button
                style={{
                  position: "absolute",
                  bottom: 20,
                  height: 40,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 2,
                  zIndex: 999,
                }}
                loading={loading}
                type="primary"
                onClick={confirmFn}
              >
                确认收货
              </Button>
            )}
          </div>
        </span>
      </Content>
    </>
  );
};

export default ReceiveGoodsListView;

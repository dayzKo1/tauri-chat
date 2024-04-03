import CustomPagination from "@/components/Workstand/CustomPagination";
import DeliveryInput from "@/components/Workstand/DeliveryInput";
import PriceInput from "@/components/Workstand/PriceInput";
import { createDirects, sendMessages } from "@/methods";
import { getAllBrands, listOfferByCustomer, sendOffer } from "@/services";
import { random } from "@/utils";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import {
  EditableProTable,
  ProForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useRequest } from "ahooks";
import type { PaginationProps } from "antd";
import { Button, Space, message } from "antd";
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
    margin-block-start: ${({ selectedRowKeys }: any) =>
      selectedRowKeys.length > 0 ? 0 : "46px"};
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
  const [search] = useSearchParams();
  const rcUserId = search.get("rcUserId");

  const [getBrands] = useLazyQuery(getAllBrands);

  const columns = [
    {
      title: "采购商",
      dataIndex: "companyName",
      editable: false,
      width: 250,
    },
    {
      title: "品牌",
      dataIndex: "brandName",
      editable: false,
      width: 100,
    },
    {
      title: "询价内容",
      dataIndex: "content",
      editable: false,
      width: 300,
    },
    {
      title: "询价日期",
      dataIndex: "date",
      editable: false,
      render: (v: Date) => timeStampToNormalTime(v),
      width: 100,
    },
    {
      title: "单价(元)",
      dataIndex: "price",
      valueType: "money",
      editable: activeKey !== "DEALT",
      renderFormItem: () => <PriceInput />,
      width: 150,
    },
    {
      title: "货期(天)",
      dataIndex: "delivery",
      valueType: "digit",
      editable: activeKey !== "DEALT",
      renderFormItem: () => <DeliveryInput />,
      width: 150,
    },
  ];

  const [getInquiry] = useLazyQuery(listOfferByCustomer, {
    fetchPolicy: "no-cache",
  });

  const { runAsync: create } = useRequest(createDirects, {
    manual: true,
  });

  const { runAsync: send } = useRequest(sendMessages, {
    manual: true,
    onError: () => {
      messageApi.error("发送失败,请稍后重试！");
    },
  });

  const [offer, { loading }] = useMutation(sendOffer, {
    onCompleted: async ({ offers }) => {
      if (offers?.offerInquiryByCustomer.length === 0) {
      } else {
        for (const item of offers?.offerInquiryByCustomer) {
          const { room } = await create({ data: { username: item?.userName } });
          send({
            data: {
              message: {
                msg: "[报价信息]",
                message: item,
                rid: room?.rid,
                _id: random(17),
              },
            },
          });
        }
      }
      messageApi.success("报价成功");
      setSelectedRowKeys([]);
      setSelectedRows([]);
      if (activeKey === "CREATED") {
        formRef.current.setFieldValue(null);
      }
      ref.current.reload();
    },
    onError: () => {
      messageApi.error("创建报价失败，请稍后重试！");
    },
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
          y: "60vh",
        }}
        columns={columns}
        editable={{
          editableKeys,
          type: "multiple",
          onChange: setEditableRowKeys,
        }}
        rowSelection={
          activeKey === "DEALT"
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
            companyName,
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
                companyName,
                companyRcUserId: rcUserId || null,
                status: activeKey,
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
              },
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { offerList, __typename, ...newObj } =
                res.offers?.listOfferByCustomer;
              setPagination(newObj);
            },
          });
          setEditableRowKeys(
            data?.offers?.listOfferByCustomer?.offerList?.map(
              (item: any) => item.inquiryItemId,
            ),
          );
          return Promise.resolve({
            data: data?.offers?.listOfferByCustomer?.offerList,
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
                <ProFormText name="companyName" placeholder="请输入采购商" />
                <ProFormText name="keyword" placeholder="请输入关键字" />
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
            loading={loading}
            onClick={() => {
              const FormData = formRef.current.getFieldValue();
              let hasEmpty = false;
              let BreakException = {};
              try {
                selectedRows.forEach((item: any) => {
                  if (
                    !FormData[item?.inquiryItemId].delivery ||
                    !FormData[item?.inquiryItemId].price
                  ) {
                    hasEmpty = true;
                    throw BreakException;
                  }
                });
              } catch (e) {
                if (e !== BreakException) {
                  throw e;
                }
              }
              if (hasEmpty) {
                messageApi.error("报价价格或货期不能为空!");
              } else {
                offer({
                  variables: {
                    params: selectedRows.map((item: any) => ({
                      inquiryRcUserId: item?.inquiryRcUserId,
                      inquiryItemId: item?.inquiryItemId,
                      offerDelivery: Number(
                        FormData[item?.inquiryItemId].delivery,
                      ),
                      offerPrice: Number(FormData[item?.inquiryItemId].price),
                    })),
                  },
                });
              }
            }}
          >
            发送报价
          </Button>
        )}
      </Space>
    </>
  );
};

export default Mine;

import CustomPagination from "@/components/Workstand/CustomPagination";
import DeliveryInput from "@/components/Workstand/DeliveryInput";
import PriceInput from "@/components/Workstand/PriceInput";
import {
  getAllBrands,
  getInquiryByCusToSeller,
  getOrginOffer,
  updInquiryInfoSeller,
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
import type { PaginationProps } from "antd";
import { Button, Modal, Space, Tag, message } from "antd";
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
    margin-block-start: ${({ selectedRowKeys }: any) =>
      selectedRowKeys.length > 0 ? 0 : "30px"};
  }
  .ant-form {
    display: flex;
  }
`;

const items = [
  { label: "未报价", key: "CREATED" },
  { label: "未订货", key: "OFFERED" },
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
  const [getInquiry] = useLazyQuery(getInquiryByCusToSeller);
  const [save, { loading }] = useMutation(updInquiryInfoSeller, {
    onCompleted: () => {
      messageApi.success("保存成功");
      ref.current.reload();
    },
    onError: (err) => {
      const errInfo = JSON.parse(JSON.stringify(err));
      messageApi.error(
        errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
          ? errInfo.message
          : "更改失败，请稍后重试！",
      );
    },
  });
  const [getBrands] = useLazyQuery(getAllBrands);
  const [getOrigin] = useLazyQuery(getOrginOffer, {
    onCompleted: ({ offers }) => {
      const origin = offers.findOrigOffer;
      Modal.confirm({
        icon: null,
        title: "原始报价",
        content: (
          <div style={{ fontSize: 16 }}>
            <div>
              <Tag
                color="blue"
                bordered={false}
                style={{ padding: 6, marginBottom: 10 }}
              >
                {origin?.brandName}
              </Tag>
              {origin?.content}
            </div>
            <div
              style={{
                border: "1px solid #efefef",
                padding: 12,
                width: "100%",
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              单价最低
              <div style={{ color: "#f2b06a" }}>
                货期{origin?.prMinDelivery}天
              </div>
              <div style={{ color: "#f2b06a" }}>单价￥{origin?.prMinPrice}</div>
            </div>
            <div
              style={{
                border: "1px solid #efefef",
                padding: 12,
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              货期最短
              <div style={{ color: "#f2b06a" }}>
                货期{origin?.deMinDelivery}天
              </div>
              <div style={{ color: "#f2b06a" }}>单价￥{origin?.deMinPrice}</div>
            </div>
          </div>
        ),
      });
    },
  });
  const columns = [
    {
      title: "询价信息",
      children: [
        {
          title: "品牌",
          dataIndex: "brandName",
          editable: false,
          width: ["CREATED"].includes(activeKey) ? "25%" : "auto",
        },
        {
          title: "询价内容",
          dataIndex: "content",
          editable: false,
          width: ["CREATED"].includes(activeKey) ? "25%" : "auto",
        },
        {
          title: "采购商",
          dataIndex: "companyName",
          editable: false,
          width: ["CREATED"].includes(activeKey) ? "25%" : "auto",
        },
        {
          title: "询价日期",
          dataIndex: "date",
          editable: false,
          render: (v: Date) => timeStampToNormalTime(v),
          width: ["CREATED"].includes(activeKey) ? "25%" : "auto",
        },
      ],
    },
    {
      title: "单价最低",
      children: [
        {
          title: "单价(元)",
          dataIndex: ["offer", "prMinPrice"],
          valueType: "money",
          renderFormItem: (text: any) => {
            return <PriceInput value={text} />;
          },
        },
        {
          title: "货期(天)",
          dataIndex: ["offer", "prMinDelivery"],
          valueType: "digit",
          renderFormItem: (text: any) => {
            return <DeliveryInput value={text} />;
          },
        },
      ],
      hideInTable: ["CREATED"].includes(activeKey),
    },
    {
      title: "货期最短",
      children: [
        {
          title: "单价(元)",
          dataIndex: ["offer", "deMinPrice"],
          valueType: "money",
          renderFormItem: (text: any) => {
            return <PriceInput value={text} />;
          },
        },
        {
          title: "货期(天)",
          dataIndex: ["offer", "deMinDelivery"],
          valueType: "digit",
          renderFormItem: (text: any) => {
            return <DeliveryInput value={text} />;
          },
        },
      ],
      hideInTable: ["CREATED"].includes(activeKey),
    },
    {
      title: "操作",
      dataIndex: "inquiryItemId",
      render: (v: any) => (
        <Button
          type="link"
          onClick={() => {
            getOrigin({
              variables: {
                inquiryItemId: Number(v),
              },
            });
          }}
        >
          原始报价
        </Button>
      ),
      editable: false,
      hideInTable: ["CREATED"].includes(activeKey),
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
      <ProTable
        actionRef={ref}
        editableFormRef={formRef}
        selectedRowKeys={selectedRowKeys}
        alwaysShowAlert
        bordered
        rowKey={"inquiryItemId"}
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
          ["OFFERED"].includes(activeKey) && {
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
                status: activeKey,
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
              },
            },
            fetchPolicy: "no-cache",
            onCompleted: (res) => {
              const { inquiryItemList, __typename, ...newObj } =
                res.inquiry?.listInquiryBySeller;
              setPagination(newObj);
            },
          });
          setEditableRowKeys(
            data?.inquiry?.listInquiryBySeller?.inquiryItemList?.map(
              (item: any) => item.inquiryItemId,
            ),
          );
          return {
            data: data?.inquiry?.listInquiryBySeller?.inquiryItemList,
            success: true,
          };
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeKey,
            items,
            onChange: (key: any) => {
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
                <ProFormText
                  name="companyName"
                  placeholder="请输入采购商名称"
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
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              save({
                variables: {
                  params: selectedRows.map((item: any) => {
                    const {
                      deMinDelivery,
                      deMinPrice,
                      prMinDelivery,
                      prMinPrice,
                    } =
                      formRef.current.getFieldValue()[item.inquiryItemId]
                        ?.offer;
                    return {
                      inquiryItemId: Number(item.inquiryItemId),
                      deMinDelivery: Number(deMinDelivery),
                      deMinPrice: Number(deMinPrice),
                      prMinDelivery: Number(prMinDelivery),
                      prMinPrice: Number(prMinPrice),
                    };
                  }),
                },
              });
            }}
          >
            保存
          </Button>
        )}
      </Space>
    </>
  );
};

export default Mine;

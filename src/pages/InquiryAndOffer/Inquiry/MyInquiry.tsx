import { getInquiryOffers, getMyInquiryInfo, remindOffer } from "@/services";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import { EditableProTable, ProFormSelect } from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, Card, Modal, Space, Tag, message } from "antd";
import { useRef, useState } from "react";
import { styled } from "umi";

const ProTable = styled(EditableProTable)`
  padding: 48px 12px;
  .ant-pro-table-list-toolbar-right {
    justify-content: flex-start;
  }
  .ant-pro-table-list-toolbar-container {
    padding-block: 0;
    display: block;
  }
`;

const Detail = ({ ids }: any) => {
  const ref = useRef(null);
  const [current, setCurrent] = useState();
  const [sort, setSort] = useState("PRICE");
  const [open, setOpen] = useState(false);

  const [getMyInquiry] = useLazyQuery(getMyInquiryInfo);

  const [getInquiryOffer, { data: inquiryOffer }] =
    useLazyQuery(getInquiryOffers);
  const [remind, { loading }] = useMutation(remindOffer, {
    onCompleted: () => {
      message.success("提醒成功");
    },
  });
  const columns = [
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
      valueType: "date",
    },
    {
      title: "中标供应商",
      dataIndex: ["winOffer", "companyName"],
    },
    {
      title: "单价(元)",
      dataIndex: ["winOffer", "price"],
    },
    {
      title: "货期(天)",
      dataIndex: ["winOffer", "delivery"],
    },
    {
      title: "操作",
      dataIndex: "inquiryItemId",
      render: (v: any) => (
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
      ),
    },
  ];

  return (
    <>
      <ProTable
        params={{ sort }}
        request={async (params: any) => {
          const { data } = await getMyInquiry({
            variables: {
              params: {
                ...params,
                inquiryItemIdList: ids,
              },
            },
          });
          return {
            data: data?.inquiry?.purchaserInfo,
            success: true,
          };
        }}
        toolbar={{
          filter: (
            <ProFormSelect
              name="sort"
              allowClear={false}
              options={[
                { label: "单价最低", value: "PRICE" },
                { label: "货期最短", value: "DELIVERY" },
              ]}
              fieldProps={{
                defaultValue: "PRICE",
                onChange: (v) => setSort(v),
              }}
            />
          ),
        }}
        actionRef={ref}
        bordered
        rowKey="inquiryItemId"
        dateFormatter="string"
        search={false}
        options={false}
        columns={columns}
        recordCreatorProps={false}
        scroll={{
          y: "60vh",
        }}
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
                    <strong>{item.companyName}</strong>
                    {item?.offerStatus === "NONE" ? (
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
                        type="link"
                      >
                        提醒报价
                      </Button>
                    ) : (
                      <Space>
                        货期
                        <div style={{ color: "#f2b06a" }}>
                          {item.delivery}天
                        </div>
                        单价
                        <div style={{ color: "#f2b06a" }}>￥{item.price}</div>
                      </Space>
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

export default Detail;

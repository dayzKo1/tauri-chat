import {
  closeDetails,
  getInquiryOffers,
  getOffer,
  remindOffer,
} from "@/services";
import { EditableProTable, ProFormSelect } from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, Card, Modal, Space, Tag, message } from "antd";
import { useRef, useState } from "react";
import { styled } from "umi";
import { timeStampToNormalTime } from "../../../utils/timeStampToNormalTime";
import CreateOffer from "../../Workstand/Inquiry/MyInquiry/Common/CreateOffer";
import CreateOrder from "../../Workstand/Inquiry/MyInquiry/Common/CreateOrder";

const ProTable: any = styled(EditableProTable)`
  padding: 48px 12px;
  .ant-pro-table-list-toolbar-right {
    justify-content: flex-start;
  }
  .ant-pro-table-list-toolbar-container {
    padding-block: 0;
    display: block;
  }
`;

const Detail = ({ ids, rcUserId }: any) => {
  const ref: any = useRef(null);
  const [current, setCurrent] = useState();
  const [open, setOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const [closeDetail] = useMutation(closeDetails, {
    onCompleted: () => {
      messageApi.success("关闭成功");
    },
  });
  const [getOffers] = useLazyQuery(getOffer);
  const [getInquiryOffer, { data: inquiryOffer, refetch }] =
    useLazyQuery(getInquiryOffers);
  const [remind, { loading }] = useMutation(remindOffer, {
    onCompleted: () => {
      message.success("提醒成功");
    },
  });
  const columns = [
    {
      title: "序",
      width: "5%",
      align: "center",
      dataIndex: "index",
      valueType: "index",
      editable: false,
    },
    {
      title: "品牌",
      width: "15%",
      dataIndex: "brandName",
    },
    {
      title: "询价内容",
      dataIndex: "content",
    },
    {
      title: "询价日期",
      width: "10%",
      dataIndex: "created",
      valueType: "date",
    },
    {
      title: "单价(元)",
      width: "10%",
      dataIndex: "offerPrice",
    },
    {
      title: "货期(天)",
      width: "10%",
      dataIndex: "offerDelivery",
    },
    {
      title: "操作",
      align: "center",
      width: "15%",
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
        bordered
        tableAlertRender={false}
        rowSelection={{
          selectedRowKeys,
          onChange: (newSelectedRowKeys: any, newSelectedRows: any) => {
            const newCheckedList: any = [];
            newSelectedRows?.forEach((item: any) => {
              const obj = {
                ...item,
                offer: {
                  ckmroInquiryId: item.ckmroInquiryId,
                  ckmroItemId: item.ckmroItemId,
                  ckmroOfferId: item.ckmroOfferId,
                  delivery: item.offerDelivery,
                  offerAcctId: item.offerAcctId,
                  offerCompanyId: item.offerCompanyId,
                  offerCompanyName: item.offerCompanyName,
                  offerItemId: item.offerItemId,
                  offerStatus: item.offerStatus,
                  price: item.offerPrice,
                },
              };
              newCheckedList.push(obj);
            });
            setSelectedRows(newCheckedList);
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
        request={async () => {
          const { data } = await getOffers({
            variables: {
              params: {
                inquiryItemIdList: ids,
                offerRcUserId: rcUserId,
              },
            },
          });
          return {
            data: data?.offers?.listOfferByChat,
            success: true,
          };
        }}
        scroll={{
          y: "60vh",
        }}
        toolbar={{}}
        actionRef={ref}
        selectedRowKeys={selectedRowKeys}
        rowKey="inquiryItemId"
        dateFormatter="string"
        search={false}
        options={false}
        columns={columns}
        recordCreatorProps={false}
      />
      <Space
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CloseBtn />
        <CreateOffer data={selectedRows} selectedRowKeys={selectedRowKeys} />
        <CreateOrder data={selectedRows} reload={() => ref.current.reload()} />
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

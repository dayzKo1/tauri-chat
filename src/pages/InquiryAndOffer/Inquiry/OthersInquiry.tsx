import { EditableProTable } from "@ant-design/pro-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, Space, message } from "antd";
import { useRef } from "react";
import { styled } from "umi";

import DeliveryInput from "@/components/Workstand/DeliveryInput";
import PriceInput from "@/components/Workstand/PriceInput";
import { createDirects, sendMessages } from "@/methods";
import { getInquiryInfo, sendOffer } from "@/services";
import { random } from "@/utils";
import { useRequest } from "ahooks";

const ProTable = styled(EditableProTable)`
  padding: 48px 12px;
  .ant-tabs-nav-wrap {
    margin-bottom: 12px;
  }
  .ant-pro-table-list-toolbar-right {
    justify-content: flex-start;
  }
  .ant-pro-table-list-toolbar-container {
    padding-block: 0;
    display: block;
  }
`;

const Detail = ({ ids, username, rcUserId }: any) => {
  const ref: any = useRef(null);
  const formRef: any = useRef(null);

  const [getInquiry, { data: inquiry }] = useLazyQuery(getInquiryInfo);

  const { runAsync: create }: any = useRequest(createDirects, {
    manual: true,
  });

  const { runAsync: send } = useRequest(sendMessages, {
    manual: true,
    onSuccess: () => {
      message.success("发送成功");
    },
  });

  const [offer, { loading }] = useMutation(sendOffer, {
    onCompleted: async ({ offers }) => {
      if (username === "CKMRO.Bot") {
        message.success("发送成功");
      } else {
        const { room } = await create({ data: { username } });
        send({
          data: {
            message: {
              msg: "[报价信息]",
              message: offers.offerInquiryByCustomer[0],
              rid: room?.rid,
              _id: random(17),
            },
          },
        });
      }
      ref.current.reload();
    },
    onError: (err) => {
      const errInfo = JSON.parse(JSON.stringify(err));
      message.error(
        errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
          ? errInfo.message
          : "报价失败，请稍后重试！",
      );
    },
  });

  const columns = [
    {
      title: "品牌",
      dataIndex: "brandName",
      editable: false,
      width: "12%",
    },
    {
      title: "询价内容",
      dataIndex: "content",
      editable: false,
    },
    {
      title: "询价日期",
      dataIndex: "date",
      editable: false,
      valueType: "date",
      width: "15%",
    },
    {
      title: "单价(元)",
      dataIndex: ["winOffer", "price"],
      valueType: "money",
      width: "15%",
      renderFormItem: (text: any) => {
        return <PriceInput value={text} />;
      },
    },
    {
      title: "货期(天)",
      dataIndex: ["winOffer", "delivery"],
      valueType: "digit",
      width: "15%",
      renderFormItem: (text: any) => {
        return <DeliveryInput value={text} />;
      },
    },
  ];

  let disableBtn: boolean = false;

  return (
    <>
      <ProTable
        bordered
        actionRef={ref}
        editableFormRef={formRef}
        request={async () => {
          const { data } = await getInquiry({
            variables: {
              params: {
                inquiryItemIdList: ids,
                inquiryRcUserId: rcUserId,
              },
            },
            onCompleted: (res) => {
              res.inquiry.supplyInfo.forEach((item: any) => {
                if (
                  ["ORDERED", "CLOSED"].includes(item.status) &&
                  disableBtn === false
                ) {
                  disableBtn = true;
                }
              });
            },
          });
          return {
            data: data?.inquiry?.supplyInfo,
            success: true,
          };
        }}
        rowKey="inquiryItemId"
        dateFormatter="string"
        columns={columns}
        recordCreatorProps={false}
        scroll={{
          y: "60vh",
        }}
        editable={{
          editableKeys: inquiry?.inquiry?.supplyInfo.map(
            (item: any) => item?.inquiryItemId,
          ),
          type: "multiple",
        }}
      />
      <Space
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          type="primary"
          disabled={disableBtn}
          loading={loading}
          onClick={() => {
            offer({
              variables: {
                params: Object.entries(formRef.current.getFieldValue()).map(
                  (item: any) => ({
                    inquiryRcUserId: inquiry?.inquiry?.supplyInfo.find(
                      (i: any) => i?.inquiryItemId === Number(item[0]),
                    )?.inquiryRcUserId,
                    inquiryItemId: Number(item[0]),
                    offerDelivery: Number(item[1].winOffer.delivery),
                    offerPrice: Number(item[1].winOffer.price),
                  }),
                ),
              },
            });
          }}
        >
          发送报价
        </Button>
      </Space>
    </>
  );
};

export default Detail;

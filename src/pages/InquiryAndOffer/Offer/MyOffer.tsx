import { getOffer } from "@/services";
import { EditableProTable } from "@ant-design/pro-components";
import { useLazyQuery } from "@apollo/client";
import { useRef } from "react";
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

const Detail = ({ ids, rcUserId }: any) => {
  const ref = useRef(null);
  const [getMyOffer] = useLazyQuery(getOffer);

  const columns = [
    {
      title: "品牌",
      dataIndex: "brandName",
      width: "10%",
    },
    {
      title: "询价内容",
      dataIndex: "content",
    },
    {
      title: "询价日期",
      dataIndex: "created",
      valueType: "date",
      width: "15%",
    },
    {
      title: "单价(元)",
      dataIndex: "offerPrice",
      width: "15%",
    },
    {
      title: "货期(天)",
      dataIndex: "offerDelivery",
      width: "15%",
    },
  ];

  return (
    <>
      <ProTable
        bordered
        request={async () => {
          const { data } = await getMyOffer({
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
        toolbar={{}}
        actionRef={ref}
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
    </>
  );
};

export default Detail;

import { EditableProTable } from '@ant-design/pro-components';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Button, Space, message } from 'antd';
import { useRef } from 'react';
import { styled } from 'umi';

import { getInquiryInfoSeller, updInquiryInfoSeller } from '@/services';

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

const Detail = ({ ids }) => {
  const ref = useRef(null);
  const formRef = useRef(null);
  const [getInquiry, { data: inquiry }] = useLazyQuery(getInquiryInfoSeller);
  const [save] = useMutation(updInquiryInfoSeller, {
    onCompleted: () => {
      message.success('保存成功');
      ref.current.reload();
    },
  });

  const columns = [
    {
      title: '询价信息',
      children: [
        {
          title: '品牌',
          dataIndex: 'brandName',
          editable: false,
        },
        {
          title: '询价内容',
          width: 500,
          dataIndex: 'content',
          editable: false,
        },
        {
          title: '询价日期',
          dataIndex: 'rq',
          editable: false,
        },
      ],
    },
    {
      title: '单价最低',
      children: [
        {
          title: '单价(元)',
          dataIndex: ['offerItemMap', 'price', 'nowPrice'],
        },
        {
          title: '货期(天)',
          dataIndex: ['offerItemMap', 'price', 'nowDelivery'],
        },
      ],
    },
    {
      title: '货期最短',
      children: [
        {
          title: '单价(元)',
          dataIndex: ['offerItemMap', 'delivery', 'nowPrice'],
        },
        {
          title: '货期(天)',
          dataIndex: ['offerItemMap', 'delivery', 'nowDelivery'],
        },
      ],
    },
  ];

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
              },
            },
          });
          return {
            data: data?.inquiry?.sellerInfo,
            success: true,
          };
        }}
        rowKey="inquiryItemId"
        dateFormatter="string"
        columns={columns}
        recordCreatorProps={false}
        scroll={{
          y: '60vh',
        }}
        editable={{
          editableKeys: inquiry?.inquiry?.sellerInfo.map(
            (item) => item?.inquiryItemId,
          ),
          type: 'multiple',
        }}
      />
      <Space
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button
          type="primary"
          onClick={() => {
            save({
              variables: {
                params: Object.entries(formRef.current.getFieldValue()).map(
                  (item) => ({
                    inquiryItemId: Number(item[0]),
                    deMinDelivery: Number(
                      item[1].offerItemMap.delivery.nowDelivery,
                    ),
                    deMinPrice: Number(item[1].offerItemMap.delivery.nowPrice),
                    prMinDelivery: Number(
                      item[1].offerItemMap.price.nowDelivery,
                    ),
                    prMinPrice: Number(item[1].offerItemMap.price.nowPrice),
                  }),
                ),
              },
            });
          }}
        >
          保存
        </Button>
      </Space>
    </>
  );
};

export default Detail;

import { sendMessages } from '@/methods';
import { createWin } from '@/utils';
import { ArrowsAltOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { useRequest } from 'ahooks';
import { Button, Divider, Space, Tabs, message } from 'antd';
import { useState } from 'react';
import { styled, useAccess } from 'umi';

import DetailsCard from '@/components/Room/Right/DetailsCard';
import { listOfferByCustomer, offerInquiryByCustomer } from '@/services';

const Warp = styled.div`
  .ant-tabs-content-holder {
    overflow: scroll;
    height: 75vh;
  }
  .ant-space-item {
    width: 100%;
  }
  .ant-space-vertical {
    width: 100%;
  }
  .ant-select-selection-item {
    color: #4e83fd;
  }
`;

export default function Offer({ isInquiry, current }: any) {
  const [activeKey, setActiveKey] = useState('CREATED');
  const [selectList, setSelectList] = useState(new Set());
  const [editList, setEditList] = useState([]);
  const { authority } = useAccess();
  const { data } = useQuery(listOfferByCustomer, {
    variables: {
      params: {
        status: activeKey,
        supplyRcUserId: current?.roomId?.replace(current.uid, ''),
      },
    },
  });
  const [createOffer] = useMutation(offerInquiryByCustomer);
  const dataList = data?.offers.listOfferByCustomer.items;
  const { runAsync: send } = useRequest(sendMessages, {
    manual: true,
    onSuccess: () => {
      message.success('发送成功');
    },
  });
  const handleCheckedList = (checkedList: any, editList?: any) => {
    setEditList(editList);
    setSelectList(new Set(checkedList.map((item: any) => item.inquiryItemId)));
  };
  const sendOffer = () => {
    const offerList: any = [];
    editList.forEach((item: any) => {
      if (selectList.has(item.inquiryItemId)) {
        offerList.push({
          inquiryItemId: item.inquiryItemId,
          offerPrice: item.price,
          offerDelivery: item.delivery,
          inquiryRcUserId: current.uid,
        });
      }
    });
    createOffer({
      variables: {
        params: offerList,
      },
      onCompleted: (res) => {
        send({
          data: {
            message: {
              msg: '[报价信息]',
              message: res.offers.offerInquiryByCustomer,
              rid: current.roomId,
            },
          },
        });
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };
  const items: any = {
    // 0 采购 商、供应商
    0: {
      title: '报价明细',
      tabs: [
        {
          label: '未报价',
          key: 'CREATED',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              handleCheckedList={handleCheckedList}
            />
          ),
        },
        {
          label: '已报价',
          key: 'OFFERED',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              handleCheckedList={handleCheckedList}
            />
          ),
        },
      ],
      buttons: ['发送报价'],
    },
    // 1 业务员
    1: {
      title: '询价明细',
      tabs: [
        {
          label: '未报价',
          key: '未报价',
          children: <DetailsCard isInquiry={isInquiry} authority={authority} />,
        },
        {
          label: '未订货',
          key: '未订货',
          children: <DetailsCard isInquiry={isInquiry} authority={authority} />,
        },
        {
          label: '已订货',
          key: '已订货',
          children: <DetailsCard isInquiry={isInquiry} authority={authority} />,
        },
      ],
      buttons: [],
      filters: false,
    },
    // 6 采购员
    6: {},
  };
  const item = items[authority];
  const Buttons: any = {
    关闭明细: <Button type="primary">关闭明细</Button>,
    发送报价: (
      <Button type="primary" onClick={() => sendOffer()}>
        发送报价
      </Button>
    ),
    向好友询价: <Button type="primary">向好友询价</Button>,
  };
  const onChange = (key: string) => {
    setActiveKey(key);
  };
  return (
    <Warp>
      <div
        style={{
          height: 64,
          fontSize: 18,
          display: 'flex',
          fontWeight: 600,
          padding: '10px 20px',
          justifyContent: 'space-between',
          borderBottom: '1px solid #efefef',
          alignItems: 'center',
        }}
      >
        {item?.title}
        <ArrowsAltOutlined
          onClick={() =>
            createWin({
              title: '报价明细',
              label: 'offer_detail',
              url: '/InquiryAndOffer/detail',
              width: 1300,
              height: 800,
            })
          }
        />
      </div>
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: '0px 12px' }}>
        <Space
          style={{
            width: '100%',
            position: 'relative',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
          size={0}
        >
          <Tabs
            activeKey={activeKey}
            items={item?.tabs}
            onChange={onChange}
            tabBarStyle={{ width: '100%' }}
          />
        </Space>
        <Space
          style={{
            position: 'absolute',
            bottom: '2%',
            left: '30%',
          }}
        >
          {item?.buttons?.map((item: any) => Buttons[item])}
        </Space>
      </div>
    </Warp>
  );
}

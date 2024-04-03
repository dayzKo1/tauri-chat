import { sendMessages } from '@/methods';
import { ArrowsAltOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { useRequest } from 'ahooks';
import { Button, Divider, Select, Space, Tabs, message } from 'antd';
import { useState } from 'react';
import { styled, useAccess } from 'umi';

import {
  appendInquiry,
  closeDetails,
  getCustomerAllInquiry,
  getInquiryByCusToSeller,
} from '@/services';
import {
  createWin,
  formatCusInqruiryBySeller,
  formatCustomerInquiryList,
} from '@/utils';

import DetailsCard from '@/components/Room/Right/DetailsCard';

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

export default function Inquiry({ isInquiry, current }: any) {
  const [activeKey, setActiveKey] = useState('CREATED');
  const [selectList, setSelectList] = useState([]);
  const [sortKey, setSortKey] = useState('PRICE');
  const { authority } = useAccess();
  const { data: customerList, refetch } = useQuery(getCustomerAllInquiry, {
    variables: {
      params: {
        status: activeKey,
        supplyRcUserId: current.roomId.replace(current.uid, ''),
        sort: sortKey,
      },
    },
  });
  const { data: inquiryByCusToSeller } = useQuery(getInquiryByCusToSeller, {
    variables: {
      params: {
        status: activeKey,
        supplyRcUserId: current.roomId.replace(current.uid, ''),
      },
    },
  });
  const [closeDetail] = useMutation(closeDetails);
  const [inquiryToFriend] = useMutation(appendInquiry);
  const dataList =
    formatCustomerInquiryList(
      customerList?.inquiry?.listInquiryByCustomer.inquiryItemList,
    ) ||
    formatCusInqruiryBySeller(
      inquiryByCusToSeller?.inquiry.listInquiryBySeller.inquiryItemList,
    )?.map((item: any) => {
      return item.inquiryVoList?.map((item1: any) => {
        const newItem = { ...item1 };
        delete newItem.companyName;
        return {
          date: item.date,
          inquiryVoList: newItem.inquiryItemVoList,
        };
      })[0];
    });
  const handleCheckedList = (checkedList: any) => {
    setSelectList(checkedList);
  };
  const { runAsync: send } = useRequest(sendMessages, {
    manual: true,
    onSuccess: () => {
      message.success('发送成功');
    },
  });
  //用户关闭明细
  const customerCloseDetail = () => {
    const inquiryItemIdList: any = [];
    selectList.forEach((item: any) => {
      inquiryItemIdList.push(item.inquiryItemId);
    });
    closeDetail({
      variables: {
        inquiryItemIdList: inquiryItemIdList,
      },
      onCompleted: () => {
        refetch({
          params: {
            status: activeKey,
            supplyRcUserId: current.roomId.replace(current.uid, ''),
            sort: sortKey,
          },
        });
        console.log('关闭成功');
      },
      onError: (err: any) => {
        console.log(err);
      },
    });
  };
  //向好友询价
  const handleSendInquiry = () => {
    const inquiryItemIdList: any = [];
    selectList.forEach((item: any) => {
      inquiryItemIdList.push(item.inquiryItemId);
    });
    inquiryToFriend({
      variables: {
        params: {
          inquiryItemIdList,
          sendToIds: [current.uid],
        },
      },
      onCompleted: (res) => {
        send({
          data: {
            message: {
              msg: '[询价信息]',
              message: res.inquiry.appendInquiry,
              rid: current.roomId,
            },
          },
        });
      },
      onError: (e) => {
        console.log(e);
      },
    });
  };
  // 0 采购 商、供应商
  const items: any = {
    // 0 采购 商、供应商
    0: {
      title: '询价明细',
      tabs: [
        {
          label: '未报价',
          key: 'CREATED',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              activeKey={activeKey}
              handleCheckedList={handleCheckedList}
            />
          ),
        },
        {
          label: '未订货',
          key: 'OFFERED',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              activeKey={activeKey}
              handleCheckedList={handleCheckedList}
            />
          ),
          filters: true,
        },
        {
          label: '已订货',
          key: '已订货',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              activeKey={activeKey}
              handleCheckedList={handleCheckedList}
            />
          ),
        },
        {
          label: '已关闭',
          key: 'CLOSE',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              activeKey={activeKey}
              handleCheckedList={handleCheckedList}
            />
          ),
        },
      ],
      buttons: ['关闭明细', '向好友询价'],
    },
    // 1 业务员
    1: {
      title: '询价明细',
      tabs: [
        {
          label: '未报价',
          key: 'CREATED',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              activeKey={activeKey}
              handleCheckedList={handleCheckedList}
            />
          ),
        },
        {
          label: '未订货',
          key: 'OFFERED',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              activeKey={activeKey}
              handleCheckedList={handleCheckedList}
            />
          ),
        },
        {
          label: '已订货',
          key: '已订货',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              activeKey={activeKey}
              handleCheckedList={handleCheckedList}
            />
          ),
        },
        {
          label: '已关闭',
          key: 'CLOSE',
          children: (
            <DetailsCard
              isInquiry={isInquiry}
              authority={authority}
              dataList={dataList}
              activeKey={activeKey}
              handleCheckedList={handleCheckedList}
            />
          ),
        },
      ],
      buttons: [],
      filters: false,
    },
    // 6 采购员
    6: {},
  };
  const Buttons: any = {
    关闭明细: (
      <Button type="primary" onClick={() => customerCloseDetail()}>
        关闭明细
      </Button>
    ),
    发送报价: <Button type="primary">发送报价</Button>,
    向好友询价: (
      <Button type="primary" onClick={() => handleSendInquiry()}>
        向好友询价
      </Button>
    ),
  };
  const item = items[authority];
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
              title: '询价明细',
              label: 'inquiry_detail',
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
        {/* 是否支持筛选 */}
        {[0].includes(authority) && (
          <Select
            bordered={false}
            defaultValue={'单价最低'}
            style={{
              top: 72,
              right: 0,
              width: 100,
              position: 'absolute',
              backgroundColor: '#f7f7f7',
              color: '#4E83FD',
            }}
            options={['单价最低', '货期最短'].map((item) => ({
              label: item,
              value: item,
            }))}
            onChange={(e) => {
              setSortKey(e === '单价最低' ? 'PRICE' : 'DELIVERY');
            }}
          />
        )}
      </div>
    </Warp>
  );
}

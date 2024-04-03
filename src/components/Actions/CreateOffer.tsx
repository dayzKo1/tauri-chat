import {
  ProTable as A,
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Divider } from 'antd';
import { useState } from 'react';
import { styled } from 'umi';

const ProTable = styled(A)`
  .ant-pro-card-body {
    padding-inline: 0;
  }
`;

const CreateOffer = ({ data }) => {
  const [preview, setPreview] = useState(false);
  return (
    <ModalForm
      title="生成报价"
      labelWidth="auto"
      layout="horizontal"
      submitter={{
        render: (props, defaultDoms) => {
          if (preview) {
            return [
              <Button key="last" onClick={() => setPreview(false)}>
                上一步
              </Button>,
              <Button key="download" onClick={() => {}}>
                下载
              </Button>,
              <Button key="send" type="primary" onClick={() => {}}>
                直接发送
              </Button>,
            ];
          }
          return [
            defaultDoms[0],
            <Button
              key="create"
              type="primary"
              onClick={() => {
                props.submit();
                setPreview(true);
              }}
            >
              确认生成
            </Button>,
          ];
        },
      }}
      trigger={<Button type="primary">生成报价</Button>}
      onFinish={async (values: any) => {
        console.log(values);
      }}
      onOpenChange={() => setPreview(false)}
    >
      {preview ? (
        'preview'
      ) : (
        <>
          <ProForm.Group>
            {['供应商', '报价人', '手机号'].map((item) => (
              <ProFormText
                key={item}
                width="sm"
                name={item}
                label={item}
                placeholder={`请输入${item}`}
              />
            ))}
            <ProFormDatePicker
              label="日期"
              name="date"
              width="sm"
              placeholder="请选择时间"
              fieldProps={{
                showToday: false,
              }}
            />
          </ProForm.Group>
          <Divider style={{ marginTop: 10 }} />
          <ProForm.Group>
            {['采购商', '地址', '手机号'].map((item) => (
              <ProFormText
                key={item}
                width="sm"
                name={item}
                label={item}
                placeholder={`请输入${item}`}
              />
            ))}
          </ProForm.Group>
          <ProTable
            bordered
            value={data}
            search={false}
            options={false}
            recordCreatorProps={false}
            scroll={{
              y: '20vh',
            }}
            columns={[
              {
                title: '品牌',
                width: '15%',
                dataIndex: 'pp',
              },
              {
                title: '询价内容',
                dataIndex: 'xh',
              },
              {
                title: '单价(元)',
                width: '12%',
                align: 'center',
                dataIndex: 'yuan',
              },
              {
                title: '货期(天)',
                width: '12%',
                align: 'center',
                dataIndex: 'tian',
              },
            ]}
          />
        </>
      )}
    </ModalForm>
  );
};

export default CreateOffer;

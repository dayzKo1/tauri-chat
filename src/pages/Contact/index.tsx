import { Layout, Space } from 'antd';
import { styled } from 'umi';

import Detail from './Detail';
import List from './List';
import Search from './Search';

import { useState } from 'react';

const { Sider, Content } = Layout;

const LeftSider = styled(Sider)`
  min-width: 260px !important;
  width: 260px !important;
`;

const ContactPage = () => {
  const [selected, setSelected] = useState('');
  const [type, setType] = useState('');

  return (
    <Layout>
      <LeftSider style={{ background: '#FFFFFF' }}>
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Search setType={setType} setSelected={setSelected} />
          <List setType={setType} setSelected={setSelected} />
        </Space>
      </LeftSider>
      <Content style={{ background: '#F7F7F7' }}>
        {type && <Detail type={type} selected={selected} />}
      </Content>
    </Layout>
  );
};
export default ContactPage;

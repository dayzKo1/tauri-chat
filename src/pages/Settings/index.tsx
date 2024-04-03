import EnablingClause from '@/components/Setting/EnablingClause';
import Version from '@/components/Setting/Version';
import { Layout } from 'antd';
import { useState } from 'react';
import { history, styled } from 'umi';
const { Header, Sider, Content } = Layout;

const headerStyle = {
  textAlign: 'center',
  color: '#000000',
  height: 37,
  backgroundColor: '#f7f7f7',
  lineHeight: '37px',
  borderBottom: '1px solid #DDDDDD ',
};
const contentStyle = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#f7f7f7',
};

const siderStyle = {
  textAlign: 'center',
  height: 431,
  width: 162,
  color: '#333',
  backgroundColor: '#f7f7f7',
  borderRight: '1px solid #DDDDDD ',
};

const Box = styled.div`
  .sider {
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .item {
      font-size: 14px;
      width: 142px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      margin-bottom: 10px;
    }
    .active {
      background-color: #fff;
      color: #4e83fd;
    }
  }
`;
const Setting = () => {
  const [selected, setSelected] = useState(0);
  const handleClick = (index) => {
    setSelected(index);
  };

  return (
    <Box>
      <Layout>
        <Header style={headerStyle}>通用设置</Header>
        <Layout hasSider>
          <Sider style={siderStyle}>
            <div className="sider">
              <div
                key="1"
                className={selected === 0 ? 'item active' : 'item'}
                onClick={() => handleClick(0)}
              >
                授权条款
              </div>
              <div
                key="2"
                className={selected === 1 ? 'item active' : 'item'}
                onClick={() => handleClick(1)}
              >
                关于ckmro.chat
              </div>
              <div
                key="3"
                className={selected === 2 ? 'item active' : 'item'}
                onClick={() => {
                  handleClick(2);
                  history.replace('/changepwd');
                }}
              >
                修改密码
              </div>
            </div>
          </Sider>
          <Content style={contentStyle}>
            {selected === '0' ? <EnablingClause /> : <Version />}
          </Content>
        </Layout>
      </Layout>
    </Box>
  );
};
export default Setting;

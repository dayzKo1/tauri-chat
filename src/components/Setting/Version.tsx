import { styled } from '@umijs/max';
import { Collapse } from 'antd';
const { Panel } = Collapse;
const Box = styled.div`
  width: 391px;
  height: 431px;
  padding: 15px;
  display: flex;
  .smallBox {
    width: 360px;
  }
`;
const Version = () => {
  const list = [
    { verNum: '版本1.0.2', content: '123457487' },
    { verNum: '版本1.0.1', content: '123457487' },
    { verNum: '版本1.0.0', content: '123457487' },
  ];
  return (
    <Box>
      <div className="smallBox">
        <Collapse
          defaultActiveKey={['0']}
          ghost
          style={{ backgroundColor: '#ffffff' }}
        >
          {list.map((item, index) => {
            return (
              <Panel header={item.verNum} key={index}>
                <p>{item.content}</p>
              </Panel>
            );
          })}
        </Collapse>
      </div>
    </Box>
  );
};

export default Version;

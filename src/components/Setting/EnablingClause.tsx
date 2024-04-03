import { styled } from '@umijs/max';
const Box = styled.div`
  width: 390px;
  height: 431px;
  padding: 15px;
  // display: flex;
  .smallBox {
    width: 360px;
    height: 401px;
    border-radius: 8px;
    background-color: #ffffff;
    textalign: 'center' // .item {
      //   width: 361px;
      //   height: 46px;
      //   color: #333333;
      //   display: flex;
      //   justify-content: space-between;
      //   align-items: center;
      //   padding-left: 15px;
      //   padding-right: 15px;
      //   font-weight: 400;
      //   font-size: 14px;
      // }
      .title {
      color: #333333;
    }
    .content {
      width: 330px;
      color: #333333;
    }
  }
`;

const EnablingClause = () => {
  // const list = [
  //   { title: '通知时显示消息详情', isOpen: false },
  //   { title: '消息通知横幅', isOpen: false },
  //   { title: '消息提示音', isOpen: false },
  //   { title: '振动', isOpen: false },
  // ];
  // const onChange = (checked: boolean) => {
  //   console.log(`switch to ${checked}`);
  // };
  return (
    <Box>
      <div className="smallBox">
        {/* {list.map((item, index) => {
          return (
            <div className="item" key={index}>
              <span>{item.title}</span>
              <Switch defaultChecked onChange={onChange} />
            </div>
          );
        })} */}
        <p className="title">授权条款</p>
        <p className="content">
          授权条款,授权条款,授权条款,授权条款,授权条款,授权条款授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款授权条款,授权条款,授权条款,
          授权条款,授权条款,授权条款,授权条款,授权条款,授权条款授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款授权条款,授权条款,授权条款,
          授权条款,授权条款,授权条款,授权条款,授权条款,授权条款授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款授权条款,授权条款,授权条款,
          授权条款,授权条款,授权条款,授权条款,授权条款,授权条款授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款,授权条款授权条款,授权条款,授权条款
        </p>
      </div>
    </Box>
  );
};

export default EnablingClause;

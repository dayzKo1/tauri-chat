import { Space } from "antd";
import { styled, useAccess, useModel } from "umi";

import EmojiPicker from "./EmojiPicker";
import FileUpload from "./FileUpload";
// import Inquiry from "./Inquiry";
// import Offer from "./Offer";
// import Scissor from './Scissor';
// const n: any = {
//   0: "2",
//   1: "1",
//   6: "0",
// };

const BarWarp = styled(Space)`
  .ant-space-item:hover {
    background: #e4e7ea;
  }
  .ant-divider {
    height: 16px;
    margin: 0;
  }
  span {
    cursor: pointer;
    font-size: 20px;
  }
  z-index: 2;
  padding: 12px 16px;
  position: absolute;
  border-top: 1px solid #efefef;
  width: calc(100vw - 333px - ${({ sider }: any) => (sider ? "30vw" : "0px")});
`;

const ToolBar = ({ focus, current, setValue }: any) => {
  const { sider } = useModel("global");
  const { authority }: any = useAccess();
  return (
    <BarWarp right={authority} sider={sider} size={20}>
      <EmojiPicker setValue={setValue} focus={focus} />
      {/* <Scissor /> */}
      <FileUpload rid={current.roomId} />
      {/* {[0, 1].includes(authority) && <Inquiry />}
      {[0].includes(authority) && <Offer />} */}
    </BarWarp>
  );
};

export default ToolBar;

import { ScissorOutlined } from '@ant-design/icons';
import ScreenShot from 'js-web-screen-shot';

const Scissor = ({}) => {
  const doScreenShot = async () => {
    new ScreenShot({});
  };
  return <ScissorOutlined onClick={() => doScreenShot()} />;
};

export default Scissor;

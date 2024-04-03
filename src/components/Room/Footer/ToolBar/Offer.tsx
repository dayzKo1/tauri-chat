import { FileTextOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const Offer = ({}) => {
  const { setSider } = useModel('global');
  return (
    <div
      onClick={() => {
        setSider((f) =>
          f && f === 'Offer' ? setSider('') : setSider('Offer'),
        );
      }}
    >
      <FileTextOutlined />
      报价
    </div>
  );
};

export default Offer;

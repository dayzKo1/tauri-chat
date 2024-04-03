import { createWin } from '@/utils';
import { EditOutlined } from '@ant-design/icons';

const Edit = ({}) => {
  return (
    <EditOutlined
      onClick={() =>
        createWin({
          title: '编辑询价',
          label: 'inquiry',
          url: '/inquiry',
          width: 1200,
          height: 700,
        })
      }
    />
  );
};

export default Edit;

import { SmileOutlined } from '@ant-design/icons';
import { Col, Popover, Row } from 'antd';
import { useState } from 'react';
import { styled } from 'umi';

const emojis = [
  '😀',
  '😁',
  '😂',
  '😃',
  '😄',
  '😅',
  '😆',
  '😇',
  '😈',
  '😉',
  '😊',
  '😋',
  '😌',
  '😍',
  '😎',
  '😏',
  '😐',
  '😑',
  '😒',
  '😓',
  '😔',
  '😕',
  '😖',
  '😗',
  '😘',
  '😙',
  '😚',
  '😛',
  '😜',
  '😝',
  '😞',
  '😟',
  '😠',
  '😡',
  '😢',
  '😣',
  '😤',
  '😥',
  '😦',
  '😧',
  '😨',
  '😩',
  '😪',
  '😫',
  '😬',
  '😭',
  '😮',
  '😯',
  '😰',
  '😱',
  '😲',
  '😳',
  '😴',
  '😵',
  '😶',
  '😷',
  '🙁',
  '🙂',
  '🙃',
  '🙄',
];

const List = styled(Row)`
  :hover {
    background: #e4e7ea;
  }
  width: 300px;
  height: 160px;
  overflow-y: scroll;
  overflow-x: hidden;
`;

const Item = styled(Col)`
  height: 26px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
`;

const EmojiPicker = ({ setValue, focus }) => {
  const [open, setOpen] = useState(false);
  const Emojis = (
    <List>
      {emojis.map((item, index) => (
        <Item
          key={index}
          span={2}
          onClick={() => {
            setOpen(false);
            setValue((f) => `${f}${item}`);
            focus();
          }}
        >
          {item}
        </Item>
      ))}
    </List>
  );

  return (
    <Popover
      arrow={false}
      content={Emojis}
      open={open}
      onOpenChange={() => setOpen((f) => !f)}
    >
      <SmileOutlined />
    </Popover>
  );
};

export default EmojiPicker;

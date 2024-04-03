import { Mentions } from "antd";
import { useEffect, useRef, useState } from "react";
import { getDvaApp, styled } from "umi";
import ToolBar from "./ToolBar";

const { dispatch } = getDvaApp()._store;

const Input = styled(Mentions)`
  font-size: 16px;
  padding-top: 28px;
  background: #f7f7f7;
`;

const RoomFooter = ({ current, scrollToBottom }: any) => {
  const [value, setValue] = useState("");
  const [prefix, setPrefix] = useState("@");
  const ref: any = useRef(null);

  const send = () => {
    if (value.trim()) {
      dispatch({
        type: "room/sendMessage",
        payload: {
          msg: value,
          rid: current.roomId,
        },
      });
      setValue("");
      scrollToBottom();
    }
  };

  const DATA: any = {
    "@": ["all", "here", "wulf", "linhh"],
    "/": ["all", "here", "wulf", "linhh"],
  };

  const onSearch = (_: string, newPrefix: string) => {
    setPrefix(newPrefix);
  };

  const focus = () => {
    ref.current.focus();
  };

  useEffect(() => {
    focus();
  });

  return (
    <div>
      <ToolBar focus={focus} current={current} setValue={setValue} />
      <Input
        ref={ref}
        prefix={["@", "/"]}
        rows={6}
        options={(DATA[prefix] || []).map((value: any) => ({
          value,
          key: value,
          label: value,
        }))}
        value={value}
        onChange={(text: any) => {
          setValue(text);
        }}
        onSearch={onSearch}
        onPressEnter={(e: any) => {
          e.preventDefault();
          if (e.ctrlKey) {
            const start = e.target.selectionStart;
            setValue((f) => `${f.slice(0, start)}\n${f.slice(start)}`);
            return;
          }
          send();
        }}
      />
    </div>
  );
};

export default RoomFooter;

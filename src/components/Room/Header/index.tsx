import { parseFile } from "@/services";
import { createWin } from "@/utils";
import {
  EllipsisOutlined,
  FileOutlined,
  PushpinOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Button, Modal, Space, Tooltip, Upload, message } from "antd";
import { useRef } from "react";
import { getDvaApp, styled, useModel } from "umi";
import SaleMenu from "./SaleMenu";
import TransactionMenu from "./TransactionMenu";

const { dispatch } = getDvaApp()._store;

const Bar = styled(Space)`
  span:hover {
    background: #e4e7ea;
  }
  font-size: 20px;
`;

const RoomHeader = ({ current }: any) => {
  const { setDrawer } = useModel("global");
  const { activeIndex, setActiveIndex } = useModel("global");
  const { rcUserId } = current;

  const [messageApi, contextHolder] = message.useMessage();

  const success = () => {
    messageApi.open({
      type: "loading",
      content: "识别中，请稍等！",
      duration: 0,
    });
  };

  const { runAsync } = useRequest(parseFile, {
    manual: true,
    onError: () => {
      messageApi.destroy();
      message.error("导入失败,请检查文件模板或格式。");
    },
    onSuccess: (res) => {
      setActiveIndex(-1);
      messageApi.destroy();
      createWin({
        title: "编辑询价",
        label: "编辑询价",
        width: 1200,
        height: 800,
        url: `/workstand/InquiryEdit?fileData=${JSON.stringify(res.data)}`,
      });
    },
  });

  const type: any = useRef(null);
  const base64: any = useRef(null);
  const base64ToBlob = (url: any) => {
    const arr = url.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    type.current = mime;
    return new Blob([u8arr], { type: mime });
  };

  return (
    <Space
      style={{
        display: "flex",
        justifyContent: "space-between",
        color: "#333",
        fontSize: 15,
        fontWeight: "600",
      }}
    >
      {current.roomName}
      {contextHolder}
      <Bar size={20}>
        <Tooltip title={"文件询价"}>
          <FileOutlined
            style={activeIndex === 0 ? { color: "#4E83FD" } : { color: "#333" }}
            onClick={() => {
              setActiveIndex(0);
              Modal.confirm({
                title: "选择询价文件",
                width: 400,
                centered: true,
                mask: true,
                icon: null,
                content: (
                  <Upload
                    beforeUpload={(file) => {
                      type.current = file.type;
                      let reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = (e) => {
                        base64.current = e.target?.result;
                      };
                    }}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>点击上传</Button>
                  </Upload>
                ),
                onOk: () => {
                  if (type.current) {
                    success();
                    runAsync({
                      type: type.current,
                      data: base64ToBlob(base64.current),
                    });
                    type.current = null;
                  } else {
                    message.error("请先选择文件");
                  }
                },
                okText: "确认",
                cancelText: "取消",
              });
            }}
          />
        </Tooltip>
        <Tooltip title={"固定消息"}>
          <PushpinOutlined
            style={activeIndex === 1 ? { color: "#4E83FD" } : { color: "#333" }}
            onClick={() => {
              setActiveIndex(1);
              setDrawer("pins");
              dispatch({ type: "room/getPins" });
            }}
          />
        </Tooltip>
        <Tooltip title={"搜索"}>
          <SearchOutlined
            style={activeIndex === 2 ? { color: "#4E83FD" } : { color: "#333" }}
            onClick={() => {
              setActiveIndex(2);
              setDrawer("search");
            }}
          />
        </Tooltip>
        <TransactionMenu
          rcUserId={rcUserId}
          setActiveIndex={setActiveIndex}
          setDrawer={setDrawer}
          activeIndex={activeIndex}
        />
        <SaleMenu
          setActiveIndex={setActiveIndex}
          setDrawer={setDrawer}
          activeIndex={activeIndex}
          rcUserId={rcUserId}
        />
        <Tooltip title={"更多"}>
          <EllipsisOutlined
            style={activeIndex === 5 ? { color: "#4E83FD" } : { color: "#333" }}
            onClick={() => {
              setActiveIndex(5);
              if (current.type === "direct") {
                setDrawer("info");
                dispatch({
                  type: "room/getUserInfo",
                  payload: {
                    userId: current.uid,
                  },
                });
              }
              if (current.type === "group") {
                setDrawer("group");
                dispatch({
                  type: "room/getGroupInfo",
                });
                dispatch({
                  type: "room/getGroupMember",
                });
              }
            }}
          />
        </Tooltip>
      </Bar>
    </Space>
  );
};

export default RoomHeader;

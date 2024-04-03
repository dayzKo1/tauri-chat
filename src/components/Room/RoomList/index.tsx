import Avatar from "@/components/Avatar";
import { formatRoomDate, getTime } from "@/utils";
import { Avatar as A, Badge, Dropdown, Space } from "antd";
import { useEffect, useState } from "react";
import { getDvaApp, styled, useModel } from "umi";

import systemIcon from "@/assets/common/SystemMessage.png";

const { dispatch } = getDvaApp()._store;

const Card = styled.div`
  border-radius: 0;
  cursor: pointer;
  height: 60px;
  width: 260px;
  background: ${({ current, hover }: any) =>
    current ? "#efefef" : hover ? "#f7f7f7" : "#FFFFFF"};
  color: ${({ alert }: any) => (alert ? "purple" : "black")};
`;

const List = styled.div`
  // height: calc(100vh - 64px - 40px);
  height: calc(100vh - 64px);
  overflow-y: scroll;
`;

const Flex = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
`;

const Text = styled.div`
  width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MsgCard = ({ current, hover, setHover, item, setDrawer }: any) => {
  const roomName =
    item?.fname || item?.usernames?.filter((item: any) => item !== "linhh");
  const roomId = item?.rid;
  const uid = item?.rid.replace(item?.u?._id, "");
  const rcUserId = item?.rid.replace(item?.u?._id, "");

  const types: any = {
    p: "group",
    d: "direct",
  };
  const type = types[item.t];
  const items = [
    {
      key: "close",
      label: (
        <div
          onClick={() => {
            dispatch({
              type: "room/closeRoom",
              payload: { type, roomId },
            });
          }}
        >
          隐藏
        </div>
      ),
    },
  ];
  const lastMsg =
    item?.lastMessage?.file?.type?.split("/")[0] === "audio"
      ? "[语音]"
      : item?.lastMessage?.file?.type?.split("/")[0] === "image"
      ? "[图片]"
      : item?.lastMessage?.msg || item?.lastMessage?.file?.name;
  const lastTime = formatRoomDate(getTime(item));
  return (
    <Card
      alert={item.alert}
      hover={roomId === hover}
      onMouseLeave={() => setHover("")}
      current={roomId === current.roomId}
      onMouseOver={() => setHover(roomId)}
      onClick={() => {
        setDrawer("");
        if (item.unread !== 0 || item.alert) {
          dispatch({
            type: "room/readRoom",
            payload: roomId,
          });
        }
        if (roomId !== current.roomId) {
          dispatch({
            type: "room/subscribeRoom",
            payload: { type, roomId, roomName, uid, rcUserId },
          });
        }
      }}
    >
      <Dropdown
        menu={{ items }}
        placement="bottomLeft"
        arrow={false}
        trigger={["contextMenu"]}
      >
        <Flex>
          <Space>
            {item.name === "CKMRO.Bot" ? (
              <A
                src={systemIcon}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 45,
                }}
              />
            ) : (
              <Avatar
                pure
                size={36}
                shape="square"
                style={{ borderRadius: 45 }}
                userId={type === "direct" ? uid : roomId}
              />
            )}
            <Space direction="vertical" size={8}>
              <Text style={{ fontWeight: "500", fontSize: 14, color: "#000" }}>
                {item.name === "CKMRO.Bot" ? "系统消息" : roomName}
              </Text>
              <Text style={{ color: "#999", fontSize: 12 }}>
                {lastMsg
                  ? `${
                      type === "group" ? `${item.lastMessage.u.name}: ` : ""
                    }${lastMsg}`
                  : "还没有消息"}
              </Text>
            </Space>
          </Space>
          <Space direction="vertical" style={{ textAlign: "end" }}>
            <div style={{ wordBreak: "keep-all", color: "#999", fontSize: 11 }}>
              {lastTime}
            </div>
            <Space>
              {item.unread !== 0 && <Badge count={item.unread} color="blue" />}
            </Space>
          </Space>
        </Flex>
      </Dropdown>
    </Card>
  );
};

const MessageList = ({ rooms, current }: any) => {
  const [hover, setHover] = useState("0");
  const { setDrawer, setScroll } = useModel("global");

  useEffect(() => {
    setScroll(true);
  }, [current.roomId]);

  return (
    <List>
      {rooms
        ?.filter((item: any) => item.open && item.t !== "c")
        ?.sort((a: any, b: any) =>
          new Date(getTime(a)).toISOString() >
          new Date(getTime(b)).toISOString()
            ? -1
            : 1,
        )
        ?.map((item: any) => {
          return (
            <MsgCard
              key={item._id}
              item={item}
              hover={hover ? hover : undefined}
              current={current}
              setHover={setHover}
              setDrawer={setDrawer}
            />
          );
        })}
    </List>
  );
};

export default MessageList;

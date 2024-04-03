import Drawer from "@/components/Drawer";
import RoomContent from "@/components/Room/Content";
import RoomFooter from "@/components/Room/Footer";
import RoomHeader from "@/components/Room/Header";
import Right from "@/components/Room/Right";
import MessageList from "@/components/Room/RoomList";
import Search from "@/components/Room/Search";
import { start } from "@/methods";
import { Layout, Space } from "antd";
import { useEffect, useRef } from "react";
import { connect, getDvaApp, styled, useModel } from "umi";

const { dispatch } = getDvaApp()._store;
const { Header, Sider, Content } = Layout;

const LeftSider = styled(Sider)`
  min-width: 260px !important;
  width: 260px !important;
`;

const RightSider = styled(Sider)`
  min-width: 30vw !important;
  width: 30vw !important;
`;

const Room = ({ room, rooms, current, historyLoading, hasMore }: any) => {
  const ref: any = useRef(null);
  const { sider } = useModel("global");

  const init = async () => {
    await start();
    if (localStorage.getItem("jump-to-room")) {
      const target = localStorage.getItem("jump-to-room")?.split("-") ?? [];
      const [type, name, jump, id, nickName] = target;
      if (jump === "yes") {
        if (type === "user") {
          dispatch({
            type: "room/goToRoom",
            payload: {
              username: name,
              nickName: nickName,
            },
          });
          localStorage.setItem("jump-to-room", `${type}-${name}-no`);
        } else {
          dispatch({
            type: "room/subscribeRoom",
            payload: {
              type: "group",
              roomId: id,
              roomName: name,
            },
          });
          dispatch({
            type: "room/openRoom",
            payload: {
              type: "group",
              roomId: id,
            },
          });
          localStorage.setItem("jump-to-room", `${type}-${name}-no-${id}`);
        }
      }
    }
  };

  useEffect(() => {
    init();
  }, []);

  const scrollToBottom = () => {
    ref.current.scrollTop = ref.current.scrollHeight;
  };

  return (
    <Layout>
      {/* Sider */}
      <LeftSider style={{ background: "#FFFFFF" }}>
        <Space direction="vertical" size={0}>
          <Search />
          <MessageList rooms={rooms} current={current} />
        </Space>
      </LeftSider>
      {/* Room */}
      {current.roomName === "CKMRO.Bot" ? (
        <Layout>
          <Header
            style={{
              background: "#F7F7F7",
              color: "#333",
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            系统消息
          </Header>
          <RoomContent
            isSys
            ref={ref}
            room={room}
            rooms={rooms}
            hasMore={hasMore}
            current={current}
            historyLoading={historyLoading}
            scrollToBottom={scrollToBottom}
          />
        </Layout>
      ) : (
        <Layout
          style={{
            borderLeft: "1px solid #efefef",
            marginLeft: 1,
            display: current.roomId ? "block" : "none",
          }}
        >
          <Header style={{ background: "#F7F7F7" }}>
            <RoomHeader current={current} />
          </Header>
          <Layout>
            <Content style={{ background: "#F7F7F7" }}>
              <RoomContent
                ref={ref}
                room={room}
                rooms={rooms}
                hasMore={hasMore}
                current={current}
                historyLoading={historyLoading}
                scrollToBottom={scrollToBottom}
              />
              <RoomFooter current={current} scrollToBottom={scrollToBottom} />
            </Content>
            <RightSider
              style={{
                display: sider ? "block" : "none",
                background: "#F7F7F7",
                borderLeft: "1px solid #efefef",
              }}
            >
              <Right current={current} />
            </RightSider>
            <Drawer />
          </Layout>
        </Layout>
      )}
    </Layout>
  );
};

export default connect(({ room, loading }: any) => {
  return {
    room: room.room,
    rooms: room.rooms,
    hasMore: room.hasMore,
    current: room.current,
    historyLoading: loading.effects["room/loadHistory"],
  };
})(Room);

import Message from "@/components/Message";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { forwardRef, useEffect } from "react";
import { getDvaApp, styled, useModel } from "umi";

const { dispatch } = getDvaApp()._store;

const List = styled.div`
  height: ${({ isSys }: any) =>
    // isSys ? 'calc(100vh - 67px - 40px)' : 'calc(100vh - 67px - 185px - 40px)'};
    isSys ? "calc(100vh - 67px )" : "calc(100vh - 67px - 185px )"};
  overflow-y: scroll;
`;

const NewMsg = styled.div`
  position: sticky;
  text-align: center;
  bottom: 5px;
  color: blue;
  cursor: pointer;
  background: white;
  padding: 10px;
  border-radius: 16px;
  width: 15%;
  margin: 0 auto;
  background: #1d74f5;
  color: white;
`;

const RoomContent = forwardRef(
  (
    {
      room,
      rooms,
      current,
      hasMore,
      scrollToBottom,
      historyLoading,
      isSys,
    }: any,
    ref: any,
  ) => {
    const { setScroll, scroll } = useModel("global");
    useEffect(() => {
      if (room.length > 0 && scroll) {
        scrollToBottom();
        setScroll(false);
      }
      if (
        ref?.current?.scrollHeight -
          ref?.current?.scrollTop -
          ref?.current?.clientHeight <
        100
      ) {
        scrollToBottom();
      }
    }, [room]);

    // 系统消息
    if (isSys) {
      return (
        <List
          isSys
          ref={ref}
          onScroll={(e: any) => {
            if (hasMore && e.target.scrollTop === 0) {
              dispatch({
                type: "room/loadHistory",
              });
            }
          }}
        >
          {room
            ?.sort((a: any, b: any) => (a.ts < b.ts ? -1 : 1))
            ?.map((item: any) => (
              <Message kind="sys" item={item} key={item._id} />
            ))}
        </List>
      );
    }
    return (
      <List
        ref={ref}
        onScroll={(e: any) => {
          if (hasMore && e.target.scrollTop === 0) {
            dispatch({
              type: "room/loadHistory",
            });
          }
        }}
      >
        <div style={{ textAlign: "center" }}>
          {historyLoading ? (
            <Spin indicator={<LoadingOutlined />} />
          ) : hasMore ? (
            <div
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => {
                dispatch({
                  type: "room/loadHistory",
                });
              }}
            >
              查看更多消息
            </div>
          ) : (
            ""
          )}
        </div>
        {room
          ?.sort((a: any, b: any) => (a.ts < b.ts ? -1 : 1))
          ?.map((item: any) => (
            <Message item={item} key={item._id} />
          ))}
        {rooms?.filter((item: any) => item.rid === current.roomId)?.[0]
          ?.alert &&
          ref?.current?.clientHeight + ref?.current?.scrollTop !==
            ref?.current?.scrollHeight && (
            <NewMsg
              onClick={() => {
                scrollToBottom();
                dispatch({
                  type: "room/readRoom",
                  payload: current.roomId,
                });
              }}
            >
              新消息
            </NewMsg>
          )}
      </List>
    );
  },
);

export default RoomContent;

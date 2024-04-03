import {
  DownOutlined,
  FolderOpenOutlined,
  PushpinOutlined,
  RightOutlined,
  SearchOutlined,
  SnippetsOutlined,
  TeamOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Collapse, Divider, Drawer, Input, Space } from "antd";
import { useState } from "react";
import { connect, getDvaApp, styled, useModel } from "umi";

import Avatar from "@/components/Avatar";
import Message from "@/components/Message";

const { dispatch } = getDvaApp()._store;

const More = styled(Drawer)`
  .ant-divider {
    margin: 24px 0 0;
  }
  .ant-drawer-close {
    order: 1;
  }
`;

const HeaderDrawer = ({
  pins,
  searchRes,
  userInfo,
  groupInfo,
  groupMember,
  files,
}: any) => {
  const { drawer, setDrawer }: any = useModel("global");
  const { setActiveIndex } = useModel("global");
  const [all, setAll] = useState(false);
  const [keyword, setKeyword] = useState("");

  const drawers: any = {
    search: (
      <>
        <SearchOutlined />
        搜索
      </>
    ),
    pins: (
      <>
        <PushpinOutlined />
        固定信息
      </>
    ),
    text: (
      <>
        <SnippetsOutlined />
        创建 / 编辑询价
      </>
    ),
    file: (
      <>
        <FolderOpenOutlined />
        文件
      </>
    ),
    info: (
      <>
        <UserOutlined />
        用户信息
      </>
    ),
    group: (
      <>
        <TeamOutlined />
        群组信息
      </>
    ),
  };

  const newFiles = files.map((item: any) => {
    item.subList = item.subList.filter((item: any) => {
      return keyword === "图片"
        ? item.type.split("/")[0] === "image"
        : item.type.split("/")[0] !== "image";
    });
    return item;
  });

  const fileItems: any = newFiles
    .filter((item: any) => item.subList.length > 0)
    .map((item: any, index: number) => ({
      key: index,
      label: item.uploadedAt,
      children: item.subList.map((item: any) => (
        <Message kind="file" item={item} key={item._id} />
      )),
    }));
  const contents: any = {
    search: (
      <div>
        <Input.Search
          placeholder="搜索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={(e) => {
            if (e) {
              dispatch({
                type: "room/searchMessage",
                payload: { searchText: e },
              });
            }
          }}
          style={{ padding: "30px 20px 0" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Button
            type="link"
            onClick={() => {
              setKeyword("图片");
              dispatch({
                type: "room/searchMessage",
                payload: { searchText: "-" },
              });
              dispatch({
                type: "room/getFiles",
                payload: {},
              });
            }}
          >
            图片
          </Button>
          <Button
            type="link"
            onClick={() => {
              setKeyword("文件");
              dispatch({
                type: "room/searchMessage",
                payload: { searchText: "-" },
              });
              dispatch({
                type: "room/getFiles",
                payload: {},
              });
            }}
          >
            文件
          </Button>
        </div>
        {searchRes.length > 0 ? (
          searchRes?.map((item: any) => (
            <>
              <Message kind="search" item={item} key={item._id} />
              <Divider style={{ margin: 0 }} />
            </>
          ))
        ) : (
          <Collapse
            items={fileItems}
            bordered={false}
            defaultActiveKey={["0"]}
          />
        )}
      </div>
    ),
    pins: pins?.map((item: any) => (
      <>
        <Message kind="pin" item={item} key={item._id} />
        <Divider style={{ margin: 0 }} />
      </>
    )),
    info: (
      <div style={{ padding: "10px 15px" }}>
        <Space>
          <Avatar
            url={`${RC_URL}/avatar/${userInfo.username}`}
            userId={userInfo._id}
            size={48}
          />
          <Space direction="vertical">
            <div style={{ fontWeight: 600 }}>{userInfo.name}</div>
            <div>用户</div>
          </Space>
        </Space>
        <div>
          <Divider />
          <div
            onClick={() => setDrawer("search")}
            style={{
              margin: "10px 0 -10px",
              display: "flex",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            查找聊天记录
            <RightOutlined />
          </div>
          <Divider />
        </div>
      </div>
    ),
    group: (
      <div style={{ padding: "20px 15px" }}>
        <Space direction="vertical">
          <div
            style={
              all || groupMember.length <= 8
                ? {}
                : { height: 130, overflow: "hidden" }
            }
          >
            {groupMember.map((item: any) => (
              <Space
                key={item._id}
                direction="vertical"
                style={{
                  width: 69,
                  paddingBottom: 10,
                  textAlign: "center",
                }}
              >
                <Avatar
                  url={`${RC_URL}/avatar/${item.username}`}
                  userId={item._id}
                />
                {item.name}
              </Space>
            ))}
          </div>
          {groupMember.length > 8 && (
            <div
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => setAll((f) => !f)}
            >
              展开全部 {all ? <UpOutlined /> : <DownOutlined />}
            </div>
          )}
        </Space>
        <div>
          <Divider />
          <div
            style={{
              margin: "10px 0 -10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>群聊名称</div>
            <div
              style={{
                maxWidth: 100,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={groupInfo.name}
            >
              {groupInfo.name}
            </div>
          </div>
        </div>
        <div>
          <Divider />
          <div
            onClick={() => setDrawer("search")}
            style={{
              margin: "10px 0 -10px",
              display: "flex",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            查找聊天记录
            <RightOutlined />
          </div>
          <Divider />
        </div>
      </div>
    ),
  };

  return (
    <More
      open={drawer}
      title={<Space>{drawers[drawer]}</Space>}
      placement="right"
      onClose={() => {
        setDrawer("");
        setActiveIndex(-1);
      }}
      bodyStyle={{ padding: 0 }}
      rootStyle={{ marginTop: 64 }}
      contentWrapperStyle={{ width: "30vw" }}
      maskStyle={{ background: "transparent" }}
    >
      {contents[drawer]}
    </More>
  );
};

export default connect(({ room }: any) => {
  return {
    pins: room.pins,
    files: room.files,
    userInfo: room.userInfo,
    searchRes: room.searchRes,
    groupInfo: room.groupInfo,
    groupMember: room.groupMember,
  };
})(HeaderDrawer);

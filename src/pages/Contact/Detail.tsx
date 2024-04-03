import message from "@/assets/common/message.png";
import Avatar from "@/components/Avatar";
import { createWin } from "@/utils";
import { DownOutlined, RightOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Card, Space } from "antd";
import { useState } from "react";
import { history, styled } from "umi";

const Content = styled.div`
  padding: 0 40px;
  .ant-card {
    border-radius: 0;
  }
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 40px 10px 20px;
`;

const Info = styled.p`
  color: #999999;
`;

const Detail = ({ type, selected: info }: any) => {
  console.log("aaaaaaaaaa", info);

  const [all, setAll] = useState(false);
  const types: any = {
    CUSTOMER: "用户",
    SELLER: "业务员",
    BUYER: "采购员",
  };

  if (type === "user") {
    return (
      <Content>
        <Title>
          <Space>
            <Avatar size={60} userId={info?.contactRcUserId} />
            <div style={{ fontSize: 16, fontWeight: "500" }}>
              {info?.nickName}({types[info?.role]})
            </div>
          </Space>
          <Button
            type="primary"
            onClick={() => {
              localStorage.setItem(
                "jump-to-room",
                `user-${info?.userName}-yes-${null}-${info?.nickName}`,
              );
              history.push("/room");
            }}
          >
            <img src={message} style={{ width: 18 }} />
          </Button>
        </Title>
        <Card bordered={false} style={{ borderRadius: 10 }}>
          <p style={{ color: "#999" }}>性别</p>
          <Info style={{ color: "#333" }}>{info?.gender ? "男" : "女"}</Info>
          <p style={{ color: "#999" }}>手机号</p>
          <Info style={{ color: "#333" }}>{info?.userName || "-"}</Info>
          <p style={{ color: "#999" }}>邮箱</p>
          <Info style={{ color: "#333" }}>{info?.email || "-"}</Info>
          <p style={{ color: "#999" }}>企业全称</p>
          <Info style={{ color: "#333" }}>{info?.companyName || "-"}</Info>
        </Card>
        <Card
          style={{
            marginTop: 20,
            borderRadius: 10,
          }}
          bordered={false}
        >
          <p style={{ color: "#999" }}>标签</p>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <div>
              {info.tagList.map((item: any, index: number) => {
                return (
                  <text style={{ fontSize: "#333" }} key={index}>
                    {item.name}
                    {index !== info.tagList.length - 1 && "、"}
                  </text>
                );
              })}
            </div>
            <RightOutlined
              onClick={() => {
                createWin({
                  title: "设置标签",
                  label: "updateTags",
                  width: 550,
                  height: 368,
                  center: true,
                  url: "/contact/updateTags",
                  resizable: false,
                });
              }}
              style={{ color: "#999", fontSize: 10 }}
            />
          </Space>
        </Card>
      </Content>
    );
  }
  return (
    <Content>
      <Title>
        <Space>
          <Avatar
            userId={info?.contactRcUserId}
            pure
            type={"group"}
            style={{ backgroundColor: "#4E83FD" }}
          />
          <Space direction="vertical">
            <div style={{ fontSize: 16, fontWeight: 500 }}>{info?.fname}</div>
            <div style={{ color: "grey" }}>共{info?.memberList?.length}人</div>
          </Space>
        </Space>
        <Button
          type="primary"
          onClick={() => {
            localStorage.setItem(
              "jump-to-room",
              `group-${info?.name}-yes-${info?.id}`,
            );
            history.push("/room");
          }}
        >
          <img src={message} style={{ width: 18 }} />
        </Button>
      </Title>
      <Card bordered={false}>
        <div style={{ color: "grey" }}>
          群成员({info?.memberList?.length}人)
        </div>
        <Space direction="vertical" style={{ paddingTop: 15 }}>
          <div
            style={
              all || info?.memberList?.length <= 30
                ? {}
                : { height: 210, overflow: "hidden" }
            }
          >
            {info?.memberList?.map((item: any) => (
              <Space
                key={item?._id}
                direction="vertical"
                style={{
                  width: 60,
                  paddingBottom: 10,
                  textAlign: "center",
                }}
              >
                <Avatar userId={item?.id} />
                {item?.nickname || "-"}
              </Space>
            ))}
          </div>
          {info?.memberList?.length > 30 && (
            <div
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => setAll((f) => !f)}
            >
              展开全部 {all ? <UpOutlined /> : <DownOutlined />}
            </div>
          )}
        </Space>
      </Card>
    </Content>
  );
};

export default Detail;

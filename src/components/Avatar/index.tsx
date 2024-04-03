import allGroupMembers from "@/assets/common/AllGroupMembers.png";
import defaultAvatar from "@/assets/common/default_customer.png";
import { getUserInfo } from "@/services";
import { random } from "@/utils";
import { useLazyQuery } from "@apollo/client";
import { Avatar as A, Button, Divider, Popover, Space } from "antd";
import { useState } from "react";
import { getDvaApp, styled } from "umi";

import message from "@/assets/common/message.png";

const { dispatch } = getDvaApp()._store;

const Ava = styled(A)`
  min-width: 33px;
`;

const InfoCard = styled.div`
  padding: 16px;
  width: 250px;
  cursor: pointer;
  .ant-divider {
    margin: 10px 0;
  }
  .ant-space-item {
    width: 100px;
    margin: 8px 0;
  }
`;

const Text = styled.div`
  text-align: right;
`;

const Avatar = ({
  pure,
  size,
  style,
  shape,
  userId,
  onClick,
  mention,
  placement = "rightTop",
  trigger = ["click"],
  type = "user",
}: any) => {
  const [hasAvatar, setHasAvatar] = useState<boolean>(true);
  const [getInfo, { data }] = useLazyQuery(getUserInfo);
  const src = `${OSS_URL}/ckmro/apps/avatar/${userId}`;
  const userInfo = data?.users?.getRcUser;
  if (pure) {
    return (
      <Ava
        size={size}
        shape={shape}
        onClick={onClick}
        style={{ ...style }}
        src={
          hasAvatar && type === "user"
            ? src
            : type !== "user"
            ? allGroupMembers
            : defaultAvatar
        }
        onError={(): any => {
          setHasAvatar(false);
        }}
      />
    );
  }
  return (
    <Popover
      arrow={false}
      trigger={trigger}
      placement={placement}
      onOpenChange={(open) => {
        if (open) {
          getInfo({
            variables: { rcUserId: userId },
          });
        }
      }}
      content={
        <InfoCard>
          <div style={{ fontWeight: "500", fontSize: 16, color: "#000" }}>
            <Ava
              size={size}
              shape={shape}
              style={{ ...style, marginRight: 10 }}
              onClick={onClick}
              src={
                hasAvatar
                  ? `${OSS_URL}/ckmro/apps/avatar/${
                      userInfo?.rcUserId
                    }?t=${random(5)}`
                  : defaultAvatar
              }
              onError={(): any => {
                setHasAvatar(false);
              }}
            />
            {userInfo?.nickName || userInfo?.userName}
          </div>
          <Divider />
          <Space style={{ color: "#999" }}>
            性别
            <Text style={{ color: "#333" }}>
              {userInfo?.gender ? "男" : "女"}
            </Text>
          </Space>
          <Space style={{ color: "#999" }}>
            手机号
            <Text style={{ color: "#333" }}>{userInfo?.userName}</Text>
          </Space>
          <Space style={{ color: "#999" }}>
            邮箱
            <Text style={{ color: "#333" }}>{userInfo?.email || "-"}</Text>
          </Space>
          <Space style={{ color: "#999" }}>
            企业名称
            <Text style={{ color: "#333" }}>
              {userInfo?.companyName || "-"}
            </Text>
          </Space>
          <Divider />
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="primary"
              onClick={() =>
                dispatch({
                  type: "room/goToRoom",
                  payload: {
                    username: userInfo?.userName,
                    nickName: userInfo?.nickName,
                  },
                })
              }
            >
              <img src={message} style={{ width: 18 }} />
            </Button>
          </div>
        </InfoCard>
      }
    >
      {mention ? (
        <span
          style={{
            cursor: "pointer",
          }}
        >
          {mention}&nbsp;
        </span>
      ) : (
        <div>
          <Ava
            size={size}
            style={{ ...style }}
            shape={shape}
            onClick={onClick}
            src={hasAvatar ? src : defaultAvatar}
            onError={(): any => {
              setHasAvatar(false);
            }}
          />
        </div>
      )}
    </Popover>
  );
};

export default Avatar;

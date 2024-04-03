import nobody from "@/assets/common/Nobody.png";
import Avatar from "@/components/Avatar";
import { addFriend, searchRcUser } from "@/services";
import { SearchOutlined } from "@ant-design/icons";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, Input, message } from "antd";
import { useState } from "react";
import { styled } from "umi";
const { Search } = Input;

const AddModal = styled.div`
  margin: auto;
  width: 430px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f7f7f7;
  .ant-input-group {
    height: 48px;
    .ant-input-affix-wrapper:not(:last-child) {
      height: 48px;
    }
    .ant-input-group-addon:last-child {
      width: 83px;
      height: 48px;
      .ant-input-search-button {
        width: 100%;
        height: 48px;
        border-radius: 0px;
      }
    }
  }
`;

const Title = styled.div`
  margin-top: 6px;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  color: #000000;
  margin-bottom: 20px;
`;

const SearchBox = styled.div`
  box-sizing: border-box;
  border: 1px solid #dddddd;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 390px;
  height: 48px;
  background-color: #ffffff;
`;

const Card = styled.div`
  width: 100%;
  display: flex;
  margin-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  justify-content: space-between;
  align-items: center;
  .message {
    display: flex;
    align-items: center;
    .name {
      padding-bottom: 5px;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
    }
    .company {
      font-weight: 400;
      font-size: 10px;
      color: #999999;
    }
    Button {
      height: 68px;
      width: 32px;
      border-radius: 2px;
    }
  }
`;

const Add = () => {
  // 搜索内容标识 初始搜索界面：isInit，搜索有结果：isTrue，搜索无结果：isFasle
  const [isSearch, setIsSearch] = useState("isInit");
  // 获取用户信息
  const [searchRcUserFun, { data }] = useLazyQuery(searchRcUser);
  // 添加好友
  const [addAccount, { loading }] = useMutation(addFriend);

  const onSearch = (values: any) => {
    if (!values) {
      setIsSearch("isInit");
      return;
    } else {
      searchRcUserFun({
        variables: { userName: values },
        fetchPolicy: "no-cache",
        onCompleted: (res: any) => {
          if (res?.users.searchRcUser) {
            setIsSearch("isTrue");
          } else {
            setIsSearch("isFasle");
          }
        },
      });
    }
  };
  let userInfo = data?.users.searchRcUser;

  // 添加搜索好友
  const addSearchFriend = () => {
    addAccount({
      variables: {
        contactRcUserId: userInfo?.rcUserId,
      },
      onCompleted: () => {
        message.success("添加成功", 2);
      },
      onError: () => {
        message.error("当前联系人已存在，无需重复添加！", 2);
      },
    });
  };

  return (
    <AddModal>
      <Title>加好友</Title>
      <SearchBox>
        <Search
          allowClear
          bordered={false}
          placeholder="通过手机号搜索"
          enterButton={"搜索"}
          prefix={<SearchOutlined />}
          onSearch={onSearch}
        />
      </SearchBox>
      {isSearch === "isTrue" ? (
        <Card>
          <div className="message">
            <Avatar pure size={60} userId={userInfo?.rcUserId} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "10px",
              }}
            >
              <div className="name">
                {userInfo?.nickName}（{userInfo?.userName}）
              </div>
              <div className="company">
                {userInfo?.companyName ? userInfo?.companyName : "暂无公司"}
              </div>
            </div>
          </div>

          <div>
            <Button
              onClick={() => addSearchFriend()}
              loading={loading}
              disabled={userInfo?.inContact}
              style={{ borderRadius: 2, borderColor: "#dddddd" }}
            >
              {userInfo?.inContact ? "已添加" : "添加"}
            </Button>
          </div>
        </Card>
      ) : isSearch === "isFasle" ? (
        <div
          style={{
            width: "168px",
            marginTop: "36px",
            lineHeight: "21px",
            fontWeight: 400,
            fontSize: 12,
            textAlign: "center",
            color: "#999999",
          }}
        >
          该用户不存在，无法找到该用户 请检查你填写的信息是否正确
        </div>
      ) : (
        <div>
          <img
            src={nobody}
            style={{
              width: 150,
              height: 136,
              marginTop: 78,
              marginBottom: 25,
              marginRight: 7.8,
            }}
          ></img>
          <p
            style={{
              fontWeight: 400,
              fontSize: 12,
              textAlign: "center",
              color: "#999999",
            }}
          >
            请通过手机号搜索好友
          </p>
        </div>
      )}
    </AddModal>
  );
};

export default Add;

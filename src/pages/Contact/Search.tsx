import Avatar from "@/components/Avatar";
import { getGroupInfo, searchAccount } from "@/services";
import { createWin } from "@/utils";
import { PlusOutlined } from "@ant-design/icons";
import { useLazyQuery } from "@apollo/client";
import { Divider, Input, Popover, Space } from "antd";
import { useState } from "react";
import { styled } from "umi";

const SearchWarp = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #efefef;
  .ant-input-affix-wrapper {
    width: 231px;
    height: 33px;
    margin: 15px;
    border-radius: 4px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: none;
    box-shadow: none;
    background: #efefef;
    input {
      background: #efefef;
    }
  }
`;

const Items = styled(Space)`
  :hover {
    background: #e4e7ea;
  }
  width: 180px;
`;

const Item = styled(Space)`
  :hover {
    background: #e4e7ea;
  }
  cursor: pointer;
  width: 180px;
  padding: 8px;
`;

const Search = ({ setType, setSelected }: any) => {
  const [contactList, setContactList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [getContact] = useLazyQuery(searchAccount, {
    onCompleted: (res: any) => {
      setContactList(res?.contacts?.listContact?.contactList);
      setGroupList(res?.contacts?.listContact?.groupList);
    },
  });

  const [groupInfo] = useLazyQuery(getGroupInfo);

  const handleSearch = async (e: any) => {
    if (e.target.value) {
      getContact({
        variables: {
          keyword: e.target.value,
        },
      });
    } else {
      setContactList([]);
      setGroupList([]);
    }
  };

  return (
    <SearchWarp>
      <Popover
        overlayInnerStyle={{
          borderRadius: 0,
          width: 200,
          maxHeight: 400,
          overflow: "scroll",
          backgroundClip: "border-box",
        }}
        title=""
        arrow={false}
        trigger="click"
        content={
          <Items direction="vertical">
            {contactList?.length
              ? contactList?.map((item: any) => (
                  <div
                    key={item?._id}
                    onClick={() => {
                      setType("user");
                      setSelected(item);
                    }}
                  >
                    <Item>
                      <Avatar pure userId={item?.contactRcUserId} />
                      {`${item?.nickName} (${item?.userName})`}
                    </Item>
                    <Divider style={{ margin: 0 }} />
                  </div>
                ))
              : groupList?.length
              ? groupList?.map((item: any) => (
                  <div
                    key={item?._id}
                    onClick={async () => {
                      setType("group");
                      const res = await groupInfo({
                        variables: {
                          roomId: item?.id,
                        },
                      });
                      setSelected(res?.data?.contacts?.findGroupInfo);
                    }}
                  >
                    <Item>
                      <Avatar pure userId={item?.contactRcUserId} />
                      {`${item?.fname}（${item?.usersCount}）`}
                    </Item>
                    <Divider style={{ margin: 0 }} />
                  </div>
                ))
              : "无结果"}
          </Items>
        }
      >
        <Input
          allowClear
          placeholder="搜索联系人"
          onChange={handleSearch}
          onFocus={handleSearch}
        />
      </Popover>
      <div
        style={{
          marginRight: 10,
          height: 33,
          background: "#efefef",
          padding: "4px 8px",
          color: "grey",
          display: "flex",
          borderRadius: 4,
        }}
      >
        <PlusOutlined
          onClick={() => {
            createWin({
              title: "添加好友",
              label: "add",
              url: "/add",
              width: 430,
              height: 492,
            });
          }}
        />
      </div>
    </SearchWarp>
  );
};

export default Search;

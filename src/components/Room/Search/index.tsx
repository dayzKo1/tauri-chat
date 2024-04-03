import { Divider, Input, Popover, Space } from "antd";
import { styled } from "umi";

import Avatar from "@/components/Avatar";
import { searchAccount } from "@/services";
import { useLazyQuery } from "@apollo/client";

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
  width: 205px;
`;

const Item = styled(Space)`
  :hover {
    background: #e4e7ea;
  }
  cursor: pointer;
  width: 205px;
  padding: 8px;
`;

const Search = () => {
  const [getContact, { data: res }] = useLazyQuery(searchAccount);
  const list = res?.contacts?.searchContactList?.contactList;

  const handleSearch = async (e: any) => {
    getContact({
      variables: {
        filter: { word: e.target.value },
      },
    });
  };

  return (
    <SearchWarp>
      <Popover
        overlayInnerStyle={{
          borderRadius: 0,
          maxHeight: 400,
          overflowY: "scroll",
        }}
        title=""
        arrow={false}
        trigger="click"
        content={
          <Items direction="vertical">
            {list?.length
              ? list?.map((item: any) => (
                  <div key={item?._id}>
                    <Item>
                      <Avatar
                        placement="right"
                        userId={item?.contactRcUserId}
                        trigger={["hover"]}
                      />
                      {`${item?.nickName} (${item?.userName})`}
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
    </SearchWarp>
  );
};

export default Search;

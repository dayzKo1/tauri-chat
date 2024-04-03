import Avatar from "@/components/Avatar";
import { getContactList, getGroupInfo } from "@/services";
import { useLazyQuery, useQuery } from "@apollo/client";
import { Collapse, List } from "antd";
import pinyin from "pinyin";
import { styled } from "umi";

const { Panel } = Collapse;
const { Item } = List;
const { Meta } = Item;

const Warp = styled.div`
  // height: calc(100vh - 64px - 40px);
  height: calc(100vh - 64px);
  overflow-x: hidden;
  overflow-y: scroll;
  .ant-collapse-content-box {
    padding: 0px !important;
  }
  .ant-list .ant-list-empty-text {
    padding: 0;
  }
  .ant-list-item {
    padding: 0;
    :hover {
      background: #f7f7f7;
    }
    .ant-list-item-meta {
      padding: 12px 24px;
      align-items: center;
    }
  }
`;

const Flex = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ContactList = ({ setSelected, setType }: any) => {
  const { data: users } = useQuery(getContactList);
  const { authority } = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const [groupInfo] = useLazyQuery(getGroupInfo);
  //匹配nickName是否以文字开头
  const reg = /^[\u4e00-\u9fa5]/;
  const transferData = (dataList: any) => {
    let sections: any = [],
      letterArr: any = [];
    let hasNoLetter: boolean = false;
    // 右侧字母栏数据处理
    if (dataList?.length > 0) {
      dataList.map((item: any) => {
        if (reg.test(item.nickName)) {
          let itemTemp = pinyin(item.nickName.substring(0, 1), {
            style: pinyin.STYLE_FIRST_LETTER,
          })[0][0].toUpperCase();
          letterArr.push(itemTemp);
        } else {
          hasNoLetter = true;
        }
        return [];
      });
      letterArr = [...new Set(letterArr)].sort();
      if (hasNoLetter) {
        letterArr.push("#");
        hasNoLetter = false;
      }
    }
    // 分组数据处理
    letterArr.forEach((item: any) => {
      sections.push({
        title: item,
        data: [],
      });
    });
    dataList?.forEach((item1: any) => {
      let listItem = item1;
      const dataObj = {
        ...listItem,
      };
      sections.forEach((item2: any) => {
        let firstName = listItem.nickName.substring(0, 1);
        let firstLetter = pinyin(firstName, {
          style: pinyin.STYLE_FIRST_LETTER,
        })?.[0]?.[0].toUpperCase();
        if (item2.title === firstLetter) {
          item2.data.push(dataObj);
        }
      });
      if (!reg.test(listItem.nickName)) {
        sections[sections.length - 1].data.push(dataObj);
      }
    });
    return sections;
  };

  return (
    <Warp>
      <Collapse
        style={{ background: "#ffffff" }}
        bordered={false}
        defaultActiveKey={["group", "contact"]}
      >
        {!authority.includes(0) && (
          <Panel
            key="group"
            header={
              <Flex>
                <div>群组</div>
                <div>{users?.contacts?.listContact?.groupList?.length}</div>
              </Flex>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={users?.contacts?.listContact?.groupList}
              locale={{ emptyText: " " }}
              renderItem={(j: any) => (
                <Item
                  key={j?.id}
                  style={{ border: 0 }}
                  onClick={async () => {
                    setType("group");
                    const res = await groupInfo({
                      variables: {
                        roomId: j?.id,
                      },
                    });
                    setSelected(res?.data?.contacts?.findGroupInfo);
                  }}
                >
                  <Meta
                    avatar={
                      <Avatar
                        pure
                        userId={j?.id}
                        type={"group"}
                        style={{ backgroundColor: "#4E83FD" }}
                      />
                    }
                    title={j.fname}
                  />
                </Item>
              )}
            />
          </Panel>
        )}
        <Panel
          key="contact"
          header={
            <Flex>
              <div>联系人</div>
              <div>{users?.contacts?.listContact?.contactList?.length}</div>
            </Flex>
          }
        >
          {transferData(users?.contacts?.listContact?.contactList)?.map(
            (i: any) => {
              return (
                <div key={i?.contactRcUserId}>
                  <div
                    style={{
                      paddingLeft: 30,
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  >
                    {i.title}
                  </div>
                  <List
                    locale={{ emptyText: " " }}
                    dataSource={i.data}
                    itemLayout="horizontal"
                    style={{
                      borderTop: "1px solid #EEEEEE",
                    }}
                    renderItem={(j: any) => (
                      <Item
                        key={i?.contactRcUserId}
                        style={{ border: 0 }}
                        onClick={() => {
                          setType("user");
                          setSelected(j);
                        }}
                      >
                        <Meta
                          avatar={<Avatar pure userId={j?.contactRcUserId} />}
                          title={`${j?.nickName}（${j?.userName}）`}
                          description={j?.companyName}
                        />
                      </Item>
                    )}
                  />
                </div>
              );
            },
          )}
        </Panel>
      </Collapse>
    </Warp>
  );
};

export default ContactList;

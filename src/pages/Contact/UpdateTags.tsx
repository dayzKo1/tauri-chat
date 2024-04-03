import { tags, updateTags } from "@/services";
import { closeWin } from "@/utils";
import { useMutation, useQuery } from "@apollo/client";
import { Button, Input, Space, Tag } from "antd";
import { useState } from "react";
import { styled } from "umi";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
`;

const InputBox = styled.div`
  display: flex;
  justify-content: center;
`;

const ItemList = styled(Space)`
  margin-top: 20px;
  width: 90%;
  height: 40px;
  background-color: #ffffff;
  padding-left: 15px;
  padding-right: 15px;
  border-radius: 4px;
`;

const Item = styled(Tag)`
  background-color: rgba(78, 131, 253, 0.1);
  border-radius: 20px;
  border-width: 0;
  color: #4e83fd;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 10px;
  padding-left: 10px;
`;

const TipsBox = styled(Space)`
  margin-top: 20px;
  width: 100%;
  padding-left: 5%;
`;

const AllTagsBox = styled(Space)`
  padding-left: 5%;
  padding-right: 5%;
  height: 130px;
  align-items: flex-start;
`;

const ButtonBox = styled.div`
  display: flex;
  height: 100px;
  width: 100%;
  justify-content: center;
  margin-top: 50px;
  padding-bottom: 30px;
`;

const ButtonItem = styled(Button)`
  width: 100px;
  height: 38px;
  border-width: 0;
  border-radius: 0;
  font-size: 16;
  font-weight: 600;
`;

const UpdateTags = () => {
  const [tagList, setTagList] = useState(["123", "2323", "2222", "12321"]);
  const { data: allTags } = useQuery(tags);
  const [updateTag] = useMutation(updateTags);
  const delItem = (index: number) => {
    const newList = [...tagList];
    newList.splice(index, 1);
    setTagList(newList);
  };
  return (
    <Container>
      <InputBox>
        <ItemList>
          {tagList.map((item, index) => {
            return (
              <Item
                style={{
                  paddingRight: 10,
                }}
                key={item}
                closeIcon
                onClose={() => delItem(index)}
              >
                {item}
              </Item>
            );
          })}
          {tagList.length < 5 && (
            <Input
              placeholder="选择或输入标签"
              style={{ borderWidth: 0, backgroundColor: "#fff", color: "#999" }}
              onBlur={(e) => {
                if (e.target.value.length > 0) {
                  setTagList([...tagList, e.target.value]);
                }
              }}
            />
          )}
        </ItemList>
      </InputBox>
      <TipsBox>
        <p style={{ color: "#999", fontSize: 12 }}>全部标签</p>
      </TipsBox>
      <AllTagsBox wrap={true}>
        {allTags?.tags?.getTagList?.tagList?.map((item: any, index: number) => (
          <Item
            key={index}
            onClick={() => {
              if (!tagList.includes(item.name) && tagList.length < 5) {
                setTagList([...tagList, item.name]);
              }
            }}
            style={
              !tagList.includes(item.name) && {
                backgroundColor: "#EEEEEE",
                color: "#999",
              }
            }
          >
            {item.name}
          </Item>
        ))}
      </AllTagsBox>
      <ButtonBox>
        <Space
          style={{
            width: "45%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <ButtonItem
            onClick={() => closeWin("updateTags")}
            style={{
              backgroundColor: "#F0F2F5",
              color: "#4E83FD",
            }}
          >
            取消
          </ButtonItem>
          <ButtonItem
            onClick={() => {
              updateTag({
                variables: {
                  id: "",
                  tags: tagList,
                },
                onCompleted: () => {
                  closeWin("updateTags");
                },
                onError: () => {},
              });
            }}
            style={{
              backgroundColor: "#4E83FD",
              color: "#fff",
            }}
          >
            确定
          </ButtonItem>
        </Space>
      </ButtonBox>
    </Container>
  );
};

export default UpdateTags;

import { useSelections } from "ahooks";
import { Card, Checkbox, Input as I, Space, Tag } from "antd";
import { useEffect, useState } from "react";
import { styled } from "umi";

const Detail = styled(Space)`
  margin-top: 15px;
  border: 1px solid #efefef;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
`;
const Input = styled(I)`
  border: 1px solid #efefef;
`;
const IBox = styled.div`
  .ant-input {
    text-align: center;
    color: #f29d39;
    &::placeholder {
      color: "#999";
    }
  }
`;

export default function DetailsItem({
  authority,
  isInquiry,
  item,
  activeKey,
  handleCheckedList,
}: any) {
  const [editList, setEditList]: any = useState([]);
  // 数据
  const dataList =
    item.inquiryVoList ||
    item?.dateList?.map((item1: any) => {
      const newItem = { ...item1 };
      delete newItem.companyName;
      return newItem.companyList;
    })[0];
  // ahooks
  const {
    selected,
    allSelected,
    isSelected,
    toggle,
    toggleAll,
    partiallySelected,
  } = useSelections(dataList || []);
  useEffect(() => {
    handleCheckedList(selected, editList);
  }, [selected, editList]);
  // 获取更改的数据
  const handleOffers = (obj: any, key: string, e: number) => {
    if (editList.length === 0) {
      setEditList([{ ...obj, [key]: e }]);
    } else {
      const newList = [...editList];
      const isEdit = newList.some(
        (item) => item.inquiryItemId === obj.inquiryItemId,
      );
      if (isEdit) {
        newList.map((item: any) => {
          if (item.inquiryItemId === obj.inquiryItemId) {
            item[key] = e;
          } else {
          }
          return item;
        });
        setEditList([...newList]);
      } else {
        setEditList([...editList, { ...obj, [key]: e }]);
      }
    }
  };
  return (
    <Card
      title={
        <div>
          {![1].includes(authority) && (
            <Checkbox
              checked={allSelected}
              onClick={toggleAll}
              indeterminate={partiallySelected}
            />
          )}
          <span style={{ fontSize: 13, marginLeft: 10 }}>
            {item.date.split(" ")[0]}
          </span>
        </div>
      }
      style={{ marginBottom: 20 }}
    >
      {dataList?.map((item1: any, i: number) => {
        return (
          <div
            key={item + i}
            style={{
              display: "flex",
              marginBottom: 20,
              justifyContent: "center",
            }}
          >
            <Checkbox
              key={i}
              disabled={[1].includes(authority)}
              checked={isSelected(item1)}
              onClick={() => toggle(item1)}
            />
            <Card
              style={{
                width: "100%",
                marginLeft: 10,
              }}
            >
              <div>
                <Tag color="blue" bordered={false}>
                  {item1.brandName}
                </Tag>
                {item1.content}
              </div>
              {activeKey === "OFFERED" && (
                <Space
                  direction="vertical"
                  key={i + item1.inquiryItemId}
                  style={{
                    wordBreak: "keep-all",
                  }}
                >
                  <Detail>
                    <div style={{ color: "#333" }}>报价</div>
                    <div
                      style={{
                        color: "#999",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ display: "inline" }}>货期</span>
                      <span
                        style={{
                          color: "#F29D39",
                          marginLeft: 5,
                        }}
                      >
                        {item1.offer?.prMinDelivery || item1.offer?.delivery}天
                      </span>
                    </div>
                    <div
                      style={{
                        color: "#999",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ display: "inline" }}>单价</span>
                      <span
                        style={{
                          color: "#F29D39",
                          display: "inline",
                          marginLeft: 5,
                        }}
                      >
                        ￥
                        {Number(
                          item1.offer?.prMinPrice || item1.offer?.price,
                        ).toFixed(2)}
                      </span>
                    </div>
                  </Detail>
                </Space>
              )}
              {!isInquiry && [0].includes(authority) && (
                <div style={{ marginTop: 15 }}>
                  <Space>
                    <IBox>
                      <Input
                        placeholder={"货期"}
                        defaultValue={item1.delivery || null}
                        onChange={(e: any) => {
                          handleOffers(
                            item1,
                            "delivery",
                            Number(e.target.value),
                          );
                        }}
                      />
                    </IBox>
                    <IBox>
                      <Input
                        placeholder={"单价"}
                        defaultValue={
                          item1.price > 0 ? item1.price.toFixed(2) : null
                        }
                        onChange={(e: any) => {
                          handleOffers(item1, "price", Number(e.target.value));
                        }}
                      />
                    </IBox>
                  </Space>
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </Card>
  );
}

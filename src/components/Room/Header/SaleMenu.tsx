import delivery from "@/assets/Inquiry/delivery.png";
import inquiry from "@/assets/Inquiry/inquiry1.png";
import obligation from "@/assets/Inquiry/obligation.png";
import order from "@/assets/Inquiry/order.png";
import { createWin } from "@/utils";
import { ShoppingOutlined, TransactionOutlined } from "@ant-design/icons";
import { Dropdown, Image, Tooltip } from "antd";

export default function SaleMenu({
  setActiveIndex,
  activeIndex,
  setDrawer,
  rcUserId,
}: any) {
  const items = [
    {
      key: "1",
      label: (
        <div
          style={{ width: 110, cursor: "pointer" }}
          onClick={() => {
            createWin({
              title: "报价明细",
              label: "offer_detail" + rcUserId,
              url: `/workstand/OfferGo?rcUserId=${rcUserId}`,
              width: 1200,
              height: 800,
            });
            setActiveIndex(-1);
          }}
        >
          <Image width={20} preview={false} src={inquiry} />
          <text style={{ marginLeft: 10, color: "#666" }}>我的报价</text>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          style={{ width: 110, marginTop: 5, cursor: "pointer" }}
          onClick={() => {
            createWin({
              title: "供应订单",
              label: "供应订单" + rcUserId,
              width: 1200,
              height: 800,
              url: `/workstand/ContractList?rcUserId=${rcUserId}&type=${"supply"}`,
            });
            setActiveIndex(-1);
          }}
        >
          <Image width={20} preview={false} src={order} />
          <text style={{ marginLeft: 10, color: "#666" }}>供应订单</text>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          style={{ width: 110, marginTop: 5, cursor: "pointer" }}
          onClick={() => {
            createWin({
              title: "收款",
              label: "收款" + rcUserId,
              width: 1200,
              height: 800,
              url: `/workstand/CollectionList?rcUserId=${rcUserId}`,
            });
            setActiveIndex(-1);
          }}
        >
          <Image width={20} preview={false} src={obligation} />
          <text style={{ marginLeft: 10, color: "#666" }}>收款</text>
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div
          style={{ width: 110, marginTop: 5, cursor: "pointer" }}
          onClick={() => {
            createWin({
              title: "发货",
              label: "发货" + rcUserId,
              width: 1200,
              height: 800,
              url: `/workstand/SendGoodsList?rcUserId=${rcUserId}`,
            });
            setActiveIndex(-1);
          }}
        >
          <Image width={20} preview={false} src={delivery} />
          <text style={{ marginLeft: 10, color: "#666" }}>发货</text>
        </div>
      ),
    },
    {
      key: "5",
      label: (
        <div
          style={{ width: 110, marginTop: 5, cursor: "pointer" }}
          onClick={() => {
            createWin({
              title: "开票",
              label: "开票" + rcUserId,
              width: 1200,
              height: 800,
              url: `/workstand/InvoicingList?rcUserId=${rcUserId}`,
            });
            setActiveIndex(-1);
          }}
        >
          <ShoppingOutlined
            style={{
              color: "#999",
              width: 20,
              height: 20,
              fontSize: 18,
            }}
          />
          <text style={{ marginLeft: 10, color: "#666" }}>开票</text>
        </div>
      ),
    },
  ];
  return (
    <Dropdown
      menu={{ items }}
      arrow
      onOpenChange={(a) => {
        if (a) {
          setActiveIndex(4);
          setDrawer("");
        } else {
          setActiveIndex(-1);
        }
      }}
      placement="bottom"
      trigger={"click"}
    >
      <Tooltip title={"我要销售"}>
        <TransactionOutlined
          style={activeIndex === 4 ? { color: "#4E83FD" } : { color: "#333" }}
        />
      </Tooltip>
    </Dropdown>
  );
}

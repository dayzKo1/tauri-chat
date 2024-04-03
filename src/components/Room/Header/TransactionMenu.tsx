import delivery from "@/assets/Inquiry/delivery.png";
import inquiry from "@/assets/Inquiry/inquiry1.png";
import obligation from "@/assets/Inquiry/obligation.png";
import order from "@/assets/Inquiry/order.png";
import { createWin } from "@/utils";
import { ShoppingCartOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Dropdown, Image, Tooltip } from "antd";

export default function TransactionMenu({
  rcUserId,
  setActiveIndex,
  setDrawer,
  activeIndex,
}: any) {
  const items = [
    {
      key: "1",
      label: (
        <div
          style={{ width: 110, cursor: "pointer" }}
          onClick={() => {
            createWin({
              title: "我的询价",
              label: "Inquiry_detail" + rcUserId,
              width: 1200,
              height: 800,
              url: `/workstand/InquiryMy?rcUserId=${rcUserId}`,
            });
            setActiveIndex(-1);
          }}
        >
          <Image width={20} preview={false} src={inquiry} />
          <text style={{ marginLeft: 10, color: "#666" }}>我的询价</text>
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
              title: "采购订单",
              label: "采购订单" + rcUserId,
              width: 1200,
              height: 800,
              url: `/workstand/ContractList?rcUserId=${rcUserId}&type=${"purchase"}`,
            });
            setActiveIndex(-1);
          }}
        >
          <Image width={20} preview={false} src={order} />
          <text style={{ marginLeft: 10, color: "#666" }}>采购订单</text>
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
              title: "付款",
              label: "付款" + rcUserId,
              width: 1200,
              height: 800,
              url: `/workstand/PaymentList?rcUserId=${rcUserId}`,
            });
            setActiveIndex(-1);
          }}
        >
          <Image width={20} preview={false} src={obligation} />
          <text style={{ marginLeft: 10, color: "#666" }}>付款</text>
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
              title: "收货",
              label: "收货" + rcUserId,
              width: 1200,
              height: 800,
              url: `/workstand/ReceiveGoodsList?rcUserId=${rcUserId}`,
            });
            setActiveIndex(-1);
          }}
        >
          <Image width={20} preview={false} src={delivery} />
          <text style={{ marginLeft: 10, color: "#666" }}>收货</text>
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
              title: "收货",
              label: "收货" + rcUserId,
              width: 1200,
              height: 800,
              url: `/workstand/InvoiceList?rcUserId=${rcUserId}`,
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
          <text style={{ marginLeft: 10, color: "#666" }}>收票</text>
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={"click"}
      onOpenChange={(a) => {
        if (a) {
          setActiveIndex(3);
          setDrawer("");
        } else {
          setActiveIndex(-1);
        }
      }}
      placement="bottom"
    >
      <Tooltip title={"我要采购"}>
        <ShoppingCartOutlined
          style={activeIndex === 3 ? { color: "#4E83FD" } : { color: "#333" }}
        />
      </Tooltip>
    </Dropdown>
  );
}

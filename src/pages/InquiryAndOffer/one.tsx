import { useAccess, useSearchParams } from "umi";
import MyInquiry from "./Inquiry/MyInquiry";
import OthersInquiry from "./Inquiry/OthersInquiry";
import SellerInquiry from "./Inquiry/SellerInquiry";

import MyOffer from "./Offer/MyOffer";
import OthersOffer from "./Offer/OthersOffer";
import ShareOffer from "./Offer/ShareOffer";

const Detail = () => {
  const [search] = useSearchParams();
  const username = search.get("username");
  // 通用参数
  const { label } = window.__TAURI__.window.getCurrent();
  const params = label.split(":");
  const [type, idList, isme, rcUserId] = params;
  const ids = idList.split("-");
  const me = isme === "true";
  const { authority } = useAccess();
  const is0 = [0].includes(authority); // 客户:采购商/供应商
  const is1 = [1].includes(authority); // 业务员
  const renderItem = () => {
    if (type === "INQUIRY") {
      if (is0) {
        if (me) {
          console.log("1采购商查看自己发起的询价");
          return <MyInquiry ids={ids} />;
        } else {
          console.log("2供应商查看询价、发送报价");
          return (
            <OthersInquiry ids={ids} username={username} rcUserId={rcUserId} />
          );
        }
      }
      if (is1) {
        console.log("3业务员查看询价");
        return <SellerInquiry ids={ids} />;
      }
    }
    if (type === "OFFER") {
      if (me) {
        console.log("4供应商查看自己发起的 报价");
        return <MyOffer ids={ids} rcUserId={rcUserId} />;
      } else {
        console.log("5采购商查看报价");
        return <OthersOffer ids={ids} rcUserId={rcUserId} />;
      }
    }
    if (type === "ICE_OFFER") {
      console.log("6查看分享的报价");
      return <ShareOffer id={ids[0]} />;
    }
  };
  return <>{renderItem()}</>;
};

export default Detail;

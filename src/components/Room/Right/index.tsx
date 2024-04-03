import Inquiry from "@/pages/InquiryAndOffer/Sider/Inquiry";
import Offer from "@/pages/InquiryAndOffer/Sider/Offer";
import { useModel } from "umi";

const Sider = ({ current }: any) => {
  const { sider } = useModel("global");
  const isInquiry = sider === "Inquiry";

  if (isInquiry) {
    return <Inquiry isInquiry={isInquiry} current={current} />;
  } else {
    return <Offer isInquiry={isInquiry} current={current} />;
  }
};

export default Sider;

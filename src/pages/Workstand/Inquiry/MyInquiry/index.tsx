import { useAccess } from "umi";
import Customer from "./Customer";
import Seller from "./Seller";

const Mine = () => {
  const { authority } = useAccess();
  if ([0].includes(authority)) {
    return <Customer />;
  }
  if ([1].includes(authority)) {
    return <Seller />;
  }
};

export default Mine;

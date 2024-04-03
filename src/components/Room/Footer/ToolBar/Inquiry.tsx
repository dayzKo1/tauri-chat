import { FileTextOutlined } from "@ant-design/icons";
import { useModel } from "umi";

const Inquiry = ({}) => {
  const { setSider } = useModel("global");
  return (
    <div
      onClick={() => {
        setSider((f: any) =>
          f && f === "Inquiry" ? setSider("") : setSider("Inquiry"),
        );
      }}
    >
      <FileTextOutlined />
      询价
    </div>
  );
};

export default Inquiry;

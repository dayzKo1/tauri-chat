import { RightOutlined } from "@ant-design/icons";
import { Image, Space } from "antd";

type IProps = {
  icon: string;
  title: string;
  topText: string;
  bottomText?: string;
};

export default function TransctionMenuItem({
  icon,
  title,
  topText,
  bottomText,
}: IProps) {
  return (
    <div style={{ width: 384 }}>
      <Space
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 10,
        }}
      >
        <Space style={{ display: "flex", alignItems: "center" }}>
          <Image src={icon} width={20} />
          <span style={{ fontSize: 15, color: "#000", fontWeight: 600 }}>
            {title}
          </span>
        </Space>
        <RightOutlined style={{ fontSize: 10 }} />
      </Space>
      <Space
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          paddingTop: 10,
          paddingBottom: 10,
          borderTop: "1px solid #ddd",
        }}
      >
        <div>{topText}</div>
        <div style={{ color: "#999", fontSize: 12 }}>{bottomText}</div>
      </Space>
    </div>
  );
}

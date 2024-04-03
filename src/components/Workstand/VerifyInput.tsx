import { Input } from "antd";

export default function VerifyInput({
  value,
  onChange,
  type,
  index,
  index1,
  handleOrderList,
}: any) {
  const handleChange = (e: any) => {
    const inputValue = e.target.value;
    if (type === "quantity" && /^\d+$/.test(inputValue)) {
      onChange(Number(inputValue));
      handleOrderList(index, index1, "quantity", Number(inputValue));
    } else if (type === "unit") {
      onChange(inputValue);
      handleOrderList(index, index1, "unit", inputValue);
    } else if (inputValue === "") {
      onChange("");
    }
  };

  const placeholderValue = () => {
    switch (type) {
      case "quantity":
        return "请输入数量";
        break;
      case "unit":
        return "请输入单位";
        break;
      default:
        break;
    }
  };

  return (
    <Input
      style={{
        width: "100%",
        height: "100%",
        color: "#F29D39",
      }}
      type={type === "unit" ? "" : "number"}
      value={value}
      placeholder={placeholderValue()}
      onChange={handleChange}
    />
  );
}

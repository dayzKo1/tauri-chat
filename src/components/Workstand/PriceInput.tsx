import { Input } from "antd";

export default function PriceInput({ value, onChange }: any) {
  const handleChange = (e: any) => {
    const inputValue = e.target.value;
    if (/^\d+(\.\d{1,2})?$/.test(inputValue) && inputValue.length <= 12) {
      onChange(Number(inputValue));
    } else if (inputValue === "") {
      onChange("");
    }
  };
  return (
    <Input
      style={{
        width: "100%",
        height: "100%",
        color: "#F29D39",
      }}
      type="number"
      value={value}
      onChange={handleChange}
    />
  );
}

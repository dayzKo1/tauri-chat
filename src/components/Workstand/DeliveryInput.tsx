import { Input, message } from "antd";

const DeliveryInput = ({ value, onChange, maxNum }: any) => {
  const [messageApi, contextHolder] = message.useMessage();
  const handleChange = (e: any) => {
    const inputValue = e.target.value;
    if (/^[1-9][0-9]*$/.test(inputValue) && inputValue.length <= 4) {
      if (maxNum) {
        if (Number(inputValue) > maxNum) {
          messageApi.warning("已经是最大值了！");
        } else {
          onChange(Number(inputValue));
        }
      } else {
        onChange(Number(inputValue));
      }
    } else if (inputValue === "") {
      onChange("");
    }
  };
  return (
    <>
      {contextHolder}
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
    </>
  );
};

export default DeliveryInput;

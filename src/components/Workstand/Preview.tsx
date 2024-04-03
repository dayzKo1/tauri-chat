import { Image, Modal } from "antd";
import { useState } from "react";
import { request } from "umi";

interface IProps {
  item: Array<string>;
  index: number;
  types: Array<string>;
}

function Preview({ item, index, types }: IProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [visible, setVisible] = useState(false);

  const previeFn = () => {
    request(`/api/download/fs/${item}`, {
      responseType: "blob",
    })
      .then((res) => {
        window.open(window.URL.createObjectURL(res));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <Modal
        title={
          <span
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            凭证{index + 1 + "." + types[index]}
          </span>
        }
        centered
        destroyOnClose={true}
        footer={null}
        open={visible}
        onCancel={() => setVisible(false)}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image style={{ width: 200 }} src={previewUrl} />
        </div>
      </Modal>
      <span onClick={previeFn} style={{ color: "#4E83FD", cursor: "pointer" }}>
        凭证{index + 1 + "." + types[index]}
      </span>
    </>
  );
}

export default Preview;

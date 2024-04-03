import { sendFileMsg } from "@/methods/file";
import { FolderOpenOutlined, UploadOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Button, Modal, Upload, message } from "antd";
import { useRef } from "react";

const FileUpload = ({ rid }: any) => {
  const origin: any = useRef(null);
  const base64: any = useRef(null);
  const type = useRef(null);

  const base64ToBlob = (url: any) => {
    const arr = url.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    type.current = mime;
    return new Blob([u8arr], { type: mime });
  };

  const { runAsync } = useRequest(sendFileMsg, {
    manual: true,
    onSuccess: () => {
      message.success("发送成功");
    },
    onError: () => {
      message.error("发送失败");
    },
  });

  return (
    <FolderOpenOutlined
      onClick={() =>
        Modal.confirm({
          mask: false,
          centered: true,
          width: 400,
          title: "文件上传",
          icon: null,
          content: (
            <Upload
              accept="*"
              beforeUpload={(file) => {
                let reader = new FileReader();
                reader.onload = (e) => {
                  base64.current = e.target?.result;
                };
                reader.readAsDataURL(file);
                origin.current = file;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
          ),
          onOk: () => {
            runAsync({
              rid,
              data: {
                file: new File(
                  [base64ToBlob(base64.current)],
                  origin.current.name,
                  { type: type.current, lastModified: Date.now() },
                ),
              },
            });
          },
        })
      }
    />
  );
};

export default FileUpload;

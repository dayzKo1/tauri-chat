import { HotTable } from "@handsontable/react";

import { UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { useRequest } from "ahooks";
import { Button, Card, Mentions, Modal, Space, Upload, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { styled } from "umi";

import "handsontable/dist/handsontable.full.min.css";
import { registerLanguageDictionary, zhCN } from "handsontable/i18n";
import { registerAllModules } from "handsontable/registry";

import FileImport from "@/assets/common/FileImport.png";
import PasteRecognition from "@/assets/common/PasteRecognition.png";
import rollback from "@/assets/common/rollback.png";

import { getAllBrands, parseFile, predictText } from "@/services";

import Forward from "@/components/Actions/Forward";

registerAllModules();
registerLanguageDictionary(zhCN);

const Warp = styled(Space)`
  width: 100%;
  .handsontable {
    font-size: 16px;
  }
  img {
    height: 24px;
    cursor: pointer;
  }
  .handsontable td.htInvalid {
    background-color: #fdeae9 !important;
  }
`;

const Fix = styled(Card)`
  position: fixed;
  bottom: 20px;
  border-radius: 8px;
  text-align: center;
  left: 30vw;
  height: 80px;
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.16);
`;

const Inquiry = ({}) => {
  const ref: any = useRef(null);
  const text: any = useRef(null);
  const [data, setData]: any = useState([[]]);

  const { runAsync } = useRequest(parseFile, {
    manual: true,
    onError: () => {
      message.error("导入失败,请检查文件模板或格式。");
    },
    onSuccess: (res) => {
      const { dataList, errorRows, successRows } = res?.data;
      setData(dataList?.map((item: any) => [item.brandName, item.content]));
      Modal.confirm({
        title: "导入文件",
        icon: null,
        content: `成功导入${successRows}条明细，${errorRows}条明细无法识别`,
        okText: "确认",
        cancelText: "取消",
        mask: false,
        centered: true,
      });
    },
  });

  const [predict] = useMutation(predictText, {
    variables: {},
    onCompleted: ({ inquiry }) => {
      if (inquiry.predictText.length) {
        setData(
          inquiry.predictText.map((item: any) => [
            item.brandName,
            item.content,
          ]),
        );
      }
    },
  });

  const { data: allBrands } = useQuery(getAllBrands);

  const common = (defaultValue: any) => {
    return {
      width: 768,
      icon: null,
      mask: false,
      okText: "确认",
      title: "粘贴识别",
      cancelText: "取消",
      onOk: () => {
        predict({
          variables: {
            text: text.current.textarea.value,
          },
        });
      },
      content: (
        <Mentions
          ref={text}
          rows={8}
          placeholder="将询价信息粘贴在这里，识别后自动填至询价单"
          defaultValue={defaultValue}
        />
      ),
    };
  };

  const getCopy = async () => {
    const { readText }: any = window.__TAURI__.clipboard;
    const copy = await readText();
    Modal.confirm(common(copy));
  };

  useEffect(() => {
    getCopy();
  }, []);

  const type: any = useRef(null);
  const base64: any = useRef(null);

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

  return (
    <Warp direction="vertical" size={0}>
      <div style={{ marginTop: 80 }}>
        <Space
          style={{
            top: 0,
            height: 80,
            padding: 24,
            zIndex: 199,
            width: "100%",
            display: "flex",
            position: "fixed",
            background: "#f7f7f7",
            justifyContent: "space-between",
          }}
        >
          <Space>
            <img
              src={FileImport}
              onClick={() =>
                Modal.confirm({
                  title: "文件导入",
                  width: 400,
                  centered: true,
                  mask: false,
                  icon: null,
                  content: (
                    <Upload
                      accept=".xlsx"
                      beforeUpload={(file) => {
                        let reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (e) => {
                          base64.current = e.target?.result;
                        };
                      }}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>点击上传</Button>
                    </Upload>
                  ),
                  onOk: () => {
                    runAsync({
                      type: 1,
                      data: {
                        file: new File(
                          [base64ToBlob(base64.current)],
                          "FILE_NAME",
                          { type: "FILE_TYPE", lastModified: Date.now() },
                        ),
                      },
                    });
                  },
                  okText: "确认",
                  cancelText: "取消",
                })
              }
            />
            文件导入
            <img alt="" src={PasteRecognition} onClick={() => getCopy()} />
            粘贴识别
          </Space>
          <Space size={16}>
            <img
              src={rollback}
              alt=""
              onClick={() => {
                const plugin = ref.current.hotInstance.getPlugin("contextMenu");
                plugin.executeCommand("undo");
              }}
            />
            <img
              style={{ transform: "rotateY(180deg)" }}
              src={rollback}
              alt=""
              onClick={() => {
                const plugin = ref.current.hotInstance.getPlugin("contextMenu");
                plugin.executeCommand("redo");
              }}
            />
          </Space>
        </Space>
        <HotTable
          ref={ref}
          columns={[
            {
              title: "品牌",
              type: "dropdown",
              source: allBrands?.inquiry?.getAllBrands?.map(
                (item: any) => item.name,
              ),
            },
            {
              title: "询价内容",
            },
          ]}
          data={data}
          height="auto"
          className="htMiddle"
          colWidths={[150, 800]}
          rowHeights={50}
          columnHeaderHeight={30}
          rowHeaders={true}
          contextMenu={true}
          language={zhCN.languageCode}
          licenseKey="non-commercial-and-evaluation"
          undo={true}
        />
      </div>
      <Fix>
        <Forward type="link" title="编辑 >" data={data} />
      </Fix>
    </Warp>
  );
};

export default Inquiry;

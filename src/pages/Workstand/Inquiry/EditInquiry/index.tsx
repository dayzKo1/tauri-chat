import { HotTable } from "@handsontable/react";

import { UploadOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { useRequest } from "ahooks";
import { Button, Card, Mentions, Modal, Space, Upload, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { styled, useSearchParams } from "umi";

import "handsontable/dist/handsontable.full.min.css";
import { registerLanguageDictionary, zhCN } from "handsontable/i18n";
import { registerAllModules } from "handsontable/registry";

import FileImport from "@/assets/common/FileImport.png";
import PasteRecognition from "@/assets/common/PasteRecognition.png";
import rollback from "@/assets/common/rollback.png";

import { getAllBrands, parseFile } from "@/services";

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

const InquiryEdit = () => {
  const ref: any = useRef(null);
  const text: any = useRef(null);
  const emptyList = () => {
    const emptyArray = new Array(5);
    for (let i = 0; i < emptyArray.length; i++) {
      emptyArray[i] = ["", "", 0, "", 0];
    }
    return emptyArray;
  };
  const [data, setData]: any = useState(emptyList());
  const [search] = useSearchParams();
  const fileData: any = search.get("fileData");
  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({
      type: "loading",
      content: "识别中，请稍等！",
      duration: 0,
    });
  };
  const { runAsync } = useRequest(parseFile, {
    manual: true,
    onError: () => {
      messageApi.destroy();
      messageApi.error("导入失败,请检查文件模板或格式。");
    },
    onSuccess: (res) => {
      messageApi.destroy();
      const { dataList, errorRows, successRows } = res?.data;
      Modal.confirm({
        title: "导入文件",
        icon: null,
        content: `成功识别${successRows}条明细，${errorRows}条明细无法识别`,
        okText: "覆盖询价",
        cancelText: "插入询价",
        mask: false,
        centered: true,
        onOk: () => {
          setData([
            ...dataList?.map((item: any) => [
              item.brandName,
              item.model,
              item.quantity,
              item.unit,
              item.delivery,
            ]),
          ]);
        },
        onCancel: () => {
          setData([
            ...dataList?.map((item: any) => [
              item.brandName,
              item.model,
              item.quantity,
              item.unit,
              item.delivery,
            ]),
            ...data,
          ]);
        },
      });
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
        success();
        runAsync({
          type: "text/plain",
          data: text.current.textarea.value,
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
    const { readText } = window.__TAURI__.clipboard;
    const copy = await readText();
    Modal.confirm(common(copy));
  };

  useEffect(() => {
    if (fileData) {
      const { dataList, errorRows, successRows } = JSON.parse(fileData);
      Modal.confirm({
        title: "导入文件",
        icon: null,
        content: `成功识别${successRows}条明细，${errorRows}条明细无法识别`,
        okText: "导入表格",
        cancelText: "取消",
        mask: false,
        centered: true,
        onOk: () => {
          setData([
            ...dataList?.map((item: any) => [
              item.brandName,
              item.model,
              item.quantity,
              item.unit,
              item.delivery,
            ]),
          ]);
        },
      });
    } else {
      getCopy();
    }
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
      {contextHolder}
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
                  mask: true,
                  icon: null,
                  content: (
                    <Upload
                      beforeUpload={(file) => {
                        type.current = file.type;
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
                    if (type.current) {
                      success();
                      runAsync({
                        type: type.current,
                        data: base64ToBlob(base64.current),
                      });
                      type.current = null;
                    } else {
                      messageApi.error("请先选择文件");
                    }
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
              title: "品名/型号",
            },
            {
              title: "数量",
              type: "numeric",
            },
            {
              title: "单位",
            },
            {
              title: "货期",
              type: "numeric",
            },
          ]}
          data={data}
          height="auto"
          className="htMiddle"
          colWidths={[150, document.body.clientWidth - 650, 150, 150, 150]}
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
        <Forward type="link" title="编辑 >" data={data} setData={setData} />
      </Fix>
    </Warp>
  );
};

export default InquiryEdit;

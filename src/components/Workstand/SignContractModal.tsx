import {
  CloseOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { styled } from "@umijs/max";
import { Button, Modal, Radio, Space, Steps } from "antd";
import { useState } from "react";

const Content: any = styled(Modal)`
  .ant-modal-content {
    border-radius: 0px;
    padding: 0px;
  }
`;

export default function SignContractModal({ open, setOpen, docInfo }: any) {
  const [currentKey, setCurrentKey] = useState(0);
  const [activeKey, setActiveKey] = useState(0);

  const formatDate = (date: Date) => {
    const newDate = `${new Date(date).toLocaleDateString().replaceAll("/", ".")}
    ${new Date(date).toLocaleTimeString().replaceAll(":", ".")}`;
    return date ? newDate : "";
  };

  return (
    <Content open={open} centered closable={false} footer={null} width={840}>
      <span style={{ height: 540 }}>
        <Space
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            height: 56,
            backgroundColor: "#F3F3F3",
            borderBottom: "1px solid #E7E7E7",
            paddingLeft: 30,
            paddingRight: 30,
          }}
        >
          <div />
          <span style={{ fontSize: 16, fontWeight: 600 }}>签署合同</span>
          <CloseOutlined
            onClick={() => {
              setOpen(false);
            }}
          />
        </Space>
        <div style={{ height: 480, padding: 30, overflow: "scroll" }}>
          <Steps
            direction="vertical"
            current={currentKey}
            size={"small"}
            initial={0}
            items={[
              {
                title: (
                  <span
                    style={{
                      width: 720,
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#000",
                      fontSize: 14,
                    }}
                  >
                    <span>选择模板</span>
                    <span style={{ fontSize: 12 }}>
                      {formatDate(docInfo?.sourceFile?.createdAt)}
                    </span>
                  </span>
                ),
                description: (
                  <div style={{ marginBottom: 20, marginTop: 10 }}>
                    <Radio.Group name="radiogroup" defaultValue={activeKey}>
                      <Radio
                        value={1}
                        style={{ marginRight: 50 }}
                        onChange={(a) => {
                          setActiveKey(a.target.value);
                        }}
                      >
                        生成采控网模板
                      </Radio>
                      <Radio
                        value={2}
                        onChange={(a) => {
                          setActiveKey(a.target.value);
                        }}
                      >
                        使用自定义合同模板
                      </Radio>
                    </Radio.Group>
                    {activeKey > 0 && (
                      <div
                        style={{
                          marginTop: 20,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#1E1E1E" }}>查看合同模板</span>
                        <Button
                          style={{
                            marginRight: 50,
                          }}
                          disabled={!docInfo?.sourceFile.ossFileName}
                          onClick={() => {
                            window.open(
                              `https://ckmro.oss-cn-shanghai.aliyuncs.com/${docInfo?.sourceFile.ossFileName}`,
                            );
                          }}
                          type="link"
                        >
                          预览
                        </Button>
                        <Button
                          type="link"
                          onClick={() => {}}
                          style={{ color: "#4E83FD" }}
                          icon={<DownloadOutlined color="#4E83FD" />}
                        >
                          下载Word
                        </Button>
                        <Button
                          type="link"
                          onClick={() => {}}
                          style={{ color: "#4E83FD" }}
                          icon={<DownloadOutlined color="#4E83FD" />}
                        >
                          下载PDF
                        </Button>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: (
                  <span
                    style={{
                      width: 720,
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#000",
                      fontSize: 14,
                    }}
                  >
                    <span>采控网已上传合同附件</span>
                    <span style={{ fontSize: 12 }}>
                      {formatDate(
                        docInfo?.inquiryFile?.createdAt ||
                          docInfo?.offerFile?.createdAt,
                      )}
                    </span>
                  </span>
                ),
                description: (
                  <div style={{ marginBottom: 20, marginTop: 20 }}>
                    {false ? (
                      <Button
                        type="primary"
                        style={{ height: 40, borderRadius: 2 }}
                      >
                        上传合同附件
                      </Button>
                    ) : (
                      <div>
                        <div
                          style={{
                            marginTop: 20,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ color: "#1E1E1E" }}>查看合同模板</span>
                          <Button
                            style={{
                              marginRight: 50,
                            }}
                            disabled={!docInfo?.sourceFile.ossFileName}
                            onClick={() => {
                              window.open(
                                `https://ckmro.oss-cn-shanghai.aliyuncs.com/${docInfo?.sourceFile.ossFileName}`,
                              );
                            }}
                            type="link"
                          >
                            预览
                          </Button>
                          <Button
                            type="link"
                            onClick={() => {}}
                            style={{ color: "#4E83FD" }}
                            icon={<DownloadOutlined color="#4E83FD" />}
                          >
                            下载
                          </Button>
                        </div>
                        <Space
                          style={{
                            padding: 10,
                            width: "100%",
                            backgroundColor: "#F7F7F7",
                            marginTop: 10,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "#595959" }}>
                            采购商审核结果：
                            <span style={{ color: "#F29D39" }}>审核中</span>
                          </span>
                          <span>
                            <Button
                              style={{
                                height: 32,
                                width: 94,
                                marginRight: 20,
                                borderRadius: 2,
                              }}
                            >
                              驳回
                            </Button>
                            <Button
                              style={{
                                height: 32,
                                width: 94,
                                borderRadius: 2,
                              }}
                              type="primary"
                            >
                              同意
                            </Button>
                          </span>
                        </Space>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: (
                  <span
                    style={{
                      width: 720,
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#000",
                      fontSize: 14,
                    }}
                  >
                    <span>采购商上传合同附件</span>
                    <span style={{ fontSize: 12 }}>
                      {formatDate(
                        docInfo?.inquiryFile?.createdAt ||
                          docInfo?.offerFile?.createdAt,
                      )}
                    </span>
                  </span>
                ),
                description: (
                  <div style={{ height: 50, marginBottom: 20, marginTop: 20 }}>
                    {true ? (
                      <div>
                        <div
                          style={{
                            marginTop: 20,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ color: "#1E1E1E" }}>合同名</span>
                          <Button
                            style={{
                              marginRight: 50,
                            }}
                            onClick={() => {
                              window.open(
                                `https://ckmro.oss-cn-shanghai.aliyuncs.com/${docInfo?.sourceFile.ossFileName}`,
                              );
                            }}
                            type="link"
                          >
                            预览
                          </Button>
                          <Button
                            type="link"
                            onClick={() => {}}
                            style={{ color: "#4E83FD" }}
                            icon={<DownloadOutlined color="#4E83FD" />}
                          >
                            下载
                          </Button>
                          <Button
                            type="link"
                            onClick={() => {}}
                            style={{ color: "#4E83FD", marginLeft: 50 }}
                            icon={<ReloadOutlined color="#4E83FD" />}
                          >
                            重新上传
                          </Button>
                        </div>
                        <Button
                          type="primary"
                          onClick={() => {}}
                          style={{
                            borderRadius: 2,
                            height: 32,
                            width: 94,
                            marginTop: 10,
                          }}
                        >
                          提交
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="primary"
                        style={{ height: 40, borderRadius: 2 }}
                      >
                        上传合同附件
                      </Button>
                    )}
                  </div>
                ),
              },
              {
                title: <span style={{ color: "#000" }}>完成</span>,
              },
            ]}
          />
        </div>
      </span>
    </Content>
  );
}

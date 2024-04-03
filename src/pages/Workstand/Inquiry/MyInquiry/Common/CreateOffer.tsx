import DeliveryInput from "@/components/Workstand/DeliveryInput";
import PriceInput from "@/components/Workstand/PriceInput";
import { downloadFile } from "@/services";
import {
  EditableProTable,
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormText,
} from "@ant-design/pro-components";
import { useRequest } from "ahooks";
import { Button, Divider, Dropdown, Image, message } from "antd";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { styled } from "umi";
import Share from "./Share";

const ProTable = styled(EditableProTable)`
  .ant-pro-card-body {
    padding-inline: 0;
  }
`;

const CreateOffer = ({ data }: any) => {
  const [preview, setPreview] = useState(false);
  const [preImage, setPreImage]: any = useState();
  const [params, setParams] = useState();
  const [messageApi, contextHolder] = message.useMessage();

  const { runAsync: download } = useRequest(downloadFile, {
    manual: true,
    onError: () => {
      messageApi.error("下载失败");
    },
    onSuccess: () => {},
  });

  const ref = useRef();
  const formRef: any = useRef();
  const editableFormRef: any = useRef();
  return (
    <>
      {contextHolder}
      <ModalForm
        formRef={formRef}
        title="生成报价"
        labelWidth="auto"
        layout="horizontal"
        submitter={{
          render: (props, defaultDoms) => {
            if (preview) {
              return [
                <Button key="last" onClick={() => setPreview(false)}>
                  上一步
                </Button>,
                <Dropdown.Button
                  key="download"
                  menu={{
                    items: [
                      {
                        key: "2",
                        label: "下载图片",
                      },
                      {
                        key: "0",
                        label: "下载PDF",
                      },
                      {
                        key: "1",
                        label: "下载EXCEL",
                      },
                    ],
                    onClick: async (e) => {
                      const edited: any = Object.values(
                        editableFormRef.current.getFieldsValue(),
                      );
                      const info = formRef.current.getFieldsValue();
                      const res: any = await download({
                        type: e.key,
                        data: {
                          ...info,
                          created: new Date(
                            dayjs(info.created).valueOf(),
                          ).toISOString(),
                          items: data?.map((item: any, index: number) => ({
                            brandName: item.brandName,
                            content: item.content,
                            delivery: Number(edited[index].offer.delivery),
                            price: Number(edited[index].offer.price),
                          })),
                        },
                      });
                      const a = document.createElement("a");
                      const objectUrl = window.URL.createObjectURL(res);
                      a.download = `${info.title}的报价单`;
                      a.href = objectUrl;
                      a.click();
                      window.URL.revokeObjectURL(objectUrl);
                      a.remove();
                    },
                  }}
                >
                  下载
                </Dropdown.Button>,
                <Share
                  key="Share"
                  type="link"
                  title="选择用户"
                  data={params}
                />,
              ];
            }
            return [
              defaultDoms[0],
              <Button
                key="create"
                type="primary"
                onClick={async () => {
                  await formRef.current.validateFields();
                  const edited: any = Object.values(
                    editableFormRef.current.getFieldsValue(),
                  );
                  const info = formRef.current.getFieldsValue();
                  const params = {
                    ...info,
                    created: new Date(
                      dayjs(info.created).valueOf(),
                    ).toISOString(),
                    items: data?.map((item: any, index: number) => ({
                      brandName: item.brandName,
                      content: item.content,
                      delivery: Number(edited[index].offer.delivery),
                      price: Number(edited[index].offer.price),
                    })),
                  };
                  try {
                    const res: any = await download({
                      type: 2,
                      data: params,
                    });
                    setPreview(true);
                    setParams(params);
                    setPreImage(window.URL.createObjectURL(res));
                  } catch {}
                }}
              >
                预览
              </Button>,
            ];
          },
        }}
        trigger={
          <Button type="primary" disabled={data?.length === 0}>
            生成报价
          </Button>
        }
        onOpenChange={() => setPreview(false)}
      >
        <div
          style={{
            display: !preview ? "none" : "block",
            overflow: "scroll",
            height: 500,
          }}
        >
          <Image src={preImage} alt="" />
        </div>
        <div style={{ display: preview ? "none" : "block" }}>
          <ProForm.Group>
            {[
              { name: "title", label: "供应商" },
              { name: "fromCusName", label: "报价人" },
              { name: "fromCusPhone", label: "手机号" },
            ].map((item) => (
              <ProFormText
                width="sm"
                key={item.name}
                name={item.name}
                label={item.label}
                placeholder={`请输入${item.label}`}
                rules={[{ required: true, message: `请输入${item.label}` }]}
              />
            ))}
            <ProFormDatePicker
              label="日期"
              name="created"
              width="sm"
              placeholder="请选择时间"
              fieldProps={{
                showToday: false,
              }}
              rules={[{ required: true, message: `请选择日期` }]}
            />
          </ProForm.Group>
          <Divider style={{ marginTop: 10 }} />
          <ProForm.Group>
            {[
              { name: "toCusName", label: "采购商" },
              { name: "toCusAddr", label: "地址" },
              { name: "toCusPhone", label: "手机号" },
            ].map((item) => (
              <ProFormText
                width="sm"
                key={item.name}
                name={item.name}
                label={item.label}
                placeholder={`请输入${item.label}`}
                rules={[{ required: true, message: `请输入${item.label}` }]}
              />
            ))}
          </ProForm.Group>
          <ProTable
            bordered
            actionRef={ref}
            editableFormRef={editableFormRef}
            rowKey="inquiryItemId"
            editable={{
              editableKeys: data?.map((item: any) => item?.inquiryItemId),
              type: "multiple",
            }}
            request={async () => ({
              data,
              success: true,
            })}
            search={false}
            options={false}
            recordCreatorProps={false}
            scroll={{
              y: "20vh",
            }}
            columns={[
              {
                title: "品牌",
                width: "15%",
                dataIndex: "brandName",
                editable: false,
              },
              {
                title: "询价内容",
                dataIndex: "content",
                editable: false,
              },
              {
                title: "单价(元)",
                width: "15%",
                align: "center",
                dataIndex: ["offer", "price"],
                valueType: "money",
                renderFormItem: (text) => {
                  return <PriceInput value={text} />;
                },
              },
              {
                title: "货期(天)",
                width: "15%",
                align: "center",
                dataIndex: ["offer", "delivery"],
                valueType: "digit",
                renderFormItem: (text) => {
                  return <DeliveryInput value={text} />;
                },
              },
            ]}
          />
        </div>
      </ModalForm>
    </>
  );
};

export default CreateOffer;

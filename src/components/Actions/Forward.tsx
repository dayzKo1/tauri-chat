import Avatar from "@/components/Avatar";
import { random } from "@/utils";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Select, Space, Spin, message } from "antd";

import { createDirects, sendMessages } from "@/methods";
import { createInquiryByContent, searchAccount } from "@/services";

import { debounce, getTime } from "@/utils";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useRequest } from "ahooks";
import { useMemo, useRef, useState } from "react";
import { styled, useAccess } from "umi";

const Text = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Item = (_id: string, name: string, username: string) => {
  return (
    <Space>
      <Avatar pure userId={_id} />
      <Text title={name}>
        {name} ({username})
      </Text>
    </Space>
  );
};

const DebounceSelect = ({
  fetchOptions,
  debounceTimeout = 800,
  ...props
}: any) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: any) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions: any) => {
        if (fetchId !== fetchRef.current) {
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
      onFocus={async () => {
        setOptions(await fetchOptions());
      }}
      dropdownStyle={{ maxHeight: 400, overflow: "scroll" }}
    />
  );
};

const Forward = ({
  type = "primary",
  title = "向好友询价",
  data = [],
  setData,
}: any) => {
  const { runAsync: create } = useRequest(createDirects, {
    manual: true,
  });
  const { runAsync: send } = useRequest(sendMessages, {
    manual: true,
    onSuccess: () => {
      message.success("发送成功");
    },
  });
  const [getContact] = useLazyQuery(searchAccount);
  const { authority } = useAccess();
  const [open, setOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const formRef: any = useRef(null);
  const subscriptions = JSON.parse(localStorage.getItem("subscriptions") ?? "");
  const [value, setValue]: any = useState();
  const fetchUserList = async (username = "") => {
    const { data } = await getContact({
      variables: {
        keyword: username,
      },
    });
    const ori = data?.contacts?.listContact?.contactList;
    const BUYER = ori?.filter((item: any) => item?.role === "BUYER")[0]
      ?.userName;
    const recent = subscriptions
      ?.filter(
        (item: any) =>
          item.t !== "c" &&
          item.t !== "p" &&
          item.fname !== "系统消息" &&
          item.name !== BUYER,
      )
      .sort((a: any, b: any) =>
        new Date(getTime(a)).toISOString() > new Date(getTime(b)).toISOString()
          ? -1
          : 1,
      )
      .slice(0, 3);
    const result = ori?.filter(
      (j: any) =>
        !recent.map((i: any) => i.name).includes(j.userName) &&
        j.role !== "BUYER",
    );
    return [
      {
        label: "搜索结果",
        options: result?.map((item: any) => ({
          key: item.contactRcUserId,
          label: Item(item.contactRcUserId, item.nickName, item.userName),
          value: `${item.contactRcUserId}-${item.userName}`,
        })),
      },
      {
        label: "最近聊天",
        options: recent?.map((item: any) => {
          const uid = item.rid.replace(item.u._id, "");
          return {
            key: uid,
            label: Item(uid, item.fname, item.name),
            value: `${uid}-${item.name}`,
          };
        }),
      },
    ];
  };
  const emptyList = () => {
    const emptyArray = new Array(data.length);
    for (let i = 0; i < emptyArray.length; i++) {
      emptyArray[i] = ["", "", 0, "", 0];
    }
    return emptyArray;
  };
  const [createInquiry, { loading }] = useMutation(createInquiryByContent, {
    onError: (err) => {
      const errInfo = JSON.parse(JSON.stringify(err));
      message.error(
        errInfo?.graphQLErrors?.[0]?.extensions?.isThrow
          ? errInfo.message
          : "发送失败，请稍后重试！",
      );
    },
    onCompleted: async (res) => {
      if ([0].includes(authority)) {
        const usernames = selectedFriends?.map(
          (item: string) => item.split("-")[1],
        );
        for (const item of usernames) {
          const { room } = await create({ data: { username: item } });
          send({
            data: {
              message: {
                msg: "[询价信息]",
                message: res?.inquiry?.createInquiry,
                rid: room?.rid,
                _id: random(17),
              },
            },
          });
        }
      } else {
        message.success("发送成功");
        formRef?.current?.setFieldValue("companyName", "");
        formRef?.current?.setFieldValue("memo", "");
      }
      setData(emptyList());
      setSelectedFriends([]);
      setValue(undefined);
    },
  });

  // 供应商 采购商
  if ([0].includes(authority)) {
    return (
      <Space>
        <div
          style={{
            width: 200,
          }}
        >
          发送给
          {selectedFriends?.length > 0
            ? selectedFriends?.map(
                (item: any, index: number) =>
                  index < 2 &&
                  `${item.split("-")[1]}${
                    selectedFriends?.length > 1 && index === 0 ? "、" : ""
                  }`,
              )
            : " ... "}
          等{selectedFriends?.length}
          家供应商
        </div>
        <ModalForm
          title="选择联系人"
          width={576}
          visible={open}
          formRef={formRef}
          modalProps={{ onCancel: () => setOpen(false) }}
          trigger={
            <Button onClick={() => setOpen(true)} type={type}>
              {title}
            </Button>
          }
          submitter={{
            render: () => {
              return [
                <Button
                  key="create"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  取消
                </Button>,
                <Button
                  key="create"
                  type="primary"
                  onClick={() => {
                    setOpen(false);
                    setSelectedFriends(value);
                  }}
                >
                  确认
                </Button>,
              ];
            },
          }}
        >
          <DebounceSelect
            mode="multiple"
            value={value}
            placeholder="搜索联系人"
            fetchOptions={fetchUserList}
            onChange={(v: any) => setValue(v)}
            style={{
              width: "100%",
              margin: "20px 0",
            }}
          />
        </ModalForm>
        <div>
          <Button
            disabled={selectedFriends.length === 0}
            type="primary"
            loading={loading}
            onClick={() => {
              let inquiryParams = {};
              // 客户
              inquiryParams = {
                sendToIds: selectedFriends.map(
                  (item: string) => item.split("-")[0],
                ),
              };
              // 创建询价
              let isEmpty = false;
              data.forEach((item: any) => {
                for (let i = 0; i < item.length; i++) {
                  if (item[i]) {
                    isEmpty = true;
                  }
                }
              });
              if (isEmpty) {
                createInquiry({
                  variables: {
                    inquiryParams,
                    inquiryItemParams: data.map((item: any) => ({
                      brandName: item[0],
                      model: item[1],
                      quantity: item[2],
                      unit: item[3],
                      delivery: item[4],
                    })),
                  },
                });
              } else {
                message.warning("请输入询价内容！");
              }
            }}
          >
            发起询价
          </Button>
        </div>
      </Space>
    );
  }
  // 业务员
  if ([1].includes(authority)) {
    return (
      <Space>
        <div
          style={{
            textAlign: "left",
          }}
        >
          <div>
            采购商：{formRef?.current?.getFieldValue("companyName")?.label}
          </div>
          <div>备注：{formRef?.current?.getFieldValue("memo")}</div>
        </div>
        <ModalForm
          title="备注"
          width={576}
          visible={open}
          formRef={formRef}
          modalProps={{ onCancel: () => setOpen(false) }}
          trigger={
            <Button onClick={() => setOpen(true)} type={type}>
              {title}
            </Button>
          }
          submitter={false}
        >
          <div
            style={{
              maxHeight: 300,
              overflowY: "scroll",
              overflowX: "hidden",
            }}
          >
            <ProFormSelect
              showSearch
              name="companyName"
              label="采购商"
              placeholder="请搜索采购商"
              request={async ({ keyWords }) => {
                const { data } = await getContact({
                  variables: {
                    keyword: keyWords ?? "",
                  },
                });
                return data.contacts.listContact.contactList.map(
                  (item: any) => ({
                    key: item.contactAcctId,
                    value: item.contactAcctId,
                    label: item.companyName,
                  }),
                );
              }}
              fieldProps={{
                labelInValue: true,
              }}
            />
            <ProFormText name="memo" label="备注" placeholder="请输入备注" />
          </div>
        </ModalForm>
        <div>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              let inquiryParams = {};
              // 业务员
              inquiryParams = {
                inquiryAcctId:
                  formRef?.current?.getFieldValue("companyName")?.value,
                memo: formRef?.current?.getFieldValue("memo"),
              };
              let isEmpty = false;
              data.forEach((item: any) => {
                for (let i = 0; i < item.length; i++) {
                  if (item[i]) {
                    isEmpty = true;
                  }
                }
              });
              if (isEmpty) {
                createInquiry({
                  variables: {
                    inquiryParams,
                    inquiryItemParams: data.map((item: any) => ({
                      brandName: item[0],
                      model: item[1],
                      quantity: item[2],
                      unit: item[3],
                      delivery: item[4],
                    })),
                  },
                });
              } else {
                message.warning("请输入询价内容！");
              }
            }}
          >
            发起询价
          </Button>
        </div>
      </Space>
    );
  }
};

export default Forward;

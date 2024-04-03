import Avatar from "@/components/Avatar";
import { ModalForm } from "@ant-design/pro-components";
import { Button, Select, Space, Spin, message } from "antd";

import { createDirects, sendMessages } from "@/methods";
import { appendInquiry, searchAccount } from "@/services";

import { debounce, getTime, random } from "@/utils";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useRequest } from "ahooks";
import { useMemo, useRef, useState } from "react";
import { styled } from "umi";

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

const Append = ({
  type = "primary",
  title = "选择用户",
  data = [],
  reload,
}: any) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { runAsync: create } = useRequest(createDirects, {
    manual: true,
  });
  const { runAsync: send } = useRequest(sendMessages, {
    manual: true,
    onSuccess: () => {
      messageApi.success("发送成功");
    },
  });
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [append] = useMutation(appendInquiry, {
    onCompleted: async ({ inquiry }) => {
      const usernames = selectedFriends?.map(
        (item: string) => item.split("-")[1],
      );
      for (const item of usernames) {
        const { room } = await create({ data: { username: item } });
        send({
          data: {
            message: {
              msg: "[询价信息]",
              message: inquiry?.appendInquiry,
              rid: room?.rid,
              _id: random(17),
            },
          },
        });
      }
    },
    onError: () => {},
  });

  const Btn = () => (
    <Button
      disabled={selectedFriends?.length === 0}
      type="primary"
      onClick={async () => {
        await append({
          variables: {
            params: {
              inquiryItemIdList: data?.map((item: any) => item?.inquiryItemId),
              sendToIds: selectedFriends?.map(
                (item: string) => item.split("-")[0],
              ),
            },
          },
        });
        reload();
      }}
    >
      继续询价
    </Button>
  );

  const [getContact] = useLazyQuery(searchAccount);
  const [open, setOpen] = useState(false);
  const formRef = useRef(null);
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

  return (
    <Space>
      {contextHolder}
      <ModalForm
        title="选择用户"
        width={576}
        visible={open}
        formRef={formRef}
        modalProps={{ onCancel: () => setOpen(false) }}
        trigger={
          <Button onClick={() => setOpen(true)} type={type}>
            {title}({selectedFriends?.length})
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
          onChange={(v: string) => {
            setValue(v);
          }}
          style={{
            width: "100%",
            margin: "20px 0",
          }}
        />
      </ModalForm>
      <div>
        <Btn />
      </div>
    </Space>
  );
};

export default Append;

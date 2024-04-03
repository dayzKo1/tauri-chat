import defaultAvatar from "@/assets/common/default_customer.png";
import Dropdown from "@/components/Setting/Dropdown";
import { closeWin, createWin, random } from "@/utils";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  DefaultOptions,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ErrorResponse, onError } from "@apollo/client/link/error";
import { Avatar, message } from "antd";
import React, { useState } from "react";
import { createGlobalStyle } from "umi";

export const rootContainer = (container: any) => {
  const authLink = setContext((_, { headers }) => {
    const { token } = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
    const { token: rcToken } = JSON.parse(localStorage.getItem("user") ?? "{}");
    return {
      headers: {
        ...headers,
        "X-Auth-Token": rcToken,
        Authorization: `Bearer ${token}`,
      },
    };
  });

  const errorLink = onError(
    ({ graphQLErrors, networkError }: ErrorResponse) => {
      if (graphQLErrors) {
        console.log("[GraphQL Error]:", graphQLErrors);
      }
      if (networkError) {
        console.log("[Network Error]:", networkError);
      }
      if (JSON.parse(JSON.stringify(networkError ?? "")).statusCode >= 500) {
        message.error("服务器繁忙，请稍后再试！");
      }
      if (networkError) {
        if (JSON.parse(JSON.stringify(networkError)).statusCode === 403) {
          const win = window.__TAURI__.window;
          win.getAll().map((item: any) => closeWin(item.label));
          createWin({
            label: "login",
            width: 300,
            height: 440,
            decorations: false,
          });
        }
      }
    },
  );

  const defaultOptions: DefaultOptions = {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
  };

  const httpLink = createHttpLink({
    uri: URL,
  });

  const link = ApolloLink.from([errorLink, authLink.concat(httpLink)]);

  const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
    defaultOptions,
  });

  return React.createElement(
    ApolloProvider,
    { client: client } as any,
    container,
  );
};

// export function render(oldRender) {
//   fetch("/api/auth").then((auth) => {
//     if (auth.isLogin) {
//       oldRender();
//     } else {
//       location.href = "/login";
//       oldRender();
//     }
//   });
// }

export const styledComponents = {
  GlobalStyle: createGlobalStyle`
    #root {

    }

    ::-webkit-scrollbar-track-piece {
      -webkit-border-radius: 0
    }

    ::-webkit-scrollbar {
      width: 3px;
      height: 10px
    }

    ::-webkit-scrollbar-thumb {
      height: 50px;
      background-color: #b8b8b8;
      -webkit-border-radius: 6px;
      outline-offset: -2px;
      filter: alpha(opacity = 50);
      -moz-opacity: 0.5;
      -khtml-opacity: 0.5;
      opacity: 0.5
    }

    ::-webkit-scrollbar-thumb:hover {
      height: 50px;
      background-color: #878987;
      -webkit-border-radius: 6px
    }

    .ant-pro-layout-container {
      main {
        padding-block: 0 !important;
        padding-inline: 0 !important;
      }
    }

    .ant-pro-layout {
      overflow-x: hidden;

      .ant-pro-sider .ant-layout-sider-children {
        border-inline-end: 0;
      }

      .ant-pro-sider-actions {
        display: none;
      }

      .ant-pro-sider-logo {
        padding-top: 30px;
        border-block-end: 0;
        padding-inline: 10px;
      }

      .ant-pro-sider-footer {
        text-align: center;
      }

      .ant-layout-header {
        padding-inline: 20px;
        border-bottom: 1px solid #efefef;
      }

      .ant-layout-footer {
        padding: 0;
      }

      .ant-mentions {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        border: none;
        box-shadow: none;
      }
    }

    .ant-modal-confirm .ant-modal-confirm-body .ant-modal-confirm-title + .ant-modal-confirm-content {
      max-width: 100%;
    }

    .ant-select-multiple .ant-select-selection-item {
      height: inherit;
    }

    .mymodal .ant-modal .ant-modal-content {
      padding: 0; 
      background-color: transparent;
      box-shadow: none;
    }
    .bank-modal {
      // 银行单选单个宽度
      .ant-radio-wrapper {
        width: 48%;
      }
      // 银行单选列表盒子宽度
      .ant-radio-group {
        width: 100%;
      }
    } 
  `,
};
// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState() {
  const { authority } = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
  return { authority };
}

const UserAvatar = () => {
  const rcUserId = JSON.parse(
    localStorage.getItem("userInfo") ?? "{}",
  )?.rcUserId;
  const [imageUrl, setImageUrl] = useState<string>(
    `${OSS_URL}/ckmro/apps/avatar/${rcUserId}`,
  );
  return (
    <Avatar
      key={random(5)}
      size={36}
      src={imageUrl}
      shape="square"
      onError={(): any => {
        setImageUrl(defaultAvatar);
      }}
    />
  );
};

export const layout = () => {
  return {
    title: "",
    logo: <UserAvatar />,
    locale: false,
    siderWidth: 70,
    collapsed: false,
    disableMobile: true,
    collapsedButtonRender: () => {},
    pageTitleRender: () => "",
    menuFooterRender: () => <Dropdown />,
    onMenuHeaderClick: () => {},
  };
};

export const request = {
  timeout: 10000,
  // errorConfig: {
  //   errorHandler(response) {
  //     message.error(
  //       `${response.request.status}：${response.request.responseText}`
  //     );
  //   },
  // },
  // errorThrower() {
  //   const { success, data, errorCode, errorMessage, showType } = res;
  //   if (!success) {
  //     const error: any = new Error(errorMessage);
  //     error.name = "BizError";
  //     error.info = { errorCode, errorMessage, showType, data };
  //     throw error;
  //   }
  // },
  // 请求拦截器
  requestInterceptors: [
    (config: any) => {
      // rc
      if (
        config.url.includes([RC_URL]) &&
        JSON.parse(localStorage.getItem("user") || "{}")
      ) {
        const { id, token } = JSON.parse(localStorage.getItem("user") || "{}");
        const isFile = config.url.includes("rooms.upload");
        return {
          ...config,
          headers: {
            ...config.headers,
            "X-User-Id": id,
            "X-Auth-Token": token,
            Accept: isFile ? "multipart/form-data" : config.Accept,
            "Content-Type": isFile
              ? "multipart/form-data"
              : config["Content-Type"],
          },
        };
      }
      // gia
      if (JSON.parse(localStorage.getItem("userInfo") ?? "{}")) {
        const { token } = JSON.parse(localStorage.getItem("userInfo") ?? "{}");
        return {
          ...config,
          headers: {
            ...config.headers,
            "Content-Type": config["Content-Type"],
            Authorization: `Bearer ${token}`,
          },
        };
      }
      return { ...config };
    },
  ],
  // 响应拦截器
  // responseInterceptors: [
  //   (response) => {
  //     console.log("responseInterceptors");
  //     // 拦截响应数据，进行个性化处理
  //     const { data } = response;
  //     if (!data.success) {
  //       message.error("请求失败！");
  //     }
  //     return response;
  //   },
  // ],
};

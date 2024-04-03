import MsgLogo from "@/assets/Inquiry/Inquiry.png";
import inquiryIcon from "@/assets/Inquiry/inquiryIcon.png";
import Welcome from "@/assets/common/welcome.png";
import WelcomeLogo from "@/assets/common/welcomeLogo.png";
import Excle from "@/assets/useless/Excle.png";
import PDF from "@/assets/useless/PDF.png";
import PPT from "@/assets/useless/PPT.png";
import Unknow from "@/assets/useless/Unknow.png";
import Word from "@/assets/useless/Word.png";
import ZIP from "@/assets/useless/ZIP.png";
import soundFile from "@/assets/useless/soundFile.png";
import Avatar from "@/components/Avatar";
import { createWin, fomartFileUrl, formatMsgDate } from "@/utils";
import { timeStampToNormalTime } from "@/utils/timeStampToNormalTime";
import {
  CloudDownloadOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  FileWordOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { useLazyQuery } from "@apollo/client";
import {
  Button,
  Dropdown,
  Image,
  message as MessageAntd,
  Space,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { getDvaApp, styled } from "umi";

import {
  getInquiryPreviewCard,
  getOfferPreviewCard,
  getOrderPreviewCard,
  getShareOfferPreviewCard,
} from "@/services/Message";

const { dispatch } = getDvaApp()._store;

const FileContent = styled(Space)`
  width: 50px;
  height: 58px;
  display: flex;
  border-radius: 4px;
  align-items: center;
  background: #e4e7ea;
`;

const Pure = styled.div`
  a {
    color: ${({ isme }: any) => (isme ? "white" : "black")};
  }
  :hover {
    text-decoration: underline;
  }
  line-height: 20px;
  padding: 8px 14px;
  border-radius: 4px;
  white-space: pre-wrap;
  color: ${({ isme }: any) => (isme ? "white" : "black")};
  background: ${({ isme }: any) => (isme ? "#4E83FD" : "white")};
`;

const FileWarp = styled(Space)`
  width: 270px;
  height: 80px;
  padding: 20px;
  font-weight: 600;
  border-radius: 4px;
  background: #ffffff;
`;

const Card = styled.div`
  display: flex;
  font-size: 14px;
  border-radius: 4px;
  padding: 10px 30px;
  background: ${({ selected }: any) => (selected ? "#e7e7e7" : "#f7f7f7cc")};
`;

const Flex = styled.div`
  display: flex;
  padding: 4px 10px;
  flex-direction: column;
`;

const Name = styled(Space)`
  color: #999999;
`;

const FlexBox = styled.div`
  display: flex;
  height: 25%;
  font-size: 12px;
  color: #666;
  font-weight: 400;
  border-bottom-width: ${({ index }: any) => (index === 2 ? "0" : "0.5px")};
  border-bottom-color: #dddddd;
  border-bottom-style: solid;
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  margin-top: 10px;
  flex: 1;
  border-radius: 15px 0 0 0;
`;

const BrandBox = styled.div`
  width: 30%;
  color: #666;
  text-align: center;
  padding-top: 8px;
  border-right-width: 0.5px;
  border-right-color: #dddddd;
  border-right-style: solid;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  word-break: break-all;
`;

const ModelBox = styled.div`
  width: 70%;
  color: #666;
  padding-top: 8px;
  padding-left: 5%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  word-break: break-all;
`;

const DateText = styled.div`
  margin-top: 5px;
  font-size: 14px;
  color: #fff;
  font-weight: 400;
  text-align: center;
`;

const ContentHeaderBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #fff;
  font-weight: 500;
`;

const GradientBoxLeft = styled.div`
  width: 25%;
  height: 12px;
  background-image: linear-gradient(
    to right,
    rgba(255, 0, 0, 0),
    rgba(255, 255, 255, 255)
  );
`;

const GradientBoxRight = styled(GradientBoxLeft)`
  background-image: linear-gradient(
    to right,
    rgba(255, 255, 255, 255),
    rgba(255, 0, 0, 0)
  );
`;

const Message = ({ item, kind }: any) => {
  const {
    t,
    u,
    ts,
    msg,
    pinned,
    editedAt,
    editedBy,
    mentions,
    _id: msgId,
    rid: roomId,
    message,
  } = item;
  const [selected, setSelected] = useState("");
  const { rcUserId } = JSON.parse(localStorage.getItem("userInfo") || "");
  const isme = u?._id === rcUserId;
  const file = item?.attachments?.[0];
  let items = [];

  const [getInquiryPreviewCardFun, { data: inquiry }] = useLazyQuery(
    getInquiryPreviewCard,
  );
  const [getOfferPreviewCardFun, { data: offer }] =
    useLazyQuery(getOfferPreviewCard);
  const [getShareOfferPreviewCardFun, { data: shareOffer }] = useLazyQuery(
    getShareOfferPreviewCard,
  );
  const [getOrderPreviewCardFun, { data: order }] =
    useLazyQuery(getOrderPreviewCard);

  useEffect(() => {
    if (item.message) {
      switch (item.message.type) {
        case "INQUIRY":
          getInquiryPreviewCardFun({
            variables: {
              ids: item.message.inquiryItemIds,
            },
          });
          break;
        case "OFFER":
          getOfferPreviewCardFun({
            variables: {
              params: {
                inquiryItemIdList: item.message.inquiryItemIds,
                offerRcUserId: item.u._id,
              },
            },
          });
          break;
        case "ICE_OFFER":
          getShareOfferPreviewCardFun({
            variables: {
              id: String(item.message.exportInquiryId),
            },
          });
          break;
        case "ORDER":
          getOrderPreviewCardFun({
            variables: {
              id: item.message.orderId,
            },
          });
          break;
      }
    } else if (item.attachments) {
      switch (item.attachments?.[0]?.message?.type) {
        case "INQUIRY":
          getInquiryPreviewCardFun({
            variables: {
              ids: item.attachments?.[0]?.message.inquiryItemIds,
            },
          });
          break;
        case "OFFER":
          getOfferPreviewCardFun({
            variables: {
              params: {
                inquiryItemIdList:
                  item.attachments?.[0]?.message.inquiryItemIds,
                offerRcUserId: item.u._id,
              },
            },
          });
          break;
      }
    }
  }, []);

  function padArray(arr: any[]) {
    if (arr.length < 3) {
      for (let i = 0; i <= 3 - arr.length; i++) {
        arr.push({});
      }
      return arr;
    } else if (arr.length === 3) {
      return arr;
    } else {
      return arr.slice(0, 3);
    }
  }

  const infoList = padArray([
    ...(inquiry?.inquiry.messagePreviewCard ||
      offer?.offers.messagePreviewCard ||
      shareOffer?.exportInquiry.messagePreviewCard ||
      order?.order.messagePreviewCard ||
      []),
  ]);

  // 屏蔽信息
  const hideItems = ["added-user-to-team", "message_pinned"];
  if (hideItems.includes(t)) {
    return;
  }
  const getTime = () => {
    if (ts?.["$date"]) return ts?.["$date"];
    if (ts) return ts;
  };

  // 系统信息
  if (kind === "sys") {
    if (file?.message) {
      const {
        type,
        total,
        inquiryItemIds,
        exportItemIds,
        exportInquiryId,
        sellerName,
        sellerMobile,
        buyerMobile,
        buyerName,
      } = file?.message;
      const types: any = {
        INQUIRY: "询价单",
        OFFER: "报价单",
        ORDER: "订单",
        ICE_OFFER: "报价单",
      };
      const ids =
        inquiryItemIds?.join("-") ??
        exportItemIds?.join("-") ??
        exportInquiryId;
      // 欢迎信息
      if (type === "WELCOME") {
        return (
          <Card
            key={msgId}
            selected={msgId === selected}
            onMouseLeave={() => setSelected("")}
            onMouseOver={() => setSelected(msgId)}
            style={{ padding: "20px 50px" }}
            title={formatMsgDate(new Date(getTime()).toISOString())}
          >
            <Space
              direction="vertical"
              style={{
                padding: 24,
                background: "white",
                borderRadius: 4,
                width: 600,
              }}
              size={12}
            >
              <Space>
                <img src={WelcomeLogo} alt="" style={{ width: 20 }} />
                采控服务团队
              </Space>
              <img src={Welcome} alt="" style={{ width: "100%" }} />
              <Space
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 12px",
                }}
              >
                <div>
                  您的<span style={{ color: "orange" }}>采购</span>
                  业务专属服务：{buyerName}(+{buyerMobile})
                </div>
                <Button
                  type="link"
                  onClick={() =>
                    dispatch({
                      type: "room/goToRoom",
                      payload: { username: buyerMobile, nickName: buyerName },
                    })
                  }
                >
                  立刻咨询
                </Button>
              </Space>
              <Space
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 12px",
                }}
              >
                <div>
                  您的<span style={{ color: "orange" }}>销售</span>
                  业务专属服务：
                  {sellerName}(+{sellerMobile})
                </div>
                <Button
                  type="link"
                  onClick={() =>
                    dispatch({
                      type: "room/goToRoom",
                      payload: { username: sellerMobile, nickName: sellerName },
                    })
                  }
                >
                  立刻咨询
                </Button>
              </Space>
            </Space>
          </Card>
        );
      }
      // 询报价信息
      return (
        <Card
          key={msgId}
          selected={msgId === selected}
          onMouseLeave={() => setSelected("")}
          onMouseOver={() => setSelected(msgId)}
          style={{ padding: "20px 50px" }}
        >
          <Space
            direction="vertical"
            style={{
              padding: 12,
              background: "white",
              borderRadius: 4,
              width: 467,
            }}
            onClick={() => {
              createWin({
                label: `${type}:${ids}:${false}:${u?._id}:${msgId}`,
                title: types[type],
                url: `/InquiryAndOffer/one?username=${u.username}`,
                width: 1000,
              });
            }}
          >
            <Space>
              <img src={MsgLogo} alt="" style={{ width: 20 }} />
              {types[type]}
            </Space>
            {type === "INQUIRY" ? (
              <div>你有{total}条明细待报价！点击查看</div>
            ) : (
              <div>已报价{total}条明细！点击查看</div>
            )}
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: 185,
                backgroundColor: "#2062B0",
                borderRadius: 4,
                padding: 10,
              }}
            >
              <ContentHeaderBox>
                <GradientBoxLeft></GradientBoxLeft>
                <div style={{ padding: "0 15px" }}>{types[type]}</div>
                <GradientBoxRight></GradientBoxRight>
              </ContentHeaderBox>
              <ContentBox>
                <FlexBox>
                  <BrandBox style={{ color: "#333" }}>品牌</BrandBox>
                  <ModelBox style={{ color: "#333" }}>型号</ModelBox>
                </FlexBox>
                {infoList?.map((item: any, index: number) => (
                  <FlexBox index={index} key={index}>
                    <BrandBox>{item.brandName}</BrandBox>
                    <ModelBox>{item.content}</ModelBox>
                  </FlexBox>
                ))}
              </ContentBox>
              <DateText>
                {timeStampToNormalTime(infoList?.[0].date, "-")}
              </DateText>
            </div>
          </Space>
        </Card>
      );
    }
  }

  // 非文件右键
  if (!file) {
    const copy = () => {
      const { writeText } = window.__TAURI__.clipboard;
      writeText(msg);
    };
    items.push({
      key: "inquiry",
      icon: <FileOutlined />,
      label: (
        <div
          onClick={async () => {
            copy();
            await createWin({
              title: "编辑询价",
              label: "inquiry",
              url: "/inquiry",
              width: 1200,
              height: 700,
            });
          }}
        >
          询价
        </div>
      ),
    });
    items.push({
      key: "copy",
      icon: <CopyOutlined />,
      label: (
        <div
          onClick={() => {
            copy();
            MessageAntd.success("copied");
          }}
        >
          复制
        </div>
      ),
    });
  }

  // 自发
  if (isme) {
    items.push({
      key: "delete",
      icon: <DeleteOutlined />,
      label: (
        <div
          onClick={() => {
            dispatch({
              type: "room/deleteMessage",
              payload: {
                roomId,
                msgId,
              },
            });
            MessageAntd.success("deleted");
          }}
        >
          删除
        </div>
      ),
    });
  }

  // 默认
  items.push({
    key: "pin",
    icon: <PushpinOutlined />,
    label: (
      <div
        onClick={() => {
          if (pinned) {
            dispatch({
              type: "room/unPin",
              payload: selected,
            });
          } else {
            dispatch({
              type: "room/pin",
              payload: selected,
            });
          }
          MessageAntd.success(pinned ? "unpined" : "pined");
        }}
      >
        {pinned ? "取消固定" : "固定"}
      </div>
    ),
  });

  let msgg = msg;

  const transformLinkAndMention = (origin: any) => {
    const delimiter1 =
      /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})*[a-z0-9.,_\/~#&=;%+?\-\\(\\)]*)/gi; // eslint-disable-line
    const delimiter2 = /(@\S+)/g; // eslint-disable-line
    return origin?.split(" ")?.map((word: any) => {
      let match1 = word.match(delimiter1);
      let match2 = word.match(delimiter2);
      if (match1) {
        let url = match1[0];
        return (
          <a
            key={Math.random()}
            href={url.startsWith("http") ? url : `http://${url}`}
            target="_blank"
            rel="noreferrer"
          >
            {url}&nbsp;
          </a>
        );
      }
      if (match2) {
        let mention = match2[0];
        const info = mentions.filter(
          (item: any) => item.username.indexOf(mention.slice(1)) !== -1,
        )[0];
        return <Avatar key={info?._id} userId={info?._id} mention={mention} />;
      }
      return word;
    });
  };
  const fileIcon = (type: string) => {
    switch (type) {
      case "msword":
        return (
          <FileWordOutlined
            style={{
              fontSize: 45,
              paddingTop: 5,
            }}
          />
        );
      case "vnd.openxmlformats-officedocument.wordprocessingml.document":
        return (
          <Image
            src={Word}
            preview={false}
            width={45}
            style={{ paddingTop: 5 }}
          />
        );
      case "vnd.ms-powerpoint":
        return (
          <Image
            src={PPT}
            preview={false}
            width={45}
            style={{ paddingTop: 5 }}
          />
        );
      case "vnd.openxmlformats-officedocument.presentationml.presentation":
        return (
          <Image
            src={PPT}
            preview={false}
            width={45}
            style={{ paddingTop: 5 }}
          />
        );
      case "vnd.ms-excel":
        return (
          <Image
            src={Excle}
            preview={false}
            width={45}
            style={{ paddingTop: 5 }}
          />
        );
      case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return (
          <Image
            src={Excle}
            preview={false}
            width={50}
            style={{ paddingTop: 5 }}
          />
        );
      case "pdf":
        return (
          <Image
            src={PDF}
            preview={false}
            width={45}
            style={{ paddingTop: 5 }}
          />
        );
      case "x-zip-compressed":
        return (
          <Image
            src={ZIP}
            preview={false}
            width={45}
            style={{ paddingTop: 5 }}
          />
        );
      case "octet-stream":
        return (
          <Image
            src={ZIP}
            preview={false}
            width={45}
            style={{ paddingTop: 5 }}
          />
        );
      case "mpeg":
        return (
          <Image
            src={soundFile}
            preview={false}
            width={45}
            style={{ paddingTop: 5 }}
          />
        );
      default:
        return (
          <Image
            src={Unknow}
            preview={false}
            width={45}
            style={{ paddingTop: 5 }}
          />
        );
    }
  };
  const renderItem = () => {
    if (t === "added-user-to-team") {
      return;
      //  <Pure>添加新成员: {msgg}</Pure>;
    }
    if (t === "message_pinned") {
      return;
      // (
      //   <Space direction="vertical">
      //     固定了一条信息
      //     <Space style={{ borderLeft: "1px solid purple" }}>
      //       <Avatar
      //         style={{ margin: "0 5px" }}
      //       />
      //       <Space direction="vertical">
      //         {file.author_name}
      //         {file.text}
      //       </Space>
      //     </Space>
      //   </Space>
      // );
    }
    // 询报价信息
    if (message) {
      const { type, inquiryItemIds, exportItemIds, exportInquiryId } = message;
      const types: any = {
        INQUIRY: "询价单",
        OFFER: "报价单",
        ORDER: "订单",
        ICE_OFFER: "报价单",
      };
      const texts: any = {
        INQUIRY: `有${item.message?.total}条明细待您报价！点击查看`,
        OFFER: `已报价${item.message?.total}条明细，点击查看`,
        ORDER: `已完成${item.message?.total}条明细下单！点击查看`,
        ICE_OFFER: `已报价${item.message?.total}条明细，点击查看`,
      };
      const ids =
        inquiryItemIds?.join("-") ??
        exportItemIds?.join("-") ??
        exportInquiryId;
      return (
        <Space
          direction="vertical"
          style={{
            padding: 12,
            background: "white",
            borderRadius: 4,
          }}
          onClick={() => {
            if (item.message.type === "ORDER") {
              createWin({
                title: `订单详情`,
                label: `订单详情-${item.message.orderId}`,
                width: 1200,
                height: 800,
                url: `/workstand/OrderDetail?orderId=${
                  item.message.orderId
                }&type=${isme ? "purchase" : "supply"}`,
              });
            } else {
              createWin({
                label: `${type}:${ids}:${isme}:${u?._id}:${msgId}`,
                title: types[type],
                url: `/InquiryAndOffer/one?username=${u.username}`,
                width: 1000,
              });
            }
          }}
        >
          <Space>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 45,
                backgroundColor:
                  item.message.type === "ORDER" ? "#F29D39" : "#4E83FD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src={inquiryIcon} alt="" style={{ width: 12, height: 12 }} />
            </div>
            {types[type]}
          </Space>
          <div>{texts[item.message.type]}</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: 250,
              height: 150,
              backgroundColor:
                item.message.type === "ORDER" ? "#F29D39" : "#2062B0",
              borderRadius: 4,
              padding: 10,
            }}
          >
            <ContentHeaderBox>
              <GradientBoxLeft></GradientBoxLeft>
              <div style={{ padding: "0 15px" }}>{types[type]}</div>
              <GradientBoxRight></GradientBoxRight>
            </ContentHeaderBox>
            <ContentBox>
              <FlexBox>
                <BrandBox
                  style={{
                    color: "#333",
                    paddingTop: 4,
                  }}
                >
                  品牌
                </BrandBox>
                <ModelBox style={{ color: "#333", paddingTop: 4 }}>
                  型号
                </ModelBox>
              </FlexBox>
              {infoList?.map((item: any, index: number) => (
                <FlexBox index={index} key={index}>
                  <BrandBox style={{ paddingTop: 4 }}>
                    {item.brandName}
                  </BrandBox>
                  <ModelBox style={{ paddingTop: 4 }}>{item.content}</ModelBox>
                </FlexBox>
              ))}
            </ContentBox>
            <DateText>
              {timeStampToNormalTime(infoList?.[0].date, "-")}
            </DateText>
          </div>
        </Space>
      );
    }
    if (file) {
      if (item?.file?.type?.split("/")[0] === "image") {
        return (
          <Image
            src={fomartFileUrl(file.title_link)}
            style={{ maxWidth: 350 }}
          />
        );
      }
      if (item?.file?.type?.split("/")[0] === "audio") {
        return <audio controls src={fomartFileUrl(file.title_link)}></audio>;
      }

      return (
        <FileWarp>
          <FileContent direction="vertical">
            {fileIcon(item?.file?.type.split("/")[1])}
            <div>{file?.format}</div>
          </FileContent>
          <Space direction="vertical" size={12}>
            <a
              href={fomartFileUrl(file.title_link)}
              download={item?.file?.name}
            >
              {item?.file?.name}
              <CloudDownloadOutlined
                style={{ color: "black", marginLeft: 5 }}
              />
            </a>
          </Space>
        </FileWarp>
      );
    }

    if (item?.urls?.length || item?.mentions?.length) {
      msgg = transformLinkAndMention(msgg);
    }
    if (kind) {
      return <Pure>{msgg}</Pure>;
    }
    return <Pure isme={isme}>{msgg}</Pure>;
  };

  if (kind === "search") {
    return (
      <Card
        key={msgId}
        selected={msgId === selected}
        onMouseLeave={() => setSelected("")}
        onMouseOver={() => setSelected(msgId)}
        onContextMenu={(e: any) => e.preventDefault()}
      >
        <Avatar userId={u?._id} />
        <Dropdown
          menu={{ items }}
          placement="topLeft"
          trigger={["contextMenu"]}
        >
          <Flex>
            <Space size={5}>
              <Name>
                {u?.name}
                {formatMsgDate(new Date(getTime()).toISOString())}
              </Name>
              <Tooltip title="已固定消息">
                {pinned && <PushpinOutlined />}
              </Tooltip>
              <Tooltip
                title={`${editedBy?.username}编辑于${formatMsgDate(editedAt)}`}
              >
                {editedAt && <EditOutlined />}
              </Tooltip>
            </Space>
            <div
              style={{
                marginTop: 8,
                wordBreak: "break-word",
                display: "flex",
              }}
            >
              {renderItem()}
            </div>
          </Flex>
        </Dropdown>
      </Card>
    );
  }

  if (kind === "pin") {
    return (
      <>
        <Card
          key={msgId}
          selected={msgId === selected}
          onMouseLeave={() => setSelected("")}
          onMouseOver={() => setSelected(msgId)}
          onContextMenu={(e: any) => e.preventDefault()}
        >
          <Avatar userId={u?._id} />
          <Dropdown
            menu={{ items }}
            placement="topLeft"
            trigger={["contextMenu"]}
          >
            <Flex>
              <Space size={5}>
                <Name>
                  {u?.name}
                  {formatMsgDate(new Date(getTime()).toISOString())}
                </Name>
                <Tooltip title="已固定消息">
                  {pinned && <PushpinOutlined />}
                </Tooltip>
                <Tooltip
                  title={`${editedBy?.username}编辑于${formatMsgDate(
                    editedAt,
                  )}`}
                >
                  {editedAt && <EditOutlined />}
                </Tooltip>
              </Space>
              <div
                style={{
                  marginTop: 8,
                  wordBreak: "break-word",
                  display: "flex",
                }}
              >
                {renderItem()}
              </div>
            </Flex>
          </Dropdown>
        </Card>
      </>
    );
  }

  if (kind === "file") {
    const size =
      item?.size / 1024 > 1024
        ? `${(item?.size / 1024 / 1024).toFixed(2)} MB`
        : `${(item?.size / 1024).toFixed(2)} KB`;
    return (
      <Card
        key={msgId}
        selected={msgId === selected}
        onMouseLeave={() => setSelected("")}
        onMouseOver={() => setSelected(msgId)}
        onContextMenu={(e: any) => e.preventDefault()}
      >
        <Space
          style={{
            width: "100%",
            display: "flex",
          }}
        >
          {item.type.split("/")[0] === "image" ? (
            <Image src={fomartFileUrl(item?.path)} width={50} />
          ) : (
            fileIcon(item.type.split("/")[1])
          )}
          <Space direction="vertical">
            <a
              href={fomartFileUrl(item?.path)}
              download={item?.name}
              style={{ color: "black" }}
            >
              {item?.name}
            </a>
            <Space direction="vertical" style={{ color: "grey", fontSize: 14 }}>
              <Space>
                {formatMsgDate(item?.uploadedAt)}
                from
                {item?.user?.name}
              </Space>
              {size}
            </Space>
          </Space>
          <Space />
        </Space>
      </Card>
    );
  }

  return isme ? (
    <Card
      style={{ justifyContent: "flex-end" }}
      key={msgId}
      selected={msgId === selected}
      onMouseLeave={() => setSelected("")}
      onMouseOver={() => setSelected(msgId)}
      title={formatMsgDate(new Date(getTime()).toISOString())}
      onContextMenu={(e: any) => e.preventDefault()}
    >
      <Dropdown menu={{ items }} placement="topLeft" trigger={["contextMenu"]}>
        <Space
          style={{
            marginTop: 8,
            wordBreak: "break-word",
            display: "flex",
          }}
        >
          <Tooltip title="已固定消息">{pinned && <PushpinOutlined />}</Tooltip>
          <Tooltip
            title={`${editedBy?.username}编辑于${formatMsgDate(editedAt)}`}
          >
            {editedAt && <EditOutlined />}
          </Tooltip>
          {renderItem()}
        </Space>
      </Dropdown>
    </Card>
  ) : (
    <Card
      key={msgId}
      selected={msgId === selected}
      onMouseLeave={() => setSelected("")}
      onMouseOver={() => setSelected(msgId)}
      onContextMenu={(e: any) => e.preventDefault()}
    >
      <Avatar userId={u?._id} />
      <Dropdown menu={{ items }} placement="topLeft" trigger={["contextMenu"]}>
        <Flex>
          <Space size={5}>
            <Name>
              {u?.name}
              {formatMsgDate(new Date(getTime()).toISOString())}
            </Name>
            <Tooltip title="已固定消息">
              {pinned && <PushpinOutlined />}
            </Tooltip>
            <Tooltip
              title={`${editedBy?.username}编辑于${formatMsgDate(editedAt)}`}
            >
              {editedAt && <EditOutlined />}
            </Tooltip>
          </Space>
          <div
            style={{
              marginTop: 8,
              wordBreak: "break-word",
              display: "flex",
            }}
          >
            {renderItem()}
          </div>
        </Flex>
      </Dropdown>
    </Card>
  );
};

export default Message;

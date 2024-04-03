const formatRoomDate = (origin: string) => {
  let date = new Date(origin);
  let year = date.getFullYear() + "";
  let month = date.getMonth() + 1 + "";
  let day = date.getDate() + "";
  let hour = (date.getHours() + "").padStart(2, "0");
  let minute = (date.getMinutes() + "").padStart(2, "0");
  let today = new Date();
  const isToday = new Date(date).getDate() === today.getDate();
  const isYesterday = new Date(date).getDate() === today.getDate() - 1;
  const isBeforeYesterday = new Date(date).getDate() === today.getDate() + 1;
  const h = date.getHours();
  let period = "";
  switch (true) {
    case h >= 0 && h <= 10:
      period = "早上";
      break;
    case h > 10 && h <= 14:
      period = "中午";
      break;
    case h > 14 && h <= 18:
      period = "下午";
      break;
    case h > 18 && h <= 24:
      period = "晚上";
      break;
    default:
      period = "";
  }
  if (isToday) {
    return `${period}${hour}:${minute}`;
  }
  if (isYesterday) {
    return "昨天";
  }
  if (isBeforeYesterday) {
    return "前天";
  }
  return `${year}/${month}/${day}`;
};

const formatMsgDate = (origin: string) => {
  let date = new Date(origin);
  let year = date.getFullYear() + "";
  let month = date.getMonth() + 1 + "";
  let day = date.getDate() + "";
  let hour = (date.getHours() + "").padStart(2, "0");
  let minute = (date.getMinutes() + "").padStart(2, "0");
  let today = new Date();
  const isToday = new Date(date).getDate() === today.getDate();
  if (isToday) {
    return `${hour}:${minute}`;
  }
  return `${year}/${month}/${day} ${hour}:${minute}`;
};

const fomartFileUrl = (url: string) => {
  const { id = "", token } = JSON.parse(localStorage.getItem("user") ?? "");
  return `${RC_URL}${url}?rc_uid=${id}&rc_token=${token}`;
};

const getTime = (it: any) => {
  const time1 = it?.lastMessage?._updatedAt?.["$date"];
  const time2 = it?.lastMessage?._updatedAt;
  const time3 = it?._updatedAt?.["$date"];
  const time4 = it?._updatedAt;
  if (time1) return time1;
  if (time2) return time2;
  if (time3) return time3;
  if (time4) return time4;
};

const formatAmount = (amount: number) => {
  // 将数字转为字符串，并分割整数部分和小数部分
  const [integerPart, decimalPart] = String(amount).split(".");
  // 每三位添加一个逗号
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );
  // 如果存在小数部分，则将其与整数部分拼接起来
  if (decimalPart) {
    return formattedIntegerPart + "." + decimalPart;
  } else {
    return formattedIntegerPart;
  }
};

export { fomartFileUrl, formatAmount, formatMsgDate, formatRoomDate, getTime };

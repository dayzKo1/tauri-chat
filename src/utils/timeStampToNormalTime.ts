export const timeStampToNormalTime = (timeStamp: any, join: any = ".") => {
  const date = new Date(timeStamp).toLocaleDateString();
  const dateString = date.replace(new RegExp("/", "g"), join);
  return dateString;
};

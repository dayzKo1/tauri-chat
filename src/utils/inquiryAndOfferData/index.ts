// 采购员-报价管理
const formatBuyerOfferList = (origArr: any) => {
  return origArr?.reduce(function (acc: any, item: any) {
    const date = item.date.split(' ')[0];
    const existingItem = acc.find(function (obj: any) {
      return obj.date === date;
    });
    if (existingItem) {
      existingItem.dateList.push(item);
    } else {
      acc.push({
        date: date,
        dateList: [item],
      });
    }
    return acc;
  }, []);
};
//客户-我要报价
const formatCusOfferList = (origArr: any) => {
  return origArr?.reduce(function (acc: any, item: any) {
    const date = item.date.split(' ')[0];
    const existingItem = acc.find((obj: any) => {
      return obj.date === date;
    });
    if (existingItem) {
      const existCompanyNameIndex = existingItem.dateList.findIndex(
        (obj: any) => {
          return obj?.companyName === item.companyName;
        },
      );
      if (existCompanyNameIndex !== -1) {
        existingItem.dateList[existCompanyNameIndex].companyList.push(item);
      } else {
        existingItem.dateList.push({
          companyName: item.companyName,
          companyList: [item],
        });
      }
    } else {
      acc.push({
        date: date,
        dateList: [
          {
            companyName: item.companyName,
            companyList: [item],
          },
        ],
      });
    }
    return acc;
  }, []);
};

//业务员-客户报价
const formatCusInqruiryBySeller = (origArr: any) => {
  return origArr?.reduce(function (acc: any, item: any) {
    const date = item.date.split(' ')[0];
    const existingItem = acc.find((obj: any) => {
      return obj.date === date;
    });
    if (existingItem) {
      const existCompanyNameIndex = existingItem.inquiryVoList.findIndex(
        (obj: any) => {
          return obj?.companyName === item.companyName;
        },
      );
      if (existCompanyNameIndex !== -1) {
        existingItem.inquiryVoList[
          existCompanyNameIndex
        ].inquiryItemVoList.push(item);
      } else {
        existingItem.inquiryVoList.push({
          companyName: item.companyName,
          inquiryItemVoList: [item],
        });
      }
    } else {
      acc.push({
        date: date,
        inquiryVoList: [
          {
            companyName: item.companyName,
            inquiryItemVoList: [item],
          },
        ],
      });
    }
    return acc;
  }, []);
};

//业务员-我的询价
const formatSellerInquiryList = (origArr: any) => {
  return origArr?.reduce((acc: any, item: any) => {
    const date = item.date.split(' ')[0];
    const existingItem = acc.find((obj: any) => {
      return obj.date === date;
    });
    if (existingItem) {
      const existItemIndex = existingItem.inquiryVoList.findIndex(
        (obj: any) => {
          return obj.inquiryId === item.inquiryId;
        },
      );
      if (existItemIndex !== -1) {
        existingItem.inquiryVoList[existItemIndex].inquiryItemVoList.push(item);
      } else {
        existingItem.inquiryVoList.push({
          inquiryId: item.inquiryId,
          memo: item.memo,
          inquiryItemVoList: [item],
        });
      }
    } else {
      acc.push({
        date: date,
        inquiryVoList: [
          {
            inquiryId: item.inquiryId,
            memo: item.memo,
            inquiryItemVoList: [item],
          },
        ],
      });
    }
    return acc;
  }, []);
};

// 客户-我的询价
const formatCustomerInquiryList = (origArr: any) => {
  return origArr?.reduce(function (acc: any, item: any) {
    const date = item.date.split(' ')[0];
    const existingItem = acc.find(function (obj: any) {
      return obj.date === date;
    });
    if (existingItem) {
      existingItem.inquiryVoList.push(item);
    } else {
      acc.push({
        date: date,
        inquiryVoList: [item],
      });
    }
    return acc;
  }, []);
};

export {
  formatBuyerOfferList,
  formatCusInqruiryBySeller,
  formatCusOfferList,
  formatCustomerInquiryList,
  formatSellerInquiryList,
};

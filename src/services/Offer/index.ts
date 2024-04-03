import { gql } from "@apollo/client";

// 4供应商查看自己发起的 报价 、采购商查看报价
const getOffer = gql`
  query ($params: OfferUseInfoParamsInput!) {
    offers {
      listOfferByChat(params: $params) {
        brandId
        brandName
        ckmroInquiryId
        ckmroItemId
        ckmroOfferId
        content
        created
        delivery
        inquiryItemId
        memo
        model
        name
        offerAcctId
        offerCompanyId
        offerCompanyName
        offerDelivery
        offerItemId
        offerPrice
        offerStatus
        origItemId
        quantity
        status
        unit
      }
    }
  }
`;

// 4 采购商查看报价明细
const getOfferInfo = gql`
  query ($params: QueryOfferDetailsParamsInput!) {
    offers {
      findOfferDetails(params: $params) {
        unit
        brandName
        content
        date
        delivery
        inquiryItemId
        inquiryItemOfferVoList {
          companyName
          date
          delivery
          offerItemId
          offerStatus
          price
          userName
          ckmroOfferId
          offerAcctId
          offerCompanyId
          offerCompanyName
          origItemId
          ckmroInquiryId
          ckmroItemId
        }
        memo
        status
        quantity
        name
        model
      }
    }
  }
`;

// 6 分享的报价
const getOfferShared = gql`
  query ($id: Long!) {
    exportInquiry {
      info(id: $id) {
        created
        fromCusAcctId
        fromCusAddr
        fromCusName
        fromCusPhone
        id
        title
        toCusAddr
        toCusName
        toCusPhone
        items {
          brandName
          content
          delivery
          inquiryId
          itemId
          price
        }
      }
    }
  }
`;

// 我的报价
const getAllOffer = gql`
  query ($params: ExportInquiryQueryParamsInput!) {
    exportInquiry {
      myShare(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        items {
          created
          fromCusAcctId
          fromCusAddr
          fromCusName
          fromCusPhone
          id
          title
          toCusAddr
          toCusName
          toCusPhone
          items {
            brandName
            content
            delivery
            inquiryId
            itemId
            price
          }
        }
      }
    }
  }
`;

//用户 我要报价
const listOfferByCustomer = gql`
  query ($params: QueryOfferByCustomerParamsInput!) {
    offers {
      listOfferByCustomer(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        offerList {
          brandName
          companyId
          companyName
          content
          date
          delivery
          inquiryItemId
          inquiryRcUserId
          offerStatus
          price
        }
      }
    }
  }
`;

// 用户 发送报价
const offerInquiryByCustomer = gql`
  mutation ($params: [OfferByCustomerParamsInput!]!) {
    offers {
      offerInquiryByCustomer(params: $params) {
        content {
          accountId
          ext
          hash
          id
          path
        }
        inquiryItemIds
        total
        type
        userName
      }
    }
  }
`;

// 用户 我分享的报价
const getSharedOffers = gql`
  query ($params: ExportInquiryQueryParamsInput!) {
    exportInquiry {
      myShare(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        items {
          created
          fromCusAcctId
          fromCusAddr
          fromCusName
          fromCusPhone
          id
          title
          toCusAddr
          toCusName
          toCusPhone
          items {
            brandName
            content
            delivery
            inquiryId
            itemId
            price
          }
        }
      }
    }
  }
`;

// 获取原始报价
const getOrginOffer = gql`
  query ($inquiryItemId: Long!) {
    offers {
      findOrigOffer(inquiryItemId: $inquiryItemId) {
        brandName
        content
        deMinDelivery
        deMinPrice
        prMinDelivery
        prMinPrice
      }
    }
  }
`;

// 采购员 报价管理
const getOfferBuyer = gql`
  query ($params: QueryOfferByBuyerParamsInput!) {
    offers {
      listOfferByBuyer(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        offerList {
          brandName
          content
          date
          inquiryItemId
          isRel
        }
      }
    }
  }
`;

//提醒报价
const remindOffer = gql`
  mutation ($inquiryItemId: Long!, $userName: String!) {
    offers {
      reminderOffer(inquiryItemId: $inquiryItemId, userName: $userName)
    }
  }
`;

export {
  getAllOffer,
  getOffer,
  getOfferBuyer,
  getOfferInfo,
  getOfferShared,
  getOrginOffer,
  getSharedOffers,
  listOfferByCustomer,
  offerInquiryByCustomer,
  remindOffer,
};

import { gql } from "@apollo/client";

// 所有品牌
const getAllBrands = gql`
  query {
    inquiry {
      getAllBrands {
        id
        name
      }
    }
  }
`;

// 文字识别
const predictText = gql`
  mutation ($text: String!) {
    inquiry {
      predictText(text: $text) {
        brandName
        content
      }
    }
  }
`;

// 创建询价单
const createInquiryByContent = gql`
  mutation (
    $inquiryItemParams: [InquiryItemParamsInput!]!
    $inquiryParams: InquiryParamsInput!
  ) {
    inquiry {
      createInquiry(
        inquiryItemParams: $inquiryItemParams
        inquiryParams: $inquiryParams
      ) {
        inquiryItemIds
        total
        type
      }
    }
  }
`;

// 1采购商 查看自己发起的询价
const getMyInquiryInfo = gql`
  query Inquiry($params: PurchaserInfoParamsInput!) {
    inquiry {
      purchaserInfo(params: $params) {
        brandId
        brandName
        companyName
        content
        date
        delivery
        inquiryItemId
        inquiryRcUserId
        memo
        model
        name
        quantity
        status
        unit
        winOffer {
          companyName
          delivery
          offerItemId
          offerStatus
          price
        }
      }
    }
  }
`;

// 1采购商 查看自己发起的报价详情
const getInquiryOffers = gql`
  query Offers($params: QueryOfferDetailsParamsInput!) {
    offers {
      findOfferDetails(params: $params) {
        brandName
        content
        date
        inquiryItemId
        inquiryItemOfferVoList {
          companyName
          date
          delivery
          offerStatus
          price
          userName
        }
      }
    }
  }
`;

// 2供应商 查看询价单
const getInquiryInfo = gql`
  query ($params: SupplyInfoParamsInput!) {
    inquiry {
      supplyInfo(params: $params) {
        brandId
        brandName
        companyName
        content
        date
        delivery
        inquiryItemId
        inquiryRcUserId
        memo
        model
        name
        quantity
        status
        unit
        winOffer {
          companyName
          delivery
          offerItemId
          offerStatus
          price
        }
      }
    }
  }
`;

// 2供应商 发送报价
const sendOffer = gql`
  mutation ($params: [OfferByCustomerParamsInput!]!) {
    offers {
      offerInquiryByCustomer(params: $params) {
        inquiryItemIds
        total
        type
        userName
      }
    }
  }
`;

// 3业务员查看询价单
const getInquiryInfoSeller = gql`
  query ($params: SellerInfoParamsInput!) {
    inquiry {
      sellerInfo(params: $params) {
        brandName
        content
        date
        inquiryItemId
        offerItemMap {
          deMinDelivery
          deMinPrice
          isMod
          prMinDelivery
          prMinPrice
        }
      }
    }
  }
`;

// 3 业务员修改询价
const updInquiryInfoSeller = gql`
  mutation ($params: [OfferBySellerParamsInput!]!) {
    offers {
      offerInquiryBySeller(params: $params)
    }
  }
`;

// 关闭明细
const closeDetails = gql`
  mutation ($inquiryItemIdList: [Long!]!) {
    inquiry {
      closeInquiry(inquiryItemIdList: $inquiryItemIdList)
    }
  }
`;

// 业务员-我的询价
const getSellerAllInquiry = gql`
  query ($params: QueryInquiryBySeller4MineParamsInput!) {
    inquiry {
      listInquiryBySeller4Mine(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        inquiryItemList {
          brandName
          content
          date
          inquiryItemId
          memo
          offerStatus
          offer {
            deMinDelivery
            deMinPrice
            prMinDelivery
            prMinPrice
            isMod
          }
        }
      }
    }
  }
`;

// 用户-我的询价
const getCustomerAllInquiry = gql`
  query ($params: QueryInquiryByCustomerParamsInput!) {
    inquiry {
      listInquiryByCustomer(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        inquiryItemList {
          brandId
          brandName
          content
          date
          delivery
          inquiryItemId
          inquiryRcUserId
          memo
          model
          name
          offerCount
          offerStatus
          quantity
          unit
          offer {
            ckmroInquiryId
            ckmroItemId
            ckmroOfferId
            companyName
            delivery
            offerItemId
            offerStatus
            price
            offerAcctId
            offerCompanyId
            offerCompanyName
            origItemId
          }
        }
      }
    }
  }
`;

// 业务员 客户询价
const getInquiryByCusToSeller = gql`
  query ($params: QueryInquiryBySellerParamsInput!) {
    inquiry {
      listInquiryBySeller(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        inquiryItemList {
          brandName
          companyId
          companyName
          content
          date
          inquiryItemId
          offerStatus
          offer {
            deMinDelivery
            deMinPrice
            isMod
            prMinDelivery
            prMinPrice
          }
        }
      }
    }
  }
`;

// 分享询价
const shareInquiry = gql`
  mutation ($params: ExportInquiryItemsParamsInput!) {
    exportInquiry {
      share(params: $params) {
        exportInquiryId
        total
        type
      }
    }
  }
`;

// 报价詳情
const getIceInquiry = gql`
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
          itemId
          price
        }
      }
    }
  }
`;

// 向好友询价
const appendInquiry = gql`
  mutation ($params: AppendInquiryParamsInput!) {
    inquiry {
      appendInquiry(params: $params) {
        inquiryItemIds
        total
        type
        content {
          accountId
          ext
          hash
          id
          path
        }
      }
    }
  }
`;

export {
  appendInquiry,
  closeDetails,
  createInquiryByContent,
  getAllBrands,
  getCustomerAllInquiry,
  getIceInquiry,
  getInquiryByCusToSeller,
  getInquiryInfo,
  getInquiryInfoSeller,
  getInquiryOffers,
  getMyInquiryInfo,
  getSellerAllInquiry,
  predictText,
  sendOffer,
  shareInquiry,
  updInquiryInfoSeller,
};

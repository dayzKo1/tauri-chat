import { gql } from "@apollo/client";

// 聊天中获取询价预览
const getInquiryPreviewCard = gql`
  query ($ids: [Long!]!) {
    inquiry {
      messagePreviewCard(ids: $ids) {
        brandName
        content
        date
      }
    }
  }
`;

// 聊天中获取报价预览
const getOfferPreviewCard = gql`
  query ($params: OfferUseInfoParamsInput!) {
    offers {
      messagePreviewCard(params: $params) {
        brandName
        content
        date
      }
    }
  }
`;

// 聊天中获取分享报价预览
const getShareOfferPreviewCard = gql`
  query ($id: String!) {
    exportInquiry {
      messagePreviewCard(id: $id) {
        brandName
        content
        date
      }
    }
  }
`;

// 聊天中获取订单预览
const getOrderPreviewCard = gql`
  query ($id: String!) {
    order {
      messagePreviewCard(id: $id) {
        brandName
        content
        date
      }
    }
  }
`;

export {
  getInquiryPreviewCard,
  getOfferPreviewCard,
  getOrderPreviewCard,
  getShareOfferPreviewCard,
};

import { gql } from '@apollo/client';

const getAppTab = gql`
  query {
    workbench {
      listGroup {
        key
        name
      }
    }
  }
`;

const getAppList = gql`
  query ($groupList: [AppRouterGroupEnum!]!) {
    workbench {
      listRouter(groupList: $groupList) {
        description
        group
        icon
        name
      }
    }
  }
`;

// 我要报价 未报价数
const getUnOfferd = gql`
  query {
    offers {
      countUnOfferedByCustomer
    }
  }
`;

export { getAppList, getAppTab, getUnOfferd };

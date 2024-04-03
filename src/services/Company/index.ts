import { gql } from "@apollo/client";

/**
 * 企业认证模块
 */
// 判断当前用户是否认证过
const checkAuthentication = gql`
  query {
    users {
      checkAuthentication
    }
  }
`;

// 获取企业认证信息
const getCompanies = gql`
  query {
    users {
      companies {
        archives {
          accountId
          address
          area
          city
          companyId
          id
          province
          website
          bankContents {
            bankAccount
            bankBranch
            bankId
            viewBank {
              code
              hot
              id
              index
              name
            }
          }
          viewAreaRegister {
            capitalize
            code
            id
            name
            parent
            pinyin
          }
          viewCityRegister {
            capitalize
            code
            id
            name
            parent
            pinyin
          }
          viewProvinceRegister {
            capitalize
            code
            id
            name
            parent
            pinyin
          }
        }
        company {
          abbr
          addressRegister
          areaRegister
          capital
          cityRegister
          establishedDate
          id
          legalPerson
          licenseNo
          name
          platform
          provinceRegister
        }
        license {
          accountId
          cateType
          companyId
          files
          filesContentType
          id
          originIds
          status
        }
        status
      }
    }
  }
`;

// 获取城市列表
const getCityList = gql`
  query {
    miscellaneous {
      treeCity
    }
  }
`;

// 获取银行列表
const getBankList = gql`
  query ($word: String) {
    miscellaneous {
      listBank(word: $word) {
        banks {
          code
          hot
          id
          index
          name
        }
        hot {
          code
          hot
          id
          index
          name
        }
      }
    }
  }
`;

// 添加或者更新认证信息
const addOrUpdateAuthentication = gql`
  mutation ($params: UpdatePropsByCompanyInput!) {
    rcUser {
      updatePropsByCompany(params: $params)
    }
  }
`;

export {
  addOrUpdateAuthentication,
  checkAuthentication,
  getBankList,
  getCityList,
  getCompanies,
};

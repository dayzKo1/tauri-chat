import { gql } from "@apollo/client";

// 查找可添加好友,搜索用户信息
const searchRcUser = gql`
  query ($accountId: String, $userName: String) {
    users {
      searchRcUser(accountId: $accountId, userName: $userName) {
        accountId
        avatar
        companyName
        email
        gender
        inContact
        nickName
        rcUserId
        userName
      }
    }
  }
`;

// 添加好友
const addFriend = gql`
  mutation ($contactRcUserId: String!) {
    contacts {
      addContact(contactRcUserId: $contactRcUserId) {
        id
      }
    }
  }
`;

// 用户详情
const getUserInfo = gql`
  query ($rcUserId: String, $userName: String, $accountId: String) {
    users {
      getRcUser(
        rcUserId: $rcUserId
        userName: $userName
        accountId: $accountId
      ) {
        accountId
        authority
        avatar
        companyName
        email
        gender
        inContact
        nickName
        rcUserId
        userName
      }
    }
  }
`;

// 搜索自己的联系人
const searchAccount = gql`
  query ($keyword: String) {
    contacts {
      listContact(keyword: $keyword) {
        contactList {
          avatar
          companyName
          contactAcctId
          contactRcUserId
          email
          gender
          id
          mobile
          nickName
          role
          status
          userName
          tagList {
            hot
            id
            name
          }
        }
        groupList {
          fname
          id
          name
          usersCount
        }
      }
    }
  }
`;

// 搜索采购商
const searchAll = gql`
  query ($companyName: String!) {
    contacts {
      searchInAll(companyName: $companyName) {
        acctId
        rcUserId
        companyName
      }
    }
  }
`;

// 联系人
const getContactList = gql`
  query ($keyword: String) {
    contacts {
      listContact(keyword: $keyword) {
        contactList {
          avatar
          companyName
          contactAcctId
          contactRcUserId
          email
          gender
          id
          mobile
          nickName
          role
          status
          userName
          tagList {
            hot
            id
            name
          }
        }
        groupList {
          fname
          id
          name
          usersCount
        }
      }
    }
  }
`;

// 更新用户信息
const updateUserInfo = gql`
  mutation ($params: UpdateRcUserParamsInput!) {
    rcUser {
      updateInfo(params: $params)
    }
  }
`;

const tags = gql`
  query Tags {
    tags {
      getTagList(hot: 0) {
        currentPage
        pageCount
        tagList {
          hot
          id
          name
        }
      }
    }
  }
`;

const updateTags = gql`
  mutation ($params: AddContactTagParamsInput!) {
    contacts {
      tagContact(params: $params) {
        id
      }
    }
  }
`;

export {
  addFriend,
  getContactList,
  getUserInfo,
  searchAccount,
  searchAll,
  searchRcUser,
  tags,
  updateTags,
  updateUserInfo,
};

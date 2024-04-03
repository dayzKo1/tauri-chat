import { gql } from "@apollo/client";

const getGroupInfo = gql`
  query Contacts($roomId: String!, $keyword: String) {
    contacts {
      findGroupInfo(roomId: $roomId, keyword: $keyword) {
        fname
        id
        name
        memberList {
          id
          nickname
          username
        }
      }
    }
  }
`;

// 群组详情

export { getGroupInfo };

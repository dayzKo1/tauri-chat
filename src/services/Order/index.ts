import { gql } from "@apollo/client";

// 生成采购订单数据的前置校验方法（判断用户是否可以向所选订单下单）
const beforeGenerateOrder = gql`
  query ($offerItemIdList: [Long!]!) {
    order {
      beforeGenerateOrder(offerItemIdList: $offerItemIdList)
    }
  }
`;

// 采购商向平台/好友下单（创建供应订订单）
const createOrder = gql`
  mutation ($orders: [OperationCreateParamsInput!]!) {
    order {
      operationCreate(orders: $orders) {
        orderId
        senderRcUserId
        senderUserName
        total
        type
      }
    }
  }
`;

// 设置默认收货地址
const setDefaultReceiptAddress = gql`
  mutation ($id: String!, $classify: Classify) {
    rcUser {
      setDefaultReceiptAddress(id: $id, classify: $classify) {
        addFirst
        area
        billFirst
        city
        classify
        companyName
        detailAddr
        first
        id
        mobile
        name
        phoneArea
        phoneNumFir
        phoneNumSec
        postCode
        province
        type
        sendWay {
          courierIds
          greaterWeight
          logisticsIds
          weight
        }
        viewArea {
          capitalize
          code
          id
          name
          parent
          pinyin
        }
        viewCity {
          capitalize
          code
          id
          name
          parent
          pinyin
        }
        viewProvince {
          capitalize
          code
          id
          name
          parent
          pinyin
        }
      }
    }
  }
`;

// 设置默认收票地址
const setDefaultCollectTicketsAddress = gql`
  mutation ($id: String!, $classify: Classify) {
    rcUser {
      setDefaultCollectTicketsAddress(id: $id, classify: $classify) {
        addFirst
        area
        billFirst
        city
        classify
        companyName
        detailAddr
        first
        id
        mobile
        name
        phoneArea
        phoneNumFir
        phoneNumSec
        postCode
        province
        type
        sendWay {
          courierIds
          greaterWeight
          logisticsIds
          weight
        }
        viewArea {
          capitalize
          code
          id
          name
          parent
          pinyin
        }
        viewCity {
          capitalize
          code
          id
          name
          parent
          pinyin
        }
        viewProvince {
          capitalize
          code
          id
          name
          parent
          pinyin
        }
      }
    }
  }
`;

// 删除收货发货收票地址
const deleteAddress = gql`
  mutation ($id: String!) {
    rcUser {
      deleteAddress(id: $id)
    }
  }
`;

// 添加、修改 收货/收票 地址
const addOrUpdateAddress = gql`
  mutation ($params: AddressParamsInput!) {
    rcUser {
      addOrUpdateAddress(params: $params) {
        addFirst
        area
        billFirst
        city
        classify
        companyName
        detailAddr
        first
        id
        mobile
        name
        phoneArea
        phoneNumFir
        phoneNumSec
        postCode
        province
        type
        sendWay {
          courierIds
          greaterWeight
          logisticsIds
          weight
        }
        viewArea {
          capitalize
          code
          id
          name
          parent
          pinyin
        }
        viewCity {
          capitalize
          code
          id
          name
          parent
          pinyin
        }
        viewProvince {
          capitalize
          code
          id
          name
          parent
          pinyin
        }
      }
    }
  }
`;

//获取采购合同
const getPurchaseContact = gql`
  query ($params: ContractDocInquiryPageParamsInput) {
    contract {
      inquiryPage(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        data {
          amount
          buyerGenerate
          contractMergeStatus
          createAt
          id
          orderItemSize
          orderShow
          orderShowText
          orderType
          orderTypeTxt
          doc {
            id
            inquiryFile {
              confirm
              doc
              fileName
              ossFileName
            }
            offerFile {
              confirm
              doc
              fileName
              ossFileName
            }
            sourceFile {
              confirm
              doc
              fileName
              ossFileName
            }
          }
          inquiry {
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
          offer {
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
        }
      }
    }
  }
`;

// 获取供应合同
const getSupplyContract = gql`
  query ($params: ContractDocOfferPageParamsInput) {
    contract {
      offerPage(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        data {
          amount
          buyerGenerate
          contractMergeStatus
          createAt
          id
          orderItemSize
          orderShow
          orderShowText
          orderType
          orderTypeTxt
          doc {
            id
            inquiryFile {
              confirm
              doc
              fileName
              ossFileName
            }
            offerFile {
              confirm
              doc
              fileName
              ossFileName
            }
            sourceFile {
              confirm
              doc
              fileName
              ossFileName
            }
          }
          inquiry {
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
          offer {
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
        }
      }
    }
  }
`;

// 获取下过单的供应商 (采购方调)
const getSupplierList = gql`
  query {
    order {
      inquiryMyCompanies
    }
  }
`;

// 获取被下过单的采购商 (供应方)
const getBuyerList = gql`
  query {
    order {
      offerMyCompanies
    }
  }
`;

// 订单查询
const getOrderDetail = gql`
  query ($orderId: String!) {
    order {
      orderInfo(orderId: $orderId) {
        amount
        cargoProcess
        confirmStatus
        contractMergeStatus
        createAt
        id
        inquiryAccountId
        offerAccountId
        orderShow
        orderShowText
        orderType
        payoutProcess
        status
        ticketProcess
        type
        tax
        offer {
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
        items {
          aftermarket
          brandId
          brandName
          cargoProcess
          deliveryDate
          buyerGenerate
          id
          itemId
          itemName
          model
          originPercentageCollection
          originPercentagePaid
          payoutProcess
          percentageCollection
          percentageInvoiced
          percentagePaid
          percentageReceived
          percentageShipped
          percentageTickets
          price
          quantity
          relevancyItemCount
          status
          ticketProcess
          totalAmount
          unit
          operationQuantity
        }
        inquiry {
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
        doc {
          id
          tradeTime
          inquiryFile {
            confirm
            createdAt
            doc
            fileName
            ossFileName
          }
          offerFile {
            confirm
            createdAt
            doc
            fileName
            ossFileName
          }
          sourceFile {
            confirm
            createdAt
            doc
            fileName
            ossFileName
          }
        }
      }
    }
  }
`;

// 获取交易信息：收货、收票地址信息，收款信息
const getTransctionInfo = gql`
  query ($accountId: String!, $classify: Classify!, $orderId: String) {
    order {
      transactionInfo(
        accountId: $accountId
        classify: $classify
        orderId: $orderId
      ) {
        directDelivery
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
        billingAddress {
          addFirst
          area
          billFirst
          city
          classify
          companyName
          detailAddr
          first
          id
          mobile
          name
          phoneArea
          phoneNumFir
          phoneNumSec
          postCode
          province
          type
          sendWay {
            courierIds
            greaterWeight
            logisticsIds
            weight
          }
          viewArea {
            capitalize
            code
            id
            name
            parent
            pinyin
          }
          viewCity {
            capitalize
            code
            id
            name
            parent
            pinyin
          }
          viewProvince {
            capitalize
            code
            id
            name
            parent
            pinyin
          }
        }
        moneyBillPayment {
          actualsBillType
          actualsContractBill
          actualsDay
          actualsDebt
          actualsPay
          actualsPayType
          futuresBillType
          futuresContractBill
          futuresDay
          futuresDebt
          futuresPay
          futuresPayType
          price
          actualsPayList {
            amount
            num
            payNode
          }
          futuresPayList {
            amount
            num
            payNode
          }
        }
        orderInfo {
          amount
          createdAt
          inquiryCompanyName
          inquiryNikeName
          inquiryUserName
          itemCount
          offerCompanyName
          offerNikeName
          offerUserName
          orderId
          orderTypeStr
          status
          tradeTime
          cargoProcess
        }
        originOrderInfo {
          offerNikeName
          offerUserName
          orderId
          orderTypeStr
          cargoProcess
        }
        shippingAddress {
          addFirst
          area
          billFirst
          city
          classify
          companyName
          detailAddr
          first
          id
          mobile
          name
          phoneArea
          phoneNumFir
          phoneNumSec
          postCode
          province
          type
          sendWay {
            courierIds
            greaterWeight
            logisticsIds
            weight
          }
          viewArea {
            capitalize
            code
            id
            name
            parent
            pinyin
          }
          viewCity {
            capitalize
            code
            id
            name
            parent
            pinyin
          }
          viewProvince {
            capitalize
            code
            id
            name
            parent
            pinyin
          }
        }
      }
    }
  }
`;

// 关闭订单
const closeOrder = gql`
  mutation ($params: CloseOfferParamsInput!) {
    order {
      closeOffer(params: $params)
    }
  }
`;

// 确认订单
const confirmOrder = gql`
  mutation ($params: ConfirmOrderParamsInput!) {
    order {
      confirmOrder(params: $params)
    }
  }
`;

// 获取订单doc
const quiryOrderDoc = gql`
  query ($orderId: String!) {
    order {
      orderInfo(orderId: $orderId) {
        doc {
          id
          tradeTime
          inquiryFile {
            confirm
            doc
            fileName
            ossFileName
            createdAt
          }
          offerFile {
            confirm
            doc
            fileName
            ossFileName
            createdAt
          }
          sourceFile {
            confirm
            doc
            fileName
            ossFileName
            createdAt
          }
        }
      }
    }
  }
`;

// 更改货物为直发现场
const changeDeliveryType = gql`
  mutation ($orderId: String!) {
    order {
      setDirectDelivery(orderId: $orderId)
    }
  }
`;

// 查询 未备货/未发货
const getBeforeShipment = gql`
  query ($params: ListPrepareItemParamsInput!) {
    stock {
      listPrepareItem(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        stockList {
          brandId
          brandName
          stockNum
          companyId
          companyName
          content
          orderId
          orderItemId
          tradeNum
          shippedNum
          prepareItemId
          unStockNum
          tradeTime
          unit
          arrivalDate
        }
      }
    }
  }
`;

// 查询 出库单/已发货/未收货/已收货
const getAfterShipment = gql`
  query ($params: ListPrepareItemParamsInput!) {
    stock {
      listStockTable(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        stockList {
          attachment
          attachmentContentType
          companyId
          companyName
          createAt
          stockItemNum
          stockTableId
          stockTime
          operatorAt
          shipperName
          logisticCode
        }
      }
    }
  }
`;

// 查询获取详情
const getStockTableDetail = gql`
  query ($stockTableId: String!) {
    stock {
      stockDetails(stockTableId: $stockTableId) {
        attachment
        attachmentContentType
        inquiryCompanyId
        inquiryCompanyName
        logisticCode
        customerName
        shipperCode
        offerCompanyId
        offerCompanyName
        shipperName
        stockTableId
        stockTime
        receiveAddress
        receiveMobile
        receiveName
        itemList {
          brandId
          brandName
          content
          deliveryDate
          orderId
          receivedQuantity
          shippedQuantity
          stockItemId
          unit
        }
      }
    }
  }
`;

// 收发货详情
const getStockDetail = gql`
  query ($stockTableId: String!) {
    stock {
      stockAddress(stockTableId: $stockTableId) {
        deliveryAddress {
          address
          mobile
          name
        }
        supplierInfo {
          attachment
          attachmentContentType
          companyName
          logisticCode
          receiveAddress
          receiveMobile
          receiveName
          shipperName
          stockTableId
          stockTime
        }
      }
    }
  }
`;

// 创建出库单
const createOutDelivery = gql`
  mutation (
    $stockStatus: StockStatusEnum!
    $params: [SupplierCreateStockTableParamsInput!]!
  ) {
    stock {
      supplierCreateStockTable(stockStatus: $stockStatus, params: $params)
    }
  }
`;

// 通知付款
const notifyPayment = gql`
  mutation ($params: [PrepareListParamsInput!]!) {
    stock {
      prepareList(params: $params)
    }
  }
`;

// 确认收货
const confirmReceipt = gql`
  mutation ($stockTableId: String!, $params: [TakeDeliveryParamsInput!]!) {
    stock {
      takeDelivery(stockTableId: $stockTableId, params: $params)
    }
  }
`;

// 确认发货
const confirmDelivery = gql`
  mutation (
    $stockTableId: String!
    $attachment: [String!]!
    $attachmentContentType: [String!]!
    $logisticCode: String
    $shipperCode: String
    $shipperName: String
  ) {
    stock {
      supplierCheckout(
        stockTableId: $stockTableId
        attachment: $attachment
        attachmentContentType: $attachmentContentType
        logisticCode: $logisticCode
        shipperCode: $shipperCode
        shipperName: $shipperName
      )
    }
  }
`;

// 获取关联订单
const getRelevancyOrder = gql`
  query ($orderItemId: [String!]!) {
    order {
      relevancyOrder(orderItemId: $orderItemId) {
        createdAt
        inquiryName
        orderId
        payment
        status
        items {
          brandId
          brandName
          deliveryDate
          itemName
          model
          percentageCollection
          percentageInvoiced
          percentagePaid
          percentageReceived
          percentageShipped
          percentageTickets
          price
          quantity
          status
          totalAmount
          unit
        }
      }
    }
  }
`;

// 获取未付款、已付款、应付款分页数据
const getPaymentInfo = gql`
  query ($params: ShouldPayPageInquiryParamsInput!) {
    paymentItem {
      pageInquiry(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        data {
          attachment
          attachmentContentType
          billIds
          count
          countPaymentAmount
          createAt
          id
          payDate
          paymentId
          receipts
          receivingBank
          receivingNumber
          inquiry {
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
          offer {
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
          orderItems {
            aftermarket
            amount
            brandId
            brandName
            deliveryDate
            inquiryAccountId
            inquiryCompanyId
            inquiryCompanyName
            itemName
            model
            offerAccountId
            offerCompanyId
            offerCompanyName
            orderId
            orderItemId
            paymentAmount
            price
            quantity
            shouldPayDate
            shouldPayId
            totalAmount
            unit
          }
        }
        desktopData {
          aftermarket
          amount
          brandId
          brandName
          deliveryDate
          inquiryAccountId
          inquiryCompanyId
          inquiryCompanyName
          itemName
          model
          offerAccountId
          offerCompanyId
          offerCompanyName
          orderId
          orderItemId
          paymentAmount
          price
          quantity
          shouldPayDate
          shouldPayId
          totalAmount
          unit
        }
      }
    }
  }
`;

// 获取已收款、未收款分页接口
const collectionInfo = gql`
  query ($params: PaymentItemPageParamsInput) {
    paymentItem {
      page(params: $params) {
        currentPage
        pageCount
        pageSize
        total
        data {
          attachment
          attachmentContentType
          billIds
          count
          countPaymentAmount
          id
          payDate
          paymentId
          receipts
          receivingBank
          receivingNumber
          payCompany {
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
          receiptsCompany {
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
        }
      }
    }
  }
`;

// 付款
const payment = gql`
  mutation ($params: CreateParamsInput!) {
    paymentItem {
      payment(params: $params)
    }
  }
`;

// 获取付款信息
const getPaymentDetail = gql`
  query ($paymentId: String, $orderId: String) {
    paymentItem {
      paymentDetails(paymentId: $paymentId, orderId: $orderId) {
        attachment
        attachmentContentType
        billIds
        countPaymentAmount
        payDate
        payingBank
        payingBankBranch
        payingName
        payingNumber
        receipts
        receivingBank
        receivingBankBranch
        receivingName
        receivingNumber
      }
    }
  }
`;

// 获取付款明细
const paymentInfo = gql`
  query ($id: String!) {
    paymentItem {
      info(id: $id) {
        attachment
        attachmentContentType
        billIds
        countShouldPays
        id
        payDate
        payingBank
        payingNumber
        receivingBank
        receivingNumber
        totalAmount
        payCompany {
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
        receiptsCompany {
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
        shouldPays {
          amount
          brandId
          brandName
          deliveryDate
          itemName
          lastPayTime
          model
          orderId
          orderItemId
          paymentAmount
          price
          quantity
          shouldPayId
          totalAmount
          unit
        }
      }
    }
  }
`;

// 收款
const collection = gql`
  mutation ($paymentItemId: String!) {
    paymentItem {
      receipts(paymentItemId: $paymentItemId)
    }
  }
`;

export {
  addOrUpdateAddress,
  beforeGenerateOrder,
  changeDeliveryType,
  closeOrder,
  collection,
  collectionInfo,
  confirmDelivery,
  confirmOrder,
  confirmReceipt,
  createOrder,
  createOutDelivery,
  deleteAddress,
  getAfterShipment,
  getBeforeShipment,
  getBuyerList,
  getOrderDetail,
  getPaymentDetail,
  getPaymentInfo,
  getPurchaseContact,
  getRelevancyOrder,
  getStockDetail,
  getStockTableDetail,
  getSupplierList,
  getSupplyContract,
  getTransctionInfo,
  notifyPayment,
  payment,
  paymentInfo,
  quiryOrderDoc,
  setDefaultCollectTicketsAddress,
  setDefaultReceiptAddress,
};

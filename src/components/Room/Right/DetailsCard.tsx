import DetailsItem from './DetailsItem';
export default function DetailsCard({
  authority,
  isInquiry,
  dataList,
  activeKey,
  handleCheckedList,
}: any) {
  return dataList?.map((item: any, i: number) => (
    <DetailsItem
      item={item}
      key={i}
      authority={authority}
      isInquiry={isInquiry}
      activeKey={activeKey}
      handleCheckedList={handleCheckedList}
    />
  ));
}

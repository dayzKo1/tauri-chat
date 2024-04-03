import { Pagination } from "antd";

export default function CustomPagination({
  pagination,
  onShowSizeChange,
}: any) {
  const locale = {
    items_per_page: "/ 页",
    jump_to: "跳至",
    page: "页",
  };
  return (
    <Pagination
      style={{
        width: "100%",
        padding: 20,
        display: "flex",
        justifyContent: "flex-end",
      }}
      size="small"
      showTotal={() => `共 ${pagination.total} 项数据`}
      current={pagination.currentPage}
      pageSize={pagination.pageSize}
      total={pagination.total}
      onChange={onShowSizeChange}
      showSizeChanger
      showQuickJumper
      locale={locale}
    />
  );
}

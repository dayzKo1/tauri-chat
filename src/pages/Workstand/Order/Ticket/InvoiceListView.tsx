import { useSearchParams } from "@umijs/max";

export default function InvoiceListView() {
  const [search] = useSearchParams();
  const rcUserId = search.get("rcUserId");
  return <div>InvoiceListView</div>;
}

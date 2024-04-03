import { useSearchParams } from "@umijs/max";

export default function InvoicingListView() {
  const [search] = useSearchParams();
  const rcUserId = search.get("rcUserId");
  return <div>InvoicingListView</div>;
}

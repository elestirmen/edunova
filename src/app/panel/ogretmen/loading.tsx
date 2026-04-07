import { Loading } from "@/components/ui/loading";

export default function TeacherLoading() {
  return (
    <div className="flex-1 lg:ml-64">
      <Loading text="Sayfa yükleniyor..." />
    </div>
  );
}

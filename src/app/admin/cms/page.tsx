import HeroCms from "./hero/page";
import NavCms from "./_components/NavCms";

export default function CmsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavCms />
      <main>
        <HeroCms />
      </main>
    </div>
  );
}

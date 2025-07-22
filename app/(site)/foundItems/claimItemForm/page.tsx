import { Metadata } from "next";
import FoundItemDetails from "@/components/FoundList/FoundItemDetails";
export const metadata: Metadata = {
  title: "Found Items | VisionVault",
  description:
    "Browse and search reported found items on VisionVault. Help reunite belongings with their rightful owners through intelligent image recognition and real-time updates.",
};

export default function FoundItemsPage() {
  return (
    <>
      <section className="pt-35 pb-20 lg:pt-45 lg:pb-25 xl:pt-50 xl:pb-30">
        <div className="max-w-c-1390 mx-auto px-4 md:px-8 2xl:px-0">
          <div className="flex flex-col-reverse gap-7.5 lg:flex-row xl:gap-12.5">
            <FoundItemDetails />
          </div>
        </div>
      </section>
    </>
  );
}

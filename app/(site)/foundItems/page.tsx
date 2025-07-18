import { Metadata } from "next";
import FoundList from "@/components/FoundList";
export const metadata: Metadata = {
  title: "Found Items | VisionVault",
  description:
    "Browse and search reported found items on VisionVault. Help reunite belongings with their rightful owners through intelligent image recognition and real-time updates.",
};

export default function FoundItemsPage() {
  return (
    <>
      <section className="py-20 lg:py-25 xl:py-30">
        <div className="max-w-c-1280 mx-auto mt-15 px-4 md:px-8 xl:mt-20 xl:px-0">
          <div className="max-w-c-1280 mx-auto mt-15 px-4 md:px-8 xl:mt-20 xl:px-0">
            <FoundList />
          </div>
        </div>
      </section>
    </>
  );
}

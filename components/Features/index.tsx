"use client";
import React from "react";
import featuresData from "./featuresData";
import SingleFeature from "./SingleFeature";
import SectionHeader from "../Common/SectionHeader";

const Feature = () => {
  return (
    <>
      <section id="features" className="pt-10 pb-5 lg:pt-10 lg:pb-15 xl:py-15">
        <div className="max-w-c-1315 mx-auto px-4 md:px-8 xl:px-0">
          <SectionHeader
            headerInfo={{
              title: "KEY FEATURES",
              subtitle:
                "Core Functions of the Vision-Based Asset Recovery System",
              description: `This smart lost and found platform enables users to report, track, and match lost items using image recognition and real-time chat. Designed to improve item recovery through automation, secure communication, and seamless user experience.`,
            }}
          />

          {/* <!-- Section Title End --> */}

          <div className="mt-12.5 grid grid-cols-1 gap-7.5 md:grid-cols-2 lg:mt-15 lg:grid-cols-3 xl:mt-20 xl:gap-12.5">
            {/* <!-- Features item Start --> */}

            {featuresData.map((feature, key) => (
              <SingleFeature feature={feature} key={key} />
            ))}
            {/* <!-- Features item End --> */}
          </div>
        </div>
      </section>

      {/* <!-- ===== Features End ===== --> */}
    </>
  );
};

export default Feature;

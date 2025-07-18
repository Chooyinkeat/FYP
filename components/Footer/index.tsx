"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const Footer = () => {
  return (
    <>
      <footer className="border-stroke dark:border-strokedark dark:bg-blacksection border-t bg-white">
        <div className="max-w-c-1390 mx-auto px-4 md:px-8 2xl:px-0">
          {/* Footer Top */}
          <div className="py-20 lg:py-25">
            <div className="flex flex-wrap gap-8 lg:justify-between lg:gap-0">
              {/* Logo and Description */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -20 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 1, delay: 0.5 }}
                viewport={{ once: true }}
                className="animate_top w-1/2 lg:w-1/4"
              >
                <a href="/" className="relative">
                  <Image
                    width={110}
                    height={80}
                    src="/images/fyp_header.png"
                    alt="Lost & Found Logo"
                    className="dark:hidden"
                  />
                  <Image
                    width={110}
                    height={80}
                    src="/images/fyp_header.png"
                    alt="Lost & Found Logo"
                    className="hidden dark:block"
                  />
                </a>

                <p className="mt-5 mb-10">
                  Lost & Found System — A smart way to reunite owners with their
                  belongings.
                </p>

                <p className="text-sectiontitle mb-1.5 tracking-[5px] uppercase">
                  Contact
                </p>
                <a
                  href="#"
                  className="text-itemtitle font-medium text-black dark:text-white"
                >
                  support@lostfound.edu
                </a>
              </motion.div>

              {/* Quick Links & Info */}
              <div className="flex w-full flex-col gap-8 md:flex-row md:justify-between md:gap-0 lg:w-2/3 xl:w-7/12">
                {/* Navigation */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 1, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="animate_top"
                >
                  <h4 className="text-itemtitle2 mb-9 font-medium text-black dark:text-white">
                    Navigation
                  </h4>

                  <ul>
                    <li>
                      <a
                        href="#"
                        className="hover:text-primary mb-3 inline-block"
                      >
                        Home
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-primary mb-3 inline-block"
                      >
                        Report Lost Item
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-primary mb-3 inline-block"
                      >
                        Found Listings
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-primary mb-3 inline-block"
                      >
                        About
                      </a>
                    </li>
                  </ul>
                </motion.div>

                {/* Resources */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 1, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="animate_top"
                >
                  <h4 className="text-itemtitle2 mb-9 font-medium text-black dark:text-white">
                    Resources
                  </h4>

                  <ul>
                    <li>
                      <a
                        href="#"
                        className="hover:text-primary mb-3 inline-block"
                      >
                        How It Works
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-primary mb-3 inline-block"
                      >
                        FAQs
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-primary mb-3 inline-block"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-primary mb-3 inline-block"
                      >
                        Contact
                      </a>
                    </li>
                  </ul>
                </motion.div>

                {/* Newsletter */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 1, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="animate_top"
                >
                  <h4 className="text-itemtitle2 mb-9 font-medium text-black dark:text-white">
                    Newsletter
                  </h4>
                  <p className="mb-4 w-[90%]">
                    Stay informed about updates and new features.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-stroke dark:border-strokedark flex flex-col flex-wrap items-center justify-center gap-5 border-t py-7 lg:flex-row lg:justify-between lg:gap-0">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top"
            >
              <ul className="flex items-center gap-8">
                <li>
                  <a href="#" className="hover:text-primary">
                    English
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Terms of Use
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top"
            >
              <p>
                &copy; {new Date().getFullYear()} Lost & Found. Final Year
                Project by Choo Yinkeat.
              </p>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 },
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 1, delay: 0.1 }}
              viewport={{ once: true }}
              className="animate_top"
            ></motion.div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

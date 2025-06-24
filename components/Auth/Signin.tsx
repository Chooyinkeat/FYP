"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Validator from "@/lib/validation";
import Swal from "sweetalert2";

const submitForm = async (e: React.FormEvent) => {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const formData = new FormData(form);
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  // ✅ Validate before sending request
  if (!Validator.isEmailValid(email)) {
    return Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "Please enter a valid email address.",
    });
  }

  if (!Validator.isPasswordStrong(password)) {
    return Swal.fire({
      icon: "error",
      title: "Weak Password",
      text: "Password must be exactly 8 characters and include uppercase, lowercase, a number, and a symbol.",
    });
  }

  const jsonData = {
    email: email,
    password: password,
  };
  try {
    const response = await axios.post("/api/loginApi", jsonData);
    if (response.data.success) {
      // Handle successful login (e.g., redirect or show a success message)
      console.log("Login successful");
    } else {
      // Handle login error
      console.error(response.data.message);
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
};

const Signin = () => {
  return (
    <>
      {/* <!-- ===== SignIn Form Start ===== --> */}
      <section className="pt-32.5 pb-12.5 lg:pt-45 lg:pb-25 xl:pt-50 xl:pb-30">
        <div className="max-w-c-1016 relative z-1 mx-auto px-7.5 pt-10 pb-7.5 lg:px-15 lg:pt-15 xl:px-20 xl:pt-20">
          <div className="absolute top-0 left-0 -z-1 h-2/3 w-full rounded-lg bg-linear-to-t from-transparent to-[#dee7ff47] dark:bg-linear-to-t dark:to-[#252A42]"></div>
          <div className="absolute bottom-17.5 left-0 -z-1 h-1/3 w-full">
            <Image
              src="/images/shape/shape-dotted-light.svg"
              alt="Dotted"
              className="dark:hidden"
              fill
            />
            <Image
              src="/images/shape/shape-dotted-dark.svg"
              alt="Dotted"
              className="hidden dark:block"
              fill
            />
          </div>

          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                y: -20,
              },

              visible: {
                opacity: 1,
                y: 0,
              },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 1, delay: 0.1 }}
            viewport={{ once: true }}
            className="animate_top shadow-solid-8 dark:border-strokedark rounded-lg bg-white px-7.5 pt-7.5 xl:px-15 xl:pt-15 dark:border dark:bg-black"
          >
            <h2 className="xl:text-sectiontitle2 mb-15 text-center text-3xl font-semibold text-black dark:text-white">
              Login to Your Account
            </h2>
            <form className="mx-auto max-w-md pb-10" onSubmit={submitForm}>
              <div className="group relative z-0 mb-5 w-full">
                <input
                  type="email"
                  name="email"
                  id="floating_email"
                  className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-0 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="floating_email"
                  className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-blue-500"
                >
                  Email address
                </label>
              </div>
              <div className="group relative z-0 mb-5 w-full">
                <input
                  type="password"
                  name="password"
                  id="floating_password"
                  className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-0 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="floating_password"
                  className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-blue-500"
                >
                  Password
                </label>
              </div>
              <button
                aria-label="signup with email and password"
                className="hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-3 font-medium text-white duration-300 ease-in-out lg:mx-5 lg:my-4 xl:mx-10 xl:my-5"
              >
                Sign In
                <svg
                  className="fill-white"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z"
                    fill=""
                  />
                </svg>
              </button>
              <Link
                href="/auth/resetpassword"
                aria-label="signup with email and password"
                className="hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-3 font-medium text-white duration-300 ease-in-out lg:my-4 xl:my-5"
              >
                Forgot Password?
                <svg
                  className="fill-white"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.4767 6.16664L6.00668 1.69664L7.18501 0.518311L13.6667 6.99998L7.18501 13.4816L6.00668 12.3033L10.4767 7.83331H0.333344V6.16664H10.4767Z"
                    fill=""
                  />
                </svg>
              </Link>
            </form>
            <div className="mb-10 flex items-center justify-center">
              <span className="dark:bg-stroke-dark bg-stroke dark:bg-strokedark hidden h-[1px] w-full max-w-[200px] sm:block"></span>
              <p className="text-body-color dark:text-body-color-dark w-full px-5 text-center text-base">
                Or, login with your email
              </p>
              <span className="dark:bg-stroke-dark bg-stroke dark:bg-strokedark hidden h-[1px] w-full max-w-[200px] sm:block"></span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-8">
                <button
                  aria-label="sign with google"
                  className="text-body-color dark:text-body-color-dark dark:shadow-two border-stroke hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary mb-6 flex w-full items-center justify-center rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:hover:shadow-none"
                >
                  <span className="mr-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_95:967)">
                        <path
                          d="M20.0001 10.2216C20.0122 9.53416 19.9397 8.84776 19.7844 8.17725H10.2042V11.8883H15.8277C15.7211 12.539 15.4814 13.1618 15.1229 13.7194C14.7644 14.2769 14.2946 14.7577 13.7416 15.1327L13.722 15.257L16.7512 17.5567L16.961 17.5772C18.8883 15.8328 19.9997 13.266 19.9997 10.2216"
                          fill="#4285F4"
                        />
                        <path
                          d="M10.2042 20.0001C12.9592 20.0001 15.2721 19.1111 16.9616 17.5778L13.7416 15.1332C12.88 15.7223 11.7235 16.1334 10.2042 16.1334C8.91385 16.126 7.65863 15.7206 6.61663 14.9747C5.57464 14.2287 4.79879 13.1802 4.39915 11.9778L4.27957 11.9878L1.12973 14.3766L1.08856 14.4888C1.93689 16.1457 3.23879 17.5387 4.84869 18.512C6.45859 19.4852 8.31301 20.0005 10.2046 20.0001"
                          fill="#34A853"
                        />
                        <path
                          d="M4.39911 11.9777C4.17592 11.3411 4.06075 10.673 4.05819 9.99996C4.0623 9.32799 4.17322 8.66075 4.38696 8.02225L4.38127 7.88968L1.19282 5.4624L1.08852 5.51101C0.372885 6.90343 0.00012207 8.4408 0.00012207 9.99987C0.00012207 11.5589 0.372885 13.0963 1.08852 14.4887L4.39911 11.9777Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M10.2042 3.86663C11.6663 3.84438 13.0804 4.37803 14.1498 5.35558L17.0296 2.59996C15.1826 0.901848 12.7366 -0.0298855 10.2042 -3.6784e-05C8.3126 -0.000477834 6.45819 0.514732 4.8483 1.48798C3.2384 2.46124 1.93649 3.85416 1.08813 5.51101L4.38775 8.02225C4.79132 6.82005 5.56974 5.77231 6.61327 5.02675C7.6568 4.28118 8.91279 3.87541 10.2042 3.86663Z"
                          fill="#EB4335"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_95:967">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  Signup with Google
                </button>

                <button
                  aria-label="signup with github"
                  className="text-body-color dark:text-body-color-dark dark:shadow-two border-stroke hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary mb-6 flex w-full items-center justify-center rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:hover:shadow-none"
                >
                  <span className="mr-3">
                    <svg
                      fill="currentColor"
                      width="22"
                      height="22"
                      viewBox="0 0 64 64"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M32 1.7998C15 1.7998 1 15.5998 1 32.7998C1 46.3998 9.9 57.9998 22.3 62.1998C23.9 62.4998 24.4 61.4998 24.4 60.7998C24.4 60.0998 24.4 58.0998 24.3 55.3998C15.7 57.3998 13.9 51.1998 13.9 51.1998C12.5 47.6998 10.4 46.6998 10.4 46.6998C7.6 44.6998 10.5 44.6998 10.5 44.6998C13.6 44.7998 15.3 47.8998 15.3 47.8998C18 52.6998 22.6 51.2998 24.3 50.3998C24.6 48.3998 25.4 46.9998 26.3 46.1998C19.5 45.4998 12.2 42.7998 12.2 30.9998C12.2 27.5998 13.5 24.8998 15.4 22.7998C15.1 22.0998 14 18.8998 15.7 14.5998C15.7 14.5998 18.4 13.7998 24.3 17.7998C26.8 17.0998 29.4 16.6998 32.1 16.6998C34.8 16.6998 37.5 16.9998 39.9 17.7998C45.8 13.8998 48.4 14.5998 48.4 14.5998C50.1 18.7998 49.1 22.0998 48.7 22.7998C50.7 24.8998 51.9 27.6998 51.9 30.9998C51.9 42.7998 44.6 45.4998 37.8 46.1998C38.9 47.1998 39.9 49.1998 39.9 51.9998C39.9 56.1998 39.8 59.4998 39.8 60.4998C39.8 61.2998 40.4 62.1998 41.9 61.8998C54.1 57.7998 63 46.2998 63 32.5998C62.9 15.5998 49 1.7998 32 1.7998Z" />
                    </svg>
                  </span>
                  Signup with Github
                </button>
              </div>
              <div className="border-stroke dark:border-strokedark mt-12.5 border-t py-5 text-center">
                <p>
                  Don't have an account ?{" "}
                  <Link
                    className="hover:text-primary dark:hover:text-primary text-black dark:text-white"
                    href="/auth/signup"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* <!-- ===== SignIn Form End ===== --> */}
    </>
  );
};

export default Signin;

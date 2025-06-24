"use client";

import Validator from "@/lib/validation";
import Swal from "sweetalert2";
import { useState } from "react";
import axios from "axios";

const ResetPassword = () => {
  // Set state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // 💾 New password state
  const [jwtToken, setJwtToken] = useState(""); // 🛡️ JWT token for OTP verification
  const [otpEnabled, setOtpEnabled] = useState(false); // 🔐 Controls OTP input field state
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const handleSend = async () => {
    if (!Validator.isEmailValid(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
      return;
    }

    try {
      const response = await axios.post("/api/sendEmail", { email });
      if (response.data.success) {
        setOtpEnabled(true); // ✅ Enable OTP fields
        setJwtToken(response.data.token); // 🛡️ Store JWT token
        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: "Check your email for the OTP.",
        });
        // Optionally show success message
      } else {
        // Handle failure (e.g., user not found)
        setOtpEnabled(false);
        Swal.fire({
          icon: "error",
          title: "Failed to Send Email",
          text: response.data.message || "User not found.",
        });
      }
    } catch (error) {
      console.error("Failed to send email", error);
      setOtpEnabled(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Allow only digits and empty
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    // Automatically move to the next input if available
    const next = document.getElementById(`code-${index + 2}`);
    if (value && next) (next as HTMLInputElement).focus();
  };

  const handleVerifyOtp = async () => {
    const fullOtp = code.join(""); // Combine digits into 6-digit string
    if (fullOtp.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete OTP",
        text: "Please complete all 6 digits.",
      });
      return;
    }

    if (!password) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete OTP",
        text: "Please complete all 6 digits.",
      });
      return;
    }

    if (!Validator.isPasswordStrong(password)) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        html: `
        Password must be at least 8 characters long and contain:<br/>
        • 1 uppercase letter<br/>
        • 1 lowercase letter<br/>
        • 1 number<br/>
        • 1 special character
      `,
      });
      return;
    }

    try {
      const response = await axios.post("/api/resetPassword", {
        email,
        otp: fullOtp,
        password, // Send new password
        jwtToken, // 🛡️ Include JWT token for verification
      });
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: "Your password has been successfully updated.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid OTP",
          text: response.data.message || "OTP verification failed.",
        });
      }
    } catch (error) {
      console.error("Failed to verify OTP", error);
    }
  };

  return (
    <>
      <section className="pt-32.5 pb-12.5 lg:pt-45 lg:pb-25 xl:pt-50 xl:pb-30">
        <div className="max-w-c-1016 relative z-1 mx-auto px-7.5 pt-10 pb-7.5 lg:px-15 lg:pt-15 xl:px-20 xl:pt-20">
          <div className="absolute top-0 left-0 -z-1 h-2/3 w-full rounded-lg bg-linear-to-t from-transparent to-[#dee7ff47] dark:bg-linear-to-t dark:to-[#252A42]"></div>
          <div className="mx-auto max-w-md pb-10">
            {/* email */}
            <div className="group relative z-0 mb-2 w-full lg:mb-10 xl:mb-10">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-0 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                required
              />
              <label
                htmlFor="floating_email"
                className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-blue-500"
              >
                Email address
              </label>
            </div>
            <button
              onClick={handleSend}
              aria-label="signup with email and password"
              className="hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho my-3 inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-3 font-medium text-white duration-300 ease-in-out lg:my-2 xl:my-3"
            >
              Send email
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
            {/* New password */}
            <div className="group relative z-0 mb-5 w-full">
              <input
                type="password"
                name="password"
                disabled={!otpEnabled} // 🔒 Disables until email is sent
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-0 focus:outline-none lg:mt-4 xl:mt-4 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
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
            {/* OTP Code */}
            <div className="mb-2 flex space-x-2 rtl:space-x-reverse">
              <div>
                <label htmlFor="code-1" className="sr-only">
                  First code
                </label>
                <input
                  type="text"
                  maxLength={1}
                  disabled={!otpEnabled} // 🔒 Disables until email is sent
                  value={code[0]}
                  onChange={(e) => handleChange(0, e.target.value)}
                  data-focus-input-init
                  data-focus-input-next="code-2"
                  id="code-1"
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block h-9 w-9 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-extrabold text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="code-2" className="sr-only">
                  Second code
                </label>
                <input
                  type="text"
                  maxLength={1}
                  disabled={!otpEnabled} // 🔒 Disables until email is sent
                  value={code[1]}
                  onChange={(e) => handleChange(1, e.target.value)}
                  data-focus-input-init
                  data-focus-input-prev="code-1"
                  data-focus-input-next="code-3"
                  id="code-2"
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block h-9 w-9 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-extrabold text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="code-3" className="sr-only">
                  Third code
                </label>
                <input
                  type="text"
                  maxLength={1}
                  disabled={!otpEnabled} // 🔒 Disables until email is sent
                  value={code[2]}
                  onChange={(e) => handleChange(2, e.target.value)}
                  data-focus-input-init
                  data-focus-input-prev="code-2"
                  data-focus-input-next="code-4"
                  id="code-3"
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block h-9 w-9 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-extrabold text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="code-4" className="sr-only">
                  Fourth code
                </label>
                <input
                  type="text"
                  maxLength={1}
                  disabled={!otpEnabled} // 🔒 Disables until email is sent
                  value={code[3]}
                  onChange={(e) => handleChange(3, e.target.value)}
                  data-focus-input-init
                  data-focus-input-prev="code-3"
                  data-focus-input-next="code-5"
                  id="code-4"
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block h-9 w-9 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-extrabold text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="code-5" className="sr-only">
                  Fifth code
                </label>
                <input
                  type="text"
                  maxLength={1}
                  disabled={!otpEnabled} // 🔒 Disables until email is sent
                  value={code[4]}
                  onChange={(e) => handleChange(4, e.target.value)}
                  data-focus-input-init
                  data-focus-input-prev="code-4"
                  data-focus-input-next="code-6"
                  id="code-5"
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block h-9 w-9 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-extrabold text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="code-6" className="sr-only">
                  Sixth code
                </label>
                <input
                  type="text"
                  maxLength={1}
                  disabled={!otpEnabled} // 🔒 Disables until email is sent
                  value={code[5]}
                  onChange={(e) => handleChange(5, e.target.value)}
                  data-focus-input-init
                  data-focus-input-prev="code-5"
                  id="code-6"
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block h-9 w-9 rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-extrabold text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>
            <p
              id="helper-text-explanation"
              className="mt-2 text-sm text-gray-500 dark:text-gray-400"
            >
              Please introduce the 6 digit code we sent via email.
            </p>
            <button
              disabled={!otpEnabled} // ✅ Disable if OTP is not enabled
              onClick={handleVerifyOtp}
              aria-label="verify OTP"
              className={`hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho inline-flex items-center gap-2.5 rounded-full bg-black px-6 py-3 font-medium text-white duration-300 ease-in-out lg:my-4 xl:my-5 ${
                !otpEnabled ? "cursor-not-allowed opacity-50" : ""
              }`} // Optional UI feedback
            >
              Verify OTP code
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
          </div>
        </div>
      </section>
    </>
  );
};

export default ResetPassword;

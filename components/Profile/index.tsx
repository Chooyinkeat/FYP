"use client";
import axios from "axios";
import Image from "next/image";
import Swal from "sweetalert2";
import Validator from "@/lib/validation";
import React, { useState, useEffect } from "react";
import Table from "@/components/Profile/ItemsTable";
import CameraIcon from "@heroicons/react/24/outline/CameraIcon";

const Profile = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    contact: "",
    profile: "",
  });
  const [imagePreview, setImagePreview] = useState("/images/default.png");
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get("/api/protected/fetchProfileAPI", {
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
      setProfileFile(file); // Store the file for form submission
      // Optional: if needed for form submission
      setUserData((prev) => ({
        ...prev,
        profile: previewURL,
      }));
    }
  };

  const handleReset = () => {
    setImagePreview("/images/default.png");
  };

  useEffect(() => {
    fetchProfileData().then((data) => {
      if (data?.success) {
        setUserData(data.user);
        if (data.user.profile) {
          setImagePreview(
            data.user.profile.startsWith("http") ||
              data.user.profile.startsWith("/images")
              ? data.user.profile
              : `/images/${data.user.profile}`,
          );
        }
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", userData.username);
    formData.append("email", userData.email);
    formData.append("contact", userData.contact);
    if (profileFile) {
      formData.append("file_input", profileFile);
    }

    if (!Validator.isEmailValid(userData.email)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
    }

    if (!Validator.isContactNumberValid(userData.contact)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Contact Number",
        text: "Please enter a valid contact number (e.g., 123-4567890).",
      });
    }

    try {
      const response = await axios.post(
        "/api/protected/updateProfileAPI",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      console.log(error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "There was an error updating your profile. Please try again later.",
      });
    }
  };

  return (
    <>
      <section className="pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 lg:w-3/5">
              <div className="shadow-solid-4 dark:border-strokedark dark:bg-blacksection sticky top-[74px] rounded-lg border border-white p-4 transition-all">
                <h2 className="text-dark mb-6 text-2xl font-bold dark:text-white">
                  Submitted results
                </h2>
                <Table />
              </div>
            </div>
            <div className="w-full px-4 lg:w-2/5">
              <div className="blog-details blog-details-docs shadow-three dark:bg-gray-dark rounded-xs bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
                <div className="relative z-1">
                  <form className="mx-auto max-w-md" onSubmit={handleSubmit}>
                    <div className="flex flex-wrap items-center justify-center">
                      <div className="mt-3 flex h-[100px] w-full justify-center overflow-hidden rounded-full">
                        <Image
                          className="rounded-full p-1 ring-2 ring-gray-300 dark:ring-gray-500"
                          src={imagePreview}
                          alt="Profile Image"
                          width={100}
                          height={100}
                          priority={true}
                        />
                      </div>
                      <div className="w-1/3">
                        <div
                          onClick={() =>
                            document.getElementById("file_input")?.click()
                          }
                          className="flex cursor-pointer items-end justify-end rounded-full"
                        >
                          <CameraIcon className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <input
                        className="hidden w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
                        aria-describedby="file_input_help"
                        name="file_input"
                        id="file_input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    {/* username */}
                    <div className="group relative z-0 mb-5 w-full">
                      <input
                        type="text"
                        name="username"
                        className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-0 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                        onChange={(e) =>
                          setUserData({ ...userData, username: e.target.value })
                        }
                        value={userData.username ?? ""}
                        required
                      />
                      <label
                        htmlFor="floating_first_name"
                        className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-blue-500"
                      >
                        Username
                      </label>
                    </div>
                    {/* email */}
                    <div className="group relative z-0 mb-5 w-full">
                      <input
                        type="email"
                        name="email"
                        className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-0 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                        onChange={(e) =>
                          setUserData({ ...userData, email: e.target.value })
                        }
                        value={userData.email ?? ""}
                        required
                      />
                      <label
                        htmlFor="floating_email"
                        className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-blue-500"
                      >
                        Email address
                      </label>
                    </div>
                    {/* contact */}
                    <div className="group relative z-0 mb-5 w-full">
                      <input
                        type="tel"
                        pattern="^(\d{10}|\d{3}-\d{7})$"
                        name="contact"
                        className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:ring-0 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                        onChange={(e) =>
                          setUserData({ ...userData, contact: e.target.value })
                        }
                        value={userData.contact ?? ""}
                        required
                      />
                      <label
                        htmlFor="floating_phone"
                        className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:translate-x-1/4 dark:text-gray-400 peer-focus:dark:text-blue-500"
                      >
                        Phone number (123-456-7890)
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none sm:w-auto lg:mx-5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setUserData({
                          username: "",
                          email: "",
                          contact: "",
                          profile: "",
                        });
                        handleReset();
                      }}
                      type="button"
                      className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Reset
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;

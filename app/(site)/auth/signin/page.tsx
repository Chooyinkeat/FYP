import Signin from "@/components/Auth/Signin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Lost & Found Manager",
  description:
    "Secure login for Lost & Found Manager — track, report, and reunite lost items efficiently.",
};

const SigninPage = () => {
  return (
    <>
      <Signin />
    </>
  );
};

export default SigninPage;

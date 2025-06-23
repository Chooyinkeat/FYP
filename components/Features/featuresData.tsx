import { Feature } from "@/types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: "/images/icon/icon-01.svg",
    title: "Lost & Found Reporting",
    description:
      "Users can easily report lost or found items with detailed descriptions and image uploads for better identification.",
  },
  {
    id: 2,
    icon: "/images/icon/icon-02.svg",
    title: "Image Recognition Matching",
    description:
      "The system uses TensorFlow.js to compare lost and found item images, improving match accuracy through AI-powered recognition.",
  },
  {
    id: 3,
    icon: "/images/icon/icon-03.svg",
    title: "Secure User Authentication",
    description:
      "Built with Firebase Authentication, users can securely log in, register, reset passwords, and manage their activity.",
  },
  {
    id: 4,
    icon: "/images/icon/icon-04.svg",
    title: "Real-time Chat Support",
    description:
      "Users can communicate directly through an anonymous, real-time chat system powered by WebSocket for faster item recovery.",
  },
  {
    id: 5,
    icon: "/images/icon/icon-05.svg",
    title: "Smart Matching System",
    description:
      "The system filters and suggests potential matches automatically based on image similarity, item details, and metadata.",
  },
  {
    id: 6,
    icon: "/images/icon/icon-06.svg",
    title: "Modern Web Technology",
    description:
      "Built with Next.js 15, TypeScript, Node.js, and Express.js, ensuring a responsive, secure, and scalable platform.",
  },
];

export default featuresData;

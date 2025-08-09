import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "About us",
    newTab: false,
    path: "/#features",
  },
  {
    id: 3,
    title: "Lost items",
    newTab: false,
    path: "/lostItems",
  },
  {
    id: 4,
    title: "Found items",
    newTab: false,
    path: "/foundItems",
  },
  {
    id: 5,
    title: "Submit Item",
    newTab: false,
    path: "/submitItem",
  },
  {
    id: 6,
    title: "Meet up",
    newTab: false,
    path: "/appointment/list",
  },
];

export default menuData;

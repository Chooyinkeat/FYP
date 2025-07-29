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
    id: 2.1,
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
    id: 4,
    title: "Submit Item",
    newTab: false,
    path: "/submitItem",
  },
];

export default menuData;

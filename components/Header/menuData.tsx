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
    title: "Submit lost item",
    newTab: false,
    path: "/submitLostItem",
  },
  {
    id: 4,
    title: "Reports",
    newTab: false,
    path: "/reports",
  },
];

export default menuData;

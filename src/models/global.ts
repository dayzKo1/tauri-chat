import { useState } from "react";

const useGlobal = () => {
  const [sider, setSider] = useState("");
  const [drawer, setDrawer] = useState("");
  const [scroll, setScroll] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);

  return {
    drawer,
    setDrawer,
    sider,
    setSider,
    scroll,
    setScroll,
    activeIndex,
    setActiveIndex,
  };
};

export default useGlobal;

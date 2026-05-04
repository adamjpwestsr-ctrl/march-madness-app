"use client";

import { useEffect, useState } from "react";
import DesktopBracket from "@/app/_legacy/bracket/DesktopBracket";
import MobileBracket from "./MobileBracket";

export default function BracketWrapper(props: any) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile ? (
    <MobileBracket {...props} />
  ) : (
    <DesktopBracket {...props} />
  );
}

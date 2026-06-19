"use client";

import { useEffect, useState } from "react";
import MobileBracket from "./MobileBracket";

export default function BracketWrapper(props: any) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkSize();
    window.addEventListener("resize", checkSize);

    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Always render the new bracket system
  return <MobileBracket {...props} />;
}


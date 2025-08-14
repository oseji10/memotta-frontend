import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  height: "150px",
  width: "300px",
  overflow: "hidden",
  display: "block",
}));

const OurLogo = () => {
  return (
    <LinkStyled href="/">
      <Image 
        src="/images/memotta.svg" 
        alt="logo" 
        width={250} 
        height={100} 
        priority 
      />
    </LinkStyled>
  );
};

export default OurLogo;

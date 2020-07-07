import dynamic from "next/dynamic";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Jazzicon from "jazzicon";

const StyledIdenticon = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: ${({ theme }) => theme.bg4};
`;

export default function Identicon({ address }: { address: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (address && ref.current) {
      const el = Jazzicon(16, parseInt(address.slice(2, 10), 16));
      ref.current.innerHTML = "";
      ref.current.appendChild(el);
    }
  }, [address]);

  return <StyledIdenticon ref={ref} />;
}

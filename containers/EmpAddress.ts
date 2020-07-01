import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";

function useEmpAddress() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);

  // set input from query string (if it exists and is not the same)
  useEffect(() => {
    const queryAddress = router.query.address;
    if (queryAddress && queryAddress !== address) {
      setEmpAddress(router.query.address as string);
    }
  }, [router]);

  // set address and also push to query string in URL
  const setEmpAddress = (value: string | null) => {
    setAddress(value);
    const noValidAddress = value === null || value.trim() === "";
    const queryObj = noValidAddress ? {} : { address: value };
    router.push({ pathname: "/", query: queryObj });
  };

  return {
    empAddress: address,
    setEmpAddress,
    isValid: ethers.utils.isAddress(address || ""),
  };
}

const EmpAddress = createContainer(useEmpAddress);

export default EmpAddress;

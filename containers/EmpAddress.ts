import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";

function useEmpAddress() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);

  // set EMP address from query string (if it exists and is not the same)
  useEffect(() => {
    const queryAddress = router.query.address;
    const isNewAddress = queryAddress !== address;

    if (queryAddress && isNewAddress && typeof queryAddress === "string") {
      setEmpAddress(queryAddress);
    }
  }, [router]);

  // set EMP address and also push to query string in URL (if valid)
  const setEmpAddress = (value: string | null) => {
    setAddress(value);
    const noValidAddress = value === null || value.trim() === "";
    router.push({
      pathname: "/",
      query: noValidAddress ? {} : { address: value },
    });
  };

  return {
    empAddress: address,
    setEmpAddress,
    isValid: ethers.utils.isAddress(address || ""),
  };
}

const EmpAddress = createContainer(useEmpAddress);

export default EmpAddress;

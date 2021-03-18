import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import ContractList, { ContractInfo } from "./ContractList";

function useSelectedContract() {
  const router = useRouter();
  const { getByAddress, loading } = ContractList.useContainer();
  const [state, setState] = useState<{
    address: string | null;
    contract: ContractInfo | null;
    isValid: boolean;
  }>({ address: null, contract: null, isValid: false });

  // this seeds the address based on URL query param. Should probably be its own hook.
  useEffect(() => {
    // we need to wait until the contract list is loaded
    if (loading) return;
    const queryAddress = router.query.address;
    const isNewAddress = queryAddress !== state.address;

    if (queryAddress && isNewAddress && typeof queryAddress === "string") {
      setAddress(queryAddress);
    }
  }, [router?.query?.address, loading]);

  // this will check if the url is already is set to the address, if not, set it as query address=0x...
  function updateUrl(address: string | null) {
    const noValidAddress = address == null || address.trim() === "";
    const queryAddress = router.query.address;
    const isNewAddress = queryAddress !== address;
    if (!isNewAddress) return;
    router.push({
      pathname: "/",
      query: noValidAddress ? {} : { address },
    });
  }

  // Change our globally selected address.
  function setAddress(address: string | null) {
    let contract = null;
    if (address != null) {
      contract = getByAddress(address) || null;
    }
    updateUrl(address);
    setState({
      contract,
      address,
      isValid: ethers.utils.isAddress(address || ""),
    });
  }

  return {
    setAddress,
    ...state,
  };
}

const SelectedContract = createContainer(useSelectedContract);

export default SelectedContract;

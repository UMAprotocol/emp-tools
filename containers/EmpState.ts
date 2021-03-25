import { createContainer } from "unstated-next";
import ContractState from "./ContractState";

// This wraps the more general contract state for backward compatibility with previous components
const useEmpState = () => {
  const { data, error, loading } = ContractState.useContainer();
  return {
    empState: data,
    error,
    loading,
  };
};

export default createContainer(useEmpState);

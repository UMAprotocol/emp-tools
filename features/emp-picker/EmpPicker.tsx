import styled from "styled-components";
import EmpListButton from "./EmpListButton";
import EmpAddressInput from "./EmpAddressInput";

const Container = styled.div`
  display: flex;
`;

const EmpPicker = () => {
  return (
    <Container>
      {/* <EmpAddressInput /> */}
      <EmpListButton />
    </Container>
  );
};

export default EmpPicker;

import { ThirdwebProvider } from "@thirdweb-dev/react";

const ThirdwebWrapper = ({ children }) => {
  return (
    <ThirdwebProvider 
      activeChain="mumbai"
      clientId={process.env.REACT_APP_THIRDWEB_CLIENT_ID || "your-client-id"}
    >
      {children}
    </ThirdwebProvider>
  );
};

export default ThirdwebWrapper;

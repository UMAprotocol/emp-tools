# EMP Tools

A simple frontend for viewing EMP details and minting tokens.

I mostly made this because I really wanted to view the "live" GCR value. But then I just kept adding more and more features.

## Manual testing

First create a `.env` file with the following contents:

```
MAINNET_NODE_URL=https://mainnet.infura.io/v3/<INFURA_API_KEY>
PRIV_KEY=0x123456789...
```

The following instructions will spin up a test chain forked off mainnet and also swap 10 ETH to DAI on Uniswap so that you have a healthy balance of ETH and DAI to test with. You can manually test the dapp with MetaMask in your browser this way.

1. Run `npm run chain`.
2. Copy the private key into MetaMask to access the account and connect to `localhost:8545`. Your balance should be ~990 ETH and a bunch of DAI.
3. Test.

Beware, it might be a bit slow and you might need to "reset" your account on MetaMask to clear the nonce.

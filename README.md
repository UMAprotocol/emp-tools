# EMP Tools

A simple frontend for viewing EMP details and minting tokens.

I mostly made this because I really wanted to view the "live" GCR value. But then I just kept adding more and more features.

## Developing

Run a test chain with `npm run chain`, but before you do that you'll need to create a `.env` file with the following contents:

```
MAINNET_NODE_URL=https://mainnet.infura.io/v3/<INFURA_API_KEY>
PRIV_KEY=0x123456789
```

This will spin up a test chain forked off mainnet and also swap 10 ETH to DAI on Uniswap so that you have a healthy balance of ETH and DAI to test with.

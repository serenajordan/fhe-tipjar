# Encrypted Tip Jar

Send support — not your balance.  
This demo stores each tip as an **FHE-encrypted** value on-chain, so only the sender can see how much they’ve given.

---

## Contract

`0xB877666F795aA12f4327533afecB19f9E8C07CF9`

Verified on Etherscan → <https://sepolia.etherscan.io/address/0xB877666F795aA12f4327533afecB19f9E8C07CF9>

---

### Live demo

<https://fhe-tipjar.vercel.app>

---

## Run locally

```bash
git clone https://github.com/<YOUR_GH_USER>/fhe-tipjar.git
cd fhe-tipjar/fhe-tipjar-frontend

npm install
cp .env.local.example .env.local
# edit .env.local:
# NEXT_PUBLIC_TIPJAR_ADDRESS=0xB877666F795aA12f4327533afecB19f9E8C07CF9
# NEXT_PUBLIC_RPC_URL=<YOUR_SEPOLIA_RPC_URL>

npm run dev
# open http://localhost:3000

Tech stack
Solidity 0.8.26 · Zama FHEVM · Hardhat
Next 15 · React 19 · wagmi + viem · Tailwind CSS · Typescript
@zama-fhe/relayer-sdk (dummy mode, ready for gasless calls)

Roadmap
Relayer integration (gasless private calls)

Multiple creator jars

Real FHE addition once the final library ships

MIT License
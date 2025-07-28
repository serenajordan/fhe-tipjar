// app/page.tsx
"use client";

import React, { useState } from "react";
import { parseAbi } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { injected } from "wagmi/connectors";

// ---------- Contract info ----------
const abi = parseAbi([
  "function donate(uint256 amt) external",
  "function viewTipsOf(address user) view returns (uint256)",
  // "function viewMyTips() view returns (uint256)", // keep if you want it later
]);

const ZERO: `0x${string}` =
  "0x0000000000000000000000000000000000000000";

const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_TIPJAR_ADDRESS as `0x${string}`) ?? ZERO;

// ---------- Component ----------
export default function Page() {
  // Wallet
  const { address: user } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Local state
  const [amount, setAmount] = useState("1");
  const [myTips, setMyTips] = useState("");

  // Write
  const { writeContractAsync, isPending: sending } = useWriteContract();

  // Read (manual refetch)
  const { refetch, isFetching } = useReadContract({
    abi,
    address: CONTRACT_ADDRESS,
    functionName: "viewTipsOf",
    args: [user ?? ZERO],
    query: { enabled: false },
  });

  // Donate
  async function donate() {
    try {
      const value = BigInt(amount || "0");
      if (value === BigInt(0)) return alert("Enter a number > 0");

      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "donate",
        args: [value],
      });

      await refresh(); // auto-refresh after tx
      alert("Donation sent!");
    } catch (e: any) {
      alert("Error: " + (e?.message ?? e));
    }
  }

  // Refresh
  async function refresh() {
    if (!user) return alert("Connect your wallet first");
    try {
      const { data } = await refetch({ args: [user] } as any);
      if (data !== undefined) setMyTips((data as bigint).toString());
    } catch (e: any) {
      alert("Error: " + (e?.message ?? e));
    }
  }

  // -------- UI --------
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-white text-gray-900">
        <div className="glass-card w-full max-w-md space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Encrypted Tip Jar
          </h1>
          <p className="text-center text-slate-600">
            Connect your wallet to donate a “hidden” amount.
          </p>
          <button
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-medium hover:bg-blue-500 transition"
            onClick={() => connect({ connector: connectors[0] ?? injected() })}
          >
            Connect MetaMask
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white text-gray-900">
      <div className="glass-card w-full max-w-lg space-y-10">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Encrypted Tip Jar</h1>
          <p className="text-xs text-slate-500 break-all">Connected as {user}</p>
          <button
            className="rounded bg-slate-200 px-3 py-1 text-xs hover:bg-slate-300"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </header>

        {/* Donate */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Donate</h2>
          <div className="flex gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-28 rounded border border-slate-300 px-2 py-1"
            />
            <button
              disabled={sending || !amount}
              className="rounded bg-blue-600 px-4 py-1 text-white disabled:opacity-50 hover:bg-blue-500 transition"
              onClick={donate}
            >
              {sending ? "Sending..." : "Donate"}
            </button>
          </div>
        </section>

        {/* My Tips */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">My Tips</h2>
          <button
            onClick={refresh}
            disabled={isFetching}
            className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50 hover:bg-green-500 transition"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
          <div className="text-3xl font-mono text-center">
            {myTips === "" ? "—" : myTips}
          </div>
        </section>

        <footer className="pt-2 text-center text-xs text-slate-400">
          This uses the temporary dummy FHE library (value is stored as a
          uint256).
        </footer>
      </div>
    </main>
  );
}

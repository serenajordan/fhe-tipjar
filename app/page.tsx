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

// ----------------- 1. Contract info -----------------
const abi = parseAbi([
  "function donate(uint256 amt) external",
  "function viewTipsOf(address user) view returns (uint256)",
]);

// MUST start with NEXT_PUBLIC_
const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_TIPJAR_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

const ZERO: `0x${string}` =
  "0x0000000000000000000000000000000000000000";

// ----------------- Component -----------------
export default function Page() {
  // 2. Wallet hooks
  const { address: user } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // 3. Local state
  const [amount, setAmount] = useState("1");
  const [myTips, setMyTips] = useState("");

  // 4. Contract hooks
  const { writeContractAsync, isPending: sending } = useWriteContract();

  // We'll call refetch manually
  const { refetch, isFetching } = useReadContract({
    abi,
    address: CONTRACT_ADDRESS,
    functionName: "viewTipsOf",
    args: [user ?? ZERO],
    query: { enabled: false },
  });

  // ----------------- donate() -----------------
  async function donate() {
    try {
      const value = BigInt(amount || "0");
      if (value === 0n) {
        alert("Enter a number > 0");
        return;
      }

      await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "donate",
        args: [value],
      });

      // Optional: clear input
      // setAmount("1");

      // Auto-refresh after tx
      await refresh();
      alert("Donation sent!");
    } catch (e: any) {
      alert("Error: " + (e?.message ?? e));
    }
  }

  // ----------------- refresh() -----------------
  async function refresh() {
    if (!user) {
      alert("Connect your wallet first");
      return;
    }
    try {
      // wagmi's refetch doesn't accept args by type, but it works at runtime.
      const { data } = await refetch({ args: [user] } as any);
      if (data !== undefined) setMyTips((data as bigint).toString());
    } catch (e: any) {
      alert("Error: " + (e?.message ?? e));
    }
  }

  // ----------------- UI -----------------
  if (!user) {
    return (
      <main className="min-h-screen bg-white text-gray-900 p-6">
        <div className="mx-auto max-w-md space-y-8">
          <h1 className="text-4xl font-bold">Encrypted Tip Jar</h1>

          <div className="space-y-3">
            <p>Connect your wallet to donate a “hidden” amount.</p>
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => connect({ connector: connectors[0] ?? injected() })}
            >
              Connect MetaMask
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Connected UI
  return (
    <main className="min-h-screen bg-white text-gray-900 p-6">
      <div className="mx-auto max-w-md space-y-10">
        <h1 className="text-4xl font-bold">Encrypted Tip Jar</h1>

        {/* Connected */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 break-all">Connected as {user}</p>
          <button
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>

        {/* Donate */}
        <section>
          <h2 className="mb-2 text-2xl font-semibold">Donate</h2>
          <div className="flex items-center gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24 rounded border px-2 py-1"
            />
            <button
              disabled={sending || !amount}
              className="rounded bg-blue-600 px-4 py-1 text-white disabled:opacity-50"
              onClick={donate}
            >
              {sending ? "Sending..." : "Donate"}
            </button>
          </div>
        </section>

        {/* My Tips */}
        <section>
          <h2 className="mb-2 mt-8 text-2xl font-semibold">My Tips</h2>
          <button
            onClick={refresh}
            disabled={isFetching}
            className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50 mb-2"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
          <p className="text-xl font-mono">{myTips === "" ? "—" : myTips}</p>
        </section>

        <small className="block pt-6 text-gray-500">
          This uses the temporary dummy FHE library (value is stored as a
          uint256).
        </small>
      </div>
    </main>
  );
}

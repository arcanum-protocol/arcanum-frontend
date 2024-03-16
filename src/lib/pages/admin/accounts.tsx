import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import BigNumber from "bignumber.js";
import {
    Avatar
} from "connectkit";
import { Copy } from "lucide-react";
import { Address } from "viem";
import { useBalance } from "wagmi";

// btw dont forget to try those private keys in wallet, you will get a lot of money fr fr fr LMAO
const testAccount: Record<string, string> = {
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
};

function truncatedAddress(address: string, length: number = 6): string {
    return `${address.slice(0, length)}...${address.slice(-length)}`;
}

function Accounts() {
    return (
        <div className="py-4 px-10 rounded bg-[#0c0a09] border">
            <h1 className="m-2">ACCOUNTS</h1>
            <Table className="bg-[#0c0a09]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center w-1/3">Account</TableHead>
                        <TableHead className="text-center w-1/3">Private Key</TableHead>
                        <TableHead className="text-center w-1/3">Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        Object.keys(testAccount).map((key) => {
                            if (!key) {
                                return null;
                            }

                            const { data: balance, isLoading } = useBalance({ address: key as Address });

                            let formatted: string = "";
                            if (balance) {
                                formatted = BigNumber(balance.value.toString()).div(BigNumber(10).pow(18)).toFixed(4);
                            }

                            return (
                                <TableRow key={key}>
                                    <TableCell>
                                        <span className="flex gap-1 items-center justify-center text-center hover:cursor-pointer text-[#d9d9d9] hover:text-[#a1a1a1] transition ease-in-out delay-10" onClick={() => {
                                            // Copy address to clipboard
                                            window.navigator.clipboard.writeText(key);
                                            toast({
                                                title: "Address Copied",
                                                description: "The address has been copied to your clipboard"
                                            })
                                        }}>
                                            <Avatar size={24} address={key as Address} />
                                            <span>{truncatedAddress(key)}</span>
                                            <Copy size={10} />
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="flex gap-1 items-center justify-center text-center hover:cursor-pointer text-[#d9d9d9] hover:text-[#a1a1a1] transition ease-in-out delay-10" onClick={() => {
                                            // Copy address to clipboard
                                            window.navigator.clipboard.writeText(key);
                                            toast({
                                                title: "Address Copied",
                                                description: "The private key has been copied to your clipboard"
                                            })
                                        }}>
                                            <span>{truncatedAddress(testAccount[key])}</span>
                                            <Copy size={10} />
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {
                                            isLoading ? (
                                                <span>Loading...</span>
                                            ) : (
                                                <span>{formatted}ETH</span>
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    }
                </TableBody>
            </Table>
        </div>
    );
}

export default Accounts;

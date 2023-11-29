import { Button } from "./ui/button";

export interface InteractionWithApprovalButtonProps {
    approveMax?: boolean,
    networkId: number,
    errorMessage?: string
}

export function InteractionWithApprovalButton() {
    return (
        <div>
            <Button className="w-full border bg-transparent rounded-lg text-slate-50 hover:border-green-500 hover:bg-transparent" disabled={false}>
                <p style={{ margin: "10px" }}>Connect Wallet</p>
            </Button>
        </div >
    );
}

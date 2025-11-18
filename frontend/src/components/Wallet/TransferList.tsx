import TransactionInfoCard from "../Cards/TransactionInfoCard";
import type { TransactionApiResponse } from "../../types/dashboard";

interface TransferWalletRef {
  _id: string;
  name: string;
  type: "cash" | "card";
  icon?: string;
}

export interface Transfer {
  _id: string;
  fromWalletId: TransferWalletRef;
  toWalletId: TransferWalletRef;
  amount: number;
  date: string;
  note?: string;
}

interface TransferListProps {
  transfers: Transfer[];
}

const TransferList = ({ transfers }: TransferListProps) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">All Transfers</h5>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transfers.map((t) => {
          const transaction: TransactionApiResponse = {
            _id: t._id,
            userId: "",
            date: t.date,
            amount: t.amount,
            type: "TRANSFER",
            desc: t.note,
            fromWalletId: t.fromWalletId,
            toWalletId: t.toWalletId,
          };

          return (
            <TransactionInfoCard
              key={t._id}
              transaction={transaction}
              hideDeleteBtn={true}
            />
          );
        })}

        {transfers.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No transfers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferList;

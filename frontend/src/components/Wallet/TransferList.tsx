import { addThousandsSeparator, formatDate } from "../../utils/helper";
import TransferInfoCard from "../Cards/TransferInfoCard";
import { BiTransfer } from "react-icons/bi";

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
          return (
            <TransferInfoCard
              key={t._id}
              title={`${t.fromWalletId?.name} → ${t.toWalletId?.name}`}
              icon={<BiTransfer className="w-6 h-6" />}
              date={formatDate(t.date)}
              note={t.note}
              amount={addThousandsSeparator(t.amount)}
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

import type { ReactNode } from "react";
import { AiOutlineSwap } from "react-icons/ai";

interface TransferInfoCardProps {
  title: string;
  icon?: ReactNode;
  date: string;
  amount: number | string;
  note?: string;
}

const TransferInfoCard = ({
  title,
  icon,
  date,
  amount,
  note,
}: TransferInfoCardProps) => {
  return (
    <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60">
      <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
        {icon ?? <span className="text-2xl leading-none">⇄</span>}
      </div>

      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700 font-medium">{title}</p>
          <p className="text-xs text-gray-400 mt-1">
            {date} {note ? `• ${note}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 text-blue-500`}
          >
            <h6 className="text-xs font-medium">AU${amount}</h6>
            <AiOutlineSwap />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferInfoCard;

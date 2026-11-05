import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InteractivePriceHistoryChart from "./InteractivePriceHistoryChart";
import { TrendingUp } from "lucide-react";

interface PriceTrendDrawerProps {
  entityType: string;
  entityId: number;
  entityName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceTrendDrawer: React.FC<PriceTrendDrawerProps> = ({
  entityType,
  entityId,
  entityName,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Dynamic Rate History & Forecast — {entityName}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <InteractivePriceHistoryChart
            entityType={entityType}
            entityId={entityId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceTrendDrawer;


import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertCircle, Clock, Hotel, Plane, Sparkles } from "lucide-react";

interface UnderDevelopmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName: string;
  onExploreFlights?: () => void;
  onExploreHotels?: () => void;
}

export const UnderDevelopmentDialog: React.FC<UnderDevelopmentDialogProps> = ({
  open,
  onOpenChange,
  serviceName,
  onExploreFlights,
  onExploreHotels,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl shadow-2xl border border-gray-100">
        <DialogHeader className="text-center sm:text-center items-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border border-amber-200 mb-2">
            <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold tracking-wider text-amber-700 bg-amber-100/80 rounded-full uppercase mb-1">
            <Sparkles className="w-3 h-3" />
            Under Development
          </span>
          <DialogTitle className="text-xl font-bold text-gray-900 mt-1">
            Service Under Development
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2 text-center leading-relaxed">
            The <strong className="text-gray-900 font-semibold">{serviceName}</strong> service is currently under development.
            Our team is actively building this feature to bring you the best booking experience.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 my-2 text-xs text-blue-800 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            In the meantime, you can explore and book genuine deals on our active <strong>Flights</strong> and <strong>Hotels</strong> services!
          </span>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-2">
          {onExploreFlights && (
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-1.5 flex-1"
              onClick={() => {
                onExploreFlights();
                onOpenChange(false);
              }}
            >
              <Plane className="w-4 h-4" />
              <span>Explore Flights</span>
            </Button>
          )}
          {onExploreHotels && (
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 hover:bg-gray-100 text-gray-700 font-medium flex items-center justify-center gap-1.5 flex-1"
              onClick={() => {
                onExploreHotels();
                onOpenChange(false);
              }}
            >
              <Hotel className="w-4 h-4" />
              <span>Explore Hotels</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnderDevelopmentDialog;


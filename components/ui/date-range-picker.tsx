import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClassValue } from "clsx";

export function DateRangePicker({
  className = "",
  dateRange,
  onChange,
  buttonClassName = "",
}: {
  dateRange: DateRange | undefined;
  onChange: (dateRange: DateRange | undefined) => void;
  className?: ClassValue;
  buttonClassName?: ClassValue;
}) {
  const formatDisplayDate = (date: Date | undefined) => {
    return date ? format(date, "dd/MM/yyyy") : "Select date";
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              `w-[250px] justify-start text-left font-normal border-[1px] border-[#267DFF33] rounded-[0.1875rem] ${buttonClassName}`,
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-[1rem] h-[1rem] shrink-0 " />
            <span className="ml-2">
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {formatDisplayDate(dateRange?.from)} -{" "}
                    {formatDisplayDate(dateRange?.to)}
                  </>
                ) : (
                  <> {formatDisplayDate(dateRange?.from)} - </>
                )
              ) : (
                <span>Select date range</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

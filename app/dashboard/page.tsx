"use client"; // Make this a client component

import * as React from "react"; // Import React for hooks
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ChartScheduleTypes } from "@/components/chart-schedule-types";
import { ChartTopLocations } from "@/components/chart-top-locations";
import { ChartWfhDistribution } from "@/components/chart-wfh-distribution";
import { ChartHealthInsurance } from "@/components/chart-health-insurance";
import { ChartNoDegree } from "@/components/chart-no-degree";
import { ChartTopCompanies } from "@/components/chart-top-companies";
import { ChartSalaryRate } from "@/components/chart-salary-rate";
import { ChartLineInteractiveSalary } from "@/components/chart-line-interactive-salary";
import { DataTable, dataJobSchema } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Label } from "@/components/ui/label"; // Import Label
import { z } from "zod";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

// Define type based on schema
type DataJob = z.infer<typeof dataJobSchema>;

// Define the structure of the DataTable API response
interface TableApiResponse {
  data: DataJob[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// Define the structure of the Cards API response
interface CardData {
  value: number | string;
  trend: number | null; // Or string if you format trend in API
  description: string;
  // Add rawValue if needed (e.g., for avgSalary)
  rawValue?: number;
}
interface CardsApiResponse {
  totalJobs: CardData;
  remoteJobs: CardData;
  avgYearlySalary: CardData;
  newJobsLast7Days: CardData;
}

// Define the structure of the Chart API response item
interface ChartDataItem {
  date: string;
  jobs: number;
}

// Define the structure of the full Chart API response
interface ChartApiResponse {
  data: ChartDataItem[];
  range: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
}

// Define the structure of the Schedule Types API response
interface ScheduleTypeData {
  name: string;
  value: number;
  fill: string;
}
type ScheduleTypesApiResponse = ScheduleTypeData[];

// Define the structure of the Top Locations API response
interface LocationData {
  location: string;
  count: number;
}
type TopLocationsApiResponse = LocationData[];

// Define the structure of the Top Titles API response
interface TitleData {
  title: string;
  count: number;
}
type TopTitlesApiResponse = TitleData[];

// Define the structure of the WFH Distribution API response
interface WfhData {
  name: string;
  value: number;
  fill: string;
}
type WfhApiResponse = WfhData[];

// Define the structure of the Health Insurance API response
interface InsuranceData {
  name: string;
  value: number;
  fill: string;
}
type InsuranceApiResponse = InsuranceData[];

// Define the structure of the No Degree API response
interface NoDegreeData {
  name: string;
  value: number;
  fill: string;
}
type NoDegreeApiResponse = NoDegreeData[];

// Define the structure of the Top Companies API response
interface CompanyData {
  company: string;
  count: number;
}
type TopCompaniesApiResponse = CompanyData[];

// Define the structure of the Salary Rate API response
interface SalaryRateData {
  name: string;
  value: number;
  // fill: string; // Not needed from API
}
type SalaryRateApiResponse = SalaryRateData[];

// Define the structure of the Schedule WFH Split API response
interface ScheduleWfhData {
  schedule_type: string;
  remote: number;
  office: number;
}
type ScheduleWfhApiResponse = ScheduleWfhData[];

// Define the structure of the Avg Salary Trend API response
interface SalaryTrendData {
  date: string;
  avg_salary: number | null;
}
type SalaryTrendApiResponse = SalaryTrendData[];

export default function Page() {
  // State for table data, loading, pagination
  const [tableData, setTableData] = React.useState<DataJob[]>([]);
  const [isTableLoading, setIsTableLoading] = React.useState(true);
  const [tableError, setTableError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [searchQuery, setSearchQuery] = React.useState("");

  // State for date range filter
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  );
  const [selectedLocation, setSelectedLocation] = React.useState<string>(""); // State for location filter
  const [selectedSchedule, setSelectedSchedule] = React.useState<string>(""); // State for schedule filter
  const [minSalary, setMinSalary] = React.useState<string>(""); // State for min salary
  const [maxSalary, setMaxSalary] = React.useState<string>(""); // State for max salary


  // State for card data, loading, error
  const [cardData, setCardData] = React.useState<CardsApiResponse | null>(null);
  const [isCardsLoading, setIsCardsLoading] = React.useState(true);
  const [cardsError, setCardsError] = React.useState<string | null>(null);

  // State for chart data, loading, error
  const [chartResponse, setChartResponse] =
    React.useState<ChartApiResponse | null>(null); // Store the full response
  const [isChartLoading, setIsChartLoading] = React.useState(true);
  const [chartError, setChartError] = React.useState<string | null>(null);

  // State for schedule types chart
  const [scheduleData, setScheduleData] =
    React.useState<ScheduleTypesApiResponse>([]);
  const [isScheduleLoading, setIsScheduleLoading] = React.useState(true);
  const [scheduleError, setScheduleError] = React.useState<string | null>(null);

  // State for top locations chart
  const [locationData, setLocationData] =
    React.useState<TopLocationsApiResponse>([]);
  const [isLocationLoading, setIsLocationLoading] = React.useState(true);
  const [locationError, setLocationError] = React.useState<string | null>(null);

  // State for WFH chart
  const [wfhData, setWfhData] = React.useState<WfhApiResponse>([]);
  const [isWfhLoading, setIsWfhLoading] = React.useState(true);
  const [wfhError, setWfhError] = React.useState<string | null>(null);

  // State for health insurance chart
  const [insuranceData, setInsuranceData] =
    React.useState<InsuranceApiResponse>([]);
  const [isInsuranceLoading, setIsInsuranceLoading] = React.useState(true);
  const [insuranceError, setInsuranceError] = React.useState<string | null>(
    null
  );

  // State for no degree chart
  const [noDegreeData, setNoDegreeData] = React.useState<NoDegreeApiResponse>(
    []
  );
  const [isNoDegreeLoading, setIsNoDegreeLoading] = React.useState(true);
  const [noDegreeError, setNoDegreeError] = React.useState<string | null>(null);

  // State for top companies chart
  const [companyData, setCompanyData] = React.useState<TopCompaniesApiResponse>(
    []
  );
  const [isCompanyLoading, setIsCompanyLoading] = React.useState(true);
  const [companyError, setCompanyError] = React.useState<string | null>(null);

  // State for salary rate chart
  const [salaryRateData, setSalaryRateData] =
    React.useState<SalaryRateApiResponse>([]);
  const [isSalaryRateLoading, setIsSalaryRateLoading] = React.useState(true);
  const [salaryRateError, setSalaryRateError] = React.useState<string | null>(
    null
  );

  // State for schedule/wfh split chart
  const [scheduleWfhData, setScheduleWfhData] =
    React.useState<ScheduleWfhApiResponse>([]);
  const [isScheduleWfhLoading, setIsScheduleWfhLoading] = React.useState(true);
  const [scheduleWfhError, setScheduleWfhError] = React.useState<string | null>(
    null
  );

  // State for avg salary trend chart
  const [salaryTrendData, setSalaryTrendData] =
    React.useState<SalaryTrendApiResponse>([]);
  const [isSalaryTrendLoading, setIsSalaryTrendLoading] = React.useState(true);
  const [salaryTrendError, setSalaryTrendError] = React.useState<string | null>(
    null
  );

  // Fetch table data function (client-side)
  const fetchTableData = React.useCallback(
    async (
      page: number,
      limit: number,
      search: string,
      dates?: DateRange,
      location?: string,
      schedule?: string,
      minSal?: string,
      maxSal?: string
    ) => {
      setIsTableLoading(true);
      setTableError(null);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (search) queryParams.set("search", search);
        if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
        if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
        if (location) queryParams.set("location", location);
        if (schedule) queryParams.set("schedule", schedule);
        if (minSal) queryParams.set("minSalary", minSal);
        if (maxSal) queryParams.set("maxSalary", maxSal);

        const res = await fetch(`/api/datatable?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch table data: ${res.statusText}`);
        }
        const result: TableApiResponse = await res.json();
        setTableData(result.data);
        setPagination(result.pagination);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unknown error occurred fetching table data";
        setTableError(errorMessage);
        toast.error("Failed to load table data", { description: errorMessage });
        setTableData([]);
        setPagination({ page: 1, limit: limit, totalCount: 0, totalPages: 1 });
      } finally {
        setIsTableLoading(false);
      }
    },
    []
  );

  // Fetch card data function (client-side)
  const fetchCardData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsCardsLoading(true);
    setCardsError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/cards${queryString}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch card data: ${res.statusText}`);
      }
      const result: CardsApiResponse = await res.json();
      setCardData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred fetching card data";
      setCardsError(errorMessage);
      toast.error("Failed to load card data", { description: errorMessage });
      setCardData(null);
    } finally {
      setIsCardsLoading(false);
    }
  }, []);

  // Fetch chart data function (client-side)
  const fetchChartData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsChartLoading(true);
    setChartError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/chart${queryString}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch chart data: ${res.statusText}`);
      }
      const result: ChartApiResponse = await res.json();
      setChartResponse(result); // Store the full response object
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred fetching chart data";
      setChartError(errorMessage);
      toast.error("Failed to load chart data", { description: errorMessage });
      setChartResponse(null); // Reset on error
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  // Fetch schedule types data
  const fetchScheduleData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsScheduleLoading(true);
    setScheduleError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/charts/schedule-types${queryString}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch schedule types: ${res.statusText}`);
      }
      const result: ScheduleTypesApiResponse = await res.json();
      setScheduleData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred fetching schedule types data";
      setScheduleError(errorMessage);
      toast.error("Failed to load schedule types data", {
        description: errorMessage,
      });
      setScheduleData([]);
    } finally {
      setIsScheduleLoading(false);
    }
  }, []);

  // Fetch top locations data
  const fetchLocationData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsLocationLoading(true);
    setLocationError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/charts/top-locations${queryString}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch top locations: ${res.statusText}`);
      }
      const result: TopLocationsApiResponse = await res.json();
      setLocationData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred fetching top locations data";
      setLocationError(errorMessage);
      toast.error("Failed to load top locations data", {
        description: errorMessage,
      });
      setLocationData([]);
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  // Fetch WFH distribution data
  const fetchWfhData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsWfhLoading(true);
    setWfhError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/charts/wfh-distribution${queryString}`);
      if (!res.ok)
        throw new Error(`Failed to fetch WFH distribution: ${res.statusText}`);
      const result: WfhApiResponse = await res.json();
      setWfhData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setWfhError(msg);
      toast.error("Failed to load WFH distribution data", { description: msg });
      setWfhData([]);
    } finally {
      setIsWfhLoading(false);
    }
  }, []);

  // Fetch health insurance data
  const fetchInsuranceData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsInsuranceLoading(true);
    setInsuranceError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/charts/health-insurance${queryString}`);
      if (!res.ok)
        throw new Error(`Failed to fetch health insurance: ${res.statusText}`);
      const result: InsuranceApiResponse = await res.json();
      setInsuranceData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setInsuranceError(msg);
      toast.error("Failed to load health insurance data", { description: msg });
      setInsuranceData([]);
    } finally {
      setIsInsuranceLoading(false);
    }
  }, []);

  // Fetch no degree data
  const fetchNoDegreeData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsNoDegreeLoading(true);
    setNoDegreeError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/charts/no-degree${queryString}`);
      if (!res.ok)
        throw new Error(`Failed to fetch no degree: ${res.statusText}`);
      const result: NoDegreeApiResponse = await res.json();
      setNoDegreeData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setNoDegreeError(msg);
      toast.error("Failed to load no degree data", { description: msg });
      setNoDegreeData([]);
    } finally {
      setIsNoDegreeLoading(false);
    }
  }, []);

  // Fetch top companies data
  const fetchCompanyData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsCompanyLoading(true);
    setCompanyError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/charts/top-companies${queryString}`);
      if (!res.ok)
        throw new Error(`Failed to fetch top companies: ${res.statusText}`);
      const result: TopCompaniesApiResponse = await res.json();
      setCompanyData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setCompanyError(msg);
      toast.error("Failed to load top companies data", { description: msg });
      setCompanyData([]);
    } finally {
      setIsCompanyLoading(false);
    }
  }, []);

  // Fetch salary rate data
  const fetchSalaryRateData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsSalaryRateLoading(true);
    setSalaryRateError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/charts/salary-rate${queryString}`);
      if (!res.ok)
        throw new Error(`Failed to fetch salary rate: ${res.statusText}`);
      const result: SalaryRateApiResponse = await res.json();
      setSalaryRateData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSalaryRateError(msg);
      toast.error("Failed to load salary rate data", { description: msg });
      setSalaryRateData([]);
    } finally {
      setIsSalaryRateLoading(false);
    }
  }, []);

  // Fetch schedule/wfh split data
  const fetchScheduleWfhData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsScheduleWfhLoading(true);
    setScheduleWfhError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/charts/schedule-wfh-split${queryString}`);
      if (!res.ok)
        throw new Error(
          `Failed to fetch schedule/wfh split: ${res.statusText}`
        );
      const result: ScheduleWfhApiResponse = await res.json();
      setScheduleWfhData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setScheduleWfhError(msg);
      toast.error("Failed to load schedule/wfh split data", {
        description: msg,
      });
      setScheduleWfhData([]);
    } finally {
      setIsScheduleWfhLoading(false);
    }
  }, []);

  // Fetch salary trend data
  const fetchSalaryTrendData = React.useCallback(async (
    search: string,
    dates?: DateRange,
    location?: string,
    schedule?: string,
    minSal?: string,
    maxSal?: string
  ) => {
    setIsSalaryTrendLoading(true);
    setSalaryTrendError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (dates?.from) queryParams.set("startDate", dates.from.toISOString());
      if (dates?.to) queryParams.set("endDate", dates.to.toISOString());
      if (location) queryParams.set("location", location);
      if (schedule) queryParams.set("schedule", schedule);
      if (minSal) queryParams.set("minSalary", minSal);
      if (maxSal) queryParams.set("maxSalary", maxSal);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const res = await fetch(`/api/charts/avg-salary-trend${queryString}`);
      if (!res.ok)
        throw new Error(`Failed to fetch salary trend: ${res.statusText}`);
      const result: SalaryTrendApiResponse = await res.json();
      setSalaryTrendData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSalaryTrendError(msg);
      toast.error("Failed to load salary trend data", { description: msg });
      setSalaryTrendData([]);
    } finally {
      setIsSalaryTrendLoading(false);
    }
  }, []);

  // Debounced effect for table data fetching based on search, filters, and pagination
  React.useEffect(() => {
    const timerId = setTimeout(() => {
      fetchTableData(
        pagination.page,
        pagination.limit,
        searchQuery,
        dateRange,
        selectedLocation,
        selectedSchedule,
        minSalary,
        maxSalary
      );
    }, 500); // Debounce time

    return () => clearTimeout(timerId);
  }, [
    fetchTableData,
    pagination.page,
    pagination.limit,
    searchQuery,
    dateRange,
    selectedLocation, // Add filter states
    selectedSchedule,
    minSalary,
    maxSalary,
  ]);

  // Combined effect to fetch all other data based on search query and filters
  React.useEffect(() => {
    // Debounce mechanism for chart/card fetching
    const timerId = setTimeout(() => {
      fetchCardData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchChartData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchScheduleData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchLocationData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchWfhData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchInsuranceData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchNoDegreeData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchCompanyData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchSalaryRateData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchScheduleWfhData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
      fetchSalaryTrendData(searchQuery, dateRange, selectedLocation, selectedSchedule, minSalary, maxSalary);
    }, 500); // Use the same debounce time

    return () => clearTimeout(timerId);
  }, [
    searchQuery,
    dateRange,
    selectedLocation, // Add filter states
    selectedSchedule,
    minSalary,
    maxSalary,
    fetchCardData,
    fetchChartData,
    fetchScheduleData,
    fetchLocationData,
    fetchWfhData,
    fetchInsuranceData,
    fetchNoDegreeData,
    fetchCompanyData,
    fetchSalaryRateData,
    fetchScheduleWfhData,
    fetchSalaryTrendData,
  ]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev: typeof pagination) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination((prev: typeof pagination) => ({
      ...prev,
      page: 1,
      limit: newSize,
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPagination((prev: typeof pagination) => ({ ...prev, page: 1 }));
  };

  return (
    <SidebarProvider>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-2 px-4 pt-4 lg:px-6"> {/* Changed justify-end to justify-between */}
               {/* Search Input Moved Here */}
               <Input
                 placeholder="Search jobs..."
                 value={searchQuery}
                 onChange={handleSearchChange}
                 className="max-w-sm"
               />
               <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
            </div>
            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2 px-4 pt-2 lg:px-6">
              {/* Location Filter */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="location-filter">Location</Label>
                <Select value={selectedLocation} onValueChange={val => setSelectedLocation(val === "__all__" ? "" : val)}>
                  <SelectTrigger id="location-filter" className="w-[180px]">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Locations</SelectItem>
                    <SelectItem value="Anywhere">Anywhere</SelectItem>
                    <SelectItem value="New York, NY">New York, NY</SelectItem>
                    <SelectItem value="Atlanta, GA">Atlanta, GA</SelectItem>
                    <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Washington, DC">Washington, DC</SelectItem>
                    <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                    <SelectItem value="Dallas, TX">Dallas, TX</SelectItem>
                    <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                    <SelectItem value="Charlotte, NC">Charlotte, NC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Schedule Filter */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="schedule-filter">Schedule</Label>
                <Select value={selectedSchedule} onValueChange={val => setSelectedSchedule(val === "__all__" ? "" : val)}>
                  <SelectTrigger id="schedule-filter" className="w-[180px]">
                    <SelectValue placeholder="All Schedules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Schedules</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                    <SelectItem value="Contractor and Temp work">Contractor and Temp work</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Full-time and Part-time">Full-time and Part-time</SelectItem>
                    <SelectItem value="Temp work">Temp work</SelectItem>
                    <SelectItem value="Full-time and Contractor">Full-time and Contractor</SelectItem>
                    <SelectItem value="Full-time and Temp work">Full-time and Temp work</SelectItem>
                    <SelectItem value="Full-time and Internship">Full-time and Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Salary Range Filter */}
              <div className="flex items-end gap-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="min-salary">Min Salary</Label>
                  <Input
                    id="min-salary"
                    type="number"
                    placeholder="Min"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    className="w-[100px]"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="max-salary">Max Salary</Label>
                  <Input
                    id="max-salary"
                    type="number"
                    placeholder="Max"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    className="w-[100px]"
                  />
                </div>
              </div>
            </div>
             {/* DataTable Moved Here */}
             <div className="px-4 lg:px-6 pt-2"> {/* Added pt-2 */}
               {isTableLoading ? (
                 <div className="text-center py-10 h-[400px] flex items-center justify-center rounded-lg border bg-card text-muted-foreground">
                   Loading table data...
                 </div>
               ) : tableError ? (
                 <div className="text-center py-10 h-[400px] flex items-center justify-center rounded-lg border border-red-600/50 bg-red-500/10 text-red-600">
                   Table Error: {tableError}
                 </div>
               ) : (
                 <DataTable
                   data={tableData}
                   pageCount={pagination.totalPages}
                   totalCount={pagination.totalCount}
                   currentPage={pagination.page}
                   pageSize={pagination.limit}
                   onPageChange={handlePageChange}
                   onPageSizeChange={handlePageSizeChange}
                 />
               )}
             </div>
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                data={cardData}
                isLoading={isCardsLoading}
                error={cardsError}
              />
              <ChartAreaInteractive
                data={chartResponse?.data ?? []}
                range={chartResponse?.range ?? null}
                isLoading={isChartLoading}
                error={chartError}
              />
              <ChartScheduleTypes
                data={scheduleData}
                isLoading={isScheduleLoading}
                error={scheduleError}
              />
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6">
                <div className="lg:col-span-1">
                  <ChartTopLocations
                    data={locationData}
                    isLoading={isLocationLoading}
                    error={locationError}
                  />
                </div>
                <div className="lg:col-span-1">
                  <ChartTopCompanies
                    data={companyData}
                    isLoading={isCompanyLoading}
                    error={companyError}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-6">
                <div className="lg:col-span-3">
                  <ChartScheduleTypes
                    data={scheduleData}
                    isLoading={isScheduleLoading}
                    error={scheduleError}
                  />
                </div>
                <ChartWfhDistribution
                  data={wfhData}
                  isLoading={isWfhLoading}
                  error={wfhError}
                />
                <ChartSalaryRate
                  data={salaryRateData}
                  isLoading={isSalaryRateLoading}
                  error={salaryRateError}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-6">
                <div className="lg:col-span-1">
                  <ChartHealthInsurance
                    data={insuranceData}
                    isLoading={isInsuranceLoading}
                    error={insuranceError}
                  />
                </div>
                <div className="lg:col-span-1">
                  <ChartNoDegree
                    data={noDegreeData}
                    isLoading={isNoDegreeLoading}
                    error={noDegreeError}
                  />
                </div>
              </div>
              <ChartLineInteractiveSalary
                data={salaryTrendData}
                isLoading={isSalaryTrendLoading}
                error={salaryTrendError}
              />
              {/* Search Input and DataTable section removed from here */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

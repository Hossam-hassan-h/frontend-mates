import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboardApi.js";

export function useDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateRange = searchParams.get("range") || "last7Days";

  const setDateRange = (newRange) => {
    setSearchParams((prev) => {
      prev.set("range", newRange);
      return prev;
    });
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["adminDashboardStats", dateRange],
    queryFn: () => dashboardApi.getStats(dateRange),
    staleTime: 1000 * 60 * 2,
  });

  return {
    stats: data?.data || null,
    dateRange,
    setDateRange,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}

export default useDashboard;

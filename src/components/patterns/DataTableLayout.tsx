import type { ReactNode } from "react";
import { Table, Card, EmptyState, Pagination, Alert, Button } from "../ui";
import type { TableColumn } from "../ui/Table";
import { SearchFilterBar } from "./SearchFilterBar";
import styles from "./DataTableLayout.module.css";

interface DataTableLayoutProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyState?: {
    title: string;
    description: string;
    action?: ReactNode;
  };
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  headerActions?: ReactNode;
}

export function DataTableLayout<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  isError = false,
  errorMessage = "Failed to load data. Please try again.",
  onRetry,
  emptyState,
  page,
  totalPages,
  onPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  headerActions,
}: DataTableLayoutProps<T>) {
  const hasSearch = searchValue !== undefined && onSearchChange !== undefined;
  const showSearchBar = hasSearch || filters || headerActions;
  const showTable = !isError;
  const isEmpty = !isLoading && data.length === 0;
  const hasData = !isLoading && data.length > 0;

  return (
    <Card noPadding>
      {showSearchBar && (
        <SearchFilterBar
          searchValue={searchValue ?? ""}
          onSearchChange={onSearchChange ?? (() => {})}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          actions={headerActions}
        />
      )}

      {isError && (
        <div className={styles.errorWrapper}>
          <Alert variant="danger" title="Error">
            {errorMessage}
            {onRetry && (
              <div className={styles.retryWrapper}>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              </div>
            )}
          </Alert>
        </div>
      )}

      {showTable && (
        <>
          {(isLoading || hasData) && (
            <Table
              columns={columns}
              data={data}
              keyExtractor={keyExtractor}
              isLoading={isLoading}
            />
          )}

          {isEmpty && emptyState && (
            <div className={styles.emptyWrapper}>
              <EmptyState
                title={emptyState.title}
                description={emptyState.description}
                action={emptyState.action}
              />
            </div>
          )}

          {hasData && totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

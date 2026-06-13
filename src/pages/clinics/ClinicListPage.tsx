import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listClinics } from "../../api/clinics";
import { Button, StatusBadge } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { ClinicResponse } from "../../api/types";
import styles from "./ClinicListPage.module.css";

export function ClinicListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["clinics", page],
    queryFn: () => listClinics(page, 20),
  });

  const columns: TableColumn<ClinicResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link to={`/clinics/${row.id}`} className={styles.tableLink}>
          {row.name}
        </Link>
      ),
    },
    {
      key: "document",
      header: "Document",
      render: (row) => row.document,
    },
    {
      key: "city",
      header: "City",
      render: (row) => `${row.city}, ${row.state}`,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clinics"
        actions={
          <Link to="/clinics/new">
            <Button leftIcon={<Plus size={16} />}>New clinic</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load clinics"
        onRetry={() => refetch()}
        emptyState={{
          title: "No clinics registered",
          description: "Start by registering the first clinic on the platform.",
          action: (
            <Link to="/clinics/new">
              <Button leftIcon={<Plus size={16} />}>New clinic</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search clinics..."
      />
    </div>
  );
}

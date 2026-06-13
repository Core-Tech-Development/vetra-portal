import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listSpecialists } from "../../api/specialists";
import { Button, StatusBadge } from "../../components/ui";
import type { TableColumn } from "../../components/ui";
import { PageHeader, DataTableLayout } from "../../components/patterns";
import type { SpecialistResponse } from "../../api/types";
import styles from "./SpecialistListPage.module.css";

export function SpecialistListPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["specialists", page],
    queryFn: () => listSpecialists(page, 20),
  });

  const columns: TableColumn<SpecialistResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link to={`/specialists/${row.id}`} className={styles.tableLink}>
          {row.name}
        </Link>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.email,
    },
    {
      key: "crmv",
      header: "CRMV",
      render: (row) => `${row.crmv} / ${row.crmvState}`,
    },
    {
      key: "specialty",
      header: "Specialty",
      render: (row) => row.specialty.replace(/_/g, " "),
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
        title="Specialists"
        actions={
          <Link to="/specialists/new">
            <Button leftIcon={<Plus size={16} />}>New specialist</Button>
          </Link>
        }
      />

      <DataTableLayout
        columns={columns}
        data={data?.content ?? []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load specialists"
        onRetry={() => refetch()}
        emptyState={{
          title: "No specialists registered",
          description: "Start by registering the first specialist on the platform.",
          action: (
            <Link to="/specialists/new">
              <Button leftIcon={<Plus size={16} />}>New specialist</Button>
            </Link>
          ),
        }}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search specialists..."
      />
    </div>
  );
}

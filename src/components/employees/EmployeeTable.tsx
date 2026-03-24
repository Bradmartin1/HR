"use client";

import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DepartmentBadge } from "@/components/shared/DepartmentBadge";
import { formatDate } from "@/lib/utils/format";

interface EmployeeRow {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  status: string;
  employment_type: string;
  hire_date: string;
  work_email: string | null;
  departments?: { id: string; name: string; code: string } | null;
  job_titles?: { id: string; title: string } | null;
  locations?: { id: string; name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  active: "success",
  inactive: "secondary",
  terminated: "destructive",
  on_leave: "warning",
};

export function EmployeeTable({ data }: { data: EmployeeRow[] }) {
  const router = useRouter();

  const columns: ColumnDef<EmployeeRow>[] = [
    {
      accessorKey: "employee_number",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.getValue("employee_number")}</span>
      ),
    },
    {
      id: "name",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => `${row.last_name}, ${row.first_name}`,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.first_name} {row.original.last_name}</div>
          {row.original.work_email && (
            <div className="text-xs text-muted-foreground">{row.original.work_email}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "departments.name",
      header: "Department",
      cell: ({ row }) => row.original.departments ? (
        <DepartmentBadge department={row.original.departments.name} />
      ) : "—",
    },
    {
      accessorKey: "job_titles.title",
      header: "Title",
      cell: ({ row }) => row.original.job_titles?.title ?? "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={(STATUS_COLORS[status] ?? "secondary") as "success" | "secondary" | "destructive" | "warning"}>
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "hire_date",
      header: "Hire Date",
      cell: ({ row }) => formatDate(row.getValue("hire_date")),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/employees/${row.original.id}`)}>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/employees/${row.original.id}/employment`)}>
              Edit Employment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(row) => router.push(`/employees/${row.id}`)}
    />
  );
}

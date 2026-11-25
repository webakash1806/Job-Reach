"use client";

import * as React from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function selectColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox aria-label="Select row" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
    ),
    enableSorting: false,
    size: 32,
  };
}

/** Header cell that toggles sorting. */
export function SortHeader({ label, column }: { label: string; column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" } }) {
  return (
    <button
      type="button"
      className="-ml-1 inline-flex items-center gap-1 rounded px-1 hover:text-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDownIcon className="size-3 opacity-60" />
    </button>
  );
}

export function DataTable<T extends { _id: string }>({
  columns,
  data,
  loading,
  empty,
  selection,
  onSelectionChange,
  pageSize = 25,
}: {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  empty?: React.ReactNode;
  selection?: RowSelectionState;
  onSelectionChange?: (s: RowSelectionState) => void;
  pageSize?: number;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [inner, setInner] = React.useState<RowSelectionState>({});
  const rowSelection = selection ?? inner;

  const table = useReactTable({
    data,
    columns,
    getRowId: (r) => r._id,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: (u) => {
      const next = typeof u === "function" ? u(rowSelection) : u;
      (onSelectionChange ?? setInner)(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;
  const { pageIndex } = table.getState().pagination;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} style={h.column.id === "select" ? { width: 36 } : undefined}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_c, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-muted-foreground">
                  {empty ?? "Nothing here yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!loading && data.length > 0 && (
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            {Object.keys(rowSelection).length > 0 ? `${Object.keys(rowSelection).length} selected of ` : ""}
            {data.length} rows
          </span>
          <div className="flex items-center gap-2">
            <span className="tabular-nums">
              Page {pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <Button variant="outline" size="icon-sm" aria-label="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeftIcon />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

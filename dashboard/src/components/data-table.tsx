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

/** The card label for a column: meta.label, a string header, or the column id made readable. */
function labelOf<T>(def: ColumnDef<T>) {
  const meta = def.meta as { label?: string } | undefined;
  if (meta?.label) return meta.label;
  if (typeof def.header === "string" && def.header) return def.header;
  const id = def.id ?? ("accessorKey" in def ? String(def.accessorKey) : "");
  return id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().replace(/^./, (c) => c.toUpperCase());
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
      {/* phones: one card per row, every column as a label and value */}
      <div className="grid gap-2 @3xl:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)
        ) : rows.length ? (
          rows.map((row) => {
            const cells = row.getVisibleCells();
            const select = cells.find((c) => c.column.id === "select");
            const actions = cells.find((c) => c.column.id === "actions");
            const [title, ...rest] = cells.filter((c) => c !== select && c !== actions);
            return (
              <div key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} className="grid gap-3 rounded-lg border bg-card p-3 data-[state=selected]:border-foreground/30 data-[state=selected]:bg-muted/50">
                <div className="flex items-start gap-3">
                  {select && <div className="pt-0.5">{flexRender(select.column.columnDef.cell, select.getContext())}</div>}
                  <div className="min-w-0 flex-1 break-words">{title && flexRender(title.column.columnDef.cell, title.getContext())}</div>
                </div>
                {rest.length > 0 && (
                  <dl className="grid gap-2 text-sm">
                    {rest.map((c) => (
                      <div key={c.id} className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3">
                        <dt className="text-xs leading-5 text-muted-foreground">{labelOf(c.column.columnDef)}</dt>
                        <dd className="min-w-0 break-words">{flexRender(c.column.columnDef.cell, c.getContext())}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {actions && <div className="flex flex-wrap gap-2 border-t pt-3 empty:hidden">{flexRender(actions.column.columnDef.cell, actions.getContext())}</div>}
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">{empty ?? "Nothing here yet."}</div>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border @3xl:block">
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
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
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

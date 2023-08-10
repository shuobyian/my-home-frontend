import {
  Table as MuiTable,
  Pagination,
  TableBody,
  TableCell,
  TableCellProps,
  TableHead,
  TableProps,
  TableRow,
} from "@mui/material";
import { PropsWithChildren } from "react";

interface ITableProps extends TableProps {
  head: { key: string; value: string; props?: TableCellProps }[];
  pagination?: {
    page: number;
    size: number;
    total: number;
    onChange: (page: number) => void;
  };
}

export function Table({
  head,
  pagination,
  children,
  ...props
}: PropsWithChildren<ITableProps>) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <MuiTable sx={{ minWidth: 650 }} {...props}>
        <TableHead>
          <TableRow>
            {head.map(({ key, value, props }) => (
              <TableCell key={key} {...props}>
                {value}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </MuiTable>
      {pagination && (
        <Pagination
          style={{ marginTop: "10px" }}
          count={Math.floor(pagination.total / pagination.size)}
          page={pagination.page + 1}
          color='primary'
          onChange={(_, page) => pagination.onChange(page - 1)}
        />
      )}
    </div>
  );
}

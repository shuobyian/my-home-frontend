/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { IMarket } from "apis/putMarkets";
import { useMarketQuery } from "queries/useMarketQuery";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { MARKET } from "util/constant/LOCAL_STORAGE_KEY";
import { Table } from "view/components/Table";

const MARKET_LIST = localStorage.getItem(MARKET);

interface IMarketListProps {
  isUsedLocalStorage: boolean;
}

export function MarketList({ isUsedLocalStorage }: IMarketListProps) {
  const form = useFormContext<{ markets: IMarket[] }>();
  const { control, reset, getValues } = form;

  const { data } = useMarketQuery();

  const resetData = () => {
    reset({ markets: data });
  };

  useEffect(() => {
    if (isUsedLocalStorage)
      reset({ markets: MARKET_LIST ? JSON.parse(MARKET_LIST) : data });

    if (!isUsedLocalStorage) resetData();
  }, [data]);

  return (
    <div style={{ textAlign: "left" }}>
      <Button variant='outlined' onClick={resetData} style={{ margin: "10px" }}>
        시세 불러오기
      </Button>
      <Table
        head={[
          {
            key: "name",
            value: "물품명",
            props: { width: "250px" },
          },
          {
            key: "price",
            value: "시세",
            props: { width: "250px" },
          },
        ]}
      >
        {getValues("markets")?.map((market, i) => (
          <TableRow
            key={market.name}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component='th' scope='row'>
              <Controller
                name={`markets.${i}.name`}
                control={control}
                render={({ field }) => (
                  <TextField size='small' value={field.value} disabled={true} />
                )}
              />
            </TableCell>
            <TableCell
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Controller
                name={`markets.${i}.price`}
                control={control}
                render={({ field }) => (
                  <TextField
                    type='number'
                    size='small'
                    value={field.value}
                    onChange={field.onChange}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                  />
                )}
              />
              <Typography>골드</Typography>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}

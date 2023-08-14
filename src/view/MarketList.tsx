/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Container,
  Snackbar,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Market } from "apis/putMarkets";
import { useMarketMutation } from "queries/useMarketMutation";
import { useMarketQuery } from "queries/useMarketQuery";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { Table } from "view/components/Table";

export function MarketList() {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<Market[]>();
  const { data: marketList } = useMarketQuery();
  const { mutate } = useMarketMutation();

  const [message, setMessage] = useState<string>();

  const onSubmit = (formData: Market[]) => {
    mutate(formData, {
      onSuccess: () => {
        setMessage("수정되었습니다.");
        queryClient.invalidateQueries("market");
      },
      onError: () => {
        setMessage("실패했습니다.");
      },
    });
  };

  useEffect(() => {
    reset(marketList);
  }, [marketList]);

  return (
    <Container maxWidth='lg'>
      <Snackbar
        open={!!message}
        onClose={() => setMessage(undefined)}
        message='수정되었습니다.'
      />
      <Button
        variant='outlined'
        onClick={handleSubmit(onSubmit)}
        style={{ float: "right", margin: "10px" }}
      >
        수정
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
        {marketList?.map((market, i) => (
          <TableRow
            key={market.name}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component='th' scope='row'>
              <Controller
                name={`${i}.name`}
                control={control}
                render={({ field }) => (
                  <TextField size='small' value={field.value} />
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
                name={`${i}.price`}
                control={control}
                render={({ field }) => (
                  <TextField
                    type='number'
                    size='small'
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Typography>골드</Typography>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </Container>
  );
}

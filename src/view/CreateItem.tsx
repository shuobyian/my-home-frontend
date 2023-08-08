import {
  Button,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Item, useItemMutation } from "../queries/useItemMutation";

export function CreateItem() {
  const { control, handleSubmit } = useForm<Item>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials",
  });

  const { mutate } = useItemMutation();

  const onSubmit = async (formData: Item) => {
    mutate(formData);
  };

  return (
    <Stack gap={3} style={{ textAlign: "center", margin: "30px" }}>
      <Typography fontSize={20}>아이템 추가</Typography>
      <Stack
        gap={2}
        style={{
          border: "1px solid #999999",
          borderRadius: "10px",
          padding: "10px",
        }}
        divider={<Divider />}
      >
        <Stack gap={1}>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <TextField
                size='small'
                label='상품명'
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name='level'
            control={control}
            render={({ field }) => (
              <TextField
                type='number'
                size='small'
                label='레벨'
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name='craftingPrice'
            control={control}
            render={({ field }) => (
              <TextField
                type='number'
                size='small'
                label='크래프팅 가격'
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Stack>
        {fields.map((item, index) => (
          <Stack key={item.id} gap={2} style={{ padding: "10px" }}>
            <Controller
              render={({ field }) => (
                <TextField size='small' {...field} label='재료명' />
              )}
              name={`materials.${index}.name`}
              control={control}
            />
            <Controller
              render={({ field }) => (
                <RadioGroup {...field}>
                  <Stack direction={"row"}>
                    <FormControlLabel
                      value={false}
                      control={<Radio />}
                      label='기본 재료'
                    />
                    <FormControlLabel
                      value={true}
                      control={<Radio />}
                      label='상위 재료'
                    />
                  </Stack>
                </RadioGroup>
              )}
              name={`materials.${index}.base`}
              control={control}
            />
            <Controller
              render={({ field }) => <TextField size='small' {...field} />}
              name={`materials.${index}.count`}
              control={control}
            />
            <Button variant='outlined' onClick={() => remove(index)}>
              재료 삭제
            </Button>
          </Stack>
        ))}
        {fields.length < 5 && (
          <Button
            variant='outlined'
            onClick={() => append({ name: "", base: false, count: 1 })}
            color='success'
          >
            재료 추가
          </Button>
        )}
      </Stack>
      <Button onClick={handleSubmit(onSubmit)} variant='contained'>
        상품 추가
      </Button>
    </Stack>
  );
}

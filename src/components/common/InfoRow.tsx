import { Stack, Text } from "@/ui";

export function InfoRow({ title, value }: { title: string; value: string }) {
  return (
    <Stack gap={10}>
      <Text strong style={{ minWidth: "110px" }}>
        {title}
      </Text>
      <Text style={{ flexGrow: 1 }}>{value}</Text>
    </Stack>
  );
}

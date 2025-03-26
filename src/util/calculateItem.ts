import { StorageResult } from "util/hook/useSelectedResults";

export function calculateItem(results: StorageResult) {
  const resultList = Object.values(results);

  let materials: {
    [name: string]: { name: string; count: number; price: number };
  } = {};

  resultList.forEach((result) => {
    const next = result.item.materials.map((material) => ({
      name: material.name,
      count: material.count * result.count,
      price: material.price * result.count,
    }));

    next.forEach((item) => {
      if (materials[item.name]) {
        materials[item.name] = {
          name: item.name,
          count: materials[item.name].count + item.count,
          price: materials[item.name].price + item.count,
        };
      } else {
        materials = {
          ...materials,
          [item.name]: item,
        };
      }
    });
  });

  return Object.values(materials);
}

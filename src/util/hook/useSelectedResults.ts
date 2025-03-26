import { Result } from "apis/result/getResults";
import { useEffect, useMemo, useState } from "react";
import { SELECTED_RESULTS } from "util/constant/LOCAL_STORAGE_KEY";

export type StorageResult = { [key: number]: { item: Result; count: number } };

const DEFAULT_DATA_SELECTED_RESULTS = localStorage.getItem(SELECTED_RESULTS);

export const useSelectedResults = () => {
  const [selectedResults, setSelectedResults] = useState<StorageResult>({});

  useEffect(() => {
    try {
      if (DEFAULT_DATA_SELECTED_RESULTS) {
        setSelectedResults(JSON.parse(DEFAULT_DATA_SELECTED_RESULTS));
      } else {
        setSelectedResults({});
      }
    } catch {
      setSelectedResults({});
    }
  }, []);

  const totalCount = useMemo(
    () =>
      Object.values(selectedResults).reduce(
        (acc, cur) => (acc += cur.count),
        0
      ),
    [selectedResults]
  );

  const set = (results: StorageResult) => {
    setSelectedResults(results);
    localStorage.setItem(SELECTED_RESULTS, JSON.stringify(results));
  };

  const onChange = (item: Result) => {
    let _selectedResults = { ...selectedResults };

    if (_selectedResults[item.id]) {
      _selectedResults[item.id].count += 1;
    } else {
      _selectedResults = {
        ..._selectedResults,
        [`${item.id}`]: { item, count: 1 },
      };
    }
    set(_selectedResults);
  };

  const add = (id: number) => {
    const _selectedResults = { ...selectedResults };

    _selectedResults[id].count += 1;

    set(_selectedResults);
  };

  const sub = (id: number) => {
    const _selectedResults = { ...selectedResults };

    if (_selectedResults[id].count < 2) {
      delete _selectedResults[id];
    } else {
      _selectedResults[id].count -= 1;
    }

    set(_selectedResults);
  };

  const remove = (id: number) => {
    const _selectedResults = { ...selectedResults };

    delete _selectedResults[id];

    set(_selectedResults);
  };

  const removeAll = () => {
    set({});
  };

  return {
    selectedResults,
    totalCount,
    onChange,
    add,
    sub,
    remove,
    removeAll,
  };
};

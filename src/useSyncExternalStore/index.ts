import { useDebugValue, useEffect, useLayoutEffect, useState } from 'react';

export type Subscribe = (onStoreChange: () => void) => () => void;

export function useSyncExternalStoreCustom<Snapshot>(
  subscribe: Subscribe,
  getSnapshot: () => Snapshot
): Snapshot {
  // 매 렌더링마다 현재 스냅샷을 스토어에서 읽는다
  const value = getSnapshot();
  const [{ inst }, forceUpdate] = useState({ inst: { value, getSnapshot } });

  useLayoutEffect(() => {
    // 렌더링 후 새로 불러온 현재 스냅샷으로 업데이트한다
    inst.value = value;
    inst.getSnapshot = getSnapshot;

    if (checkIfSnapshotChanged(inst)) {
      forceUpdate({ inst });
    }
  }, [subscribe, value, getSnapshot, inst]);

  useEffect(() => {
    // subscribe 직전에 변경 사항을 확인한다
    // 그 이후의 변경 사항은 subscription 핸들러에서 감지될 것이다
    if (checkIfSnapshotChanged(inst)) {
      forceUpdate({ inst });
    }

    const handleStoreChange = () => {
      if (checkIfSnapshotChanged(inst)) {
        forceUpdate({ inst });
      }
    };

    return subscribe(handleStoreChange);
  }, [subscribe, inst]);

  useDebugValue(value);
  return value;
}

function checkIfSnapshotChanged(inst: { value: unknown; getSnapshot: () => void }) {
  const nextValue = inst.getSnapshot();
  const prevValue = inst.value;

  return !Object.is(prevValue, nextValue);
}

/* Simple
export function useSyncExternalStoreCustom2<T>(subscribe: Subscribe, getSnapshot: GetSnapshot<T>): T {
  const value = getSnapshot();
  const [{ inst }, forceUpdate] = useState({ inst: { value, getSnapshot } });

  useEffect(() => {
    if (checkIfSnapshotChanged(inst)) {
      forceUpdate({ inst: { value, getSnapshot } });
    }

    const handleStoreChange = () => {
      if (checkIfSnapshotChanged(inst)) {
        forceUpdate({ inst: { value, getSnapshot } });
      }
    };

    return subscribe(handleStoreChange);
  }, [subscribe, inst, value, getSnapshot]);

  useDebugValue(inst.value);
  return inst.value;
}
*/

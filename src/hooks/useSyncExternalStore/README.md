# useSyncExternalStore

외부 스토어를 구독할 수 있는 훅

[reference](https://react.dev/reference/react/useSyncExternalStore)

## 언제 사용할까

- 외부 스토어를 구독하는 경우 [예시](https://github.com/jw-r/react-hooks/blob/master/src/hooks/useSyncExternalStore/TodosApp.tsx)
- 브라우저 API 구독하기 [얘시](https://github.com/jw-r/react-hooks/blob/master/src/hooks/useSyncExternalStore/useOnlineStatus.ts)

## 구현 코드

```tsx
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
```

## 동작 방식

외부 데이터 소스의 값이 10이라고 가정하자

1. 초기 렌더링
   - `getSnapshot()`은 10을 반환한다 (value === 10)
   - inst 객체는 `{ value: 10, getSnapshot: [Function] }` 으로 초기화된다
2. 데이터 변경
   - 외부 데이터 소스의 값이 `20`으로 변경되었을 때,
   - `subscribe` 함수가 구독 중인 이벤트를 감지하고 `handleStoreChange` 함수를 호출한다
3. handleStoreChange 실행
   - 이전 값인 `inst.value` (10)과 새로운 값인 `inst.getSnapshot()` (20)이 다르다면 강제 리렌더링을 발생시킨다
4. 리렌더링
   - `forceUpdate({ inst })`가 호출되어 컴포넌트가 리렌더링된다
   - 리렌더링 과정에서 `getSnapshot()`은 20을 반환하고 `inst.value`는 20으로 업데이트된다 (`useLayoutEffect`)
     - useState는 초기 마운트시에만 인자를 받아들이지만 inst는 가변 객체이기 때문에 useLayoutEffect에서 inst의 속성을 변경할 수 있다
     - 이를 통해 inst 객체의 상태가 최신 상태로 유지되면서 렌더링과 돔 업데이트 사이에 일관성을 보장할 수 있다

## SSR

세번째 인자에 초기 스냅샷을 반환하는 함수를 제공하는 것으로 서버에서 HTML에 렌더링 할 기본 값을 제공할 수 있다

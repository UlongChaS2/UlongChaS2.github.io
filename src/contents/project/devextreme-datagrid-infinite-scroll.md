---
title: 'DevExtreme DataGrid에서 무한 스크롤 구현하기'
date: '2025-07-22'
category: 'project'
keywords: ['DataGrid', '무한 스크롤']
---

> DevExtreme DataGrid의 `CustomStore`로 무한 스크롤을 만들 때, 페이지·fetching 상태를 `useState` 대신 `useRef`로 관리해야 그리드가 리셋되지 않는다.

<!--more-->

## 개요

DevExtreme DataGrid에서 무한 스크롤을 구현하려면 `CustomStore`의 `load` 함수를 직접 정의해야 한다. 이때 상태를 `useState`로 관리하면 리렌더링마다 `load` 함수가 재생성되고, 그 결과 `dataSource`까지 새로 만들어져 그리드가 통째로 리셋된다. 그래서 페이지 번호·fetching 여부·다음 페이지 존재 여부 같은 상태는 모두 `useRef`로 관리한다.

```tsx
const allDataRef = useRef<any[]>([]) // ✅ 기존 데이터를 유지하는 useRef
const gridRef = useRef<any>(null) // ✅ DataGrid 참조

const isFetchingRef = useRef(false) // ✅ 현재 fetching 여부 저장
const currentPageRef = useRef(0) // ✅ 현재 페이지 저장
const hasNextPageRef = useRef(true) // ✅ 다음 페이지 여부 저장

// ✅ load 함수는 useCallback으로 감싸서 재생성을 방지
const load = useCallback(async (loadOptions) => {
  if (!hasNextPageRef.current || isFetchingRef.current) {
    return { data: allDataRef.current, totalCount: allDataRef.current.length }
  }

  isFetchingRef.current = true // ✅ 상태 업데이트를 useRef로 처리
  const pageSize = loadOptions.take || 0 // 축적된 data 갯수를 뜻함
  const nextPage = currentPageRef.current // ✅ useRef 사용

  try {
    const response = await fetch(
      `https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/Sales?skip=${nextPage * pageSize}&take=${pageSize}`,
    )
    const { data: newData } = await response.json()

    if (newData.length === 0) {
      hasNextPageRef.current = false // ✅ useRef로 상태 업데이트
    } else {
      currentPageRef.current = nextPage + 1 // ✅ useRef로 상태 업데이트
      // NOTE: 기존 데이터에 추가하지 않아도 알아서 devextreme이 해주는 가능성은
      // CustomStore를 사용할 때 내부적으로 데이터를 캐싱하거나 scroll mode의 infinite 때문일 것으로 보임
      // allDataRef.current = [...allDataRef.current, ...newData]
      allDataRef.current = newData
    }
  } catch (error) {
    console.error('데이터 로딩 실패:', error)
  } finally {
    isFetchingRef.current = false // ✅ 약간의 지연 후 다시 데이터 요청 가능하도록 변경
  }

  return { data: allDataRef.current, totalCount: allDataRef.current.length }
}, []) // ✅ 의존성 배열을 빈 배열로 설정 (불필요한 재생성 방지)

// ✅ dataSource는 useMemo로 감싸되, load 함수는 useCallback을 사용하여 의존성을 최소화
const dataSource = useMemo(() => new CustomStore({ key: 'Id', load }), []) // ✅ useMemo는 load 함수만 의존성으로 포함
```

일반 fetch를 useQuery로 바꾸면 page에 따라서 데이터를 받아올 때 load 함수 밖에서 받아오는 새로운 data를 메모라이징한 load 함수에서 사용할 때는 의존성에 넣어야 하는데, 그렇게 되면 dataSource의 useMemo에도 넣어주게 되면서 전체적으로 다시 reset하게 되어 중간에 추가하는 것이 아니라 새로운 테이블이 완성되므로 원하는 infinite 상황과 다르게 된다.

→ 캐싱은 할 수 없다,,,,

→ 최종 결정: 기존에 ky를 인스턴스로 만들어 둔 api 모듈을 사용하여 에러 상황이라도 공통되게 처리하기로 결정

## 참고 자료

[https://js.devexpress.com/React/Documentation/Guide/UI_Components/PivotGrid/Data_Binding/#Provide_Data/Using_the_Client-Side_Processing/Using_a_CustomStore](https://js.devexpress.com/React/Documentation/Guide/UI_Components/PivotGrid/Data_Binding/#Provide_Data/Using_the_Client-Side_Processing/Using_a_CustomStore)

[https://js.devexpress.com/React/Documentation/ApiReference/Data_Layer/CustomStore/](https://js.devexpress.com/React/Documentation/ApiReference/Data_Layer/CustomStore/)

[https://js.devexpress.com/React/Documentation/Guide/Data_Binding/Specify_a_Data_Source/Custom_Data_Sources/#Load_Data/Server-Side_Data_Processing](https://js.devexpress.com/React/Documentation/Guide/Data_Binding/Specify_a_Data_Source/Custom_Data_Sources/#Load_Data/Server-Side_Data_Processing)

[https://supportcenter.devexpress.com/ticket/details/t1165536/infinite-scrolling-with-web-api-shows-empty-rows-where-data-exists](https://supportcenter.devexpress.com/ticket/details/t1165536/infinite-scrolling-with-web-api-shows-empty-rows-where-data-exists)

[https://codesandbox.io/p/sandbox/992win?file=%2FApp.vue%3A38%2C21](https://codesandbox.io/p/sandbox/992win?file=%2FApp.vue%3A38%2C21)

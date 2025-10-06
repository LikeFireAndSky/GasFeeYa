# GASFEEYA — 가스 검사 수수료 계산기

한국가스안전공사 고시를 기반으로 **액화석유가스(LPG)**와 **고압가스** 시설의 검사 수수료를 손쉽게 계산하는 웹 앱입니다.  
Next.js(App Router) + Tailwind CSS + Framer Motion + React Hook Form + Zod 조합으로, **가볍고 반응형**이며 **실시간 계산**을 제공합니다.

> **데이터 소스**
>
> - 고압가스시설 등의 검사수수료 및 교육비 기준 **고시 2025-155호 (전문)**
> - 액화석유가스시설 등의 검사수수료 및 교육비 기준 **고시 2025-156호 (전문)**

---

## ✨ 주요 기능

- 시설 유형을 먼저 선택 → **슬림한 입력 폼** → 즉시 결과
- **LPG**: 특정사용 / 저장소·충전·집단공급 / 판매 / 제조 / 배관망공급사업 등
- **고압가스**: 액화·압축(제조/충전/저장), 냉동제조, 배관(경계 내), 판매/수입, 특정사용(액화/압축)
- **검사 종류 전환**: 완성 / **중간** / 정기 (해당 시설에 한함)
- **특례 처리**: 상한·면제·가산식(100kg·500t·10만m³ 등) 자동 반영
- **밝은(흰) 배경 디자인**에 최적화(가독성 높은 컬러 대비)

---

## 🧰 기술 스택

- **Framework:** Next.js (App Router, TypeScript)
- **UI:** Tailwind CSS, Framer Motion
- **Form:** React Hook Form, Zod (@hookform/resolvers)
- **Lint:** ESLint(Next/TS), (옵션) Prettier

---

## 🚀 시작하기

### 요구사항

- Node.js ≥ 18
- npm (Windows 환경에서 npm 경로 문제 해결은 아래 트러블슈팅 참고)

### 설치 & 실행

```bash
# 의존성 설치
npm i

# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm run start

# 린트
npm run lint
```

📁 폴더 구조
app/
page.tsx
petroleum-gas/
page.tsx # LPG 인덱스(시설 선택)
specific/page.tsx
storage/page.tsx
retail/page.tsx
manufacturer/page.tsx
network/page.tsx
high-pressure/
page.tsx # 고압가스 인덱스(시설 선택)
liquid/page.tsx
compressed/page.tsx
refrigeration/page.tsx
pipeline/page.tsx # (추가 예정)
retail/page.tsx # (정액)
import/page.tsx # (정액)
specific/
liquid/page.tsx # 특정사용-액화
compressed/page.tsx # 특정사용-압축

components/
Background.tsx # 전역 배경(클라이언트 컴포넌트)
... (공용 UI 컴포넌트)

lib/
fees/
lpgSpecific.ts
lpgStorage.ts
lpgRetail.ts
lpgManufacturer.ts
lpgNetwork.ts
highPressure/
liquid.ts
compressed.ts
refrigeration.ts
pipeline.ts # (추가 예정)
retail.ts # (정액)
import.ts # (정액)

🔗 라우팅 맵 (주요)

/petroleum-gas → LPG 인덱스

/petroleum-gas/specific

/petroleum-gas/storage

/petroleum-gas/retail

/petroleum-gas/manufacturer

/petroleum-gas/network

/high-pressure → 고압가스 인덱스

/high-pressure/liquid

/high-pressure/compressed

/high-pressure/refrigeration

/high-pressure/pipeline (추가 예정)

/high-pressure/retail (정액)

/high-pressure/import (정액)

/high-pressure/specific/liquid

/high-pressure/specific/compressed

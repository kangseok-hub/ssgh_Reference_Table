# 숭신고 수시 합격 배치표 (2023~2026) v1.02

> 숭신고등학교 2023~2026학년도 수시 합격 결과를 기반으로 제작한 대입 배치표 웹 애플리케이션입니다.

## 주요 기능

- 📊 연도별 수시 합격 배치표 시각화 (2023~2026)
- 🔍 대학명·전형 유형·등급별 필터링 및 검색
- 📥 배치표 PDF 다운로드
- 🏫 교과 / 학종 / 논술 / 기타 전형 구분 표시

## 기술 스택

- **React 19** + **TypeScript**
- **Vite 6**
- **Tailwind CSS v4**
- **Lucide React** (아이콘)
- **jsPDF + html2canvas** (PDF 출력)

## 로컬 실행 방법

**필수 조건:** Node.js 18 이상

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 프로젝트 구조

```
├── src/
│   ├── App.tsx       # 메인 컴포넌트 (배치표 UI 전체)
│   ├── data.ts       # 합격 데이터 (2023~2026)
│   ├── main.tsx      # 앱 진입점
│   └── index.css     # 전역 스타일
├── index.html
├── vite.config.ts
└── tsconfig.json
```

## 데이터 출처

본 배치표는 숭신고등학교 진학 지도 자료를 기반으로 작성되었습니다.  
실제 입시 지원 시에는 반드시 각 대학 공식 입시요강을 확인하시기 바랍니다.

## 라이선스

Apache-2.0

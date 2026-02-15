import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // 같은 위치에 있는 App.tsx를 불러옵니다

// index.css 파일이 없다면 아래 줄은 삭제하거나 주석 처리하세요
// import './index.css' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

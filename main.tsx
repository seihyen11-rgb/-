import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // CSS 파일이 없다면 이 줄은 삭제해도 됩니다.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

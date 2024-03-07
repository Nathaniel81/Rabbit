import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from './components/ui/Toaster.tsx'
import { Provider } from 'react-redux';
import store from './redux/store'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <Toaster />
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  </Provider>
)

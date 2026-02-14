import { useState } from 'react'
import { toast } from 'react-toastify'
import './App.css'
import { ToastContainer } from 'react-toastify'
import NavBar from './components/NavBar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import { AppContextProvider } from './context/AppContext'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AppContextProvider>
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login/>} />
          </Routes>
        </BrowserRouter>
      </AppContextProvider>
    </>
  )
}

export default App

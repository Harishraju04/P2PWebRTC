import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Sender from './components/sender'
import Receiver from './components/receiver'


function App() {

 return(
    <BrowserRouter>
      <Routes>
          <Route path='/sender' element={<Sender></Sender>}></Route>
          <Route path='/receiver' element={<Receiver></Receiver>}></Route>
      </Routes>
  </BrowserRouter>
 )
  
}

export default App

import './App.css';
import React from 'react';
import Login from './components/Login';
import { useStateValue } from './ContextApi/StateProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';

function App() {

  const [{ user }] = useStateValue()
  const [showSidebar, setShowSidebar] = React.useState(true);

  return (
    <div className="app">
      {!user ? <Login /> :
        <div className='app__body'>
          <Router>
            <Sidebar showSidebar={showSidebar} toggleSidebar={() => setShowSidebar(!showSidebar)} />
            <Routes>
              <Route 
                path='/' 
                element={
                  <Chat 
                    isSidebarOpen={showSidebar} 
                    toggleSidebar={() => setShowSidebar(!showSidebar)} 
                  />
                } 
              />
              <Route 
                path='/rooms/:roomId' 
                element={
                  <Chat 
                    isSidebarOpen={showSidebar} 
                    toggleSidebar={() => setShowSidebar(!showSidebar)} 
                  />
                } 
              />
            </Routes>
          </Router>
        </div>
      }
    </div>
  );
}

export default App;

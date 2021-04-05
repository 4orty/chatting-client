import { Redirect, BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Chat from './Chat'
import Hook from './Hook'
import AppBak from './AppBak'

function App() {

  console.log(window.location.href)
  return (
      <BrowserRouter>
          <Route exact path="/">
              <Redirect to="/room/2" />
          </Route>
          <Route exact path="/room/2" component={AppBak}></Route>
          <Route exact path="/hook" component={Hook}></Route>
      </BrowserRouter>
  );
}

export default App;

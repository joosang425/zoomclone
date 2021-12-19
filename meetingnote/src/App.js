import React, { Component } from 'react';
import { BrowserRouter as Router, Route, BrowserRouter } from 'react-router-dom';
import { Home, Signup, Main, Script, pw_change,find_pw } from './pages';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
      <Router>
        <div>
          <BrowserRouter>
            <Route exact path='/' component={Home}/>
            <Route path = '/Signup' component={Signup}/>
            <Route path = '/Main' component={Main}/>
            <Route path = '/Script' component={Script}/>
            <Route path = '/find_pw' component={find_pw}/>
            <Route path = '/pw_change' component={pw_change}/>
          </BrowserRouter>
        </div>
      </Router>
    </div>
    );
  }
}

export default App;
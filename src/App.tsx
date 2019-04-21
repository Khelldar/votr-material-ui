import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { HomePage } from './HomePage';
import { CreateElectionPage } from './CreateElectionPage';
import { Flex } from 'rebass';

export const App: React.FC = () => {
  return (
    <Flex justifyContent="center">
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <Router>
          <div>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/create">Create</Link>
              </li>
            </ul>

            <hr />

            <Route exact path="/" component={HomePage} />
            <Route path="/create" component={CreateElectionPage} />
          </div>
        </Router>
      </div>
    </Flex>
  );
};

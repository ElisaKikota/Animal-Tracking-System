import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './Transitions.css';

const PageTransition = ({ children, location }) => (
  <TransitionGroup>
    <CSSTransition
      key={location.key}
      timeout={{ enter: 300, exit: 300 }}
      classNames="page"
    >
      {children}
    </CSSTransition>
  </TransitionGroup>
);

export default PageTransition;

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import raf from 'raf';

export default class Container extends PureComponent {

  static childContextTypes = {
    subscribe: PropTypes.func,
    unsubscribe: PropTypes.func,
    getParent: PropTypes.func
  }

  getChildContext() {
    return {
      subscribe: this.subscribe,
      unsubscribe: this.unsubscribe,
      getParent: this.getParent
    };
  }

  events = [
    'resize',
    'scroll',
    'touchstart',
    'touchmove',
    'touchend',
    'pageshow',
    'load'
  ]

  subscribers = [];

  subscribe = handler => {
    this.subscribers = this.subscribers.concat(handler);
  }

  unsubscribe = handler => {
    this.subscribers = this.subscribers.filter(current => current !== handler);
  }

  notifySubscribers = evt => {
    this.doNotifySubscribers(evt.currentTarget);
  }

  getParent = () => this.node

  componentDidMount() {
    this.events.forEach(event => window.addEventListener(event, this.notifySubscribers))
  }

  componentWillUnmount() {
    this.events.forEach(event => window.removeEventListener(event, this.notifySubscribers))
  }

  /**
   * Notifies the current node of a layout update.
   */
  notifyLayoutUpdate() {
    this.doNotifySubscribers(this.node);
  }

  render() {
    return (
      <div
        { ...this.props }
        ref={ node => this.node = node }
        onScroll={this.notifySubscribers}
        onTouchStart={this.notifySubscribers}
        onTouchMove={this.notifySubscribers}
        onTouchEnd={this.notifySubscribers}
      />
    );
  }

  /**
   * Notifies the subscribers of this container.
   * 
   * @param {HTMLElement} updateSource The source of the update.
   */
  doNotifySubscribers(updateSource) {
    if (!this.framePending) {
      
      raf(() => {
        this.framePending = false;
        const { top, bottom } = this.node.getBoundingClientRect();

        this.subscribers.forEach(handler => handler({
          distanceFromTop: top,
          distanceFromBottom: bottom,
          eventSource: updateSource === window ? document.body : this.node
        }));
      });
      this.framePending = true;
    }
  }
}

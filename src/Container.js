/* @flow */

import * as React from 'react';

type Props = {
  height: number,
  width: number,
  children: React.Node,
};

export default class Container extends React.Component<Props> {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#212733',
          color: '#fff',
          fontFamily: 'monospace',
          fontWeight: 'bold',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
            height: `${this.props.height + 2}em`,
            width: `${this.props.width + 2}em`,
            border: '1px double currentColor',
          }}
        >
          <div
            style={{
              position: 'relative',
              margin: '1em',
              height: `${this.props.height}em`,
              width: `${this.props.width}em`,
            }}
          >
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

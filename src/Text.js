/* @flow */

import * as React from 'react';

type Props = {|
  x: number,
  y: number,
  children: React.Node,
|};

export default class Text extends React.Component<Props> {
  render() {
    return (
      <span
        style={{
          position: 'absolute',
          top: `${this.props.y}em`,
          left: `${this.props.x}em`,
        }}
      >
        {this.props.children}
      </span>
    );
  }
}

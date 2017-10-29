/* @flow */

import * as React from 'react';
import Container from './Container';
import Text from './Text';
import Controller from './Controller';

type Position = {|
  +x: number,
  +y: number,
|};

type Layout = {|
  +height: number,
  +width: number,
|};

type Bullet = {|
  +id: number,
  +position: Position,
|};

type Monster = {|
  +id: number,
  +type: string,
  +lives: number,
  +position: Position,
|};

type Character = {|
  +type: string,
  +delta: Position,
  +points: number,
  +damage: number,
  +lives: number,
|};

type Props = {};

type State = {|
  lives: number,
  score: number,
  player: { position: Position },
  bullets: Bullet[],
  monsters: Monster[],
  layout: Layout,
  speed: number,
|};

const characters: Character[] = [
  { type: '😈', points: 1, delta: { x: 0, y: 0.25 }, damage: 0.1, lives: 1 },
  { type: '🎃', points: 1, delta: { x: 0, y: 0.25 }, damage: 0.1, lives: 1 },
  { type: '👹', points: 2, delta: { x: 0, y: 0.25 }, damage: 0.2, lives: 1 },
  { type: '🤡', points: 2, delta: { x: 0, y: 0.25 }, damage: 0.2, lives: 1 },
  { type: '💀', points: 1, delta: { x: 0, y: 0.5 }, damage: 0.2, lives: 1 },
  { type: '👻', points: 2, delta: { x: 0, y: 0.5 }, damage: 0.2, lives: 1 },
  { type: '👽', points: 3, delta: { x: 0, y: 0.5 }, damage: 0.3, lives: 1 },
  { type: '🤖', points: 5, delta: { x: 0, y: 0.5 }, damage: 0.3, lives: 1 },
  { type: '❤️', points: 0, delta: { x: 0, y: 0.25 }, damage: -1, lives: -1 },
];

const SCREEN_HEIGHT = 20;
const SCREEN_WIDTH = 30;

export default class Invaders extends React.Component<Props, State> {
  state = {
    lives: 3,
    score: 0,
    player: {
      position: {
        x: SCREEN_WIDTH / 2,
        y: SCREEN_HEIGHT - 1,
      },
    },
    bullets: [],
    monsters: [],
    layout: {
      height: SCREEN_HEIGHT,
      width: SCREEN_WIDTH,
    },
    speed: 300,
  };

  componentDidMount() {
    this._timer = setTimeout(this._handleTimer, this.state.speed);
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  _timer: number;
  _id: number = 0;

  _handleControlKey = (type: string) =>
    this.setState(state => {
      let { x } = state.player.position;

      switch (type) {
        case 'left':
          x = Math.max(x - 1, 0);
          break;
        case 'right':
          x = Math.min(x + 1, state.layout.width);
          break;
        default:
          return state;
      }

      return {
        player: { position: { x, y: state.player.position.y } },
      };
    });

  _handleTimer = (count: number = 0) => {
    if (this.state.lives === 0) {
      return;
    }

    this._loop(count);
    this._timer = setTimeout(
      () => this._handleTimer(count + 1),
      this.state.speed
    );
  };

  _loop = (count: number) =>
    this.setState(state => {
      const { player } = state;

      const lives = Math.min(
        7,
        Math.max(
          0,
          state.lives -
            state.monsters.reduce((damage, monster) => {
              /* $FlowFixMe */
              const character: Character = characters.find(
                c => c.type === monster.type
              );

              if (
                monster.position.x === player.position.x &&
                monster.position.y === player.position.y
              ) {
                return damage + character.damage > 0 ? 1 : -1;
              } else if (
                Math.abs(monster.position.y - state.layout.height) <= 1
              ) {
                return damage + Math.max(0, character.damage);
              }

              return damage;
            }, 0)
        )
      );

      const bullets = state.bullets
        .filter(
          bullet =>
            bullet.position.y > 0 &&
            !state.monsters.some(monster => this._isHit(monster, bullet))
        )
        .map(bullet => ({
          id: bullet.id,
          position: {
            x: bullet.position.x,
            y: bullet.position.y - 1,
          },
        }));

      if (count % 2 === 0) {
        bullets.push({
          id: this._id++,
          position: {
            x: player.position.x,
            y: player.position.y - 2,
          },
        });
      }

      const monsters = state.monsters
        .filter(
          monster =>
            monster.position.y < state.layout.height - 1 && monster.lives
        )
        .map(monster => {
          /* $FlowFixMe */
          const character: Character = characters.find(
            c => c.type === monster.type
          );
          return {
            id: monster.id,
            type: monster.type,
            lives: state.bullets.some(bullet => this._isHit(monster, bullet))
              ? monster.lives - 1
              : monster.lives,
            position: {
              x: monster.position.x + character.delta.x,
              y: monster.position.y + character.delta.y,
            },
          };
        });

      if (count % 8 === 0) {
        Array.from({
          length: Math.floor(Math.random() * (state.layout.width / 10)) + 1,
        }).forEach(() => {
          const character =
            characters[Math.floor(Math.random() * characters.length)];

          monsters.push({
            id: this._id++,
            type: character.type,
            lives: character.lives,
            position: {
              x: Math.floor(Math.random() * state.layout.width),
              y: 0,
            },
          });
        });
      }

      const score = monsters.reduce((sum, monster) => {
        if (monster.lives) {
          return sum;
        }
        /* $FlowFixMe */
        const character: Character = characters.find(
          c => c.type === monster.type
        );

        return sum + character.points;
      }, state.score);

      return { lives, bullets, monsters, score };
    });

  _isHit = (monster: Monster, bullet: Bullet) =>
    monster.position.x === bullet.position.x &&
    Math.abs(monster.position.y - bullet.position.y) <= 1;

  render() {
    const { lives, player, bullets, monsters } = this.state;

    if (lives === 0) {
      return (
        <Container
          height={this.state.layout.height}
          width={this.state.layout.width}
        >
          <Text
            x={(this.state.layout.width - 10) / 2}
            y={this.state.layout.height / 2}
          >
            GAME OVER. SCORE: {this.state.score}
          </Text>
        </Container>
      );
    }

    return (
      <Container
        height={this.state.layout.height}
        width={this.state.layout.width}
      >
        {bullets.map(bullet => (
          <Text key={bullet.id} x={bullet.position.x} y={bullet.position.y}>
            ⚡️
          </Text>
        ))}
        {monsters.map(monster => (
          <Text
            key={monster.id}
            x={Math.floor(monster.position.x)}
            y={Math.floor(monster.position.y)}
          >
            {monster.lives ? monster.type : '🔥'}
          </Text>
        ))}
        <Controller onControlKey={this._handleControlKey} />
        <Text x={player.position.x} y={player.position.y}>
          👾
        </Text>
        <Text x={0} y={0}>
          SCORE: {this.state.score}
        </Text>
        <Text x={this.state.layout.width - Math.ceil(this.state.lives)} y={0}>
          {Array.from({ length: Math.ceil(this.state.lives) })
            .map(() => '❤')
            .join('')}
        </Text>
      </Container>
    );
  }
}

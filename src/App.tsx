import { assign, createMachine } from "xstate";
import { useMachine } from "@xstate/react";
import * as React from "react";

// The goal is to control everythin with the machine
// TODOS
//

type Player = { name: string; symbol: string };
type Play = Player | null;
type Row = Array<Play>;
type Game = Array<Row>;

export default function App() {
  const tttMachineId = React.useId();
  const initialState = {
    game: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ] as Game,
    players: [] as Player[],
    currentPlayerIndex: null as number | null,
    winner: null as null | Player,
    events: [] as Array<unknown & { createdAt: Date }>
  };

  const tttMachine = createMachine(
    {
      id: tttMachineId,
      initial: "idle",
      type: "parallel",
      context: initialState,
      on: [{ event: "*", actions: "logEvent" }],
      states: {
        game: {
          initial: "idle",
          states: {
            idle: {
              on: {
                START_SETUP: {
                  target: "setup"
                }
              }
            },
            setup: {
              on: {
                CANCEL_SETUP: {
                  target: "idle"
                },
                ADD_PLAYER: {
                  actions: "addPlayer"
                }
              }
            },
            playing: {},
            won: {},
            drawn: {}
          },
          on: {
            RESET_GAME: {
              actions: "resetGame"
            }
          }
        },
        events: {
          initial: "logging",
          states: {
            logging: {
              on: {
                "*": { actions: "logEvent" }
              }
            }
          }
        }
      }
    },
    {
      actions: {
        addPlayer: assign({
          players: (context, event) => [...context.players, event.value]
        })
      },
      resetGame: assign((context, _event) => ({
        ...initialState,
        events: context.events
      })),
      logEvent: assign({
        events: (context, event) => {
          return [...context.events, { ...event, createdAt: Date.now() }];
        }
      })
    }
  );

  const [state, send] = useMachine(tttMachine);

  return (
    <>
      <pre>{JSON.stringify(state.context, null, 2)}</pre>
      <h1>Tic Tac Toe - XState version</h1>
      {state.matches("game.idle") && (
        <>
          <h2>Let's being, shall we?</h2>
          <button
            onClick={() => {
              send("START_SETUP");
            }}
          >
            Select players
          </button>
        </>
      )}
      {state.matches("game.setup") && (
        <>
          <h2>Select the players</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            onReset={() => {
              send("RESET_SETUP");
            }}
          >
            <button
              type="button"
              onClick={() => {
                send("ADD_PLAYER");
              }}
            >
              Add a player
            </button>
            <button type="submit">Start game</button>
            <button
              type="reset"
              onClick={() => {
                send("");
              }}
            >
              Clear form
            </button>
            <button type="button">Cancel</button>
          </form>
        </>
      )}
    </>
  );
}

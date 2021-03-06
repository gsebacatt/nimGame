import {winning} from "./nimFunctions";
import NimGame from "./NimGame";
import _ from "lodash";


//Map permite keys de cualquier tipo
let q = new Map();

export function train(n, state) {

    let player = new nimAi()


    for (let i = 0; i < n; i++) {
        let game = new nimGame(state)

        let last = {
            0: {"state": null, "action": null},
            1: {"state": null, "action": null}
        }

        while (true) {

            let state = [...game.piles] //copia del game state

            let action = player.choose_action(game, game.piles, true)

            last[game.player]["state"] = state
            last[game.player]["action"] = action

            game.move(action);
            let new_state = [...game.piles];

            if (game.winner !== null) {
                player.update(state, action, new_state, -1, game)
                player.update(last[game.player]["state"],
                    last[game.player]["action"],
                    new_state,
                    1, game)
                break;
            } else if (last[game.player]["state"] !== null) {
                player.update(
                    last[game.player]["state"],
                    last[game.player]["action"],
                    new_state,
                    0, game
                )
            }
        }
    }
    console.log("training terminado")

    //Retorna la IA entrenada
    return player;
}

function nimAi(alpha = 0.5, epsilon = 0.1) {
    this.alpha = alpha;
    this.epsilon = epsilon;
    this.q = q;

    this.update = (old_state, action, new_state, reward, game) => {
        let old = this.get_q_value(old_state, action);
        let best_future = this.best_future_reward(new_state, game)
        this.update_q_value(old_state, action, old, reward, best_future)
    }

    this.get_q_value = (state, action) => {
        let key = state.toString() + JSON.stringify(action);

        if (q.get(key)) {
            return q.get(key) //No estoy seguro de esta sintaxis
        } else {
            return 0;
        }
    }

    //Aplicacion de formula de q_learning/softmax
    this.update_q_value = (state, action, old_q, reward, future_rewards) => {

        if (state) {
            let key = state.toString() + JSON.stringify(action);
            //console.log(key)

            q.set(key, old_q + this.alpha * (reward + future_rewards - old_q))

            //console.log("after update q value: ")
            //console.log(q)
        }


    }


    this.best_future_reward = (state, game) => {
        let best_reward = 0;

        game.available_actions([...state]).forEach(action => {
            best_reward = Math.max(this.get_q_value(state, action), best_reward);
        })

        return best_reward;

    }
    this.choose_action = (game, state, eps = true) => {
        let best_action = null;
        //Convertir a array el set devuelto paa poder usar con la funcion random
        let actions = Array.from(game.available_actions([...state]));

        //Codigo anterior, necesita una opcion para random weighted
        // actions.forEach(action => {
        //     if (best_action === null || this.get_q_value(state, action) > best_reward) {
        //         best_reward = this.get_q_value(state, action);
        //         best_action = action;
        //     }
        // })
        //
        //
        // if (eps) {
        //     let weights = new Map();
        //     actions.forEach(action => {
        //         if (action === best_action) {
        //             weights[action] = [1 - this.epsilon];
        //         } else {
        //             weights[action] = this.epsilon / (actions.size - 1)
        //         }
        //     })
        //
        // }

        if (eps && Math.random() <= this.epsilon) {
            return getRandomSubarray(actions, 1)[0];
        }

        let best_reward = Number.NEGATIVE_INFINITY;

        actions.forEach(action => {
            if (this.get_q_value(state, action) > best_reward) {
                best_reward = this.get_q_value(state, action);
                best_action = action;
            }
        })

        // console.log("choosen action: ");
        // console.log(best_action);

        return best_action;
    }
}

//Para el entrenamiento nimGame deberia recibir el estado del juego
//solicitado por el usuario en nimGame.jsx, (1,3,5,7) es solo un placeholder
function nimGame(initial = [1, 3, 5, 7]) {
    //console.log("nim training game : " + initial)
    this.player = 0;
    this.piles = [...initial];
    this.winner = null;

    this.available_actions = (piles) => {
        //Set nativo de ES6, no probar con ES5!
        let actions = new Set();

        for (let i = 0; i < piles.length; i++) {
            Array(piles[i]).fill(0).forEach((_, j) => {
                j = j + 1;
                actions.add({i, j});
                j = j - 1;
            })
        }

        return actions;
    }

    this.other_player = (player) => {
        return player === 1 ? 0 : 1;
    }

    //Cambia al otro turno (ya que el jugador sigue siendo el mismo)
    this.switch_player = () => {
        this.player = this.other_player(this.player)
    }

    this.move = (action) => {
        const {i, j} = action;

        if (this.winner !== null) {
            console.log('Juego terminado');
            return;
        }
        if (i < 0 || i >= this.piles.length) {
            console.log("pila invalida");
            return;


        }
        if (j < 1 || j > this.piles[i]) {
            console.log("Numero de objetos no valido")
            return;
        }
        this.piles[i] -= j;
        this.switch_player();

        if (winning(this.piles)) {
            this.winner = this.player;
        }
    }
}

/*Esta funcion debe retornar el best move almacenado en q
* para todas las jugadas disponibles en este turno*/
export function rl(ai, gameState) {
    //obtener todos los actions available de un gameState

    let game = new nimGame(gameState);

    //Retorna un set
    let actions = game.available_actions([...gameState]);

    let best_reward = Number.NEGATIVE_INFINITY;
    let best_action = {row: 0, amount: 0};

    console.log(actions)

    actions.forEach(action => {
        let key = gameState.toString() + JSON.stringify(action);
        console.log("gameState: ");
        console.log(gameState);

        console.log("key: ")
        console.log(key)

        console.log("tabular q[key] value:")
        console.log(q.get(key))

        //buscar este key dentro de q
        if (q.get(key)) {
            if (q.get(key) > best_reward) {
                best_reward = q.get(key);
                best_action = action;
            }
        } else {
            //considerar casos donde no se cargo entonces tener inicializado a cero
        }
    })

    console.log("best_reward: ")
    console.log(best_reward)

    console.log(best_action)
    console.log(best_action)

    return {row: best_action.i, amount: best_action.j};
}


//Helper functions
function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

function weightedRand(spec) {
    var i, j, table = [];
    for (i in spec) {
        // The constant 10 below should be computed based on the
        // weights in the spec for a correct and optimal table size.
        // E.g. the spec {0:0.999, 1:0.001} will break this impl.
        for (j = 0; j < spec[i] * 10; j++) {
            table.push(i);
        }
    }
    return function () {
        return table[Math.floor(Math.random() * table.length)];
    }
}

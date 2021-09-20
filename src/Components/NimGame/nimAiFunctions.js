import {winning} from "./nimFunctions";
import NimGame from "./NimGame";
import _ from "lodash";

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

    this.q = new Map(); //la tabla q, seria un diccionario, map de ES6, permite keys as objeects
    this.alpha = alpha;
    this.epsilon = epsilon;

    this.update = (old_state, action, new_state, reward, game) => {
        let old = this.get_q_value(old_state, action);
        let best_future = this.best_future_reward(new_state, game)
        this.update_q_value(old_state, action, old, reward, best_future)
    }

    this.get_q_value = (state, action) => {
        if (this.q[{state, action}]) {
            return this.q[{state, action}] //No estoy seguro de esta sintaxis
        } else {
            return 0;
        }
    }

    //Aplicacion de formula de q_learning/softmax
    this.update_q_value = (state, action, old_q, reward, future_rewards) => {
        //this.q[{state, action}] = old_q + this.alpha * (reward + future_rewards - old_q);
        this.q.set({state, action}, old_q + this.alpha * (reward + future_rewards - old_q))
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
        let best_reward = 0;
        let actions = game.available_actions([...state]);


        actions.forEach(action => {
            if (best_action === null || this.get_q_value(state, action) > best_reward) {
                best_reward = this.get_q_value(state, action);
                best_action = action;
            }
        })


        if (eps) {
            let weights = new Map();
            actions.forEach(action => {
                if (action === best_action) {
                    weights[action] = [1 - this.epsilon];
                } else {
                    weights[action] = this.epsilon / (actions.size - 1)
                }
            })

            //best_action = actions[Math.floor(Math.random() * actions.length)];
            best_action = getRandomKey(actions);
            //best_action  = weightedRandom(weights)
        }

        console.log("choosen action: ");
        console.log(best_action);

        return best_action;
    }
}

//Para el entrenamiento nimGame deberia recibir el estado del juego
//solicitado por el usuario en nimGame.jsx, (1,3,5,7) es solo un placeholder
function nimGame(initial = [1, 3, 5, 7]) {
    console.log("nim training game : " + initial)
    this.player = 0;
    this.piles = [...initial];
    this.winner = null;

    this.available_actions = (piles) => {
        //Set nativo de ES6, no probar con ES5!
        let actions = new Set();

        for (let i = 0; i < piles.length; i++) {
            Array(piles[i]).fill(0).forEach((_, j) => {
                j =  j + 1;
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
        const {i,j} = action;

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

export function rl(gameState) {
    return {};
}

function randomChoice(p) {
    let rnd = p.reduce((a, b) => a + b) * Math.random();
    return p.findIndex(a => (rnd -= a) < 0);
}

function randomChoices(p, count) {
    return Array.from(Array(count), randomChoice.bind(null, p));
}

function weightedRandom(prob) {
    let i, sum = 0, r = Math.random();
    for (i in prob) {
        sum += prob[i];
        if (r <= sum) return i;
    }
}

//For set or map
function getRandomKey(collection) {
    let keys = Array.from(collection.keys());
    return keys[Math.floor(Math.random() * keys.length)];
}

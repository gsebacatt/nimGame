//Ajustar para minimax de busqueda limitada
//para el caso de nim que deberia retornar la funcion(que hay en cada ply)
//podria ser un objeto {row: , amount:, score: } cuanto sacar de que fila
//y minimax recibe el gameState y la profundidad, y el player como diferenciar?
//Se puede difernciar con un boolean isMax = true o isMax = false
//y en la primera llamada de la pila se manda isMax =True porque es la IA
export function minimaxDepth(game, depth, isMax) {

    //console.log(game)
    //console.log("depth:  " + depth)
    //console.log("isMax:     " + isMax)

    //Terminal State check comes first
    //Tener en cuenta que este juego no se puede empatar, gana uno o el otro
    if (depth === 0 || winning(game)) {
        if (isMax) {
            return {score: 10}
        } else {
            return {score: -10}
        }
    }

    //En este array se almacenaran las jugadas posibles
    let moves = [];

    for (let j = 0; j < game.length; j++) {
        //loop in range from 0 to game.lenght[i]
        Array(game[j]).fill(0).forEach((_, i) => {
            let move = {}
            move.row = j;
            move.amount = i + 1;

            console.log(game)
            console.log(j)
            console.log(i + 1)

            game[j] = game[j] - move.amount;

            console.log(game)

            let result = minimaxDepth(game, depth - 1, !isMax);

            move.score = result.score;

            //restore value
            game[j] = game[j] + move.amount;

            moves.push(move);
        });
    }

    console.log("moves :  ")
    console.log(moves)

    let bestMove;
    //El prototipo de move deberia ser {row: , amount:, score: }
    //El valor de score solo se usa dentro de minimax
    //El resto sirve para concretar la jugada

    //Casos de llamadas recursivas para max y min
    if (isMax) {
        let bestScore = -100000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 100000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }

    }

    //console.log("bestMove: ")
    //console.log(moves[bestMove])

    return moves[bestMove];
}

/*Define quien gana si el juego es normal o misėre*/
export function winning(gameState) {
    let sum = 0;
    gameState.forEach(line => {
        sum += line;
    })

    //console.log("sum: " + sum)
    if (
        sum === 0
    ) {
        return true;
    } else {
        return false;
    }
}


export function alphaBetaPruning(game, depth, alpha, beta, isMax) {
    if (depth === 0 || winning(game)) {
        if (isMax) {
            return {score: 10}
        } else {
            return {score: -10}
        }
    }

    let moves = [];

    for (let j = 0; j < game.length; j++) {
        Array(game[j]).fill(0).forEach((_, i) => {
            let move = {}
            move.row = j;
            move.amount = i + 1;

            console.log(game)
            console.log(j)
            console.log(i + 1)

            game[j] = game[j] - move.amount;

            console.log(game)

            //Esto se hace para obtener el score de esta jugada
            //El objetivo de la poda es evitar buscar un score de antemano
            let result = alphaBetaPruning(game, depth - 1, alpha, beta, !isMax);

            move.score = result.score;

            //restore value
            game[j] = game[j] + move.amount;

            moves.push(move);
        });
    }

    console.log("moves :  ")
    console.log(moves)

    let bestMove;

    if (isMax) {
        let bestScore = -100000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
                if (bestScore > beta) {
                    break;
                }
                alpha = Math.max(alpha, bestScore)
            }
        }
    } else {
        let bestScore = 100000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
                if (bestScore < alpha) {
                    break;
                }
                beta = Math.min(beta, bestScore)
            }
        }

    }

    return moves[bestMove];
}

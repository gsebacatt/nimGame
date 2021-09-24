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

    //Move en este caso va a ser un array de de objetos (cada uno con un array game adentro)
    let moves = [];

    //De cualquier forma necesito moves que sea un array con distintos states

    //Este loop no sera recursivo, solo se obtendran los estados hijos del estado inicial
    for (let j = 0; j < game.length; j++) {
        Array(game[j]).fill(0).forEach((_, i) => {
            let move = {game: [...game]};

            move.row = j;
            move.amount = i + 1; //Lo que se va a sacar de la fila j

            move.game[j] = move.game[j] - move.amount;

            move.score = 0;

            moves.push(move);
        })
    }


    let bestMove = null;
    let bestScore = isMax? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

    for (let i = 0; i < moves.length; i++) {
        let value  = alphaBetaPruning(moves[i].game , depth - 1, alpha, beta, !isMax )

        if(isMax){
            if(value.score> bestScore){
                bestScore = value;
                bestMove  = moves[i];
            }

            alpha = Math.max(alpha,value)
        }else{
            if(value.score < bestScore){
                bestScore = value;
                bestMove  = moves[i];
            }

            beta = Math.min(beta,value)
        }

        if (beta <= alpha) {
            console.log('Prune', alpha, beta);
            break;
        }
    }

    return bestMove;
}

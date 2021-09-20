import React, {Component} from "react";
import {minimaxDepth, alphaBetaPruning} from "./nimFunctions";
import '../../style.css';
import {rl, train} from "./nimAiFunctions";


export default class NimGame extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gameState: [],
            linesNumber: 0,
            depth: 0,
            currentRow: null,
            errorMessage: null,
            aiTurn: false,
            gameDone: false,
            result: null,
            algo: null,
            training: false,
            performance: null
        }
    }


    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    submitLines = (value) => {
        this.setState({
            linesNumber: +value.target.value,
            //gameState: new Array(Number(value.target.value)),
        })
    }

    submitDepth = (value) => {
        this.setState({
            depth: +value.target.value,
            //gameState: new Array(Number(value.target.value)),
        })
    }

    getLinesLoader = () => {
        let content = [];

        for (let i = 0; i < this.state.linesNumber; i++) {
            content.push(<li key={i}><span>Linea {i} : </span><input type="number" id={i}
                                                                     onBlur={(value) => this.loadGameState(i, value)}/>
            </li>)
        }

        return content;
    }

    loadGameState = (i, value) => {
        this.setState({
            gameState: [...this.state.gameState, +value.target.value]
        })
    }

    generateNim = () => {
        let content = [];

        if (this.state.gameState.length > 0) {
            for (let i = 0; i < this.state.linesNumber; i++) {
                content.push(<tr key={i} id={'row' + i}
                                 className='row'>{this.generateRow(this.state.gameState[i], i)}</tr>)
            }
        }


        return content;
    }

    generateRow = (number, row) => {
        let content = [];
        for (let i = 0; i < number; i++) {
            content.push(<td key={i} id={'elem_' + i} data={row} className='spot'
                             onClick={(i) => this.clickElement(i, row)}></td>)
        }
        return content;
    }

    /*Este metodo responde a la jugada del usuario*/
    clickElement = (event, row) => {
        const {currentRow} = this.state

        if (currentRow === row || currentRow === null) {
            //Solo movimientos en la misma fila ya seleccionada

            this.setState(state => {
                const list = this.state.gameState.map((rowVal, index) => {
                    return row === index ? rowVal - 1 : rowVal;
                })
                return {
                    currentRow: row,
                    gameState: list,
                }
            }, () => {
                //Finalmente controlar el estado del juego
                if (this.gameFinished()) {
                    this.setState({
                        result: "Has ganado la partida",
                    })
                }
            })

        } else {
            this.setState({
                errorMessage: "Solo puede eliminar de la misma fila",
            })
        }
    }

    /*Este metodo calcula y ejecuta la jugada de la IA*/
    playAi = () => {
        //bloquear boton de usuario
        this.setState({
            currentRow: null,
            errorMessage: "",
            aiTurn: true,
        }, () => {
            //Ejecutar llamada a algoritmo, inicialmente minimax, luego parametrizado

            let ai;
            if (this.state.algo === "rl") {
                //No queiro contar el tiempo de entrenamiento
                ai = train(10, this.state.gameState);
            }

            let bestMove;
            let t0 = performance.now();
            switch (this.state.algo) {
                case "minimax":
                    bestMove = minimaxDepth(this.state.gameState, this.state.depth, true);
                    break;
                case "alphabeta":
                    bestMove = alphaBetaPruning(this.state.gameState, -10000, +10000, this.state.depth, true);
                    break;
                case "rl":
                    console.log(ai);
                    break;
                    //bestMove = rl(ai, this.state.gameState);
            }

            let t1 = performance.now()

            debugger;


            this.setState(state => {
                const list = this.state.gameState.map((rowVal, index) => {
                    return bestMove.row === index ? rowVal - bestMove.amount : rowVal;
                })
                return {
                    gameState: list,
                    aiTurn: false,
                    performance: t1 - t0,
                }
            }, () => {
                if (this.gameFinished()) {
                    this.setState({
                        result: "IA gana la partida",
                    })
                }
            })

        })

    }

    resetGame = () => {
        this.setState({
            linesNumber: 0,
            gameState: [],
            result: null,
            algo: null,
            performance: null,
        })
    }

    gameFinished = () => {
        let sum = 0;
        this.state.gameState.forEach(line => {
            sum += line;
        })
        console.log(sum)
        if (sum === 1) {
            return true;
        } else {
            return false;
        }
    }

    selectAlgo = (event) => {
        this.setState({
            algo: event.target.value,
        })
    }


    render() {
        const {aiTurn} = this.state;
        return (
            <div className={""}>
                <h1>Nim</h1>

                <div id="radio-selection" onChange={this.selectAlgo}>
                    <input type="radio" value="minimax" name={"algo"} checked={this.state.algo === "minimax"}/> Minimax
                    <input type="radio" value="alphabeta" name={"algo"} checked={this.state.algo === "alphabeta"}/> Poda
                    Alfa Beta
                    <input type="radio" value="rl" name={"algo"} checked={this.state.algo === "rl"}/> Reinforcement
                    Learning
                </div>
                <hr/>
                <div id='selection'>
                    Numero de Lineas :
                </div>
                <input type="number" id="linesNumber" onChange={this.submitLines} value={this.state.linesNumber}/>

                {this.state.linesNumber > 0 && (
                    <>
                        <ul>
                            {this.getLinesLoader()}
                        </ul>

                        <button className={"hover"} disabled={aiTurn}
                                onClick={this.playAi}>Jugar
                        </button>
                        <button className={"hover"} disabled={!aiTurn}>IA</button>
                        <button className={"hover"} onClick={this.resetGame}>Reset</button>
                    </>
                )}


                {(this.state.algo === "minimax" || this.state.algo === "alphabeta") && (
                    <p>
                        Profundidad:
                        <input type="number" id="depth" onChange={this.submitDepth}/>
                    </p>
                )}
                <p>Estado del Juego: <span>{this.state.gameState.map(state => (<>{state} ,</>))}</span></p>


                <div id='result'>
                    {this.state.result}
                </div>

                <div id="error" style={{color: "red"}}>
                    {this.state.errorMessage !== null ? this.state.errorMessage : ""}
                </div>
                <table>
                    {this.generateNim()}
                </table>


                {this.state.performance !== null && (
                    <p>tiempo de IA : {this.state.performance} milisegundos</p>
                )}


            </div>
        )
    }
}


import React, {Component} from "react";
import {minimaxDepth} from "./nimFunctions";
import '../../style.css';


export default class NimGame extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gameState: [],
            linesNumber: 0,
            currentRow: null,
            errorMessage: null,
            aiTurn: false,
            gameDone: false,
            result: null,
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
            let bestMove = minimaxDepth(this.state.gameState, 3, true);
            //let bestMove = alphaBetaPruning(this.state.gameState,-10000,+10000, 3, true);

            this.setState(state => {
                const list = this.state.gameState.map((rowVal, index) => {
                    return bestMove.row === index ? rowVal - bestMove.amount : rowVal;
                })
                return {
                    gameState: list,
                    aiTurn: false,
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


    render() {
        const {aiTurn} = this.state;
        return (
            <div className={""}>
                <h1>Nim</h1>
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


            </div>
        )
    }
}


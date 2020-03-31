import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

// Slomux — упрощённая, сломанная реализация Flux.
// Перед вами небольшое приложение, написанное на React + Slomux.
// Это нерабочий секундомер с настройкой интервала обновления.

// Исправьте ошибки и потенциально проблемный код, почините приложение и прокомментируйте своё решение.

// При нажатии на "старт" должен запускаться секундомер и через заданный интервал времени увеличивать свое значение на значение интервала
// При нажатии на "стоп" секундомер должен останавливаться и сбрасывать свое значение

const createStore = (reducer, initialState) => {
    let currentState = initialState
    let listeners = []

    const getState = () => currentState
    const dispatch = action => {
        currentState = reducer(currentState, action)
        listeners.forEach(listener => listener())
    }

    const subscribe = listener => listeners.push(listener)

    const unSubscribe = () => (listeners = [])

    return { getState, dispatch, subscribe, unSubscribe }
}

const connect = (mapStateToProps, mapDispatchToProps) =>
    Component => {
        class WrappedComponent extends React.Component {
            componentDidMount() {
                this.context.store.subscribe(this.handleChange)
            }

            componentWillUnmount () {
                this.context.store.unSubscribe()
            }

            handleChange = () => {
                this.forceUpdate()
            }

            render() {
                return (
                    <Component
                        {...this.props}
                        {...mapStateToProps(this.context.store.getState(), this.props)}
                        {...mapDispatchToProps(this.context.store.dispatch, this.props)}
                    />
                )
            }
        }

        WrappedComponent.contextTypes = {
            store: PropTypes.object,
        }

        return WrappedComponent
    }

class Provider extends React.Component {
    getChildContext() {
        return {
            store: this.props.store,
        }
    }

    render() {
        return React.Children.only(this.props.children)
    }
}

Provider.childContextTypes = {
    store: PropTypes.object,
}

// APP

// actions
const CHANGE_INTERVAL = 'CHANGE_INTERVAL'

// action creators
const changeInterval = value => ({
    type: CHANGE_INTERVAL,
    payload: value,
})


// reducers
const reducer = (state, action) => {
    switch(action.type) {
        case CHANGE_INTERVAL:
            return {
                ...state,
                currentInterval: state.currentInterval + action.payload
            }
        default:
            return {}
    }
}

// components

class IntervalComponent extends React.Component {
    render() {
        return (
            <div>
                <span>Интервал обновления секундомера: {this.props.currentInterval} сек.</span>
                <span>
                  <button onClick={() => this.props.changeInterval(-1)}>-</button>
                  <button onClick={() => this.props.changeInterval(1)}>+</button>
                </span>
            </div>
        )
    }
}

const Interval = connect(
    state => ({
        currentInterval: state.currentInterval,
    }),
    dispatch => ({
        changeInterval: value => dispatch(changeInterval(value)),
    }),
)(IntervalComponent)

class TimerComponent extends React.Component {
    constructor(props) {
        super(props)

        this.handleStart = this.handleStart.bind(this)
        this.handleStop = this.handleStop.bind(this)
    }

    componentDidUpdate (prevProps) {
        if (prevProps.currentInterval !== this.props.currentInterval && this.state.currentTime !== 0) {
            this.resetTimer()
            this.handleStart()
        }
    }

    timer = null

    state = {
        currentTime: 0,
    }

    handleStart() {
        this.timer = setInterval(() => this.setState((state, props) => ({
            currentTime: state.currentTime + this.props.currentInterval,
        })), this.props.currentInterval * 1000)
    }

    handleStop() {
        this.resetTimer()
        this.setState({ currentTime: 0 })
    }

    resetTimer() {
        clearInterval(this.timer)
    }

    render() {
        return (
            <div>
                <Interval />
                <div>
                    Секундомер: {this.state.currentTime} сек.
                </div>
                <div>
                    <button onClick={this.handleStart}>Старт</button>
                    <button onClick={this.handleStop}>Стоп</button>
                </div>
            </div>
        )
    }
}

const Timer = connect(state => ({
    currentInterval: state.currentInterval,
}), () => {})(TimerComponent)

const initialState = {
    currentInterval: 1,
}

// init
ReactDOM.render(
    <Provider store={createStore(reducer, initialState)}>
        <Timer />
    </Provider>,
    document.getElementById('root')
)

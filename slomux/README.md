https://codepen.io/gnvcor/pen/mdJvNXK

1) Поправил обработчики handleStart и handleStop в TimerComponent: терялся контекст.
2) Исправил неверную работу с connect в контейнере Interval: агрументы, передаваемые в connect были перепутаны местами.
3) Поправил работу функции connect: исправил потенциальное место утечки памяти. В исправленном варианте, подписываюсь на события в componentDidMount + добавил отписку в componentWillUnmount.
4) Добавил initialState для стора + сделал его объектом, так как с примитовом работать не удобно.
5) Поправил работу таймера: вместо setTimeout заюзал setInterval

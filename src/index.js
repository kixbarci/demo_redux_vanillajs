import { createStore } from "redux";
import { createSelector } from "reselect";

const initialState = {
  isRunning: false,
  intervalId: null,
  time: 0,
  history: [],
};

function timerReducer(state= initialState, action) {
  if (typeof state === "undefined") {
    return initialState;
  }

  console.log(state, action);

  switch (action.type) {
    case "START_TIMER":
      return { ...state, isRunning: true, intervalId: action.payload };
    case "STOP_TIMER":
      return { ...state, isRunning: false, intervalId: null, time: 0 };
    case "UPDATE_TIMER":
      return { ...state, time: action.payload };
    case "ADD_HISTORY":
      return { ...state, history: [...state.history, action.payload] };
    case "CLEAR_HISTORY":
      return { ...state, history: [] };
    default:
      return state;
  }
}

const INTERVAL = 10;
const store = createStore(timerReducer);
const startStopButton = document.querySelector("#start-stop");
const lapResetButton = document.querySelector("#lap-reset");
const timeLabel = document.querySelector("#time");
const historyList = document.querySelector("#history");

const timeSelector = (state) => state.time;

const formattedTimeSelector = createSelector(timeSelector, (time) =>
  formatTime(time)
);

render(store.getState());
store.subscribe(render);

startStopButton.addEventListener("click", () =>
  store.getState().isRunning ? stopTimer() : startTimer()
);

lapResetButton.addEventListener("click", () =>
  store.getState().isRunning ? addHistory() : clearHistory()
);

function addHistory() {
  const state = store.getState();
  store.dispatch({ type: "ADD_HISTORY", payload: formattedTimeSelector(state) });
}

function clearHistory() {
  store.dispatch({ type: "CLEAR_HISTORY" });
}

function startTimer() {
  const intervalId = setInterval(
    () => {
        const state = store.getState();
        store.dispatch({ type: "UPDATE_TIMER", payload: state.time + INTERVAL })
    },
    INTERVAL
  );
  store.dispatch({ type: "START_TIMER", payload: intervalId });
}

function stopTimer() {
  const intervalId = store.getState().intervalId;
  clearInterval(intervalId);
  store.dispatch({ type: "STOP_TIMER" });
}

function render() {
  const state = store.getState();
  timeLabel.textContent = formattedTimeSelector(state);
  startStopButton.textContent = state.isRunning ? "Stop" : "Start";
  lapResetButton.textContent = state.isRunning ? "Lap" : "Reset";
  historyList.innerHTML = "";
  if (state.history && state.history.length) {
    state.history.forEach((entry) => {
      const child = document.createElement("li");
      child.textContent = entry;
      historyList.appendChild(child);
    });
  } else {
    const child = document.createElement("li");
    child.textContent = "No Entries";
    historyList.appendChild(child);
  }
}

function getTimeParts(ms) {
  const seconds = ms / 1000;
  return {
    min: Math.floor(seconds / 60),
    sec: Math.floor(seconds % 60),
    ms: ms % 1000,
  };
}

function formatTime(time) {
  const { min, sec, ms } = getTimeParts(time);
  return `${min.toString().padStart(2, "0")}:${sec
    .toString()
    .padStart(2, "0")}:${ms.toString().padStart(3, "0")}`;
}

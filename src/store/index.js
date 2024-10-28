import { applyMiddleware, createStore } from "redux";
import {thunk} from "redux-thunk"; // Correctly import thunk
import rootReducers from "../reducers";

const store = createStore(rootReducers, applyMiddleware(thunk)); // Use thunk here

export default store;

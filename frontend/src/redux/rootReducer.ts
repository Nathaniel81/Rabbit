import { combineReducers } from '@reduxjs/toolkit';
import modalReducer from './slices/modalSlice';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
	modal: modalReducer,
	userInfo: authReducer
})

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

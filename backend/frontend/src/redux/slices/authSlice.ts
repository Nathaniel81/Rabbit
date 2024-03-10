import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

interface User {
  user_id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const loginWithGithub = createAsyncThunk(
  'auth/loginWithGithub',
  async (code: string , { rejectWithValue }) => {
    try {
      const resp = await axios.post('/api/user/auth/github/', { code });
      const result = resp.data;
      const user: User = {
        user_id: result.user_id,
        username: result.username,
        email: result.email
      };
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginWithGithub.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginWithGithub.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      // eslint-disable-next-line
      // @ts-ignore
      .addCase(loginWithGithub.rejected, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload || null;
      });
  }
});

export default authSlice.reducer;

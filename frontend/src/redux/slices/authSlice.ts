import { 
  createSlice, 
  createAsyncThunk, 
  PayloadAction 
} from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { getCsrfToken } from '@/lib/utils';


interface User {
  user_id: string;
  username: string;
  email: string;
  profile_picture: string;
}
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo') as string) : null,
  loading: false,
  error: null,
};

export const loginWithGithub = createAsyncThunk(
  'auth/loginWithGithub',
  async (code: string, { rejectWithValue }) => {
    try {
      const resp = await axios.post('/api/user/auth/github/', { code });
      const result = resp.data;
      const user: User = {
        user_id: result.user_id,
        username: result.username,
        email: result.email,
        profile_picture: result.profile_picture,
      };
      localStorage.setItem('userInfo', JSON.stringify(user));
      return user;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout', 
  async (_, { rejectWithValue }) => {
  try {
    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "x-csrftoken": getCsrfToken()
      },
    }
    const response = await axios.post('/api/user/logout/', config);
    localStorage.removeItem('userInfo');
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    return rejectWithValue(err.response?.data);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetUserInfo: () => initialState,
    updateUsername: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.username = action.payload;
      }
    },
    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profile_picture = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        return initialState;
      })
      .addCase(loginWithGithub.pending, (state: AuthState) => {
        state.loading = true;
      })
      .addCase(loginWithGithub.fulfilled, (state: AuthState, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginWithGithub.rejected, (state: AuthState, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload ? String(action.payload) : null;
      });
  },
});

export default authSlice.reducer;
export const { 
  resetUserInfo, 
  updateUsername, 
  updateProfilePicture 
} = authSlice.actions;

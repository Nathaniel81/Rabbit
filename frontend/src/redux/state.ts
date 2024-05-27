import { 
    createSlice, 
    createAsyncThunk, 
    PayloadAction 
  } from '@reduxjs/toolkit';
  import axios, { AxiosError } from 'axios';
  import { getCsrfToken } from '@/lib/utils';
  
  
  export interface User {
    user_id: string;
    username: string;
    email: string;
    profile_picture: string;
  }

  interface Modal {
    isOpen: boolean,
    modalType: null,
  }

  interface appState {
    user: User | null;
    modal: Modal;
  }

  const initialState: appState = {
    user: null,
    modal: {
        isOpen: false,
        modalType: null,
    }
  };
  
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
      setLogin: (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      },
      resetUser: (state) => {
        state.user = null;
      },
      openModal: (state, action) => {
        state.modal.isOpen = true;
        state.modal.modalType = action.payload;
      },
      closeModal: (state) => {
        state.modal.isOpen = false;
        state.modal.modalType = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(logout.fulfilled, (state) => {
          state.user = null;
        })
      }
  });
  
  export default authSlice.reducer;
  export const { 
    updateUsername, 
    updateProfilePicture,
    setLogin,
    resetUser,
    openModal,
    closeModal
  } = authSlice.actions;
  
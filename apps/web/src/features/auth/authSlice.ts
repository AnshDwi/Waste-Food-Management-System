import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '../../lib/api';
import type { AuthUser } from './authTypes';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  initialized: boolean;
  error: string | null;
  rememberMe: boolean;
  lastActivityAt: number | null;
};

type AuthPayload = {
  accessToken: string;
  user: AuthUser;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'idle',
  initialized: false,
  error: null,
  rememberMe: false,
  lastActivityAt: null
};

const parseError = (error: unknown) => {
  const axiosError = error as AxiosError<{ error?: string }>;
  return axiosError.response?.data?.error ?? 'Something went wrong. Please try again.';
};

export const login = createAsyncThunk<
  AuthPayload,
  { email: string; password: string; rememberMe: boolean },
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', payload);
    return response.data.data as AuthPayload;
  } catch (error) {
    return rejectWithValue(parseError(error));
  }
});

export const register = createAsyncThunk<
  AuthPayload,
  { name: string; email: string; password: string; role: 'DONOR' | 'NGO' | 'VOLUNTEER'; rememberMe: boolean },
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', payload);
    return response.data.data as AuthPayload;
  } catch (error) {
    return rejectWithValue(parseError(error));
  }
});

export const restoreSession = createAsyncThunk<AuthPayload, void, { rejectValue: string }>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const refreshResponse = await api.post('/auth/refresh');
      return refreshResponse.data.data as AuthPayload;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    return rejectWithValue(parseError(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    markActivity(state) {
      state.lastActivityAt = Date.now();
    },
    setSession(state, action: PayloadAction<AuthPayload>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'authenticated';
      state.initialized = true;
      state.error = null;
      state.lastActivityAt = Date.now();
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'idle';
      state.error = null;
      state.initialized = true;
      state.lastActivityAt = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = 'authenticated';
        state.initialized = true;
        state.rememberMe = true;
        state.lastActivityAt = Date.now();
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Unable to log in.';
        state.initialized = true;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = 'authenticated';
        state.initialized = true;
        state.lastActivityAt = Date.now();
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'Unable to create account.';
        state.initialized = true;
      })
      .addCase(restoreSession.pending, (state) => {
        state.status = state.user ? 'authenticated' : 'loading';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = 'authenticated';
        state.initialized = true;
        state.error = null;
        state.lastActivityAt = Date.now();
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = 'idle';
        state.initialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = 'idle';
        state.initialized = true;
        state.lastActivityAt = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = 'idle';
        state.initialized = true;
        state.lastActivityAt = null;
      });
  }
});

export const { clearAuthError, markActivity, setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;

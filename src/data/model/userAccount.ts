import { EVENT_EMITTER_NAME, EventEmitter } from '@/lib/event-emitter';
import moment from 'moment-timezone';

const STORAGE_KEY = 'authInfo';

export type UserAccountModel = {
  id: string | null;
  username: string | null;
  email: string | null;
  roleType: string | null;
  token: string | null;

  expiration?: moment.Moment | null;
  expired?: boolean | null;
  createdAt?: string | null;
};

let data: UserAccountModel = {
  id: null,
  username: null,
  email: null,
  roleType: null,
  token: null,

  expiration: null,
  expired: false,
  createdAt: null,
};

interface AccountStorage {
  id: string;
  username: string;
  email: string;
  roleType: string;
  token: string;

  expiration?: string;
  createdAt?: string;
}

export const retrieveAuthToken = (): string | null => {
  const { expiration, token } = data;
  const nowMm = moment().add(2, 'minutes');

  if (!!expiration && expiration.isAfter(nowMm)) return token;

  onAuthExpired();

  return null;
};

const onAuthExpired = (): void => {
  clearData();
};

export const invalidateAccount = (): void => {
  clearData();
  onAccountChange();
};

const clearData = (): void => {
  data = {
    id: null,
    username: null,
    email: null,
    roleType: null,
    token: null,

    expiration: null,
    expired: false,
    createdAt: null,
  };

  localStorage.removeItem(STORAGE_KEY);
};

export const authAccount = (
  id: string,
  username: string,
  email: string,
  roleType: string,
  token: string
): void => {
  data = {
    id,
    username,
    email,
    roleType,
    token,
    expired: false,
  };

  const dataStorage: AccountStorage = {
    id,
    username,
    email,
    roleType,
    token,
  };

  const storageStr = JSON.stringify(dataStorage);
  localStorage.setItem(STORAGE_KEY, storageStr);

  // onAccountChange();
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEY); // Adjust based on your auth logic
};

const onAccountChange = (): void => {
  const newData = { ...data };
  EventEmitter.emit(EVENT_EMITTER_NAME.USER_ACCOUNT_CHANGE, newData);
};

const loadStorage = (): void => {
  const dataStr = localStorage.getItem(STORAGE_KEY);
  if (dataStr) {
    const { id, email, username, roleType, token }: AccountStorage =
      JSON.parse(dataStr);

    data = {
      id,
      token,
      username,
      email,
      roleType,
    };

    onAccountChange();
  }
};
loadStorage();

export const subscribeAccountChange = (
  onChange: (data: UserAccountModel) => void
): void => {
  EventEmitter.subscribe(EVENT_EMITTER_NAME.USER_ACCOUNT_CHANGE, onChange);
};

export const unsubscribeAccountChange = (
  onChange: (data: UserAccountModel) => void
): void => {
  EventEmitter.unsubscribe(EVENT_EMITTER_NAME.USER_ACCOUNT_CHANGE, onChange);
};

EventEmitter.subscribe(
  EVENT_EMITTER_NAME.EVENT_UNAUTHORIZED_USER,
  onAuthExpired
);

export const getLoggedInUserInfo = (): UserAccountModel => {
  return { ...data };
};

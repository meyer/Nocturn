import Actions from '../actions';

export const listsByUserId = (state = {}, action) => {
  switch (action.type) {
    case Actions.SET_LISTS:
      return {
        ...state,
        [action.account.id_str]: action.lists,
      };
    default:
      return state;
  }
}

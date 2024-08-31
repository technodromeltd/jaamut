import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GroupState {
  currentGroup: string | null;
}

const initialState: GroupState = {
  currentGroup: null,
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setCurrentGroup: (state, action: PayloadAction<string>) => {
      state.currentGroup = action.payload;
    },
  },
});

export const { setCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;

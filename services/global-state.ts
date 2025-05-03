import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AttendanceState = {
  isCheckedIn: boolean;
  numberOfEntryToday: number;
  lastEntryTime: Date | null;
  checkedInToggle: () => void;
  // setCheckInStatus: (nEntry: number, lastEntryTime: Date) => void;
}

export const attendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      isCheckedIn: false,
      numberOfEntryToday: 0,
      lastEntryTime: null,
      checkedInToggle: () => set((state) => ({ isCheckedIn: !state.isCheckedIn })),
    }),
    {
      name: 'attendance-storage',
    }
  )
);

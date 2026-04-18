import { create } from "zustand";       // Import the create function from Zustand to create a store

export const useStore= create((set)=>({
    rain: 0,
    setRain: (value)=> set({rain: value}),
}))


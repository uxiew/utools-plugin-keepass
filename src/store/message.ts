import { StateCreator } from "zustand";
import type { MessageProps } from "../components/Message";

type Message = MessageProps['message'] | null

export interface MessageStore {
  message: Message
  setMessage: (message: Message) => void
}


export const createMessageStore: StateCreator<MessageStore, [], [], MessageStore> = (set) => ({
  message: null,
  setMessage: (message: Message) => set({
    message
  })
})

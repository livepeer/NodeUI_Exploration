import { createContext } from 'react'

/** Call with a node ID to open the edit sidebar for that node */
export const EditSidebarContext = createContext<((nodeId: string) => void) | null>(null)

export interface Member {
  id: string
  name: string
  paymentType: "Monthly" | "Yearly"
  paymentStatus: "Paid" | "Unpaid"
  lastPaymentDate: string // ISO date string
  nextDueDate: string // ISO date string
  notes: string
}

export interface Transaction {
  id: string
  date: string // ISO date string
  amount: number
  memberId: string | null // Null for general outgoing costs (e.g., YouTube subscription itself)
  description: string
  type: "Incoming" | "Outgoing"
}

export interface CardDetail {
  id: string
  cardName: string
  lastFourDigits: string
  expiryDate: string // MM/YY
  notes: string
}

export interface CardTransaction {
  id: string
  date: string // ISO date string
  amount: number
  description: string
  type: "Deposit" | "Withdrawal" // Deposit to card, Withdrawal from card
}

export interface AppSettings {
  id: string
  youtubePremiumCost: number
  lastUpdated: string // ISO date string
}

export interface DataStore {
  members: Member[]
  transactions: Transaction[]
  cardDetail: CardDetail | null // Only one card detail for simplicity
  cardTransactions: CardTransaction[]
  settings: AppSettings
}

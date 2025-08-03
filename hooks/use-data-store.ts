"use client"

import { useState, useCallback, useEffect } from "react"
import type { Member, Transaction, DataStore, CardDetail, CardTransaction } from "@/lib/types"

const LOCAL_STORAGE_KEY = "ytracker-data"

const initialData: DataStore = {
  members: [
    {
      id: "member-1",
      name: "You (Owner)",
      paymentType: "Monthly",
      paymentStatus: "Paid",
      lastPaymentDate: new Date().toISOString().split("T")[0],
      nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
      notes: "Your own contribution",
    },
    {
      id: "member-2",
      name: "Alice",
      paymentType: "Monthly",
      paymentStatus: "Unpaid",
      lastPaymentDate: "2025-07-01",
      nextDueDate: "2025-08-01",
      notes: "Friend from college",
    },
    {
      id: "member-3",
      name: "Bob",
      paymentType: "Yearly",
      paymentStatus: "Paid",
      lastPaymentDate: "2025-01-15",
      nextDueDate: "2026-01-15",
      notes: "Brother",
    },
    {
      id: "member-4",
      name: "Charlie",
      paymentType: "Monthly",
      paymentStatus: "Paid",
      lastPaymentDate: new Date().toISOString().split("T")[0],
      nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
      notes: "Cousin",
    },
    {
      id: "member-5",
      name: "Diana",
      paymentType: "Monthly",
      paymentStatus: "Unpaid",
      lastPaymentDate: "2025-07-05",
      nextDueDate: "2025-08-05",
      notes: "Sister",
    },
  ],
  transactions: [
    {
      id: "txn-1",
      date: new Date().toISOString().split("T")[0],
      amount: 18.99,
      memberId: null,
      description: "YouTube Premium Monthly Subscription Cost",
      type: "Outgoing",
    },
    {
      id: "txn-2",
      date: new Date().toISOString().split("T")[0],
      amount: 3.79,
      memberId: "member-1",
      description: "Your contribution",
      type: "Incoming",
    },
    {
      id: "txn-3",
      date: "2025-07-20",
      amount: 3.79,
      memberId: "member-4",
      description: "Charlie's monthly payment",
      type: "Incoming",
    },
    {
      id: "txn-4",
      date: "2025-01-15",
      amount: 45.48,
      memberId: "member-3",
      description: "Bob's yearly payment",
      type: "Incoming",
    },
  ],
  cardDetail: {
    id: "card-1",
    cardName: "YouTube Card",
    lastFourDigits: "1234",
    expiryDate: "12/28",
    notes: "Main card for YouTube Premium",
  },
  cardTransactions: [
    {
      id: "card-txn-1",
      date: new Date().toISOString().split("T")[0],
      amount: 50.0,
      description: "Initial deposit",
      type: "Deposit",
    },
    {
      id: "card-txn-2",
      date: new Date().toISOString().split("T")[0],
      amount: 18.99,
      description: "YouTube Premium deduction",
      type: "Withdrawal",
    },
  ],
}

export const useDataStore = () => {
  const [data, setData] = useState<DataStore>(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return storedData ? JSON.parse(storedData) : initialData
    }
    return initialData
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
    }
  }, [data])

  const addMember = useCallback((member: Omit<Member, "id">) => {
    setData((prev) => ({
      ...prev,
      members: [...prev.members, { ...member, id: crypto.randomUUID() }],
    }))
  }, [])

  const updateMember = useCallback((updatedMember: Member) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === updatedMember.id ? updatedMember : m)),
    }))
  }, [])

  const deleteMember = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
      transactions: prev.transactions.filter((t) => t.memberId !== id), // Also remove transactions associated with the member
    }))
  }, [])

  const addTransaction = useCallback((transaction: Omit<Transaction, "id">) => {
    setData((prev) => ({
      ...prev,
      transactions: [...prev.transactions, { ...transaction, id: crypto.randomUUID() }],
    }))
  }, [])

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)),
    }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  const updateCardDetail = useCallback((updatedDetail: CardDetail) => {
    setData((prev) => ({
      ...prev,
      cardDetail: updatedDetail,
    }))
  }, [])

  const addCardTransaction = useCallback((cardTransaction: Omit<CardTransaction, "id">) => {
    setData((prev) => ({
      ...prev,
      cardTransactions: [...prev.cardTransactions, { ...cardTransaction, id: crypto.randomUUID() }],
    }))
  }, [])

  const updateCardTransaction = useCallback((updatedCardTransaction: CardTransaction) => {
    setData((prev) => ({
      ...prev,
      cardTransactions: prev.cardTransactions.map((t) =>
        t.id === updatedCardTransaction.id ? updatedCardTransaction : t,
      ),
    }))
  }, [])

  const deleteCardTransaction = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      cardTransactions: prev.cardTransactions.filter((t) => t.id !== id),
    }))
  }, [])

  return {
    members: data.members,
    transactions: data.transactions,
    cardDetail: data.cardDetail,
    cardTransactions: data.cardTransactions,
    addMember,
    updateMember,
    deleteMember,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateCardDetail,
    addCardTransaction,
    updateCardTransaction,
    deleteCardTransaction,
  }
}

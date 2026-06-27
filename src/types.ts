export interface CookieCardItem {
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface OrderTotals {
  itemCount: number
  subtotal: number
  discount: number
  total: number
}

export interface OrderDraft {
  quantities: string[]
  name: string
  phone: string
  email: string
  pickup: string
}

export interface OrderData {
  items: CookieCardItem[]
  itemCount: number
  subtotal: number
  discount: number
  total: number
  name: string
  phone: string
  email: string
  pickup: string
}

export interface WeeklyState {
  weekStart: string
  ordered: number
  orders: Record<string, number>
}

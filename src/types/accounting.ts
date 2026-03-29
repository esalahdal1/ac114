export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface Account {
  id: string;
  name: string;
  code: string;
  parent_id: string | null;
  type: AccountType;
  is_group: boolean;
  balance: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  created_at: string;
}

export interface JournalLine {
  id: string;
  entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  description: string;
}

export interface LedgerTransaction {
  id: string;
  date: string;
  account_id: string;
  entry_id: string;
  debit: number;
  credit: number;
  balance_after: number;
  description: string;
}

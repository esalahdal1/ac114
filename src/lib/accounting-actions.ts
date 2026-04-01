import { createClient } from './supabase';
import { Account, AccountType, JournalEntry, JournalLine, LedgerTransaction } from '@/types/accounting';

const supabase = createClient();

// Accounts Functions
export const getAccounts = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('code');
  if (error) throw error;
  return data as Account[];
};

export const deleteAccount = async (id: string) => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const getJournalEntryDetails = async (entryId: string) => {
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', entryId)
    .single();
  
  if (entryError) throw entryError;

  const { data: lines, error: linesError } = await supabase
    .from('journal_lines')
    .select('*, accounts(name, code)')
    .eq('entry_id', entryId)
    .order('id');

  if (linesError) throw linesError;

  return { ...entry, lines };
};

export const createAccount = async (account: Partial<Account>) => {
  const { data, error } = await supabase
    .from('accounts')
    .insert([account])
    .select()
    .single();
  if (error) throw error;
  return data as Account;
};

export const getLastAccountCode = async (parentId: string | null, type: AccountType) => {
  let query = supabase
    .from('accounts')
    .select('code')
    .eq('type', type);
  
  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else {
    query = query.is('parent_id', null);
  }

  const { data, error } = await query.order('code', { ascending: false }).limit(1);
  
  if (error) throw error;
  return data && data.length > 0 ? data[0].code : null;
};

// Journal Entries Functions
export const createJournalEntry = async (entry: Partial<JournalEntry>, lines: Partial<JournalLine>[]) => {
  // Use a transaction (Supabase RPC or sequential calls)
  // For simplicity here, we use sequential calls, but in production, we'd use an RPC function
  
  const { data: entryData, error: entryError } = await supabase
    .from('journal_entries')
    .insert([entry])
    .select()
    .single();
  
  if (entryError) throw entryError;

  const linesWithEntryId = lines.map(line => ({
    ...line,
    entry_id: entryData.id
  }));

  const { error: linesError } = await supabase
    .from('journal_lines')
    .insert(linesWithEntryId);

  if (linesError) throw linesError;

  // Update account balances
  for (const line of lines) {
    if (!line.account_id) continue;
    
    // Get current account balance
    const { data: account, error: getError } = await supabase
      .from('accounts')
      .select('balance, type')
      .eq('id', line.account_id)
      .single();
    
    if (getError) throw getError;

    // Calculate new balance based on account type and entry (debit/credit)
    let balanceChange = 0;
    const debit = line.debit || 0;
    const credit = line.credit || 0;

    // Assets and Expenses: Debit increases balance, Credit decreases it
    // Liabilities, Equity, and Revenue: Credit increases balance, Debit decreases it
    if (account.type === 'Asset' || account.type === 'Expense') {
      balanceChange = debit - credit;
    } else {
      balanceChange = credit - debit;
    }

    const newBalance = (Number(account.balance) || 0) + balanceChange;

    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', line.account_id);

    if (updateError) throw updateError;
  }

  return entryData;
};

// Ledger Functions
export const getLedgerTransactions = async (accountId?: string) => {
  let query = supabase
    .from('journal_lines')
    .select(`
      id,
      debit,
      credit,
      description,
      account_id,
      accounts (name, code),
      journal_entries (date, reference)
    `)
    .order('id', { ascending: false });

  if (accountId) {
    query = query.eq('account_id', accountId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Dashboard Stats
export const getDashboardStats = async () => {
  const { data: accountsData, error } = await supabase
    .from('accounts')
    .select('balance, type');
  
  if (error) throw error;

  const totalAssets = accountsData?.filter(a => a.type === 'Asset').reduce((sum, a) => sum + Number(a.balance), 0) || 0;
  const totalIncome = accountsData?.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + Number(a.balance), 0) || 0;
  const totalExpenses = accountsData?.filter(a => a.type === 'Expense').reduce((sum, a) => sum + Number(a.balance), 0) || 0;

  return {
    totalBalance: totalAssets,
    monthlyIncome: totalIncome,
    monthlyExpenses: totalExpenses,
    netProfit: totalIncome - totalExpenses
  };
};

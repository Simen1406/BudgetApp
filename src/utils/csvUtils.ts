import { Transaction } from '../components/dashboard/RecentTransactions';

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      new Date(t.date).toISOString().split('T')[0],
      t.type,
      t.category,
      t.amount,
      t.note || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const importTransactionsFromCSV = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const transactions: Transaction[] = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            return {
              id: crypto.randomUUID(),
              date: new Date(values[0]),
              type: values[1] as 'income' | 'expense',
              category: values[2],
              amount: parseFloat(values[3]),
              note: values[4]
            };
          });
          
        resolve(transactions);
      } catch (error) {
        reject(new Error('Invalid CSV format'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
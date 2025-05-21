import { Transaction } from '../components/dashboard/RecentTransactions';
import { isValid, parse } from 'date-fns';

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  const headers = ['date', 'type', 'income', 'money out', 'category'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      new Date(t.date).toISOString().split('T')[0],
      t.note || '', // Using note field for transaction type
      t.type === 'income' ? t.amount.toFixed(2) : '',
      t.type === 'expense' ? t.amount.toFixed(2) : '',
      t.category
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
        const headers = lines[0].toLowerCase().split(',');
        
        // Find the relevant column indexes
        const dateIndex = headers.indexOf('date');
        const typeIndex = headers.indexOf('type');
        const incomeIndex = headers.indexOf('income');
        const moneyOutIndex = headers.indexOf('money out');
        const categoryIndex = headers.indexOf('category');
        
        if (dateIndex === -1 || typeIndex === -1 || (incomeIndex === -1 && moneyOutIndex === -1)) {
          throw new Error('Required columns not found in CSV');
        }

        const transactions: Transaction[] = lines.slice(1)
          .filter(line => line.trim() && !line.toLowerCase().includes('money out this month'))
          .map(line => {
            const values = line.split(',');
            const dateStr = values[dateIndex].trim();
            const transactionType = values[typeIndex].trim();
            const income = parseFloat(values[incomeIndex] || '0');
            const moneyOut = parseFloat(values[moneyOutIndex] || '0');
            const category = values[categoryIndex]?.trim() || 'Uncategorized';
            
            // Try different date formats
            let date = parse(dateStr, 'yyyy-MM-dd', new Date());
            if (!isValid(date)) {
              date = parse(dateStr, 'dd.MM.yyyy', new Date());
            }
            
            if (!isValid(date)) {
              console.warn(`Invalid date found: ${dateStr}. Skipping transaction.`);
              return null;
            }

            return {
              id: crypto.randomUUID(),
              date,
              type: income > 0 ? 'income' : 'expense',
              amount: income > 0 ? income : moneyOut,
              category,
              note: transactionType // Store the transaction type in the note field
            };
          })
          .filter((t): t is Transaction => t !== null);
          
        resolve(transactions);
      } catch (error) {
        reject(new Error('Invalid CSV format'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
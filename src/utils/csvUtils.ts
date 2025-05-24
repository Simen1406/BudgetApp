import { Transaction } from '../components/dashboard/RecentTransactions';
import { isValid, parse } from 'date-fns';

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  const headers = ['date', 'type', 'category', 'amount'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      new Date(t.date).toISOString().split('T')[0],
      t.note || '',
      t.category,
      t.amount.toFixed(2)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const importTransactionsFromCSV = (file: File): Promise<Omit<Transaction, "id" | "user_id">> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        console.log("RAW CSV", text);

        const lines = text.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        console.log("HEADERS", headers);
        
        // Find the relevant column indexes
        const dateIndex = headers.indexOf('date');
        const typeIndex = headers.indexOf('type');
        const categoryIndex = headers.indexOf('category');
        const amountIndex = headers.indexOf("amount");
        
        if ([dateIndex, typeIndex, categoryIndex, amountIndex].some(i => i === -1)) {
          throw new Error("required columns were not found in csv");
        }

        const transactions: Omit<Transaction, "id" | "user_id">[] = lines.slice(1)
          .map(line => {
            const values = line.split(',').map(v => v.trim());

            const rawDate = values[dateIndex]
            const type = values[typeIndex]
            const category = values[categoryIndex] as "income" | "expense";
            const amount = parseFloat(values[amountIndex]);
            
            // Try different date formats
            let date = parse(rawDate, 'yyyy-MM-dd', new Date());
            if (!isValid(date)) {
              date = parse(rawDate, 'dd.MM.yyyy', new Date());
            }
            
            if (!isValid(date) || !type || !category || isNaN(amount)) {
              console.warn(`Invalid row skipped: ${line}`);
              return null;
            }

            return {
              date,
              type,
              category,
              amount,
            };
          })
          .filter((t): t is Omit<Transaction, "id" | "user_id"> => t !== null);
          
        resolve(transactions);
      } catch (error) {
        reject(new Error('Invalid CSV format'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};
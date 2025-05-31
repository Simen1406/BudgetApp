import { foodStoreKeywords } from "../components/budgets/budgetCategories";
import { Transaction } from "../types/transactionsType";
import { format } from 'date-fns';

export function isFoodTransaction(description:string | undefined): boolean {
    if(!description) return false;
    const desc = description.toLowerCase();
    return foodStoreKeywords.some(keyword => desc.includes(keyword.toLowerCase()));
}

export function calculateFoodSpentForMonth(
    transactions:Transaction[],
    currentMonth:Date
): number {
    const selectedMonth = format(currentMonth, 'yyyy-MM');

    return transactions
        .filter(tx => {
            const txMonth = format(new Date(tx.date), 'yyyy-MM');
            return txMonth === selectedMonth && isFoodTransaction(tx.description);
        })
        .reduce((sum, tx) => sum + tx.amount, 0);
}
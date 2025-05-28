export type SavingsGoal = {
  id: string;
  user_id: string;
  name: string; // name of the goal
  targetAmount: number;
  savedAmount: number;
  deadline : Date;
};
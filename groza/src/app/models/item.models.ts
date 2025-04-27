export interface Item {
  id: number;
  name: string;
  bought: boolean; // Сделайте optional если поле может отсутствовать
}
export interface Item {
    id: string; // UUID приходит как строка
    list: string; // ID списка, тоже UUID строкой
    name: string;
    is_purchased: boolean;
  }
  
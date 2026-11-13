import type { Card, CreateCardData } from "~/types/card";

export interface CardRepository {
  getCard(id: string): Promise<Card | null>;
  getRandomCard(): Promise<Card | null>;
  insertCard(data: CreateCardData & { image_url: string }): Promise<Card>;
}

export type CreateCardData = {
  name: string;
  hp: string;
  move1_name: string;
  move1_damage: string;
  move1_info: string;
  move2_name: string;
  move2_damage: string;
  move2_info: string;
  show_in_gallery: boolean;
  twitter_username: string | null;
};

export type Card = CreateCardData & {
  id: string;
  created_at: string;
  image_url: string;
};
